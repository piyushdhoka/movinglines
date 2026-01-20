export function StructuredData() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MovingLines",
        "alternateName": "MovingLines Animation Engine",
        "url": "https://movinglines.co.in",
        "logo": "https://movinglines.co.in/logo.png",
        "sameAs": [
            "https://github.com/piyushdhoka/movinglines",
            "https://x.com/piyushdhoka"
        ],
        "description": "Transform complex mathematical concepts into beautiful animations using AI. Create stunning Manim visualizations with natural language."
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "MovingLines",
        "alternateName": "MovingLines - Animation Engine",
        "url": "https://movinglines.co.in",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://movinglines.co.in/dashboard?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "MovingLines",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "AI-powered Manim animation generator for creating mathematical visualizations",
        "url": "https://movinglines.co.in"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
        </>
    );
}
