export { metadataConfig as metadata } from './meta'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { AuthModalProvider } from '@/hooks/use-auth-modal'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { SponsorButton } from '@/components/SponsorButton'

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

