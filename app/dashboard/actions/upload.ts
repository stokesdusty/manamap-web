'use server'

import { auth } from '@clerk/nextjs/server'
import { presignUpload, type UploadKind } from '@/lib/uploads'

export async function requestUploadUrl(
  kind: UploadKind,
  contentType: string,
  ext: string
): Promise<{ ok: true; uploadUrl: string; publicUrl: string } | { ok: false; error: string }> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Not authenticated' }

  try {
    const result = await presignUpload({ kind, userId, contentType, ext })
    return { ok: true, ...result }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Upload error' }
  }
}
