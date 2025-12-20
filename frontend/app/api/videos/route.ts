import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq, desc, and, sql } from 'drizzle-orm'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/videos
 * Fetch all videos for the authenticated user
 * 
 * Query params:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch user's videos with Drizzle ORM
    const videos = await db.query.videos.findMany({
      where: eq(schema.videos.userId, user.id),
      orderBy: desc(schema.videos.createdAt),
      limit,
      offset,
    })

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.videos)
      .where(eq(schema.videos.userId, user.id))

    return NextResponse.json({
      videos,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + videos.length < count,
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/videos
 * Create a new video record (called after video is uploaded to Supabase Storage)
 * 
 * Body:
 * {
 *   prompt: string
 *   videoUrl: string
 *   bucketPath: string
 *   quality?: 'l' | 'm' | 'h' | 'k'
 *   duration?: number
 *   fileSize?: number
 *   generatedScript?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { prompt, videoUrl, bucketPath, quality, duration, fileSize, generatedScript } = body

    // Validate required fields
    if (!prompt || !videoUrl || !bucketPath) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, videoUrl, bucketPath' },
        { status: 400 }
      )
    }

    // Insert video record
    const [newVideo] = await db.insert(schema.videos).values({
      userId: user.id,
      prompt,
      videoUrl,
      bucketPath,
      quality: quality || 'm',
      duration,
      fileSize,
      generatedScript,
      status: 'completed',
    }).returning()

    // Update user stats (increment total videos)
    await db.insert(schema.userStats).values({
      userId: user.id,
      totalVideos: 1,
      completedVideos: 1,
      totalStorageBytes: fileSize || 0,
      firstVideoCreatedAt: new Date(),
      lastVideoCreatedAt: new Date(),
    }).onConflictDoUpdate({
      target: schema.userStats.userId,
      set: {
        totalVideos: sql`${schema.userStats.totalVideos} + 1`,
        completedVideos: sql`${schema.userStats.completedVideos} + 1`,
        totalStorageBytes: sql`${schema.userStats.totalStorageBytes} + ${fileSize || 0}`,
        lastVideoCreatedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/videos?id=xxx
 * Delete a video and its storage file
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Get video to verify ownership and get bucket path
    const video = await db.query.videos.findFirst({
      where: and(
        eq(schema.videos.id, videoId),
        eq(schema.videos.userId, user.id)
      ),
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manim-videos')
      .remove([video.bucketPath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    await db.delete(schema.videos)
      .where(eq(schema.videos.id, videoId))

    // Update user stats
    await db.update(schema.userStats)
      .set({
        totalVideos: sql`${schema.userStats.totalVideos} - 1`,
        completedVideos: sql`${schema.userStats.completedVideos} - 1`,
        totalStorageBytes: sql`${schema.userStats.totalStorageBytes} - ${video.fileSize || 0}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.userStats.userId, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
