'use client'

import Link from 'next/link'
import Image from 'next/image'
import SocialsMenu from '@/components/ui/socials-menu'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Block */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="MovingLines" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">movinglines</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed max-w-sm">
              Turn complex mathematical ideas into stunning Manim animations with a single prompt. Built for creators, educators, and developers.
            </p>
            <SocialsMenu className="mt-2" />
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">Product</p>
              <div className="flex flex-col gap-3">
                <Link href="/docs" className="text-sm text-white/40 hover:text-white transition-colors">Documentation</Link>
                <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</Link>
                <Link href="/templates" className="text-sm text-white/40 hover:text-white transition-colors">Templates</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">Company</p>
              <div className="flex flex-col gap-3">
                <a href="https://www.linkedin.com/in/piyushdhoka27" target="_blank" rel="noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">About</a>
                <a href="https://github.com/piyushdhoka/movinglines" target="_blank" rel="noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">Open Source</a>
                <a href="https://www.linkedin.com/in/piyushdhoka27" target="_blank" rel="noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">Contact</a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">Legal</p>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20 font-medium">
            © {new Date().getFullYear()} MovingLines. Built with ♥ by Piyush Dhoka.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-white/15 uppercase tracking-widest font-bold">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500/60 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
