'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Quality } from '@/lib/api'
import { Viewport } from './Viewport'

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
}: WorkspaceViewProps) {
  const [mobileTab, setMobileTab] = useState<'chat' | 'output'>('chat')

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
      {/* Mobile Workspace Tabs */}
      <div className="md:hidden flex h-10 border-b-2 border-border bg-background">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 text-xs font-bold uppercase ${
            mobileTab === 'chat' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 text-xs font-bold uppercase ${
            mobileTab === 'output' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
          }`}
        >
          Output
        </button>
      </div>

      {/* Chat Pane */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] border-r-2 border-border flex-col bg-secondary`}>
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="bru-card p-4 text-sm leading-relaxed">
            {activeChatId ? "Continuing chat session..." : "Engine Initialized. Describe your visualization."}
          </div>
          {isGenerating && (
            <div className="bru-card p-4 text-sm leading-relaxed flex items-center gap-3">
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Generating... {status} ({Math.round(progress)}%)</span>
            </div>
          )}
          {error && (
            <div className="bru-card bg-destructive/10 border-destructive p-4 text-sm text-destructive leading-relaxed">
              Error: {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t-2 border-border space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Duration Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Duration</span>
              <div className="flex bg-secondary rounded-md p-1 border-2 border-border gap-1">
                {[15, 30, 45].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    disabled={isGenerating}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      duration === d
                        ? 'bg-main text-background bru-shadow'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Quality</span>
              <div className="flex bg-secondary rounded-md p-1 border-2 border-border gap-1">
                {(['l', 'm', 'h', 'k'] as Quality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    disabled={isGenerating}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      quality === q
                        ? 'bg-mainAccent text-background bru-shadow'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {q === 'k' ? '4K' : q === 'l' ? '420p' : q === 'm' ? '720p' : '1080p'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }}
            placeholder="Animate a 3D Fourier transform..."
            className="w-full bru-card p-4 text-sm focus:border-foreground outline-none resize-none h-24 pr-12"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute bottom-7 right-7 bru-button p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Viewport Pane */}
      <Viewport videoUrl={videoUrl} generatedCode={generatedCode} mobileTab={mobileTab} />
    </div>
  )
}
