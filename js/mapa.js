/* =========================================================
   ACOGE — Visor del mapa de la zona
   Visor propio (sin librerías): arrastrar, pellizcar con dos dedos,
   rueda del ratón, doble toque, teclado y botones + − centrar.
   Funciona en cada recuadro con data-mapa (Mapa de mi zona y
   Lugares cercanos), aunque el recuadro empiece oculto.

   La imagen va en img/mapa/ con el nombre mapa-zona.jpg (o .png / .webp).
   ========================================================= */
(function () {
  "use strict";

  var ARCHIVOS = ["img/mapa/mapa-zona.jpg", "img/mapa/mapa-zona.png", "img/mapa/mapa-zona.webp"];
  var ZOOM_MAXIMO = 5;      // veces el tamaño inicial
  var PASO_BOTON = 1.5;
  var PASO_TECLADO = 60;

  function iniciar(raiz) {
    var visor = raiz.querySelector(".mapa__visor");
    var imagen = raiz.querySelector(".mapa__imagen");
    var vacio = raiz.querySelector(".mapa__vacio");
    var botones = {
      acercar: raiz.querySelector('[data-accion="acercar"]'),
      alejar: raiz.querySelector('[data-accion="alejar"]'),
      centrar: raiz.querySelector('[data-accion="centrar"]')
    };

    var ancho = 0, alto = 0;          // tamaño real de la imagen
    var escala = 1, x = 0, y = 0;     // vista actual
    var minimo = 1, maximo = 5;
    var listo = false;                // ya tiene una vista inicial
    var punteros = new Map();
    var gesto = null;

    /* ---------- Cargar la imagen (prueba .jpg, .png y .webp) ---------- */

    function cargar(indice) {
      if (indice >= ARCHIVOS.length) {
        vacio.hidden = false;
        Object.keys(botones).forEach(function (k) { botones[k].disabled = true; });
        return;
      }
      var prueba = new Image();
      prueba.onload = function () {
        ancho = prueba.naturalWidth;
        alto = prueba.naturalHeight;
        imagen.src = ARCHIVOS[indice];
        imagen.style.width = ancho + "px";
        imagen.style.height = alto + "px";
        imagen.hidden = false;
        calcularLimites(true);
      };
      prueba.onerror = function () { cargar(indice + 1); };
      prueba.src = ARCHIVOS[indice];
    }

    /* ---------- Cálculos de la vista ---------- */

    function tamañoVisor() {
      return { w: visor.clientWidth, h: visor.clientHeight };
    }

    function calcularLimites(reiniciar) {
      var v = tamañoVisor();
      if (!ancho || !v.w || !v.h) return;   // sin imagen o recuadro oculto
      if (!listo) reiniciar = true;

      var cubrir = Math.max(v.w / ancho, v.h / alto);
      var contener = Math.min(v.w / ancho, v.h / alto);
      var centroX = (v.w / 2 - x) / escala;
      var centroY = (v.h / 2 - y) / escala;

      minimo = contener;
      maximo = cubrir * ZOOM_MAXIMO;

      if (reiniciar) {
        escala = cubrir;
        x = (v.w - ancho * escala) / 2;
        y = (v.h - alto * escala) / 2;
        listo = true;
      } else {
        escala = Math.min(Math.max(escala, minimo), maximo);
        x = v.w / 2 - centroX * escala;
        y = v.h / 2 - centroY * escala;
      }
      aplicar();
    }

    // Evita que el mapa se salga del cuadro
    function limitar() {
      var v = tamañoVisor();
      var w = ancho * escala, h = alto * escala;
      x = w <= v.w ? (v.w - w) / 2 : Math.min(0, Math.max(v.w - w, x));
      y = h <= v.h ? (v.h - h) / 2 : Math.min(0, Math.max(v.h - h, y));
    }

    function aplicar() {
      limitar();
      imagen.style.transform = "translate(" + x + "px," + y + "px) scale(" + escala + ")";
      botones.acercar.disabled = escala >= maximo - 1e-6;
      botones.alejar.disabled = escala <= minimo + 1e-6;
    }

    // Acerca o aleja manteniendo fijo el punto (cx, cy) del visor
    function zoom(factor, cx, cy) {
      if (!listo) return;
      var v = tamañoVisor();
      if (cx === undefined) { cx = v.w / 2; cy = v.h / 2; }
      var nueva = Math.min(Math.max(escala * factor, minimo), maximo);
      x = cx - (cx - x) * (nueva / escala);
      y = cy - (cy - y) * (nueva / escala);
      escala = nueva;
      aplicar();
    }

    function puntoEnVisor(evento) {
      var caja = visor.getBoundingClientRect();
      return { x: evento.clientX - caja.left, y: evento.clientY - caja.top };
    }

    /* ---------- Arrastrar y pellizcar ---------- */

    function iniciarGesto() {
      var lista = Array.from(punteros.values());
      if (lista.length === 1) {
        gesto = { tipo: "mover", x: lista[0].x, y: lista[0].y };
      } else if (lista.length >= 2) {
        var a = lista[0], b = lista[1];
        gesto = {
          tipo: "pellizcar",
          distancia: Math.hypot(b.x - a.x, b.y - a.y),
          cx: (a.x + b.x) / 2,
          cy: (a.y + b.y) / 2
        };
      } else {
        gesto = null;
      }
    }

    visor.addEventListener("pointerdown", function (evento) {
      if (!listo) return;
      try { visor.setPointerCapture(evento.pointerId); } catch (error) { /* sin captura */ }
      punteros.set(evento.pointerId, puntoEnVisor(evento));
      visor.classList.add("mapa__visor--moviendo");
      iniciarGesto();
    });

    visor.addEventListener("pointermove", function (evento) {
      if (!punteros.has(evento.pointerId) || !gesto) return;
      punteros.set(evento.pointerId, puntoEnVisor(evento));
      var lista = Array.from(punteros.values());

      if (gesto.tipo === "mover" && lista.length === 1) {
        x += lista[0].x - gesto.x;
        y += lista[0].y - gesto.y;
        gesto.x = lista[0].x;
        gesto.y = lista[0].y;
        aplicar();
      } else if (gesto.tipo === "pellizcar" && lista.length >= 2) {
        var a = lista[0], b = lista[1];
        var distancia = Math.hypot(b.x - a.x, b.y - a.y);
        var cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        x += cx - gesto.cx;
        y += cy - gesto.cy;
        zoom(distancia / gesto.distancia, cx, cy);
        gesto.distancia = distancia;
        gesto.cx = cx;
        gesto.cy = cy;
      }
    });

    function soltar(evento) {
      punteros.delete(evento.pointerId);
      if (!punteros.size) visor.classList.remove("mapa__visor--moviendo");
      iniciarGesto();
    }
    visor.addEventListener("pointerup", soltar);
    visor.addEventListener("pointercancel", soltar);

    /* ---------- Rueda, doble toque y teclado ---------- */

    visor.addEventListener("wheel", function (evento) {
      if (!listo) return;
      evento.preventDefault();
      var p = puntoEnVisor(evento);
      zoom(Math.exp(-evento.deltaY * 0.0015), p.x, p.y);
    }, { passive: false });

    visor.addEventListener("dblclick", function (evento) {
      var p = puntoEnVisor(evento);
      zoom(2, p.x, p.y);
    });

    visor.addEventListener("keydown", function (evento) {
      if (!listo) return;
      var usado = true;
      switch (evento.key) {
        case "ArrowLeft": x += PASO_TECLADO; aplicar(); break;
        case "ArrowRight": x -= PASO_TECLADO; aplicar(); break;
        case "ArrowUp": y += PASO_TECLADO; aplicar(); break;
        case "ArrowDown": y -= PASO_TECLADO; aplicar(); break;
        case "+": case "=": zoom(PASO_BOTON); break;
        case "-": case "_": zoom(1 / PASO_BOTON); break;
        case "0": calcularLimites(true); break;
        default: usado = false;
      }
      if (usado) evento.preventDefault();
    });

    /* ---------- Botones ---------- */

    botones.acercar.addEventListener("click", function () { zoom(PASO_BOTON); });
    botones.alejar.addEventListener("click", function () { zoom(1 / PASO_BOTON); });
    botones.centrar.addEventListener("click", function () { calcularLimites(true); });

    // Al mostrarse un recuadro que estaba oculto (Lugares cercanos) se recalcula
    document.addEventListener("acoge:mapa-visible", function () { calcularLimites(false); });

    // Al cambiar de tamaño se recalcula
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { calcularLimites(false); }).observe(visor);
    } else {
      window.addEventListener("resize", function () { calcularLimites(false); });
    }

    cargar(0);
  }

  document.querySelectorAll("[data-mapa]").forEach(iniciar);
})();
