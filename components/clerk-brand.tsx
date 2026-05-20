'use client'

// Clerk v7 ships Appearance as `any` in @clerk/shared — we use the inferred
// type from SignInProps instead. This file is 'use client' only because the
// Wordmark is also exported and used in client pages.

export const clerkBrandAppearance = {
  variables: {
    colorBackground: '#F5F1E8',
    colorPrimary: '#1A1813',
    colorText: '#1A1813',
    colorTextSecondary: '#8C8675',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#1A1813',
    fontFamily: '"Geist", system-ui, sans-serif',
    fontFamilyButtons: '"Geist Mono", monospace',
    borderRadius: '6px',
  },
  elements: {
    card: {
      border: '1px solid #E3DCC9',
      boxShadow: 'none',
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
    },
    headerTitle: {
      fontFamily: '"Newsreader", Georgia, serif',
      fontStyle: 'italic',
      fontWeight: '400',
      fontSize: '28px',
      letterSpacing: '-0.02em',
    },
    headerSubtitle: {
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#8C8675',
      fontSize: '14px',
    },
    // Magic-link only — social buttons and divider are hidden via appearance.
    // Disable social OAuth connections in the Clerk dashboard to complete this.
    socialButtonsRoot: { display: 'none' },
    dividerRow: { display: 'none' },
    formButtonPrimary: {
      backgroundColor: '#1A1813',
      color: '#F5F1E8',
      fontFamily: '"Geist Mono", monospace',
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      borderRadius: '6px',
      boxShadow: 'none',
    },
    formFieldInput: {
      border: '1px solid #E3DCC9',
      borderRadius: '6px',
      fontFamily: '"Geist", system-ui, sans-serif',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
    },
    formFieldLabel: {
      fontFamily: '"Geist Mono", monospace',
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#1A1813',
    },
    footerAction: {
      fontFamily: '"Geist", system-ui, sans-serif',
      fontSize: '13px',
    },
  },
} as const

export function Wordmark() {
  return (
    <a
      href="/"
      style={{
        fontFamily: '"Newsreader", Georgia, serif',
        fontSize: 22,
        letterSpacing: '-0.02em',
        textDecoration: 'none',
        color: '#1A1813',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      Mana
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          background: '#D4C68E',
          borderRadius: '50%',
          margin: '0 1px',
        }}
      />
      <em style={{ fontStyle: 'italic' }}>Map</em>
    </a>
  )
}
