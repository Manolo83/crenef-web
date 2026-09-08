// Subida de imagenes desde /admin (fotos de la clinica, del equipo, de los
// servicios). Se guardan en UPLOAD_DIR, que en Railway apunta al Volume.

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { UPLOAD_DIR } = require('./config');

const PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const subirImagen = multer({
  storage: almacenamiento,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (PERMITIDAS.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.'));
  },
});

// Las fotos de celular llegan a resolucion de camara (varios MB). Se
// redimensionan y comprimen antes de guardarlas para que el sitio cargue
// rapido en datos moviles.
const LADO_MAXIMO = 1800;

async function procesarImagen(req, res, next) {
  if (!req.file || !PERMITIDAS.includes(req.file.mimetype) || req.file.mimetype === 'image/gif') return next();
  try {
    const ruta = req.file.path;
    const meta = await sharp(ruta).metadata();
    let imagen = sharp(ruta)
      .rotate()
      .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true });
    if (meta.format === 'png') imagen = imagen.png({ compressionLevel: 8 });
    else if (meta.format === 'webp') imagen = imagen.webp({ quality: 82 });
    else imagen = imagen.jpeg({ quality: 82, mozjpeg: true });
    const buffer = await imagen.toBuffer();
    fs.writeFileSync(ruta, buffer);
    req.file.size = buffer.length;
  } catch (e) {
    console.error('[uploads] No se pudo optimizar la imagen, se guarda tal cual:', e.message);
  }
  next();
}

function borrarSiEsSubida(url) {
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
  }
}

module.exports = { subirImagen, procesarImagen, borrarSiEsSubida, PERMITIDAS };
