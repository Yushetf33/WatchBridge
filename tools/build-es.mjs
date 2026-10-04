// Genera la version en espanol de la web (docs/es/) a partir de las paginas en ingles.
//
// Las paginas en ingles llevan un diccionario espanol que el navegador aplica con JavaScript
// (i18n.js). Google no lo ve, asi que aqui se aplica EN EL HTML: cada elemento con data-i18n
// recibe su traduccion, se reescriben los enlaces para que funcionen desde /es/, se ponen
// titulo/descripcion/canonica en espanol y se quitan los scripts de traduccion.
//
// uso: node tools/build-es.mjs      (lo llama tools/build.mjs)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const DOCS = path.resolve(import.meta.dirname, '..', 'docs');
const SITE = 'https://watchbridge.app';

// Paginas que tienen traduccion. El resto (apps, privacy...) se enlazan en ingles.
const PAGES = {
  'index.html': {
    url: '/es/',
    en: '/',
    title: 'WatchBridge TV — Recomendaciones de Google TV en Nuvio, Plex y Jellyfin',
    desc: 'Abre las recomendaciones de Google TV y Fire TV en la app que de verdad usas: Nuvio, Stremio, Plex, Jellyfin, WuPlay o Wholphin. 4,99 € una vez, 2 días gratis.',
  },
  'install.html': {
    url: '/es/install.html',
    en: '/install.html',
    title: 'Instalar WatchBridge TV en Google TV y Fire TV — APK, Downloader, ADB',
    desc: 'Guía paso a paso para instalar WatchBridge TV en Android TV, Google TV y Fire TV: instala el APK, activa la accesibilidad y sin root.',
  },
  'apps.html': {
    url: '/es/apps.html',
    en: '/apps.html',
    title: 'WuPlay, Nuvio, Jellyfin y más: apps compatibles | WatchBridge',
    desc: 'Compara WuPlay, Nuvio, Stremio, Jellyfin, Plex y Wholphin: cómo funciona cada uno con WatchBridge en Google TV y Fire TV y cómo cambiar entre ellos.',
  },
  'setup.html': {
    url: '/es/setup.html',
    en: '/setup.html',
    title: 'Configuración y solución de problemas — WatchBridge TV',
    desc: 'Arregla la Accesibilidad que se apaga sola, configura el modo Fire TV, la búsqueda por voz y Jellyfin, y resuelve fallos en Google TV Streamer, TCL, Nuvio o Stremio.',
  },
};

const OG_ALT = 'Pantalla de inicio de WatchBridge TV con la fila Continuar viendo y las sugerencias de Recomendado para ti';
const SHOT_ALT = {
  'screenshot-home.jpg': 'Pantalla de inicio de WatchBridge TV: filas de Continuar viendo y Recomendado para ti',
  'screenshot-calendar.jpg': 'Calendario de WatchBridge TV con las fechas de los próximos episodios de las series que sigues',
  'screenshot-search.jpg': 'Pantalla de búsqueda de WatchBridge TV con búsqueda por voz',
};

// Enlaces relativos de las paginas en ingles -> su equivalente desde /es/
const PAGE_MAP = {
  'index.html': '/es/',
  './': '/es/',
  '': '/es/',
  'install.html': '/es/install.html',
  'setup.html': '/es/setup.html',
  'apps.html': '/es/apps.html',
  'guides/': '/es/guias/',
};

function rewrite(value) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(value)) return value; // absoluto, ancla, mailto…
  const m = value.match(/^([^#?]*)([#?].*)?$/);
  const base = m[1], rest = m[2] || '';
  if (base in PAGE_MAP) return PAGE_MAP[base] + rest;
  return '/' + base + rest; // apps.html, privacy.html, imagenes, videos…
}

// Extrae el literal del objeto de tvrbApplyI18n({...}) y su posicion para poder quitarlo.
function findDictCall(source) {
  const start = source.indexOf('tvrbApplyI18n(');
  if (start < 0) throw new Error('no hay diccionario en la pagina');
  const open = source.indexOf('{', start);
  let depth = 0, i = open, inStr = false, esc = false;
  for (; i < source.length; i++) {
    const c = source[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) break;
  }
  let end = i + 1;
  while (/[\s)]/.test(source[end] || '')) end++; // ')' y espacios
  if (source[end] === ';') end++;
  return { literal: source.slice(open, i + 1), start, end };
}

const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/&amp;/g, '&').trim();
const setMeta = (doc, sel, value) => { const el = doc.querySelector(sel); if (!el) throw new Error('falta ' + sel); el.setAttribute('content', value); };

