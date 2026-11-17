/* =========================================================
   ACOGE — Registra el service worker (modo sin internet).
   Funciona en HTTPS y en localhost.
   ========================================================= */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {
      // Sin service worker la app funciona igual, pero no sin internet.
    });
  });
})();
