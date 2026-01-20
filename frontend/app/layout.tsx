export { metadataConfig as metadata } from './meta'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { AuthModalProvider } from '@/hooks/use-auth-modal'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { SponsorButton } from '@/components/SponsorButton'
import { StructuredData } from '@/components/StructuredData'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${GeistSans.variable} font-sans bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <AuthModalProvider>
              {children}
              <SponsorButton />
            </AuthModalProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
