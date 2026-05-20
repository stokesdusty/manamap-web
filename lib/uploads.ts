import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

const UPLOAD_KINDS = ['avatar', 'banner', 'featured'] as const
export type UploadKind = (typeof UPLOAD_KINDS)[number]

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function getClient() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured')
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export async function presignUpload({
  kind,
  userId,
  ext = 'jpg',
  contentType = 'image/jpeg',
}: {
  kind: UploadKind
  userId: string | number
  ext?: string
  contentType?: string
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!(UPLOAD_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`Invalid upload kind: ${kind}`)
  }
  if (!ALLOWED_MIME.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`)
  }

  const bucket = process.env.R2_BUCKET
  const baseUrl = process.env.R2_PUBLIC_BASE_URL
  if (!bucket || !baseUrl) {
    throw new Error('R2_BUCKET or R2_PUBLIC_BASE_URL not configured')
  }

  const key = `${kind}/${userId}/${nanoid()}.${ext}`
  const client = getClient()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 })
  const publicUrl = `${baseUrl.replace(/\/$/, '')}/${key}`

  return { uploadUrl, publicUrl }
}
