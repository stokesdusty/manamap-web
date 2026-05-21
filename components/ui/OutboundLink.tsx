'use client'

import { usePostHog } from 'posthog-js/react'

interface OutboundLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  label?: string
}

export function OutboundLink({ href, label, children, onClick, ...rest }: OutboundLinkProps) {
  const posthog = usePostHog()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    posthog.capture('outbound_click', { url: href, label: label ?? href })
    onClick?.(e)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}
