/* =========================================================
   ACOGE — Ficha de emergencia
   Los datos se guardan solo en este celular (localStorage).
   «Confirmar» guarda y muestra «Guardado».
   ========================================================= */
(function () {
  "use strict";

  var CLAVE = "acoge.ficha";
  var CAMPOS = ["nombre", "sangre", "alergias", "medicamentos", "eps",
    "encuentro", "contacto", "alterno", "mascotas", "adicional"];

  var formulario = document.getElementById("formulario");
  var errorNombre = document.getElementById("error-nombre");
  var campoNombre = document.getElementById("nombre");
  var archivoFoto = document.getElementById("foto-archivo");
  var fotoImagen = document.getElementById("foto-imagen");
  var fotoIcono = document.getElementById("foto-icono");
  var foto = null;

  // A dónde volver después de guardar (por ejemplo, la pantalla de permisos)
  var volver = new URLSearchParams(window.location.search).get("volver");
  if (volver && !/^[a-z-]+\.html$/.test(volver)) volver = null;

  function mostrarFoto(datos) {
    foto = datos;
    fotoImagen.src = datos;
    fotoImagen.hidden = false;
    fotoIcono.hidden = true;
  }

  /* ---------- Cargar lo que ya estaba guardado ---------- */

  try {
    var guardada = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (guardada) {
      CAMPOS.forEach(function (campo) {
        if (guardada[campo]) formulario.elements[campo].value = guardada[campo];
      });
      if (guardada.foto) mostrarFoto(guardada.foto);
    }
  } catch (error) {
    // Datos dañados o sin almacenamiento: se empieza con la ficha vacía.
  }

  /* ---------- Foto: se reduce a 240 px para ocupar poco espacio ---------- */

  archivoFoto.addEventListener("change", function () {
    var archivo = archivoFoto.files && archivoFoto.files[0];
    if (!archivo) return;

    var lector = new FileReader();
    lector.onload = function () {
      var imagen = new Image();
      imagen.onload = function () {
        var lado = 240;
        var lienzo = document.createElement("canvas");
        lienzo.width = lado;
        lienzo.height = lado;
        var menor = Math.min(imagen.width, imagen.height);
        lienzo.getContext("2d").drawImage(imagen,
          (imagen.width - menor) / 2, (imagen.height - menor) / 2, menor, menor,
          0, 0, lado, lado);
        mostrarFoto(lienzo.toDataURL("image/jpeg", 0.8));
      };
      imagen.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });

  /* ---------- Guardar ---------- */

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!campoNombre.value.trim()) {
      errorNombre.textContent = "Escribe tu nombre completo para guardar la ficha.";
      campoNombre.setAttribute("aria-invalid", "true");
      campoNombre.focus();
      return;
    }
    errorNombre.textContent = "";
    campoNombre.removeAttribute("aria-invalid");

    // Se parte de lo ya guardado para no perder lo que se llenó en Mi ficha.
    var datos = window.ACOGE.ficha.leer();
    datos.guardada = new Date().toISOString();
    CAMPOS.forEach(function (campo) {
      datos[campo] = formulario.elements[campo].value.trim();
    });
    if (foto) datos.foto = foto;
    window.ACOGE.ficha.separarDesdeFormulario(datos);

    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch (error) {
      errorNombre.textContent = "No se pudo guardar en este celular. Revisa que haya espacio disponible e intenta de nuevo.";
      return;
    }

    window.scrollTo(0, 0);
    window.ACOGE.mostrarConfirmacion({
      icono: "img/icono-ficha.png", ancho: 118, alto: 123, arriba: 166,
      texto: "Guardado",
      alTerminar: function () {
        if (volver) window.location.replace(volver);
      }
    });
  });
})();
