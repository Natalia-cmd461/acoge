/* =========================================================
   ACOGE — Mesa 1 · Splash
   Muestra la marca unos segundos y pasa a la siguiente pantalla.
   También se puede avanzar tocando la pantalla o con el teclado.
   ========================================================= */
(function () {
  "use strict";

  // Pantalla de Inicio
  var PANTALLA_INICIO = "inicio.html";

  function leerMarca(nombre) {
    try {
      return localStorage.getItem(nombre) === "si";
    } catch (error) {
      return false;
    }
  }

  // Para volver a ver la primera apertura: abrir index.html?reiniciar
  if (new URLSearchParams(window.location.search).has("reiniciar")) {
    try {
      localStorage.removeItem("acoge.bienvenidaVista");
      localStorage.removeItem("acoge.instalada");
      localStorage.removeItem("acoge.permisosVistos");
      localStorage.removeItem("acoge.ubicacionActiva");
      localStorage.removeItem("acoge.descargaVista");
      localStorage.removeItem("acoge.contenidoDescargado");
      localStorage.removeItem("acoge.alerta");
      // La ficha de emergencia no se borra: son datos de la persona.
    } catch (error) {
      // Sin almacenamiento disponible no hay nada que borrar.
    }
  }

  var abiertaComoApp = navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  // La bienvenida se muestra solo la primera vez.
  // La instalación se ofrece en cada apertura hasta que se instale.
  // Los permisos se muestran una sola vez, ya instalada.
  var instalada = abiertaComoApp || leerMarca("acoge.instalada");
  var SIGUIENTE_PANTALLA = PANTALLA_INICIO;
  if (!leerMarca("acoge.bienvenidaVista")) {
    SIGUIENTE_PANTALLA = "bienvenida.html";
  } else if (!instalada) {
    SIGUIENTE_PANTALLA = "instalar.html";
  } else if (!leerMarca("acoge.permisosVistos")) {
    SIGUIENTE_PANTALLA = "permisos.html";
  } else if (!leerMarca("acoge.descargaVista")) {
    SIGUIENTE_PANTALLA = "descargar.html";
  }

  var DURACION_MS = 2500;
  var splash = document.getElementById("splash");
  var yaSalio = false;

  function irASiguiente() {
    if (yaSalio || !SIGUIENTE_PANTALLA) return;
    yaSalio = true;

    var sinAnimacion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (sinAnimacion) {
      window.location.replace(SIGUIENTE_PANTALLA);
      return;
    }

    splash.classList.add("saliendo");
    setTimeout(function () {
      window.location.replace(SIGUIENTE_PANTALLA);
    }, 400);
  }

  setTimeout(irASiguiente, DURACION_MS);
  splash.addEventListener("click", irASiguiente);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") irASiguiente();
  });
})();
