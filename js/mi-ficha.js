/* =========================================================
   ACOGE — Mi ficha de emergencia (editable)
   Cada dato se puede tocar y cambiar. Los ejemplos se ven en
   gris y desaparecen al escribir. Se guarda solo, en este celular.
   ========================================================= */
(function () {
  "use strict";

  var formulario = document.getElementById("mi-ficha");
  var estado = document.getElementById("mf-estado");
  var campos = formulario.querySelectorAll("input, textarea");
  var temporizador = null;
  var cambiado = false;

  // Cargar la ficha (incluye lo llenado en el formulario de la primera apertura)
  var datos = window.ACOGE.ficha.separarDesdeFormulario(window.ACOGE.ficha.leer());
  campos.forEach(function (campo) {
    if (datos[campo.name]) campo.value = datos[campo.name];
  });

  // El cuadro de información adicional crece con el texto
  var adicional = formulario.elements.adicional;
  function ajustarAlto() {
    adicional.style.height = "auto";
    adicional.style.height = adicional.scrollHeight + "px";
  }
  ajustarAlto();
  adicional.addEventListener("input", ajustarAlto);

  function guardarAhora() {
    if (!cambiado) return;
    cambiado = false;
    var actual = window.ACOGE.ficha.leer();
    campos.forEach(function (campo) {
      actual[campo.name] = campo.value.trim();
    });
    window.ACOGE.ficha.unirDesdeMiFicha(actual);
    try {
      window.ACOGE.ficha.guardar(actual);
      estado.textContent = "Cambios guardados.";
    } catch (error) {
      estado.textContent = "No se pudieron guardar los cambios en este celular.";
    }
  }

  formulario.addEventListener("input", function () {
    cambiado = true;
    clearTimeout(temporizador);
    temporizador = setTimeout(guardarAhora, 500);
  });
  formulario.addEventListener("change", guardarAhora);
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    guardarAhora();
  });
  window.addEventListener("pagehide", function () {
    clearTimeout(temporizador);
    guardarAhora();
  });
})();
