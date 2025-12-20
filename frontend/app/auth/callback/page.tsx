'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Finalizing sign-in…')

  useEffect(() => {
    let mounted = true

    const finalizeAuth = async () => {
      try {
        // Supabase client with detectSessionInUrl=true will process tokens in the URL hash automatically
        const { data: { session }, error } = await supabase.auth.getSession()

        // Clean up URL hash so the access token isn't visible
        if (typeof window !== 'undefined') {
          const cleanUrl = window.location.origin + window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        }

        if (error) {
          console.error('Auth callback error:', error)
          setMessage('Could not complete sign-in. Please try again.')
          return
        }

        if (session) {
          setMessage('Sign-in successful! Redirecting…')
          // Small delay to show message
          setTimeout(() => router.replace('/'), 500)
        } else {
          setMessage('No active session found. You can close this window.')
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err)
        setMessage('Unexpected error occurred. Please try again.')
      }
    }

    finalizeAuth()
    return () => { mounted = false }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Authentication</h1>
        <p className="text-dark-400">{message}</p>
      </div>
    </main>
  )
}
