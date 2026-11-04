/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Beheer en login nooit cachen op de CDN
        source: '/(beheer|login)(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
