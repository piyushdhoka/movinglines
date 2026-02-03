'use client'

import dynamic from 'next/dynamic'
import 'plyr/dist/plyr.css'

const Plyr = dynamic(() => import('plyr-react').then((mod) => mod.Plyr), {
    ssr: false,
})

interface VideoPlayerProps {
    url: string
}

export function VideoPlayer({ url }: VideoPlayerProps) {
    return (
        <div className="w-full aspect-video bg-black">
            <Plyr
                source={{
                    type: 'video',
                    sources: [
                        {
                            src: url,
                            type: 'video/mp4',
                        },
                    ],
                }}
                options={{
                    controls: [
                        'play-large',
                        'play',
                        'progress',
                        'current-time',
                        'mute',
                        'volume',
                        'fullscreen',
                    ],
                }}
            />
        </div>
    )
}
