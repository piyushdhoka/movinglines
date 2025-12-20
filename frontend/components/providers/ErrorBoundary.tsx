'use client'

import { useEffect, type ReactNode } from 'react'

export function ErrorBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Suppress unhandled promise rejections from browser extensions
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason)
      
      // Ignore extension-related errors
      if (
        message?.includes('message channel closed') ||
        message?.includes('Extension context invalidated') ||
        message?.includes('chrome-extension') ||
        message?.includes('Unexpected end of JSON input')
      ) {
        event.preventDefault()
        console.debug('Ignored extension error:', message)
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    
    // Also suppress extension errors in console
    const originalError = console.error
    console.error = function(...args: any[]) {
      const message = String(args[0])
      if (
        !message?.includes('message channel closed') &&
        !message?.includes('Extension context invalidated')
      ) {
        originalError.apply(console, args)
      }
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
      console.error = originalError
    }
  }, [])

  return <>{children}</>
}
