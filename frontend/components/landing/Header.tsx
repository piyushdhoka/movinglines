'use client'

import Link from 'next/link'
import { ArrowRight, Github, Menu, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Docs', href: 'http://localhost:8000/docs' },
]

export function Header({ onLaunchAction }: { onLaunchAction: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b-2 border-border">
      <div className="w-full px-6 md:px-12 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-md border-2 border-border bru-shadow bg-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-xl font-black uppercase tracking-tight">MovingLines</p>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <NavigationMenu>
            <NavigationMenuList className="gap-3 flex">
              {navLinks.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold uppercase tracking-tight border-2 border-border px-4 py-2.5 rounded-md bru-shadow bg-secondary hover:-translate-y-1 transition-transform inline-block"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" className="bru-ghost text-xs px-4 py-2" onClick={() => signOut()}>
                Sign out
              </Button>
              <Button className="bru-button text-xs" onClick={onLaunchAction}>
                Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button className="bru-button text-xs" onClick={onLaunchAction}>
              Launch app <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="lg:hidden bru-ghost px-3 py-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-2 border-border">
            <div className="flex items-center justify-between mb-6">
              <p className="font-black uppercase tracking-tight">Menu</p>
              <X className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <SheetClose key={item.label} asChild>
                  <Link href={item.href} className="bru-card px-3 py-2 text-sm font-semibold">
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <a href="https://github.com/piyushdhoka/movinglines" target="_blank" rel="noreferrer" className="bru-card px-3 py-2 text-sm font-semibold flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </SheetClose>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <SheetClose asChild>
                    <Button variant="outline" className="bru-ghost w-full text-sm" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="bru-button w-full text-sm" onClick={onLaunchAction}>
                      Dashboard
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <SheetClose asChild>
                  <Button className="bru-button w-full text-sm" onClick={onLaunchAction}>
                    Launch app
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
