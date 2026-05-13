/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    root: '..',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
