'use client'

import Link from 'next/link'
import { Cpu, ShieldCheck, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Sparkles,
    title: 'Prompt-first creation',
    body: 'Describe your idea and ship a Manim-ready animation with precise camera moves and timings.',
  },
  {
    icon: Cpu,
    title: 'Optimized rendering',
    body: 'GPU-friendly defaults and queued render jobs keep your workflow smooth.',
  },
  {
    icon: ShieldCheck,
    title: 'Team-safe access',
    body: 'Role-aware auth, audit trails, and project-scoped secrets out of the box.',
  },
  {
    icon: Wand2,
    title: 'Autofix + iterate',
    body: 'Guided repair flows catch syntax hiccups and suggest better camera paths automatically.',
  },
]

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between gap-3 md:gap-4 flex-wrap">
        <div>
          <p className="bru-badge text-xs md:text-sm">Capabilities</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mt-2 md:mt-3 font-black">Opinionated defaults, brutalist clarity.</h2>
        </div>
        <Button variant="outline" className="bru-ghost" asChild>
          <Link href="/showcase">See showcase</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="bru-card h-full">
            <CardHeader className="pb-2 flex flex-row items-center gap-2 md:gap-3">
              <feature.icon className="h-4 w-4 md:h-5 md:w-5" />
              <CardTitle className="text-base md:text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm leading-relaxed text-foreground/80">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
