// Armado de las paginas.
//
// Cada pagina publica es un archivo HTML dentro de /paginas. El servidor lo
// mete dentro de la plantilla comun (_documento.html, con la cabecera y el
// pie) y sustituye dos cosas:
//
//   {{clave}}     texto, escapado y con los saltos de linea convertidos en <br>
//   {{{clave}}}   HTML tal cual (bloques generados: listas de servicios, etc.)
//
// Se resuelve en el servidor, no en el navegador: el visitante y Google
// reciben el HTML ya completo, sin esperar a que corra JavaScript.

const fs = require('fs');
const path = require('path');
const { SITE_URL, GA_ID, GOOGLE_ADS_ID, META_PIXEL_ID, EN_PRODUCCION } = require('./config');
const store = require('./store');
const { icono } = require('./iconos');

const DIR_PAGINAS = path.join(__dirname, '..', 'paginas');
const cache = new Map();

function leer(nombre) {
  if (EN_PRODUCCION && cache.has(nombre)) return cache.get(nombre);
  const contenido = fs.readFileSync(path.join(DIR_PAGINAS, `${nombre}.html`), 'utf8');
  cache.set(nombre, contenido);
  return contenido;
}

const escapar = (valor) =>
  String(valor == null ? '' : valor).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const escaparConSaltos = (valor) => escapar(valor).replace(/\r?\n/g, '<br>');

// Convierte un texto con lineas en blanco en varios <p>.
const parrafos = (valor, clase = '') =>
  String(valor || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${clase ? ` class="${clase}"` : ''}>${escapar(p).replace(/\r?\n/g, '<br>')}</p>`)
    .join('\n');

const precio = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`;

// Enlace de WhatsApp con el mensaje ya escrito.
function urlWhatsApp(contenido, mensaje) {
  const numero = String(contenido.contacto_whatsapp || '').replace(/\D/g, '');
  const texto = mensaje || contenido.contacto_whatsapp_mensaje || '';
  const base = `https://wa.me/52${numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

// Etiquetas de medicion. Sin variables de entorno no se carga nada de
// terceros, que es como queda el sitio recien desplegado.
function medicion() {
  let html = '';
  if (GA_ID) {
    html += `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`;
  }
  if (GOOGLE_ADS_ID) {
    html += `\n<script>(function(){try{var p=new URLSearchParams(location.search);['gclid','gbraid','wbraid'].forEach(function(k){var v=p.get(k);if(v)document.cookie=k+'='+encodeURIComponent(v)+'; max-age='+(90*24*60*60)+'; path=/; SameSite=Lax';});}catch(e){}})();</script>
${GA_ID ? '' : '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}</script>'}
<script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"></script>
<script>gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');</script>`;
  }
  if (META_PIXEL_ID) {
    html += `\n<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"></noscript>`;
  }
  return html;
}

const NAV = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/servicios', etiqueta: 'Servicios' },
  { ruta: '/nosotros', etiqueta: 'La clínica' },
  { ruta: '/preguntas-frecuentes', etiqueta: 'Preguntas' },
  { ruta: '/ubicacion', etiqueta: 'Ubicación' },
  { ruta: '/contacto', etiqueta: 'Contacto' },
];

function menu(rutaActual, clase) {
  return NAV.map((i) => {
    const activo = i.ruta === '/' ? rutaActual === '/' : rutaActual.startsWith(i.ruta);
    return `<a class="${clase}${activo ? ' es-activo' : ''}" href="${i.ruta}"${activo ? ' aria-current="page"' : ''}>${escapar(i.etiqueta)}</a>`;
  }).join('\n');
}

function sustituir(plantilla, datos) {
  return plantilla
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, clave) => (datos[clave] == null ? '' : String(datos[clave])))
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, clave) => escaparConSaltos(datos[clave]));
}

