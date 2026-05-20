'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Pip } from '@/components/ui/Pip'
import { capture } from '@/lib/posthog'
import {
  checkHandleAvailability,
  saveOnboardStep1,
  saveOnboardStep2,
  saveOnboardStep3,
  publishProfile,
  SLUG_DENYLIST,
} from '../actions'
import type { ActionResult } from '../actions'

// ── Schema ────────────────────────────────────────────────────────────────────

const HANDLE_REGEX = /^[a-z0-9-]{3,32}$/

const schema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .regex(HANDLE_REGEX, 'Lowercase letters, numbers, and hyphens — 3 to 32 characters'),
  youtube:  z.string().max(100),
  twitch:   z.string().max(100),
  tiktok:   z.string().max(100),
  bluesky:  z.string().max(100),
  twitter:  z.string().max(100),
  patreon:  z.string().max(100),
  moxfield: z.string().max(100),
  formats:  z.array(z.string()).min(1, 'Pick at least one format'),
  colors:   z.array(z.string()),
  tags:     z.array(z.string()).min(1, 'Pick at least one content type'),
  audience: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FormatOption { code: string; name: string }
export interface TagOption    { code: string; label: string }

interface OnboardFlowProps {
  initial:      Partial<FormValues>
  initialStep:  number
  allFormats:   FormatOption[]
  styleTags:    TagOption[]
  audienceTags: TagOption[]
}

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Claim your handle', time: '15s' },
  { n: '02', title: 'Connect platforms', time: '30s' },
  { n: '03', title: 'Tag yourself',      time: '30s' },
  { n: '04', title: 'Publish',           time: '15s' },
]

const STEP_FIELDS: Array<Array<keyof FormValues>> = [
  ['displayName', 'handle'],
  ['youtube', 'twitch', 'tiktok', 'bluesky', 'twitter', 'patreon', 'moxfield'],
  ['formats', 'colors', 'tags', 'audience'],
  [],
]

// ── Root component ────────────────────────────────────────────────────────────

