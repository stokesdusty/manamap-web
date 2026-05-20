import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCreatorBySlug, getSimilarCreators } from '@/lib/creators'
import { formatCount, formatShortDate, PLATFORM_LABEL } from '@/lib/format'
import { fetchChannel as fetchYouTubeChannel, fetchLatestVideos } from '@/lib/external/youtube'
import { fetchChannel as fetchTwitchChannel, fetchLiveStatus } from '@/lib/external/twitch'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Pip } from '@/components/ui/Pip'
import { Hairline } from '@/components/ui/Hairline'
import { ProfileTabs } from './_components/ProfileTabs'
import { ProfileViewCapture } from './_components/ProfileViewCapture'
import type { AppearanceItem, FeaturedItem, YouTubeVideoItem } from './_components/ProfileTabs'

// ── Cache / revalidation ──────────────────────────────────────────────────────

// 60s so Twitch live status is at most 60s stale (matches the platformCache TTL).
export const revalidate = 60

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const creator = await getCreatorBySlug(slug)
  if (!creator) return { title: 'Creator not found' }

  const description = creator.bio
    ? creator.bio.length > 155
      ? `${creator.bio.slice(0, 154)}…`
      : creator.bio
    : `${creator.displayName} on ManaMap — MTG creator directory.`

  const title = `${creator.displayName} on ManaMap`

  return {
    title: creator.displayName,
    description,
    openGraph: {
      title,
      description,
      url: `/c/${creator.slug}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CreatorProfilePage({ params }: Props) {
  const { slug } = await params
  const creator = await getCreatorBySlug(slug)
  if (!creator) notFound()

  const similar = await getSimilarCreators(creator.id, creator.primaryFormatId)

  // ── External platform data (cached in platformCache, never 500 on failure) ──

  const ytAccount = creator.socialAccounts.find((a) => a.platform === 'youtube')
  const twAccount = creator.socialAccounts.find((a) => a.platform === 'twitch')

  const [ytChannel, twChannel] = await Promise.all([
    ytAccount ? fetchYouTubeChannel(ytAccount.handle) : null,
    twAccount ? fetchTwitchChannel(twAccount.handle) : null,
  ])

  const [youtubeVideos, twitchLive] = await Promise.all([
    ytChannel ? fetchLatestVideos(ytChannel.channelId, 6) : Promise.resolve([]),
    twChannel ? fetchLiveStatus(twChannel.broadcasterId) : Promise.resolve(null),
  ])

  const isLive = twitchLive?.isLive ?? false

  // ── Derived data ──────────────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10)

  const upcomingAppearances: AppearanceItem[] = creator.appearances
    .filter((a) => a.event.startDate >= today)
    .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate))
    .slice(0, 5)
    .map((a) => ({
      role: a.role,
      event: {
        slug: a.event.slug,
        name: a.event.name,
        startDate: a.event.startDate,
        locationName: a.event.locationName ?? null,
      },
    }))

  const featuredContent: FeaturedItem[] = creator.featuredContent.map((fc) => ({
    id: fc.id,
    platform: fc.platform,
    title: fc.title,
    url: fc.url ?? null,
    thumbnailUrl: fc.thumbnailUrl ?? null,
    publishedAt: fc.publishedAt?.toISOString() ?? null,
  }))

  const ytVideos: YouTubeVideoItem[] = youtubeVideos.map((v) => ({
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    publishedAt: v.publishedAt,
    url: v.url,
  }))

  const primaryFormatName = creator.primaryFormat?.name ?? null
  const colorIdentity = (creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>

  const otherFormats = creator.formats.filter(
    (f) => f.format.id !== creator.primaryFormatId
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main>
      <ProfileViewCapture slug={slug} />
      {/* ── Profile hero ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--hairline)',
        }}
        className="px-5 py-5 md:px-8 md:py-7"
      >
        {/* Identity row */}
        <div
          className="profile-identity-row"
          style={{ display: 'flex', gap: 22, alignItems: 'flex-end', flexWrap: 'wrap' }}
        >

          {/* Avatar with dashed ring decoration */}
          <div style={{ position: 'relative', flexShrink: 0, width: 92, height: 92 }}>
            {/* Dashed ring — sits 8px outside the avatar */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: '1px dashed var(--hairline-strong)',
                pointerEvents: 'none',
              }}
            />
            {/* Circular avatar placeholder */}
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 30%, var(--paper) 0 12%, var(--paper-soft) 12% 60%, var(--hairline) 60%)',
                border: '3px solid var(--surface)',
                boxShadow: '0 0 0 1px var(--hairline)',
              }}
            />
          </div>

          {/* Name / handle / meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + verified badge */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 40,
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {creator.displayName}
              </h1>
              {creator.verified && <Chip variant="solid">Verified</Chip>}
            </div>

            {/* Handle + region */}
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
                margin: '5px 0 0',
              }}
            >
              {creator.handle ? `@${creator.handle}` : `/${creator.slug}`}
              {creator.region && ` · ${creator.region.name}`}
            </p>

            {/* Follower row */}
            {creator.socialAccounts.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 22,
                  marginTop: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  flexWrap: 'wrap',
                }}
              >
                {creator.socialAccounts.slice(0, 4).map((p) => (
                  <span key={p.id}>
                    <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>
                      {formatCount(p.followers)}
                    </strong>
                    {' on '}
                    {PLATFORM_LABEL[p.platform] ?? p.platform}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="outline">Save</Button>
            <Button variant="solid">Follow</Button>
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p
            style={{
              marginTop: 18,
              fontSize: 14,
              color: 'var(--ink-2)',
              maxWidth: '60ch',
              lineHeight: 1.6,
              margin: '18px 0 0',
            }}
          >
            {creator.bio}
          </p>
        )}

        {/* Chips row — primary format (solid), other formats, content tags, color identity */}
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {primaryFormatName && <Chip variant="solid">{primaryFormatName}</Chip>}
          {otherFormats.map((f) => (
            <Chip key={f.format.id}>{f.format.name}</Chip>
          ))}
          {creator.contentTags.map((ct) => (
            <Chip key={ct.tag.id}>{ct.tag.label}</Chip>
          ))}
          {colorIdentity.map((c) => (
            <Chip key={c} variant="color" color={c}>
              {c.toUpperCase()}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Profile body ──────────────────────────────────────────────────── */}
      <div className="profile-body">
        {/* Left: tabbed content */}
        <ProfileTabs
          featuredContent={featuredContent}
          youtubeVideos={ytVideos}
          appearances={upcomingAppearances}
          bio={creator.bio ?? ''}
          formatLabels={creator.formats.map((f) => f.format.name)}
          tagLabels={creator.contentTags.map((ct) => ct.tag.label)}
        />

        {/* Right: side rail */}
        <aside style={{ fontSize: 13 }}>

          {/* Platforms */}
          {creator.socialAccounts.length > 0 && (
            <SideGroup heading="Platforms">
              {creator.socialAccounts.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={railLinkStyle}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {PLATFORM_LABEL[p.platform] ?? p.platform}
                    {p.platform === 'twitch' && isLive && <LiveBadge />}
                  </span>
                  <strong style={railStrongStyle}>{formatCount(p.followers)}</strong>
                </a>
              ))}
            </SideGroup>
          )}

          {/* Upcoming events */}
          {upcomingAppearances.length > 0 && (
            <SideGroup heading="Upcoming">
              {upcomingAppearances.map((a) => (
                <div key={a.event.slug} style={railLinkStyle}>
                  <span>{a.event.name}</span>
                  <strong style={railStrongStyle}>
                    {formatShortDate(a.event.startDate)}
                  </strong>
                </div>
              ))}
            </SideGroup>
          )}

          {/* Similar creators */}
          {similar.length > 0 && (
            <SideGroup heading="Similar creators">
              {similar.map((s) => (
                <a key={s.id} href={`/c/${s.slug}`} style={railLinkStyle}>
                  <span>@{s.handle ?? s.slug}</span>
                  <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                    {formatCount(s.followersTotal)}
                  </span>
                </a>
              ))}
            </SideGroup>
          )}

          {/* Business */}
          <SideGroup heading="Business">
            <a href={`/c/${slug}/kit`} style={railLinkStyle}>
              <span>Media kit</span>
              <span style={{ color: 'var(--ink-4)' }}>→</span>
            </a>
            <div style={railLinkStyle}>
              <span>Sponsor inquiry</span>
              <span style={{ color: 'var(--ink-4)' }}>→</span>
            </div>
          </SideGroup>

        </aside>
      </div>
    </main>
  )
}

// ── Side rail primitives ──────────────────────────────────────────────────────

const railGroupHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
  fontWeight: 500,
  margin: '0 0 8px',
}

const railLinkStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--ink-3)',
  padding: '5px 0',
  borderBottom: '1px solid var(--hairline)',
  textDecoration: 'none',
  gap: 8,
}

const railStrongStyle: React.CSSProperties = {
  color: 'var(--ink)',
  fontWeight: 500,
  flexShrink: 0,
}

function LiveBadge() {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        background: 'var(--r)',
        color: '#fff',
        padding: '1px 5px',
        borderRadius: 3,
        fontWeight: 600,
        lineHeight: 1.6,
      }}
    >
      Live
    </span>
  )
}

function SideGroup({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--hairline)',
        paddingTop: 14,
        marginTop: 14,
      }}
    >
      <h6 style={railGroupHeadingStyle}>{heading}</h6>
      <div>{children}</div>
    </div>
  )
}
