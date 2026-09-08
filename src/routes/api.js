// API publica. Lo unico que recibe del visitante es la solicitud de cita del
// formulario de /contacto.

const express = require('express');
const store = require('../store');
const { avisarSolicitud } = require('../email');

const router = express.Router();

const limpiar = (valor, max) => String(valor == null ? '' : valor).trim().slice(0, max);

router.post('/solicitudes', async (req, res) => {
  const cuerpo = req.body || {};

  // Campo trampa: los robots de spam llenan todo lo que encuentran. Si viene
  // con algo, se responde ok sin guardar nada.
  if (limpiar(cuerpo.website, 100)) return res.json({ ok: true });

  const solicitud = {
    nombre: limpiar(cuerpo.nombre, 120),
    telefono: limpiar(cuerpo.telefono, 40),
    correo: limpiar(cuerpo.correo, 160),
    servicio: limpiar(cuerpo.servicio, 160),
    mensaje: limpiar(cuerpo.mensaje, 1500),
    origen: limpiar(cuerpo.origen, 120) || 'formulario web',
  };

  if (!solicitud.nombre || !solicitud.telefono) {
    return res.status(400).json({ error: 'Necesitamos tu nombre y un teléfono para poder contactarte.' });
  }
  if (solicitud.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(solicitud.correo)) {
    return res.status(400).json({ error: 'El correo electrónico no parece válido.' });
  }

  const guardada = store.agregarSolicitud(solicitud);
  // El aviso por correo es opcional: si falla, la solicitud ya quedo guardada
  // y se ve en /admin.
  avisarSolicitud(guardada).catch(() => {});

  res.status(201).json({ ok: true, id: guardada.id });
});

module.exports = router;
