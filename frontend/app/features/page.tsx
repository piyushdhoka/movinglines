'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { AuthModal } from '@/components/AuthModal'
import { Header } from '@/components/landing/Header'
import { Features } from '@/components/landing/Features'
import { Footer } from '@/components/landing/Footer'

export default function FeaturesPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { open: openAuthModal } = useAuthModal()

    const onLaunchAction = () => {
        if (user) {
            router.push('/dashboard')
        } else {
            openAuthModal()
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header onLaunchAction={onLaunchAction} />
            <main className="py-12">
                <Features />
            </main>
            <Footer />
            <AuthModal />
        </div>
    )
}
