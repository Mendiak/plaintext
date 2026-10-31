import { getRandomItem } from './utils/random.js';
import {
  FONTS,
  FONT_FAMILIES,
  FONT_CATEGORY_LABELS,
  getGradient,
  getGradientPreview,
  getGradientVariantPreview,
  resolveGradientKey,
  AUTO_GRADIENT_PREVIEW,
  isDarkGradient,
  INK_COLORS,
  LAYOUTS,
  PAPER_COLORS,
  PATTERNS,
  GRADIENT_OPTIONS
} from './utils/styles.js';
import { renderWallpaper } from './utils/canvas.js';

/* ──────────────────────────────────────────────────────
   SEO / ANALYTICS HELPERS
────────────────────────────────────────────────────────── */
const META = (name) => document.querySelector(`meta[name="${name}"]`)?.content || null;

// Base URL derived from this module, so it works at /plaintext/ on GitHub Pages
// and at / when served locally (Live Server, http.server, etc.).
const BASE = new URL('.', import.meta.url).href;

const URL_PARAMS = new URLSearchParams(window.location.search);
const FORCED_LANG = META('pt-lang');

function track(name, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

// Must stay in sync with slugify() in generate.js so quote pages deep-link correctly.
function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`"“”‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    pattern: "Pattern",
    nextQuote: "Next Quote",
    shuffle: "Shuffle",
    randomGradient: "New orientation",
    download: "Download",
    vibe: "Vibe",
    vibeFilter: "Vibe",
    layoutLabel: "Layout",
    patternLabel: "Pattern",
    customQuote: "Custom Quote",
    customQuotePlaceholder: "Type your own quote…",
    customAuthorPlaceholder: "Author (optional)",
    pressGenerate: "Press Generate to create a wallpaper.",
    copied: "Copied",
    shortcuts: "Shortcuts",
    resolutions: {
      desktop: "Desktop — 1920 × 1080",
      desktop_1440p: "2K / 1440p — 2560 × 1440",
      desktop_4k: "4K / UHD — 3840 × 2160",
      desktop_ultrawide: "Ultrawide — 3440 × 1440",
      mobile: "Mobile — 1080 × 1920",
      instagram: "Instagram — 1080 × 1080",
      og: "OG / Twitter — 1200 × 630"
    },
    layouts: {
      editorial: "Editorial",
      ruled: "Ruled",
      offset: "Offset"
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
        paper: "Paper — warm neutral",
        sky: "Sky — cool blue",
        mint: "Mint — soft green",
        blush: "Blush — pale rose",
        sand: "Sand — warm beige",
        stone: "Stone — neutral grey",
        night: "Night — deep navy",
        forest: "Forest — deep green"
      },
      pattern: {
        none: "None",
        typographic: "Typographic",
        grid: "Grid",
        dots: "Dots",
        diagonal: "Diagonal",
        halftone: "Halftone"
      }
    },
    inks: {
      auto: "Auto — Contrast",
      dark: "Charcoal Black",
      deep: "Pure Black",
      light: "Ghost White",
      muted: "Steel Grey"
    },
    developedBy: "by",
    headerSub: "Quote-driven typographic posters"
  },
  es: {
    resolution: "Resolución",
    typeface: "Tipografía",
    layout: "Diseño",
    background: "Fondo",
    ink: "Tinta",
    solid: "Sólido",
    gradient: "Gradiente",
    pattern: "Patrón",
    nextQuote: "Siguiente Cita",
    shuffle: "Aleatorio",
    randomGradient: "Nueva orientación",
    download: "Descargar",
    vibe: "Ambiente",
    vibeFilter: "Ambiente",
    layoutLabel: "Diseño",
    patternLabel: "Patrón",
    customQuote: "Cita Personalizada",
    customQuotePlaceholder: "Escribe tu propia cita…",
    customAuthorPlaceholder: "Autor (opcional)",
    pressGenerate: "Presiona Generar para crear un wallpaper.",
    copied: "Copiado",
    shortcuts: "Atajos",
    resolutions: {
      desktop: "Escritorio — 1920 × 1080",
      desktop_1440p: "2K / 1440p — 2560 × 1440",
      desktop_4k: "4K / UHD — 3840 × 2160",
      desktop_ultrawide: "Ultrawide — 3440 × 1440",
      mobile: "Móvil — 1080 × 1920",
      instagram: "Instagram — 1080 × 1080",
      og: "OG / Twitter — 1200 × 630"
    },
    layouts: {
      editorial: "Editorial",
      ruled: "Reglado",
      offset: "Desplazado"
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
        paper: "Papel — neutro cálido",
        sky: "Cielo — azul frío",
        mint: "Menta — verde suave",
        blush: "Rubor — rosa pálido",
        sand: "Arena — beige cálido",
        stone: "Piedra — gris neutro",
        night: "Noche — azul profundo",
        forest: "Bosque — verde profundo"
      },
      pattern: {
        none: "Ninguno",
        typographic: "Tipográfico",
        grid: "Retícula",
        dots: "Puntos",
        diagonal: "Diagonal",
        halftone: "Semitono"
      }
    },
    inks: {
      auto: "Auto — Contraste",
      dark: "Negro Carbón",
      deep: "Negro Puro",
      light: "Blanco Fantasma",
      muted: "Gris Acero"
    },
    developedBy: "por",
    headerSub: "Wallpapers tipográficos a partir de citas"
  }
};

/* ──────────────────────────────────────────────────────
   UI UPDATE FUNCTION
────────────────────────────────────────────────────────── */
function updateUI() {
  const t = translations[currentLang];
  document.documentElement.lang = currentLang;

  // Labels
  document.querySelector('.header__sub').textContent = t.headerSub;
  document.querySelector('label[for="resolution-trigger"]').textContent = t.resolution;
  document.querySelector('label[for="font-trigger"]').textContent = t.typeface;
  document.querySelector('label[for="layout-trigger"]').textContent = t.layout;
  document.querySelector('label[for="ink-trigger"]').textContent = t.ink;
  document.getElementById('label-pattern').textContent = t.patternLabel;
  document.getElementById('custom-quote-label').textContent = t.customQuote;
  document.getElementById('label-vibe-filter').textContent = t.vibeFilter;
  document.getElementById('label-background').textContent = t.background;

  // Custom placeholders
  document.getElementById('custom-quote').placeholder = t.customQuotePlaceholder;
  document.getElementById('custom-author').placeholder = t.customAuthorPlaceholder;

  // Tabs (Solid | Gradient). Pattern is an overlay dropdown, not a tab.
  document.getElementById('tab-solid').textContent = t.solid;
  document.getElementById('tab-gradient').textContent = t.gradient;

  // Buttons
  document.getElementById('btn-generate').textContent = t.nextQuote;
  const shuffleBtn = document.getElementById('btn-shuffle');
  shuffleBtn.title = t.shuffle;
  shuffleBtn.setAttribute('aria-label', t.shuffle);
  document.getElementById('btn-download').textContent = t.download;

  // Vibe filter buttons
  document.getElementById('vf-all').textContent     = t.vibes.all;
  document.getElementById('vf-calm').textContent    = t.vibes.calm;
  document.getElementById('vf-serious').textContent = t.vibes.serious;
  document.getElementById('vf-chaotic').textContent = t.vibes.chaotic;

  // Custom quote fields (inside a collapsible group, so they need explicit labels)
  document.getElementById('custom-quote').setAttribute('aria-label', t.customQuote);
  document.getElementById('custom-author').setAttribute('aria-label', t.customAuthorPlaceholder);

  // Credits
  const creditTextEl = document.getElementById('credit-text');
  if (creditTextEl) creditTextEl.textContent = t.developedBy;

  // Update dropdown option labels by data-value, so order never matters.
  const updateDropdownOptions = (menuId, texts) => {
    document.querySelectorAll(`#${menuId} .dropdown__option`).forEach((opt) => {
      const label = texts[opt.dataset.value];
      if (!label) return;
      const textEl = opt.querySelector('.dropdown__option-text');
      if (textEl) textEl.textContent = label;
      else opt.textContent = label;
    });
  };

  updateDropdownOptions('resolution-menu', t.resolutions);
  updateDropdownOptions('layout-menu', t.layouts);
  updateDropdownOptions('pattern-menu', t.backgrounds.pattern);
  updateDropdownOptions('ink-menu', t.inks);
  
  document.querySelectorAll('#solid-swatches .swatch').forEach((sw) => {
    const name = t.backgrounds.solid[sw.dataset.value];
    if (name) {
      sw.title = name;
      sw.setAttribute('aria-label', name);
    }
  });

  document.querySelectorAll('#gradient-swatches .swatch').forEach((sw) => {
    const name = t.backgrounds.gradient[sw.dataset.value];
    if (name) {
      sw.title = name;
      sw.setAttribute('aria-label', name);
    }
  });
  document.getElementById('solid-swatches').setAttribute('aria-label', t.background);
  document.getElementById('gradient-swatches').setAttribute('aria-label', t.gradient);

  const randomGradientBtn = document.getElementById('btn-random-gradient');
  randomGradientBtn.title = t.randomGradient;
  randomGradientBtn.setAttribute('aria-label', t.randomGradient);

  updateGradientPreviews();
}

