// ============================================================
// FIGO — Premium Geometric Compass Logo SVG
// Minimal, no airplane/mountains/pin, rounded edges
// Works in light & dark mode
// ============================================================

interface FigoLogoProps {
  size?: number
  variant?: 'default' | 'light' | 'dark' | 'mono'
  showText?: boolean
  className?: string
}

export function FigoLogo({ size = 40, variant = 'default', showText = true, className = '' }: FigoLogoProps) {
  const primaryColor = variant === 'light' ? '#2F4156' : '#C8D9E6'
  const accentColor = variant === 'light' ? '#567C8D' : '#F5EFEB'
  const textColor = variant === 'light' ? '#2F4156' : '#F5EFEB'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FIGO compass logo"
      >
        {/* Outer ring */}
        <circle cx="40" cy="40" r="36" stroke={primaryColor} strokeWidth="2.5" fill="none" opacity="0.4" />

        {/* Inner ring */}
        <circle cx="40" cy="40" r="28" stroke={primaryColor} strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Center dot */}
        <circle cx="40" cy="40" r="4" fill={accentColor} />

        {/* Compass needle - North (pointing up) */}
        <path
          d="M40 40 L36 20 Q40 12 44 20 Z"
          fill={accentColor}
          rx="2"
        />

        {/* Compass needle - South (pointing down) */}
        <path
          d="M40 40 L44 60 Q40 68 36 60 Z"
          fill={primaryColor}
          opacity="0.7"
        />

        {/* Compass needle - East */}
        <path
          d="M40 40 L60 36 Q68 40 60 44 Z"
          fill={primaryColor}
          opacity="0.5"
        />

        {/* Compass needle - West */}
        <path
          d="M40 40 L20 44 Q12 40 20 36 Z"
          fill={primaryColor}
          opacity="0.5"
        />

        {/* Cardinal point marks */}
        <circle cx="40" cy="8" r="2.5" fill={accentColor} />
        <circle cx="40" cy="72" r="2" fill={primaryColor} opacity="0.6" />
        <circle cx="72" cy="40" r="2" fill={primaryColor} opacity="0.6" />
        <circle cx="8" cy="40" r="2" fill={primaryColor} opacity="0.6" />

        {/* Diagonal tick marks */}
        <line x1="63" y1="17" x2="60" y2="20" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        <line x1="17" y1="17" x2="20" y2="20" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        <line x1="63" y1="63" x2="60" y2="60" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        <line x1="17" y1="63" x2="20" y2="60" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.5,
            letterSpacing: '-0.02em',
            color: textColor,
            lineHeight: 1,
          }}
        >
          FIGO
        </span>
      )}
    </div>
  )
}

// Favicon SVG string for public/favicon.svg
export const FIGO_FAVICON_SVG = `<svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="18" fill="#2F4156"/>
  <circle cx="40" cy="40" r="28" stroke="#C8D9E6" stroke-width="2" fill="none" opacity="0.5"/>
  <circle cx="40" cy="40" r="4" fill="#F5EFEB"/>
  <path d="M40 40 L36 20 Q40 12 44 20 Z" fill="#C8D9E6"/>
  <path d="M40 40 L44 60 Q40 68 36 60 Z" fill="#C8D9E6" opacity="0.6"/>
  <path d="M40 40 L60 36 Q68 40 60 44 Z" fill="#C8D9E6" opacity="0.4"/>
  <path d="M40 40 L20 44 Q12 40 20 36 Z" fill="#C8D9E6" opacity="0.4"/>
  <circle cx="40" cy="8" r="3" fill="#F5EFEB"/>
</svg>`
