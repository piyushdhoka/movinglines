'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserVideos } from '@/lib/api'
import { Video } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Play, Download, Calendar } from 'lucide-react'

export function VideoGallery() {
  const { session } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  useEffect(() => {
    if (!session?.access_token) return

    const fetchVideos = async () => {
      try {
        const data = await getUserVideos(session.access_token)
        setVideos(data)
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [session?.access_token])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl loading-shimmer" />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400 text-lg">
          No animations yet. Create your first one above!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="video-card group cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video bg-dark-800 relative">
              <video
                src={video.video_url}
                className="w-full h-full object-cover"
                muted
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause()
                  e.currentTarget.currentTime = 0
                }}
              />
              <div className="video-overlay absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-dark-300 line-clamp-2 mb-2">
                {video.prompt}
              </p>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Calendar className="w-3 h-3" />
                {new Date(video.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.video_url}
              controls
              autoPlay
              className="w-full rounded-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-dark-300">{selectedVideo.prompt}</p>
              <a
                href={selectedVideo.video_url}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

