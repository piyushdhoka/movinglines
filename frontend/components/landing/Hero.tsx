'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Paperclip, Plus, Settings2 } from 'lucide-react'

const categories = [
  { label: 'calculus', color: 'bg-blue-500' },
  { label: 'geometry', color: 'bg-pink-500' },
  { label: 'algebra', color: 'bg-orange-500' },
  { label: 'physics', color: 'bg-green-500' },
  { label: 'complex', color: 'bg-purple-500' },
  { label: 'anything', color: 'bg-yellow-500', icon: '✨' },
]

export function Hero({ onLaunchAction }: { onLaunchAction: () => void }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onLaunchAction()
    }
  }

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden grid-pattern">
      {/* Radial Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] glow-effect pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] glow-effect pointer-events-none opacity-10" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 animate-fade-in">

        {/* Download Button */}
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-black/50 text-white/90 text-sm font-medium hover:border-white/20 transition-colors">
          Launch MovingLines
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent pb-12 pt-4 leading-[1.4]">
          The Vibe Coding Studio
        </h1>

        {/* Category Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-base text-white/50 max-w-2xl">
          <span className="whitespace-nowrap">The best way to build</span>
          {categories.map((cat) => (
            <span key={cat.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-black ${cat.color}`}>
              {cat.label}
              {cat.icon && <span>{cat.icon}</span>}
            </span>
          ))}
          <span className="whitespace-nowrap">with AI</span>
        </div>

        {/* Central Prompt Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-8">
          <div className="dark-card rounded-lg overflow-hidden">
            <div className="p-4">
              <input
                id="hero-prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask MovingLines to build anything..."
                aria-label="Ask MovingLines to build anything"
                className="w-full bg-transparent text-white/90 text-base placeholder:text-white/30 outline-none"
              />
            </div>

            {/* Input Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-white/5 gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button type="button" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-white/70 text-xs font-medium hover:border-white/20 transition-colors">
                  <Settings2 className="h-3.5 w-3.5" />
                  Auto
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button type="button" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-white/70 text-xs font-medium hover:border-white/20 transition-colors">
                  <Settings2 className="h-3.5 w-3.5" />
                  Tools
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  className="p-2 rounded-md text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-md text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Add element"
                  title="Add element"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>


          </div>
        </form>
      </div>
    </section>
  )
}
