/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://caloriescalc-backend.onrender.com',
  },
}

module.exports = nextConfig
