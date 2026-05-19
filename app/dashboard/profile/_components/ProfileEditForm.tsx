'use client'

import { useState, useTransition } from 'react'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pip } from '@/components/ui/Pip'
import { saveProfile } from '../actions'

// ── Schema (mirrors server) ───────────────────────────────────────────────────

const schema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  bio:      z.string().max(280, 'Max 280 characters'),
  regionId: z.string(),
  formats:  z.array(z.string()).min(1, 'Pick at least one format'),
  colors:   z.array(z.string()),
  tags:     z.array(z.string()),
  audience: z.array(z.string()),
})

export type FormValues = z.infer<typeof schema>

// ── Prop types ────────────────────────────────────────────────────────────────

export interface FormatOption  { code: string; name: string }
export interface TagOption     { code: string; label: string }
export interface RegionOption  { id: number;   name: string; code: string }

interface ProfileEditFormProps {
  initial: FormValues
  allFormats:   FormatOption[]
  styleTags:    TagOption[]
  audienceTags: TagOption[]
  allRegions:   RegionOption[]
}

// ── WUBRG ─────────────────────────────────────────────────────────────────────

const WUBRG = [
  { code: 'w', label: 'W' },
  { code: 'u', label: 'U' },
  { code: 'b', label: 'B' },
  { code: 'r', label: 'R' },
  { code: 'g', label: 'G' },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileEditForm({
  initial,
  allFormats,
  styleTags,
  audienceTags,
  allRegions,
}: ProfileEditFormProps) {
  const [saved, setSaved] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, control, watch, setError, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: initial,
      mode: 'onTouched',
    })

  const bioValue = watch('bio') ?? ''

  const onSubmit = handleSubmit((data) => {
    setSaved(false)
    setRootError(null)
    startTransition(async () => {
      const result = await saveProfile(data)
      if (!result.ok) {
        if (result.errors.root) {
          setRootError(result.errors.root[0] ?? null)
        } else {
          Object.entries(result.errors).forEach(([k, msgs]) => {
            if (msgs?.[0]) setError(k as keyof FormValues, { message: msgs[0] })
          })
        }
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
        {/* Display name */}
        <FormRow label="Display name" hint="Public, used in search" error={errors.displayName?.message}>
          <input {...register('displayName')} style={inp} />
        </FormRow>

        {/* Handle */}
        <FormRow label="Handle" hint="manamap.gg/c/[handle]" error={errors.handle?.message}>
          <input {...register('handle')} style={inp} />
        </FormRow>

        {/* Formats */}
        <FormRow label="Formats" hint="Pick up to 4" error={errors.formats?.message as string | undefined}>
          <ChipMulti
            name="formats"
            control={control}
            options={allFormats.map((f) => ({ value: f.code, label: f.name }))}
            max={4}
          />
        </FormRow>

        {/* Colors */}
        <FormRow label="Colors" hint="Primary deck identity">
          <ColorChips control={control} />
        </FormRow>

        {/* Content types */}
        <FormRow label="Content types">
          <ChipMulti
            name="tags"
            control={control}
            options={styleTags.map((t) => ({ value: t.code, label: t.label }))}
          />
        </FormRow>

        {/* Audience style */}
        <FormRow label="Audience style">
          <ChipMulti
            name="audience"
            control={control}
            options={audienceTags.map((t) => ({ value: t.code, label: t.label }))}
          />
        </FormRow>

        {/* Region */}
        <FormRow label="Region / timezone">
          <select {...register('regionId')} style={{ ...inp, paddingRight: 32 }}>
            <option value="">— not set —</option>
            {allRegions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </FormRow>

        {/* Bio */}
        <FormRow
          label="Bio"
          hint={`${bioValue.length}/280`}
          error={errors.bio?.message}
          last
        >
          <textarea
            {...register('bio')}
            rows={3}
            style={{ ...inp, resize: 'vertical', minHeight: 72 }}
          />
        </FormRow>
      </div>

      {/* Save bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        {rootError && (
          <p style={{ fontSize: 13, color: 'var(--r)', margin: 0 }}>{rootError}</p>
        )}
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
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

// ── FormRow: 160px label / 1fr input, hairline between rows ──────────────────

function FormRow({
  label,
  hint,
  error,
  children,
  last = false,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 16,
        padding: '14px 22px',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
        alignItems: 'start',
      }}
    >
      {/* Label col */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          paddingTop: 8,
        }}
      >
        {label}
        {hint && (
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-sans)',
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: 10,
              color: 'var(--ink-4)',
              marginTop: 2,
            }}
          >
            {hint}
          </span>
        )}
      </div>

      {/* Input col */}
      <div>
        {children}
        {error && (
          <p style={{ fontSize: 12, color: 'var(--r)', margin: '4px 0 0' }}>{error}</p>
        )}
      </div>
    </div>
  )
}

// ── ChipMulti ─────────────────────────────────────────────────────────────────

function ChipMulti({
  name,
  control,
  options,
  max,
}: {
  name: keyof FormValues
  control: ReturnType<typeof useForm<FormValues>>['control']
  options: Array<{ value: string; label: string }>
  max?: number
}) {
  const { field } = useController({ name, control })
  const selected = (field.value as string[]) ?? []

  const toggle = (v: string) => {
    if (selected.includes(v)) {
      field.onChange(selected.filter((x) => x !== v))
    } else if (!max || selected.length < max) {
      field.onChange([...selected, v])
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
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

// ── ColorChips ────────────────────────────────────────────────────────────────

function ColorChips({ control }: { control: ReturnType<typeof useForm<FormValues>>['control'] }) {
  const { field } = useController({ name: 'colors', control })
  const selected = (field.value as string[]) ?? []

  return (
    <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
      {WUBRG.map(({ code, label }) => {
        const active = selected.includes(code)
        return (
          <button
            key={code}
            type="button"
            onClick={() =>
              field.onChange(
                active ? selected.filter((c) => c !== code) : [...selected, code]
              )
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 999,
              border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline-strong)'}`,
              background: active ? 'var(--ink)' : 'var(--surface)',
              color: active ? 'var(--paper)' : 'var(--ink-3)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
            }}
          >
            <Pip color={code as 'w' | 'u' | 'b' | 'r' | 'g'} size="sm" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

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
