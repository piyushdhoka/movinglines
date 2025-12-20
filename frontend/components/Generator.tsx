'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { generateAnimation, getTaskStatus, Quality, qualityLabels } from '@/lib/api'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Play, Check } from 'lucide-react'

type GeneratorProps = {
  onVideoGeneratedAction: () => void
}

const qualities: Quality[] = ['l', 'm', 'h', 'k']

export function Generator({ onVideoGeneratedAction }: GeneratorProps) {
  const { session } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState<Quality>('m')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.access_token || !prompt.trim()) return

    setError('')
    setStatus('starting')
    setProgress(0)

    try {
      const data = await generateAnimation(prompt, quality, session.access_token)
      setTaskId(data.task_id)
      setPrompt('')
    } catch (err: any) {
      setError(err.message || 'Failed to start generation')
      setStatus('')
    }
  }

  const isGenerating = !!taskId

  return (
    <div className="card max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Describe your animation
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A circle transforming into a square with a smooth animation, then rotating 360 degrees..."
            className="input-field min-h-[120px] resize-none"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-3">
            Video Quality
          </label>
          <div className="flex gap-3">
            {qualities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                disabled={isGenerating}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300
                  ${quality === q 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-dark-800/50 text-dark-400 hover:bg-dark-700/50 hover:text-white'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {qualityLabels[q]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400 capitalize">{status.replace('_', ' ')}</span>
              <span className="text-primary-400">{progress}%</span>
            </div>
            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-600 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Animation
            </>
          )}
        </button>
      </form>
    </div>
  )
}

