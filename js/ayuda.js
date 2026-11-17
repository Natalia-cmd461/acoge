/* =========================================================
   ACOGE — Dónde buscar ayuda
   «Líneas telefónicas» y «Lugares cercanos» cambian el contenido
   sin cambiar de altura. El botón elegido queda vino con letra crema.
   ayuda.html#lugares abre directo los lugares cercanos.
   ========================================================= */
(function () {
  "use strict";

  var pestanaLineas = document.getElementById("pestana-lineas");
  var pestanaLugares = document.getElementById("pestana-lugares");
  var panelLineas = document.getElementById("panel-lineas");
  var panelLugares = document.getElementById("panel-lugares");

  function mostrar(lugares) {
    panelLineas.hidden = lugares;
    panelLugares.hidden = !lugares;
    pestanaLineas.setAttribute("aria-pressed", String(!lugares));
    pestanaLugares.setAttribute("aria-pressed", String(lugares));
    if (lugares) document.dispatchEvent(new Event("acoge:mapa-visible"));
    history.replaceState(null, "", lugares ? "#lugares" : location.pathname);
  }

  pestanaLineas.addEventListener("click", function () { mostrar(false); });
  pestanaLugares.addEventListener("click", function () { mostrar(true); });

  if (location.hash === "#lugares") mostrar(true);
  window.addEventListener("hashchange", function () { mostrar(location.hash === "#lugares"); });
})();
