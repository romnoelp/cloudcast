/** @type {import('next').NextConfig} */

import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com'],
    },
    experimental: {
        turbo: {}, 
    },
};

const bundleAnalyzerConfig = {
    enabled: process.env.ANALYZE === 'true',
};

export default withBundleAnalyzer(bundleAnalyzerConfig)(nextConfig);