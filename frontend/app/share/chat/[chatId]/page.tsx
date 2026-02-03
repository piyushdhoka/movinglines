import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicChat } from '@/lib/api'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Eye, MessageSquare } from 'lucide-react'

interface Props {
    params: Promise<{ chatId: string }>
}

interface Task {
    id: string
    prompt: string
    created_at: string
    status: string
    video_url?: string
    error_message?: string
    generated_script?: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { chatId } = await params

    try {
        const data = await getPublicChat(chatId)

        return {
            title: `${data.chat.title} - MovingLines`,
            description: `Explore this mathematical animation conversation with ${data.tasks.length} animation${data.tasks.length !== 1 ? 's' : ''}`,
            openGraph: {
                title: data.chat.title,
                description: `Mathematical animation conversation created with MovingLines`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: data.chat.title,
                description: `Mathematical animation conversation created with MovingLines`,
            },
        }
    } catch {
        return {
            title: 'Chat Not Found - MovingLines',
        }
    }
}

export default async function SharedChatPage({ params }: Props) {
    const { chatId } = await params

    let data
    try {
        data = await getPublicChat(chatId)
    } catch (error) {
        notFound()
    }

    const { chat, tasks } = data

    const createdDate = new Date(chat.created_at).toLocaleDateString('en-US', {
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
                {/* Chat Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Shared Conversation</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">{chat.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {createdDate}
                        </span>
                        {chat.view_count > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                {chat.view_count} {chat.view_count === 1 ? 'view' : 'views'}
                            </span>
                        )}
                        <span className="text-white/40">
                            {tasks.length} {tasks.length === 1 ? 'animation' : 'animations'}
                        </span>
                    </div>
                </div>

                {/* Tasks/Videos */}
                <div className="space-y-12">
                    {tasks.map((task: Task, index: number) => (
                        <div key={task.id} className="space-y-4">
                            {/* Prompt */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-medium text-blue-400 flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-white mb-1">{task.prompt}</h2>
                                    <p className="text-sm text-white/50">
                                        {new Date(task.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Video */}
                            {task.status === 'completed' && task.video_url && (
                                <div className="rounded-xl overflow-hidden bg-black/50 backdrop-blur border border-white/10 shadow-xl">
                                    <VideoPlayer url={task.video_url} />
                                </div>
                            )}

                            {/* Status for non-completed tasks */}
                            {task.status !== 'completed' && (
                                <div className={`p-4 rounded-lg border ${task.status === 'failed'
                                    ? 'bg-red-500/10 border-red-500/20'
                                    : 'bg-yellow-500/10 border-yellow-500/20'
                                    }`}>
                                    <p className="text-sm">
                                        {task.status === 'failed'
                                            ? `❌ Generation failed: ${task.error_message || 'Unknown error'}`
                                            : `⏳ Status: ${task.status}`}
                                    </p>
                                </div>
                            )}

                            {/* Generated Script (Collapsible) */}
                            {task.generated_script && (
                                <details className="group">
                                    <summary className="cursor-pointer list-none">
                                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                                            <h3 className="text-sm font-medium text-white">
                                                View Generated Code
                                            </h3>
                                        </div>
                                    </summary>
                                    <div className="mt-2 p-4 rounded-lg bg-black/50 border border-white/10">
                                        <pre className="text-xs text-white/80 overflow-x-auto">
                                            <code>{task.generated_script}</code>
                                        </pre>
                                    </div>
                                </details>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Create Your Own Animations
                    </h2>
                    <p className="text-white/70 mb-4">
                        Generate stunning 3Blue1Brown-style math animations with AI. Describe your concepts and watch them come to life.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                            Get Started Free
                        </Link>
                    </Button>
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
