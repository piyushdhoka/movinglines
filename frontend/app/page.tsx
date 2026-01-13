'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { AuthModal } from '@/components/AuthModal'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Showcase } from '@/components/landing/Showcase'
import { Cta } from '@/components/landing/Cta'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { open: openAuthModal } = useAuthModal()

  const onLaunch = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      openAuthModal()
    }
  }



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLaunchAction={onLaunch} />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-16 -left-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute top-1/3 left-1/3 h-52 w-52 border-4 border-dashed border-border rotate-6" />
        </div>

        <Hero onLaunchAction={onLaunch} />
        <Features />
        <Showcase />
        <Cta onLaunchAction={onLaunch} />
      </main>

      <Footer />

      <AuthModal />
    </div>
  )
}
