'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

export function SponsorButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCopyUPI = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText('piyushdhoka007@okhdfcbank')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = 'piyushdhoka007@okhdfcbank'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        console.error('Fallback copy failed:', e)
      }
      document.body.removeChild(textArea)
    }
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="fixed bottom-8 right-8 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Support us"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Popup Card */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-80 md:w-96 bru-card bg-secondary-background p-4 md:p-6 space-y-4 border-2 border-border shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div>
            <p className="font-bold text-lg">Support MovingLines</p>
            <p className="text-xs text-foreground/60">Help us keep building amazing tools</p>
          </div>

          <div className="space-y-3">
            {/* Buy Me Coffee */}
            <a
              href="https://buymeacoffee.com/piyushdhoka"
              target="_blank"
              rel="noreferrer"
              className="bru-card p-3 flex items-center gap-3 hover:translate-x-[2px] hover:translate-y-[-2px] transition-transform"
            >
              <div className="h-10 w-10 rounded-lg bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm">Buy Me Coffee</p>
                <p className="text-[10px] text-foreground/60">One-time donation</p>
              </div>
            </a>

            {/* UPI Payment */}
            <div className="bru-card p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm">UPI Payment</p>
                    <p className="text-[10px] text-foreground/60">Scan or copy</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyUPI}
                  className="p-1.5 hover:bg-foreground/10 rounded-md transition-colors flex-shrink-0"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* UPI ID Display */}
              <div className="bg-foreground/5 rounded-lg p-2 border border-border">
                <p className="text-[10px] font-semibold mb-1 text-foreground/70">UPI ID</p>
                <p className="text-xs font-mono break-all text-foreground/80">
                  piyushdhoka007@okhdfcbank
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-foreground/60 text-center pt-2">
            Every support helps us improve 💙
          </div>
        </div>
      )}
    </div>
  )
}
