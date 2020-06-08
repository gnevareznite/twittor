// Importación de un script en otro archivo
importScripts('js/sw-utils.js');

// Nombre de los caches
const STATIC_CACHE    = 'static-v2';
const DYMANIC_CACHE   = 'dynamic_v1';
const INMUTABLE_CACHE = 'inmutable_v1';

// Contenido Caché Estático (se moverá poco, es lo que generé de la app)
const APP_SHELL = [
    //'/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/wolverine.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/hulk.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

// Contenido Caché inmutable (no se moverá jamás, son recursos de terceros)
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// Realizar la instalación
self.addEventListener('install', event => {
    // Generar y cargar el caché estático
    const cacheStatic = caches.open(STATIC_CACHE)
                              .then(cache => {
                                  cache.addAll(APP_SHELL);
                              });

    // Generar y cargar el caché inmutable
    const cacheInmutable = caches.open(INMUTABLE_CACHE)
                              .then(cache => {
                                  cache.addAll(APP_SHELL_INMUTABLE);
                              });

    // esperar hasta que se realice el montado del caché
    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Al activar el SW, eliminar cachés viejos
self.addEventListener('activate', event => {
    // Eliminar todos los caches que se llamane static[algo]
    // que no sean el que estamos manejando en CACHE_STATIC
    const delCaches = caches.keys()
                        .then(keys => {
                            keys.forEach(key => {
                                if (key !== STATIC_CACHE && key.includes('static')) {
                                    return caches.delete(key);
                                }
                            });
                        });

    // Esperar hasta que termine de eliminar los cachés
    event.waitUntil(delCaches);
});

// Manejo del caché en el evento fetch
self.addEventListener('fetch', event => {
    const resp = caches.match(event.request)
                    .then(resp => {
                        if(resp) {
                            return resp;
                        }
                        else {
                            return fetch(event.request)
                                        .then(newResp => {
                                            return ActualizaCacheDinamico(DYMANIC_CACHE, event.request, newResp);
                                        });
                        }
                    });

    event.respondWith(resp);
});