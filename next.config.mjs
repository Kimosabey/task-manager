/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    '*': [
      '.next/cache/**',
      'node_modules/@swc/**',
    ],
  },
};

export default nextConfig;
