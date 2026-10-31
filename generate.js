#!/usr/bin/env node
/**
 * Plaintext · static site generator for SEO pages.
 *
 * Reads data/quotes.json and produces:
 *   quote/<slug>/index.html        (EN quote page)
 *   es/quote/<slug>/index.html     (ES quote page)
 *   quotes/index.html              (EN quote index)
 *   es/quotes/index.html           (ES quote index)
 *   about/index.html               (EN about)
 *   es/about/index.html            (ES about)
 *   es/index.html                  (ES home, app shell copy)
 *   sitemap.xml
 *   robots.txt
 *
 * Also injects the editorial block of index.html between the
 * <!-- EDITORIAL:START --> / <!-- EDITORIAL:END --> markers.
 *
 * Run: node generate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SITE = 'https://mendiak.github.io/plaintext';
const ROOT = __dirname;
const GA_ID = 'G-0FZ0TYV77N';
const TODAY = new Date().toISOString().slice(0, 10);

/* ── helpers ─────────────────────────────────────────── */

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slugify = (s) => {
  const base = String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`"“”‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) return 'quote';
  if (base.length <= 70) return base;
  const cut = base.slice(0, 70);
  const lastDash = cut.lastIndexOf('-');
  return lastDash > 20 ? cut.slice(0, lastDash) : cut;
};

const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
};

const rmDir = (rel) => {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 });
  } catch (err) {
    // Windows can briefly lock files that a browser or editor has open.
    throw new Error(
      `Could not clear ${rel}/ (${err.code}). Close the page or editor holding it and run again.`
    );
  }
};

/* ── content ─────────────────────────────────────────── */

const VIBE_LABEL = {
  en: { calm: 'Calm', serious: 'Serious', chaotic: 'Chaotic' },
  es: { calm: 'Calma', serious: 'Serio', chaotic: 'Caótico' }
};

const T = {
  en: {
    lang: 'en',
    brand: 'Plaintext',
    tagline: 'Quote-driven typographic posters',
    navQuotes: 'Quotes',
    navAbout: 'About',
    navApp: 'Open the generator',
    home: 'Home',
    quoteLead: (text) =>
      `“${text}” as a minimal typographic wallpaper. Generate this quote as a poster for desktop, mobile, Instagram or OG/Twitter: pick the typeface, layout and background, then download a high-resolution PNG.`,
    cta: 'Create this wallpaper',
    ctaNote: 'Opens the generator with this quote preloaded. Free, no sign-up — the PNG carries a discreet logo and URL credit.',
    otherLang: 'Read this quote in Spanish',
    related: 'More quotes',
    browseAll: 'Browse all quotes',
    footerNote: 'Plaintext is a free typography tool. Made by Mikel Aramendia.',
    quoteIndexTitle: 'Quote library',
    quoteIndexLead: (n) =>
      `${n} curated quotes on design, simplicity, technology and craft. Each one is ready to become a minimalist typographic wallpaper.`,
    aboutTitle: 'About Plaintext',
    aboutLead:
      'Plaintext is a small, free tool for turning words into typographic posters. No accounts, no uploads, no tracking of your text: everything is rendered in your browser.',
    backHome: 'Back to Plaintext'
  },
  es: {
    lang: 'es',
    brand: 'Plaintext',
    tagline: 'Wallpapers tipográficos a partir de citas',
    navQuotes: 'Citas',
    navAbout: 'Acerca de',
    navApp: 'Abrir el generador',
    home: 'Inicio',
    quoteLead: (text) =>
      `«${text}» como wallpaper tipográfico minimalista. Genera esta cita como wallpaper para escritorio, móvil, Instagram u OG/Twitter: elige tipografía, composición y fondo, y descarga un PNG en alta resolución.`,
    cta: 'Crear este wallpaper',
    ctaNote: 'Abre el generador con esta cita ya cargada. Gratis, sin registro: el PNG lleva un crédito discreto con el logo y la URL.',
    otherLang: 'Read this quote in English',
    related: 'Más citas',
    browseAll: 'Ver todas las citas',
    footerNote: 'Plaintext es una herramienta tipográfica gratuita. Creada por Mikel Aramendia.',
    quoteIndexTitle: 'Biblioteca de citas',
    quoteIndexLead: (n) =>
      `${n} citas seleccionadas sobre diseño, simplicidad, tecnología y oficio. Todas listas para convertirse en un wallpaper tipográfico minimalista.`,
    aboutTitle: 'Acerca de Plaintext',
    aboutLead:
      'Plaintext es una herramienta pequeña y gratuita para convertir palabras en wallpapers tipográficos. Sin cuentas, sin subidas y sin rastrear tu texto: todo se renderiza en tu navegador.',
    backHome: 'Volver a Plaintext'
  }
};

/* ── load + normalise quotes ─────────────────────────── */

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quotes.json'), 'utf8'));

const seen = new Set();
const usedSlugs = new Set();
const quotes = [];

for (const q of raw) {
  const text = String(q.text || '').trim();
  if (!text) continue;
  const key = text.toLowerCase().replace(/\s+/g, ' ').replace(/[“”"'’]/g, '');
  if (seen.has(key)) continue;
  seen.add(key);

  let slug = slugify(text);
  if (usedSlugs.has(slug)) {
    const suffix = slugify(q.author || '') || 'quote';
    slug = `${slug}-${suffix}`.slice(0, 80);
    let i = 2;
    while (usedSlugs.has(slug)) slug = `${slugify(text).slice(0, 70)}-${i++}`;
  }
  usedSlugs.add(slug);

  quotes.push({
    slug,
    text,
    text_es: String(q.text_es || text).trim(),
    author: String(q.author || 'Anonymous').trim(),
    vibe: ['calm', 'serious', 'chaotic'].includes(q.vibe) ? q.vibe : 'calm'
  });
}

const byVibe = { calm: [], serious: [], chaotic: [] };
quotes.forEach((q) => byVibe[q.vibe].push(q));

const urlFor = (slug, lang) =>
  lang === 'es' ? `${SITE}/es/quote/${slug}/` : `${SITE}/quote/${slug}/`;

/* ── shared partials ─────────────────────────────────── */

const gaSnippet = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  </script>`;

function pageHead({ lang, title, description, canonical, altEn, altEs, rootRel, jsonLd }) {
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${altEn}" />
  <link rel="alternate" hreflang="es" href="${altEs}" />
  <link rel="alternate" hreflang="x-default" href="${altEn}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Plaintext" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/assets/og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE}/assets/og.jpg" />
  <link rel="icon" type="image/png" href="${rootRel}favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${rootRel}assets/quote.css" />
${gaSnippet}
${jsonLd ? `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>` : ''}`;
}

function siteHeader(lang, rootRel) {
  const t = T[lang];
  const other = lang === 'es' ? 'en' : 'es';
  const otherHref = other === 'en' ? `${rootRel}` : `${rootRel}es/`;
  return `  <header class="site-head">
    <a class="site-head__brand" href="${rootRel}">Plaintext</a>
    <nav class="site-head__nav" aria-label="${lang === 'es' ? 'Navegación principal' : 'Main navigation'}">
      <a href="${rootRel}quotes/">${t.navQuotes}</a>
      <a href="${rootRel}about/">${t.navAbout}</a>
      <a href="${rootRel}">${t.navApp}</a>
      <a class="site-head__lang" href="${otherHref}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
    </nav>
  </header>`;
}

function siteFooter(lang, rootRel) {
  const t = T[lang];
  return `  <footer class="site-foot">
    <p>${t.footerNote}</p>
    <p class="site-foot__links">
      <a href="${rootRel}">${t.home}</a>
      <a href="${rootRel}quotes/">${t.quotes || t.navQuotes}</a>
      <a href="${rootRel}about/">${t.navAbout}</a>
      <a href="https://github.com/Mendiak/plaintext" rel="noopener">GitHub</a>
    </p>
  </footer>`;
}

/* ── quote pages ─────────────────────────────────────── */

function pickRelated(q, n = 6) {
  const pool = byVibe[q.vibe].filter((x) => x.slug !== q.slug);
  const start = pool.findIndex((x) => x.author === q.author);
  const ordered = start > 0 ? pool.slice(start).concat(pool.slice(0, start)) : pool;
  return ordered.slice(0, n);
}

function quotePage(q, lang) {
  const t = T[lang];
  const other = lang === 'es' ? 'en' : 'es';
  const rootRel = lang === 'es' ? '../../../' : '../../';
  const text = lang === 'es' ? q.text_es : q.text;
  const otherText = lang === 'es' ? q.text : q.text_es;
  const vibe = VIBE_LABEL[lang][q.vibe];

  const canonical = urlFor(q.slug, lang);
  const altEn = urlFor(q.slug, 'en');
  const altEs = urlFor(q.slug, 'es');
  const quoteUrl = `${canonical}`;
  const appHref = lang === 'es'
    ? `${rootRel}es/?q=${q.slug}`
    : `${rootRel}?q=${q.slug}`;
  const otherHref = `${rootRel}${other === 'es' ? 'es/' : ''}quote/${q.slug}/`;

  const title = lang === 'es'
    ? `«${text}» de ${q.author} · Wallpaper tipográfico`
    : `“${text}” by ${q.author} · Typographic wallpaper`;

  const description = lang === 'es'
    ? `«${text}» de ${q.author}. Genera esta cita como wallpaper tipográfico minimalista para escritorio, móvil e Instagram. Gratis y en alta resolución.`
    : `“${text}” by ${q.author}. Generate this quote as a minimal typographic wallpaper for desktop, mobile and Instagram. Free, high resolution.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Quotation',
        text,
        spokenByCharacter: { '@type': 'Person', name: q.author },
        inLanguage: lang,
        url: quoteUrl
      },
      {
        '@type': 'WebPage',
        name: title,
        url: quoteUrl,
        description,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: 'Plaintext', url: SITE + '/' },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/assets/og.jpg` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Plaintext', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: t.quoteIndexTitle, item: `${SITE}/${lang === 'es' ? 'es/' : ''}quotes/` },
          { '@type': 'ListItem', position: 3, name: `${text} by ${q.author}`, item: quoteUrl }
        ]
      }
    ]
  };

  const related = pickRelated(q)
    .map((r) => {
      const rt = lang === 'es' ? r.text_es : r.text;
      return `        <li><a href="${rootRel}${lang === 'es' ? 'es/' : ''}quote/${r.slug}/"><span class="rel__text">${esc(rt)}</span><span class="rel__author">${esc(r.author)}</span></a></li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${pageHead({ lang, title, description, canonical, altEn, altEs, rootRel, jsonLd })}
