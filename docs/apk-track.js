// Cuenta los clics en los botones de descarga del APK (TV y movil): suma 1 en el backend por dia, pagina y zona.
// No guarda nada personal; si falla, no pasa nada: el enlace funciona igual.
(function () {
  var API = "https://tvbridge-backend.vercel.app/api/apk-click";
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var type = null;
    if (/github\.com\/Yushetf33\/WatchBridge-Mobile\//i.test(href)) type = "mobile";
    else if (/github\.com\/Yushetf33\/WatchBridge\/releases/i.test(href)) type = "tv";
    if (!type) return;
    var zone = a.closest("header") ? "header" : a.closest("footer") ? "footer" : (a.closest("section[id]") || {}).id || (a.closest(".cta-band") ? "cta-band" : "page");
    var path = location.pathname.replace(/index\.html$/, "").slice(0, 80) || "/";
    var body = JSON.stringify({ t: type, p: path, z: String(zone).slice(0, 30) });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(API, new Blob([body], { type: "text/plain" }));
      else fetch(API, { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "text/plain" } });
    } catch (err) { /* contar es secundario */ }
  }, true);
})();