export function OnboardFlow({ initial, initialStep, allFormats, styleTags, audienceTags }: OnboardFlowProps) {
  const [step, setStep] = useState(initialStep)
  const [pending, startTransition] = useTransition()
  const [rootError, setRootError] = useState<string | null>(null)
  const startedAtRef = useRef<number>(Date.now())
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: initial.displayName ?? '',
      handle:      initial.handle      ?? '',
      youtube:     initial.youtube     ?? '',
      twitch:      initial.twitch      ?? '',
      tiktok:      initial.tiktok      ?? '',
      bluesky:     initial.bluesky     ?? '',
      twitter:     initial.twitter     ?? '',
      patreon:     initial.patreon     ?? '',
      moxfield:    initial.moxfield    ?? '',
      formats:     initial.formats     ?? [],
      colors:      initial.colors      ?? [],
      tags:        initial.tags        ?? [],
      audience:    initial.audience    ?? [],
    },
    mode: 'onTouched',
  })

  const { trigger, getValues, setError, formState: { errors } } = form

  async function handleNext() {
    const fields = STEP_FIELDS[step - 1]!
    const valid = fields.length ? await trigger(fields) : true
    if (!valid) return

    const values = getValues()
    let result: ActionResult

    if (step === 1) {
      result = await saveOnboardStep1({ displayName: values.displayName, handle: values.handle })
    } else if (step === 2) {
      result = await saveOnboardStep2({
        youtube: values.youtube, twitch: values.twitch, tiktok: values.tiktok,
        bluesky: values.bluesky, twitter: values.twitter, patreon: values.patreon,
        moxfield: values.moxfield,
      })
    } else if (step === 3) {
      result = await saveOnboardStep3({
        formats: values.formats, colors: values.colors, tags: values.tags, audience: values.audience,
      })
    } else {
      const pubResult = await publishProfile()
      if (pubResult.ok) {
        capture('onboard_complete', { total_ms: Date.now() - startedAtRef.current })
        router.push(`/c/${pubResult.data!.slug}`)
        return
      }
      result = pubResult
    }

    if (!result.ok) {
      setRootError(null)
      if (result.errors.root) {
        setRootError(result.errors.root[0] ?? null)
      } else {
        Object.entries(result.errors).forEach(([k, msgs]) => {
          if (msgs?.[0]) setError(k as keyof FormValues, { message: msgs[0] })
        })
      }
      return
    }

    capture('onboard_step_complete', { step, elapsed_ms: Date.now() - startedAtRef.current })
    setRootError(null)
    setStep((s) => s + 1)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Wordmark */}
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          letterSpacing: '-0.02em',
          textDecoration: 'none',
          color: 'var(--ink)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 40,
        }}
      >
        Mana
        <span aria-hidden style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--w)', borderRadius: '50%', margin: '0 1px' }} />
        <em style={{ fontStyle: 'italic' }}>Map</em>
      </a>

      {/* Progress stepper */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 40 }}>
        {STEPS.map((s, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done || active ? 'var(--ink)' : 'var(--paper)',
                  border: `1px solid ${done || active ? 'var(--ink)' : 'var(--hairline-strong)'}`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: done || active ? 'var(--paper)' : 'var(--ink-4)',
                }}
              >
                {done ? '✓' : n}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 32, height: 1, background: done ? 'var(--ink)' : 'var(--hairline)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 10,
          padding: '32px 36px 28px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-4)',
            margin: '0 0 4px',
          }}
        >
          Step {STEPS[step - 1]!.n} · {STEPS[step - 1]!.time}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            margin: '0 0 24px',
          }}
        >
          {STEPS[step - 1]!.title}
        </h1>

        {rootError && (
          <p style={{ color: 'var(--r)', fontSize: 13, marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
            {rootError}
          </p>
        )}

        {step === 1 && <StepHandle form={form} errors={errors} />}
        {step === 2 && <StepPlatforms form={form} errors={errors} />}
        {step === 3 && (
          <StepTags form={form} allFormats={allFormats} styleTags={styleTags} audienceTags={audienceTags} errors={errors} />
        )}
        {step === 4 && <StepPublish handle={getValues('handle')} />}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid var(--hairline)',
          }}
        >
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} style={ghostBtn}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => startTransition(handleNext)}
            disabled={pending}
            style={{ ...solidBtn, opacity: pending ? 0.6 : 1 }}
          >
            {pending ? 'Saving…' : step === 4 ? 'Publish profile' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Handle ────────────────────────────────────────────────────────────

type HandleAvailability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function StepHandle({
  form,
  errors,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors']
}) {
  const { register } = form
  const [availability, setAvailability] = useState<HandleAvailability>('idle')
  const [availMsg, setAvailMsg] = useState('')

  const checkAvailability = useCallback(async (value: string) => {
    if (!HANDLE_REGEX.test(value) || SLUG_DENYLIST.has(value)) {
      setAvailability('invalid')
      return
    }
    setAvailability('checking')
    const result = await checkHandleAvailability(value)
    setAvailability(result.available ? 'available' : 'taken')
    setAvailMsg(result.message ?? '')
  }, [])

  const availColor =
    availability === 'available' ? 'var(--g)' :
    availability === 'taken' || availability === 'invalid' ? 'var(--r)' : 'var(--ink-4)'

  const availText =
    availability === 'available' ? '✓ Available' :
    availability === 'checking'  ? 'Checking…'  :
    availability === 'taken'     ? `✗ ${availMsg || 'Handle taken'}` :
    availability === 'invalid'   ? `✗ ${availMsg || 'Invalid format'}` : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormField label="Display name" hint="Shown publicly, used in search" error={errors.displayName?.message}>
        <input {...register('displayName')} placeholder="Your creator name" style={inputStyle} />
      </FormField>

      <FormField label="Your URL" hint="manamap.gg/c/[handle]" error={errors.handle?.message}>
        <input
          {...register('handle', {
            onBlur: (e) => checkAvailability(e.target.value),
          })}
          placeholder="your-handle"
          style={inputStyle}
        />
        {availText && (
          <p style={{ fontSize: 12, color: availColor, margin: '4px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            {availText}
          </p>
        )}
      </FormField>
    </div>
  )
}

// ── Step 2: Platforms ─────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'youtube',  label: 'YouTube',     pip: '#FF0000', placeholder: 'channel-name' },
  { id: 'twitch',   label: 'Twitch',      pip: '#9146FF', placeholder: 'username' },
  { id: 'tiktok',   label: 'TikTok',      pip: '#010101', placeholder: 'username' },
  { id: 'bluesky',  label: 'Bluesky',     pip: '#0085FF', placeholder: 'you.bsky.social' },
  { id: 'twitter',  label: 'X (Twitter)', pip: '#14171A', placeholder: 'username' },
  { id: 'patreon',  label: 'Patreon',     pip: '#FF424D', placeholder: 'username' },
  { id: 'moxfield', label: 'Moxfield',    pip: '#5C8A5A', placeholder: 'username' },
] as const

function StepPlatforms({
  form,
  errors,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors']
}) {
  const { register } = form
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 4px', lineHeight: 1.5 }}>
        Enter your handles — we'll collect follower counts in the background.
      </p>
      {PLATFORMS.map(({ id, label, pip, placeholder }) => (
        <div key={id}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: pip, flexShrink: 0 }} />
            {label}
          </p>
          <input
            {...register(id as keyof FormValues)}
            placeholder={placeholder}
            style={inputStyle}
          />
          {(errors as Record<string, { message?: string }>)[id]?.message && (
            <FieldError message={(errors as Record<string, { message?: string }>)[id]!.message!} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 3: Tags ──────────────────────────────────────────────────────────────

const WUBRG = [
  { code: 'w', label: 'W' },
  { code: 'u', label: 'U' },
  { code: 'b', label: 'B' },
  { code: 'r', label: 'R' },
  { code: 'g', label: 'G' },
] as const

function StepTags({
  form,
  allFormats,
  styleTags,
  audienceTags,
  errors,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  allFormats: FormatOption[]
  styleTags: TagOption[]
  audienceTags: TagOption[]
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors']
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <FieldLabel label="Formats" hint="Pick up to 4" />
        <ChipSelect name="formats" control={form.control} options={allFormats.map((f) => ({ value: f.code, label: f.name }))} max={4} />
        {errors.formats && <FieldError message={String(errors.formats.message ?? (errors.formats as { root?: { message?: string } }).root?.message ?? '')} />}
      </div>

      <div>
        <FieldLabel label="Color identity" hint="Your primary deck colors" />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {WUBRG.map(({ code, label }) => (
            <ColorPip key={code} code={code} label={label} form={form} />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel label="Content type" hint="Required — pick at least one" />
        <ChipSelect name="tags" control={form.control} options={styleTags.map((t) => ({ value: t.code, label: t.label }))} />
        {errors.tags && <FieldError message={String(errors.tags.message ?? '')} />}
      </div>

      <div>
        <FieldLabel label="Audience style" />
        <ChipSelect name="audience" control={form.control} options={audienceTags.map((t) => ({ value: t.code, label: t.label }))} />
      </div>
    </div>
  )
}

function ColorPip({ code, label, form }: { code: string; label: string; form: ReturnType<typeof useForm<FormValues>> }) {
  const { field } = useController({ name: 'colors', control: form.control })
  const selected = (field.value as string[]) ?? []
  const active = selected.includes(code)

  return (
    <button
      type="button"
      onClick={() => field.onChange(active ? selected.filter((c) => c !== code) : [...selected, code])}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline-strong)'}`,
        borderRadius: 999,
        background: active ? 'var(--ink)' : 'var(--surface)',
        color: active ? 'var(--paper)' : 'var(--ink-3)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
      }}
    >
      <Pip color={code as 'w' | 'u' | 'b' | 'r' | 'g'} size="sm" />
      {label}
    </button>
  )
}

// ── Step 4: Publish ───────────────────────────────────────────────────────────

function StepPublish({ handle }: { handle: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
        Your profile is ready to go live. Once published, it will appear in search results and have its own public URL.
      </p>
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--paper-soft)',
          borderRadius: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--ink-3)',
          border: '1px solid var(--hairline)',
        }}
      >
        manamap.gg/c/{handle || 'your-handle'}
        {handle && <span style={{ color: 'var(--g)', marginLeft: 8 }}>✓</span>}
      </div>
    </div>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function FormField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      {children}
      {error && <FieldError message={error} />}
    </div>
  )
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: '0 0 6px' }}>
      {label}
      {hint && (
        <span style={{ display: 'block', fontFamily: 'var(--font-sans)', textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--ink-4)', marginTop: 1, fontWeight: 400 }}>
          {hint}
        </span>
      )}
    </p>
  )
}

