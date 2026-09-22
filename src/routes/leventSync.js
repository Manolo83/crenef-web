// Exporta los contactos de CRENEF para la base de datos general de Levent
// (la matriz), que junta contactos de todas las marcas del grupo para
// campanas de mercadotecnia compartidas. Protegido por su propio token
// (LEVENT_SYNC_KEY).
//
// Solo se manda lo que ya autoriza el aviso de privacidad: nombre,
// telefono, correo y el servicio de interes (no es un dato sensible, es
// simplemente que area buscaban). NUNCA se manda el motivo de consulta, el
// "para_quien", "desde_cuando" ni "estudios" — esos son datos de salud y el
// aviso de privacidad dice explicitamente que se quedan solo dentro de
// CRENEF.

const express = require('express');
const store = require('../store');

const router = express.Router();

function requiereClaveSync(req, res, next) {
  const clave = req.headers['x-levent-sync-key'];
  if (!process.env.LEVENT_SYNC_KEY) {
    return res.status(503).json({ error: 'La sincronizacion con Levent no esta configurada en este servidor.' });
  }
  if (clave !== process.env.LEVENT_SYNC_KEY) {
    return res.status(401).json({ error: 'No autorizado.' });
  }
  next();
}

router.get('/contactos', requiereClaveSync, (req, res) => {
  const solicitudes = store.getSolicitudes().filter((s) => s.nombre && s.telefono);
  const contactos = solicitudes.map((s) => ({
    email: s.correo || '',
    telefono: s.telefono,
    nombre: s.nombre,
    categoriasInteres: s.servicio ? [s.servicio] : [],
  }));
  res.json({ marca: 'crenef', contactos });
});

module.exports = router;
