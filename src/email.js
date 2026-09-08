// Aviso por correo cuando alguien pide una cita desde el sitio.
//
// Es opcional: si no hay RESEND_API_KEY, la solicitud igual se guarda y se ve
// en /admin > Solicitudes. El correo es solo para enterarse sin entrar al
// panel.

const { Resend } = require('resend');
const { SITE_URL } = require('./config');

const API_KEY = process.env.RESEND_API_KEY || '';
const DE = process.env.RESEND_FROM || 'CRENEF <onboarding@resend.dev>';
const PARA = process.env.AVISOS_EMAIL || '';

const cliente = API_KEY ? new Resend(API_KEY) : null;

const escapar = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function avisarSolicitud(solicitud) {
  if (!cliente || !PARA) return { enviado: false, motivo: 'sin configurar' };
  const filas = [
    ['Nombre', solicitud.nombre],
    ['Teléfono', solicitud.telefono],
    ['Correo', solicitud.correo],
    ['La cita es', solicitud.para_quien],
    ['Servicio de interés', solicitud.servicio],
    ['Motivo', solicitud.motivo],
    ['Desde cuándo', solicitud.desde_cuando],
    ['Estudios previos', solicitud.estudios],
    ['Horario que le acomoda', solicitud.preferencia],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5E7385;font-size:13px;">${escapar(k)}</td><td style="padding:6px 0;color:#2B3B4A;font-size:14px;">${escapar(v)}</td></tr>`)
    .join('');

  try {
    await cliente.emails.send({
      from: DE,
      to: PARA.split(',').map((s) => s.trim()).filter(Boolean),
      subject: `Nueva solicitud de cita · ${solicitud.nombre || 'sin nombre'}`,
      html: `<div style="font-family:Verdana,Arial,sans-serif;max-width:520px;">
        <h2 style="color:#16355F;font-size:18px;margin:0 0 4px;">Nueva solicitud de cita</h2>
        <p style="color:#5E7385;font-size:13px;margin:0 0 16px;">Llegó desde el sitio de CRENEF.</p>
        <table style="border-collapse:collapse;">${filas}</table>
        <p style="margin-top:20px;"><a href="${SITE_URL}/admin" style="color:#3FA39F;font-size:13px;">Ver en el panel</a></p>
      </div>`,
    });
    return { enviado: true };
  } catch (e) {
    console.error('[email] No se pudo enviar el aviso de solicitud:', e.message);
    return { enviado: false, motivo: e.message };
  }
}

module.exports = { avisarSolicitud, configurado: Boolean(cliente && PARA) };