</head>
<body class="qp">
${siteHeader(lang, rootRel)}
  <main class="qp__main">
    <p class="eyebrow">${vibe} · ${lang === 'es' ? 'Cita' : 'Quote'}</p>
    <h1 class="qp__quote">${esc(text)}</h1>
    <p class="qp__author">${esc(q.author)}</p>

    <p class="qp__lead">${esc(t.quoteLead(text))}</p>

    <p class="qp__cta">
      <a class="btn" href="${appHref}">${t.cta}</a>
    </p>
    <p class="qp__note">${t.ctaNote}</p>

    <p class="qp__alt">
      <a href="${otherHref}" hreflang="${other}" lang="${other}">${t.otherLang}</a>
      <span class="qp__alt-text">“${esc(otherText)}”</span>
    </p>

    <section class="related" aria-labelledby="related-title">
      <h2 id="related-title">${t.related} · ${vibe}</h2>
      <ul class="related__list">
${related}
      </ul>
      <p class="related__all"><a href="${rootRel}${lang === 'es' ? 'es/' : ''}quotes/">${t.browseAll} →</a></p>
    </section>
  </main>
${siteFooter(lang, rootRel)}
</body>
</html>
`;
}

/* ── quote index ─────────────────────────────────────── */

function quoteIndexPage(lang) {
  const t = T[lang];
  const rootRel = lang === 'es' ? '../../' : '../';
  const canonical = `${SITE}/${lang === 'es' ? 'es/' : ''}quotes/`;
  const altEn = `${SITE}/quotes/`;
  const altEs = `${SITE}/es/quotes/`;
  const title = lang === 'es'
    ? `Biblioteca de citas · ${quotes.length} citas para wallpapers tipográficos`
    : `Quote library · ${quotes.length} quotes for typographic posters`;
  const description = t.quoteIndexLead(quotes.length);

  const sections = ['calm', 'serious', 'chaotic']
    .map((vibe) => {
      const items = byVibe[vibe]
        .map((q) => {
          const qt = lang === 'es' ? q.text_es : q.text;
          return `        <li><a href="${rootRel}${lang === 'es' ? 'es/' : ''}quote/${q.slug}/"><span class="ql__text">${esc(qt)}</span> <span class="ql__author">${esc(q.author)}</span></a></li>`;
        })
        .join('\n');
      return `    <section class="qgroup" aria-labelledby="vibe-${vibe}">
      <h2 id="vibe-${vibe}">${VIBE_LABEL[lang][vibe]}</h2>
      <ul class="qlist">
