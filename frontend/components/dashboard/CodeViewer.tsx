'use client'

import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy, Download } from 'lucide-react'

interface CodeViewerProps {
  code: string
  filename?: string
}

export default function CodeViewer({ code, filename = 'animation.py' }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-[#1e1e1e] rounded-lg border-2 border-border">
        <p className="text-gray-400 text-sm">
          Generate an animation to see the Manim source code
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#1e1e1e] rounded-lg border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">{filename}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
            Python
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download as .py file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Highlight theme={themes.vsDark} code={code.trim()} language="python">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} text-sm p-4`}
              style={{ ...style, background: 'transparent', margin: 0 }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell pr-4 text-gray-500 text-right select-none w-8 text-xs">
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}
