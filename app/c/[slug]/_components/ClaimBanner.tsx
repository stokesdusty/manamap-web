import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

interface Props {
  creatorUserId: number | null
  displayName: string
  slug: string
}

export async function ClaimBanner({ creatorUserId, displayName, slug }: Props) {
  const { userId: clerkId } = await auth()

  // No viewer signed in — no banner
  if (!clerkId) return null

  // If the creator is already linked to a user, check if the viewer is that owner
  if (creatorUserId !== null) {
    const viewer = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true },
    })
    // Viewer IS the owner — show an "unpublished preview" notice instead
    if (viewer?.id === creatorUserId) {
      return (
        <div
          role="status"
          style={{
            background: '#fffbeb',
            borderBottom: '1px solid #f6e05e',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#744210',
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Draft
          </span>
          <span>
            This profile is not yet published. Go to your{' '}
            <a
              href="/dashboard/profile"
              style={{ color: '#744210', textDecoration: 'underline' }}
            >
              dashboard
            </a>{' '}
            to publish it.
          </span>
        </div>
      )
    }
    // Someone else owns it — don't show claim banner (already claimed)
    return null
  }

  // Profile has no owner yet — show claim banner to any signed-in user
  return (
    <div
      role="status"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--hairline)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-4)',
          padding: '2px 8px',
          border: '1px solid var(--hairline)',
          borderRadius: 3,
          flexShrink: 0,
        }}
      >
        Unclaimed
      </div>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--ink-3)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        This profile was created by ManaMap staff.{' '}
        <strong style={{ color: 'var(--ink)' }}>Are you {displayName}?</strong>
      </p>
      <a
        href={`/dashboard/profile?claim=${slug}`}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          padding: '6px 16px',
          borderRadius: 999,
          background: 'var(--ink)',
          color: 'var(--paper)',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        Claim this profile
      </a>
    </div>
  )
}
