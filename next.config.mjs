/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '.next/cache/**',
        'node_modules/@swc/**',
      ],
    },
  },
};

export default nextConfig;
