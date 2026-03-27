'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Cta({ onLaunchAction }: { onLaunchAction: () => void }) {
  return (
    <section className="w-full px-6 py-20 md:py-32 bg-black">
      <div className="max-w-4xl mx-auto text-center space-y-10 md:space-y-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="h-3 w-3" />
          Ready to start?
        </div>

        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          Create your first scene <br className="hidden md:block" />
          <span className="text-white/30">in under a minute.</span>
        </h3>

        <p className="text-base md:text-lg text-white/30 max-w-xl mx-auto leading-relaxed">
          Join the new wave of technical creators using generative AI to skip the boilerplate and ship the vibe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            className="w-full sm:w-auto group h-14 px-10 rounded-2xl bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/10"
            onClick={onLaunchAction}
          >
            Launch Studio
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link
            href="https://www.linkedin.com/in/piyushdhoka27"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto group h-14 px-10 rounded-2xl border border-white/10 text-white/50 text-sm font-bold hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            Contact Us
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
