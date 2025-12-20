'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Loader2 } from 'lucide-react'

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
        setError('') // Clear error on success
        // Don't close modal on signup - user needs to confirm email
        // onClose()
      } else {
        await signIn(email, password)
        setError('')
        onCloseAction()
      }
    } catch (err: any) {
      // Handle Supabase specific errors
      let errorMessage = err.message || 'An error occurred'
      
      // Suppress token/refresh related errors from being shown
      if (errorMessage.includes('Refresh Token Not Found') || 
          errorMessage.includes('Invalid Refresh Token')) {
        console.warn('Token refresh issue (will retry automatically):', errorMessage)
        // Don't show this error to user, it will be handled automatically
        return
      }
      
      setError(errorMessage)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onCloseAction}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="card w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <button
              onClick={onCloseAction}
              className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {isSignUp && !error && (
              <p className="text-dark-400 text-sm">
                A confirmation email will be sent to verify your account.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="text-dark-400 hover:text-white transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