/**
 * Swatches are painted once: each one represents a fixed palette, so they
 * never morph when the quote changes. A recomposed variant (angle + stops)
 * is only shown on the selected swatch, which keeps it truthful.
 */
function updateGradientPreviews(variant = null, activeValue = null) {
  document.querySelectorAll('#gradient-swatches .swatch').forEach((sw) => {
    const key = sw.dataset.value;
    if (key === 'auto') {
      sw.style.backgroundImage = AUTO_GRADIENT_PREVIEW;
      return;
    }
    sw.style.backgroundImage = variant && key === activeValue
      ? getGradientVariantPreview(getGradient(key), variant)
      : getGradientPreview(key);
  });
}

/** Controlled recomposition: 15° steps and soft stop bands. */
function randomGradientVariant() {
  return {
    angle: Math.round(Math.random() * 23) * 15,
    stops: [
      Math.round(Math.random() * 20) / 100,
      Math.round(80 + Math.random() * 20) / 100
    ]
  };
}

const fontLink = document.createElement('link');
fontLink.rel  = 'stylesheet';
fontLink.href = `https://fonts.googleapis.com/css2?family=${FONT_FAMILIES}&display=swap`;
document.head.appendChild(fontLink);

/* ──────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────── */
const RESOLUTIONS = {
  desktop:           { width: 1920, height: 1080 },
  desktop_1440p:     { width: 2560, height: 1440 },
  desktop_4k:        { width: 3840, height: 2160 },
  desktop_ultrawide: { width: 3440, height: 1440 },
  mobile:            { width: 1080, height: 1920 },
  instagram:         { width: 1080, height: 1080 },
  og:                { width: 1200, height: 630 }
};

