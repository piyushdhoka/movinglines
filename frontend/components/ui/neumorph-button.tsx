'use client'

import React from 'react'
import { cn } from '@/lib/utils'

const NeumorphButton = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/5',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_2px_8px_rgba(0,0,0,0.5)]',
        'hover:bg-[#222] hover:border-white/10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.6)]',
        'active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]',
        'transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </button>
  )
}

export default NeumorphButton
