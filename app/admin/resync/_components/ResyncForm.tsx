'use client'

import { useActionState } from 'react'
import { bulkResync } from '../actions'
import type { ResyncResult } from '../actions'

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
}

export function ResyncForm() {
  const [state, action, pending] = useActionState<ResyncResult | null, FormData>(
    bulkResync,
    null
  )

  const okCount = state?.results.filter((r) => r.ok).length ?? 0
  const errCount = state?.results.filter((r) => !r.ok).length ?? 0

  return (
    <form action={action}>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--ink-3)',
          margin: '0 0 20px',
          lineHeight: 1.5,
          maxWidth: '56ch',
        }}
      >
        Runs <code style={monoStyle}>syncSocialAccount</code> for every YouTube and Twitch account
        whose last sync is older than 24h (or never synced). Sequential, 250ms between requests.
      </p>

      <button
        type="submit"
        disabled={pending}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 20px',
          borderRadius: 999,
          cursor: pending ? 'default' : 'pointer',
          background: pending ? 'var(--hairline)' : 'var(--ink)',
          color: pending ? 'var(--ink-3)' : 'var(--paper)',
          border: 'none',
        }}
      >
        {pending ? 'Resyncing…' : 'Run resync'}
      </button>

      {state && !pending && (
        <div style={{ marginTop: 24 }}>
          {state.totalQueued === 0 ? (
            <p style={{ ...monoStyle, color: 'var(--ink-3)' }}>
              All accounts are up to date — nothing to sync.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  marginBottom: 16,
                  ...monoStyle,
                }}
              >
                <span>Queued: {state.totalQueued}</span>
                {okCount > 0 && <span style={{ color: '#276749' }}>{okCount} ok</span>}
                {errCount > 0 && <span style={{ color: '#c53030' }}>{errCount} errors</span>}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', ...monoStyle }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--hairline)' }}>
                      {['Creator', 'Platform', 'Handle', 'Followers', 'Status'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '6px 12px',
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--ink-4)',
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.results.map((r, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--hairline)',
                          background: r.ok ? 'transparent' : '#fff5f5',
                        }}
                      >
                        <td style={{ padding: '6px 12px' }}>{r.slug}</td>
                        <td style={{ padding: '6px 12px' }}>{r.platform}</td>
                        <td style={{ padding: '6px 12px', color: 'var(--ink-4)' }}>
                          {r.handle}
                        </td>
                        <td style={{ padding: '6px 12px', textAlign: 'right' as const }}>
                          {r.ok ? r.followers.toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '6px 12px' }}>
                          {r.ok ? (
                            <span style={{ color: '#276749' }}>ok</span>
                          ) : (
                            <span style={{ color: '#c53030' }}>{r.error ?? 'error'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </form>
  )
}
