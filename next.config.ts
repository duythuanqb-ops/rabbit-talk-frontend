import type { NextConfig } from "next";

function getApiHostname(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return null;
  }
}

const apiHostname = getApiHostname();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      ...(apiHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: apiHostname,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
