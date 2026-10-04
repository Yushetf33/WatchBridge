// Pasa la web de "Google Play en prueba cerrada" a "Google Play ya publicada".
//
//   node tools/go-live.mjs --dry     prueba todo en una copia temporal (no toca nada)
//   node tools/go-live.mjs           aplica los cambios en docs/ y README.md, regenera y comprueba
//
// Antes de aplicarlo hay que bajar la insignia OFICIAL de Google Play (no se puede modificar):
//   https://play.google.com/intl/en_us/badges/  →  docs/google-play-badge.png (inglés)
//                                                   docs/google-play-badge-es.png (español)
// Si falta alguna cadena esperada, el script se detiene sin escribir nada.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DRY = process.argv.includes('--dry');
const PLAY = 'https://play.google.com/store/apps/details?id=com.tunombre.tvbridge.play';
const TESTING = 'https://play.google.com/apps/testing/com.tunombre.tvbridge.play';

let DOCS = path.join(ROOT, 'docs'), README = path.join(ROOT, 'README.md');
if (DRY) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-golive-'));
  fs.cpSync(path.join(ROOT, 'docs'), path.join(tmp, 'docs'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'README.md'), path.join(tmp, 'README.md'));
  DOCS = path.join(tmp, 'docs'); README = path.join(tmp, 'README.md');
  // insignias de mentira, solo para que la prueba pase
  for (const f of ['google-play-badge.png', 'google-play-badge-es.png']) fs.copyFileSync(path.join(DOCS, 'logo-32.png'), path.join(DOCS, f));
  console.log('PRUEBA en', tmp, '\n');
}
const badgeEn = path.join(DOCS, 'google-play-badge.png'), badgeEs = path.join(DOCS, 'google-play-badge-es.png');
if (!fs.existsSync(badgeEn)) { console.error('Falta docs/google-play-badge.png (insignia oficial de Google Play). Descárgala de https://play.google.com/intl/en_us/badges/'); process.exit(1); }
if (!fs.existsSync(badgeEs)) console.warn('Aviso: falta docs/google-play-badge-es.png; la versión en español usará la inglesa.');
const badgeEsName = fs.existsSync(badgeEs) ? 'google-play-badge-es.png' : 'google-play-badge.png';

const fail = (m) => { console.error('✗', m); process.exit(1); };
const read = (f) => { const s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); return { s: crlf ? s.replace(/\r\n/g, '\n') : s, crlf }; };
const write = (f, o) => fs.writeFileSync(f, o.crlf ? o.s.replace(/\n/g, '\r\n') : o.s);
const once = (o, a, b, l) => { const n = o.s.split(a).length - 1; if (n !== 1) fail(`${l}: ${n} coincidencias para «${a.slice(0, 80)}»`); o.s = o.s.replace(a, () => b); };
const many = (o, a, b, l, exp) => { const n = o.s.split(a).length - 1; if (n !== exp) fail(`${l}: ${n}≠${exp}`); o.s = o.s.split(a).join(b); };

// -- diccionario espanol: localizar, leer y reescribir
function dictSpan(src) {
  const start = src.indexOf('tvrbApplyI18n(');
  if (start < 0) fail('no hay diccionario');
  let depth = 0, i = src.indexOf('{', start), inStr = false, esc = false;
  const open = i;
  for (; i < src.length; i++) { const c = src[i]; if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; } if (c === '"') inStr = true; else if (c === '{') depth++; else if (c === '}' && --depth === 0) break; }
  return { open, close: i + 1 };
}
function editDict(o, fn) {
  const { open, close } = dictSpan(o.s);
  const dict = vm.runInNewContext('(' + o.s.slice(open, close) + ')');
  fn(dict);
  o.s = o.s.slice(0, open) + JSON.stringify(dict, null, 4).replace(/^/gm, '  ').trimStart() + o.s.slice(close);
}

