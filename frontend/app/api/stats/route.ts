import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/stats
 * Get statistics for the authenticated user
 * 
 * Returns:
 * - User stats (total videos, completed, failed, storage usage)
 * - User information
 * - Recent videos
 */
export async function GET(request: NextRequest) {
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

    // Fetch user with stats and recent videos using Drizzle relations
    const userWithStats = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id),
      with: {
        stats: true,
        videos: {
          limit: 5,
          orderBy: (videos, { desc }) => [desc(videos.createdAt)],
        },
      },
    })

    // If user doesn't exist in our DB yet, create them
    if (!userWithStats) {
      // Insert user
      await db.insert(schema.users).values({
        id: user.id,
        email: user.email!,
      }).onConflictDoNothing()

      // Initialize stats
      await db.insert(schema.userStats).values({
        userId: user.id,
      }).onConflictDoNothing()

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: new Date(),
        },
        stats: {
          totalVideos: 0,
          completedVideos: 0,
          failedVideos: 0,
          totalStorageBytes: 0,
          lastVideoCreatedAt: null,
          firstVideoCreatedAt: null,
        },
        recentVideos: [],
      })
    }

    return NextResponse.json({
      user: {
        id: userWithStats.id,
        email: userWithStats.email,
        createdAt: userWithStats.createdAt,
      },
      stats: userWithStats.stats || {
        totalVideos: 0,
        completedVideos: 0,
        failedVideos: 0,
        totalStorageBytes: 0,
        lastVideoCreatedAt: null,
        firstVideoCreatedAt: null,
      },
      recentVideos: userWithStats.videos || [],
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
