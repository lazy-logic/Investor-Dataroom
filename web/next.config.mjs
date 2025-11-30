/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
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
