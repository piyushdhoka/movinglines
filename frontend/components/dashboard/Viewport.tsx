'use client'

import { useState } from 'react'
import { Box, Download, Code2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeViewer from './CodeViewer'

interface ViewportProps {
  videoUrl: string | null
  generatedCode: string
  mobileTab?: 'chat' | 'output'
}

export function Viewport({ videoUrl, generatedCode, mobileTab }: ViewportProps) {
  const [activeTab, setActiveTab] = useState<'viewport' | 'source'>('viewport')

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `generated-animation.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(url, '_blank')
    }
  }

  return (
    <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-background min-h-0`}>
      <div className="h-10 md:h-12 border-b-2 border-border flex px-3 md:px-6 items-center gap-4 md:gap-8 flex-shrink-0">
        <button
          onClick={() => setActiveTab('viewport')}
          className={`text-[10px] md:text-xs font-black uppercase h-full flex items-center gap-1.5 transition-colors ${
            activeTab === 'viewport'
              ? 'border-b-2 border-main text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Play className="h-3 w-3" />
          Viewport
        </button>
        <button
          onClick={() => setActiveTab('source')}
          className={`text-[10px] md:text-xs font-black uppercase h-full flex items-center gap-1.5 transition-colors ${
            activeTab === 'source'
              ? 'border-b-2 border-main text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Code2 className="h-3 w-3" />
          Source
        </button>
      </div>
      
      {activeTab === 'viewport' ? (
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-secondary overflow-hidden">
          {videoUrl ? (
            <div className="w-full max-w-4xl aspect-video bru-card overflow-hidden relative group">
              <video src={videoUrl} controls className="w-full h-full object-contain bg-black" />
              <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => handleDownload(videoUrl)}
                  className="bru-button p-1.5 md:p-2"
                  title="Download Video"
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl aspect-video bru-card flex flex-col items-center justify-center text-muted-foreground gap-3 md:gap-4">
              <Box className="h-10 w-10 md:h-12 md:w-12" />
              <span className="text-xs md:text-sm font-medium">No output generated</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 relative min-h-0 bg-secondary">
          <div className="absolute inset-0 p-3 md:p-4">
            <CodeViewer code={generatedCode} filename="manim_animation.py" />
          </div>
        </div>
      )}
    </div>
  )
}
