'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, LogOut, Menu, Settings, Sparkles, ExternalLink } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getUserCredits } from '@/lib/api'

const navLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Templates', href: '/templates' },
]

export function Header({ onLaunchAction }: { onLaunchAction: () => void }) {
  const { user, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get user avatar from Google or generate initial
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userEmail = user?.email || ''
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0]

  // Credits state
  const [credits, setCredits] = useState<number | null>(null)
  const maxCredits = 2 // Free tier max credits

  // Fetch credits when dropdown opens
  useEffect(() => {
    if (dropdownOpen && user) {
      // Get access token from session
      const fetchCredits = async () => {
        try {
          // We need to get session - simplified approach using supabase directly
          const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
          if (session?.access_token) {
            const data = await getUserCredits(session.access_token)
            setCredits(data.credits)
          }
        } catch (err) {
          console.error('Failed to fetch credits:', err)
        }
      }
      fetchCredits()
    }
  }, [dropdownOpen, user])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
      <div className="w-full max-w-7xl flex items-center justify-between px-4 py-2 border border-white/5 bg-black/40 backdrop-blur-xl rounded-sm pointer-events-auto transition-all duration-300 hover:border-white/10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xs bg-black overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <Image src="/logo.png" alt="MovingLines" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <p className="text-base font-medium tracking-tight text-white">movinglines</p>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-white/60 hover:text-white px-4 py-2 rounded-xs transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Launch/Download Button */}
          <button
            onClick={onLaunchAction}
            className="hidden md:flex items-center gap-2 h-9 px-4 rounded-full border border-white/10 bg-black/50 text-white/90 text-sm font-medium hover:border-white/20 transition-colors"
          >
            Launch App
            <ChevronDown className="h-4 w-4 text-white/50" />
          </button>

          {user ? (
            /* User Profile Dropdown - Hidden on Mobile */
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                aria-label="User account menu"
                title="User account menu"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-white/90 font-medium">{userName}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#111] shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm text-white/60 truncate">{userEmail}</p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-white/50">Free</span>
                      <button className="text-xs text-white/60 border border-white/20 px-2 py-0.5 rounded hover:border-white/40 transition-colors">
                        Manage ↗
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-white/50">Credits</span>
                      <span className="text-sm text-white/90">
                        {credits !== null ? `${credits}/${maxCredits}` : '...'}
                      </span>
                    </div>
                    {/* Credit Progress Bar */}
                    <div className="px-4 pb-3">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${credits === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: credits !== null ? `${(credits / maxCredits) * 100}%` : '0%' }}
                        />
                      </div>
                      {credits === 0 && (
                        <p className="text-xs text-red-400 mt-1">Upgrade to continue</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/5">
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
                    >
                      ↳ Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-primary h-9 px-4 text-[13px]"
              onClick={onLaunchAction}
            >
              Sign up
            </button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Toggle mobile menu"
                title="Toggle mobile menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="bg-black/95 border-b border-white/10 text-white p-6">
              <div className="flex flex-col gap-4 mt-8">
                {user && (
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{userName}</span>
                      <span className="text-xs text-white/40">{userEmail}</span>
                    </div>
                  </div>
                )}

                {navLinks.map((item) => (
                  <SheetClose key={item.label} asChild>
                    <Link href={item.href} className="text-lg text-white/70 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                <div className="h-px bg-white/5 my-2" />

                <button
                  className="btn-primary w-full h-11"
                  onClick={onLaunchAction}
                >
                  {user ? 'Dashboard' : 'Sign up'}
                </button>

                {user && (
                  <button
                    onClick={() => { signOut(); }}
                    className="flex items-center justify-center gap-2 w-full h-11 text-sm text-white/40 hover:text-white transition-colors border border-white/5 rounded-full mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
