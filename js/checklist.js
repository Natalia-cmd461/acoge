/* =========================================================
   ACOGE — Checklist
   Cada corazón confirma que esa parte ya está lista:
   marcado = fondo vino y corazón crema; sin marcar = fondo
   transparente y corazón vino. Queda guardado en el celular.
   ========================================================= */
(function () {
  "use strict";

  var CLAVE = "acoge.checklist";
  var botones = document.querySelectorAll(".checklist__corazon");
  var estado = document.getElementById("checklist-estado");

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || "{}") || {}; }
    catch (error) { return {}; }
  }

  var listos = leer();

  function pintar(boton) {
    boton.setAttribute("aria-pressed", String(!!listos[boton.dataset.id]));
  }

  botones.forEach(function (boton) {
    pintar(boton);
    boton.addEventListener("click", function () {
      listos[boton.dataset.id] = !listos[boton.dataset.id];
      pintar(boton);
      try { localStorage.setItem(CLAVE, JSON.stringify(listos)); } catch (error) { /* sin almacenamiento */ }

      var total = Array.prototype.filter.call(botones, function (b) { return listos[b.dataset.id]; }).length;
      estado.textContent = total === botones.length
        ? "¡Todo listo! Tienes las " + total + " partes preparadas."
        : total + " de " + botones.length + " listas.";
    });
  });
})();
