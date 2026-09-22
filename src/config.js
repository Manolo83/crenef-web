const path = require('path');

// Carpeta donde viven los datos y los archivos subidos desde /admin. En
// Railway se apunta a un Volume (DATA_DIR=/data) para que sobrevivan a cada
// despliegue.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');

// URL publica del sitio, sin diagonal al final.
//
// ES EL UNICO LUGAR donde se define: de aqui salen las etiquetas canonicas,
// og:url, og:image, twitter:image, robots.txt, sitemap.xml y los datos
// estructurados. Cambiarla aqui (o en la variable SITE_URL de Railway, que
// manda sobre este valor) mueve todo el sitio de dominio.
//
// Mientras crenef.mx no este activo, apunta al dominio de Railway: si apuntara
// a un dominio que todavia no existe, Google no podria indexar el sitio y las
// vistas previas al compartir el enlace saldrian rotas.
const SITE_URL = (process.env.SITE_URL || 'https://crenef-web-production.up.railway.app').replace(/\/$/, '');

// Medicion (opcional). Sin estas variables el sitio no carga nada de
// terceros: ni Google ni Meta.
const GA_ID = process.env.GA_ID || '';
const GOOGLE_ADS_ID = process.env.GOOGLE_ADS_ID || '';
const GOOGLE_ADS_CONVERSION_CONTACTO = process.env.GOOGLE_ADS_CONVERSION_CONTACTO || '';
const META_PIXEL_ID = process.env.META_PIXEL_ID || '';

const EN_PRODUCCION = process.env.NODE_ENV === 'production';

module.exports = {
  DATA_DIR,
  UPLOAD_DIR,
  SITE_URL,
  GA_ID,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_CONVERSION_CONTACTO,
  META_PIXEL_ID,
  EN_PRODUCCION,
};
