/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.telegram.org' },
      { protocol: 'https', hostname: 'cdn.telegram.org' },
    ],
  },
}
module.exports = nextConfig
