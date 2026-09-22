// Correcciones que hay que aplicar al contenido YA PUBLICADO.
//
// El sitio en produccion lee de PostgreSQL, no de src/datosIniciales.js: ese
// archivo solo siembra la base la primera vez. Asi que una correccion de texto
// hecha en el codigo no llega sola al sitio que ya esta arriba.
//
// Aqui se registran esas correcciones. Cada una se aplica una sola vez (queda
// anotada en el documento) y SOLO si el texto sigue como estaba mal: si
// alguien ya lo corrigio a mano desde /admin, o escribio otra cosa, no se le
// pisa su edicion.

// Nota: existe ademas migrarAvisoPrivacidadLevent() dentro de src/store.js,
// escrita aparte para el aviso de privacidad del grupo Levent. Las dos se
// ejecutan al arrancar; lo nuevo conviene agregarlo aqui.

const MIGRACIONES = [
  {
    id: '2026-09-22-inhaloterapia-y-correo',
    descripcion:
      'Regla de marca: en comunicacion publica el termino es inhaloterapia, nunca neumologia (la clinica no ofrece consulta de neumologia). Ademas, el correo contacto@crenef.mx no existe.',
    aplicar(datos) {
      const c = datos.contenido;

      reemplazarEn(c, 'hero_texto', 'unimos la neumología y la fisioterapia', 'unimos la inhaloterapia y la fisioterapia');
      reemplazarEn(c, 'nosotros_esencia', 'el rigor clínico de la neumología', 'el rigor clínico de la inhaloterapia');

      if (c.contacto_correo === 'contacto@crenef.mx') c.contacto_correo = 'centrocrenef@gmail.com';

      const inhalo = (datos.areas || []).find((a) => a.slug === 'inhaloterapia');
      if (inhalo && typeof inhalo.descripcion === 'string') {
        inhalo.descripcion = inhalo.descripcion.replace('El área neumológica de la clínica', 'El área de inhaloterapia de la clínica');
      }

      // El tarifario dice $875; si quedo capturado 874, se corrige.
      const valoracion = (datos.servicios || []).find((s) => s.slug === 'valoracion-especializada');
      if (valoracion && Number(valoracion.precio) === 874) valoracion.precio = 875;
    },
  },
];

function reemplazarEn(contenido, clave, viejo, nuevo) {
  if (typeof contenido[clave] === 'string' && contenido[clave].includes(viejo)) {
    contenido[clave] = contenido[clave].replace(viejo, nuevo);
  }
}

// Devuelve true si se aplico al menos una migracion (hay que guardar).
function aplicar(datos) {
  if (!Array.isArray(datos.migraciones)) datos.migraciones = [];
  let hubo = false;

  MIGRACIONES.forEach((m) => {
    if (datos.migraciones.includes(m.id)) return;
    try {
      m.aplicar(datos);
      datos.migraciones.push(m.id);
      hubo = true;
      console.log(`[migraciones] Aplicada: ${m.id}`);
    } catch (e) {
      console.error(`[migraciones] Fallo ${m.id}, se deja el contenido como estaba:`, e.message);
    }
  });

  return hubo;
}

module.exports = { aplicar, MIGRACIONES };
