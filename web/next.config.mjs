/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/nda',
          destination: '/demo/nda',
        },
        {
          source: '/dashboard',
          destination: '/demo/dashboard',
        },
        {
          source: '/documents',
          destination: '/demo/documents',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
