'use client'

import Link from 'next/link'
import { ArrowRight, Github, PlayCircle, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function Hero({ onLaunchAction }: { onLaunchAction: () => void }) {
  return (
    <section className="relative w-full px-6 md:px-12 pt-12 pb-8 md:pt-16 md:pb-12 lg:pt-24 lg:pb-20">
      <div className="inline-flex items-center gap-2 md:gap-3 bru-badge mb-4 md:mb-6 text-xs md:text-sm">
        <span className="inline-flex h-2 w-2 md:h-3 md:w-3 rounded-full bg-destructive" />
        EARLY ACCESS
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 lg:gap-10 items-center">
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl leading-[1.05] font-black">
            Neobrutalist playground for math-powered animations.
          </h1>
          <p className="text-base md:text-lg text-foreground/80 max-w-2xl">
            Describe, iterate, and render Manim scenes with confident defaults, auditable prompts, and a UI that stays out of your way.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button className="bru-button" onClick={onLaunchAction}>
              Launch the studio <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="bru-ghost" asChild>
              <a href="https://github.com/piyushdhoka/movinglines" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" /> Star on GitHub
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 pt-3 md:pt-4">
            {[['3x', 'Faster iteration'], ['0 setup', 'Bun + Next ready'], ['99.9%', 'Render uptime'], ['SOC2', 'Ready controls']].map(([label, sub]) => (
              <Card key={label} className="bru-card">
                <CardContent className="p-2 md:p-3">
                  <p className="text-lg md:text-xl font-black">{label}</p>
                  <p className="text-[10px] md:text-xs uppercase font-semibold tracking-tight">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bru-card bg-secondary p-4 md:p-6 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className="bru-badge text-xs">Prompt</Badge>
            <Badge className="bru-badge bg-main text-main-foreground text-xs">Live render</Badge>
          </div>
          <div className="rounded-lg border-2 border-border p-3 md:p-4 bg-background min-h-[120px] md:min-h-[140px] flex items-center text-left text-sm md:text-base leading-relaxed">
            "Simulate a Riemann surface folding into a torus. Track a red geodesic, label critical points, and keep camera easing at 1.4."
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bru-card p-4 flex items-center gap-3">
              <PlayCircle className="h-6 w-6" />
              <div>
                <p className="text-sm font-semibold">Queued render</p>
                <p className="text-xs text-foreground/70">GPU slot reserved</p>
              </div>
            </div>
            <div className="bru-card p-4 flex items-center gap-3">
              <Wand2 className="h-6 w-6" />
              <div>
                <p className="text-sm font-semibold">Autofix ready</p>
                <p className="text-xs text-foreground/70">Compile checks enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
