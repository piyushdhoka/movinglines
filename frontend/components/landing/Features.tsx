"use client";

import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Sparkles, Cpu, ShieldCheck, Wand2 } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="w-full px-6 py-24 md:py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <p className="text-[11px] font-medium tracking-[0.2em] text-blue-400 uppercase">Capabilities</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white/90">
              Built for precision, <br />designed for the vibe.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-blue-900 min-h-[500px] lg:min-h-[300px]"
          >
            <div className="max-w-xs">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-white/70" />
              </div>
              <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Prompt-first creation
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                Describe your idea and ship a Manim-ready animation with precise camera moves and timings.
              </p>
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-purple-900">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5 text-white/70" />
            </div>
            <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Optimized rendering
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
              GPU-friendly defaults and queued render jobs keep your workflow smooth.
            </p>
          </WobbleCard>

          <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-emerald-900">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5 text-white/70" />
            </div>
            <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Team-safe access
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
              Role-aware auth, audit trails, and project-scoped secrets out of the box.
            </p>
          </WobbleCard>

          <WobbleCard containerClassName="col-span-1 lg:col-span-2 bg-orange-900 min-h-[300px]">
            <div className="max-w-sm">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Wand2 className="h-5 w-5 text-white/70" />
              </div>
              <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Autofix + iterate
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Guided repair flows catch syntax hiccups and suggest better camera paths automatically.
              </p>
            </div>
          </WobbleCard>
        </div>
      </div>
    </section>
  );
}