let allQuotes       = [];
let quotes          = [];  // filtered pool
let currentQuote    = null;
let currentGradient = null;
let currentFont     = FONTS[0];
let currentLayout   = 'editorial';
let currentRes      = RESOLUTIONS.desktop;
let currentResKey   = 'desktop';
let currentBaseType  = 'solid';
let currentBaseValue = 'white';
let currentPattern   = 'none';
let currentGradientVariant = null;
let currentSeed      = '';
let currentInk      = 'auto';
let currentLang     = FORCED_LANG
  || URL_PARAMS.get('lang')
  || 'en';
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
}

/* ──────────────────────────────────────────────────────
   CUSTOM DROPDOWN COMPONENT
────────────────────────────────────────────────────────── */
function closeAllDropdowns(exceptMenu = null) {
  document.querySelectorAll('.dropdown__menu--open').forEach((menu) => {
    if (menu === exceptMenu) return;
    menu.classList.remove('dropdown__menu--open');
    const trigger = menu.previousElementSibling;
    trigger?.classList.remove('dropdown__trigger--open');
    trigger?.setAttribute('aria-expanded', 'false');
    menu.querySelectorAll('.dropdown__option--active').forEach(o => o.classList.remove('dropdown__option--active'));
  });
}

function optionLabel(option) {
  return option.querySelector('.dropdown__option-text')?.textContent ?? option.textContent;
}

