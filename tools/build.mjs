// Regenera todo lo derivado: version en espanol, guias y sitemap.
// uso: npm run build     (despues de editar cualquier pagina en ingles)
import fs from 'node:fs';
import path from 'node:path';
import { buildEs } from './build-es.mjs';
import { buildGuides } from './build-guides.mjs';

const DOCS = process.env.SITE_DOCS ? path.resolve(process.env.SITE_DOCS) : path.resolve(import.meta.dirname, '..', 'docs');
const SITE = 'https://watchbridge.app';

const es = buildEs();
const guides = buildGuides();
for (const r of es) {
  console.log(r.file.padEnd(18), 'traducidos:', r.translated, r.missing.length ? '| SIN traducción: ' + r.missing.join(', ') : '');
  if (r.missing.length) process.exitCode = 1;
}
console.log('guías:', guides.length, 'archivos');

// ---- sitemap: cada pagina con su alternativa de idioma (hreflang)
const read = (p) => fs.readFileSync(path.join(DOCS, p), 'utf8');
const lastmod = new Date().toISOString().slice(0, 10);
const guideSlugs = [...read('guides/index.html').matchAll(/href="\/guides\/([^"]+\.html)"/g)].map((m) => m[1]);
const esGuideSlugs = [...read('es/guias/index.html').matchAll(/href="\/es\/guias\/([^"]+\.html)"/g)].map((m) => m[1]);
if (guideSlugs.length !== esGuideSlugs.length) throw new Error('guias EN/ES desparejadas');

const pairs = [
  ['/', '/es/'],
  ['/install.html', '/es/install.html'],
  ['/setup.html', '/es/setup.html'],
  ['/apps.html', '/es/apps.html'],
  ['/guides/', '/es/guias/'],
  ...guideSlugs.map((s, i) => ['/guides/' + s, '/es/guias/' + esGuideSlugs[i]]),
];
const single = ['/privacy.html']; // solo en inglés
const entry = (loc, alts) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alts}  </url>\n`;
const links = (en, es) => `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/>\n    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${es}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${en}"/>\n`;

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
for (const [en, es] of pairs) xml += entry(en, links(en, es)) + entry(es, links(en, es));
for (const p of single) xml += entry(p, '');
xml += '</urlset>\n';
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), xml);
console.log('sitemap:', pairs.length * 2 + single.length, 'URLs');
