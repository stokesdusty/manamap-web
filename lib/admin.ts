import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const user = await currentUser()
  if (!user) redirect('/')

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress
  if (!email || !adminEmails.includes(email)) redirect('/')

  return user
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  return adminEmails.includes(email)
}
