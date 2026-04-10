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
 * Finds the optimal font size so quote fits within maxLines lines.
 */
function fitFontSize(ctx, text, maxWidth, maxLines, startSize, minSize, fontString) {
  let size = startSize;
  const buildFont = (s) => fontString.replace('__SIZE__', `${s}px`);
  ctx.font = buildFont(size);
  let lines = wrapText(ctx, text, maxWidth);
  while (lines.length > maxLines && size > minSize) {
    size -= 2;
    ctx.font = buildFont(size);
    lines = wrapText(ctx, text, maxWidth);
  }
  return { lines, size };
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

function drawBackground(ctx, w, h, colors) {
  const grad = ctx.createLinearGradient(0, 0, w * 0.6, h);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Adds high-frequency grain to simulate paper texture.
 */
function drawPaperTexture(ctx, w, h) {
  const buffer = document.createElement('canvas');
  buffer.width = 256;
  buffer.height = 256;
  const bCtx = buffer.getContext('2d');
  const imgData = bCtx.createImageData(256, 256);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const val = Math.random() * 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 15; // very low opacity
  }
  bCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const pattern = ctx.createPattern(buffer, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   LAYOUT 1 — EDITORIAL
   Left-aligned editorial block. Large quote, thin rule, author below.
   Inspired by Swiss typographic posters (Müller-Brockmann).
──────────────────────────────────────────────────────────────── */

function layoutEditorial(ctx, quote, vibe, w, h, font, layout, inkColor, lang = 'en') {
  const style = vibeStyles[vibe] ?? vibeStyles.calm;
  const textColor = inkColor || style.textColor;
  const padX = w * 0.12; // slightly more breathing room
  const maxW = w * 0.65;
  const startX = padX;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  // ── font size & metrics
  const baseSize = Math.round(w * 0.055);
  const fontStr = `${font.weight} __SIZE__ ${font.family}`;
  const { lines, size } = fitFontSize(ctx, text, maxW, 5, baseSize, 22, fontStr);
  const lh = size * (font.leading || 1.25);

  // ── vertical center block
  const authorH = Math.round(w * 0.018);
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
  const padX  = w * 0.1;
  const maxW  = w - padX * 2;

  const text = quote[lang === 'es' ? 'text_es' : 'text'] || quote.text;

  const baseSize = Math.round(w * 0.033);
  const fontStr  = `${font.weight} __SIZE__ ${font.family}`;
  const { lines, size } = fitFontSize(ctx, text, maxW, 6, baseSize, 20, fontStr);
  const lh = size * (font.leading || 1.4);

  // ── center the block
  const authorSize = Math.round(w * 0.015);
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

  // Grid split: 28% | 2% gutter | 70%
  const colLeft  = w * 0.28;
  const colRight = w * 0.32;
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
  const baseSize = Math.round(w * 0.038);
  const fontStr  = `${font.weight} __SIZE__ ${font.family}`;
  const { lines, size } = fitFontSize(ctx, text, maxRightW, 7, baseSize, 18, fontStr);
  const lh = size * (font.leading || 1.35);

  const authorSize = Math.round(w * 0.014);
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
  const lblSize = Math.round(w * 0.011);
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
  
  const label = `TYPE: ${font.label.toUpperCase()} / VIBE: ${vibe.toUpperCase()} / RES: ${res.width}×${res.height} / MENDIAK.GITHUB.IO/PLAINTEXT v1.1`;
  ctx.fillText(label, pad, h - pad);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   WATERMARK
──────────────────────────────────────────────────────────────── */

const WATERMARK_PATHS = [
  "M33.543 22.531h-5.464v8.543h5.464c1.384 0 2.46-.348 3.228-1.043s1.151-1.797 1.151-3.307s-.384-2.586-1.151-3.229s-1.844-.964-3.228-.964",
  "M31.999 2c-16.568 0-30 13.432-30 30s13.432 30 30 30C48.568 62 62 48.568 62 32S48.568 2 31.999 2m9.398 31.949c-1.699 1.418-4.125 2.125-7.277 2.125h-6.041v10.434h-6.023V17.492h12.458c2.872 0 5.162.748 6.87 2.244c1.707 1.496 2.562 3.813 2.562 6.949c-.001 3.424-.85 5.846-2.549 7.264"
];

// Initialize Path2D objects for direct vector rendering
const watermarkPaths = WATERMARK_PATHS.map(d => new Path2D(d));

/**
 * Draws watermark in bottom-right corner using native Path2D for maximum sharpness.
 * URL text removed from here as it's now in the folio.
 */
function drawWatermark(ctx, w, h, inkColor) {
  const size = Math.max(w, h) * 0.024;
  const padding = size * 0.5;

  // Draw logo at bottom-right
  const x = w - size - padding;
  const y = h - size - padding;

  ctx.save();
  
  // Transform context to target position and scale (original SVG is 64x64)
  ctx.translate(x, y);
  const scale = size / 64;
  ctx.scale(scale, scale);
  
  // Apply ink color and subtle transparency
  ctx.fillStyle = inkColor || '#000000';
  ctx.globalAlpha = 0.3;
  
  // Fill paths directly on the main canvas (vector rendering)
  watermarkPaths.forEach(path => ctx.fill(path));
  
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
 */
export function renderWallpaper(quote, resolution, gradient, font, layout, inkColor = null, lang = 'en') {
  const { width: w, height: h } = resolution;
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = w;
  canvas.height = h;

  // 1. Base color/gradient
  drawBackground(ctx, w, h, gradient);
  
  // 2. Paper grain texture
  drawPaperTexture(ctx, w, h);

  // 3. Typographic composition
  if (layout === 'ruled')    layoutRuled(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else if (layout === 'offset') layoutOffset(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);
  else                          layoutEditorial(ctx, quote, quote.vibe, w, h, font, layout, inkColor, lang);

  // 4. Technical folio (metadata)
  drawFolio(ctx, w, h, font, quote.vibe, resolution, inkColor);

  // 5. Watermark (branding)
  drawWatermark(ctx, w, h, inkColor);
}
