/* =========================================================
   ACOGE — Datos de la ficha de emergencia
   Una sola ficha para el formulario (ficha.html) y Mi ficha
   (mi-ficha.html). Se guarda solo en este celular.

   El formulario usa un campo por contacto («nombre + teléfono»)
   y uno para mascotas; Mi ficha los separa. Aquí se mantienen
   las dos formas sincronizadas.
   ========================================================= */
(function () {
  "use strict";

  var CLAVE = "acoge.ficha";

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || "null") || {}; }
    catch (error) { return {}; }
  }

  function guardar(datos) {
    datos.guardada = new Date().toISOString();
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  }

  // «Pepito Perez 3102545865» → { nombre: "Pepito Perez", tel: "3102545865" }
  function separarContacto(texto) {
    texto = (texto || "").trim();
    var coincidencias = texto.match(/\+?\d[\d\s-]{5,}\d/g);
    if (!coincidencias) return { nombre: texto, tel: "" };
    var tel = coincidencias[coincidencias.length - 1];
    var nombre = texto.replace(tel, "").replace(/(tel[eé]fono|tel)\s*[:.]?/i, "")
      .replace(/[\s,;:\-–—+]+$/, "").replace(/^[\s,;:\-–—+]+/, "").trim();
    return { nombre: nombre, tel: tel.trim() };
  }

  function unirContacto(nombre, tel) {
    return [nombre, tel].filter(Boolean).join(" ").trim();
  }

  function unirMascota(datos) {
    return [datos.mascotaNombre, datos.mascotaEspecie, datos.mascotaRaza, datos.mascotaColor]
      .filter(Boolean).join(", ");
  }

  // Completa los campos separados a partir de los del formulario.
  function separarDesdeFormulario(datos) {
    ["contacto", "alterno"].forEach(function (campo) {
      var unido = unirContacto(datos[campo + "Nombre"], datos[campo + "Tel"]);
      if ((datos[campo] || "") !== unido) {
        var partes = separarContacto(datos[campo]);
        datos[campo + "Nombre"] = partes.nombre;
        datos[campo + "Tel"] = partes.tel;
      }
    });
    if ((datos.mascotas || "") !== unirMascota(datos)) {
      datos.mascotaNombre = datos.mascotas || "";
      datos.mascotaEspecie = "";
      datos.mascotaRaza = "";
      datos.mascotaColor = "";
    }
    return datos;
  }

  // Actualiza los campos del formulario a partir de los separados.
  function unirDesdeMiFicha(datos) {
    datos.contacto = unirContacto(datos.contactoNombre, datos.contactoTel);
    datos.alterno = unirContacto(datos.alternoNombre, datos.alternoTel);
    datos.mascotas = unirMascota(datos);
    return datos;
  }

  window.ACOGE = window.ACOGE || {};
  window.ACOGE.ficha = {
    leer: leer,
    guardar: guardar,
    separarDesdeFormulario: separarDesdeFormulario,
    unirDesdeMiFicha: unirDesdeMiFicha
  };
})();
