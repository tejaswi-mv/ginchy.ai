/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lejnqimkweslrzsojtsp.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'oaidalleapiprodscus.blob.core.windows.net',
            },
            {
                protocol: 'https',
                hostname: 'image.pollinations.ai',
            }
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb', // Increase from default 1mb to 10mb for character uploads
        },
    },
};

module.exports = nextConfig;
