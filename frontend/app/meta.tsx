import type { Metadata } from 'next'

export const metadataConfig: Metadata = {
    metadataBase: new URL('https://movinglines.co.in'),
    title: 'MovingLines - Animation Engine',
    description: 'Transform complex mathematical concepts into beautiful animations using AI. Create stunning Manim visualizations with natural language.',
    keywords: ['manim', 'animation', 'math', 'visualization', 'AI', 'education', 'creative'],
    authors: [{ name: 'MovingLines' }],
    creator: 'MovingLines',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
        ],
        apple: '/logo.png',
    },
    openGraph: {
        title: 'MovingLines - Animation Engine',
        description: 'Transform complex mathematical concepts into beautiful animations using AI.',
        url: 'https://movinglines.co.in',
        siteName: 'MovingLines',
        type: 'website',
        images: [
            {
                url: '/social-preview.png',
                width: 1200,
                height: 630,
                alt: 'MovingLines - AI Animation Engine',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MovingLines - Animation Engine',
        description: 'Transform complex mathematical concepts into beautiful animations using AI.',
        images: ['/social-preview.png'],
        creator: '@piyushdhoka',
    },
}
