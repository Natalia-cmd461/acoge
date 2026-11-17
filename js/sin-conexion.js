/* =========================================================
   ACOGE — Página sin conexión
   «Volver» regresa a la pantalla anterior o al inicio de la app.
   ========================================================= */
(function () {
  "use strict";

  document.getElementById("volver").addEventListener("click", function () {
    if (window.history.length > 1) window.history.back();
    else window.location.replace("index.html");
  });
})();
