import { NextResponse } from 'next/server'

export async function GET() {
    const baseUrl = 'https://movinglines.co.in'
    const currentDate = new Date().toISOString()

    const urls = [
        // Homepage - highest priority
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: '1.0',
        },
        // Dashboard - main app
        {
            url: `${baseUrl}/dashboard`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: '0.9',
        },
        // Documentation
        {
            url: `${baseUrl}/docs`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: '0.8',
        },
        // Features page
        {
            url: `${baseUrl}/features`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: '0.8',
        },
        // Showcase - examples
        {
            url: `${baseUrl}/showcase`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: '0.8',
        },
        // Animations gallery
        {
            url: `${baseUrl}/animations`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: '0.7',
        },
        // Templates
        {
            url: `${baseUrl}/templates`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: '0.7',
        },
        // Pricing
        {
            url: `${baseUrl}/pricing`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: '0.6',
        },
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
                (urlEntry) => `  <url>
    <loc>${urlEntry.url}</loc>
    <lastmod>${urlEntry.lastModified}</lastmod>
    <changefreq>${urlEntry.changeFrequency}</changefreq>
    <priority>${urlEntry.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
