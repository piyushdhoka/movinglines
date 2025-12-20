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

