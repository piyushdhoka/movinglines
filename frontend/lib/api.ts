const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export type Quality = 'l' | 'm' | 'h' | 'k'

export const qualityLabels: Record<Quality, string> = {
  l: '480p',
  m: '720p',
  h: '1080p',
  k: '4K'
}

export async function generateAnimation(prompt: string, quality: Quality, token: string) {
  const res = await fetch(`${API_URL}/api/animations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, quality })
  })
  
  if (!res.ok) throw new Error('Failed to generate animation')
  return res.json()
}

export async function getTaskStatus(taskId: string, token: string) {
  const res = await fetch(`${API_URL}/api/animations/status/${taskId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) throw new Error('Failed to get task status')
  return res.json()
}

export async function getUserVideos(token: string) {
  const res = await fetch(`${API_URL}/api/animations/videos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) throw new Error('Failed to get videos')
  return res.json()
}

