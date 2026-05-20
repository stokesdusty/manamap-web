'use client'

import { useState, useTransition } from 'react'
import { useForm, useFieldArray, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveFeatured } from '../actions'

// ── Schema (mirrors server) ───────────────────────────────────────────────────

const PLATFORMS = ['youtube', 'twitch', 'tiktok', 'bluesky', 'twitter', 'instagram', 'moxfield', 'archidekt', 'podcast', 'patreon'] as const

const itemSchema = z.object({
  id:           z.number().optional(),
  platform:     z.enum(PLATFORMS, { error: 'Select a platform' }),
  title:        z.string().min(1, 'Title is required').max(255),
  url:          z.string().url('Enter a valid URL (https://…)').max(2048),
  thumbnailUrl: z.union([z.literal(''), z.string().max(2048).url('Enter a valid URL')]),
})

const featuredSchema = z.object({
  items: z.array(itemSchema).max(6, 'Max 6 featured items'),
})

type FeaturedFormValues = z.infer<typeof featuredSchema>

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube', twitch: 'Twitch', tiktok: 'TikTok', bluesky: 'Bluesky',
  twitter: 'X (Twitter)', instagram: 'Instagram', moxfield: 'Moxfield',
  archidekt: 'Archidekt', podcast: 'Podcast', patreon: 'Patreon',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface FeaturedFormProps {
  initial: FeaturedFormValues
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FeaturedForm({ initial }: FeaturedFormProps) {
  const [saved, setSaved] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<FeaturedFormValues>({
      resolver: zodResolver(featuredSchema),
      defaultValues: initial,
      mode: 'onTouched',
    })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      move(oldIndex, newIndex)
    }
  }

  const onSubmit = handleSubmit((data) => {
    setSaved(false)
    setRootError(null)
    startTransition(async () => {
      const result = await saveFeatured(data)
      if (!result.ok) {
        setRootError(result.errors.root?.[0] ?? 'Save failed')
      } else {
        setSaved(true)
      }
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map((field, index) => (
              <SortableItem
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                control={control}
                error={errors.items?.[index]}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length < 6 && (
        <button
          type="button"
          onClick={() =>
            append({ platform: 'youtube', title: '', url: '', thumbnailUrl: '' })
          }
          style={{
            marginTop: fields.length > 0 ? 8 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px dashed var(--hairline)',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-3)',
            cursor: 'pointer',
          }}
        >
          + Add item ({fields.length}/6)
        </button>
      )}

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
          {pending ? 'Saving…' : 'Save featured'}
        </button>
      </div>
    </form>
  )
}

// ── Sortable item ─────────────────────────────────────────────────────────────

function SortableItem({
  id,
  index,
  register,
  control,
  error,
  onRemove,
}: {
  id: string
  index: number
  register: ReturnType<typeof useForm<FeaturedFormValues>>['register']
  control: ReturnType<typeof useForm<FeaturedFormValues>>['control']
  error?: { title?: { message?: string }; url?: { message?: string }; thumbnailUrl?: { message?: string }; platform?: { message?: string } }
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const { field: platformField } = useController({
    name: `items.${index}.platform` as const,
    control,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        padding: '16px 20px',
      }}
    >
      {/* Header row: drag handle + platform select + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span
          {...attributes}
          {...listeners}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'var(--ink-4)',
            fontSize: 14,
            lineHeight: 1,
            userSelect: 'none',
            flexShrink: 0,
          }}
          aria-label="Drag to reorder"
        >
          ⠿
        </span>

        <select
          value={platformField.value}
          onChange={(e) => platformField.onChange(e.target.value)}
          style={{ ...inp, flex: '0 0 160px' }}
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid var(--hairline)',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--r)',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gap: 8 }}>
        <FieldRow label="Title" error={error?.title?.message}>
          <input
            {...register(`items.${index}.title` as const)}
            placeholder="Video / article title"
            style={inp}
          />
        </FieldRow>

        <FieldRow label="URL" error={error?.url?.message}>
          <input
            {...register(`items.${index}.url` as const)}
            placeholder="https://"
            style={inp}
          />
        </FieldRow>

        <FieldRow label="Thumbnail" error={error?.thumbnailUrl?.message}>
          <input
            {...register(`items.${index}.thumbnailUrl` as const)}
            placeholder="https:// (optional)"
            style={inp}
          />
        </FieldRow>
      </div>
    </div>
  )
}

function FieldRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="dash-form-row" style={{ borderBottom: 'none' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          paddingTop: 9,
        }}
      >
        {label}
      </span>
      <div>
        {children}
        {error && <p style={{ fontSize: 12, color: 'var(--r)', margin: '3px 0 0' }}>{error}</p>}
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-tint)',
  border: '1px solid var(--hairline)',
  borderRadius: 5,
  padding: '7px 10px',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--ink)',
  outline: 'none',
}
