import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { AuthModalProvider } from '@/hooks/use-auth-modal'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { SponsorButton } from '@/components/SponsorButton'

export const metadata: Metadata = {
  title: 'MovingLines | AI-Powered Math Animations',
  description: 'Transform complex equations into beautiful Manim animations in seconds using AI.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <AuthModalProvider>
              {children}
              <SponsorButton />
            </AuthModalProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

