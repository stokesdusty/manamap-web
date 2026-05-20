'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { platformsSchema, PLATFORM_LABELS, type PlatformsFormValues } from '@/lib/validators/platforms'
import { savePlatforms } from '../actions'

interface PlatformsFormProps {
  initial: PlatformsFormValues
}

const PLATFORM_ORDER = [
  'youtube', 'twitch', 'tiktok', 'bluesky', 'twitter',
  'instagram', 'patreon', 'moxfield', 'archidekt', 'podcast',
] as const

export function PlatformsForm({ initial }: PlatformsFormProps) {
  const [saved, setSaved] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<PlatformsFormValues>({
    resolver: zodResolver(platformsSchema),
    defaultValues: initial,
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit((data) => {
    setSaved(false)
    setRootError(null)
    startTransition(async () => {
      const result = await savePlatforms(data)
      if (!result.ok) {
        if (result.errors.root) setRootError(result.errors.root[0] ?? null)
      } else {
        setSaved(true)
      }
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 8,
        }}
      >
        {PLATFORM_ORDER.map((platform, i) => {
          const err = errors[platform]?.message
          const isLast = i === PLATFORM_ORDER.length - 1
          return (
            <div
              key={platform}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: 16,
                padding: '14px 22px',
                borderBottom: isLast ? 'none' : '1px solid var(--hairline)',
                alignItems: 'start',
              }}
            >
              <label
                htmlFor={`platform-${platform}`}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-3)',
                  paddingTop: 8,
                }}
              >
                {PLATFORM_LABELS[platform]}
              </label>
              <div>
                <input
                  id={`platform-${platform}`}
                  {...register(platform)}
                  placeholder={platform === 'podcast' ? 'https://…' : `@handle`}
                  style={inp}
                  autoComplete="off"
                  spellCheck={false}
                />
                {err && (
                  <p style={{ fontSize: 12, color: 'var(--r)', margin: '4px 0 0' }}>{err}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        {rootError && <p style={{ fontSize: 13, color: 'var(--r)', margin: 0 }}>{rootError}</p>}
        {saved && !rootError && (
          <p style={{ color: 'var(--g)', margin: 0, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
            Saved ✓
          </p>
        )}
        {!rootError && !saved && <span />}
        <button
          type="submit"
          disabled={pending}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            padding: '9px 24px',
            borderRadius: 999,
            border: 'none',
            background: pending ? 'var(--ink-4)' : 'var(--ink)',
            color: 'var(--paper)',
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Saving…' : 'Save platforms'}
        </button>
      </div>
    </form>
  )
}

const inp: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-tint)',
  border: '1px solid var(--hairline)',
  borderRadius: 5,
  padding: '8px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--ink)',
  outline: 'none',
}
