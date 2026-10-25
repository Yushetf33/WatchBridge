// Muy simple a propósito: la página ya está en inglés por defecto, así que
// solo hace falta un diccionario español — si el navegador no pide "es",
// no se toca nada. Cada página (index.html, install.html) pasa su propio
// diccionario de claves -> texto en español (puede incluir HTML, se aplica
// con innerHTML). Los videos con rotulos en español (data-es-src) tambien se cambian.
function tvrbApplyI18n(es) {
  var lang = ((navigator.language || "en") + "").toLowerCase();
  if (lang.indexOf("es") !== 0) return;
  document.documentElement.lang = "es";
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (es[key] !== undefined) el.innerHTML = es[key];
  });
  document.querySelectorAll("video[data-es-src]").forEach(function (v) {
    var src = v.getAttribute("data-es-src"), poster = v.getAttribute("data-es-poster");
    var source = v.querySelector("source");
    if (poster) v.setAttribute("poster", poster);
    if (source && src) { source.setAttribute("src", src); v.load(); }
  });
  var pre = document.querySelector('link[rel="preload"][as="image"]');
  var hero = document.querySelector(".hero-video video");
  if (pre && hero && hero.getAttribute("poster")) pre.setAttribute("href", hero.getAttribute("poster"));
}
