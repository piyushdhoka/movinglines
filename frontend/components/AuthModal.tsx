'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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

  if (googleLoading) {
    return <GoogleAuthLoading />;
  }

  if (confirmationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="sm:max-w-md border border-white/10 bg-[#0a0a0a] p-0 overflow-hidden rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Email Confirmation</DialogTitle>
          <DialogDescription className="sr-only">Check your email for confirmation link</DialogDescription>
          <div className="p-8 md:p-10">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <CheckCircle2 className="h-8 w-8 text-orange-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
                <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                  We sent a confirmation link to <br /> <span className="text-white/70">{email}</span>
                </p>
              </div>
              <button
                onClick={() => { setConfirmationSent(false); setIsSignUp(false) }}
                className="w-full h-12 bg-white text-black font-bold rounded-xl text-sm hover:bg-neutral-100 transition-all active:scale-[0.98]"
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
      <DialogContent className="sm:max-w-md border border-white/10 bg-[#0a0a0a] p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogTitle className="sr-only">{isSignUp ? 'Create account' : 'Welcome back'}</DialogTitle>
        <DialogDescription className="sr-only">{isSignUp ? 'Start creating' : 'Sign in'}</DialogDescription>
        <div className="p-8 md:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 overflow-hidden mx-auto border border-white/10">
              <Image src="/logo.png" alt="MovingLines" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-white/30">
                {isSignUp ? 'Start creating stunning animations' : 'Continue your creative journey'}
              </p>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-12 bg-white flex items-center justify-center gap-3 transition-all hover:bg-neutral-100 active:scale-[0.98] text-black font-bold text-sm rounded-xl disabled:opacity-50"
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
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-3 bg-[#0a0a0a] text-white/25 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 transition-all focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 transition-all focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              required
              minLength={6}
            />

            {error && (
              <div className="text-red-400 text-xs font-medium p-3 bg-red-400/5 border border-red-400/10 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-xs text-white/30 pt-2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
