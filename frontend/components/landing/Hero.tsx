'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const categories = [
  { label: 'calculus' },
  { label: 'linear algebra' },
  { label: 'geometry' },
  { label: 'physics' },
]

export function Hero({ onLaunchAction }: { onLaunchAction: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('1080p')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      sessionStorage.setItem('pending_prompt', prompt.trim())
      sessionStorage.setItem('pending_quality', quality)
      onLaunchAction()
    }
  }

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden bg-black">
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h1 className="text-6xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tight leading-[0.9] text-white">
            Visualize Math. <br />
            <span className="bg-linear-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent italic font-medium tracking-normal">No code required.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/40 max-w-lg mx-auto leading-relaxed font-medium">
            Turn complex equations into <span className="text-white/80">stunning Manim animations</span> with just a prompt. 
            Stop coding, start creating.
          </p>
        </motion.div>

        {/* Central Prompt Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onSubmit={handleSubmit}
          className="w-full max-w-xl"
        >
          <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:border-orange-500/20 focus-within:border-orange-500/40 focus-within:shadow-[0_0_50px_rgba(249,115,22,0.1)]">
            <div className="p-5 pb-3">
              <textarea
                id="hero-prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Visualize the beauty of Fourier transforms..."
                aria-label="Describe what you want to animate"
                className="w-full bg-transparent text-white text-lg placeholder:text-white/20 outline-none resize-none h-12"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="appearance-none bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg pr-8 outline-none hover:bg-orange-500/20 transition-colors cursor-pointer"
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K Ultra</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400/50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/30 text-[10px] font-bold uppercase tracking-wider">
                  Manim v0.18
                </span>
              </div>
              
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                disabled={!prompt.trim()}
              >
                Generate
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setPrompt(`Visualize ${cat.label}...`)}
                className="text-[11px] font-medium text-white/25 hover:text-white/50 transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/3"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.form>


      </div>
    </section>
  )
}
