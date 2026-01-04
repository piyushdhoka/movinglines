'use client'

import { VideoGallery } from '@/components/VideoGallery'

export function HistoryView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Your History</h2>
      <VideoGallery />
    </div>
  )
}
