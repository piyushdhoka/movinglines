import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicVideo } from '@/lib/api'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Eye } from 'lucide-react'

interface Props {
    params: Promise<{ videoId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { videoId } = await params

    try {
        const video = await getPublicVideo(videoId)

        return {
            title: `${video.prompt.substring(0, 60)} - MovingLines`,
            description: `Watch this 3Blue1Brown-style math animation: ${video.prompt}`,
            openGraph: {
                title: video.prompt,
                description: 'Mathematical animation created with MovingLines',
                type: 'video.other',
                videos: [{ url: video.video_url }],
            },
            twitter: {
                card: 'player',
                title: video.prompt,
                description: 'Mathematical animation created with MovingLines',
            },
        }
    } catch {
        return {
            title: 'Video Not Found - MovingLines',
        }
    }
}

export default async function SharedVideoPage({ params }: Props) {
    const { videoId } = await params

    let video
    try {
        video = await getPublicVideo(videoId)
    } catch (error) {
        notFound()
    }

    const createdDate = new Date(video.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
                        <img src="/logo.png" alt="MovingLines" className="h-8 w-8" />
                        MovingLines
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden bg-black/50 backdrop-blur border border-white/10 shadow-2xl">
                    <VideoPlayer url={video.video_url} />
                </div>

                {/* Video Info */}
                <div className="mt-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-3">{video.prompt}</h1>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {createdDate}
                            </span>
                            {video.view_count > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    {video.view_count} {video.view_count === 1 ? 'view' : 'views'}
                                </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                                {video.quality === 'k' ? '4K' : video.quality === 'h' ? '1080p' : video.quality === 'm' ? '720p' : '480p'}
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Create Your Own Animation
                        </h2>
                        <p className="text-white/70 mb-4">
                            Generate stunning 3Blue1Brown-style math animations with AI. Describe your concept, and watch it come to life.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/dashboard">
                                Get Started Free
                            </Link>
                        </Button>
                    </div>

                    {/* Generated Script (Optional) */}
                    {video.generated_script && (
                        <details className="group">
                            <summary className="cursor-pointer list-none">
                                <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                                    <h3 className="text-sm font-medium text-white group-open:mb-4">
                                        View Generated Code
                                    </h3>
                                </div>
                            </summary>
                            <div className="mt-2 p-4 rounded-lg bg-black/50 border border-white/10">
                                <pre className="text-xs text-white/80 overflow-x-auto">
                                    <code>{video.generated_script}</code>
                                </pre>
                            </div>
                        </details>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-white/10 py-8">
                <div className="container mx-auto px-4 text-center text-sm text-white/40">
                    <p>Made with ❤️ by MovingLines</p>
                </div>
            </footer>
        </div>
    )
}
