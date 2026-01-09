'use client'

import Link from 'next/link'
import { Github, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/piyushdhoka',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/piyush_dhoka27',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16l-4.267 0" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/piyushdhoka27',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 2a5 5 0 0 1 5 5v10a5 5 0 0 1 -5 5h-10a5 5 0 0 1 -5 -5v-10a5 5 0 0 1 5 -5zm-9 8a1 1 0 0 0 -1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0 -1 -1m6 0a3 3 0 0 0 -1.168 .236l-.125 .057a1 1 0 0 0 -1.707 .707v5a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3 -3m-6 -3a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-secondary-background mt-8 md:mt-12 lg:mt-16">
      <div className="w-full px-6 md:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="h-10 w-10 rounded-md border-2 border-border bru-shadow bg-main flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <div>
                <p className="text-lg font-black uppercase tracking-tight">MovingLines</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Neobrutal math engine</p>
              </div>
            </Link>
            <p className="text-sm text-foreground/70 max-w-xs">
              Create stunning Manim animations with natural language. Built for mathematicians, educators, and creators.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Navigation</p>
            <div className="flex flex-col gap-2">
              <Link href="/features" className="text-sm font-semibold hover:text-main transition-colors">Features</Link>
              <Link href="/showcase" className="text-sm font-semibold hover:text-main transition-colors">Showcase</Link>
              <Link href="http://localhost:8000/docs" className="text-sm font-semibold hover:text-main transition-colors">Documentation</Link>
              <a href="https://github.com/piyushdhoka/movinglines" target="_blank" rel="noreferrer" className="text-sm font-semibold hover:text-main transition-colors">GitHub</a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Connect</p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="bru-card p-3 hover:translate-x-[2px] hover:translate-y-[-2px] transition-transform"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-border pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/60 order-2 md:order-1">
            © 2026 MovingLines
          </p>
          <div className="flex gap-4 text-xs text-foreground/60 order-1 md:order-2">
            <a href="mailto:team@movinglines.app" className="hover:text-foreground transition-colors">Contact</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
