'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const showcases = [
  {
    title: 'Complex plane morphs',
    description: 'Render conformal maps with synchronized labels and easing curves.',
    accent: 'Real-time preview',
  },
  {
    title: 'Physics simulations',
    description: 'Animate rigid body orbits with collision highlights and overlays.',
    accent: 'Collision aware',
  },
  {
    title: 'Interactive explainers',
    description: 'Export crisp assets for docs, decks, or interactive demos.',
    accent: 'Multi-format export',
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-6 md:space-y-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="bru-badge text-xs md:text-sm">Showcase</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mt-2 md:mt-3 font-black">Scenes you can ship today.</h2>
        </div>
        <Badge className="bru-badge text-xs md:text-sm">Works with Manim</Badge>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {showcases.map((item) => (
          <Card key={item.title} className="bru-card h-full bg-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start sm:items-center justify-between gap-2 text-base md:text-lg">
                <span>{item.title}</span>
                <span className="text-[10px] md:text-xs uppercase font-bold whitespace-nowrap">{item.accent}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              <div className="aspect-video rounded-md border-2 border-border bg-gradient-to-br from-background to-secondary flex items-center justify-center text-xs md:text-sm font-semibold">
                Preview placeholder
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-foreground/80">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
