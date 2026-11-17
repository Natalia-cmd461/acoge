/* =========================================================
   ACOGE — Pantalla A · Bienvenida
   Se muestra solo la primera vez. Al tocar «Entendido» la app
   lo recuerda en este celular y pasa a la siguiente pantalla.
   ========================================================= */
(function () {
  "use strict";

  var boton = document.getElementById("entendido");

  boton.addEventListener("click", function () {
    var siguiente = boton.dataset.siguiente;

    // Mientras no exista la siguiente pantalla no se guarda nada,
    // para que la bienvenida se pueda seguir viendo al probar la app.
    if (!siguiente) return;

    try {
      localStorage.setItem("acoge.bienvenidaVista", "si");
    } catch (error) {
      // Sin almacenamiento disponible la bienvenida se mostrará otra vez.
    }

    window.location.replace(siguiente);
  });
})();
