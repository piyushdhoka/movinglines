'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { generateAnimation, getTaskStatus, Quality, qualityLabels } from '@/lib/api'
import { Sparkles, Loader2, ArrowUp, X, Film } from 'lucide-react'

type GeneratorProps = {
  onVideoGeneratedAction: () => void
}

const qualities: Quality[] = ['l', 'm', 'h', 'k']

export function Generator({ onVideoGeneratedAction }: GeneratorProps) {
  const { session } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState<Quality>('m')
  // Default duration for quick generation (seconds)
  const [duration] = useState<number>(15)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  useEffect(() => {
    if (!taskId || !session?.access_token) return

    const interval = setInterval(async () => {
      try {
        const data = await getTaskStatus(taskId, session.access_token)
        setStatus(data.status)
        setProgress(data.progress || 0)

        if (data.status === 'completed') {
          clearInterval(interval)
          setTaskId(null)
          onVideoGeneratedAction()
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setError(data.error || 'Generation failed')
          setTaskId(null)
        }
      } catch (err) {
        console.error('Status check failed:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [taskId, session?.access_token, onVideoGeneratedAction])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!session?.access_token || !prompt.trim() || isGenerating) return

    setError('')
    setStatus('starting')
    setProgress(0)
    
    // Set a temporary taskId to show loading state immediately
    const tempTaskId = 'temp-' + Date.now()
    setTaskId(tempTaskId)

    try {
      // Pass default duration and no chatId for this simple generator
      const data = await generateAnimation(prompt, quality, duration, session.access_token)
      setTaskId(data.task_id)
      setPrompt('') // Clear prompt on start
    } catch (err: any) {
      setError(err.message || 'Failed to start generation')
      setStatus('')
      setTaskId(null) // Clear temp taskId on error
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isGenerating = !!taskId

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10 font-sans">
      <div
        className={`
          relative group rounded-3xl transition-all duration-300
          ${isFocused ? 'bg-white/10 shadow-2xl shadow-brand-blue/10 border-brand-blue/30' : 'bg-white/5 border-white/10'}
          border backdrop-blur-xl
        `}
      >
        <div className="p-4 md:p-6 space-y-4">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your mathematical animation..."
            className="w-full bg-transparent border-none outline-none resize-none text-lg md:text-xl placeholder:text-dark-400 min-h-[60px] max-h-[300px] leading-relaxed"
            disabled={isGenerating}
            rows={1}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/60 mr-1">Quality:</span>
              <div className="flex bg-white/10 rounded-xl p-1 border border-white/20 backdrop-blur-sm">
                {qualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    disabled={isGenerating}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                      ${quality === q
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                        : 'text-white/70 hover:text-white hover:bg-white/10'}
                      ${isGenerating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {qualityLabels[q]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isGenerating}
              className={`
                flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                ${!prompt.trim() || isGenerating
                  ? 'bg-white/5 text-dark-500 cursor-not-allowed'
                  : 'bg-brand-orange text-white hover:bg-orange-500 shadow-lg shadow-brand-orange/20'}
              `}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar (Bottom Border) */}
        {isGenerating && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-b-3xl">
            <div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-orange transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status / Error Toast */}
      {isGenerating && (
        <div
          className="absolute -bottom-20 left-0 right-0 flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
            <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
            <span className="text-sm font-medium text-dark-300 capitalize">
              {status.replace('_', ' ')}...
            </span>
            <span className="text-xs text-dark-500 border-l border-white/10 pl-3">
              {progress}%
            </span>
          </div>
        </div>
      )}

      {error && (
        <div
          className="absolute -bottom-20 left-0 right-0 flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-900/50 backdrop-blur-md border border-red-500/20 shadow-xl text-red-200 text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

