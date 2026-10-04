// Genera las guias (articulos) de la web, en ingles (docs/guides/) y espanol (docs/es/guias/).
// Reutiliza el CSS de setup.html para que se vean igual que el resto de paginas.
//
// uso: node tools/build-guides.mjs      (lo llama tools/build.mjs)
import fs from 'node:fs';
import path from 'node:path';

const DOCS = path.resolve(import.meta.dirname, '..', 'docs');
const SITE = 'https://watchbridge.app';
const DATE = '2026-10-04';
const OG_ALT = {
  en: 'WatchBridge TV home screen with a Continue watching row and Recommended for you suggestions',
  es: 'Pantalla de inicio de WatchBridge TV con la fila Continuar viendo y las sugerencias de Recomendado para ti',
};

const css = fs.readFileSync(path.join(DOCS, 'setup.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA_CSS = `<style>
  article h2 { font-size: 1.4rem; margin: 2.6rem 0 0.9rem; padding-bottom: 0.6rem; border-bottom: 2px solid var(--border); }
  article p { margin: 0 0 1.05rem; }
  article ul, article ol { margin: 0 0 1.2rem; padding-left: 1.3rem; display: flex; flex-direction: column; gap: 0.5rem; }
  article a { color: var(--accent-strong); }
  article strong { color: var(--text); }
  .table-wrap { overflow-x: auto; margin: 0 0 1.4rem; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
  table { border-collapse: collapse; width: 100%; font-size: 0.92rem; min-width: 560px; }
  th, td { text-align: left; padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); font-weight: 500; }
  tr:last-child td { border-bottom: none; }
  .cards { display: grid; gap: 1rem; margin-top: 1.5rem; }
  .card { display: block; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.3rem 1.4rem; text-decoration: none; color: var(--text); box-shadow: var(--shadow); }
  .card:hover { border-color: var(--accent); }
  .card h2 { font-size: 1.15rem; border: 0; margin: 0 0 0.4rem; padding: 0; }
  .card p { margin: 0; color: var(--text-muted); font-size: 0.92rem; }
  .cta { display: flex; flex-wrap: wrap; gap: 0.7rem; margin: 1.6rem 0 0; }
  .cta a { background: var(--accent); color: var(--accent-ink); text-decoration: none; font-weight: 700; padding: 0.7rem 1.1rem; border-radius: 10px; font-size: 0.92rem; }
  .cta a.alt { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
</style>`;

// ---------------------------------------------------------------- contenido
const GUIDES = {
  open: {
    en: {
      slug: 'open-google-tv-recommendations-in-nuvio',
      title: 'How to open Google TV recommendations in Nuvio, Stremio or Plex',
      desc: 'Google TV opens each recommendation in the app it came from. Here is how to send it to Nuvio, Stremio, Plex or Jellyfin instead, step by step.',
      eyebrow: 'Guide',
      lede: 'Google TV recommends movies and shows on its home screen, but clicking one opens the app it came from — not the player you actually use. <strong>WatchBridge TV</strong> catches that click and opens the same title in the app you chose. This guide covers the whole path, from install to your first redirected recommendation.',
      body: `
<h2>What you need</h2>
<ul>
  <li>A <strong>Google TV / Android TV</strong> device or a <strong>Fire TV</strong>.</li>
  <li>One of the supported players installed: <strong>Nuvio, Stremio, Plex, Jellyfin, WuPlay or Wholphin</strong>.</li>
  <li><strong>WatchBridge TV</strong> — a 2-day free trial with no card, then €4.99 once. No subscription.</li>
</ul>
<div class="callout"><strong>WatchBridge doesn't provide or host any content.</strong> It only opens the title in the app you already use, so you still need your own sources or subscriptions in that app.</div>

<h2>Step by step</h2>
<ol>
  <li><strong>Install WatchBridge TV.</strong> Follow the <a href="/install.html">install guide</a>: the APK goes on the TV with Downloader, Send Files to TV or ADB.</li>
  <li><strong>Turn it on.</strong> On Google TV, WatchBridge uses Android's Accessibility service in a narrow way: it only watches for clicks on the launcher's recommendation cards, and ignores every other click. If the toggle switches itself off, see the <a href="/setup.html#errors">troubleshooting guide</a>. On Fire TV, Fire OS blocks Accessibility for sideloaded apps, so there is a dedicated <strong>Fire TV mode</strong> instead — see <a href="/setup.html#firetv">Fire TV mode</a>.</li>
  <li><strong>Pick your player.</strong> In Settings choose Nuvio, Stremio, Plex, Jellyfin, WuPlay or Wholphin. You can change it any time, with no reinstall. If you use a Nuvio fork such as Nuvio Reshaped, WatchBridge detects any app that handles <code class="inline">nuvio://</code> links.</li>
  <li><strong>Click a recommendation</strong> on the Google TV home screen. The exact title opens in your player.</li>
</ol>

<h2>What happens when you click</h2>
<ol>
  <li><strong>Catch the click.</strong> WatchBridge sees the payload of the recommendation you selected — nothing else on screen.</li>
  <li><strong>Identify the title.</strong> It is looked up on <a href="https://www.themoviedb.org/" rel="noopener">TMDB</a>. Remakes and same-named sequels are disambiguated rather than guessed: if two titles share an exact name, WatchBridge asks once and remembers your pick. You can turn that question off in Settings.</li>
  <li><strong>Hand it off.</strong> The title opens directly in the player you chose. If you prefer to confirm first, enable the optional <strong>Watch now</strong> button.</li>
</ol>

<h2>On Fire TV: hold and confirm</h2>
<p>Fire TV mode reads the title of the selected card from the screen with on-device text recognition. It isn't instant like Google TV: hold still on a card for a couple of seconds, then confirm with <strong>OK</strong> on the prompt that appears. It needs a one-time screen-recording permission, and a reboot clears it.</p>

<h2>Have your own server? Check it first</h2>
<p>With <strong>Check my Jellyfin first</strong> enabled (Settings), WatchBridge looks in your own server before anything else. If the recommendation is already in your library it opens that exact title in Jellyfin or Wholphin; if not, it falls back to your usual player. You enter your server URL and an API key from the admin dashboard.</p>

<h2>If it doesn't work</h2>
<ul>
  <li><strong>The player opens but lands nowhere.</strong> Almost always an outdated or unofficial build of Nuvio or Stremio. Update it to the latest build.</li>
  <li><strong>The Accessibility toggle turns itself off.</strong> Android 13+ blocks it for apps installed outside Google Play by default. The <a href="/setup.html#errors">troubleshooting guide</a> has the fix, including the one-time ADB step for the Google TV Streamer.</li>
  <li><strong>Nothing happens on Fire TV.</strong> Activate <a href="/setup.html#firetv">Fire TV mode</a> from inside the app.</li>
</ul>

<h2>Two extras worth trying</h2>
<ul>
  <li><strong>Voice search.</strong> Ask for a title ("put on La Casa de Papel") and it opens straight in your player. It is opt-in on Google TV, from Settings, and asks for a one-time screen-recording permission.</li>
  <li><strong>Surprise me.</strong> A button in the in-app "Recommended for you" screen picks a random movie or series from what you are browsing and opens it directly.</li>
</ul>
<div class="cta"><a href="/install.html">Install guide</a><a class="alt" href="/apps.html">Compatible apps</a><a class="alt" href="/setup.html">Setup &amp; troubleshooting</a></div>`,
    },
    es: {
      slug: 'abrir-recomendaciones-google-tv-en-nuvio',
      title: 'Cómo abrir las recomendaciones de Google TV en Nuvio, Stremio o Plex',
      desc: 'Google TV abre cada recomendación en la app de la que viene. Así la envías a Nuvio, Stremio, Plex o Jellyfin, paso a paso.',
      eyebrow: 'Guía',
      lede: 'Google TV recomienda películas y series en su pantalla de inicio, pero al pulsar una se abre la app de la que viene, no el reproductor que tú usas. <strong>WatchBridge TV</strong> intercepta ese clic y abre el mismo título en la app que elegiste. Esta guía recorre todo el camino, desde la instalación hasta tu primera recomendación redirigida.',
      body: `
<h2>Qué necesitas</h2>
<ul>
  <li>Un equipo <strong>Google TV / Android TV</strong> o un <strong>Fire TV</strong>.</li>
  <li>Uno de los reproductores compatibles instalado: <strong>Nuvio, Stremio, Plex, Jellyfin, WuPlay o Wholphin</strong>.</li>
  <li><strong>WatchBridge TV</strong>: 2 días de prueba sin tarjeta y después 4,99 € una sola vez. Sin suscripción.</li>
</ul>
<div class="callout"><strong>WatchBridge no ofrece ni aloja ningún contenido.</strong> Solo abre el título en la app que ya usas, así que sigues necesitando tus propias fuentes o suscripciones en esa app.</div>

<h2>Paso a paso</h2>
<ol>
  <li><strong>Instala WatchBridge TV.</strong> Sigue la <a href="/es/install.html">guía de instalación</a>: el APK se instala en la TV con Downloader, Send Files to TV o ADB.</li>
  <li><strong>Actívalo.</strong> En Google TV, WatchBridge usa el servicio de Accesibilidad de Android de forma muy acotada: solo vigila los clics en las tarjetas de recomendación del launcher e ignora cualquier otro clic. Si el interruptor se apaga solo, mira la <a href="/es/setup.html#errors">guía de solución de problemas</a>. En Fire TV, Fire OS bloquea la Accesibilidad a las apps instaladas por sideload, así que hay un <strong>modo Fire TV</strong> propio; mira <a href="/es/setup.html#firetv">modo Fire TV</a>.</li>
  <li><strong>Elige tu reproductor.</strong> En Ajustes escoge Nuvio, Stremio, Plex, Jellyfin, WuPlay o Wholphin. Puedes cambiarlo cuando quieras, sin reinstalar. Si usas un fork de Nuvio como Nuvio Reshaped, WatchBridge detecta cualquier app que gestione enlaces <code class="inline">nuvio://</code>.</li>
  <li><strong>Pulsa una recomendación</strong> en la pantalla de inicio de Google TV. El título exacto se abre en tu reproductor.</li>
</ol>

<h2>Qué ocurre al pulsar</h2>
<ol>
  <li><strong>Detecta el clic.</strong> WatchBridge ve el contenido de la recomendación que seleccionaste y nada más de lo que hay en pantalla.</li>
  <li><strong>Identifica el título.</strong> Lo busca en <a href="https://www.themoviedb.org/" rel="noopener">TMDB</a>. Los remakes y las secuelas con el mismo nombre se desambiguan, no se adivinan: si dos títulos comparten nombre exacto, WatchBridge te pregunta una vez y recuerda tu elección. Puedes desactivar esa pregunta en Ajustes.</li>
  <li><strong>Lo entrega.</strong> El título se abre directamente en el reproductor que elegiste. Si prefieres confirmar antes, activa el botón opcional <strong>Ver ahora</strong>.</li>
</ol>

<h2>En Fire TV: mantener y confirmar</h2>
<p>El modo Fire TV lee en pantalla el título de la tarjeta seleccionada con reconocimiento de texto en el propio dispositivo. No es instantáneo como en Google TV: mantén quieta la tarjeta un par de segundos y confirma con <strong>OK</strong> en el aviso que aparece. Necesita un permiso de grabación de pantalla, una sola vez, y un reinicio lo borra.</p>

<h2>¿Tienes tu propio servidor? Compruébalo primero</h2>
<p>Con <strong>Comprobar mi Jellyfin primero</strong> activado (Ajustes), WatchBridge mira en tu servidor antes que en nada. Si la recomendación ya está en tu biblioteca, abre ese título exacto en Jellyfin o Wholphin; si no, recurre a tu reproductor habitual. Introduces la URL de tu servidor y una clave de API del panel de administración.</p>

<h2>Si no funciona</h2>
<ul>
  <li><strong>El reproductor se abre pero no llega a ningún sitio.</strong> Casi siempre es una versión antigua o no oficial de Nuvio o Stremio. Actualízala a la última.</li>
  <li><strong>El interruptor de Accesibilidad se apaga solo.</strong> Android 13 y posteriores lo bloquean por defecto en apps instaladas fuera de Google Play. La <a href="/es/setup.html#errors">guía de solución de problemas</a> tiene el arreglo, incluido el paso único con ADB para el Google TV Streamer.</li>
  <li><strong>No pasa nada en Fire TV.</strong> Activa el <a href="/es/setup.html#firetv">modo Fire TV</a> desde dentro de la app.</li>
</ul>

<h2>Dos extras que merece la pena probar</h2>
<ul>
  <li><strong>Búsqueda por voz.</strong> Pide un título («pon La casa de papel») y se abre directo en tu reproductor. En Google TV es opcional, se activa en Ajustes y pide un permiso de grabación de pantalla, una sola vez.</li>
  <li><strong>Sorpréndeme.</strong> Un botón de la pantalla «Recomendado para ti» de la app elige al azar una película o serie de lo que estás viendo y la abre directamente.</li>
</ul>
<div class="cta"><a href="/es/install.html">Guía de instalación</a><a class="alt" href="/es/apps.html">Apps compatibles</a><a class="alt" href="/es/setup.html">Configuración y ayuda</a></div>`,
    },
  },
  versus: {
    en: {
      slug: 'nuvio-vs-wuplay-vs-stremio',
      title: 'Nuvio vs Wuplay vs Stremio: what changes with WatchBridge TV',
      desc: 'Nuvio, Wuplay and Stremio all work the same way with WatchBridge TV. What differs, what to check, and how to switch between them without reinstalling.',
      eyebrow: 'Comparison',
      lede: 'This is not a review or a "which one is better" — that is genuinely up to your own catalog and interface preference. It is about one narrower thing: <strong>what each of these players does with WatchBridge TV</strong>, and what to check if one of them doesn\'t open a recommendation.',
      body: `
<h2>The short answer</h2>
<p>All three organize content pulled from installed add-ons into a browsable movies and shows interface for Android TV. From WatchBridge TV's side they are <strong>functionally identical</strong>: a recommendation is identified through TMDB and its exact page opens directly in whichever one you set as your destination — no searching by name, no guessing.</p>

<h2>At a glance</h2>
<div class="table-wrap"><table>
  <thead><tr><th>Player</th><th>What it is</th><th>Works on</th><th>With WatchBridge TV</th></tr></thead>
  <tbody>
    <tr><td><strong>Nuvio</strong></td><td>Add-on-based media browser for Android TV</td><td>Google TV · Fire TV</td><td>Opens the exact title. Forks such as Nuvio Reshaped are detected (any app that handles <code class="inline">nuvio://</code> links).</td></tr>
    <tr><td><strong>Wuplay</strong></td><td>Add-on-based movies &amp; shows browser for Android TV, same category as Nuvio</td><td>Google TV · Fire TV</td><td>Works out of the box if it is already installed. Opens the exact title, matched through TMDB.</td></tr>
    <tr><td><strong>Stremio</strong></td><td>The best-known of the three; cross-platform beyond Android TV</td><td>Google TV · Fire TV</td><td>Same integration as the others.</td></tr>
  </tbody>
</table></div>
<p>The behaviour that depends on your device, not on the player: on <strong>Google TV</strong> the redirect is instant; on <strong>Fire TV</strong> you hold on a card for a couple of seconds and confirm with OK, whichever player you choose.</p>

<h2>If one doesn't open the title</h2>
<ul>
  <li><strong>Check the build.</strong> The app opens but lands nowhere? That is almost always an outdated or unofficial build of Nuvio or Stremio, which sometimes doesn't register its deep-link scheme correctly. Update to the latest build.</li>
  <li><strong>Using a Nuvio fork?</strong> WatchBridge detects any app that handles <code class="inline">nuvio://</code> links, so forks no longer show "Nuvio not installed".</li>
  <li>The <a href="/setup.html#errors">troubleshooting guide</a> covers the rest, by error code.</li>
</ul>

<h2>Switching is a setting, not a reinstall</h2>
<p>You can change your destination player in Settings at any time. If you like, keep two installed and flip between them. There is also an optional, off-by-default <strong>content type rule</strong>: use one app for movies and a different one for series, instead of one app for everything.</p>

<h2>Not on this list: Plex, Jellyfin and Wholphin</h2>
<ul>
  <li><strong>Plex</strong> works two ways here: as your own media server, or through Plex's free, ad-supported streaming catalog, with no server of your own required. Either way, TMDB matching opens the exact recommended title.</li>
  <li><strong>Jellyfin</strong> is free, open-source, self-hosted server software that organizes your own library. <strong>Wholphin</strong> is not a different server but a separate open-source client for that same kind of server — pick either as your destination. With <em>Check my Jellyfin first</em>, WatchBridge looks in your library before using your regular player.</li>
</ul>
<p>The full breakdown, including the YouTube redirect to SmartTube or TizenTube Cobalt on Google TV, is on the <a href="/apps.html">compatible apps</a> page.</p>

<h2>How to choose</h2>
<p>Because the integration is the same, pick the one whose catalog and interface you prefer. Try each for a few days — switching costs you one setting — and keep the one you open most.</p>
<div class="callout warn"><strong>Independent tool.</strong> WatchBridge TV does not host, store or provide any movies, series or streams, and is not affiliated with, sponsored by, or endorsed by Nuvio, Wuplay, Stremio, Plex, Jellyfin or Wholphin. Those names are trademarks of their respective owners.</div>
<div class="cta"><a href="/guides/open-google-tv-recommendations-in-nuvio.html">How to set it up</a><a class="alt" href="/apps.html">Compatible apps</a><a class="alt" href="/install.html">Install guide</a></div>`,
    },
    es: {
      slug: 'nuvio-vs-wuplay-vs-stremio',
      title: 'Nuvio vs Wuplay vs Stremio: qué cambia con WatchBridge TV',
      desc: 'Nuvio, Wuplay y Stremio funcionan igual con WatchBridge TV. Qué cambia, qué comprobar y cómo cambiar de una a otra sin reinstalar.',
      eyebrow: 'Comparativa',
      lede: 'Esto no es una reseña ni un «cuál es mejor»: eso depende de tu catálogo y de qué interfaz prefieras. Trata de algo más concreto: <strong>qué hace cada uno de estos reproductores con WatchBridge TV</strong> y qué comprobar si alguno no abre una recomendación.',
      body: `
<h2>La respuesta corta</h2>
<p>Los tres organizan el contenido de los complementos instalados en una interfaz de películas y series para Android TV. Desde el lado de WatchBridge TV son <strong>funcionalmente idénticos</strong>: una recomendación se identifica con TMDB y su página exacta se abre directamente en el que hayas puesto como destino, sin buscar por nombre ni adivinar.</p>

<h2>De un vistazo</h2>
<div class="table-wrap"><table>
  <thead><tr><th>Reproductor</th><th>Qué es</th><th>Funciona en</th><th>Con WatchBridge TV</th></tr></thead>
  <tbody>
    <tr><td><strong>Nuvio</strong></td><td>Navegador multimedia para Android TV basado en complementos</td><td>Google TV · Fire TV</td><td>Abre el título exacto. Se detectan forks como Nuvio Reshaped (cualquier app que gestione enlaces <code class="inline">nuvio://</code>).</td></tr>
    <tr><td><strong>Wuplay</strong></td><td>Navegador de películas y series para Android TV basado en complementos, de la misma categoría que Nuvio</td><td>Google TV · Fire TV</td><td>Funciona sin configurar nada si ya está instalado. Abre el título exacto, emparejado con TMDB.</td></tr>
    <tr><td><strong>Stremio</strong></td><td>El más conocido de los tres; multiplataforma más allá de Android TV</td><td>Google TV · Fire TV</td><td>La misma integración que los demás.</td></tr>
  </tbody>
</table></div>
<p>Lo que depende de tu dispositivo y no del reproductor: en <strong>Google TV</strong> la redirección es instantánea; en <strong>Fire TV</strong> mantienes una tarjeta un par de segundos y confirmas con OK, elijas el reproductor que elijas.</p>

<h2>Si alguno no abre el título</h2>
<ul>
  <li><strong>Revisa la versión.</strong> ¿La app se abre pero no llega a ningún sitio? Casi siempre es una versión antigua o no oficial de Nuvio o Stremio, que a veces no registra bien su enlace directo. Actualiza a la última.</li>
  <li><strong>¿Usas un fork de Nuvio?</strong> WatchBridge detecta cualquier app que gestione enlaces <code class="inline">nuvio://</code>, así que los forks ya no muestran «Nuvio no instalado».</li>
  <li>La <a href="/es/setup.html#errors">guía de solución de problemas</a> cubre el resto, por código de error.</li>
</ul>

<h2>Cambiar es un ajuste, no una reinstalación</h2>
<p>Puedes cambiar tu reproductor de destino en Ajustes cuando quieras. Si te apetece, deja dos instalados y alterna entre ellos. También hay una regla opcional, desactivada por defecto, de <strong>tipo de contenido</strong>: una app para películas y otra distinta para series, en lugar de una sola para todo.</p>

<h2>Fuera de esta lista: Plex, Jellyfin y Wholphin</h2>
<ul>
  <li><strong>Plex</strong> funciona de dos maneras aquí: como tu propio servidor multimedia, o mediante el catálogo gratuito con anuncios de Plex, sin necesidad de servidor propio. En ambos casos, el emparejamiento con TMDB abre el título recomendado exacto.</li>
  <li><strong>Jellyfin</strong> es un servidor autoalojado, gratuito y de código abierto que organiza tu propia biblioteca. <strong>Wholphin</strong> no es otro servidor, sino un cliente de código abierto distinto para ese mismo tipo de servidor: elige cualquiera de los dos como destino. Con <em>Comprobar mi Jellyfin primero</em>, WatchBridge mira en tu biblioteca antes de usar tu reproductor habitual.</li>
</ul>
<p>El desglose completo, incluida la redirección de YouTube a SmartTube o TizenTube Cobalt en Google TV, está en la página de <a href="/es/apps.html">apps compatibles</a>.</p>

<h2>Cómo elegir</h2>
<p>Como la integración es la misma, elige el que prefieras por catálogo e interfaz. Prueba cada uno unos días (cambiar te cuesta un ajuste) y quédate con el que más abras.</p>
<div class="callout warn"><strong>Herramienta independiente.</strong> WatchBridge TV no aloja, almacena ni ofrece ninguna película, serie o emisión, y no está afiliada, patrocinada ni respaldada por Nuvio, Wuplay, Stremio, Plex, Jellyfin ni Wholphin. Esos nombres son marcas de sus respectivos propietarios.</div>
<div class="cta"><a href="/es/guias/abrir-recomendaciones-google-tv-en-nuvio.html">Cómo configurarlo</a><a class="alt" href="/es/apps.html">Apps compatibles</a><a class="alt" href="/es/install.html">Guía de instalación</a></div>`,
    },
  },
};

const INDEX = {
  en: { path: '/guides/', title: 'Guides — WatchBridge TV', desc: 'Practical guides for WatchBridge TV: open Google TV recommendations in Nuvio, Stremio or Plex, and compare the players.', eyebrow: 'Guides', h1: 'WatchBridge TV guides', lede: 'Short, practical guides on getting Google TV recommendations to open in the player you actually use.' },
  es: { path: '/es/guias/', title: 'Guías — WatchBridge TV', desc: 'Guías prácticas de WatchBridge TV: abre las recomendaciones de Google TV en Nuvio, Stremio o Plex y compara los reproductores.', eyebrow: 'Guías', h1: 'Guías de WatchBridge TV', lede: 'Guías breves y prácticas para que las recomendaciones de Google TV se abran en el reproductor que de verdad usas.' },
};

const T = {
  en: { home: '/', homeLabel: '← WatchBridge', install: ['/install.html', 'Install guide'], setup: ['/setup.html', 'Setup & troubleshooting'], guides: ['/guides/', 'Guides'], privacy: ['/privacy.html', 'Privacy policy'], tag: 'WatchBridge TV · 2-day free trial, then €4.99 one-time', switch: 'Español', locale: 'en_US', dir: '/guides/', crumb: 'Guides' },
  es: { home: '/es/', homeLabel: '← WatchBridge', install: ['/es/install.html', 'Guía de instalación'], setup: ['/es/setup.html', 'Configuración y ayuda'], guides: ['/es/guias/', 'Guías'], privacy: ['/privacy.html', 'Política de privacidad (en inglés)'], tag: 'WatchBridge TV · Prueba gratis de 2 días, luego 4,99 € pago único', switch: 'English', locale: 'es_ES', dir: '/es/guias/', crumb: 'Guías' },
};

// ---------------------------------------------------------------- plantilla
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function page({ lang, url, enUrl, esUrl, title, desc, eyebrow, h1, lede, body, jsonld }) {
  const t = T[lang];
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<link rel="alternate" hreflang="en" href="${SITE}${enUrl}">
<link rel="alternate" hreflang="es" href="${SITE}${esUrl}">
<link rel="alternate" hreflang="x-default" href="${SITE}${enUrl}">
<meta property="og:type" content="article">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:site_name" content="WatchBridge">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:image:alt" content="${esc(OG_ALT[lang])}">
<meta property="og:locale" content="${t.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<meta name="twitter:image:alt" content="${esc(OG_ALT[lang])}">
<link rel="icon" type="image/png" sizes="32x32" href="/logo-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/logo-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/logo-180.png">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
${css}
${EXTRA_CSS}
</head>
<body>

<div class="page">

  <header class="hero">
    <a href="${t.home}" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--text-muted); text-decoration: none;">${t.homeLabel}</a>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    <p class="lede">${lede}</p>
  </header>

  ${body}

  <footer>
    <span>${t.tag}</span>
    <span>
      <a href="${t.install[0]}">${t.install[1]}</a>
      &nbsp;·&nbsp;
      <a href="${t.setup[0]}">${t.setup[1]}</a>
      &nbsp;·&nbsp;
      <a href="${t.guides[0]}">${t.guides[1]}</a>
      &nbsp;·&nbsp;
      <a href="${t.privacy[0]}">${t.privacy[1]}</a>
    </span>
  </footer>

</div>

</body>
</html>
`;
}

const org = { '@type': 'Organization', name: 'WatchBridge', url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/logo-180.png' } };
const crumbs = (lang, url, title) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'WatchBridge', item: SITE + (lang === 'en' ? '/' : '/es/') },
  { '@type': 'ListItem', position: 2, name: T[lang].crumb, item: SITE + T[lang].dir },
  { '@type': 'ListItem', position: 3, name: title, item: SITE + url },
] });

export function buildGuides() {
  const written = [];
  const write = (rel, html) => { const f = path.join(DOCS, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); written.push(rel); };

  for (const g of Object.values(GUIDES)) {
    const enUrl = `/guides/${g.en.slug}.html`, esUrl = `/es/guias/${g.es.slug}.html`;
    for (const lang of ['en', 'es']) {
      const c = g[lang], url = lang === 'en' ? enUrl : esUrl;
      const jsonld = { '@context': 'https://schema.org', '@graph': [
        { '@type': 'Article', headline: c.title, description: c.desc, inLanguage: lang, datePublished: DATE, dateModified: DATE,
          image: SITE + '/og-image.jpg', author: org, publisher: org, mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + url } },
        crumbs(lang, url, c.title),
      ] };
      write(url.slice(1), page({ lang, url, enUrl, esUrl, title: c.title, desc: c.desc, eyebrow: c.eyebrow, h1: c.title, lede: c.lede, body: `<article>${c.body}\n  </article>`, jsonld }));
    }
  }

  for (const lang of ['en', 'es']) {
    const idx = INDEX[lang];
    const cards = Object.values(GUIDES).map((g) => {
      const c = g[lang], url = lang === 'en' ? `/guides/${c.slug}.html` : `/es/guias/${c.slug}.html`;
      return `    <a class="card" href="${url}"><h2>${esc(c.title)}</h2><p>${esc(c.desc)}</p></a>`;
    }).join('\n');
    const jsonld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', name: idx.title, description: idx.desc, inLanguage: lang, url: SITE + idx.path },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'WatchBridge', item: SITE + (lang === 'en' ? '/' : '/es/') },
        { '@type': 'ListItem', position: 2, name: T[lang].crumb, item: SITE + idx.path } ] },
    ] };
    write(idx.path.slice(1) + 'index.html', page({ lang, url: idx.path, enUrl: INDEX.en.path, esUrl: INDEX.es.path, title: idx.title, desc: idx.desc, eyebrow: idx.eyebrow, h1: idx.h1, lede: idx.lede, body: `<div class="cards">\n${cards}\n  </div>`, jsonld }));
  }
  return written;
}

export const GUIDE_URLS = () => [
  '/guides/', '/es/guias/',
  ...Object.values(GUIDES).flatMap((g) => [`/guides/${g.en.slug}.html`, `/es/guias/${g.es.slug}.html`]),
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) console.log(buildGuides().join('\n'));
