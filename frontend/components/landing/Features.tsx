'use client'

import { motion } from 'framer-motion'
import { Zap, GitBranch, FileJson } from 'lucide-react'

const features = [
  {
    number: '1',
    title: 'AI-powered Manim generation',
    description:
      'Leverage context-aware LLMs to generate Manim code from natural language with 98%+ accuracy, preserving mathematical precision and visual fidelity.',
    icon: Zap,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    widget: (
      <div className="mt-6 relative">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-orange-400 fill-orange-400" />
              </div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Generation Speed</span>
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">10x</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">2,500+ <span className="text-sm font-normal text-white/30">lines/min</span></div>
        </div>
      </div>
    ),
  },
  {
    number: '2',
    title: 'Real-time preview & iterate',
    description:
      'Preview your animations in real-time with hot-reload. Edit prompts, tweak parameters, and see changes instantly — no waiting for full renders.',
    icon: GitBranch,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-600/10 border-blue-600/20',
    widget: (
      <div className="mt-6 relative">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white/70">Active Renders</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-600/10 border border-blue-600/20 px-2 py-0.5 rounded-full">2</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-orange-400" />
            <span className="text-xs text-white/50 flex-1">fourier_transform.py</span>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-orange-400 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs text-white/50 flex-1">neural_network.py</span>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-blue-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '3',
    title: 'Production-ready exports',
    description:
      'Export crisp 4K video assets in MP4, GIF, or individual frames. Ready for docs, presentations, social media, or interactive embeds.',
    icon: FileJson,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    widget: (
      <div className="mt-6 relative">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/70">Export Status</span>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-orange-400" />
              <span className="text-[10px] text-orange-400 font-medium">Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
              <FileJson className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/60 font-medium">scene_output.mp4</p>
              <p className="text-[10px] text-white/25">4K · 60fps · 12.4MB</p>
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
              ✓ Exported
            </span>
          </div>
        </div>
      </div>
    ),
  },
]

export function Features() {
  return (
    <section id="features" className="w-full px-6 py-20 md:py-32 bg-black relative">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="space-y-4 max-w-2xl">
          <p className="text-[11px] font-bold tracking-[0.3em] text-orange-400/60 uppercase">Capabilities</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Built for precision, <br />
            <span className="text-white/30">designed for creators.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              transition={{ delay: index * 0.1 }}
              className="group relative p-7 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all flex flex-col"
            >
              {/* Number Badge */}
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/40 mb-6">
                {feature.number}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-white/35 leading-relaxed flex-1">
                {feature.description}
              </p>

              {/* Mini Widget */}
              {feature.widget}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
