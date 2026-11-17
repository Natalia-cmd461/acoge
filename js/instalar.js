/* =========================================================
   ACOGE — Pantalla B · Instalar
   Android: el botón abre el aviso de instalación del navegador.
   iPhone: Apple no lo permite, así que se muestran las instrucciones.
   ========================================================= */
(function () {
  "use strict";

  // Pantalla de Inicio
  var PANTALLA_INICIO = "inicio.html";

  var grupoAndroid = document.getElementById("grupo-android");
  var grupoIOS = document.getElementById("grupo-ios");
  var botonInstalar = document.getElementById("instalar");
  var botonAhoraNo = document.getElementById("ahora-no");
  var estado = document.getElementById("estado");
  var avisoInstalacion = null;

  var esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  var abiertaComoApp = navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  function marcarInstalada() {
    try {
      localStorage.setItem("acoge.instalada", "si");
    } catch (error) {
      // Sin almacenamiento disponible se volverá a ofrecer la instalación.
    }
  }

  function ir(pantalla) {
    if (pantalla) window.location.replace(pantalla);
  }

  // Los permisos se muestran una sola vez; después se va a Inicio.
  function despuesDeInstalar() {
    var vistos = false;
    try { vistos = localStorage.getItem("acoge.permisosVistos") === "si"; } catch (error) { /* sin almacenamiento */ }
    ir(vistos ? PANTALLA_INICIO : "permisos.html");
  }

  // «Ahora no»: por ahora también lleva a los permisos (mesa 2),
  // como en la interacción del Figma, para poder revisar el flujo.
  function continuar() {
    despuesDeInstalar();
  }

  // Si ya se abrió como app instalada, esta pantalla no hace falta.
  if (abiertaComoApp) {
    marcarInstalada();
    despuesDeInstalar();
  }

  grupoAndroid.hidden = esIOS;
  grupoIOS.hidden = !esIOS;

  // El navegador avisa aquí que la app se puede instalar.
  window.addEventListener("beforeinstallprompt", function (evento) {
    evento.preventDefault();
    avisoInstalacion = evento;
  });

  window.addEventListener("appinstalled", function () {
    marcarInstalada();
    avisoInstalacion = null;
    estado.textContent = "Listo: acoge quedó instalada en tu celular.";
    setTimeout(despuesDeInstalar, 1200);
  });

  botonInstalar.addEventListener("click", function () {
    if (!avisoInstalacion) {
      estado.textContent = "Tu navegador no mostró el aviso de instalación. Abre su menú y elige «Instalar aplicación» o «Agregar a pantalla de inicio».";
      return;
    }

    estado.textContent = "";
    avisoInstalacion.prompt();
    avisoInstalacion.userChoice.then(function (eleccion) {
      if (eleccion.outcome !== "accepted") {
        estado.textContent = "No se instaló. Puedes intentarlo de nuevo o tocar «Ahora no».";
      }
      avisoInstalacion = null;
    });
  });

  botonAhoraNo.addEventListener("click", continuar);
})();
