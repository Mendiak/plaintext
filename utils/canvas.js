import { vibeStyles } from './styles.js';

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
   BACKGROUND & TEXTURE
──────────────────────────────────────────────────────────────── */

function drawTypographicBg(ctx, w, h, colors, text, fontFamily, vibe) {
  ctx.save();

  const letters = [...text].filter(c => /\p{L}/u.test(c)).map(c => c.toUpperCase());
  if (!letters.length) { ctx.restore(); return; }

  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const fillColor = style.accentColor;

  for (let i = 0; i < 2; i++) {
    ctx.save();

    const char = letters[i % letters.length];
    const x = w * (0.15 + Math.random() * 0.7);
    const y = h * (0.15 + Math.random() * 0.7);
    const size = w * (0.65 + Math.random() * 0.30);
    const rotation = (Math.random() - 0.5) * Math.PI * 0.6;

    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.font = `bold ${size}px ${fontFamily}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.03 + Math.random() * 0.04;
    ctx.fillText(char, 0, 0);

    ctx.restore();
  }

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

function drawBackground(ctx, w, h, colors) {
  const aspect = w / h;
  const isPortrait = aspect < 0.9;
  const isSquare = aspect >= 0.9 && aspect <= 1.1;
  const grad = isPortrait
    ? ctx.createLinearGradient(0, 0, 0, h)
    : isSquare
    ? ctx.createLinearGradient(0, 0, w, h)
    : ctx.createLinearGradient(0, 0, w * 0.6, h);
    
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
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

  // Grid split: 28% | 2% gutter | 70%
  // On mobile portrait, we reduce the offset effect to give more room to text
  const colLeft  = w * (usePortrait ? 0.15 : useSquare ? 0.22 : 0.28);
  const colRight = w * (usePortrait ? 0.20 : useSquare ? 0.26 : 0.32);
  const padY     = h * 0.15;
  const maxRightW = w - colRight - w * 0.08;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  // ── vertical line separating columns
  ctx.beginPath();
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.1;
  ctx.moveTo(colLeft + w * 0.01, padY);
  ctx.lineTo(colLeft + w * 0.01, h - padY);
  ctx.stroke();
  ctx.globalAlpha = 1;


  // ── quote on the right column
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

/**
 * Technical folio metadata in the bottom-left.
 * Includes URL as part of the technical information.
 */
function drawFolio(ctx, w, h, font, vibe, res, inkColor) {
  const size = Math.round(Math.max(w, h) * 0.007);
  const pad = Math.max(w, h) * 0.024;
  
  ctx.save();
  ctx.font = `300 ${size}px 'DM Mono', monospace`;
  ctx.fillStyle = inkColor || '#000000';
  ctx.globalAlpha = 0.4;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  const label = `TYPE: ${font.label.toUpperCase()} / VIBE: ${vibe.toUpperCase()} / RES: ${res.width}×${res.height} / MENDIAK.GITHUB.IO/PLAINTEXT v1.2`;
  ctx.fillText(label, pad, h - pad);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   WATERMARK
──────────────────────────────────────────────────────────────── */

const WATERMARK_PATH = new Path2D(
  "M31.999 2c-16.568 0-30 13.432-30 30s13.432 30 30 30C48.568 62 62 48.568 62 32S48.568 2 31.999 2" +
  "m9.398 31.949c-1.699 1.418-4.125 2.125-7.277 2.125h-6.041v10.434h-6.023V17.492h12.458" +
  "c2.872 0 5.162.748 6.87 2.244c1.707 1.496 2.562 3.813 2.562 6.949c-.001 3.424-.85 5.846-2.549 7.264"
);

/**
 * Draws watermark in bottom-right corner.
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
 * @param {string} bgStyle - 'classic' | 'typographic'
 */
export function renderWallpaper(quote, resolution, gradient, font, layout, inkColor = null, lang = 'en', bgStyle = 'classic') {
  const { width: w, height: h } = resolution;
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = w;
  canvas.height = h;

  // 1. Base color/gradient
  drawBackground(ctx, w, h, gradient);

  // 2. Pattern overlay (background texture)
  if (bgStyle === 'typographic') {
    const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;
    drawTypographicBg(ctx, w, h, gradient, text, font.family, quote.vibe);
  }

  // 3. Typographic composition
  if (layout === 'ruled')    layoutRuled(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else if (layout === 'offset') layoutOffset(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else                          layoutEditorial(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);

  // 4. Technical folio (metadata)
  drawFolio(ctx, w, h, font, quote.vibe, resolution, inkColor);

  // 5. Watermark (branding)
  drawWatermark(ctx, w, h, inkColor);
}