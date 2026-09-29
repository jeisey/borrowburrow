import { C, INK } from './palette'

/**
 * Document-wide SVG definitions: the hand-cut wobble, gouache grain and a few
 * fabric patterns. Rendered once, invisibly, at the root of the app.
 */
export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* Slightly imperfect, hand-cut edges. */}
        <filter id="bb-wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="bb-wobble-strong" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Gouache: flat colour with a whisper of brush grain. */}
        <filter id="bb-gouache" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" result="gg" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="gg" />
          </feMerge>
        </filter>
        {/* Soft warm glow for lamps and lanterns. */}
        <radialGradient id="bb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.lampHot} stopOpacity="0.95" />
          <stop offset="40%" stopColor={C.lamp} stopOpacity="0.55" />
          <stop offset="100%" stopColor={C.lamp} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bb-glow-cool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9e8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff9e8" stopOpacity="0" />
        </radialGradient>
        {/* Red gingham for the picnic blanket. */}
        <pattern id="bb-gingham" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={C.tomato} />
          <rect width="6" height="12" fill="#f6e7d8" opacity="0.55" />
          <rect width="12" height="6" fill="#f6e7d8" opacity="0.55" />
        </pattern>
        {/* Tartan for the thermos. */}
        <pattern id="bb-tartan" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#3f6f5a" />
          <rect x="0" y="5" width="16" height="4" fill="#2c4f40" />
          <rect x="5" y="0" width="4" height="16" fill="#2c4f40" opacity="0.8" />
          <rect x="0" y="12" width="16" height="1.3" fill="#c9543a" />
          <rect x="12" y="0" width="1.3" height="16" fill="#e8b63a" opacity="0.9" />
        </pattern>
        {/* Wicker weave. */}
        <pattern id="bb-wicker" width="10" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill="#c79a5c" />
          <path d="M0 2 Q2.5 0 5 2 T10 2" stroke="#9c7440" strokeWidth="1.2" fill="none" />
          <path d="M0 6 Q2.5 4 5 6 T10 6" stroke="#9c7440" strokeWidth="1.2" fill="none" />
        </pattern>
        {/* Wallpaper sprig for interiors. */}
        <pattern id="bb-sprig" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="1.6" fill={INK} opacity="0.12" />
          <path d="M19 21 q2 -4 5 -3" stroke={INK} strokeWidth="1" fill="none" opacity="0.12" />
        </pattern>
        {/* Pencil hatch for shade. */}
        <pattern id="bb-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1" opacity="0.18" />
        </pattern>
      </defs>
    </svg>
  )
}
