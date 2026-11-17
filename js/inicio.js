/* =========================================================
   ACOGE — Mesa 3 · Inicio
   Muestra la fecha de revisión del contenido, la fuente de los
   avisos y el estado de la conexión y de las notificaciones.
   ========================================================= */
(function () {
  "use strict";

  // Fuente de la que vendrán los avisos de sismo (puede cambiar).
  var FUENTE_ALERTAS = "SGC";

  // false mientras la app no consulte todavía ninguna fuente de sismos.
  var AVISOS_DISPONIBLES = false;

  var CONTENIDO = window.ACOGE_CONTENIDO;
  var fecha = document.getElementById("fecha");
  var fuente = document.getElementById("fuente");
  var estado = document.getElementById("estado");
  var avisos = document.getElementById("avisos");
  var contenidoGuardado = false;

  // «2026-11-12» → «12/11/2026»
  function formatearFecha(iso) {
    var partes = iso.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  fecha.textContent = "Última actualización " + formatearFecha(CONTENIDO.FECHA_REVISION);
  fuente.textContent = "Fuente: " + FUENTE_ALERTAS;
  avisos.textContent = AVISOS_DISPONIBLES ? "" : "Avisos de sismos: en preparación";
  avisos.hidden = AVISOS_DISPONIBLES;

  function actualizarEstado() {
    var conexion = navigator.onLine
      ? "Con conexión"
      : (contenidoGuardado ? "Sin conexión (contenido guardado)" : "Sin conexión");
    var notificaciones = ("Notification" in window && Notification.permission === "granted")
      ? "Notificaciones activas"
      : "Notificaciones desactivadas";
    estado.textContent = conexion + " · " + notificaciones;
  }

  actualizarEstado();
  window.addEventListener("online", actualizarEstado);
  window.addEventListener("offline", actualizarEstado);

  if ("caches" in window) {
    caches.has("acoge-esencial-v" + CONTENIDO.VERSION).then(function (existe) {
      contenidoGuardado = existe;
      actualizarEstado();
    });
  }

  /* ---------------------------------------------------------
     Alerta activa (simulacro)
     5 toques seguidos en el logo cambian entre «Sin alertas
     reportadas» y «Alerta ACTIVA». Al activarse suena la alerta
     (en bucle) y vibra el celular hasta tocar «Entendido».
     El estado queda guardado: «activa», «silenciada» o nada.
     --------------------------------------------------------- */
  var CLAVE_ALERTA = "acoge.alerta";
  var TOQUES_NECESARIOS = 5;
  var PAUSA_MAXIMA = 800;           // ms entre un toque y el siguiente
  var PATRON_VIBRACION = [700, 300, 700, 300]; // dura 2 s y se repite

  var inicio = document.getElementById("inicio");
  var logo = document.getElementById("logo");
  var tituloNormal = document.getElementById("titulo-normal");
  var tituloAlerta = document.getElementById("titulo-alerta");
  var entendido = document.getElementById("entendido");
  var ahora = document.getElementById("ahora");
  var fases = document.getElementById("fases");
  var anuncio = document.getElementById("anuncio");
  var sonido = document.getElementById("sonido-alerta");
  var tituloPagina = document.title;
  var repetirVibracion = null;
  var toques = 0;
  var ultimoToque = 0;

  function leerAlerta() {
    try { return localStorage.getItem(CLAVE_ALERTA); } catch (e) { return null; }
  }

  function guardarAlerta(valor) {
    try {
      if (valor) localStorage.setItem(CLAVE_ALERTA, valor);
      else localStorage.removeItem(CLAVE_ALERTA);
    } catch (e) { /* sin almacenamiento: solo dura mientras la pantalla esté abierta */ }
  }

  function vibrar(patron) {
    if (navigator.vibrate) {
      try { navigator.vibrate(patron); } catch (e) { /* iPhone no vibra desde la web */ }
    }
  }

  function sonar() {
    sonido.currentTime = 0;
    var promesa = sonido.play();
    // El navegador puede bloquear el sonido si la persona no ha tocado la pantalla
    if (promesa && promesa.catch) promesa.catch(function () {});
    vibrar(PATRON_VIBRACION);
    clearInterval(repetirVibracion);
    repetirVibracion = setInterval(function () { vibrar(PATRON_VIBRACION); }, 2000);
  }

  function callar() {
    sonido.pause();
    clearInterval(repetirVibracion);
    repetirVibracion = null;
    vibrar(0);
  }

  // Muestra la pantalla según el estado: null, «activa» o «silenciada»
  function mostrar(alerta) {
    var activa = alerta === "activa" || alerta === "silenciada";
    inicio.classList.toggle("inicio--alerta", activa);
    tituloNormal.hidden = activa;
    tituloAlerta.hidden = !activa;
    fases.hidden = activa;
    ahora.hidden = !activa;
    entendido.hidden = alerta !== "activa";
    estado.hidden = activa;
    avisos.hidden = activa || AVISOS_DISPONIBLES;
    fuente.textContent = activa
      ? "Aviso posterior al sismo. Fuente: " + FUENTE_ALERTAS
      : "Fuente: " + FUENTE_ALERTAS;
    document.title = activa ? "Alerta activa · ACOGE" : tituloPagina;
  }

  function activarAlerta() {
    guardarAlerta("activa");
    mostrar("activa");
    anuncio.textContent = "Alerta activa. Se reportó un sismo. Toca «Qué hacer ahora».";
    sonar();
  }

  function silenciarAlerta() {
    callar();
    guardarAlerta("silenciada");
    var teniaFoco = document.activeElement === entendido;
    mostrar("silenciada");
    if (teniaFoco) ahora.focus();
  }

  function terminarAlerta() {
    callar();
    guardarAlerta(null);
    mostrar(null);
    anuncio.textContent = "";
  }

  logo.addEventListener("click", function () {
    var momento = Date.now();
    toques = (momento - ultimoToque <= PAUSA_MAXIMA) ? toques + 1 : 1;
    ultimoToque = momento;
    if (toques < TOQUES_NECESARIOS) return;
    toques = 0;
    if (inicio.classList.contains("inicio--alerta")) terminarAlerta();
    else activarAlerta();
  });

  entendido.addEventListener("click", silenciarAlerta);

  // Ir a «Qué hacer ahora» también cuenta como enterarse de la alerta
  ahora.addEventListener("click", function () {
    if (leerAlerta() === "activa") silenciarAlerta();
  });

  // Al salir de la pantalla se apagan el sonido y la vibración
  window.addEventListener("pagehide", callar);
  window.addEventListener("pageshow", function (evento) {
    if (evento.persisted && leerAlerta() === "activa") sonar();
  });

  // Si la alerta seguía activa al volver, se muestra y se intenta sonar de nuevo
  var alertaGuardada = leerAlerta();
  if (alertaGuardada) {
    mostrar(alertaGuardada);
    if (alertaGuardada === "activa") sonar();
  }

  // Botones que llevan a secciones que todavía no existen
  document.querySelectorAll("[data-destino]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      if (boton.dataset.destino) window.location.href = boton.dataset.destino;
    });
  });
})();
