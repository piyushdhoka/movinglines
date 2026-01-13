'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AuthModal() {
  const { isOpen, close } = useAuthModal()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await signUp(email, password)
        if (result.requiresConfirmation) {
          setConfirmationSent(true)
          setError('')
        } else {
          setTimeout(() => close(), 100)
        }
      } else {
        await signIn(email, password)
        setTimeout(() => close(), 100)
      }
    } catch (err: any) {
      let errorMessage = err.message || 'An error occurred'
      if (errorMessage === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection.'
      }
      if (errorMessage.includes('Refresh Token Not Found') || errorMessage.includes('Invalid Refresh Token')) {
        return
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading overlay for Google redirect
  if (googleLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md border-2 border-black bg-white p-0 overflow-hidden bru-shadow">
          <DialogTitle className="sr-only">Signing in with Google</DialogTitle>
          <DialogDescription className="sr-only">Please wait while we redirect you to Google</DialogDescription>
          <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-white p-4 rounded-full shadow-lg border border-gray-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">Connecting to Google</p>
              <p className="text-sm text-gray-500">You'll be redirected shortly...</p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Email confirmation sent view
  if (confirmationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="sm:max-w-md border-2 border-black bg-white p-0 overflow-hidden bru-shadow">
          <DialogTitle className="sr-only">Email Confirmation</DialogTitle>
          <DialogDescription className="sr-only">Check your email for confirmation link</DialogDescription>
          <div className="p-8 md:p-10">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  We sent a confirmation link to <span className="font-semibold text-gray-900">{email}</span>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-600">
                  Didn't receive it? Check your spam folder or try again.
                </p>
              </div>
              <Button
                onClick={() => {
                  setConfirmationSent(false)
                  setIsSignUp(false)
                  setEmail('')
                  setPassword('')
                  setError('')
                }}
                variant="outline"
                className="w-full h-12 border-2 border-black font-bold uppercase tracking-tight bru-shadow hover:bg-black/5"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-md border-2 border-black bg-white p-0 overflow-hidden bru-shadow">
        <DialogTitle className="sr-only">{isSignUp ? 'Create account' : 'Welcome back'}</DialogTitle>
        <DialogDescription className="sr-only">{isSignUp ? 'Start creating amazing animations' : 'Continue your creative journey'}</DialogDescription>
        <div className="p-8 md:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-black bg-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-black text-sm font-semibold">
              {isSignUp ? 'START YOUR ANIMATION JOURNEY' : 'CONTINUE YOUR CREATIVE JOURNEY'}
            </p>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-14 bg-white border-2 border-black transition-colors text-black font-bold uppercase tracking-tight bru-shadow gap-3"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black border-dashed" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-black font-bold uppercase tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black z-10" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-black bru-shadow placeholder:text-black/50 placeholder:font-semibold text-black font-semibold transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black z-10" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-black bru-shadow placeholder:text-black/50 placeholder:font-semibold text-black font-semibold transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-black text-black text-sm p-4 font-bold bru-shadow">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 font-black uppercase tracking-tight bg-primary border-2 border-black text-primary-foreground transition-colors bru-shadow gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm font-bold text-black">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="text-black underline decoration-2 underline-offset-4 hover:decoration-primary uppercase font-black"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}


