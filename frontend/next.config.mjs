import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disabled standalone output on Windows to avoid 'EPERM' symlink errors
    // output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '**.gravatar.com',
            },
        ],
    },
}

const withMDX = createMDX();

export default withMDX(nextConfig);
