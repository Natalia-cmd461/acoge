/* =========================================================
   ACOGE — Confirmación (check verde sobre la pantalla)
   Se usa en «Activa», «Ubicación Activa» y «Guardado».
   ========================================================= */
(function () {
  "use strict";

  var DURACION_MS = 1800;

  /**
   * Muestra la confirmación y llama a alTerminar cuando se cierra.
   * opciones: { icono, ancho, alto, arriba, texto, alTerminar }
   */
  function mostrarConfirmacion(opciones) {
    var capa = document.createElement("div");
    capa.className = "confirmacion";
    capa.setAttribute("role", "status");
    capa.setAttribute("aria-live", "polite");

    capa.innerHTML =
      '<div class="confirmacion__marco">' +
        '<img class="confirmacion__icono" alt="">' +
        '<div class="confirmacion__circulo">' +
          '<img src="img/confirmacion-circulo.svg" width="200" height="200" alt="">' +
          '<img class="confirmacion__check" src="img/confirmacion-check.png" width="95" height="95" alt="">' +
        '</div>' +
        '<p class="confirmacion__texto"></p>' +
      '</div>';

    var icono = capa.querySelector(".confirmacion__icono");
    icono.src = opciones.icono;
    icono.width = opciones.ancho;
    icono.height = opciones.alto;
    icono.style.setProperty("--arriba", opciones.arriba + "px");
    icono.style.setProperty("--arriba-vh", (opciones.arriba / 9.56) + "vh");

    // innerHTML con <br> para los textos de dos líneas («Ubicación<br>Activa»)
    capa.querySelector(".confirmacion__texto").innerHTML = opciones.texto;

    var cerrada = false;
    function cerrar() {
      if (cerrada) return;
      cerrada = true;
      capa.remove();
      if (opciones.alTerminar) opciones.alTerminar();
    }

    capa.addEventListener("click", cerrar);
    document.body.appendChild(capa);
    setTimeout(cerrar, DURACION_MS);
  }

  window.ACOGE = window.ACOGE || {};
  window.ACOGE.mostrarConfirmacion = mostrarConfirmacion;
})();
