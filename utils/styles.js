/**
 * Google Fonts available in this app.
 * Each font has a display name, import name, CSS family string, and character style.
 * `category` drives the grouped typeface menu (serif · sans · mono).
 */
export const FONTS = [
  /* ── Serif ─────────────────────────────────────────── */
  {
    id: 'cormorant',
    label: 'Cormorant Garamond',
    family: "'Cormorant Garamond', Georgia, serif",
    weight: '300',
    style: 'serif, classical',
    category: 'serif',
    leading: 1.25,
    tracking: 0.01
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    weight: '400',
    style: 'serif, editorial',
    category: 'serif',
    leading: 1.2,
    tracking: -0.01
  },
  {
    id: 'dm-serif',
    label: 'DM Serif Display',
    family: "'DM Serif Display', Georgia, serif",
    weight: '400',
    style: 'serif, modern',
    category: 'serif',
    leading: 1.15,
    tracking: -0.02
  },
  {
    id: 'libre-caslon',
    label: 'Libre Caslon Display',
    family: "'Libre Caslon Display', Georgia, serif",
    weight: '400',
    style: 'serif, old-style',
    category: 'serif',
    leading: 1.3,
    tracking: 0.02
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: "'Fraunces', Georgia, serif",
    weight: '100',
    style: 'serif, expressive',
    category: 'serif',
    leading: 1.1,
    tracking: -0.03
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    family: "'Instrument Serif', Georgia, serif",
    weight: '400',
    style: 'serif, refined',
    category: 'serif',
    leading: 1.18,
    tracking: 0
  },
  {
    id: 'newsreader',
    label: 'Newsreader',
    family: "'Newsreader', Georgia, serif",
    weight: '300',
    style: 'serif, editorial',
    category: 'serif',
    leading: 1.22,
    tracking: -0.01
  },
  {
    id: 'bodoni-moda',
    label: 'Bodoni Moda',
    family: "'Bodoni Moda', Georgia, serif",
    weight: '400',
    style: 'serif, didone',
    category: 'serif',
    leading: 1.12,
    tracking: -0.02
  },

  /* ── Sans ──────────────────────────────────────────── */
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: "'Space Grotesk', Helvetica, sans-serif",
    weight: '300',
    style: 'sans-serif, technical',
    category: 'sans',
    leading: 1.4,
    tracking: 0.03
  },
  {
    id: 'archivo',
    label: 'Archivo',
    family: "'Archivo', Helvetica, sans-serif",
    weight: '500',
    style: 'sans-serif, swiss',
    category: 'sans',
    leading: 1.08,
    tracking: -0.03
  },
  {
    id: 'archivo-narrow',
    label: 'Archivo Narrow',
    family: "'Archivo Narrow', Helvetica, sans-serif",
    weight: '500',
    style: 'sans-serif, condensed',
    category: 'sans',
    leading: 1.05,
    tracking: -0.02
  },
  {
    id: 'instrument-sans',
    label: 'Instrument Sans',
    family: "'Instrument Sans', Helvetica, sans-serif",
    weight: '500',
    style: 'sans-serif, neo-grotesque',
    category: 'sans',
    leading: 1.15,
    tracking: -0.02
  },
  {
    id: 'syne',
    label: 'Syne',
    family: "'Syne', Helvetica, sans-serif",
    weight: '700',
    style: 'sans-serif, geometric',
    category: 'sans',
    leading: 1.05,
    tracking: -0.05
  },
  {
    id: 'outfit',
    label: 'Outfit',
    family: "'Outfit', Helvetica, sans-serif",
    weight: '200',
    style: 'sans-serif, clean',
    category: 'sans',
    leading: 1.2,
    tracking: 0.02
  },

  /* ── Mono ──────────────────────────────────────────── */
  {
    id: 'dm-mono',
    label: 'DM Mono',
    family: "'DM Mono', 'Courier New', monospace",
    weight: '300',
    style: 'monospace, technical',
    category: 'mono',
    leading: 1.4,
    tracking: 0.02
  },
  {
    id: 'geist-mono',
    label: 'Geist Mono',
    family: "'Geist Mono', ui-monospace, monospace",
    weight: '400',
    style: 'monospace, neutral',
    category: 'mono',
    leading: 1.35,
    tracking: 0.01
  }
];

