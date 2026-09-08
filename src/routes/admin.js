// Panel de administracion: iniciar sesion y editar todo el contenido del
// sitio sin tocar codigo ni volver a desplegar.

const express = require('express');
const path = require('path');
const store = require('../store');
const { requireAdmin, checkPassword } = require('../auth');
const { subirImagen, procesarImagen, borrarSiEsSubida } = require('../uploads');

const router = express.Router();

// --- Sesion --------------------------------------------------------------

router.post('/login', express.json(), (req, res) => {
  const { password } = req.body || {};
  if (!checkPassword(password)) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  req.session.isAdmin = true;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

router.get('/sesion', (req, res) => {
  res.json({ autenticado: Boolean(req.session && req.session.isAdmin) });
});

// --- Contenido -----------------------------------------------------------

router.get('/datos', requireAdmin, (req, res) => {
  res.json({
    contenido: store.getContenido(),
    colecciones: Object.fromEntries(store.COLECCIONES.map((c) => [c, store.getColeccion(c)])),
    solicitudes: store.getSolicitudes(),
  });
});

router.put('/contenido', requireAdmin, express.json({ limit: '1mb' }), (req, res) => {
  res.json({ ok: true, contenido: store.setContenido(req.body || {}) });
});

router.post('/coleccion/:nombre', requireAdmin, express.json({ limit: '1mb' }), (req, res) => {
  try {
    res.json({ ok: true, item: store.guardarItem(req.params.nombre, req.body || {}) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/coleccion/:nombre/:id', requireAdmin, (req, res) => {
  try {
    const borrado = store.borrarItem(req.params.nombre, req.params.id);
    if (!borrado) return res.status(404).json({ error: 'No se encontró ese elemento.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Solicitudes de cita -------------------------------------------------

router.patch('/solicitudes/:id', requireAdmin, express.json(), (req, res) => {
  const s = store.marcarSolicitud(req.params.id, Boolean((req.body || {}).atendida));
  if (!s) return res.status(404).json({ error: 'No se encontró esa solicitud.' });
  res.json({ ok: true, solicitud: s });
});

router.delete('/solicitudes/:id', requireAdmin, (req, res) => {
  if (!store.borrarSolicitud(req.params.id)) return res.status(404).json({ error: 'No se encontró esa solicitud.' });
  res.json({ ok: true });
});

// --- Imagenes ------------------------------------------------------------

router.post('/subir', requireAdmin, subirImagen.single('archivo'), procesarImagen, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No llegó ningún archivo.' });
  res.json({ ok: true, url: `/uploads/${req.file.filename}` });
});

router.post('/borrar-imagen', requireAdmin, express.json(), (req, res) => {
  borrarSiEsSubida((req.body || {}).url);
  res.json({ ok: true });
});

// --- Panel ---------------------------------------------------------------

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'index.html'));
});

module.exports = router;
