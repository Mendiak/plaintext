/**
 * Google Fonts available in this app.
 * Each font has a display name, import name, CSS family string, and character style.
 */
export const FONTS = [
  {
    id: 'cormorant',
    label: 'Cormorant Garamond',
    family: "'Cormorant Garamond', Georgia, serif",
    weight: '300',
    style: 'serif, classical'
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    weight: '400',
    style: 'serif, editorial'
  },
  {
    id: 'dm-serif',
    label: 'DM Serif Display',
    family: "'DM Serif Display', Georgia, serif",
    weight: '400',
    style: 'serif, modern'
  },
  {
    id: 'libre-caslon',
    label: 'Libre Caslon Display',
    family: "'Libre Caslon Display', Georgia, serif",
    weight: '400',
    style: 'serif, old-style'
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: "'Space Grotesk', Helvetica, sans-serif",
    weight: '300',
    style: 'sans-serif, technical'
  },
  {
    id: 'syne',
    label: 'Syne',
    family: "'Syne', Helvetica, sans-serif",
    weight: '700',
    style: 'sans-serif, geometric'
  },
  {
    id: 'outfit',
    label: 'Outfit',
    family: "'Outfit', Helvetica, sans-serif",
    weight: '200',
    style: 'sans-serif, clean'
  },
  {
    id: 'dm-mono',
    label: 'DM Mono',
    family: "'DM Mono', 'Courier New', monospace",
    weight: '300',
    style: 'monospace, technical'
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: "'Fraunces', Georgia, serif",
    weight: '100',
    style: 'serif, expressive'
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    family: "'Instrument Serif', Georgia, serif",
    weight: '400',
    style: 'serif, refined'
  }
];

/**
 * Vibe → visual style mapping.
 */
export const vibeStyles = {
  calm: {
    gradients: [
      ['#f5f0eb', '#e8dfd4'],
      ['#eef2f7', '#dce8f5'],
      ['#f0f4f0', '#dde8dd'],
      ['#f7f3ee', '#ede3d8'],
      ['#f2f0f7', '#e2dcf0']
    ],
    textColor: '#1a1714',
    accentColor: '#8a7f72',
    lineColor: '#1a1714'
  },

  chaotic: {
    gradients: [
      ['#1a0a00', '#3d1200'],
      ['#0d0d1a', '#1a0d33'],
      ['#001a0d', '#00330d'],
      ['#1a001a', '#330033'],
      ['#0a0a0a', '#1f1f1f']
    ],
    textColor: '#f0ebe4',
    accentColor: '#ff6b35',
    lineColor: '#ff6b35'
  },

  serious: {
    gradients: [
      ['#0f0f0f', '#1e1e1e'],
      ['#111116', '#1c1c28'],
      ['#0c0c0e', '#18181f'],
      ['#0a0a0a', '#161616'],
      ['#111111', '#222222']
    ],
    textColor: '#f4f1ec',
    accentColor: '#888882',
    lineColor: '#f4f1ec'
  }
};

/**
 * Swiss-design canvas layouts.
 * Each layout is a named composition strategy.
 */
export const LAYOUTS = ['editorial', 'ruled', 'offset'];

export const VIBRANT_GRADIENTS = [
  ['#ff9a9e', '#fecfef'],
  ['#a1c4fd', '#c2e9fb'],
  ['#84fab0', '#8fd3f4'],
  ['#cfd9df', '#e2ebf0'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140']
];

export const PAPER_COLORS = {
  auto: null,
  white: ['#ffffff', '#fdfdfd'],
  cream: ['#f5f2e9', '#ebe7db'],
  ivory: ['#fafaf0', '#f0f0e6'],
  sand: ['#f4f1e8', '#e8e4d8'],
  clay:  ['#dcd0c0', '#c0b299'],
  slate: ['#708090', '#5a6c7d'],
  charcoal: ['#36454f', '#2c3e50'],
  black: ['#0a0a0a', '#050505']
};

export const INK_COLORS = {
  auto:  null,
  dark:  '#1a1916',
  light: '#f4f1ec',
  muted: '#8a8882',
  deep:  '#000000'
};

export function getGradient(vibe, intensity = 'subtle', paperOverride = 'auto') {
  if (paperOverride !== 'auto' && PAPER_COLORS[paperOverride]) {
    return PAPER_COLORS[paperOverride];
  }
  if (intensity === 'vibrant') {
    return VIBRANT_GRADIENTS[Math.floor(Math.random() * VIBRANT_GRADIENTS.length)];
  }
  // If paperOverride is a vibe name, use that vibe
  const targetVibe = ['calm', 'chaotic', 'serious'].includes(paperOverride) ? paperOverride : vibe;
  const style = vibeStyles[targetVibe] ?? vibeStyles.calm;
  const gradients = style.gradients;
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Simple brightness check (YIQ)
 */
export function checkIsDark(hex) {
  if (!hex || hex.length < 6) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128; // returns true if background is dark
}

export function getLayout() {
  return LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
}
