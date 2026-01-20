import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://movinglines.co.in'
    const currentDate = new Date()

    return [
        // Homepage - highest priority
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1,
        },
        // Dashboard - main app
        {
            url: `${baseUrl}/dashboard`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        // Documentation
        {
            url: `${baseUrl}/docs`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Features page (if exists or you plan to create)
        {
            url: `${baseUrl}/features`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // Showcase - examples
        {
            url: `${baseUrl}/showcase`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Animations gallery
        {
            url: `${baseUrl}/animations`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        // Templates
        {
            url: `${baseUrl}/templates`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        // Pricing (if available)
        {
            url: `${baseUrl}/pricing`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ]
}
