/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3004/api/v1',
    NEXT_PUBLIC_COMMUNICATION_SERVICE_URL: process.env.NEXT_PUBLIC_COMMUNICATION_SERVICE_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_EXPENSE_SERVICE_URL: process.env.NEXT_PUBLIC_EXPENSE_SERVICE_URL || 'http://localhost:3002/api/v1',
    NEXT_PUBLIC_FEE_SERVICE_URL: process.env.NEXT_PUBLIC_FEE_SERVICE_URL || 'http://localhost:3003/api/v1',
  },
}

module.exports = nextConfig
