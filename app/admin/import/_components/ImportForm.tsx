'use client'

import { useActionState, useRef } from 'react'
import { importCreators } from '../actions'
import type { ImportResult } from '../actions'

const PLACEHOLDER = `displayName,slug,youtube,twitch,tiktok,bluesky,region,formats,contentTags
The Command Zone,the-command-zone,thecommandzone,,,@commandcast,us-west,edh,casual|analytical
Tolarian Community College,tolarian-community-college,TolarianCommunityCollege,,,,us-east,edh,budget|beginner`

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
}

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportResult | null, FormData>(
    importCreators,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  const successCount = state?.results.filter((r) => r.ok).length ?? 0
  const errorCount = state?.results.filter((r) => !r.ok).length ?? 0

  return (
    <form ref={formRef} action={action}>
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="csv-input"
          style={{
            display: 'block',
            ...monoStyle,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-4)',
            marginBottom: 8,
          }}
        >
          CSV data
        </label>
        <textarea
          id="csv-input"
          name="csv"
          rows={14}
          placeholder={PLACEHOLDER}
          style={{
            width: '100%',
            ...monoStyle,
            fontSize: 12,
            padding: '10px 12px',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 6,
            background: 'var(--surface)',
            color: 'var(--ink)',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <p
          style={{
            ...monoStyle,
            fontSize: 10,
            color: 'var(--ink-4)',
            marginTop: 6,
          }}
        >
          Columns: displayName, slug, youtube, twitch, tiktok, bluesky, region, formats, contentTags.
          Multi-value fields use <code>|</code> separator (e.g. <code>edh|modern</code>).
          First row is skipped if it looks like a header.
        </p>
      </div>

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
          transition: 'background var(--t-fast)',
        }}
      >
        {pending ? 'Importing…' : 'Import creators'}
      </button>

      {/* Parse error */}
      {state?.parseError && (
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 6,
            ...monoStyle,
            color: '#c53030',
          }}
        >
          {state.parseError}
        </div>
      )}

      {/* Results table */}
      {state && state.results.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            {successCount > 0 && (
              <span style={{ ...monoStyle, color: '#276749' }}>
                {successCount} succeeded
              </span>
            )}
            {errorCount > 0 && (
              <span style={{ ...monoStyle, color: '#c53030' }}>
                {errorCount} failed
              </span>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                ...monoStyle,
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--hairline)' }}>
                  {['Row', 'Slug', 'Name', 'Status', 'Sync'].map((h) => (
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
                {state.results.map((r) => (
                  <tr
                    key={r.row}
                    style={{
                      borderBottom: '1px solid var(--hairline)',
                      background: r.ok ? 'transparent' : '#fff5f5',
                    }}
                  >
                    <td style={{ padding: '6px 12px', color: 'var(--ink-4)' }}>{r.row}</td>
                    <td style={{ padding: '6px 12px' }}>{r.slug}</td>
                    <td style={{ padding: '6px 12px' }}>{r.displayName}</td>
                    <td style={{ padding: '6px 12px' }}>
                      {r.ok ? (
                        <span style={{ color: '#276749' }}>
                          {r.created ? 'Created' : 'Updated'}
                        </span>
                      ) : (
                        <span style={{ color: '#c53030' }}>{r.error ?? 'Error'}</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 12px', color: 'var(--ink-4)' }}>
                      {r.syncResults.length === 0
                        ? '—'
                        : r.syncResults
                            .map((s) =>
                              s.ok
                                ? `${s.platform}: ${s.followers.toLocaleString()}`
                                : `${s.platform}: ${s.error ?? 'err'}`
                            )
                            .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </form>
  )
}
