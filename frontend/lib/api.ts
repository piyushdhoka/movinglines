const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export type Quality = 'l' | 'm' | 'h' | 'k'

export const qualityLabels: Record<Quality, string> = {
  'l': '420p',
  'm': '720p',
  'h': '1080p',
  'k': '4K'
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
  try {
    const res = await fetch(`${API_URL}/api/animations/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, quality, duration, chat_id: chatId })
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Animation generation failed:', error)
    throw error
  }
}

export async function getChats(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get chats:', error)
    throw error
  }
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
  try {
    const res = await fetch(`${API_URL}/api/animations/chats/${chatId}/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to get chat history:', error)
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

export async function cancelAnimation(taskId: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/animations/cancel/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return await handleResponse(res)
  } catch (error) {
    console.error('Failed to cancel animation:', error)
    throw error
  }
}

export function getWebSocketURL(clientId: string, token: string) {
  const url = new URL(API_URL)
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${url.host}/api/animations/ws/${clientId}?token=${token}`
}

