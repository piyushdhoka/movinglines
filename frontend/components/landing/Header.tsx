'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Menu, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import LightMorphWrapper from '@/components/ui/lightmorph-wrapper'
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

  // Fix hydration mismatch for mobile menu
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

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
          {/* GitHub Button with LightMorphWrapper */}
          <a
            href="https://github.com/piyushdhoka/movinglines"
            target="_blank"
            rel="noreferrer"
            className="hidden md:block"
          >
            <LightMorphWrapper
              containerClass="border-0 w-auto h-auto p-0.5 rounded-xl"
              innerContainerClass="h-10 w-10 rounded-[10px]"
              gradient1="bg-orange-400/60"
              gradient2="bg-amber-400/60"
              blurOnGradients="blur-[12px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" className="relative z-20 pointer-events-none">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </LightMorphWrapper>
          </a>

          {/* Launch Button */}
          <button
            onClick={onLaunchAction}
            className="group relative hidden md:flex items-center gap-2 h-10 px-6 rounded-full bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-all duration-300 active:scale-95"
          >
            Launch
            <Sparkles className="h-4 w-4 text-black/50 group-hover:rotate-12 transition-transform" />
          </button>

          {user ? (
            /* User Profile Dropdown - Hidden on Mobile */
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                aria-label="User account menu"
                title="User account menu"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={26}
                    height={26}
                    className="rounded-full border border-white/10"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-white/90 font-medium">{userName}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 rounded-xl border border-white/10 bg-[#050505] shadow-2xl overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-4 border-b border-white/5 bg-white/2">
                    <p className="text-[13px] font-medium text-white truncate">{userName}</p>
                    <p className="text-[11px] text-white/40 truncate mt-0.5">{userEmail}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 transition-colors">
                      <span className="text-[13px] text-white/50 font-medium uppercase tracking-wider">Free</span>
                      <button className="text-[11px] text-white/60 bg-white/5 px-2 py-1 rounded-sm hover:bg-white/10 transition-colors">
                        Upgrade ↗
                      </button>
                    </div>
                    
                    <div className="px-3 py-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-white/50">Credits</span>
                        <span className="text-[13px] text-white/90 font-mono">
                          {credits !== null ? `${credits}/${maxCredits}` : '...'}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${credits === 0 ? 'bg-red-500' : 'bg-white/40'}`}
                          style={{ width: credits !== null ? `${(credits / maxCredits) * 100}%` : '0%' }}
                        />
                      </div>
                      {credits === 0 && (
                        <p className="text-[10px] text-red-400 font-medium">Credits exhausted</p>
                      )}
                    </div>
                  </div>

                  <div className="p-2 border-t border-white/5 bg-white/1">
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-md transition-all font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="relative h-10 px-6 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] group"
              onClick={onLaunchAction}
            >
              Get Started
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-md bg-white/20 -z-10" />
            </button>
          )}

          {/* Mobile Menu */}
          {mounted && (
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
          )}
        </div>
      </div>
    </header>
  )
}
