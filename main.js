import { getRandomItem } from './utils/random.js';
import { FONTS, getGradient, getLayout, INK_COLORS, checkIsDark, LAYOUTS } from './utils/styles.js';
import { renderWallpaper } from './utils/canvas.js';

/* ──────────────────────────────────────────────────────
   GOOGLE FONTS
────────────────────────────────────────────────────────── */
const FONT_FAMILIES = [
  'Cormorant+Garamond:wght@300;400',
  'Playfair+Display:wght@400;700',
  'DM+Serif+Display',
  'Libre+Caslon+Display',
  'Space+Grotesk:wght@300;400;600',
  'Syne:wght@400;700;800',
  'Outfit:wght@200;300;400',
  'DM+Mono:wght@300;400',
  'Fraunces:wght@100;300;400',
  'Instrument+Serif'
].join('&family=');

const fontLink = document.createElement('link');
fontLink.rel  = 'stylesheet';
fontLink.href = `https://fonts.googleapis.com/css2?family=${FONT_FAMILIES}&display=swap`;
document.head.appendChild(fontLink);

/* ──────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────── */
const RESOLUTIONS = {
  desktop: { width: 1920, height: 1080 },
  mobile:  { width: 1080, height: 1920 }
};

let quotes          = [];
let currentQuote    = null;
let currentGradient = null;
let currentFont     = FONTS[0];
let currentLayout    = 'editorial';
let currentRes       = RESOLUTIONS.desktop;
let currentBgType    = 'solid';
let currentBgValue   = 'white';
let currentInk       = 'auto';

