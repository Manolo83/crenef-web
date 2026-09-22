// Mapa unico de las rutas publicas del sitio.
//
// De aqui salen el sitemap.xml y la lista de lo que se bloquea en robots.txt.
// Las paginas de servicio NO se enumeran a mano: se derivan de los servicios
// que existen en ese momento en la base, asi que agregar o borrar uno desde
// /admin actualiza el sitemap solo, sin que nadie tenga que acordarse.

// Paginas fijas, con la prioridad que le indicamos a Google.
const PAGINAS = [
  { ruta: '/', prioridad: '1.0', frecuencia: 'weekly' },
  { ruta: '/servicios', prioridad: '0.9', frecuencia: 'weekly' },
  { ruta: '/agenda', prioridad: '0.9', frecuencia: 'monthly' },
  { ruta: '/ubicacion', prioridad: '0.8', frecuencia: 'monthly' },
  { ruta: '/preguntas-frecuentes', prioridad: '0.8', frecuencia: 'monthly' },
  { ruta: '/nosotros', prioridad: '0.6', frecuencia: 'monthly' },
  { ruta: '/contacto', prioridad: '0.6', frecuencia: 'monthly' },
  { ruta: '/aviso-de-privacidad', prioridad: '0.3', frecuencia: 'yearly' },
];

// Prioridad de cada pagina de servicio. Las que no aparecen aqui usan
// PRIORIDAD_SERVICIO_POR_DEFECTO, para que un servicio nuevo creado desde
// /admin entre al sitemap sin tocar codigo.
const PRIORIDAD_POR_SERVICIO = {
  'valoracion-especializada': '0.8',
  'rehabilitacion-pulmonar': '0.8',
  espirometria: '0.8',
  'micronebulizacion-con-medicamento': '0.7',
  'micronebulizacion-con-solucion-fisiologica': '0.7',
  'consulta-de-seguimiento': '0.6',
  'consulta-inicial-fisioterapeutica': '0.8',
  'terapia-fisica-individualizada': '0.8',
  'descarga-muscular': '0.8',
  'mascarilla-facial': '0.6',
  'sesion-dermocosmetica-antiedad': '0.6',
};

const PRIORIDAD_SERVICIO_POR_DEFECTO = '0.7';

// Rutas que no deben indexarse. /gracias es la pantalla de confirmacion del
// formulario (no tiene sentido llegar ahi desde una busqueda) y /admin es el
// panel de la clinica.
const NO_INDEXABLES = ['/admin', '/gracias'];

module.exports = { PAGINAS, PRIORIDAD_POR_SERVICIO, PRIORIDAD_SERVICIO_POR_DEFECTO, NO_INDEXABLES };
