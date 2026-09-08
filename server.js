require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieSession = require('cookie-session');
const rateLimit = require('express-rate-limit');

const { UPLOAD_DIR, SITE_URL, EN_PRODUCCION } = require('./src/config');
const store = require('./src/store');
const { render } = require('./src/render');
const rutasPublicas = require('./src/routes/publico');
const rutasApi = require('./src/routes/api');
const rutasAdmin = require('./src/routes/admin');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
console.log(`[uploads] Los archivos subidos se guardan en: ${UPLOAD_DIR}`);
if (EN_PRODUCCION && !UPLOAD_DIR.startsWith('/data')) {
  console.error(
    `[uploads] AVISO: en produccion UPLOAD_DIR deberia vivir dentro de /data (el Volume de Railway) para sobrevivir a cada despliegue. Ruta actual: ${UPLOAD_DIR}. Revisa la variable DATA_DIR en Railway (debe ser "/data").`
  );
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'unsafe-inline' es necesario para los datos estructurados (JSON-LD)
        // y las etiquetas de medicion que se inyectan en el <head>.
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://connect.facebook.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ['https://www.google.com', 'https://maps.google.com'],
        connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com', 'https://www.facebook.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: EN_PRODUCCION ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: 'crenef_session',
    secret: process.env.SESSION_SECRET || 'cambia-esta-clave-en-las-variables-de-entorno',
    maxAge: 12 * 60 * 60 * 1000,
    sameSite: 'lax',
    httpOnly: true,
    secure: EN_PRODUCCION,
  })
);

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});
app.use('/admin/login', limitarLogin);

const limitarSolicitudes = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Recibimos varias solicitudes desde aquí. Espera unos minutos o escríbenos por WhatsApp.' },
});
app.use('/api/solicitudes', limitarSolicitudes);

// Archivos subidos desde /admin (viven en el Volume, no en el repositorio).
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

// Estaticos del sitio: hoja de estilos, script e imagenes de marca.
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: EN_PRODUCCION ? '7d' : 0,
    index: false,
    extensions: false,
    // /admin lo sirve el router del panel, no el estatico de la carpeta.
    redirect: false,
  })
);

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api', rutasApi);
app.use('/admin', rutasAdmin);

app.get('/healthz', (req, res) => res.status(200).send('ok'));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// El sitemap se arma en cada solicitud, asi que nunca se queda sin los
// servicios que se agreguen desde /admin.
app.get('/sitemap.xml', (req, res) => {
  const paginas = [
    { loc: '/', prioridad: '1.0', frecuencia: 'weekly' },
    { loc: '/servicios', prioridad: '0.9', frecuencia: 'weekly' },
    { loc: '/nosotros', prioridad: '0.7', frecuencia: 'monthly' },
    { loc: '/preguntas-frecuentes', prioridad: '0.7', frecuencia: 'monthly' },
    { loc: '/ubicacion', prioridad: '0.7', frecuencia: 'monthly' },
    { loc: '/contacto', prioridad: '0.8', frecuencia: 'monthly' },
    { loc: '/aviso-de-privacidad', prioridad: '0.3', frecuencia: 'yearly' },
    ...store.getServicios().map((s) => ({ loc: `/servicios/${s.slug}`, prioridad: '0.8', frecuencia: 'monthly' })),
  ];
  const urls = paginas
    .map(({ loc, prioridad, frecuencia }) => `\n  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${frecuencia}</changefreq>\n    <priority>${prioridad}</priority>\n  </url>`)
    .join('');
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`);
});

app.use('/', rutasPublicas);

app.use((req, res) => {
  res.status(404).set('Content-Type', 'text/html; charset=utf-8').send(
    render('404', { meta: { titulo: 'Página no encontrada · CRENEF', ruta: req.path, noindex: true } })
  );
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (res.headersSent) return;
  res.status(500).set('Content-Type', 'text/html; charset=utf-8').send(
    render('404', { meta: { titulo: 'Algo salió mal · CRENEF', ruta: req.path, noindex: true } })
  );
});

const PORT = process.env.PORT || 3000;
let servidor;

store
  .init()
  .then(() => {
    servidor = app.listen(PORT, () =>
      console.log(
        `CRENEF escuchando en el puerto ${PORT} · modo ${EN_PRODUCCION ? 'produccion' : 'desarrollo'} · contenido en ${process.env.DATABASE_URL ? 'PostgreSQL' : 'archivo local'}`
      )
    );
  })
  .catch((err) => {
    console.error('No se pudo inicializar el contenido, el servidor no arranco:', err.message);
    process.exit(1);
  });

// Al apagar el contenedor (por ejemplo en un redeploy de Railway) se termina
// de guardar antes de salir, para no perder el ultimo cambio del panel.
process.on('SIGTERM', async () => {
  try {
    await store.flush();
  } finally {
    if (servidor) servidor.close(() => process.exit(0));
    else process.exit(0);
  }
});

module.exports = app;