/* ──────────────────────────────────────────────────────
   FETCH QUOTES & BOOT
────────────────────────────────────────────────────────── */
async function init() {
  try {
    const res = await fetch('./data/quotes.json');
    quotes = await res.json();

    const generateBtn   = document.getElementById('btn-generate');
    const shuffleBtn    = document.getElementById('btn-shuffle');
    const downloadBtn   = document.getElementById('btn-download');
    const resolutionSel = document.getElementById('resolution-select');
    const fontSel       = document.getElementById('font-select');
    const layoutSel     = document.getElementById('layout-select');
    const tabSolid      = document.getElementById('tab-solid');
    const tabGradient   = document.getElementById('tab-gradient');
    const solidSel      = document.getElementById('solid-select');
    const gradientSel   = document.getElementById('gradient-select');
    const inkSel        = document.getElementById('ink-select');
    const vibeEl        = document.getElementById('vibe-indicator');
    const quoteEl       = document.getElementById('quote-preview');
    const authorEl      = document.getElementById('author-preview');
    const canvas        = document.getElementById('canvas');
    const wrapper       = document.getElementById('canvas-wrapper');

    // Build font options
    FONTS.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.label;
      fontSel.appendChild(opt);
    });

    const draw = () => {
      if (!currentQuote) return;
      let inkColor = currentInk === 'auto' ? null : INK_COLORS[currentInk];
      if (!inkColor && currentGradient) {
        const isDarkBg = checkIsDark(currentGradient[0]);
        inkColor = isDarkBg ? INK_COLORS.light : INK_COLORS.dark;
      }
      renderWallpaper(currentQuote, currentRes, currentGradient, currentFont.family, currentLayout, inkColor);
      
      const wrapW = wrapper.clientWidth;
      const wrapH = wrapper.clientHeight;
      const scale = Math.min(wrapW / canvas.width, wrapH / canvas.height, 1);
      canvas.style.width  = `${Math.round(canvas.width  * scale)}px`;
      canvas.style.height = `${Math.round(canvas.height * scale)}px`;
    };

    const generate = (randomizeStyles = false) => {
      if (!quotes.length) return;
      currentQuote = getRandomItem(quotes);

      if (randomizeStyles) {
        currentFont = getRandomItem(FONTS);
        fontSel.value = currentFont.id;

        currentLayout = getRandomItem(LAYOUTS);
        layoutSel.value = currentLayout;

        // Randomize background
        currentBgType = getRandomItem(['solid', 'gradient']);
        if (currentBgType === 'solid') {
          tabSolid.click(); // Activate solid tab
          const solidOptions = ['white', 'cream', 'ivory', 'sand', 'clay', 'slate', 'charcoal', 'black'];
          currentBgValue = getRandomItem(solidOptions);
          solidSel.value = currentBgValue;
        } else {
          tabGradient.click(); // Activate gradient tab
          const gradientOptions = ['auto', 'vibrant', 'calm', 'chaotic', 'serious'];
          currentBgValue = getRandomItem(gradientOptions);
          gradientSel.value = currentBgValue;
        }

        currentInk = 'auto';
        inkSel.value = 'auto';
      } else {
        currentBgType = tabSolid.classList.contains('tab--active') ? 'solid' : 'gradient';
        currentBgValue = currentBgType === 'solid' ? solidSel.value : gradientSel.value;
        currentLayout = layoutSel.value;
        currentFont = FONTS.find(f => f.id === fontSel.value) ?? FONTS[0];
      }

      // Calculate gradient based on type and value
      if (currentBgType === 'solid') {
        currentGradient = PAPER_COLORS[currentBgValue] || PAPER_COLORS.white;
      } else {
        // For gradient
        let intensity = 'subtle';
        let paper = 'auto';
        if (currentBgValue === 'vibrant') {
          intensity = 'vibrant';
        } else if (['calm', 'chaotic', 'serious'].includes(currentBgValue)) {
          paper = currentBgValue;
        }
        currentGradient = getGradient(currentQuote.vibe, intensity, paper);
      }

      vibeEl.textContent   = currentQuote.vibe;
      vibeEl.dataset.vibe  = currentQuote.vibe;
      quoteEl.textContent  = `"${currentQuote.text}"`;
      authorEl.textContent = `— ${currentQuote.author}`;
      const layoutIndicator = document.getElementById('layout-current');
      if (layoutIndicator) layoutIndicator.textContent = currentLayout;

      draw();
    };

    // Events
    generateBtn.addEventListener('click', () => generate(false));
    shuffleBtn.addEventListener('click', () => generate(true));
    downloadBtn.addEventListener('click', () => {
      if (!currentQuote) return;
      const a = document.createElement('a');
      a.download = `plaintext-${currentQuote.author.toLowerCase().replace(/\s/g, '-')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });

    resolutionSel.addEventListener('change', () => {
      currentRes = RESOLUTIONS[resolutionSel.value] ?? RESOLUTIONS.desktop;
      draw();
    });

    fontSel.addEventListener('change', () => {
      currentFont = FONTS.find(f => f.id === fontSel.value) ?? FONTS[0];
      draw();
    });

    layoutSel.addEventListener('change', () => {
      currentLayout = layoutSel.value;
      const layoutIndicator = document.getElementById('layout-current');
      if (layoutIndicator) layoutIndicator.textContent = currentLayout;
      draw();
    });

    // Tab switching
    tabSolid.addEventListener('click', () => {
      tabSolid.classList.add('tab--active');
      tabGradient.classList.remove('tab--active');
      document.getElementById('solid-controls').classList.add('tab-content--active');
      document.getElementById('gradient-controls').classList.remove('tab-content--active');
      currentBgType = 'solid';
      currentBgValue = solidSel.value;
      currentGradient = PAPER_COLORS[currentBgValue] || PAPER_COLORS.white;
      draw();
    });

    tabGradient.addEventListener('click', () => {
      tabGradient.classList.add('tab--active');
      tabSolid.classList.remove('tab--active');
      document.getElementById('gradient-controls').classList.add('tab-content--active');
      document.getElementById('solid-controls').classList.remove('tab-content--active');
      currentBgType = 'gradient';
      currentBgValue = gradientSel.value;
      let intensity = 'subtle';
      let paper = 'auto';
      if (currentBgValue === 'vibrant') intensity = 'vibrant';
      currentGradient = getGradient(currentQuote?.vibe || 'calm', intensity, paper);
      draw();
    });

    solidSel.addEventListener('change', () => {
      currentBgValue = solidSel.value;
      currentGradient = PAPER_COLORS[currentBgValue] || PAPER_COLORS.white;
      draw();
    });

    gradientSel.addEventListener('change', () => {
      currentBgValue = gradientSel.value;
      let intensity = 'subtle';
      let paper = 'auto';
      if (currentBgValue === 'vibrant') {
        intensity = 'vibrant';
      } else if (['calm', 'chaotic', 'serious'].includes(currentBgValue)) {
        paper = currentBgValue;
      }
      currentGradient = getGradient(currentQuote?.vibe || 'calm', intensity, paper);
      draw();
    });

    inkSel.addEventListener('change', () => {
      currentInk = inkSel.value;
      draw();
    });

    window.addEventListener('resize', draw);

    // Boot
    await document.fonts.ready;
    generate(true);

  } catch (err) {
    console.error('Init failed:', err);
  }
}

init();
