'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { AuthModal } from '@/components/AuthModal'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { FAQSection } from '@/components/landing/FAQSection'
import { Cta } from '@/components/landing/Cta'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { open: openAuthModal } = useAuthModal()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const onLaunch = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      openAuthModal()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <Header onLaunchAction={onLaunch} />

      <main className="relative">
        <Hero onLaunchAction={onLaunch} />
        <Features />
        <FAQSection />
        <Cta onLaunchAction={onLaunch} />
      </main>

      <Footer />

      <AuthModal />
    </div>
  )
}
