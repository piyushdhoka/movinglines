import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Manim Studio | AI Animation Generator',
  description: 'Generate beautiful mathematical animations from text prompts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${jetbrains.variable} font-sans bg-dark-950 text-dark-50 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

