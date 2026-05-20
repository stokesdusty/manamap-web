'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { requestUploadUrl } from '@/app/dashboard/actions/upload'
import type { UploadKind } from '@/lib/uploads'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

interface ImageUploadProps {
  kind: UploadKind
  value?: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ kind, value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)

  const isAvatar = kind === 'avatar'
  const previewW = isAvatar ? 80 : 240
  const previewH = isAvatar ? 80 : 80

  async function handleFile(file: File) {
    setErrorMsg(null)

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File must be an image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('Image must be under 5 MB.')
      return
    }

    const ext = EXT_MAP[file.type] ?? 'jpg'
    setStatus('uploading')

    const result = await requestUploadUrl(kind, file.type, ext)
    if (!result.ok) {
      setStatus('error')
      setErrorMsg(result.error)
      return
    }

    try {
      const res = await fetch(result.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!res.ok) throw new Error(`PUT failed: ${res.status}`)
    } catch {
      setStatus('error')
      setErrorMsg('Upload failed. Please try again.')
      return
    }

    setPreview(URL.createObjectURL(file))
    onChange(result.publicUrl)
    setStatus('idle')
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isAvatar ? 'row' : 'column',
    gap: 12,
    alignItems: isAvatar ? 'center' : 'flex-start',
  }

  const dropzoneStyle: React.CSSProperties = {
    position: 'relative',
    width: previewW,
    height: previewH,
    borderRadius: isAvatar ? 9999 : 8,
    border: '1px dashed var(--hairline)',
    background: 'var(--surface-tint)',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    aspectRatio: isAvatar ? '1 / 1' : '3 / 1',
  }

  if (!isAvatar) {
    dropzoneStyle.width = '100%'
    dropzoneStyle.maxWidth = 360,
    dropzoneStyle.height = 'auto'
  }

  return (
    <div style={containerStyle}>
      <div
        style={dropzoneStyle}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        aria-label={label ?? `Upload ${kind}`}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {preview ? (
          <Image
            src={preview}
            alt={label ?? kind}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-4)',
            }}
          >
            {isAvatar ? 'Photo' : 'Banner'}
          </div>
        )}

        {status === 'uploading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(26,24,19,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#fff',
            }}
          >
            Uploading…
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '5px 12px',
            borderRadius: 4,
            border: '1px solid var(--hairline)',
            background: 'var(--surface)',
            color: 'var(--ink-3)',
            cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
          }}
        >
          {preview ? 'Replace' : 'Upload'}
        </button>

        {errorMsg && (
          <p
            style={{
              marginTop: 6,
              fontSize: 11,
              color: 'var(--r)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {errorMsg}
          </p>
        )}

        <p
          style={{
            marginTop: 4,
            fontSize: 10,
            color: 'var(--ink-4)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          JPG, PNG, WebP or GIF — max 5 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
    </div>
  )
}