// ============================================================ portada
{ const f = path.join(DOCS, 'index.html'); const o = read(f);
  if (o.s.includes(PLAY)) fail('index.html ya está en modo "publicada"');

  // botón principal del hero -> insignia oficial
  const heroBtn = `          <a href="#install" class="cta-primary" style="padding: 15px 26px; font-size: 15.5px;">
            <span data-i18n="cta.get">Get WatchBridge</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="#0B0D12" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>`;
  once(o, heroBtn, `          <a href="${PLAY}" target="_blank" rel="noopener" data-i18n="badge.link" style="display: inline-flex;"><img src="google-play-badge.png" alt="Get it on Google Play" height="56" style="height: 56px; width: auto;"></a>`, 'hero-cta');
  // botón de la cabecera
  once(o, '<a href="#install" class="cta-primary" style="padding: 9px 18px; font-size: 13.5px; flex-shrink: 0;" data-i18n="cta.get">Get WatchBridge</a>',
    `<a href="${PLAY}" target="_blank" rel="noopener" class="cta-primary" style="padding: 9px 18px; font-size: 13.5px; flex-shrink: 0;" data-i18n="cta.get">Get WatchBridge</a>`, 'nav-cta');
  // tarjeta de instalación
  once(o, 'In closed testing now — join the test to install it from the Play Store. The public release is on its way.', 'Install it straight from the Play Store on your Google TV.', 'card-body');
  once(o, `<a href="${TESTING}" target="_blank" rel="noopener" style="font-size: 14px; font-weight: 600;" data-i18n="inst.c1l">Join the closed test</a>`,
    `<a href="${PLAY}" target="_blank" rel="noopener" style="font-size: 14px; font-weight: 600;" data-i18n="inst.c1l">Open in Google Play</a>`, 'card-link');
  // FAQ (texto visible y JSON-LD)
  many(o, 'A Google Play version is in closed testing and heading for public release. Until then you can install the APK, which works the same way.',
    'Yes. Install it from Google Play on your Google TV. On Fire TV, which has no Google Play, you install the APK instead — it works the same way.', 'faq8', 2);
  // nota de pago
  once(o, 'Scan the QR code shown in the app with your phone, pay with the same email, then verify it on the TV.',
    'On Google Play, buy it with your Google account right from the TV. With the APK, scan the QR code shown in the app and pay with your phone.', 'price-note');
  // espanol
  editDict(o, (d) => {
    const chk = (k) => { if (!(k in d)) fail('falta la clave ' + k); };
    ['inst.c1b', 'inst.c1l', 'faq.a8', 'price.footnote'].forEach(chk);
    d['inst.c1b'] = 'Instálala directamente desde Play Store en tu Google TV.';
    d['inst.c1l'] = 'Abrir en Google Play';
    d['faq.a8'] = 'Sí. Instálala desde Google Play en tu Google TV. En Fire TV, que no tiene Google Play, se instala el APK, que funciona igual.';
    d['price.footnote'] = 'En Google Play, cómpralo con tu cuenta de Google directamente desde la TV. Con el APK, escanea el código QR que muestra la app y paga con el móvil.';
    d['badge.link'] = `<img src="${badgeEsName}" alt="Disponible en Google Play" height="56" style="height: 56px; width: auto;">`;
  });
  write(f, o); console.log('✓ index.html'); }

// ============================================================ guia de instalacion
{ const f = path.join(DOCS, 'install.html'); const o = read(f);
  once(o, `It's now in closed testing on
      <a href="${TESTING}">Google Play</a> — or install it manually`, `It's on
      <a href="${PLAY}">Google Play</a> — or install it manually`, 'install-lede');
  editDict(o, (d) => {
    if (!d.lede || !d.lede.includes('prueba cerrada')) fail('install: el lede en español no contiene «prueba cerrada»');
    d.lede = d.lede.replace(/Ya está en prueba cerrada en\s*<a href=\\?"[^"]*"|Ya está en prueba cerrada en\s*<a href="[^"]*"/, `Ya está en\n      <a href="${PLAY}"`);
    if (d.lede.includes('prueba cerrada')) fail('install: no se pudo reescribir el lede en español');
  });
  write(f, o); console.log('✓ install.html'); }

// ============================================================ README
{ const o = read(README);
  once(o, `WatchBridge TV is not currently distributed through Google Play. The app is installed manually ("sideloaded") using the APK file available in this repository's releases section.`,
    `WatchBridge TV is available on [Google Play](${PLAY}). You can also install the APK manually ("sideloaded") from this repository's releases section — that is the way to go on Fire TV, which has no Google Play.`, 'readme');
  write(README, o); console.log('✓ README.md'); }

// ============================================================ regenerar y comprobar
const env = { ...process.env, SITE_DOCS: DOCS };
for (const [label, script] of [['build', 'build.mjs'], ['check', 'check.mjs']]) {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', script)], { env, encoding: 'utf8' });
  const tailLines = (r.stdout + r.stderr).trim().split('\n').slice(-3).join('\n');
  console.log(`\n${label}:\n${tailLines}`);
  if (r.status !== 0) fail(`${label} falló`);
}
const leftover = fs.readdirSync(DOCS, { recursive: true }).filter((f) => String(f).endsWith('.html')).filter((f) => /prueba cerrada|closed test/i.test(fs.readFileSync(path.join(DOCS, String(f)), 'utf8')));
console.log('\nPáginas que aún mencionan la prueba cerrada:', leftover.length ? leftover.join(', ') : 'ninguna');
console.log(DRY ? '\nPrueba terminada: no se ha tocado nada del sitio real.' : '\nListo. Revisa el resultado y haz commit + push.');
