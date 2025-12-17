'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { generateAnimation, getAnimations, type Animation } from '@/lib/api'
import { Play, Download, Loader2, LogOut, Sparkles, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

const QUALITY_OPTIONS = [
  { value: 'l', label: '480p', desc: 'Fast' },
  { value: 'm', label: '720p', desc: 'Balanced' },
  { value: 'h', label: '1080p', desc: 'HD' },
  { value: 'k', label: '4K', desc: 'Ultra' },
]

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('m')
  const [generating, setGenerating] = useState(false)
  const [animations, setAnimations] = useState<Animation[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Animation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadAnimations()
    }
  }, [user])

  const loadAnimations = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      try {
        const anims = await getAnimations(session.access_token)
        setAnimations(anims)
      } catch (e) {
        console.error('Failed to load animations:', e)
      }
    }
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setAnimations([])
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setGenerating(true)
    setError('')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')
      
      const animation = await generateAnimation(session.access_token, prompt, quality)
      setAnimations(prev => [animation, ...prev])
      setSelectedVideo(animation)
      setPrompt('')
    } catch (e: any) {
      setError(e.message || 'Failed to generate animation')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-primary-500/20">
              <Film className="w-10 h-10 text-primary-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Manim Generator
          </h1>
          <p className="text-lg text-white/60 mb-8">
            Transform your ideas into stunning mathematical animations with AI-powered Manim scripts
          </p>
          <button onClick={handleSignIn} className="btn-primary text-lg">
            Sign in with Google
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Film className="w-6 h-6 text-primary-400" />
            </div>
            <span className="font-semibold text-lg">Manim Generator</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{user.email}</span>
            <button onClick={handleSignOut} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Create Animation
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Describe your animation</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Show the Pythagorean theorem with animated squares on a right triangle"
                  className="input-field h-32 resize-none"
                  disabled={generating}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Quality</label>
                <div className="grid grid-cols-4 gap-2">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuality(opt.value)}
                      disabled={generating}
                      className={cn(
                        'p-3 rounded-xl border transition-all text-center',
                        quality === opt.value
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-white/10 hover:border-white/20 text-white/60'
                      )}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs opacity-60">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Animation
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary-400" />
              Preview
            </h2>

            <div className="aspect-video bg-black/50 rounded-xl overflow-hidden flex items-center justify-center">
              {selectedVideo ? (
                <video
                  key={selectedVideo.id}
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white/40 text-center">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Generate an animation to preview</p>
                </div>
              )}
            </div>

            {selectedVideo && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-white/60 truncate flex-1 mr-4">
                  {selectedVideo.prompt}
                </p>
                <a
                  href={selectedVideo.video_url}
                  download
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            )}
          </motion.div>
        </div>

        {/* Gallery */}
        {animations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold mb-6">Your Animations</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {animations.map((anim, i) => (
                  <motion.button
                    key={anim.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedVideo(anim)}
                    className={cn(
                      'glass p-4 text-left transition-all hover:border-primary-500/50',
                      selectedVideo?.id === anim.id && 'border-primary-500'
                    )}
                  >
                    <div className="aspect-video bg-black/50 rounded-lg overflow-hidden mb-3">
                      <video
                        src={anim.video_url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2">{anim.prompt}</p>
                    <span className="text-xs text-white/40 mt-1 inline-block">
                      {QUALITY_OPTIONS.find(q => q.value === anim.quality)?.label || anim.quality}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

