'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Cta({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="bru-card p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-2 md:space-y-3">
          <p className="bru-badge text-xs md:text-sm">Ready to build</p>
          <h3 className="text-2xl md:text-3xl font-black">Launch a scene in under a minute.</h3>
          <p className="text-sm md:text-base text-foreground/80 max-w-2xl">
            Sign in, drop a prompt, and watch the renderer queue your first cut. The brutalist UI keeps every control obvious and auditable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 md:gap-3">
          <Button className="bru-button w-full sm:w-auto" onClick={onLaunch}>
            Launch now
          </Button>
          <Button variant="outline" className="bru-ghost w-full sm:w-auto" asChild>
            <Link href="mailto:team@movinglines.app">Book a demo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