function transformJsonLd(doc, name, cfg, dict) {
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const data = JSON.parse(script.textContent);
    if (data['@type'] === 'SoftwareApplication') {
      data.url = SITE + cfg.url;
      data.description = cfg.desc;
      data.inLanguage = 'es';
      if (data.offers) data.offers.description = 'Pago único de 4,99 € tras una prueba gratuita de 2 días, sin tarjeta para empezar la prueba.';
      data.featureList = [
        'Abre las recomendaciones de Google TV y Fire TV en Nuvio, Stremio, Plex, Jellyfin, WuPlay o Wholphin',
        'Búsqueda por voz que abre el título en tu reproductor',
        'Recomendado para ti, Continuar viendo, Mi lista y un calendario de próximos episodios',
        'App para móvil y tablet con Enviar a la TV',
        'Guía de TV en directo con marcadores para tu propia lista IPTV',
      ];
    } else if (data['@type'] === 'VideoObject') {
      data.name = 'WatchBridge TV — tour de 45 segundos';
      data.description = 'WatchBridge TV abre en tu reproductor las recomendaciones de Google TV, las búsquedas por voz y las sugerencias de Sorpréndeme, y se sincroniza con el móvil: recomendaciones, Mi lista, calendario y guía de TV en directo.';
    } else if (data['@type'] === 'FAQPage') {
      // setup usa tr.q1..n / tr.a1..n (con el codigo E0n delante); apps usa faq.q1..n / faq.a1..n
      const items = [];
      const prefix = dict['faq.q1'] ? 'faq' : 'tr';
      for (let n = 1; n <= 12; n++) {
        const q = dict[`${prefix}.q${n}`], a = dict[`${prefix}.a${n}`];
        if (!q || !a) continue;
        const name = prefix === 'tr' ? `E0${n} — ${stripTags(q)}` : stripTags(q);
        items.push({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } });
      }
      if (!items.length) throw new Error(name + ': no se pudo construir el FAQ en español');
      data.mainEntity = items;
    }
    script.textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
  }
}

export function buildEs() {
  fs.mkdirSync(path.join(DOCS, 'es'), { recursive: true });
  const report = [];
  for (const [file, cfg] of Object.entries(PAGES)) {
    const html = fs.readFileSync(path.join(DOCS, file), 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // 1) diccionario espanol, sacado del script inline
    const scripts = [...doc.querySelectorAll('script:not([src]):not([type])')];
    const holder = scripts.find((s) => s.textContent.includes('tvrbApplyI18n('));
    const { literal, start, end } = findDictCall(holder.textContent);
    const dict = vm.runInNewContext('(' + literal + ')');

    // 2) traducir el HTML
    let translated = 0, missing = [];
    for (const el of doc.querySelectorAll('[data-i18n]')) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) { el.innerHTML = dict[key]; translated++; } else missing.push(key);
      el.removeAttribute('data-i18n');
    }

    // 3) quitar la traduccion por JavaScript (ya esta en el HTML) y el selector de idioma
    holder.textContent = holder.textContent.slice(0, start) + holder.textContent.slice(end);
    doc.querySelector('script[src$="i18n.js"]')?.remove();

    // 4) metadatos
    doc.documentElement.setAttribute('lang', 'es');
    doc.querySelector('title').textContent = cfg.title;
    setMeta(doc, 'meta[name="description"]', cfg.desc);
    setMeta(doc, 'meta[property="og:title"]', cfg.title);
    setMeta(doc, 'meta[property="og:description"]', cfg.desc);
    setMeta(doc, 'meta[property="og:url"]', SITE + cfg.url);
    setMeta(doc, 'meta[property="og:locale"]', 'es_ES');
    setMeta(doc, 'meta[property="og:image:alt"]', OG_ALT);
    setMeta(doc, 'meta[name="twitter:title"]', cfg.title);
    setMeta(doc, 'meta[name="twitter:description"]', cfg.desc);
    setMeta(doc, 'meta[name="twitter:image:alt"]', OG_ALT);
    doc.querySelector('link[rel="canonical"]').setAttribute('href', SITE + cfg.url);
    for (const img of doc.querySelectorAll('img[src^="screenshot-"]')) if (SHOT_ALT[img.getAttribute('src')]) img.setAttribute('alt', SHOT_ALT[img.getAttribute('src')]);
    const video = doc.querySelector('.hero-video video');
    if (video) video.setAttribute('aria-label', 'WatchBridge TV — tour de 45 segundos');

    // 5) selector de idioma -> ingles
    for (const a of doc.querySelectorAll('[data-lang-switch]')) {
      a.setAttribute('href', cfg.en); a.setAttribute('hreflang', 'en'); a.setAttribute('lang', 'en');
      a.setAttribute('data-lang-switch', 'en'); a.textContent = 'English';
    }

    // 6) datos estructurados
    transformJsonLd(doc, file, cfg, dict);

    // 7) enlaces relativos (despues de traducir, porque las traducciones traen enlaces)
    for (const el of doc.querySelectorAll('[href],[src],[poster]')) {
      for (const attr of ['href', 'src', 'poster']) {
        const v = el.getAttribute(attr);
        if (v !== null && el.tagName !== 'BASE') el.setAttribute(attr, rewrite(v));
      }
    }
    // el <link rel=preload as=image href=…> tambien pasa por aqui (href)

    // 8) video de la portada con los rotulos en espanol (el resto de idiomas usa el ingles)
    if (file === 'index.html') {
      doc.querySelector('.hero-video video')?.setAttribute('poster', '/watchbridge-promo-es-poster.jpg');
      doc.querySelector('.hero-video video source')?.setAttribute('src', '/watchbridge-promo-es.mp4');
      doc.querySelector('link[rel="preload"][as="image"]')?.setAttribute('href', '/watchbridge-promo-es-poster.jpg');
      for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'VideoObject') {
          data.contentUrl = SITE + '/watchbridge-promo-es.mp4';
          data.thumbnailUrl = SITE + '/watchbridge-promo-es-poster.jpg';
          script.textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
        }
      }
    }

    const out = path.join(DOCS, 'es', file);
    fs.writeFileSync(out, dom.serialize());
    report.push({ file: 'es/' + file, translated, missing: [...new Set(missing)] });
  }
  return report;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  for (const r of buildEs()) console.log(r.file, '— traducidos:', r.translated, r.missing.length ? '| SIN traducción: ' + r.missing.join(', ') : '');
}
