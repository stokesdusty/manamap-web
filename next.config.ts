import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const r2PublicBase = process.env.R2_PUBLIC_BASE_URL ?? ''

let r2Hostname = ''
try {
  if (r2PublicBase) r2Hostname = new URL(r2PublicBase).hostname
} catch {
  // no-op — hostname stays empty and remotePatterns entry is skipped
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ph/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ph/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
      {
        source: '/ph/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (avatar / banner / featured uploads)
      ...(r2Hostname
        ? [{ protocol: 'https' as const, hostname: r2Hostname, pathname: '/**' }]
        : []),
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source maps uploaded during CI/Vercel build; silenced locally
  silent: !process.env.CI && !process.env.VERCEL,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
