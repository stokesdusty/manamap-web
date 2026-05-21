'use client'

import { useState, useTransition } from 'react'
import { resyncCreator, setPublished, deleteCreator } from '../actions'

interface SocialAccount {
  id: number
  platform: string
  followers: number
  syncedAt: Date | null
  lastSyncError: string | null
}

export interface CreatorRowData {
  id: number
  slug: string
  displayName: string
  published: boolean
  followersTotal: number
  socialAccounts: SocialAccount[]
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
}

export function CreatorRow({ creator }: { creator: CreatorRowData }) {
  const [pending, startTransition] = useTransition()
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const lastSync = creator.socialAccounts
    .map((a) => a.syncedAt)
    .filter(Boolean)
    .sort((a, b) => b!.getTime() - a!.getTime())[0]

  const syncError = creator.socialAccounts.find((a) => a.lastSyncError)?.lastSyncError ?? null

  function handleResync() {
    setSyncMsg(null)
    startTransition(async () => {
      const res = await resyncCreator(creator.id)
      if (res.results.length === 0) {
        setSyncMsg('No YouTube/Twitch accounts')
      } else {
        setSyncMsg(
          res.results
            .map((r) => (r.ok ? `${r.platform}: ${r.followers.toLocaleString()}` : `${r.platform}: ${r.error}`))
            .join(', ')
        )
      }
    })
  }

  function handlePublish(published: boolean) {
    startTransition(async () => { await setPublished(creator.id, published) })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    startTransition(async () => { await deleteCreator(creator.id) })
  }

  const btnBase: React.CSSProperties = {
    ...monoStyle,
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    padding: '3px 8px',
    borderRadius: 4,
    cursor: pending ? 'default' : 'pointer',
    border: '1px solid var(--hairline-strong)',
    background: 'var(--surface)',
    color: 'var(--ink-3)',
    opacity: pending ? 0.5 : 1,
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
      <td style={{ padding: '8px 12px', ...monoStyle }}>
        <a
          href={`/c/${creator.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--u)', textDecoration: 'none' }}
        >
          {creator.slug}
        </a>
      </td>
      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
        {creator.displayName}
      </td>
      <td style={{ padding: '8px 12px', ...monoStyle }}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 10,
            background: creator.published ? '#c6f6d5' : '#fed7d7',
            color: creator.published ? '#276749' : '#c53030',
          }}
        >
          {creator.published ? 'published' : 'draft'}
        </span>
      </td>
      <td style={{ padding: '8px 12px', ...monoStyle, textAlign: 'right' as const }}>
        {creator.followersTotal.toLocaleString()}
      </td>
      <td style={{ padding: '8px 12px', ...monoStyle, color: 'var(--ink-4)' }}>
        {lastSync ? lastSync.toISOString().slice(0, 10) : '—'}
        {syncError && (
          <span
            title={syncError}
            style={{ color: '#c53030', marginLeft: 4 }}
          >
            ⚠
          </span>
        )}
        {syncMsg && (
          <span style={{ marginLeft: 8, color: 'var(--ink-3)' }}>{syncMsg}</span>
        )}
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={handleResync}
            disabled={pending}
            style={btnBase}
            title="Re-sync YouTube/Twitch"
          >
            {pending ? '…' : 'Sync'}
          </button>

          <button
            onClick={() => handlePublish(!creator.published)}
            disabled={pending}
            style={btnBase}
          >
            {creator.published ? 'Unpublish' : 'Publish'}
          </button>

          {confirmDelete ? (
            <>
              <button
                onClick={handleDelete}
                disabled={pending}
                style={{ ...btnBase, color: '#c53030', borderColor: '#fed7d7' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={btnBase}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              disabled={pending}
              style={btnBase}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