function createDropdown(id, options, initialValue, onChange) {
  const trigger = document.getElementById(`${id}-trigger`);
  const menu = document.getElementById(`${id}-menu`);
  const valueEl = trigger.querySelector('.dropdown__value');
  let currentValue = initialValue;
  let activeIndex = 0;

  // Give the listbox an accessible name taken from its visible label.
  const labelEl = trigger.closest('.control-group')?.querySelector('.label');
  if (labelEl) menu.setAttribute('aria-label', labelEl.textContent.trim());
  trigger.setAttribute('aria-controls', menu.id);
  menu.setAttribute('tabindex', '-1');

  // Populate options if menu is empty
  if (menu.children.length === 0 && options) {
    let currentGroup = null;
    options.forEach(opt => {
      // Optional, non-selectable heading. optionEls() only queries
      // .dropdown__option, so keyboard and hover logic ignore it.
      if (opt.group && opt.group !== currentGroup) {
        currentGroup = opt.group;
        const heading = document.createElement('div');
        heading.className = 'dropdown__group';
        heading.textContent = opt.group;
        heading.setAttribute('role', 'presentation');
        menu.appendChild(heading);
      }
      const div = document.createElement('div');
      div.className = 'dropdown__option';
      div.dataset.value = opt.value;
      div.textContent = opt.label;
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', 'false');
      if (opt.family) {
        div.style.fontFamily = opt.family;
        div.style.fontSize = '1.05rem';
      }
      menu.appendChild(div);
    });
  }

  // Stable ids let the trigger point at the highlighted option.
  menu.querySelectorAll('.dropdown__option').forEach((opt, index) => {
    if (!opt.id) opt.id = `${menu.id}-opt-${index}`;
  });

  const optionEls = () => [...menu.querySelectorAll('.dropdown__option')];

  const updateDisplay = () => {
    const selectedOption = menu.querySelector(`[data-value="${currentValue}"]`);
    if (!selectedOption) return;
    valueEl.textContent = optionLabel(selectedOption);
    optionEls().forEach(opt => {
      opt.classList.remove('dropdown__option--selected');
      opt.setAttribute('aria-selected', 'false');
    });
    selectedOption.classList.add('dropdown__option--selected');
    selectedOption.setAttribute('aria-selected', 'true');
  };

  const setActive = (index) => {
    const items = optionEls();
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle('dropdown__option--active', i === activeIndex));
    trigger.setAttribute('aria-activedescendant', items[activeIndex].id);
    // Keep the highlighted option visible in the scrollable menu.
    items[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const isOpen = () => menu.classList.contains('dropdown__menu--open');

  const open = () => {
    closeAllDropdowns(menu);
    menu.classList.add('dropdown__menu--open');
    trigger.classList.add('dropdown__trigger--open');
    trigger.setAttribute('aria-expanded', 'true');
    const items = optionEls();
    const selected = items.indexOf(menu.querySelector('.dropdown__option--selected'));
    setActive(selected >= 0 ? selected : 0);
  };

  const close = () => {
    menu.classList.remove('dropdown__menu--open');
    trigger.classList.remove('dropdown__trigger--open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    menu.querySelectorAll('.dropdown__option--active').forEach(o => o.classList.remove('dropdown__option--active'));
  };

  const select = (value) => {
    currentValue = value;
    updateDisplay();
    close();
    trigger.focus({ preventScroll: true });
    onChange(value);
  };

  // Event listeners
  trigger.addEventListener('click', () => {
    if (isOpen()) close();
    else open();
  });

  trigger.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (isOpen()) setActive(activeIndex + 1);
        else open();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen()) setActive(activeIndex - 1);
        else open();
        break;
      case 'Home':
        if (!isOpen()) break;
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        if (!isOpen()) break;
        e.preventDefault();
        setActive(optionEls().length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen()) select(optionEls()[activeIndex].dataset.value);
        else open();
        break;
      case 'Escape':
        if (isOpen()) {
          e.preventDefault();
          close();
        }
        break;
      case 'Tab':
        if (isOpen()) close();
        break;
    }
  });

  menu.addEventListener('click', (e) => {
    const option = e.target.closest('.dropdown__option');
    if (option) {
      select(option.dataset.value);
    }
  });

  menu.addEventListener('mousemove', (e) => {
    if (!isOpen()) return;
    const option = e.target.closest('.dropdown__option');
    if (!option) return;
    const index = optionEls().indexOf(option);
    if (index >= 0 && index !== activeIndex) setActive(index);
  });

  // Initialize display
  updateDisplay();

  return {
    setValue: (value) => {
      currentValue = value;
      updateDisplay();
    },
    getValue: () => currentValue
  };
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
   FETCH QUOTES & BOOT
