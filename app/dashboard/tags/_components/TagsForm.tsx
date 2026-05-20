'use client'

import { useState, useTransition } from 'react'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pip } from '@/components/ui/Pip'
import { saveTags } from '../actions'

const tagsSchema = z.object({
  formats:  z.array(z.string()).min(1, 'Pick at least one format'),
  colors:   z.array(z.string()),
  tags:     z.array(z.string()),
  audience: z.array(z.string()),
})

type TagsFormValues = z.infer<typeof tagsSchema>

export interface FormatOption { code: string; name: string }
export interface TagOption    { code: string; label: string }

interface TagsFormProps {
  initial:     TagsFormValues
  allFormats:  FormatOption[]
  styleTags:   TagOption[]
  audienceTags: TagOption[]
}

const WUBRG = [
  { code: 'w', label: 'W' },
  { code: 'u', label: 'U' },
  { code: 'b', label: 'B' },
  { code: 'r', label: 'R' },
  { code: 'g', label: 'G' },
] as const

export function TagsForm({ initial, allFormats, styleTags, audienceTags }: TagsFormProps) {
  const [saved, setSaved] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { handleSubmit, control, formState: { errors } } = useForm<TagsFormValues>({
    resolver: zodResolver(tagsSchema),
    defaultValues: initial,
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit((data) => {
    setSaved(false)
    setRootError(null)
    startTransition(async () => {
      const result = await saveTags(data)
      if (!result.ok) {
        setRootError(result.errors.root?.[0] ?? 'Save failed')
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
        <FormRow label="Formats" hint="Pick up to 4" error={errors.formats?.message as string | undefined}>
          <ChipMulti
            name="formats"
            control={control}
            options={allFormats.map((f) => ({ value: f.code, label: f.name }))}
            max={4}
          />
        </FormRow>

        <FormRow label="Colors" hint="Primary deck identity">
          <ColorChips control={control} />
        </FormRow>

        <FormRow label="Content types" error={errors.tags?.message as string | undefined}>
          <ChipMulti
            name="tags"
            control={control}
            options={styleTags.map((t) => ({ value: t.code, label: t.label }))}
          />
        </FormRow>

        <FormRow label="Audience style" last>
          <ChipMulti
            name="audience"
            control={control}
            options={audienceTags.map((t) => ({ value: t.code, label: t.label }))}
          />
        </FormRow>
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
          {pending ? 'Saving…' : 'Save tags'}
        </button>
      </div>
    </form>
  )
}

function FormRow({ label, hint, error, children, last = false }: {
  label: string; hint?: string; error?: string; children: React.ReactNode; last?: boolean
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
          <span style={{ display: 'block', fontFamily: 'var(--font-sans)', textTransform: 'none', letterSpacing: 0, fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
            {hint}
          </span>
        )}
      </div>
      <div>
        {children}
        {error && <p style={{ fontSize: 12, color: 'var(--r)', margin: '4px 0 0' }}>{error}</p>}
      </div>
    </div>
  )
}

function ChipMulti({
  name, control, options, max,
}: {
  name: keyof TagsFormValues
  control: ReturnType<typeof useForm<TagsFormValues>>['control']
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

function ColorChips({ control }: { control: ReturnType<typeof useForm<TagsFormValues>>['control'] }) {
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
              field.onChange(active ? selected.filter((c) => c !== code) : [...selected, code])
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
