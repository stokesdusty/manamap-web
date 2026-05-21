import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Drop known browser noise that pollutes the issue tracker
  beforeSend(event) {
    const msg = event.exception?.values?.[0]?.value ?? ''
    if (
      msg.includes('ResizeObserver loop limit exceeded') ||
      msg.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return null
    }
    return event
  },
})
