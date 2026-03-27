'use client'

import React, { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

const dotBgColor = '#0a0a0a'
const dotVisibleColor = '#1a1a1a'
const dotActualSize = '1.5px'
const dotGridSpacing = '12px'

const dottedBackgroundStyle: CSSProperties = {
  backgroundColor: dotBgColor,
  backgroundImage: `radial-gradient(${dotVisibleColor} calc(${dotActualSize} / 2), ${dotBgColor} calc(${dotActualSize} / 2))`,
  backgroundSize: `${dotGridSpacing} ${dotGridSpacing}`,
}

const LightMorphWrapper = ({
  children,
  gradient1 = 'bg-emerald-500/60',
  gradient2 = 'bg-blue-500/60',
  containerClass,
  innerContainerClass,
  blurOnGradients = 'blur-[40px]',
  switchGrad = false,
}: {
  children: React.ReactNode
  gradient1?: string
  gradient2?: string
  containerClass?: string
  innerContainerClass?: string
  blurOnGradients?: string
  switchGrad?: boolean
}) => {
  return (
    <div className={cn('border border-white/5 h-max w-full p-1 rounded-4xl', containerClass)}>
      <div
        style={dottedBackgroundStyle}
        className={cn(
          'border border-white/5 rounded-[1.7rem] overflow-hidden relative flex items-center justify-center group',
          innerContainerClass
        )}
      >
        <div
          className={cn(
            'absolute w-full h-full z-10 pointer-events-none',
            switchGrad && 'rotate-90'
          )}
        >
          <div
            className={cn(
              'opacity-40 z-10 w-[50%] h-[50%] rounded-full -bottom-[15%] absolute -left-[15%] group-hover:opacity-60 transition-opacity duration-500',
              gradient1,
              blurOnGradients
            )}
          />
          <div
            className={cn(
              'opacity-40 z-10 w-[50%] h-[50%] rounded-full -top-[15%] absolute -right-[15%] group-hover:opacity-60 transition-opacity duration-500',
              gradient2,
              blurOnGradients
            )}
          />
        </div>
        {children}
        <Noise />
      </div>
    </div>
  )
}

export default LightMorphWrapper

const Noise = () => {
  return (
    <svg
      className="pointer-events-none absolute isolate z-50 opacity-[0.04] size-full inset-0"
      width="100%"
      height="100%"
    >
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="1"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  )
}
