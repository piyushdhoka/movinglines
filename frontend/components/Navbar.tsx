'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Sparkles, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

type NavbarProps = {
  onAuthClickAction: () => void
}

export function Navbar({ onAuthClickAction }: NavbarProps) {
  const { user, signOut } = useAuth()

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <span className="text-xl font-bold gradient-text">Manim Studio</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-dark-400 text-sm hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800/50 
                           hover:bg-dark-700/50 transition-colors text-dark-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button onClick={onAuthClickAction} className="btn-primary text-sm">
              Sign In
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

