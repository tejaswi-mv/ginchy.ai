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
            }
        ],
    },
};

module.exports = nextConfig;
