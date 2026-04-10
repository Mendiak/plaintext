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
    vibeFilter: "Vibe",
    layoutLabel: "Layout",
    customQuote: "Custom Quote",
    customQuotePlaceholder: "Type your own quote…",
    customAuthorPlaceholder: "Author (optional)",
    pressGenerate: "Press Generate to create a wallpaper.",
    footer: (n, vibes, fonts) => `${n} quotes · ${vibes} vibes · ${fonts} typefaces`,
    copied: "Copied",
    shortcuts: "Shortcuts",
    resolutions: {
      desktop: "Desktop — 1920 × 1080",
      mobile: "Mobile — 1080 × 1920"
    },
    layouts: {
      editorial: "Editorial — left-aligned",
      ruled: "Ruled — centred grid",
      offset: "Offset — asymmetric"
    },
    vibes: {
      all: "All",
      calm: "Calm",
      serious: "Serious",
      chaotic: "Chaotic"
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
    vibeFilter: "Ambiente",
    layoutLabel: "Diseño",
    customQuote: "Cita Personalizada",
    customQuotePlaceholder: "Escribe tu propia cita…",
    customAuthorPlaceholder: "Autor (opcional)",
    pressGenerate: "Presiona Generar para crear un wallpaper.",
    footer: (n, vibes, fonts) => `${n} citas · ${vibes} ambientes · ${fonts} tipografías`,
    copied: "Copiado",
    shortcuts: "Atajos",
    resolutions: {
      desktop: "Escritorio — 1920 × 1080",
      mobile: "Móvil — 1080 × 1920"
    },
    layouts: {
      editorial: "Editorial — alineado izquierda",
      ruled: "Reglado — cuadrícula centrada",
      offset: "Desplazado — asimétrico"
    },
    vibes: {
      all: "Todo",
      calm: "Calma",
      serious: "Serio",
      chaotic: "Caótico"
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
  document.querySelector('label[for="ink-select"]').textContent = t.ink;
  document.querySelector('label[for="custom-quote"]').textContent = t.customQuote;
  document.getElementById('label-vibe-filter').textContent = t.vibeFilter;

  // Custom placeholders
  document.getElementById('custom-quote').placeholder = t.customQuotePlaceholder;
  document.getElementById('custom-author').placeholder = t.customAuthorPlaceholder;

  // Tabs
  document.getElementById('tab-solid').textContent = t.solid;
  document.getElementById('tab-gradient').textContent = t.gradient;

  // Buttons
  document.getElementById('btn-generate').textContent = t.nextQuote;
  document.getElementById('btn-shuffle').textContent = t.shuffle;
  document.getElementById('btn-download').textContent = t.download;

  // Vibe filter buttons
  document.getElementById('vf-all').textContent     = t.vibes.all;
  document.getElementById('vf-calm').textContent    = t.vibes.calm;
  document.getElementById('vf-serious').textContent = t.vibes.serious;
  document.getElementById('vf-chaotic').textContent = t.vibes.chaotic;

  // Meta labels
  document.querySelector('.meta__row:nth-child(1) .label').textContent = t.vibe;
  document.querySelector('.meta__row:nth-child(2) .label').textContent = t.layoutLabel;

  // Quote preview
  if (!currentQuote) {
    document.getElementById('quote-preview').textContent = t.pressGenerate;
  }

  // Footer
  const filteredLen = currentVibeFilter === 'all'
    ? allQuotes.length
    : allQuotes.filter(q => q.vibe === currentVibeFilter).length;
  const uniqueVibes = new Set(allQuotes.map(q => q.vibe)).size;
  document.getElementById('sidebar-footer').textContent = t.footer(filteredLen, uniqueVibes, FONTS.length);

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

let allQuotes       = [];
let quotes          = [];  // filtered pool
let currentQuote    = null;
let currentGradient = null;
let currentFont     = FONTS[0];
let currentLayout   = 'editorial';
let currentRes      = RESOLUTIONS.desktop;
let currentBgType   = 'solid';
let currentBgValue  = 'white';
let currentInk      = 'auto';
let currentLang     = (navigator.language || navigator.userLanguage).startsWith('es') ? 'es' : 'en';
let currentVibeFilter = 'all';
let isZen           = false;
let isDark          = false;

/* ──────────────────────────────────────────────────────
   DARK MODE
────────────────────────────────────────────────────────── */
function applyDarkMode(dark) {
  isDark = dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('icon-moon').style.display = dark ? 'none' : '';
  document.getElementById('icon-sun').style.display  = dark ? ''     : 'none';
  localStorage.setItem('plaintext-dark', dark ? '1' : '0');
}

/* ──────────────────────────────────────────────────────
   ZEN MODE
────────────────────────────────────────────────────────── */
function setZen(on) {
  isZen = on;
  const app = document.getElementById('app');
  const sidebar = document.getElementById('sidebar');
  app.classList.toggle('app--zen', on);

  if (on) {
    // Show sidebar briefly before hiding
    sidebar.classList.add('sidebar--force-visible');
    setTimeout(() => {
      sidebar.classList.remove('sidebar--force-visible');
    }, 2000);
  } else {
    sidebar.classList.remove('sidebar--force-visible');
  }
}

/* ──────────────────────────────────────────────────────
   VIBE FILTER
────────────────────────────────────────────────────────── */
function setVibeFilter(vibe) {
  currentVibeFilter = vibe;
  // Update button states
  document.querySelectorAll('.vf-btn').forEach(btn => {
    btn.classList.toggle('vf-btn--active', btn.dataset.vibe === vibe);
  });
  // Re-filter pool
  quotes = vibe === 'all' ? allQuotes : allQuotes.filter(q => q.vibe === vibe);
  // Update footer count
  const t = translations[currentLang];
  const uniqueVibes = new Set(allQuotes.map(q => q.vibe)).size;
  document.getElementById('sidebar-footer').textContent = t.footer(quotes.length, uniqueVibes, FONTS.length);
}

/* ──────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS PANEL
────────────────────────────────────────────────────────── */
function toggleKbdPanel(open) {
  const panel = document.getElementById('kbd-panel');
  panel.classList.toggle('kbd-panel--open', open);
  panel.setAttribute('aria-hidden', String(!open));
}

/* ──────────────────────────────────────────────────────
   COPY QUOTE TO CLIPBOARD
────────────────────────────────────────────────────────── */
function copyQuote() {
  if (!currentQuote && !document.getElementById('custom-quote').value.trim()) return;
  const text = document.getElementById('quote-preview').textContent;
  const author = document.getElementById('author-preview').textContent;
  const full = author ? `${text}\n${author}` : text;
  navigator.clipboard.writeText(full).then(() => {
    const card = document.getElementById('quote-card');
    card.classList.add('quote-card--copied');
    setTimeout(() => card.classList.remove('quote-card--copied'), 900);
  }).catch(() => {});
}

/* ──────────────────────────────────────────────────────
   FETCH QUOTES & BOOT
────────────────────────────────────────────────────────── */
async function init() {
  try {
    // Restore dark mode preference
    const savedDark = localStorage.getItem('plaintext-dark');
    if (savedDark === '1') applyDarkMode(true);

    const res = await fetch('./data/quotes.json');
    allQuotes = await res.json();
    quotes    = allQuotes;

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
    const darkBtn       = document.getElementById('btn-dark-mode');
    const zenBtn        = document.getElementById('btn-zen');
    const quoteCard     = document.getElementById('quote-card');
    const kbdHintBtn    = document.getElementById('btn-kbd-hint');
    const kbdPanel      = document.getElementById('kbd-panel');
    const customQuoteEl = document.getElementById('custom-quote');
    const customAuthorEl= document.getElementById('custom-author');

    // Zen mode exit hint
    const zenHint = document.createElement('div');
    zenHint.className = 'zen-hint';
    zenHint.textContent = 'Press Z or Esc to exit';
    document.getElementById('app').appendChild(zenHint);

    // Build font options
    FONTS.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.label;
      fontSel.appendChild(opt);
    });

    const draw = () => {
      if (!currentQuote && !customQuoteEl.value.trim()) return;
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

    const resolveBackground = () => {
      if (currentBgType === 'solid') {
        currentGradient = PAPER_COLORS[currentBgValue] || PAPER_COLORS.white;
      } else {
        let intensity = 'subtle';
        let paper = 'auto';
        if (currentBgValue === 'vibrant') {
          intensity = 'vibrant';
        } else if (['calm', 'chaotic', 'serious'].includes(currentBgValue)) {
          paper = currentBgValue;
        }
        currentGradient = getGradient(currentQuote?.vibe || 'calm', intensity, paper);
      }
    };

    const applyCustomQuote = () => {
      const text = customQuoteEl.value.trim();
      const author = customAuthorEl.value.trim();
      if (!text) return false;
      // Build a synthetic quote object
      currentQuote = {
        text,
        text_es: text,
        author: author || '—',
        vibe: currentVibeFilter === 'all' ? 'calm' : currentVibeFilter
      };
      quoteEl.textContent  = `"${text}"`;
      authorEl.textContent = author ? `— ${author}` : '';
      vibeEl.textContent   = currentQuote.vibe;
      vibeEl.dataset.vibe  = currentQuote.vibe;
      const layoutIndicator = document.getElementById('layout-current');
      if (layoutIndicator) layoutIndicator.textContent = currentLayout;
      return true;
    };

    const generate = (randomizeStyles = false) => {
      // If custom quote has content, use it; otherwise pick from pool
      const hasCustom = customQuoteEl.value.trim().length > 0;

      if (!hasCustom) {
        if (!quotes.length) return;
        currentQuote = getRandomItem(quotes);
      }

      if (randomizeStyles) {
        currentFont = getRandomItem(FONTS);
        fontSel.value = currentFont.id;

        currentLayout = getRandomItem(LAYOUTS);
        layoutSel.value = currentLayout;

        currentBgType = getRandomItem(['solid', 'gradient']);
        if (currentBgType === 'solid') {
          tabSolid.click();
          const solidOptions = ['white', 'cream', 'ivory', 'sand', 'clay', 'slate', 'charcoal', 'black'];
          currentBgValue = getRandomItem(solidOptions);
          solidSel.value = currentBgValue;
        } else {
          tabGradient.click();
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

      resolveBackground();

      if (!hasCustom) {
        vibeEl.textContent   = currentQuote.vibe;
        vibeEl.dataset.vibe  = currentQuote.vibe;
        const quoteText = currentQuote[currentLang === 'es' ? 'text_es' : 'text'] || currentQuote.text;
        quoteEl.textContent  = `"${quoteText}"`;
        authorEl.textContent = `— ${currentQuote.author}`;
        const layoutIndicator = document.getElementById('layout-current');
        if (layoutIndicator) layoutIndicator.textContent = currentLayout;
      } else {
        applyCustomQuote();
      }

      draw();
    };

    // ── Events ───────────────────────────────────────────

    generateBtn.addEventListener('click', () => generate(false));
    shuffleBtn.addEventListener('click',  () => generate(true));

    downloadBtn.addEventListener('click', () => {
      if (!currentQuote) return;
      const a = document.createElement('a');
      const authorSlug = currentQuote.author.toLowerCase().replace(/\s/g, '-');
      a.download = `mendiak.github.io-plaintext-${authorSlug}.png`;
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
      currentBgType  = 'solid';
      currentBgValue = solidSel.value;
      resolveBackground();
      draw();
    });

    tabGradient.addEventListener('click', () => {
      tabGradient.classList.add('tab--active');
      tabSolid.classList.remove('tab--active');
      document.getElementById('gradient-controls').classList.add('tab-content--active');
      document.getElementById('solid-controls').classList.remove('tab-content--active');
      currentBgType  = 'gradient';
      currentBgValue = gradientSel.value;
      resolveBackground();
      draw();
    });

    solidSel.addEventListener('change', () => {
      currentBgValue = solidSel.value;
      resolveBackground();
      draw();
    });

    gradientSel.addEventListener('change', () => {
      currentBgValue = gradientSel.value;
      resolveBackground();
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
        quoteEl.textContent = `"${currentQuote.text}"`;
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
        quoteEl.textContent = `"${currentQuote.text_es || currentQuote.text}"`;
        draw();
      }
    });

    // Dark mode
    darkBtn.addEventListener('click', () => applyDarkMode(!isDark));

    // Zen mode
    zenBtn.addEventListener('click', () => setZen(!isZen));

    // Quote card copy
    quoteCard.addEventListener('click', () => copyQuote());
    quoteCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyQuote(); }
    });

    // Vibe filter buttons
    document.querySelectorAll('.vf-btn').forEach(btn => {
      btn.addEventListener('click', () => setVibeFilter(btn.dataset.vibe));
    });

    // Custom quote — re-render on input
    customQuoteEl.addEventListener('input', () => {
      if (customQuoteEl.value.trim()) {
        if (applyCustomQuote()) {
          resolveBackground();
          draw();
        }
      }
    });
    customAuthorEl.addEventListener('input', () => {
      if (customQuoteEl.value.trim() && applyCustomQuote()) {
        resolveBackground();
        draw();
      }
    });

    // Keyboard shortcut panel
    kbdHintBtn.addEventListener('click', () => toggleKbdPanel(true));
    kbdPanel.addEventListener('click', (e) => {
      if (e.target === kbdPanel) toggleKbdPanel(false);
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Ignore when typing in text area / input
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          if (isZen) setZen(false);
          toggleKbdPanel(false);
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          generate(false);
          break;
        case 's':
        case 'S':
          generate(true);
          break;
        case 'd':
        case 'D':
          downloadBtn.click();
          break;
        case '1':
          layoutSel.value = 'editorial';
          layoutSel.dispatchEvent(new Event('change'));
          break;
        case '2':
          layoutSel.value = 'ruled';
          layoutSel.dispatchEvent(new Event('change'));
          break;
        case '3':
          layoutSel.value = 'offset';
          layoutSel.dispatchEvent(new Event('change'));
          break;
        case 'z':
        case 'Z':
          setZen(!isZen);
          break;
        case '?':
          toggleKbdPanel(true);
          break;
        case 'Escape':
          if (document.getElementById('kbd-panel').classList.contains('kbd-panel--open')) {
            toggleKbdPanel(false);
          } else if (isZen) {
            setZen(false);
          }
          break;
      }
    });

    window.addEventListener('resize', draw);

    // Boot
    await document.fonts.ready;

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
