import type { Metadata, Viewport } from 'next'
import { Newsreader, Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { MobileTabBar } from '@/components/nav/MobileTabBar'
import { Providers } from './providers'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    template: '%s | ManaMap',
    default: 'ManaMap — The MTG Creator Directory',
  },
  description:
    'Find MTG creators by format, content style, audience, and region. The discovery and infrastructure layer for the Magic: The Gathering creator ecosystem.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manamap.gg'
  ),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${newsreader.variable} ${geist.variable} ${geistMono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
          <Providers>
            {children}
            <MobileTabBar />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
