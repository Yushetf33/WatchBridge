// Cuenta los clics en los botones de descarga (APK de GitHub y fichas de Google Play, TV y movil): suma 1 en el backend por dia, pagina y zona.
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
    // Fichas de Play: la del movil lleva ".mobile.play" y la de la TV solo ".play" justo despues de "tvbridge"
    else if (/play\.google\.com\/store\/apps\/details\?id=com\.tunombre\.tvbridge\.mobile\.play/i.test(href)) type = "playmobile";
    else if (/play\.google\.com\/store\/apps\/details\?id=com\.tunombre\.tvbridge\.play/i.test(href)) type = "playtv";
    if (!type) return;
    // En Play la zona es la campana utm del propio enlace (header, home-hero, guide-...), que ya dice de que boton se trata
    var camp = type.indexOf("play") === 0 ? (href.match(/utm_campaign(?:%3D|=)([\w-]+)/) || [])[1] : null;
    var zone = camp ? camp : a.closest("header") ? "header" : a.closest("footer") ? "footer" : (a.closest("section[id]") || {}).id || (a.closest(".cta-band") ? "cta-band" : "page");
    var path = location.pathname.replace(/index\.html$/, "").slice(0, 80) || "/";
    var body = JSON.stringify({ t: type, p: path, z: String(zone).slice(0, 30) });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(API, new Blob([body], { type: "text/plain" }));
      else fetch(API, { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "text/plain" } });
    } catch (err) { /* contar es secundario */ }
  }, true);
})();
