/* =========================================================
   ACOGE — Mesa 2 · Permisos (única vez, al instalar)
   Cada botón pide su permiso y muestra su confirmación.
   Si se rechaza, se explica bajo el botón cómo activarlo.
   ========================================================= */
(function () {
  "use strict";

  var botonNotificaciones = document.getElementById("boton-notificaciones");
  var botonUbicacion = document.getElementById("boton-ubicacion");
  var botonFicha = document.getElementById("boton-ficha");
  var botonContinuar = document.getElementById("continuar");
  var mensajeNotificaciones = document.getElementById("mensaje-notificaciones");
  var mensajeUbicacion = document.getElementById("mensaje-ubicacion");

  var esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var abiertaComoApp = navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  function leer(nombre) {
    try { return localStorage.getItem(nombre); } catch (error) { return null; }
  }
  function guardar(nombre, valor) {
    try { localStorage.setItem(nombre, valor); } catch (error) { /* sin almacenamiento */ }
  }

  // Botón completado: check verde + texto (no depende solo del color)
  function marcarHecho(boton, texto) {
    boton.classList.add("boton-blanco--hecho");
    boton.querySelector(".boton-blanco__texto").textContent = texto;
  }

  /* ---------- Notificaciones ---------- */

  function notificacionesActivas() {
    marcarHecho(botonNotificaciones, "Notificaciones activas");
  }

  botonNotificaciones.addEventListener("click", function () {
    mensajeNotificaciones.textContent = "";

    if (!("Notification" in window)) {
      mensajeNotificaciones.textContent = esIOS && !abiertaComoApp
        ? "En iPhone, primero instala acoge en la pantalla de inicio y ábrela desde ahí."
        : "Este navegador no permite notificaciones.";
      return;
    }

    if (Notification.permission === "denied") {
      mensajeNotificaciones.textContent = "Las notificaciones están bloqueadas. Actívalas para acoge en los ajustes del celular o del navegador.";
      return;
    }

    Promise.resolve(Notification.requestPermission()).then(function (respuesta) {
      if (respuesta === "granted") {
        window.ACOGE.mostrarConfirmacion({
          icono: "img/icono-campana.png", ancho: 132, alto: 128, arriba: 168,
          texto: "Activa",
          alTerminar: function () {
            notificacionesActivas();
            botonNotificaciones.focus();
          }
        });
      } else {
        mensajeNotificaciones.textContent = "No se activaron. Puedes activarlas después en los ajustes del celular o del navegador.";
      }
    });
  });

  /* ---------- Ubicación ---------- */

  function ubicacionActiva() {
    guardar("acoge.ubicacionActiva", "si");
    marcarHecho(botonUbicacion, "Ubicación activa");
  }

  botonUbicacion.addEventListener("click", function () {
    mensajeUbicacion.textContent = "";

    if (!("geolocation" in navigator)) {
      mensajeUbicacion.textContent = "Este navegador no permite usar la ubicación.";
      return;
    }

    mensajeUbicacion.textContent = "Buscando tu ubicación…";

    // Solo se pide el permiso: la posición no se guarda ni se envía.
    navigator.geolocation.getCurrentPosition(function () {
      mensajeUbicacion.textContent = "";
      window.ACOGE.mostrarConfirmacion({
        icono: "img/icono-ubicacion.png", ancho: 94, alto: 130, arriba: 157,
        texto: "Ubicación<br>Activa",
        alTerminar: function () {
          ubicacionActiva();
          botonUbicacion.focus();
        }
      });
    }, function (error) {
      mensajeUbicacion.textContent = error.code === error.PERMISSION_DENIED
        ? "La ubicación está bloqueada. Actívala para acoge en los ajustes del celular o del navegador."
        : "No pudimos obtener tu ubicación. Revisa que el GPS esté encendido e intenta de nuevo.";
    }, { timeout: 15000, maximumAge: 600000 });
  });

  /* ---------- Estado al abrir la pantalla ---------- */

  if ("Notification" in window && Notification.permission === "granted") {
    notificacionesActivas();
  }
  if (leer("acoge.ubicacionActiva") === "si") {
    marcarHecho(botonUbicacion, "Ubicación activa");
  }
  if (leer("acoge.ficha")) {
    marcarHecho(botonFicha, "Ficha guardada");
  }

  /* ---------- Continuar ---------- */

  botonContinuar.addEventListener("click", function () {
    var siguiente = botonContinuar.dataset.siguiente;

    // Mientras no exista la siguiente pantalla no se marca como vista,
    // para que se pueda seguir probando.
    if (!siguiente) return;

    guardar("acoge.permisosVistos", "si");
    window.location.replace(siguiente);
  });
})();
