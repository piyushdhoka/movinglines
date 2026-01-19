'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import GoogleAuthLoading from '@/components/ui/GoogleAuthLoading'
import Image from 'next/image'

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
    return <GoogleAuthLoading />;
  }

  // Email confirmation sent view
  if (confirmationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="sm:max-w-md border border-white/10 bg-black p-0 overflow-hidden rounded-sm shadow-2xl">
          <DialogTitle className="sr-only">Email Confirmation</DialogTitle>
          <DialogDescription className="sr-only">Check your email for confirmation link</DialogDescription>
          <div className="p-8 md:p-10">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 className="h-8 w-8 text-white/70" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-white/90">Check your inbox</h2>
                <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                  We sent a confirmation link to <br /> <span className="text-white/70">{email}</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xs p-4">
                <p className="text-[11px] text-white/30 uppercase tracking-wider">
                  Check your spam folder if it doesn't arrive.
                </p>
              </div>
              <button
                onClick={() => {
                  setConfirmationSent(false)
                  setIsSignUp(false)
                  setEmail('')
                  setPassword('')
                  setError('')
                }}
                className="btn-primary w-full h-12 text-[13px]"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-md border border-white/10 bg-[#0a0a0a] p-0 overflow-hidden rounded-sm shadow-2xl animate-slide-up">
        <DialogTitle className="sr-only">{isSignUp ? 'Create account' : 'Welcome back'}</DialogTitle>
        <DialogDescription className="sr-only">{isSignUp ? 'Start creating amazing animations' : 'Continue your creative journey'}</DialogDescription>
        <div className="p-8 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-black overflow-hidden mx-auto">
              <Image src="/logo.png" alt="MovingLines" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-medium text-white/90 tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-[12px] text-white/30 uppercase tracking-[0.2em]">
                {isSignUp ? 'Free early access' : 'Enter your credentials'}
              </p>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-12 bg-white flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-[0.98] text-black font-medium text-[13px] rounded-xs disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-[#0a0a0a] text-white/20 uppercase tracking-[0.2em]">
                or email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 transition-colors group-focus-within:text-white/50" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 bg-white/5 border border-white/10 rounded-xs text-white text-[13px] placeholder:text-white/20 transition-all focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 transition-colors group-focus-within:text-white/50" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 bg-white/5 border border-white/10 rounded-xs text-white text-[13px] placeholder:text-white/20 transition-all focus:outline-none focus:border-white/30"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-[11px] font-medium p-3 bg-red-400/5 border border-red-400/10 rounded-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-[13px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-[12px] text-white/30">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="text-white/70 hover:text-white font-medium underline underline-offset-4 decoration-white/20 transition-all"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}


