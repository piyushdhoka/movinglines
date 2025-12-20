const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export type Quality = 'l' | 'm' | 'h' | 'k'

export const qualityLabels: Record<Quality, string> = {
  l: '480p',
  m: '720p',
  h: '1080p',
  k: '4K'
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export async function generateAnimation(prompt: string, quality: Quality, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, quality })
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Animation generation failed:', error)
    throw error
  }
}

export async function getTaskStatus(taskId: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/status/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get task status:', error)
    throw error
  }
}

export async function getUserVideos(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/videos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get videos:', error)
    throw error
  }
}

// ======================
// NEW DRIZZLE API ROUTES
// ======================

/**
 * Get all videos using Drizzle ORM (Next.js API route)
 * This replaces getUserVideos for better type safety and performance
 */
export async function getVideos(limit = 50, offset = 0) {
  try {
    const res = await fetch(`/api/videos?limit=${limit}&offset=${offset}`, {
      credentials: 'include', // Include cookies for auth
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get videos:', error)
    throw error
  }
}

/**
 * Create a new video record after upload
 */
export async function createVideoRecord(data: {
  prompt: string
  videoUrl: string
  bucketPath: string
  quality?: Quality
  duration?: number
  fileSize?: number
  generatedScript?: string
}) {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to create video record:', error)
    throw error
  }
}

/**
 * Delete a video (both from storage and database)
 */
export async function deleteVideo(videoId: string) {
  try {
    const res = await fetch(`/api/videos?id=${videoId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to delete video:', error)
    throw error
  }
}

/**
 * Get user statistics and recent videos
 */
export async function getUserStats() {
  try {
    const res = await fetch('/api/stats', {
      credentials: 'include',
    })
    
    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get user stats:', error)
    throw error
  }
}

