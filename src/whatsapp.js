// Aviso automatico por WhatsApp cuando alguien llena el formulario de agenda.
//
// Es OPCIONAL y viene apagado. Sin configurar, el flujo normal sigue igual: el
// paciente envia el mensaje desde su propio chat y la solicitud queda guardada
// en /admin. Esto es un respaldo para enterarse aunque el paciente nunca
// llegue a pulsar "enviar".
//
// Usa la API oficial de WhatsApp Cloud (Meta). Los mensajes que inicia un
// negocio (como este aviso) tienen que ir con una PLANTILLA aprobada; por eso
// existe WHATSAPP_PLANTILLA. Si no se define, se intenta un mensaje de texto
// normal, que solo entra si el destinatario escribio al numero en las ultimas
// 24 horas. Ver README, seccion "Aviso automatico por WhatsApp".

const TOKEN = process.env.WHATSAPP_TOKEN || '';
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const DESTINOS = (process.env.WHATSAPP_AVISOS || '')
  .split(',')
  .map((s) => s.replace(/\D/g, ''))
  .filter(Boolean);
const PLANTILLA = process.env.WHATSAPP_PLANTILLA || '';
const IDIOMA = process.env.WHATSAPP_IDIOMA || 'es_MX';
const VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

const configurado = Boolean(TOKEN && PHONE_ID && DESTINOS.length);

// Las variables de una plantilla no admiten saltos de linea ni tabuladores.
const enUnaLinea = (valor, max) =>
  String(valor == null ? '' : valor)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max) || '—';

function cuerpoTexto(s) {
  const lineas = [`Nueva solicitud de cita en el sitio de CRENEF.`, ''];
  const agregar = (etiqueta, valor) => {
    if (valor) lineas.push(`• ${etiqueta}: ${valor}`);
  };
  agregar('Nombre', s.nombre);
  agregar('Teléfono', s.telefono);
  agregar('Correo', s.correo);
  agregar('La cita es', s.para_quien);
  agregar('Servicio', s.servicio);
  agregar('Motivo', s.motivo);
  agregar('Desde cuándo', s.desde_cuando);
  agregar('Estudios previos', s.estudios);
  agregar('Horario que le acomoda', s.preferencia);
  return lineas.join('\n');
}

function mensaje(destino, s) {
  if (PLANTILLA) {
    return {
      messaging_product: 'whatsapp',
      to: destino,
      type: 'template',
      template: {
        name: PLANTILLA,
        language: { code: IDIOMA },
        components: [
          {
            type: 'body',
            parameters: [
              enUnaLinea(s.nombre, 60),
              enUnaLinea(s.telefono, 20),
              enUnaLinea(s.servicio || 'Sin definir', 60),
              enUnaLinea(s.motivo, 300),
            ].map((text) => ({ type: 'text', text })),
          },
        ],
      },
    };
  }
  return {
    messaging_product: 'whatsapp',
    to: destino,
    type: 'text',
    text: { preview_url: false, body: cuerpoTexto(s) },
  };
}

async function avisarSolicitud(solicitud) {
  if (!configurado) return { enviado: false, motivo: 'sin configurar' };

  const resultados = await Promise.all(
    DESTINOS.map(async (destino) => {
      try {
        const respuesta = await fetch(`https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(mensaje(destino, solicitud)),
        });
        if (!respuesta.ok) {
          const detalle = await respuesta.text();
          console.error(`[whatsapp] Meta rechazo el aviso a ${destino}: ${respuesta.status} ${detalle.slice(0, 300)}`);
          return false;
        }
        return true;
      } catch (e) {
        console.error(`[whatsapp] No se pudo avisar a ${destino}:`, e.message);
        return false;
      }
    })
  );

  return { enviado: resultados.some(Boolean) };
}

module.exports = { avisarSolicitud, configurado };
