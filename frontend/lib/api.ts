const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export type Quality = 'l' | 'm' | 'h' | 'k'

export const qualityLabels: Record<Quality, string> = {
  'l': '420p',
  'm': '720p',
  'h': '1080p',
  'k': '4K'
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${res.status}: ${res.statusText}`
      throw new Error(errorMessage)
    }
    return await res.json()
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch'))) {
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 1.5)
    }
    throw error
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const errorMessage = typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${res.status}: ${res.statusText}`
    throw new Error(errorMessage)
  }
  return res.json()
}
export async function generateAnimation(prompt: string, quality: Quality, duration: number, token: string, chatId?: string) {
  return fetchWithRetry(`${API_URL}/api/animations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, quality, duration, chat_id: chatId })
  })
}

export async function getChats(token: string) {
  return fetchWithRetry(`${API_URL}/api/animations/chats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export async function deleteChat(chatId: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/chats/${chatId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to delete chat:', error)
    throw error
  }
}

export async function getChatHistory(chatId: string, token: string) {
  return fetchWithRetry(`${API_URL}/api/animations/chats/${chatId}/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export async function getTaskStatus(taskId: string, token: string) {
  return fetchWithRetry(`${API_URL}/api/animations/status/${taskId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export async function getUserVideos(token: string) {
  return fetchWithRetry(`${API_URL}/api/animations/videos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}



export async function getVideos(limit = 1000, offset = 0, scope?: 'all') {
  try {
    const scopeParam = scope === 'all' ? '?scope=all&' : '?'
    const res = await fetch(`/api/videos${scopeParam}limit=${limit}&offset=${offset}`, {
      credentials: 'include', // Include cookies for auth
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get videos:', error)
    throw error
  }
}


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



export function getSocketURL() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

