'use client'

import Image from 'next/image'
import { Plus, Wand2, BookOpen, Clock, Settings, LogOut, Trash2, ChevronDown } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Chat {
  id: string
  title: string
  created_at: string
}

interface AppSidebarProps {
  currentView: 'workspace' | 'templates' | 'history'
  setCurrentView: (view: 'workspace' | 'templates' | 'history') => void
  chats: Chat[]
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  handleNewChat: () => void
  handleDeleteChat: (e: React.MouseEvent, chatId: string) => void
}

export function AppSidebar({
  currentView,
  setCurrentView,
  chats,
  activeChatId,
  setActiveChatId,
  handleNewChat,
  handleDeleteChat,
}: AppSidebarProps) {
  const { user, signOut } = useAuth()

  // Get user avatar from Google
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const navItems = [
    { label: 'Create', icon: Wand2, view: 'workspace' as const },
    { label: 'Templates', icon: BookOpen, view: 'templates' as const },
    { label: 'History', icon: Clock, view: 'history' as const },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#0a0a0a]">
      {/* Header with Logo */}
      <SidebarHeader className="p-4 md:p-5 border-b border-white/5 shrink-0 group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-black overflow-hidden flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="MovingLines" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-semibold text-white tracking-tight group-data-[state=collapsed]:hidden">movinglines</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0a0a0a] px-2 flex flex-col h-full overflow-hidden group-data-[state=collapsed]:px-1">
        {/* New Animation Button */}
        <SidebarGroup className="pt-4 pb-2 shrink-0 group-data-[state=collapsed]:p-1">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:gap-0"
            title="New Animation"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="group-data-[state=collapsed]:hidden whitespace-nowrap">New Animation</span>
          </button>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup className="py-2 shrink-0 group-data-[state=collapsed]:p-1">
          <SidebarGroupLabel className="text-[11px] font-medium text-white/30 uppercase tracking-wider px-3 mb-1 group-data-[state=collapsed]:hidden">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <button
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center ${currentView === item.view
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    title={item.label}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                  </button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 my-2 border-t border-white/5 shrink-0 group-data-[state=collapsed]:mx-1" />

        {/* Recent Animations */}
        <SidebarGroup className="flex-1 py-2 flex flex-col min-h-0 overflow-hidden group-data-[state=collapsed]:p-1">
          <SidebarGroupLabel className="text-[11px] font-medium text-white/30 uppercase tracking-wider px-3 mb-2 shrink-0 group-data-[state=collapsed]:hidden">
            Recent
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-y-auto min-h-0 custom-scrollbar group-data-[state=collapsed]:hidden">
            <SidebarMenu className="space-y-0.5">
              {chats.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-white/5 flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-white/20" />
                  </div>
                  <p className="text-sm text-white/30">No animations yet</p>
                  <p className="text-xs text-white/20 mt-1">Create your first one!</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <div className="group flex items-center w-full">
                      <button
                        onClick={() => {
                          setActiveChatId(chat.id)
                          setCurrentView('workspace')
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${activeChatId === chat.id
                          ? 'text-white bg-white/10'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <span className="truncate">{chat.title}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 hover:bg-red-500/10 rounded-md text-white/30 hover:text-red-400 transition-all"
                        aria-label={`Delete ${chat.title}`}
                        title={`Delete ${chat.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>

          {/* Collapsed state placeholder for recent */}
          <div className="hidden group-data-[state=collapsed]:flex flex-col items-center gap-2 py-2">
            <div className="w-6 h-[1px] bg-white/5" />
            <Clock className="h-4 w-4 text-white/20" />
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-white/5 p-2 md:p-3 bg-[#0a0a0a] shrink-0 group-data-[state=collapsed]:p-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-12"
              aria-label="User settings menu"
              title={userName}
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-left min-w-0 group-data-[state=collapsed]:hidden">
                <div className="text-sm font-medium text-white truncate">{userName}</div>
                <div className="text-xs text-white/40 truncate">{user?.email}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-white/30 group-data-[state=collapsed]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 bg-[#111] border border-white/10 mb-2">
            <DropdownMenuItem className="text-sm text-white/70 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-sm text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