function FieldError({ message }: { message: string }) {
  return <p style={{ fontSize: 12, color: 'var(--r)', margin: '4px 0 0', fontFamily: 'var(--font-sans)' }}>{message}</p>
}

function ChipSelect({ name, control, options, max }: { name: keyof FormValues; control: ReturnType<typeof useForm<FormValues>>['control']; options: Array<{ value: string; label: string }>; max?: number }) {
  const { field } = useController({ name, control })
  const selected = (field.value as string[]) ?? []

  const toggle = (v: string) => {
    if (selected.includes(v)) field.onChange(selected.filter((x) => x !== v))
    else if (!max || selected.length < max) field.onChange([...selected, v])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {options.map(({ value, label }) => {
        const active = selected.includes(value)
        const atMax = !!max && selected.length >= max && !active
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            disabled={atMax}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              padding: '3px 8px',
              borderRadius: 3,
              border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline)'}`,
              background: active ? 'var(--ink)' : 'var(--paper-soft)',
              color: active ? 'var(--paper)' : 'var(--ink-3)',
              cursor: atMax ? 'default' : 'pointer',
              opacity: atMax ? 0.4 : 1,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Button styles ─────────────────────────────────────────────────────────────

const solidBtn: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 500,
  padding: '9px 22px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--ink)',
  color: 'var(--paper)',
  cursor: 'pointer',
}

const ghostBtn: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  padding: '9px 0',
  background: 'none',
  border: 'none',
  color: 'var(--ink-3)',
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
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