/** Display labels for the grouped typeface menu. */
export const FONT_CATEGORY_LABELS = {
  serif: 'Serif',
  sans: 'Sans',
  mono: 'Mono'
};

export const FONT_FAMILIES = FONTS.map(f => `${f.label.replace(/ /g, '+')}:wght@${f.weight}`).join('&family=');

/**
 * Vibe → visual style mapping.
 */
export const vibeStyles = {
  calm: {
    textColor: '#1a1714',
    accentColor: '#8a7f72',
    lineColor: '#1a1714'
  },

  chaotic: {
    textColor: '#f0ebe4',
    accentColor: '#ff6b35',
    lineColor: '#ff6b35'
  },

  serious: {
    textColor: '#f4f1ec',
    accentColor: '#888882',
    lineColor: '#f4f1ec'
  }
};

/**
 * Concrete gradient palettes. One option = one exact gradient, so the
 * swatch, the canvas and the exported PNG always agree.
 * Each pair is tone-coherent, keeping a single ink colour readable.
 */
export const GRADIENTS = {
  paper:  ['#f7f1e6', '#e2d3bd'],
  sky:    ['#e2effc', '#b8d4ec'],
  mint:   ['#e1f8ee', '#b0e0c7'],
  blush:  ['#ffe7ea', '#f5c3cc'],
  sand:   ['#f6eeda', '#ddc7a1'],
  stone:  ['#edebe6', '#c9c5ba'],
  night:  ['#33405a', '#0b0f17'],
  forest: ['#2f5241', '#0d1b14']
};

export const GRADIENT_OPTIONS = ['auto', ...Object.keys(GRADIENTS)];

/** "Auto" follows the quote's vibe and resolves to one concrete palette. */
export const AUTO_GRADIENT_BY_VIBE = {
  calm: 'paper',
  serious: 'stone',
  chaotic: 'night'
};

export const PATTERNS = ['none', 'typographic', 'grid', 'dots', 'diagonal', 'halftone'];

/**
 * Swiss-design canvas layouts.
 * Each layout is a named composition strategy.
 */
export const LAYOUTS = ['editorial', 'ruled', 'offset'];

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

/**
 * Resolves a gradient option to its concrete palette key.
 * @param {string} option
 * @param {string} vibe
 */
export function resolveGradientKey(option = 'auto', vibe = 'calm') {
  if (option === 'auto') return AUTO_GRADIENT_BY_VIBE[vibe] || 'paper';
  return GRADIENTS[option] ? option : 'paper';
}

/**
 * Resolves a gradient option to its concrete palette. No hidden variants:
 * a swatch always renders exactly what the canvas will use.
 * @param {string} option - 'auto' | 'paper' | 'sky' | 'mint' | 'blush' | 'sand' | 'stone' | 'night' | 'forest'
 * @param {string} vibe
 * @returns {string[]}
 */
export function getGradient(option = 'auto', vibe = 'calm') {
  return GRADIENTS[resolveGradientKey(option, vibe)];
}

/**
 * CSS preview for a concrete gradient swatch.
 * @param {string} option
 */
export function getGradientPreview(option) {
  const [a, b] = getGradient(option);
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/**
 * CSS preview for a recomposed gradient (same palette, new angle/stops).
 * Mirrors drawBackground() so the swatch matches the canvas.
 * @param {string[]} colors
 * @param {{ angle: number, stops: number[] }} variant
 */
export function getGradientVariantPreview(colors, variant) {
  const [a, b] = colors;
  const [s0, s1] = variant.stops;
  const p0 = Math.round(s0 * 100);
  const p1 = Math.round(s1 * 100);
  return `linear-gradient(${variant.angle}deg, ${a} ${p0}%, ${b} ${p1}%)`;
}

/** Stable symbol for the "Auto" mode: it follows the vibe by design. */
export const AUTO_GRADIENT_PREVIEW =
  'conic-gradient(from 135deg, #f5f0eb, #1d2433, #e7e5e0, #f5f0eb)';

/**
 * True when every stop of a gradient is dark, so light ink is needed.
 * Palettes are tone-coherent by design (see GRADIENT_FAMILIES).
 * @param {string[]} colors
 */
export function isDarkGradient(colors) {
  if (!Array.isArray(colors) || !colors.length) return false;
  return colors.every(c => checkIsDark(c));
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
