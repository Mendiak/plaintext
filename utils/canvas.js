import { vibeStyles } from './styles.js';
import { hashString, mulberry32 } from './random.js';

/* ─────────────────────────────────────────────────────────────
   TEXT UTILITIES
──────────────────────────────────────────────────────────────── */

/**
 * Wraps text to fit maxWidth, returning an array of line strings.
 * Includes widow prevention: if the last line would be a single word, 
 * it pulls a word from the previous line to balance it.
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // Widow prevention: if last line is one word and we have more than one line
  if (lines.length > 1 && lines[lines.length - 1].split(' ').length === 1) {
    const lastLine = lines.pop();
    const prevLine = lines.pop();
    const prevWords = prevLine.split(' ');
    if (prevWords.length > 1) {
      const movedWord = prevWords.pop();
      lines.push(prevWords.join(' '));
      lines.push(`${movedWord} ${lastLine}`);
    } else {
      // Put them back if we can't balance
      lines.push(prevLine);
      lines.push(lastLine);
    }
  }

  return lines;
}

/**
 * Finds the optimal font size so quote fits within maxLines lines AND maxHeight.
 */
function fitFontSize(ctx, text, maxWidth, maxLines, maxHeight, startSize, minSize, fontString, leading = 1.25) {
  let size = startSize;
  const buildFont = (s) => fontString.replace('__SIZE__', `${s}px`);
  
  const checkConstraints = (s) => {
    ctx.font = buildFont(s);
    const lines = wrapText(ctx, text, maxWidth);
    const height = lines.length * s * leading;
    return { lines, height, ok: lines.length <= maxLines && height <= maxHeight };
  };

  let result = checkConstraints(size);
  
  while (!result.ok && size > minSize) {
    size -= 2;
    result = checkConstraints(size);
  }
  
  return { lines: result.lines, size };
}

/**
 * Applies a very subtle "ink-bleed" effect by adding a tiny blur and shadow.
 */
function applyInkBleed(ctx, color) {
  ctx.shadowColor = color;
  ctx.shadowBlur = 0.5;
  ctx.shadowOffsetX = 0.1;
  ctx.shadowOffsetY = 0.1;
}

/**
 * Clears ink-bleed effect.
 */
