'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Globe, Lock } from 'lucide-react'
import { toggleVideoSharing } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface ShareVideoButtonProps {
    videoId: string
    isPublic: boolean
    viewCount?: number
    token: string
    onShareToggle?: (isPublic: boolean) => void
}

export function ShareVideoButton({
    videoId,
    isPublic: initialIsPublic,
    viewCount = 0,
    token,
    onShareToggle
}: ShareVideoButtonProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [showDialog, setShowDialog] = useState(false)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/share/video/${videoId}`
        : ''

    const handleToggleShare = async () => {
        if (!isPublic && !showDialog) {
            // Show confirmation before making public
            setShowDialog(true)
            return
        }

        setLoading(true)
        try {
            const newState = !isPublic
            await toggleVideoSharing(videoId, newState, token)
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
                variant="outline"
                size="sm"
                onClick={() => isPublic ? handleCopyLink() : handleToggleShare()}
                className="gap-2"
            >
                {isPublic ? (
                    <>
                        <Globe className="h-4 w-4" />
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            'Share'
                        )}
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Make Public
                    </>
                )}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isPublic ? 'Share Video' : 'Make Video Public?'}
                        </DialogTitle>
                        <DialogDescription>
                            {isPublic ? (
                                <>
                                    Your video is public. Anyone with this link can view it.
                                    {viewCount > 0 && (
                                        <span className="block mt-2 text-sm">
                                            {viewCount} {viewCount === 1 ? 'view' : 'views'}
                                        </span>
                                    )}
                                </>
                            ) : (
                                'This will generate a public link that anyone can access. You can make it private again at any time.'
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
