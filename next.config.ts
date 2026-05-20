import type { NextConfig } from 'next'

const r2PublicBase = process.env.R2_PUBLIC_BASE_URL ?? ''

let r2Hostname = ''
try {
  if (r2PublicBase) r2Hostname = new URL(r2PublicBase).hostname
} catch {
  // no-op — hostname stays empty and remotePatterns entry is skipped
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (avatar / banner / featured uploads)
      ...(r2Hostname
        ? [{ protocol: 'https' as const, hostname: r2Hostname, pathname: '/**' }]
        : []),
    ],
  },
}

export default nextConfig