${items}
      </ul>
    </section>`;
    })
    .join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'Plaintext', url: SITE + '/' }
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${pageHead({ lang, title, description, canonical, altEn, altEs, rootRel, jsonLd })}
</head>
<body class="lp">
${siteHeader(lang, rootRel)}
  <main class="lp__main">
    <p class="eyebrow">${lang === 'es' ? 'Índice' : 'Index'}</p>
    <h1>${t.quoteIndexTitle}</h1>
    <p class="lp__lead">${esc(description)}</p>
${sections}
  </main>
${siteFooter(lang, rootRel)}
</body>
</html>
`;
}

/* ── about ───────────────────────────────────────────── */

function aboutPage(lang) {
  const t = T[lang];
  const rootRel = lang === 'es' ? '../../' : '../';
  const canonical = `${SITE}/${lang === 'es' ? 'es/' : ''}about/`;
  const altEn = `${SITE}/about/`;
  const altEs = `${SITE}/es/about/`;
  const title = lang === 'es' ? 'Acerca de Plaintext · Generador de wallpapers tipográficos' : 'About Plaintext · Typographic wallpaper generator';
  const description = lang === 'es'
    ? 'Qué es Plaintext, cómo funciona, qué formatos exporta y por qué no guarda tus textos. Una herramienta tipográfica gratuita de Mikel Aramendia.'
    : 'What Plaintext is, how it works, which formats it exports and why it never stores your text. A free typography tool by Mikel Aramendia.';

  const body = lang === 'es' ? `
    <h2>Qué es</h2>
    <p>Plaintext convierte una frase en un wallpaper tipográfico. Tomas una cita de la biblioteca o escribes la tuya, eliges tipografía, composición y fondo, y descargas un PNG en la resolución que necesites.</p>
    <p>La idea es deliberadamente estrecha: no es un editor gráfico. Es una herramienta que hace una sola cosa, con la tipografía como único material.</p>

    <h2>Cómo funciona</h2>
    <p>Todo se dibuja en un <code>&lt;canvas&gt;</code> en tu navegador. No hay servidor renderizando imágenes, no hay cuenta y no se sube tu texto a ningún sitio. Cuando pulsas descargar, el PNG se genera en tu dispositivo.</p>

    <h2>Formatos</h2>
    <ul>
      <li>Escritorio · 1920 × 1080</li>
      <li>2K · 2560 × 1440</li>
      <li>4K / UHD · 3840 × 2160</li>
      <li>Ultrawide · 3440 × 1440</li>
      <li>Móvil · 1080 × 1920</li>
      <li>Instagram · 1080 × 1080</li>
      <li>OG / Twitter · 1200 × 630</li>
    </ul>

    <h2>Diseño</h2>
    <p>Las composiciones siguen principios de diseño suizo: retícula, jerarquía y espacio en blanco. Hay tres disposiciones (Editorial, Reglado y Desplazado), dieciséis tipografías de Google Fonts y fondos sólidos, degradados o con patrón tipográfico.</p>

    <h2>Idiomas</h2>
    <p>La interfaz y la biblioteca de citas están disponibles en inglés y español.</p>

    <h2>Quién lo hace</h2>
    <p>Plaintext lo mantiene <a href="https://mendiak.github.io/portfolio/" rel="noopener">Mikel Aramendia</a>. El código es abierto y está en <a href="https://github.com/Mendiak/plaintext" rel="noopener">GitHub</a>.</p>
  ` : `
    <h2>What it is</h2>
    <p>Plaintext turns a sentence into a typographic poster. Take a quote from the library or write your own, choose a typeface, a layout and a background, then download a PNG at the size you need.</p>
    <p>The scope is deliberately narrow: this is not a graphic editor. It is a tool that does one thing, with typography as the only material.</p>

    <h2>How it works</h2>
    <p>Everything is drawn to a <code>&lt;canvas&gt;</code> in your browser. There is no server rendering images, no account and your text is never uploaded anywhere. When you press download, the PNG is produced on your device.</p>

    <h2>Formats</h2>
    <ul>
      <li>Desktop · 1920 × 1080</li>
      <li>2K · 2560 × 1440</li>
      <li>4K / UHD · 3840 × 2160</li>
      <li>Ultrawide · 3440 × 1440</li>
      <li>Mobile · 1080 × 1920</li>
      <li>Instagram · 1080 × 1080</li>
      <li>OG / Twitter · 1200 × 630</li>
    </ul>

    <h2>Design</h2>
    <p>The compositions follow Swiss design principles: grid, hierarchy and whitespace. There are three layouts (Editorial, Ruled and Offset), sixteen Google Fonts, solid or gradient backgrounds, and optional typographic, grid, dot, diagonal or halftone patterns.</p>

    <h2>Languages</h2>
    <p>The interface and the quote library are available in English and Spanish.</p>

    <h2>Who makes it</h2>
    <p>Plaintext is maintained by <a href="https://mendiak.github.io/portfolio/" rel="noopener">Mikel Aramendia</a>. The source is open on <a href="https://github.com/Mendiak/plaintext" rel="noopener">GitHub</a>.</p>
  `;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        name: title,
        description,
        url: canonical,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: 'Plaintext', url: SITE + '/' }
      },
      {
        '@type': 'Person',
        name: 'Mikel Aramendia',
        url: 'https://mendiak.github.io/portfolio/',
        sameAs: ['https://github.com/Mendiak']
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${pageHead({ lang, title, description, canonical, altEn, altEs, rootRel, jsonLd })}
</head>
<body class="lp">
${siteHeader(lang, rootRel)}
  <main class="lp__main">
    <p class="eyebrow">${lang === 'es' ? 'Acerca de' : 'About'}</p>
    <h1>${t.aboutTitle}</h1>
    <p class="lp__lead">${esc(t.aboutLead)}</p>
${body}
    <p class="lp__back"><a href="${rootRel}">${t.backHome} →</a></p>
  </main>
${siteFooter(lang, rootRel)}
</body>
</html>
`;
}

/* ── editorial block (home) ──────────────────────────── */

const COPY = {
  en: {
    eyebrow: 'Plaintext · Typography as art',
    h1: 'Typographic wallpaper generator',
    lead:
      'Plaintext turns a quote into a minimal typographic poster. Pick a quote from 200+ curated lines, choose a typeface, a layout and a background, then download a high-resolution wallpaper for desktop, mobile, Instagram or social previews.',
    featuresTitle: 'What you can make',
    features: [
      ['Desktop wallpapers', '1920 × 1080, 2K, 4K and ultrawide exports, rendered at native resolution.'],
      ['Phone wallpapers', '1080 × 1920 portraits with tighter leading and margins adapted to the format.'],
      ['Instagram posts', 'Square 1080 × 1080 compositions with room for the quote to breathe.'],
      ['OG & Twitter cards', '1200 × 630 previews for articles, newsletters and link previews.'],
      ['Three layouts', 'Editorial, Ruled and Offset, all built on a Swiss grid.'],
      ['Sixteen typefaces', 'Curated Google Fonts, plus solid and gradient backgrounds with optional geometric and typographic patterns.']
    ],
    howTitle: 'How it works',
    how: [
      ['Pick a quote', 'Browse the library by vibe (calm, serious or chaotic) or type your own text.'],
      ['Style it', 'Choose typeface, layout, background and ink. Auto-contrast picks a readable ink for you.'],
      ['Download', 'Export a PNG at the exact resolution you need. No account, no upsells: just one discreet credit, logo in one corner and URL in the other.']
    ],
    libraryTitle: 'Quote library',
    libraryText: (n) =>
      `${n} quotes on design, simplicity, technology and craft, each with an English and Spanish version and its own page.`,
    libraryCta: 'Browse all quotes',
    popularTitle: 'Popular quotes',
    aboutTitle: 'About Plaintext',
    aboutText: [
      'Plaintext is a free, single-purpose tool: it makes typographic posters out of words. It was built for people who like type, and it follows the idea that less is more. No templates, no stickers, no effects.',
      'Everything renders in your browser on a canvas. Your text never leaves your device, there is nothing to sign up for, and each export carries a discreet credit: the Plaintext logo in one corner and the site URL in the other.'
    ],
    aboutCta: 'More about Plaintext',
    faqTitle: 'Frequently asked questions',
    faq: [
      ['Is Plaintext free?', 'Yes. The generator, the quote library and every export are free, with no account and no uploads.'],
      ['What is the mark on the export?', 'A single discreet credit: the Plaintext logo in the bottom-right corner and mendiak.github.io/plaintext in the bottom-left. Neither overlaps the composition.'],
      ['Do I need to install anything?', 'No. It runs in the browser and works on desktop and mobile.'],
      ['Can I use the wallpapers commercially?', 'The quotes are in the public domain or short attributions; the typography comes from Google Fonts under open licences. The generated images are yours to use.'],
      ['Does Plaintext store my text?', 'No. Rendering happens locally on a canvas, so your text is never sent to a server.'],
      ['Which resolution should I choose?', '1920 × 1080 for most screens, 4K for high-density displays, 1080 × 1920 for phones and 1080 × 1080 for Instagram.'],
      ['Is there a Spanish version?', 'Yes. The interface and the quote library are bilingual, and there is a Spanish version of the site.']
    ],
    navQuotes: 'Quotes',
    navAbout: 'About',
    navApp: 'Generator'
  },
  es: {
    eyebrow: 'Plaintext · La tipografía como arte',
    h1: 'Generador de wallpapers tipográficos',
    lead:
      'Plaintext convierte una cita en un wallpaper tipográfico minimalista. Elige entre más de 200 frases seleccionadas, ajusta tipografía, composición y fondo, y descarga un wallpaper en alta resolución para escritorio, móvil, Instagram o previsualizaciones sociales.',
    featuresTitle: 'Qué puedes crear',
    features: [
      ['Wallpapers de escritorio', 'Exportaciones en 1920 × 1080, 2K, 4K y ultrawide, renderizadas a resolución nativa.'],
      ['Wallpapers de móvil', 'Verticales de 1080 × 1920 con interlineado y márgenes adaptados al formato.'],
      ['Posts de Instagram', 'Composiciones cuadradas de 1080 × 1080 con espacio para que la cita respire.'],
      ['Tarjetas OG y Twitter', 'Previsualizaciones de 1200 × 630 para artículos, newsletters y enlaces.'],
      ['Tres composiciones', 'Editorial, Reglado y Desplazado, todas sobre retícula suiza.'],
      ['Dieciséis tipografías', 'Google Fonts seleccionadas, con fondos sólidos, degradados y patrones tipográficos.']
    ],
    howTitle: 'Cómo funciona',
    how: [
      ['Elige una cita', 'Explora la biblioteca por ambiente (calma, serio o caótico) o escribe tu propio texto.'],
      ['Dale estilo', 'Ajusta tipografía, composición, fondo y tinta. El contraste automático elige una tinta legible.'],
      ['Descarga', 'Exporta un PNG en la resolución exacta que necesites. Sin cuenta y sin extras: solo un crédito discreto, el logo en una esquina y la URL en la otra.']
    ],
    libraryTitle: 'Biblioteca de citas',
    libraryText: (n) =>
      `${n} citas sobre diseño, simplicidad, tecnología y oficio, cada una con versión en inglés y español y su propia página.`,
    libraryCta: 'Ver todas las citas',
    popularTitle: 'Citas populares',
    aboutTitle: 'Acerca de Plaintext',
    aboutText: [
      'Plaintext es una herramienta gratuita de un solo propósito: convertir palabras en wallpapers tipográficos. Nace para quien disfruta de la tipografía y sigue la idea de que menos es más: sin plantillas, sin pegatinas y sin efectos.',
      'Todo se renderiza en tu navegador sobre un canvas. Tu texto nunca sale de tu dispositivo, no hay nada que registrar y cada exportación lleva un crédito discreto: la marca de Plaintext en una esquina y la URL del sitio en la otra.'
    ],
    aboutCta: 'Más sobre Plaintext',
    faqTitle: 'Preguntas frecuentes',
    faq: [
      ['¿Plaintext es gratis?', 'Sí. El generador, la biblioteca de citas y todas las exportaciones son gratuitos, sin cuenta y sin subidas.'],
      ['¿Qué es la marca que aparece en la exportación?', 'Un único crédito discreto: el logo de Plaintext en la esquina inferior derecha y mendiak.github.io/plaintext en la inferior izquierda. Ninguno tapa la composición.'],
      ['¿Hay que instalar algo?', 'No. Funciona en el navegador, tanto en escritorio como en móvil.'],
      ['¿Puedo usar los wallpapers comercialmente?', 'Las citas son de dominio público o atribuciones breves y las tipografías son Google Fonts con licencias abiertas. Las imágenes generadas son tuyas.'],
      ['¿Plaintext guarda mi texto?', 'No. El renderizado ocurre en local sobre un canvas, así que tu texto nunca se envía a un servidor.'],
      ['¿Qué resolución debo elegir?', '1920 × 1080 para la mayoría de pantallas, 4K para pantallas de alta densidad, 1080 × 1920 para móviles y 1080 × 1080 para Instagram.'],
      ['¿Existe versión en español?', 'Sí. La interfaz y la biblioteca de citas son bilingües, y el sitio tiene versión en español.']
    ],
    navQuotes: 'Citas',
    navAbout: 'Acerca de',
    navApp: 'Generador'
  }
};

function editorialBlock(lang) {
  const c = COPY[lang];
  const prefix = lang === 'es' ? '../' : './';
  const featured = quotes
    .slice()
    .sort((a, b) => a.text.length - b.text.length)
    .slice(0, 12);

  const features = c.features
    .map(([h, p]) => `        <li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`)
    .join('\n');

  const steps = c.how
    .map(([h, p], i) => `        <li><span class="step__n">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`)
    .join('\n');

  const faq = c.faq
    .map(([q, a]) => `        <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`)
    .join('\n');

  const popular = featured
    .map((q) => {
      const text = lang === 'es' ? q.text_es : q.text;
      return `          <li><a href="${prefix}${lang === 'es' ? 'es/' : ''}quote/${q.slug}/">${esc(text)}<span>${esc(q.author)}</span></a></li>`;
    })
    .join('\n');

  return `<section class="editorial" id="about">
  <div class="editorial__inner">
    <p class="editorial__eyebrow">${esc(c.eyebrow)}</p>
    <h1 class="editorial__title">${esc(c.h1)}</h1>
    <p class="editorial__lead">${esc(c.lead)}</p>

    <h2 class="editorial__h2">${esc(c.featuresTitle)}</h2>
    <ul class="feature-grid">
${features}
    </ul>

    <h2 class="editorial__h2">${esc(c.howTitle)}</h2>
    <ol class="steps">
${steps}
    </ol>

    <div class="editorial__split">
      <div>
        <h2 class="editorial__h2">${esc(c.libraryTitle)}</h2>
        <p>${esc(c.libraryText(quotes.length))}</p>
        <p><a class="editorial__link" href="${prefix}${lang === 'es' ? 'es/' : ''}quotes/">${esc(c.libraryCta)} →</a></p>
      </div>
      <div>
        <h3 class="editorial__h3">${esc(c.popularTitle)}</h3>
        <ul class="mini-list">
${popular}
        </ul>
      </div>
    </div>

    <h2 class="editorial__h2">${esc(c.aboutTitle)}</h2>
    ${c.aboutText.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <p><a class="editorial__link" href="${prefix}${lang === 'es' ? 'es/' : ''}about/">${esc(c.aboutCta)} →</a></p>

    <h2 class="editorial__h2">${esc(c.faqTitle)}</h2>
    <div class="faq">
${faq}
    </div>
  </div>
</section>`;
}

/* ── write everything ────────────────────────────────── */

rmDir('quote');
rmDir('quotes');
rmDir('about');
rmDir('es');

for (const q of quotes) {
  write(`quote/${q.slug}/index.html`, quotePage(q, 'en'));
  write(`es/quote/${q.slug}/index.html`, quotePage(q, 'es'));
}

write('quotes/index.html', quoteIndexPage('en'));
write('es/quotes/index.html', quoteIndexPage('es'));
write('about/index.html', aboutPage('en'));
write('es/about/index.html', aboutPage('es'));

/* ES home = copy of the app shell with translated head + editorial */
const indexSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function headBlock(lang) {
  const canonical = lang === 'es' ? `${SITE}/es/` : `${SITE}/`;
  const title = lang === 'es'
    ? 'Plaintext · Generador de wallpapers tipográficos a partir de citas'
    : 'Plaintext · Typographic wallpaper generator from quotes';
  const description = lang === 'es'
    ? 'Convierte palabras en arte: genera wallpapers tipográficos minimalistas a partir de más de 200 citas. Elige tipografía, composición y fondo, y descarga en escritorio, móvil, Instagram y OG.'
    : 'Transform words into art. Generate minimal typographic wallpapers from 200+ curated quotes. Pick a typeface, layout and background, then download for desktop, mobile, Instagram and OG.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Plaintext',
        url: canonical,
        description,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        inLanguage: lang,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        author: { '@type': 'Person', name: 'Mikel Aramendia', url: 'https://mendiak.github.io/portfolio/' }
      },
      {
        '@type': 'WebSite',
        name: 'Plaintext',
        url: SITE + '/',
        inLanguage: ['en', 'es']
      },
      {
        '@type': 'FAQPage',
        mainEntity: COPY[lang].faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      }
    ]
  };

  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${SITE}/" />
<link rel="alternate" hreflang="es" href="${SITE}/es/" />
<link rel="alternate" hreflang="x-default" href="${SITE}/" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${SITE}/assets/og.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:site_name" content="Plaintext" />
<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${SITE}/assets/og.jpg" />
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
}

function replaceBetween(src, startMarker, endMarker, replacement, label) {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error(`Marker ${label} missing in index.html (${startMarker} / ${endMarker})`);
  }
  return src.slice(0, start + startMarker.length) + '\n' + replacement + '\n' + src.slice(end);
}

/* index.html: EN head + EN editorial */
let out = replaceBetween(indexSrc, '<!-- SEO:START -->', '<!-- SEO:END -->', headBlock('en'), 'SEO');
out = replaceBetween(out, '<!-- EDITORIAL:START -->', '<!-- EDITORIAL:END -->', editorialBlock('en'), 'EDITORIAL');
fs.writeFileSync(path.join(ROOT, 'index.html'), out, 'utf8');

/* es/index.html: same shell, Spanish head + editorial, adjusted asset paths */
let es = replaceBetween(indexSrc, '<!-- SEO:START -->', '<!-- SEO:END -->', headBlock('es'), 'SEO');
es = replaceBetween(es, '<!-- EDITORIAL:START -->', '<!-- EDITORIAL:END -->', editorialBlock('es'), 'EDITORIAL');
es = es.replace('<html lang="en"', '<html lang="es"');
es = es.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <meta name="pt-lang" content="es" />'
);
es = es
  .replace('href="style.css"', 'href="../style.css"')
  .replace('src="main.js"', 'src="../main.js"')
  .replace('href="favicon.png"', 'href="../favicon.png"');

// Footer is shared markup: flip the language link and the credit label for ES.
const esFooterChecks = [
  ['<a href="./es/" hreflang="es" lang="es">Español</a>', '<a href="../" hreflang="en" lang="en">English</a>'],
  ['<span id="credit-text">by</span>', '<span id="credit-text">por</span>'],
  ['<a href="./quotes/">Quotes</a>', '<a href="./quotes/">Citas</a>'],
  ['<a href="./about/">About</a>', '<a href="./about/">Acerca de</a>']
];
for (const [from, to] of esFooterChecks) {
  if (!es.includes(from)) throw new Error(`Footer marker missing in index.html: ${from}`);
  es = es.replace(from, to);
}

write('es/index.html', es);

/* ── sitemap + robots ────────────────────────────────── */

const urls = [];

const addUrl = (loc, en, es) => urls.push({ loc, en, es });

addUrl(`${SITE}/`, `${SITE}/`, `${SITE}/es/`);
addUrl(`${SITE}/es/`, `${SITE}/`, `${SITE}/es/`);
addUrl(`${SITE}/quotes/`, `${SITE}/quotes/`, `${SITE}/es/quotes/`);
addUrl(`${SITE}/es/quotes/`, `${SITE}/quotes/`, `${SITE}/es/quotes/`);
addUrl(`${SITE}/about/`, `${SITE}/about/`, `${SITE}/es/about/`);
addUrl(`${SITE}/es/about/`, `${SITE}/about/`, `${SITE}/es/about/`);

for (const q of quotes) {
  addUrl(urlFor(q.slug, 'en'), urlFor(q.slug, 'en'), urlFor(q.slug, 'es'));
  addUrl(urlFor(q.slug, 'es'), urlFor(q.slug, 'en'), urlFor(q.slug, 'es'));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${u.en}" />
    <xhtml:link rel="alternate" hreflang="es" href="${u.es}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.en}" />
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  'utf8'
);

console.log(`Generated ${quotes.length} quotes · ${urls.length} URLs`);