// Genera el HTML de una pagina completa.
//
//   pagina  nombre del archivo dentro de /paginas (sin .html)
//   opciones.meta      titulo, descripcion, ruta, imagen, noindex
//   opciones.bloques   HTML ya generado para los {{{marcadores}}} de la pagina
function render(pagina, opciones = {}) {
  const contenido = store.getContenido();
  const meta = opciones.meta || {};
  const ruta = meta.ruta || '/';

  const base = {
    ...contenido,
    ...(opciones.bloques || {}),
    meta_titulo: meta.titulo || 'CRENEF · Clínica de Rehabilitación Neumofisio',
    meta_descripcion:
      meta.descripcion ||
      'Clínica especializada en rehabilitación pulmonar y fisioterapia respiratoria en Coyoacán, CDMX. Valoración, espirometría, terapia física y más.',
    meta_canonica: `${SITE_URL}${ruta === '/' ? '/' : ruta}`,
    meta_imagen: meta.imagen ? (meta.imagen.startsWith('http') ? meta.imagen : `${SITE_URL}${meta.imagen}`) : `${SITE_URL}/img/og-image.png`,
    meta_robots: meta.noindex ? 'noindex, nofollow' : 'index, follow',
    sitio_url: SITE_URL,
    anio: String(new Date().getFullYear()),
    wa_url: urlWhatsApp(contenido),
    medicion: medicion(),
    menu_escritorio: menu(ruta, 'nav-enlace'),
    menu_movil: menu(ruta, 'menu-movil-enlace'),
    datos_estructurados: [datosEstructurados(contenido), ...(opciones.jsonLd || [])].join('\n'),
    // Enlaces e iconos que usan la plantilla comun y varias paginas.
    pie_servicios: store
      .getAreas()
      .map((a) => `<li><a href="/servicios#${a.slug}">${escapar(a.nombre)}</a></li>`)
      .join('\n'),
    icono_pin: icono('pin', 'icono-teal'),
    icono_reloj: icono('reloj', 'icono-azul'),
    icono_wa: icono('wa', 'icono-teal'),
    icono_correo: icono('correo', 'icono-azul'),
  };

  const cuerpo = sustituir(leer(pagina), base);
  return sustituir(leer('_documento'), { ...base, contenido_pagina: cuerpo });
}

// JSON-LD de la clinica (MedicalClinic). Va en TODAS las paginas: le dice a
// Google que esto es una clinica, donde esta, a que hora abre y que servicios
// ofrece, que es lo que alimenta la ficha de busqueda y la de Maps.
//
// Nota de marca: la especialidad se declara como RespiratoryTherapy
// (inhaloterapia) y Physiotherapy, no como Pulmonary/neumologia: la clinica no
// ofrece consulta de neumologia. Ambos son valores validos del vocabulario
// MedicalSpecialty de schema.org.
const COORDENADAS = { latitud: 19.3208826, longitud: -99.1393025 };

function datosEstructurados(contenido) {
  const servicio = (tipo, nombre, slug) => ({
    '@type': tipo,
    name: nombre,
    url: `${SITE_URL}/servicios/${slug}`,
  });

  const ficha = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': `${SITE_URL}/#clinica`,
    name: 'CRENEF - Clínica de Rehabilitación Neumofisio',
    alternateName: 'CRENEF',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/img/isotipo-crenef.png`,
    image: `${SITE_URL}/img/og-image.png`,
    description:
      'Clínica especializada en rehabilitación pulmonar, inhaloterapia y fisioterapia en Coyoacán, Ciudad de México. Atención de martes a domingo de 9:00 a 21:00 h.',
    priceRange: '$$',
    currenciesAccepted: 'MXN',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contenido.contacto_direccion_1,
      addressLocality: 'Coyoacán',
      addressRegion: 'Ciudad de México',
      postalCode: '04620',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COORDENADAS.latitud,
      longitude: COORDENADAS.longitud,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    areaServed: { '@type': 'City', name: 'Ciudad de México' },
    medicalSpecialty: ['RespiratoryTherapy', 'Physiotherapy'],
    availableService: [
      servicio('MedicalTherapy', 'Rehabilitación pulmonar', 'rehabilitacion-pulmonar'),
      servicio('MedicalTherapy', 'Inhaloterapia y micronebulizaciones', 'micronebulizacion-con-medicamento'),
      servicio('MedicalTest', 'Espirometría', 'espirometria'),
      servicio('PhysicalTherapy', 'Terapia física individualizada', 'terapia-fisica-individualizada'),
      servicio('PhysicalTherapy', 'Descarga muscular', 'descarga-muscular'),
    ],
  };

  const tel = String(contenido.contacto_whatsapp || '').replace(/\D/g, '');
  if (tel) {
    ficha.telephone = `+52${tel}`;
    ficha.potentialAction = {
      '@type': 'CommunicateAction',
      name: 'Agendar cita por WhatsApp',
      target: `https://wa.me/52${tel}`,
    };
  }
  if (contenido.contacto_correo) ficha.email = contenido.contacto_correo;

  // Enlace de la ficha de Google Business. Se captura en /admin > Textos del
  // sitio > Contacto, sin tocar codigo. Mientras este vacio se omiten los dos
  // campos: publicar un texto de relleno en su lugar invalidaria el marcado.
  const ficha_google = String(contenido.contacto_ficha_google || '').trim();
  if (ficha_google) {
    ficha.hasMap = ficha_google;
    ficha.sameAs = [ficha_google];
  }

  return etiquetaJsonLd(ficha);
}

// Serializa un objeto como <script type="application/ld+json">, escapando el
// "<" para que un texto del panel no pueda cerrar la etiqueta.
const etiquetaJsonLd = (objeto) =>
  `<script type="application/ld+json">${JSON.stringify(objeto).replace(/</g, '\\u003c')}</script>`;

module.exports = { render, etiquetaJsonLd, escapar, escaparConSaltos, parrafos, precio, urlWhatsApp, NAV, DIR_PAGINAS };
