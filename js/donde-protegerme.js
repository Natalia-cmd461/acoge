/* =========================================================
   ACOGE — Dónde protegerme (SÍ / NO)
   SÍ muestra las tarjetas verdes; NO, las tarjetas vino.
   Los botones conservan su aspecto (no cambian de color).
   ========================================================= */
(function () {
  "use strict";

  var botonSi = document.getElementById("boton-si");
  var botonNo = document.getElementById("boton-no");
  var listaSi = document.getElementById("lista-si");
  var listaNo = document.getElementById("lista-no");

  function mostrar(si) {
    listaSi.hidden = !si;
    listaNo.hidden = si;
    botonSi.setAttribute("aria-pressed", String(si));
    botonNo.setAttribute("aria-pressed", String(!si));
  }

  botonSi.addEventListener("click", function () { mostrar(true); });
  botonNo.addEventListener("click", function () { mostrar(false); });
})();
