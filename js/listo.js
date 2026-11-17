/* =========================================================
   ACOGE — Pantalla D · Listo para usar sin internet
   ========================================================= */
(function () {
  "use strict";

  var boton = document.getElementById("entendido");

  boton.addEventListener("click", function () {
    var siguiente = boton.dataset.siguiente;
    if (siguiente) window.location.replace(siguiente);
  });
})();
