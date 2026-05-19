'use client'

import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { PLATFORM_LABEL, formatRelativeDate, formatShortDate } from '@/lib/format'

// ── Types passed from the server page ────────────────────────────────────────

export interface FeaturedItem {
  id: number
  platform: string
  title: string
  publishedAt: string | null
}

export interface AppearanceItem {
  role: string
  event: {
    slug: string
    name: string
    startDate: string
    locationName: string | null
  }
}

interface ProfileTabsProps {
  featuredContent: FeaturedItem[]
  appearances: AppearanceItem[]
  bio: string
  formatLabels: string[]
  tagLabels: string[]
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = 'content' | 'decks' | 'events' | 'about'

const TABS: { id: TabId; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'decks', label: 'Decks' },
  { id: 'events', label: 'Events' },
  { id: 'about', label: 'About' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileTabs({
  featuredContent,
  appearances,
  bio,
  formatLabels,
  tagLabels,
}: ProfileTabsProps) {
  const [active, setActive] = useState<TabId>('content')

  return (
    <div>
      {/* Tab bar — matches .tabs pattern from styles.css */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          borderBottom: '1px solid var(--hairline)',
          marginBottom: 18,
        }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            style={{
              padding: '8px 0',
              marginBottom: -1,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${active === id ? 'var(--ink)' : 'transparent'}`,
              color: active === id ? 'var(--ink)' : 'var(--ink-4)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {active === 'content' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {featuredContent.length > 0 ? (
            featuredContent.map((item) => <ContentTile key={item.id} item={item} />)
          ) : (
            <EmptyState>No content linked yet.</EmptyState>
          )}
        </div>
      )}

      {/* ── Decks ── */}
      {active === 'decks' && (
        <EmptyState>Deck lists not yet imported.</EmptyState>
      )}

      {/* ── Events ── */}
      {active === 'events' && (
        <div>
          {appearances.length > 0 ? (
            appearances.map((a) => (
              <AppearanceRow key={`${a.event.slug}-${a.role}`} appearance={a} />
            ))
          ) : (
            <EmptyState>No upcoming events.</EmptyState>
          )}
        </div>
      )}

      {/* ── About ── */}
      {active === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {bio && (
            <p
              style={{
                fontSize: 14,
                color: 'var(--ink-2)',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '60ch',
              }}
            >
              {bio}
            </p>
          )}
          {(formatLabels.length > 0 || tagLabels.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {formatLabels.map((f) => <Chip key={f}>{f}</Chip>)}
              {tagLabels.map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ContentTile({ item }: { item: FeaturedItem }) {
  const label = PLATFORM_LABEL[item.platform] ?? item.platform
  const dateStr = item.publishedAt ? formatRelativeDate(item.publishedAt) : ''

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail placeholder */}
      <div
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, var(--paper-soft) 0%, var(--paper) 100%)',
          position: 'relative',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: 'var(--surface)',
            color: 'var(--ink-3)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          {label}
        </span>
      </div>

      {/* Meta */}
      <div style={{ padding: '10px 12px' }}>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.35,
            color: 'var(--ink)',
            margin: '0 0 4px',
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-4)',
            margin: 0,
          }}
        >
          {dateStr}
        </p>
      </div>
    </div>
  )
}

function AppearanceRow({ appearance }: { appearance: AppearanceItem }) {
  const { event, role } = appearance
  const dateStr = formatShortDate(event.startDate)
  const roleLabel = role.replace(/_/g, ' ')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr auto',
        gap: 14,
        padding: '12px 0',
        borderBottom: '1px solid var(--hairline)',
        alignItems: 'start',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-4)',
          margin: 0,
          lineHeight: 1.4,
          paddingTop: 2,
        }}
      >
        {dateStr}
      </p>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            letterSpacing: '-0.01em',
            margin: '0 0 2px',
          }}
        >
          {event.name}
        </p>
        {event.locationName && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-3)',
              margin: 0,
            }}
          >
            {event.locationName}
          </p>
        )}
      </div>
      <Chip>{roleLabel}</Chip>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--ink-4)',
        padding: '32px 0',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}
