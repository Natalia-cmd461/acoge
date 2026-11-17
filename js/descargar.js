/* =========================================================
   ACOGE — Pantalla C · Descargar contenido
   «Descargar» guarda todo el contenido para usarlo sin internet.
   «Ahora no» igual deja guardado lo esencial (lo hace sw.js).
   ========================================================= */
(function () {
  "use strict";

  // Pantalla de Inicio
  var PANTALLA_INICIO = "inicio.html";

  var CONTENIDO = window.ACOGE_CONTENIDO;
  var botonDescargar = document.getElementById("descargar");
  var botonAhoraNo = document.getElementById("ahora-no");
  var estado = document.getElementById("estado");

  var esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var abiertaComoApp = navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  // En iPhone, Safari puede borrar lo guardado si la app no está instalada.
  document.getElementById("nota-ios").hidden = !(esIOS && !abiertaComoApp);

  function guardar(nombre, valor) {
    try { localStorage.setItem(nombre, valor); } catch (error) { /* sin almacenamiento */ }
  }

  // Espera a que el service worker esté listo, como máximo unos segundos.
  function serviceWorkerListo() {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise(function (resolver, rechazar) {
        setTimeout(function () { rechazar(new Error("sin service worker")); }, 8000);
      })
    ]);
  }

  botonDescargar.addEventListener("click", function () {
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      estado.textContent = "Este navegador no permite guardar contenido para usarlo sin internet.";
      return;
    }

    botonDescargar.disabled = true;
    botonAhoraNo.disabled = true;
    estado.textContent = "Descargando…";

    serviceWorkerListo()
      .then(function () {
        return Promise.all([
          caches.open("acoge-esencial-v" + CONTENIDO.VERSION)
            .then(function (cache) {
              return cache.addAll(CONTENIDO.esencial).then(function () {
                return Promise.all((CONTENIDO.opcional || []).map(function (ruta) {
                  return cache.add(ruta).catch(function () {});
                }));
              });
            }),
          caches.open("acoge-contenido-v" + CONTENIDO.VERSION)
            .then(function (cache) { return cache.addAll(CONTENIDO.completo); })
        ]);
      })
      .then(function () {
        guardar("acoge.contenidoDescargado", new Date().toISOString());
        guardar("acoge.descargaVista", "si");
        window.location.replace("listo.html");
      })
      .catch(function () {
        botonDescargar.disabled = false;
        botonAhoraNo.disabled = false;
        estado.textContent = "No se pudo descargar. Revisa tu conexión a internet e intenta de nuevo.";
      });
  });

  botonAhoraNo.addEventListener("click", function () {
    guardar("acoge.descargaVista", "si");
    window.location.replace(PANTALLA_INICIO);
  });
})();
