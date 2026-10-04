// Comprobaciones del sitio generado. uso: node tools/check.mjs   (sale con codigo 1 si hay errores)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const DOCS = process.env.SITE_DOCS ? path.resolve(process.env.SITE_DOCS) : path.resolve(import.meta.dirname, '..', 'docs');
const SITE = 'https://watchbridge.app';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const all = walk(DOCS).map((f) => path.relative(DOCS, f).replace(/\\/g, '/'));
const htmlFiles = all.filter((f) => f.endsWith('.html') && f !== 'google8b965508e94c9d19.html');
const exists = new Set(all);
const urlToFile = (u) => { u = u.replace(/^\//, ''); if (u === '' || u.endsWith('/')) u += 'index.html'; return u; };

const docs = new Map();
for (const f of htmlFiles) docs.set(f, new JSDOM(fs.readFileSync(path.join(DOCS, f), 'utf8')).window.document);

let errors = 0, warnings = 0;
const err = (m) => { errors++; console.log('  ✗', m); };
const warn = (m) => { warnings++; console.log('  !', m); };

for (const [f, doc] of docs) {
  console.log(f);
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const isNoindex = /noindex/.test(doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '');
  // --- enlaces internos y anclas
  for (const el of doc.querySelectorAll('[href],[src],[poster]')) {
    for (const attr of ['href', 'src', 'poster']) {
      const v = el.getAttribute(attr); if (v === null) continue;
      if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(v) && !v.startsWith(SITE)) continue;
      let target = v.startsWith(SITE) ? v.slice(SITE.length) || '/' : v;
      const [pq, hash] = target.split('#'); const p = pq.split('?')[0]; // el ?v=n solo evita la cache
      let file;
      if (p === '') file = f;
      else if (p.startsWith('/')) file = urlToFile(p);
      else {
        // ruta relativa a la pagina actual; './' y '' significan la raiz de esa carpeta
        const joined = path.posix.normalize(path.posix.join(path.posix.dirname(f), p));
        file = urlToFile(joined === '.' || joined === './' ? '' : joined);
      }
      if (!exists.has(file)) { err(`${attr}="${v}" → no existe ${file}`); continue; }
      if (hash && file.endsWith('.html') && docs.has(file) && !docs.get(file).getElementById(hash)) err(`ancla #${hash} no existe en ${file} (desde ${attr}="${v}")`);
    }
  }
  if (isNoindex || f === '404.html') continue;
  // --- canonica y metadatos
  const expected = SITE + '/' + (f === 'index.html' ? '' : f.endsWith('/index.html') ? f.slice(0, -10) : f);
  if (canonical !== expected) err(`canónica ${canonical} ≠ esperada ${expected}`);
  const title = doc.querySelector('title')?.textContent.trim() || '', desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  if (!title) err('sin <title>'); else if (title.length > 75) warn(`título largo (${title.length})`);
  if (!desc) err('sin meta description'); else if (desc.length > 165) warn(`descripción larga (${desc.length})`); else if (desc.length < 70) warn(`descripción corta (${desc.length})`);
  if (doc.querySelectorAll('h1').length !== 1) err('debe haber exactamente un <h1>');
  // --- JSON-LD
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) { try { JSON.parse(s.textContent); } catch (e) { err('JSON-LD inválido: ' + e.message); } }
  // --- hreflang recíproco
  const alts = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]);
  for (const [lang, href] of alts) {
    if (lang === 'x-default') continue;
    const file = urlToFile(href.replace(SITE, ''));
    const other = docs.get(file);
    if (!other) { err(`hreflang ${lang} apunta a ${href}, que no existe`); continue; }
    const back = [...other.querySelectorAll('link[rel="alternate"][hreflang]')].find((l) => l.getAttribute('hreflang') === (doc.documentElement.lang) );
    if (!back || back.getAttribute('href') !== canonical) err(`hreflang no recíproco con ${href}`);
    if (lang !== other.documentElement.lang) err(`hreflang="${lang}" pero ${file} declara lang="${other.documentElement.lang}"`);
  }
  if (f.startsWith('es/')) {
    if (doc.documentElement.lang !== 'es') err('html lang debería ser es');
    if (doc.querySelector('[data-i18n]')) err('quedan atributos data-i18n');
    if ([...doc.querySelectorAll('script')].some((s) => s.textContent.includes('tvrbApplyI18n') || s.src?.includes('i18n.js'))) err('queda la traducción por JavaScript');
  }
  if (!doc.querySelector('meta[property="og:image"]')) warn('sin og:image');
}

// --- texto sin traducir en las paginas espanolas generadas
console.log('\nTexto sin traducir (idéntico al inglés) en las páginas /es/:');
const vis = (doc) => { const out = []; const w = doc.createTreeWalker(doc.body, 4); let n; while ((n = w.nextNode())) { if (n.parentElement.closest('script,style')) continue; const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t.length > 2) out.push(t); } return out; };
const BRANDS = /^(WatchBridge( TV| Mobile)?|Nuvio|Stremio|Plex|Jellyfin|WuPlay|Wholphin|SmartTube|TizenTube Cobalt|TMDB|Fire TV|Google TV|Android TV|APK|ADB|OK|Downloader|iOS|Wuplay)$/;
for (const f of ['index.html', 'install.html', 'setup.html', 'apps.html']) {
  const enSet = new Set(vis(docs.get(f)));
  const same = vis(docs.get('es/' + f)).filter((t) => enSet.has(t) && /[A-Za-z]{3,}/.test(t) && !BRANDS.test(t) && !/^[\W\d_]+$/.test(t) && !/^[A-Z0-9 .:·€,/+()-]+$/.test(t));
  console.log(` es/${f}: ${same.length}`, same.length ? '\n    - ' + [...new Set(same)].slice(0, 25).join('\n    - ') : '');
}
console.log(`\n${errors} error(es), ${warnings} aviso(s) en ${htmlFiles.length} páginas`);
process.exit(errors ? 1 : 0);
