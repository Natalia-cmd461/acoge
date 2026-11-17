/* =========================================================
   ACOGE — Barra inferior
   Los botones con data-destino vacío llevan a secciones que
   todavía no existen; cuando existan, se llena data-destino.
   ========================================================= */
(function () {
  "use strict";

  document.querySelectorAll(".barra-inferior [data-destino]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      if (boton.dataset.destino) window.location.href = boton.dataset.destino;
    });
  });
})();
