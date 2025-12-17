'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { AuthModal } from '@/components/AuthModal'
import { Generator } from '@/components/Generator'
import { VideoGallery } from '@/components/VideoGallery'
import { Navbar } from '@/components/Navbar'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [refreshGallery, setRefreshGallery] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Create <span className="gradient-text">Stunning</span> Math
            <br />Animations with AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark-400 mb-12 max-w-2xl mx-auto"
          >
            Transform your ideas into beautiful Manim animations. 
            Just describe what you want, and let AI do the rest.
          </motion.p>
          
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Generator onVideoGenerated={() => setRefreshGallery(r => r + 1)} />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowAuth(true)}
              className="btn-primary text-lg"
            >
              Get Started Free
            </motion.button>
          )}
        </div>
      </section>

      {/* Video Gallery */}
      {user && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Your Animations</h2>
            <VideoGallery key={refreshGallery} />
          </div>
        </section>
      )}

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  )
}

