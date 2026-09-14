import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Note: 'unsafe-inline' é necessário para scripts inline do Next.js.
      // Para maior segurança, implementar nonce-based CSP (requer middleware).
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://images.unsplash.com https://api.dicebear.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://cdn.discordapp.com https://images-ext-1.discordapp.net https://assets.aceternity.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' ws: wss: https://*.supabase.co https://api.github.com https://wandbox.org",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const ALLOWED_ORIGINS = [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'];

const nextConfig: NextConfig = {
  // Keep the embedded WASM bytes intact. Turbopack can rewrite the single-file
  // QuickJS payload into invalid JavaScript when it bundles this dependency.
  serverExternalPackages: [
    '@jitl/quickjs-singlefile-browser-release-sync',
    'quickjs-emscripten-core',
  ],
  // Vercel manages output tracing through its adapter. Keep the standalone
  // server bundle for local, Docker, and other self-hosted deployments.
  output: process.env.VERCEL ? undefined : 'standalone',
  experimental: {
    // Mantem segmentos dinamicos recentes no cache do router. Isso torna voltas
    // e alternancias entre as areas principais instantaneas sem cachear respostas
    // de API ou dados no servidor.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images-ext-1.discordapp.net', pathname: '/**' },
      { protocol: 'https', hostname: 'assets.aceternity.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Access-Control-Allow-Origin',
            value: ALLOWED_ORIGINS[0],
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
