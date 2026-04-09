import { getRandomItem } from './utils/random.js';
import { FONTS, FONT_FAMILIES, getGradient, getLayout, INK_COLORS, checkIsDark, LAYOUTS, PAPER_COLORS } from './utils/styles.js';
import { renderWallpaper } from './utils/canvas.js';

/* ──────────────────────────────────────────────────────
   TRANSLATIONS
────────────────────────────────────────────────────────── */
const translations = {
  en: {
    resolution: "Resolution",
    typeface: "Typeface",
    layout: "Layout",
    background: "Background",
    ink: "Ink",
    solid: "Solid",
    gradient: "Gradient",
    nextQuote: "Next Quote",
    shuffle: "Shuffle",
    download: "Download",
    vibe: "Vibe",
    layoutLabel: "Layout",
    pressGenerate: "Press Generate to create a wallpaper.",
    footer: "100 quotes · 3 vibes · 10 typefaces",
    resolutions: {
      desktop: "Desktop — 1920 × 1080",
      mobile: "Mobile — 1080 × 1920"
    },
    layouts: {
      editorial: "Editorial — left-aligned",
      ruled: "Ruled — centred grid",
      offset: "Offset — asymmetric"
    },
    backgrounds: {
      solid: {
        white: "Pure White",
        cream: "Antique Cream",
        ivory: "Warm Ivory",
        sand: "Soft Sand",
        clay: "Grey Clay",
        slate: "Cool Slate",
        charcoal: "Deep Charcoal",
        black: "Pure Black"
      },
      gradient: {
        auto: "Auto — by Vibe",
        vibrant: "Vibrant — colors",
        calm: "Calm — subtle",
        chaotic: "Chaotic — intense",
        serious: "Serious — dark"
      }
    },
    inks: {
      auto: "Auto — Contrast",
      dark: "Charcoal Black",
      deep: "Pure Black",
      light: "Ghost White",
      muted: "Steel Grey"
    }
  },
  es: {
    resolution: "Resolución",
    typeface: "Tipografía",
    layout: "Diseño",
    background: "Fondo",
    ink: "Tinta",
    solid: "Sólido",
    gradient: "Gradiente",
    nextQuote: "Siguiente Cita",
    shuffle: "Aleatorio",
    download: "Descargar",
    vibe: "Ambiente",
    layoutLabel: "Diseño",
    pressGenerate: "Presiona Generar para crear un wallpaper.",
    footer: "100 citas · 3 ambientes · 10 tipografías",
    resolutions: {
      desktop: "Escritorio — 1920 × 1080",
      mobile: "Móvil — 1080 × 1920"
    },
    layouts: {
      editorial: "Editorial — alineado izquierda",
      ruled: "Reglado — cuadrícula centrada",
      offset: "Desplazado — asimétrico"
    },
    backgrounds: {
      solid: {
        white: "Blanco Puro",
        cream: "Crema Antigua",
        ivory: "Marfil Cálido",
        sand: "Arena Suave",
        clay: "Arcilla Gris",
        slate: "Pizarra Fresca",
        charcoal: "Carbón Profundo",
        black: "Negro Puro"
      },
      gradient: {
        auto: "Auto — por Ambiente",
        vibrant: "Vibrante — colores",
        calm: "Calmo — sutil",
        chaotic: "Caótico — intenso",
        serious: "Serio — oscuro"
      }
    },
    inks: {
      auto: "Auto — Contraste",
      dark: "Negro Carbón",
      deep: "Negro Puro",
      light: "Blanco Fantasma",
      muted: "Gris Acero"
    }
  }
};
/* ──────────────────────────────────────────────────────
   UI UPDATE FUNCTION
────────────────────────────────────────────────────────── */
function updateUI() {
  const t = translations[currentLang];
  document.documentElement.lang = currentLang;

  // Labels
  document.querySelector('label[for="resolution-select"]').textContent = t.resolution;
  document.querySelector('label[for="font-select"]').textContent = t.typeface;
  document.querySelector('label[for="layout-select"]').textContent = t.layout;
  document.querySelector('label[for="background-select"], label:not([for])').textContent = t.background; // For the background label
  document.querySelector('label[for="ink-select"]').textContent = t.ink;

  // Tabs
  document.getElementById('tab-solid').textContent = t.solid;
  document.getElementById('tab-gradient').textContent = t.gradient;

  // Buttons
  document.getElementById('btn-generate').textContent = t.nextQuote;
  document.getElementById('btn-shuffle').textContent = t.shuffle;
  document.getElementById('btn-download').textContent = t.download;

  // Meta labels
  document.querySelector('.meta__row:nth-child(1) .label').textContent = t.vibe;
  document.querySelector('.meta__row:nth-child(2) .label').textContent = t.layoutLabel;

  // Quote preview
  if (!currentQuote) {
    document.getElementById('quote-preview').textContent = t.pressGenerate;
  }

  // Footer
  document.querySelector('.sidebar__footer').textContent = t.footer;

  // Select options
  const resolutionSel = document.getElementById('resolution-select');
  resolutionSel.options[0].text = t.resolutions.desktop;
  resolutionSel.options[1].text = t.resolutions.mobile;

  const layoutSel = document.getElementById('layout-select');
  layoutSel.options[0].text = t.layouts.editorial;
  layoutSel.options[1].text = t.layouts.ruled;
  layoutSel.options[2].text = t.layouts.offset;

  const solidSel = document.getElementById('solid-select');
  Object.keys(t.backgrounds.solid).forEach((key, index) => {
    solidSel.options[index].text = t.backgrounds.solid[key];
  });

  const gradientSel = document.getElementById('gradient-select');
  Object.keys(t.backgrounds.gradient).forEach((key, index) => {
    gradientSel.options[index].text = t.backgrounds.gradient[key];
  });

  const inkSel = document.getElementById('ink-select');
  Object.keys(t.inks).forEach((key, index) => {
    inkSel.options[index].text = t.inks[key];
  });
}

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
let currentLang      = (navigator.language || navigator.userLanguage).startsWith('es') ? 'es' : 'en';

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
    const langEn        = document.getElementById('lang-en');
    const langEs        = document.getElementById('lang-es');
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
      renderWallpaper(currentQuote, currentRes, currentGradient, currentFont, currentLayout, inkColor, currentLang);
      
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
      const quoteText = currentQuote[currentLang === 'es' ? 'text_es' : 'text'] || currentQuote.text;
      quoteEl.textContent  = `"${quoteText}"`;
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

    // Language toggle
    langEn.addEventListener('click', () => {
      if (currentLang === 'en') return;
      currentLang = 'en';
      langEn.classList.add('lang-btn--active');
      langEs.classList.remove('lang-btn--active');
      updateUI();
      if (currentQuote) {
        const quoteText = currentQuote.text;
        quoteEl.textContent = `"${quoteText}"`;
        draw();
      }
    });

    langEs.addEventListener('click', () => {
      if (currentLang === 'es') return;
      currentLang = 'es';
      langEs.classList.add('lang-btn--active');
      langEn.classList.remove('lang-btn--active');
      updateUI();
      if (currentQuote) {
        const quoteText = currentQuote.text_es || currentQuote.text;
        quoteEl.textContent = `"${quoteText}"`;
        draw();
      }
    });

    window.addEventListener('resize', draw);

    // Boot
    await document.fonts.ready;

    // Set initial language UI
    if (currentLang === 'es') {
      langEs.classList.add('lang-btn--active');
      langEn.classList.remove('lang-btn--active');
    }

    generate(true);
    updateUI();

  } catch (err) {
    console.error('Init failed:', err);
  }
}

init();
