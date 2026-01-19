'use client'

import { useState } from 'react'
import { ArrowUp, Plus, ChevronDown } from 'lucide-react'
import { Quality } from '@/lib/api'
import { Viewport } from './Viewport'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

interface WorkspaceViewProps {
  activeChatId: string | null
  prompt: string
  setPrompt: (prompt: string) => void
  quality: Quality
  setQuality: (quality: Quality) => void
  duration: number
  setDuration: (duration: number) => void
  isGenerating: boolean
  status: string
  progress: number
  error: string
  videoUrl: string | null
  generatedCode: string
  handleGenerate: () => void
  credits: number | null
}

export function WorkspaceView({
  activeChatId,
  prompt,
  setPrompt,
  quality,
  setQuality,
  duration,
  setDuration,
  isGenerating,
  status,
  progress,
  error,
  videoUrl,
  generatedCode,
  handleGenerate,
  credits,
}: WorkspaceViewProps) {
  const [mobileTab, setMobileTab] = useState<'chat' | 'output'>('chat')

  const [activeDropdown, setActiveDropdown] = useState<'duration' | 'quality' | null>(null)

  const qualityOptions: { value: Quality; label: string }[] = [
    { value: 'l', label: '480p' },
    { value: 'm', label: '720p' },
    { value: 'h', label: '1080p' },
    { value: 'k', label: '4K' },
  ]

  const durationOptions = [15, 30, 45]

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0 bg-[#0a0a0a]" onClick={() => setActiveDropdown(null)}>
      {/* Mobile Tabs */}
      <div className="md:hidden flex h-12 border-b border-white/5 bg-[#0a0a0a]">
        <button
          onClick={(e) => { e.stopPropagation(); setMobileTab('chat'); }}
          className={`flex-1 text-sm font-medium transition-colors ${mobileTab === 'chat'
            ? 'text-white border-b-2 border-white'
            : 'text-white/40'
            }`}
        >
          Create
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMobileTab('output'); }}
          className={`flex-1 text-sm font-medium transition-colors ${mobileTab === 'output'
            ? 'text-white border-b-2 border-white'
            : 'text-white/40'
            }`}
        >
          Preview
        </button>
      </div>

      {/* Input Pane */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-[420px] border-r border-white/5 flex-col bg-[#0a0a0a]`}>

        {/* Status Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* ... existing content ... */}
          {/* Empty state - show when not generating, no video, no error */}
          {!isGenerating && !error && !videoUrl && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Create Animation</h3>
                  <p className="text-sm text-white/40 mt-1">
                    Describe what you want to visualize and we'll generate an animation for you.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success state */}
          {videoUrl && !isGenerating && !error && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <span className="text-sm font-medium text-green-400">Animation complete!</span>
              </div>
            </div>
          )}

          {/* Generating state - just show a simple message, loader is in preview */}
          {isGenerating && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm text-white/50">Generating your animation...</p>
                <p className="text-xs text-white/30">Check the preview panel for progress</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls - Integrated into InputGroup */}
        <div className="p-5 border-t border-white/5">
          <InputGroup className="flex-col">
            <textarea
              data-slot="input-group-control"
              id="animation-prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
              placeholder="Describe your animation..."
              aria-label="Animation description"
              disabled={isGenerating}
              className={`w-full min-h-20 resize-none bg-transparent px-4 pt-4 pb-14 text-sm text-white placeholder:text-white/30 outline-none ${isGenerating ? 'opacity-50' : ''}`}
            />
            <InputGroupAddon align="block-end">
              {/* Left side - Duration & Quality Dropdowns */}
              <div className="flex items-center gap-2">
                {/* Duration Dropdown */}
                <div className="relative">
                  <InputGroupButton
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'duration' ? null : 'duration');
                    }}
                  >
                    {duration}s
                    <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === 'duration' ? 'rotate-180' : ''}`} />
                  </InputGroupButton>
                  {activeDropdown === 'duration' && (
                    <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-xl z-50">
                      {durationOptions.map((d) => (
                        <button
                          key={d}
                          onClick={(e) => { e.stopPropagation(); setDuration(d); setActiveDropdown(null); }}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${duration === d
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {d} seconds
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Quality Dropdown */}
                <div className="relative">
                  <InputGroupButton
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'quality' ? null : 'quality');
                    }}
                  >
                    {qualityOptions.find(q => q.value === quality)?.label || '720p'}
                    <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === 'quality' ? 'rotate-180' : ''}`} />
                  </InputGroupButton>
                  {activeDropdown === 'quality' && (
                    <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-xl z-50">
                      {qualityOptions.map((q) => (
                        <button
                          key={q.value}
                          onClick={(e) => { e.stopPropagation(); setQuality(q.value); setActiveDropdown(null); }}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${quality === q.value
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Right side - Credits & Send */}
              <div className="flex items-center gap-3">
                <InputGroupText>
                  {credits !== null ? `${credits}/2 credits` : ''}
                </InputGroupText>
                <InputGroupButton
                  variant="default"
                  size="icon-sm"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || credits === 0}
                  aria-label="Generate animation"
                  title={credits === 0 ? 'No credits remaining' : 'Generate animation'}
                >
                  <ArrowUp className="h-4 w-4" />
                </InputGroupButton>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      {/* Viewport Pane - now receives generation state */}
      <Viewport
        videoUrl={videoUrl}
        generatedCode={generatedCode}
        mobileTab={mobileTab}
        isGenerating={isGenerating}
        status={status}
        progress={progress}
      />
    </div>
  )
}
