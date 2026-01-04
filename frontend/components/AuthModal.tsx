'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { X, Mail, Lock, Loader2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type AuthModalProps = {
  onCloseAction: () => void
}

export function AuthModal({ onCloseAction }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      
      setError('')
      setTimeout(() => {
        onCloseAction()
      }, 100)
    } catch (err: any) {
      let errorMessage = err.message || 'An error occurred'

      if (errorMessage === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to authentication server. Please check your internet connection or ad blockers.'
      }

      if (errorMessage.includes('Refresh Token Not Found') ||
        errorMessage.includes('Invalid Refresh Token')) {
        console.warn('Token refresh issue (will retry automatically):', errorMessage)
        return
      }

      setError(errorMessage)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onCloseAction}>
      <DialogContent className="bru-card bg-secondary-background max-w-[95vw] sm:max-w-md p-0 overflow-hidden border-2 border-border">
        <div className="p-6 md:p-8 space-y-4 md:space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </DialogTitle>
            <DialogDescription className="text-foreground/70 text-sm md:text-base">
              {isSignUp ? 'Start your animation journey' : 'Continue your animation adventure'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-tight">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-2 border-border bru-shadow bg-background focus:shadow-[6px_6px_0_var(--border)] transition-shadow"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-tight">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 border-2 border-border bru-shadow bg-background focus:shadow-[6px_6px_0_var(--border)] transition-shadow"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bru-card bg-destructive/10 border-destructive p-3">
                <p className="text-destructive text-sm font-semibold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bru-button w-full h-12 text-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isSignUp ? 'Get Started' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t-2 border-border text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors uppercase tracking-tight"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


