/* =========================================================
   ACOGE — ¿Cómo es mi casa o edificio?
   Cada botón abre su tarjeta encima de la pantalla.
   Se cierra tocando el fondo, con Esc o con «Volver».
   ========================================================= */
(function () {
  "use strict";

  var abierta = null;
  var origen = null;

  function abrir(capa, boton) {
    abierta = capa;
    origen = boton;
    // El botón queda vino mientras su tarjeta está abierta
    boton.dataset.navegando = "si";
    boton.classList.add("boton-antes--presionado");
    capa.hidden = false;
    document.body.classList.add("con-superposicion");
    capa.querySelector(".superposicion__tarjeta").focus();
  }

  function cerrar() {
    if (!abierta) return;
    abierta.hidden = true;
    abierta = null;
    document.body.classList.remove("con-superposicion");
    if (origen) {
      delete origen.dataset.navegando;
      origen.classList.remove("boton-antes--presionado");
      origen.focus();
    }
  }

  document.querySelectorAll("[data-abre]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      abrir(document.getElementById(boton.dataset.abre), boton);
    });
  });

  document.querySelectorAll(".superposicion").forEach(function (capa) {
    // Tocar el fondo (fuera de la tarjeta) vuelve a la pantalla
    capa.addEventListener("click", function (evento) {
      if (evento.target === capa) cerrar();
    });
    capa.querySelector(".superposicion__volver").addEventListener("click", cerrar);
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") cerrar();

    // El foco no se sale de la tarjeta mientras está abierta
    if (evento.key === "Tab" && abierta) {
      evento.preventDefault();
      var volver = abierta.querySelector(".superposicion__volver");
      (document.activeElement === volver ? abierta.querySelector(".superposicion__tarjeta") : volver).focus();
    }
  });
})();
