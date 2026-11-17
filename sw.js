/* =========================================================
   ACOGE — Service worker
   - Al instalarse guarda el contenido esencial.
   - Con internet, siempre trae la versión más nueva (y la guarda).
   - Sin internet, responde con lo guardado o con «Sin conexión».
   ========================================================= */
importScripts("js/contenido.js");

var CONTENIDO = self.ACOGE_CONTENIDO;
var CACHE_ESENCIAL = "acoge-esencial-v" + CONTENIDO.VERSION;
var CACHE_CONTENIDO = "acoge-contenido-v" + CONTENIDO.VERSION;
var CACHE_FUENTES = "acoge-fuentes-v1";
var CACHES_ACTUALES = [CACHE_ESENCIAL, CACHE_CONTENIDO, CACHE_FUENTES];
var ESPERA_RED_MS = 4000;

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE_ESENCIAL)
      .then(function (cache) {
        return cache.addAll(CONTENIDO.esencial).then(function () {
          return guardarOpcionales(cache);
        });
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      var viejas = nombres.filter(function (nombre) {
        return nombre.indexOf("acoge-") === 0 && CACHES_ACTUALES.indexOf(nombre) === -1;
      });
      var habiaDescargado = viejas.some(function (nombre) {
        return nombre.indexOf("acoge-contenido-") === 0;
      });

      // Si la persona ya había descargado, se vuelve a descargar la versión nueva.
      var redescarga = habiaDescargado
        ? caches.open(CACHE_CONTENIDO)
            .then(function (cache) { return cache.addAll(CONTENIDO.completo); })
            .catch(function () { /* se intentará en la próxima apertura */ })
        : Promise.resolve();

      return redescarga.then(function () {
        return Promise.all(viejas.map(function (nombre) { return caches.delete(nombre); }));
      });
    }).then(function () { return self.clients.claim(); })
  );
});

// Archivos que pueden no existir todavía (por ejemplo, el mapa): si faltan, no pasa nada.
function guardarOpcionales(cache) {
  return Promise.all((CONTENIDO.opcional || []).map(function (ruta) {
    return cache.add(ruta).catch(function () {});
  }));
}

function esFuente(url) {
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

// Fuentes de Google: primero lo guardado; si no está, se trae y se guarda.
function responderFuente(peticion) {
  return caches.open(CACHE_FUENTES).then(function (cache) {
    return cache.match(peticion).then(function (guardada) {
      if (guardada) return guardada;
      return fetch(peticion).then(function (respuesta) {
        if (respuesta.ok) cache.put(peticion, respuesta.clone());
        return respuesta;
      });
    });
  });
}

// Busca en lo guardado sin tener en cuenta «?volver=…» o «?reiniciar».
function buscarGuardado(peticion) {
  return caches.match(peticion, { ignoreSearch: true });
}

// Actualiza la copia guardada solo si ese archivo ya estaba guardado.
function actualizarGuardado(peticion, respuesta) {
  var url = new URL(peticion.url);
  url.search = "";
  return caches.keys().then(function (nombres) {
    return Promise.all(nombres.filter(function (nombre) {
      return nombre === CACHE_ESENCIAL || nombre === CACHE_CONTENIDO;
    }).map(function (nombre) {
      return caches.open(nombre).then(function (cache) {
        return cache.match(url.href).then(function (existe) {
          if (existe) return cache.put(url.href, respuesta.clone());
        });
      });
    }));
  });
}

function respuestaSinConexion(peticion) {
  if (peticion.mode === "navigate") return caches.match("sin-conexion.html");
  return Promise.resolve(Response.error());
}

// Con internet: la versión más nueva. Si la red tarda o falla: lo guardado.
function responderPrimeroRed(peticion) {
  return new Promise(function (resolver) {
    var resuelto = false;
    function terminar(respuesta) {
      if (!resuelto && respuesta) { resuelto = true; resolver(respuesta); }
    }

    var temporizador = setTimeout(function () {
      buscarGuardado(peticion).then(terminar);
    }, ESPERA_RED_MS);

    fetch(peticion).then(function (respuesta) {
      clearTimeout(temporizador);
      if (respuesta.ok) actualizarGuardado(peticion, respuesta.clone());
      terminar(respuesta);
    }).catch(function () {
      clearTimeout(temporizador);
      buscarGuardado(peticion).then(function (guardada) {
        if (guardada) terminar(guardada);
        else respuestaSinConexion(peticion).then(terminar);
      });
    });
  });
}

self.addEventListener("fetch", function (evento) {
  var peticion = evento.request;
  if (peticion.method !== "GET") return;

  var url = new URL(peticion.url);
  if (esFuente(url)) {
    evento.respondWith(responderFuente(peticion));
  } else if (url.origin === self.location.origin) {
    evento.respondWith(responderPrimeroRed(peticion));
  }
});
