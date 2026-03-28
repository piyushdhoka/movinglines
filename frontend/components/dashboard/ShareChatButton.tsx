'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Globe, Lock, AlertTriangle } from 'lucide-react'
import { toggleChatSharing } from '@/lib/api'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface ShareChatButtonProps {
    chatId: string
    isPublic: boolean
    viewCount?: number
    onShareToggle?: (isPublic: boolean) => void
}

export function ShareChatButton({
    chatId,
    isPublic: initialIsPublic,
    viewCount = 0,
    onShareToggle
}: ShareChatButtonProps) {
    const { session } = useAuth()
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [showDialog, setShowDialog] = useState(false)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/share/chat/${chatId}`
        : ''

    const handleToggleShare = async () => {
        if (!session?.access_token) {
            alert('Please log in to share chats')
            return
        }

        if (!isPublic && !showDialog) {
            // Show confirmation before making public
            setShowDialog(true)
            return
        }

        setLoading(true)
        try {
            const newState = !isPublic
            await toggleChatSharing(chatId, newState, session.access_token)
            setIsPublic(newState)
            onShareToggle?.(newState)

            if (!newState) {
                setShowDialog(false)
            }
        } catch (error) {
            console.error('Failed to toggle sharing:', error)
            alert('Failed to update sharing settings. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => isPublic ? handleCopyLink() : handleToggleShare()}
                className="gap-2"
                title={isPublic ? "Copy share link" : "Share this chat"}
            >
                {isPublic ? (
                    <>
                        <Globe className="h-4 w-4 text-green-500" />
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </>
                ) : (
                    <Share2 className="h-4 w-4" />
                )}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isPublic ? 'Share Chat' : 'Make Chat Public?'}
                        </DialogTitle>
                        <DialogDescription>
                            {isPublic ? (
                                <>
                                    Your chat is public. Anyone with this link can view all videos in this conversation.
                                    {viewCount > 0 && (
                                        <span className="block mt-2 text-sm">
                                            {viewCount} {viewCount === 1 ? 'view' : 'views'}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <p>This will generate a public link that anyone can access. You can make it private again at any time.</p>
                                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                            This will make <strong>all videos</strong> in this chat publicly visible.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {isPublic && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent border-none outline-none text-sm"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyLink}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}

                    <DialogFooter>
                        {isPublic ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDialog(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleToggleShare}
                                    disabled={loading}
                                >
                                    Make Private
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleToggleShare}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Make Public'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
