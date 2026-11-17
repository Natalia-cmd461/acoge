/* =========================================================
   ACOGE — Botones de Antes
   Al presionarlos se ponen vino con letra crema. En los enlaces
   se espera un instante antes de cambiar de pantalla para que
   el cambio de color se alcance a ver.
   ========================================================= */
(function () {
  "use strict";

  var ESPERA_MS = 160;
  var botones = document.querySelectorAll(".boton-antes");

  // En iPhone, :active solo funciona si la página escucha toques.
  document.addEventListener("touchstart", function () {}, { passive: true });

  botones.forEach(function (boton) {
    boton.addEventListener("pointerdown", function () {
      boton.classList.add("boton-antes--presionado");
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evento) {
      boton.addEventListener(evento, function () {
        if (!boton.dataset.navegando) boton.classList.remove("boton-antes--presionado");
      });
    });

    if (boton.tagName === "A") {
      boton.addEventListener("click", function (evento) {
        var destino = boton.getAttribute("href");
        if (!destino || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
        evento.preventDefault();
        boton.dataset.navegando = "si";
        boton.classList.add("boton-antes--presionado");
        setTimeout(function () { window.location.href = destino; }, ESPERA_MS);
      });
    }
  });

  // Al volver con el botón «atrás», los botones quedan normales.
  window.addEventListener("pageshow", function () {
    botones.forEach(function (boton) {
      delete boton.dataset.navegando;
      boton.classList.remove("boton-antes--presionado");
    });
  });
})();
