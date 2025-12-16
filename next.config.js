/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  output: isProduction ? 'export' : undefined,
  // Only use basePath for GitHub Pages deployment
  ...(isGitHubPages && {
    basePath: '/SaaSimulator',
    assetPrefix: '/SaaSimulator',
  }),
  images: {
    unoptimized: true,
  },
  // Improve dev server stability
  experimental: {
    // Helps with dev server stability
  },
  // Disable static optimization in dev to prevent caching issues
  swcMinify: true,
}

module.exports = nextConfig