────────────────────────────────────────────────────────── */
async function init() {
  try {
    // Restore dark mode preference
    const savedDark = localStorage.getItem('plaintext-dark');
    if (savedDark === '1') applyDarkMode(true);

    // Apply translations before the network round-trip to avoid an English flash.
    updateUI();

    const res = await fetch(`${BASE}data/quotes.json`);
    allQuotes = await res.json();
    quotes    = allQuotes;

    // Deep link from generated quote pages: /?q=less-is-more
    const bySlug = new Map(allQuotes.map(q => [slugify(q.text), q]));
    const deepLinkSlug = URL_PARAMS.get('q');
    const deepLinkQuote = deepLinkSlug ? bySlug.get(deepLinkSlug) : null;

    const generateBtn   = document.getElementById('btn-generate');
    const shuffleBtn    = document.getElementById('btn-shuffle');
    const downloadBtn   = document.getElementById('btn-download');
    const tabSolid      = document.getElementById('tab-solid');
    const tabGradient   = document.getElementById('tab-gradient');
    const solidPanel      = document.getElementById('solid-controls');
    const gradientPanel   = document.getElementById('gradient-controls');
    const langEn        = document.getElementById('lang-en');
    const langEs        = document.getElementById('lang-es');
    const canvas        = document.getElementById('canvas');
    const wrapper       = document.getElementById('canvas-wrapper');
    const darkBtn       = document.getElementById('btn-dark-mode');
    const zenBtn        = document.getElementById('btn-zen');
    const kbdHintBtn    = document.getElementById('btn-kbd-hint');
    const kbdPanel      = document.getElementById('kbd-panel');
    const customQuoteEl = document.getElementById('custom-quote');
    const customAuthorEl= document.getElementById('custom-author');

    // Zen mode exit hint
    const zenHint = document.createElement('div');
    zenHint.className = 'zen-hint';
    zenHint.textContent = 'Press Z or Esc to exit';
    document.getElementById('app').appendChild(zenHint);

    // Initialize custom dropdowns
    const resolutionDropdown = createDropdown('resolution', null, 'desktop', (value) => {
      currentResKey = value;
      currentRes = RESOLUTIONS[value] ?? RESOLUTIONS.desktop;
      draw();
    });

    const fontDropdown = createDropdown('font', FONTS.map(f => ({
      value: f.id,
      label: f.label,
      family: f.family,
      group: FONT_CATEGORY_LABELS[f.category]
    })), FONTS[0].id, (value) => {
      currentFont = FONTS.find(f => f.id === value) ?? FONTS[0];
      draw();
    });

    const layoutDropdown = createDropdown('layout', null, 'editorial', (value) => {
      currentLayout = value;
      draw();
    });

    // Background controls are rows of swatches rather than dropdowns.
    const swatchEls = [...document.querySelectorAll('#solid-swatches .swatch')];
    const solidOptions = ['white', 'cream', 'ivory', 'sand', 'clay', 'slate', 'charcoal', 'black'];
    const setSwatch = (value) => {
      swatchEls.forEach(sw => {
        const on = sw.dataset.value === value;
        sw.classList.toggle('swatch--active', on);
        sw.setAttribute('aria-checked', String(on));
      });
    };
    const solidControl = {
      getValue: () => swatchEls.find(sw => sw.classList.contains('swatch--active'))?.dataset.value || 'white',
      setValue: (value) => setSwatch(value)
    };
    swatchEls.forEach(sw => {
      sw.addEventListener('click', () => {
        currentBaseType = 'solid';
        currentBaseValue = sw.dataset.value;
        setSwatch(currentBaseValue);
        resolveBackground();
        draw();
      });
    });

    const gradientSwatchEls = [...document.querySelectorAll('#gradient-swatches .swatch')];
    const setGradientSwatch = (value) => {
      gradientSwatchEls.forEach(sw => {
        const on = sw.dataset.value === value;
        sw.classList.toggle('swatch--active', on);
        sw.setAttribute('aria-checked', String(on));
      });
    };
    const gradientControl = {
      getValue: () => gradientSwatchEls.find(sw => sw.classList.contains('swatch--active'))?.dataset.value || 'auto',
      setValue: (value) => setGradientSwatch(value)
    };
    gradientSwatchEls.forEach(sw => {
      sw.addEventListener('click', () => {
        currentBaseType = 'gradient';
        currentBaseValue = sw.dataset.value;
        currentGradientVariant = null;
        setGradientSwatch(currentBaseValue);
        updateGradientPreviews();
        resolveBackground();
        draw();
      });
    });

    // Random recomposes the current palette: new angle + stop distribution.
    const randomGradientBtn = document.getElementById('btn-random-gradient');
    randomGradientBtn.addEventListener('click', () => {
      const vibe = currentQuote?.vibe || 'calm';
      const value = resolveGradientKey(currentBaseValue, vibe);
      currentBaseType = 'gradient';
      currentBaseValue = value;
      currentGradientVariant = randomGradientVariant();
      setBaseTab('gradient');
      setGradientSwatch(value);
      updateGradientPreviews(currentGradientVariant, value);
      resolveBackground();
      draw();
      track('gradient_randomized', {
        gradient: value,
        angle: currentGradientVariant.angle,
        stops: currentGradientVariant.stops
      });
    });

    const inkDropdown = createDropdown('ink', null, 'auto', (value) => {
      currentInk = value;
      draw();
    });

    // Pattern is an overlay: it sits on top of whichever background is active.
    const patternDropdown = createDropdown('pattern', null, 'none', (value) => {
      currentPattern = value;
      draw();
    });

    // Canvas measures text with the active font, so wait for it before drawing.
    // Without this, a font switched on demand would be measured with the fallback.
    const ensureFontLoaded = async (font) => {
      try {
        await document.fonts.load(`${font.weight} 1em ${font.family}`, 'AaÁáÑñ');
      } catch { /* fall back to the system font rather than blocking the draw */ }
    };

    // Only the latest draw wins: a slow font load must not repaint stale state.
    let drawToken = 0;

    const draw = async () => {
      if (!currentQuote && !customQuoteEl.value.trim()) return;
      const token = ++drawToken;
      await ensureFontLoaded(currentFont);
      if (token !== drawToken) return;
      let inkColor = currentInk === 'auto' ? null : INK_COLORS[currentInk];
      if (!inkColor && currentGradient) {
        inkColor = isDarkGradient(currentGradient) ? INK_COLORS.light : INK_COLORS.dark;
      }
      renderWallpaper(
        currentQuote,
        currentRes,
        currentGradient,
        currentFont,
        currentLayout,
        inkColor,
        currentLang,
        currentPattern,
        currentSeed,
        currentBaseType === 'gradient' ? currentGradientVariant : null
      );

      const wrapW = wrapper.clientWidth;
      const wrapH = wrapper.clientHeight;
      const scale = Math.min(wrapW / canvas.width, wrapH / canvas.height, 1);
      canvas.style.width  = `${Math.round(canvas.width  * scale)}px`;
      canvas.style.height = `${Math.round(canvas.height * scale)}px`;
      canvas.classList.add('is-ready');
    };

    const resolveBackground = () => {
      if (currentBaseType === 'solid') {
        currentGradient = PAPER_COLORS[currentBaseValue] || PAPER_COLORS.white;
        return;
      }
      const vibe = currentQuote?.vibe || 'calm';
      // One option = one exact palette (Auto resolves via the quote's vibe).
      currentGradient = getGradient(currentBaseValue, vibe);
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
      return true;
    };

    const generate = (randomizeStyles = false, forcedQuote = null) => {
      // If custom quote has content, use it; otherwise pick from pool
      const hasCustom = customQuoteEl.value.trim().length > 0;

      if (!hasCustom) {
        if (!quotes.length) return;
        currentQuote = forcedQuote || getRandomItem(quotes);
      }

      if (hasCustom) applyCustomQuote();

      // Stable seed: same quote + style always yields the same background/pattern.
      currentSeed = hasCustom
        ? (slugify(customQuoteEl.value) || 'custom')
        : slugify(currentQuote.text);

      if (randomizeStyles) {
        currentFont = getRandomItem(FONTS);
        fontDropdown.setValue(currentFont.id);

        currentLayout = getRandomItem(LAYOUTS);
        layoutDropdown.setValue(currentLayout);

        currentBaseType = getRandomItem(['solid', 'gradient']);
        if (currentBaseType === 'solid') {
          currentBaseValue = getRandomItem(solidOptions);
          solidControl.setValue(currentBaseValue);
        } else {
          currentBaseValue = getRandomItem(GRADIENT_OPTIONS);
          gradientControl.setValue(currentBaseValue);
        }
        setBaseTab(currentBaseType);

        // Bias towards no pattern so shuffles stay restrained.
        currentPattern = getRandomItem(['none', 'none', ...PATTERNS.filter(p => p !== 'none')]);
        patternDropdown.setValue(currentPattern);

        // Style shuffle returns gradients to their canonical composition.
        currentGradientVariant = null;
        updateGradientPreviews();

        currentInk = 'auto';
        inkDropdown.setValue('auto');
      } else {
        currentBaseType = tabGradient.classList.contains('tab--active') ? 'gradient' : 'solid';
        currentBaseValue = currentBaseType === 'solid' ? solidControl.getValue() : gradientControl.getValue();
        currentPattern = patternDropdown.getValue();
        currentLayout = layoutDropdown.getValue();
        currentFont = FONTS.find(f => f.id === fontDropdown.getValue()) ?? FONTS[0];
      }

      resolveBackground();

      track('quote_generated', {
        vibe: currentQuote?.vibe || 'custom',
        source: forcedQuote ? 'deeplink' : (hasCustom ? 'custom' : (randomizeStyles ? 'shuffle' : 'random'))
      });

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
      track('wallpaper_download', {
        resolution: currentResKey,
        font: currentFont.id,
        layout: currentLayout,
        vibe: currentQuote.vibe || 'custom'
      });
    });

    // Base tabs (Solid | Gradient) — ARIA tabs with arrow-key navigation
    const setBaseTab = (type) => {
      const isGradient = type === 'gradient';
      tabSolid.classList.toggle('tab--active', !isGradient);
      tabGradient.classList.toggle('tab--active', isGradient);
      tabSolid.setAttribute('aria-selected', String(!isGradient));
      tabGradient.setAttribute('aria-selected', String(isGradient));
      tabSolid.tabIndex = isGradient ? -1 : 0;
      tabGradient.tabIndex = isGradient ? 0 : -1;
      const setPanel = (panel, active) => {
        panel.classList.toggle('tab-content--active', active);
        panel.toggleAttribute('inert', !active);
        panel.setAttribute('aria-hidden', String(!active));
      };
      setPanel(solidPanel, !isGradient);
      setPanel(gradientPanel, isGradient);
    };

    const activateBase = (type) => {
      currentBaseType = type;
      setBaseTab(type);
      currentBaseValue = type === 'solid' ? solidControl.getValue() : gradientControl.getValue();
      resolveBackground();
      draw();
    };

    tabSolid.addEventListener('click', () => activateBase('solid'));
    tabGradient.addEventListener('click', () => activateBase('gradient'));

    [tabSolid, tabGradient].forEach((tab) => {
      tab.addEventListener('keydown', (e) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const tabs = [tabSolid, tabGradient];
        const index = tabs.indexOf(tab);
        let next = index;
        if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else next = tabs.length - 1;
        activateBase(next === 0 ? 'solid' : 'gradient');
        tabs[next].focus();
      });
    });

    // Language toggle — navigates to the matching indexed URL so hreflang stays honest
    langEn.addEventListener('click', () => {
      if (currentLang === 'en') return;
      track('language_switch', { to: 'en', from: currentLang });
      const q = currentQuote ? `?q=${encodeURIComponent(slugify(currentQuote.text))}` : '';
      window.location.href = `${BASE}${q}`;
    });

    langEs.addEventListener('click', () => {
      if (currentLang === 'es') return;
      track('language_switch', { to: 'es', from: currentLang });
      const q = currentQuote ? `?q=${encodeURIComponent(slugify(currentQuote.text))}` : '';
      window.location.href = `${BASE}es/${q}`;
    });

    // Dark mode
    darkBtn.addEventListener('click', () => applyDarkMode(!isDark));

    // Zen mode
    zenBtn.addEventListener('click', () => setZen(!isZen));

    // Vibe filter buttons
    document.querySelectorAll('.vf-btn').forEach(btn => {
      btn.addEventListener('click', () => setVibeFilter(btn.dataset.vibe));
    });

    // Custom quote — re-render on input. Keep the background stable:
    // re-resolving on every keystroke would make the gradient flicker.
    customQuoteEl.addEventListener('input', () => {
      if (customQuoteEl.value.trim()) {
        if (applyCustomQuote()) draw();
      }
    });
    customAuthorEl.addEventListener('input', () => {
      if (customQuoteEl.value.trim() && applyCustomQuote()) draw();
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
      // Let buttons (including dropdown triggers and tabs) handle Space/Enter.
      if ((tag === 'BUTTON' || tag === 'A') && (e.key === ' ' || e.key === 'Enter')) return;

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
          currentLayout = 'editorial';
          layoutDropdown.setValue(currentLayout);
          draw();
          break;
        case '2':
          currentLayout = 'ruled';
          layoutDropdown.setValue(currentLayout);
          draw();
          break;
        case '3':
          currentLayout = 'offset';
          layoutDropdown.setValue(currentLayout);
          draw();
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

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) closeAllDropdowns();
    });

    window.addEventListener('resize', draw);

    // Boot
    await document.fonts.ready;

    if (currentLang === 'es') {
      langEs.classList.add('lang-btn--active');
      langEn.classList.remove('lang-btn--active');
    }

    updateUI();
    generate(false, deepLinkQuote);

  } catch (err) {
    console.error('Init failed:', err);
  }
}

init();