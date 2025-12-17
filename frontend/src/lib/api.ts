const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Animation {
  id: string
  prompt: string
  video_url: string
  quality: string
  status: string
}

export async function generateAnimation(
  token: string,
  prompt: string,
  quality: string
): Promise<Animation> {
  const response = await fetch(`${API_URL}/api/animations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, quality }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate animation')
  }

  return response.json()
}

export async function getAnimations(token: string): Promise<Animation[]> {
  const response = await fetch(`${API_URL}/api/animations/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch animations')
  }

  const data = await response.json()
  return data.animations
}

