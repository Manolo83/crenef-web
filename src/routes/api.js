// API publica. Lo unico que recibe del visitante es el formulario de agenda.
//
// El formulario es el paso previo a WhatsApp: se guarda la solicitud (para que
// quede en /admin aunque la persona nunca mande el mensaje) y se devuelve el
// enlace del chat con todas sus respuestas ya redactadas, para que la clinica
// sepa desde el primer mensaje que necesita.

const express = require('express');
const store = require('../store');
const { urlWhatsApp } = require('../render');
const { avisarSolicitud } = require('../email');

const router = express.Router();

const limpiar = (valor, max) => String(valor == null ? '' : valor).trim().slice(0, max);

// Mensaje con el que se abre el chat. Se arma en el servidor para que salga
// siempre igual y no dependa del navegador.
function mensajeWhatsApp(s) {
  const lineas = [`Hola, soy ${s.nombre}. Quiero agendar una cita en CRENEF.`, ''];
  const agregar = (etiqueta, valor) => {
    if (valor) lineas.push(`• ${etiqueta}: ${valor}`);
  };
  agregar('Servicio', s.servicio || 'No estoy seguro, quiero orientación');
  agregar('La cita es', s.para_quien);
  agregar('Motivo', s.motivo);
  agregar('Desde cuándo', s.desde_cuando);
  agregar('Estudios previos', s.estudios);
  agregar('Horario que me acomoda', s.preferencia);
  agregar('Teléfono', s.telefono);
  agregar('Correo', s.correo);
  return lineas.join('\n');
}

router.post('/solicitudes', (req, res) => {
  const cuerpo = req.body || {};

  // Campo trampa: los robots de spam llenan todo lo que encuentran. Si viene
  // con algo, se responde ok sin guardar nada.
  if (limpiar(cuerpo.website, 100)) return res.json({ ok: true, waUrl: '/' });

  const solicitud = {
    nombre: limpiar(cuerpo.nombre, 120),
    telefono: limpiar(cuerpo.telefono, 40),
    correo: limpiar(cuerpo.correo, 160),
    para_quien: limpiar(cuerpo.para_quien, 80),
    servicio: limpiar(cuerpo.servicio, 160),
    motivo: limpiar(cuerpo.motivo, 1500),
    desde_cuando: limpiar(cuerpo.desde_cuando, 80),
    estudios: limpiar(cuerpo.estudios, 120),
    preferencia: limpiar(cuerpo.preferencia, 80),
    origen: limpiar(cuerpo.origen, 120) || 'formulario de agenda',
  };

  if (!solicitud.nombre || !solicitud.telefono) {
    return res.status(400).json({ error: 'Necesitamos tu nombre y un teléfono para poder contactarte.' });
  }
  if (!solicitud.motivo) {
    return res.status(400).json({ error: 'Cuéntanos brevemente qué te está pasando.' });
  }
  if (solicitud.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(solicitud.correo)) {
    return res.status(400).json({ error: 'El correo electrónico no parece válido.' });
  }

  const guardada = store.agregarSolicitud(solicitud);
  // El aviso por correo es opcional: si falla, la solicitud ya quedo guardada.
  avisarSolicitud(guardada).catch(() => {});

  res.status(201).json({
    ok: true,
    id: guardada.id,
    waUrl: urlWhatsApp(store.getContenido(), mensajeWhatsApp(solicitud)),
  });
});

module.exports = router;