function clearInkBleed(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/* ─────────────────────────────────────────────────────────────
   PATTERN OVERLAYS
   Deterministic per quote/style: resizing or re-rendering the same
   wallpaper never reshuffles the composition.
──────────────────────────────────────────────────────────────── */

function drawTypographicBg(ctx, w, h, { text, fontFamily, color, rand }) {
  const letters = [...text].filter(c => /\p{L}/u.test(c)).map(c => c.toUpperCase());
  if (!letters.length) return;

  for (let i = 0; i < 3; i++) {
    ctx.save();

    const char = letters[Math.floor(rand() * letters.length)];
    const x = w * (0.1 + rand() * 0.8);
    const y = h * (0.1 + rand() * 0.8);
    const size = w * (0.55 + rand() * 0.5);
    const rotation = (rand() - 0.5) * Math.PI * 0.6;

    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.font = `bold ${size}px ${fontFamily}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.045 + rand() * 0.045;
    ctx.fillText(char, 0, 0);

    ctx.restore();
  }
}

function drawGridBg(ctx, w, h, { color, rand }) {
  const step = w / (9 + Math.floor(rand() * 4));
  const lineWidth = Math.max(1, w * 0.0012);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = 0.06;

  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawDotsBg(ctx, w, h, { color, rand }) {
  const step = w / (20 + Math.floor(rand() * 8));
  const radius = Math.max(1.1, w * 0.0026);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;

  for (let x = step / 2; x < w; x += step) {
    for (let y = step / 2; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawDiagonalBg(ctx, w, h, { color, rand }) {
  const step = w / (13 + Math.floor(rand() * 5));
  const reach = Math.hypot(w, h);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.translate(-w / 2, -h / 2);

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, w * 0.0014);
  ctx.globalAlpha = 0.055;

  for (let x = -reach; x < reach * 2; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -reach);
    ctx.lineTo(x, reach * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHalftoneBg(ctx, w, h, { color, rand }) {
  const cols = 14 + Math.floor(rand() * 6);
  const step = w / cols;
  const base = step * 0.28;
  const phase = rand() * Math.PI * 2;
  const rows = Math.ceil(h / step);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;

  for (let ix = 0; ix <= cols; ix++) {
    for (let iy = 0; iy <= rows; iy++) {
      const wave = Math.sin((ix / cols) * Math.PI * 2 + phase) *
                   Math.cos((iy / rows) * Math.PI * 2 + phase);
      const radius = base * (0.25 + 0.75 * Math.abs(wave));
      ctx.beginPath();
      ctx.arc(ix * step, iy * step, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const PATTERN_RENDERERS = {
  typographic: drawTypographicBg,
  grid: drawGridBg,
  dots: drawDotsBg,
  diagonal: drawDiagonalBg,
  halftone: drawHalftoneBg
};

/**
 * Draws a deterministic pattern overlay on the current background.
 * @param {string} kind - 'typographic' | 'grid' | 'dots' | 'diagonal' | 'halftone'
 * @param {string} text - quote text (feeds the typographic pattern)
 * @param {string} fontFamily
 * @param {string} vibe
 * @param {string|null} inkColor - resolved quote ink, keeps the pattern readable
 * @param {string} seed
 */
function drawPattern(ctx, w, h, kind, text, fontFamily, vibe, inkColor, seed) {
  const renderer = PATTERN_RENDERERS[kind];
  if (!renderer) return;

  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const color = inkColor || style.accentColor;
  const rand = mulberry32(hashString(`${kind}|${seed}`));

  ctx.save();
  renderer(ctx, w, h, { color, text, fontFamily, rand });
  ctx.restore();
}

function drawGrain(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 0.015;
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = Math.random() * 1.5;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function drawBackground(ctx, w, h, colors, variant = null) {
  let grad;

  if (variant && Number.isFinite(variant.angle)) {
    // Explicit orientation + stop distribution (the Random action).
    // CSS angles: 0deg points up, 90deg points right; canvas y grows down.
    const angle = ((variant.angle % 360) + 360) % 360;
    const rad = (angle * Math.PI) / 180;
    const dirX = Math.sin(rad);
    const dirY = -Math.cos(rad);
    const length = Math.abs(w * dirX) + Math.abs(h * dirY);
    const cx = w / 2;
    const cy = h / 2;

    grad = ctx.createLinearGradient(
      cx - (dirX * length) / 2,
      cy - (dirY * length) / 2,
      cx + (dirX * length) / 2,
      cy + (dirY * length) / 2
    );

    const [s0, s1] = variant.stops || [0, 1];
    grad.addColorStop(Math.min(Math.max(s0, 0), 1), colors[0]);
    grad.addColorStop(Math.min(Math.max(s1, 0), 1), colors[1]);
  } else {
    // Default: orientation adapts to the canvas aspect ratio.
    const aspect = w / h;
    const isPortrait = aspect < 0.9;
    const isSquare = aspect >= 0.9 && aspect <= 1.1;
    grad = isPortrait
      ? ctx.createLinearGradient(0, 0, 0, h)
      : isSquare
      ? ctx.createLinearGradient(0, 0, w, h)
      : ctx.createLinearGradient(0, 0, w * 0.6, h);

    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Add subtle texture
  drawGrain(ctx, w, h);
}

/* ─────────────────────────────────────────────────────────────
   LAYOUT 1 — EDITORIAL
   Left-aligned editorial block. Large quote, thin rule, author below.
   Inspired by Swiss typographic posters (Müller-Brockmann).
──────────────────────────────────────────────────────────────── */

function layoutEditorial(ctx, quote, vibe, w, h, font, layout, inkColor, lang = 'en') {
  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const textColor = inkColor || style.textColor;
  const aspect = w / h;
  const usePortrait = aspect < 0.9;
  const useSquare = aspect >= 0.9 && aspect <= 1.1;
  const padX = w * (usePortrait ? 0.1 : 0.1);
  const maxW = w * (usePortrait ? 0.8 : useSquare ? 0.75 : 0.65);
  const startX = padX;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  // ── font size & metrics
  const baseSize = usePortrait ? Math.round(w * 0.08) : useSquare ? Math.round(w * 0.07) : Math.round(w * 0.055);
  const fontStr = `${font.weight} __SIZE__ ${font.family}`;
  const leading = font.leading || 1.25;
  const maxLines = usePortrait ? 8 : useSquare ? 6 : 5;
  const maxBlockH = h * (usePortrait ? 0.65 : useSquare ? 0.6 : 0.55);

  const { lines, size } = fitFontSize(ctx, text, maxW, maxLines, maxBlockH, baseSize, 22, fontStr, leading);
  const lh = size * leading;

  // ── vertical center block
  const authorH = Math.round(w * (usePortrait ? 0.025 : useSquare ? 0.022 : 0.018));
  const blockH = lines.length * lh + authorH * 3.5;
  const startY = (h - blockH) / 2;

  // ── quote text
  ctx.save();
  ctx.font = `${font.weight} ${size}px ${font.family}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = `${(font.tracking || 0) * size}px`;
  
  applyInkBleed(ctx, textColor);

  lines.forEach((line, i) => {
    let xOffset = startX;
    // Hanging punctuation: if line starts with opening quote, nudge it left
    if (line.startsWith('\u201C') || line.startsWith('"')) {
      xOffset -= ctx.measureText('\u201C').width * 0.45;
    }
    ctx.fillText(line, xOffset, startY + i * lh);
  });
  
  ctx.restore();

  // ── author
  ctx.save();
  const ruleY = startY + lines.length * lh + authorH;
  ctx.font = `${font.weight} ${Math.round(authorH)}px ${font.family}`;
  ctx.fillStyle = style.accentColor;
  ctx.globalAlpha = 0.8;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0.05em';
  ctx.fillText(quote.author.toUpperCase(), startX, ruleY + authorH * 0.6);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   LAYOUT 2 — RULED
   Centred text on a full-width ruled grid. Grid lines are visible
   but subtle — like manuscript paper. Author flushed right.
──────────────────────────────────────────────────────────────── */

function layoutRuled(ctx, quote, vibe, w, h, font, layout, inkColor, lang = 'en') {
  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const textColor = inkColor || style.textColor;
  const aspect = w / h;
  const usePortrait = aspect < 0.9;
  const useSquare = aspect >= 0.9 && aspect <= 1.1;
  const padX  = w * 0.1;
  const maxW  = w - padX * 2;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  const baseSize = usePortrait ? Math.round(w * 0.05) : useSquare ? Math.round(w * 0.042) : Math.round(w * 0.033);
  const fontStr  = `${font.weight} __SIZE__ ${font.family}`;
  const leading  = font.leading || 1.4;
  const maxLines = usePortrait ? 10 : useSquare ? 8 : 6;
  const maxBlockH = h * (usePortrait ? 0.7 : useSquare ? 0.65 : 0.6);

  const { lines, size } = fitFontSize(ctx, text, maxW, maxLines, maxBlockH, baseSize, 20, fontStr, leading);
  const lh = size * leading;

  // ── center the block
  const authorSize = Math.round(w * (usePortrait ? 0.022 : useSquare ? 0.018 : 0.015));
  const blockH  = lines.length * lh + authorSize * 3;
  const startY  = (h - blockH) / 2;

  // ── quote
  ctx.save();
  ctx.font = `${font.weight} ${size}px ${font.family}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = `${(font.tracking || 0) * size}px`;
  
  applyInkBleed(ctx, textColor);

  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * lh);
  });
  ctx.restore();

  // ── opening & closing quotation marks (large, decorative)
  ctx.save();
  ctx.font = `${font.weight} ${Math.round(size * 2.5)}px ${font.family}`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.08;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('\u201C', padX - size * 0.5, startY - size * 1.4);
  ctx.restore();

  // ── author (right-aligned)
  ctx.save();
  const authY = startY + lines.length * lh + authorSize * 1.2;
  ctx.font = `300 ${authorSize}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = style.accentColor;
  ctx.globalAlpha = 0.7;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = '0.02em';
  ctx.fillText(`\u2014 ${quote.author}`, w - padX, authY);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   LAYOUT 3 — OFFSET
   Bold typographic number / index on left, quote on right.
   Asymmetric grid. Very Swiss.
──────────────────────────────────────────────────────────────── */

function layoutOffset(ctx, quote, vibe, w, h, font, layout, inkColor, lang = 'en') {
  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const textColor = inkColor || style.textColor;
  const aspect = w / h;
  const usePortrait = aspect < 0.9;
  const useSquare = aspect >= 0.9 && aspect <= 1.1;

  // Offset grid: the quote sits in the right column, the left stays empty.
  // On mobile portrait, we reduce the offset effect to give more room to text
  const colRight = w * (usePortrait ? 0.20 : useSquare ? 0.26 : 0.32);
  const maxRightW = w - colRight - w * 0.08;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  // ── quote on the right column (no divider: patterns and grids
  // already provide structure, and a rule here made them collide)
  const baseSize = usePortrait ? Math.round(w * 0.06) : useSquare ? Math.round(w * 0.05) : Math.round(w * 0.038);
  const fontStr  = `${font.weight} __SIZE__ ${font.family}`;
  const leading  = font.leading || 1.35;
  const maxLines = usePortrait ? 12 : useSquare ? 9 : 7;
  const maxBlockH = h * (usePortrait ? 0.75 : useSquare ? 0.7 : 0.65);

  const { lines, size } = fitFontSize(ctx, text, maxRightW, maxLines, maxBlockH, baseSize, 18, fontStr, leading);
  const lh = size * leading;

  const authorSize = Math.round(w * (usePortrait ? 0.02 : useSquare ? 0.017 : 0.014));
  const blockH = lines.length * lh + authorSize * 3.5;
  const startY = (h - blockH) / 2;

  ctx.save();
  ctx.font = `${font.weight} ${size}px ${font.family}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = `${(font.tracking || 0) * size}px`;

  applyInkBleed(ctx, textColor);

  lines.forEach((line, i) => {
    ctx.fillText(line, colRight, startY + i * lh);
  });
  ctx.restore();

  // ── author
  ctx.save();
  const lblSize = Math.round(w * (usePortrait ? 0.016 : 0.011));
  ctx.font = `400 ${lblSize}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.75;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const authY = startY + lines.length * lh + authorSize;
  ctx.fillText(`\u2014 ${quote.author}`, colRight, authY);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   CREDIT (logo + URL, one in each corner)
──────────────────────────────────────────────────────────────── */

const WATERMARK_PATH = new Path2D(
  "M31.999 2c-16.568 0-30 13.432-30 30s13.432 30 30 30C48.568 62 62 48.568 62 32S48.568 2 31.999 2" +
  "m9.398 31.949c-1.699 1.418-4.125 2.125-7.277 2.125h-6.041v10.434h-6.023V17.492h12.458" +
  "c2.872 0 5.162.748 6.87 2.244c1.707 1.496 2.562 3.813 2.562 6.949c-.001 3.424-.85 5.846-2.549 7.264"
);

const CREDIT_URL = 'MENDIAK.GITHUB.IO/PLAINTEXT';

/**
 * Site URL in the bottom-left corner.
 */
function drawFolio(ctx, w, h, inkColor) {
  const longEdge = Math.max(w, h);
  const isCompact = longEdge < 1500;
  const size = Math.max(isCompact ? 18 : 12, Math.round(longEdge * 0.007));
  const pad = longEdge * 0.024;

  ctx.save();
  ctx.font = `300 ${size}px 'DM Mono', monospace`;
  ctx.fillStyle = inkColor || '#000000';
  ctx.globalAlpha = 0.4;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(CREDIT_URL, pad, h - pad);
  ctx.restore();
}

/**
 * Logo in the bottom-right corner.
 */
function drawWatermark(ctx, w, h, inkColor) {
  const size = Math.max(w, h) * 0.024;
  const padding = size * 0.5;

  ctx.save();
  ctx.translate(w - size - padding, h - size - padding);
  ctx.scale(size / 64, size / 64);
  ctx.fillStyle = inkColor || '#000000';
  ctx.globalAlpha = 0.4;
  ctx.fill(WATERMARK_PATH, 'evenodd');
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   MAIN RENDER
──────────────────────────────────────────────────────────────── */

/**
 * @param {{ text, author, vibe }} quote
 * @param {{ width, height }} resolution
 * @param {string[]} gradient
 * @param {object} font - Font object with family and weight
 * @param {string} layout - 'editorial' | 'ruled' | 'offset'
 * @param {string|null} inkColor - typography color override
 * @param {string} lang - 'en' | 'es'
 * @param {string} pattern - 'none' | 'typographic' | 'grid' | 'dots' | 'diagonal' | 'halftone'
 * @param {string} seed - stable seed for the pattern composition
 * @param {{ angle: number, stops: number[] }|null} gradientVariant - recomposed gradient
 */
export function renderWallpaper(quote, resolution, gradient, font, layout, inkColor = null, lang = 'en', pattern = 'none', seed = '', gradientVariant = null) {
  const { width: w, height: h } = resolution;
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = w;
  canvas.height = h;

  // 1. Base color/gradient
  drawBackground(ctx, w, h, gradient, gradientVariant);

  // 2. Pattern overlay (deterministic per quote + style)
  if (pattern && pattern !== 'none') {
    const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;
    const patternSeed = `${seed}|${quote.text || text}|${font.id}|${layout}`;
    drawPattern(ctx, w, h, pattern, text, font.family, quote.vibe, inkColor, patternSeed);
  }

  // 3. Typographic composition
  if (layout === 'ruled')    layoutRuled(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else if (layout === 'offset') layoutOffset(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else                          layoutEditorial(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);

  // 4. Credit: URL bottom-left, logo bottom-right
  drawFolio(ctx, w, h, inkColor);
  drawWatermark(ctx, w, h, inkColor);
}