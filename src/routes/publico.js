// Paginas publicas del sitio. Cada una tiene su propia ruta con "/" propio,
// se arma en el servidor (HTML completo desde la primera respuesta) y todos
// los botones de agendar apuntan al WhatsApp de la clinica.

const express = require('express');
const store = require('../store');
const bloques = require('../bloques');
const { render, escapar, parrafos, precio, urlWhatsApp } = require('../render');

const router = express.Router();

const enviar = (res, html) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};

// --- Portada -------------------------------------------------------------
router.get('/', (req, res) => {
  const contenido = store.getContenido();
  enviar(
    res,
    render('inicio', {
      meta: {
        titulo: 'CRENEF · Rehabilitación pulmonar y fisioterapia en Coyoacán, CDMX',
        descripcion:
          'Clínica especializada en rehabilitación pulmonar y fisioterapia respiratoria. Valoración, espirometría, terapia física y cuidado personal en Coyoacán, CDMX. Agenda por WhatsApp.',
        ruta: '/',
      },
      bloques: {
        confianza: bloques.itemsConfianza(contenido),
        areas: bloques.tarjetasAreas(),
        pasos: bloques.pasosProceso(contenido),
        padecimientos: bloques.tarjetasPadecimientos(),
        faqs: bloques.acordeonFaqs(5),
      },
    })
  );
});

// --- Servicios -----------------------------------------------------------
router.get('/servicios', (req, res) => {
  enviar(
    res,
    render('servicios', {
      meta: {
        titulo: 'Servicios y precios · CRENEF',
        descripcion:
          'Tarifario de CRENEF: valoración especializada, rehabilitación pulmonar, espirometría, micronebulizaciones, terapia física, descarga muscular y cuidado personal.',
        ruta: '/servicios',
      },
      bloques: { areas: bloques.bloquesServicios() },
    })
  );
});

// --- Pagina propia por servicio -----------------------------------------
router.get('/servicios/:slug', (req, res, next) => {
  const servicio = store.getServicio(req.params.slug);
  if (!servicio) return next();

  const area = store.getArea(servicio.area) || { nombre: 'Servicios', slug: '' };
  const relacionados = store
    .getServiciosDeArea(servicio.area)
    .filter((s) => s.slug !== servicio.slug)
    .map(
      (s) => `<tr>
    <td><span class="nombre"><a href="/servicios/${escapar(s.slug)}">${escapar(s.nombre)}</a></span><span class="nota">${escapar(s.resumen || '')}</span></td>
    <td><span class="monto">${precio(s.precio)}</span></td>
  </tr>`
    )
    .join('\n');

  const bullets = (servicio.bullets || []).length
    ? `<ul class="lista-check" style="margin-top:22px">${servicio.bullets.map((b) => `<li>${escapar(b)}</li>`).join('')}</ul>`
    : '';

  enviar(
    res,
    render('servicio', {
      meta: {
        titulo: `${servicio.nombre} · CRENEF`,
        descripcion: `${servicio.resumen || servicio.nombre} ${precio(servicio.precio)} MXN. CRENEF, clínica de rehabilitación pulmonar y fisioterapia en Coyoacán, CDMX.`.slice(0, 300),
        ruta: `/servicios/${servicio.slug}`,
      },
      bloques: {
        migas: bloques.migas([
          { ruta: '/', texto: 'Inicio' },
          { ruta: '/servicios', texto: 'Servicios' },
          { ruta: `/servicios/${servicio.slug}`, texto: servicio.nombre },
        ]),
        area_nombre: escapar(area.nombre),
        servicio_nombre: escapar(servicio.nombre),
        servicio_resumen: escapar(servicio.resumen || ''),
        servicio_precio: precio(servicio.precio),
        servicio_nota: servicio.nota ? `<span style="color:var(--texto-suave);font-size:.92rem;margin-left:10px">${escapar(servicio.nota)}</span>` : '',
        servicio_descripcion: parrafos(servicio.descripcion),
        servicio_bullets: bullets,
        relacionados,
        ruta_agenda: `/agenda?servicio=${encodeURIComponent(servicio.slug)}`,
      },
    })
  );
});

// --- La clinica ----------------------------------------------------------
router.get('/nosotros', (req, res) => {
  enviar(
    res,
    render('nosotros', {
      meta: {
        titulo: 'Sobre CRENEF · Clínica de Rehabilitación Neumofisio',
        descripcion:
          'CRENEF une neumología y fisioterapia en un solo propósito: devolverte la capacidad de respirar, moverte y vivir plenamente. Conoce cómo trabajamos.',
        ruta: '/nosotros',
      },
      bloques: {
        valores: bloques.tarjetasValores(),
        padecimientos: bloques.tarjetasPadecimientos(),
      },
    })
  );
});

// --- Preguntas frecuentes ------------------------------------------------
router.get('/preguntas-frecuentes', (req, res) => {
  enviar(
    res,
    render('preguntas-frecuentes', {
      meta: {
        titulo: 'Preguntas frecuentes · CRENEF',
        descripcion:
          '¿Necesito cita? ¿Cuánto cuesta la valoración? ¿La espirometría duele? Respuestas a las dudas más comunes sobre la atención en CRENEF.',
        ruta: '/preguntas-frecuentes',
      },
      // El FAQPage se suma al MedicalClinic de la plantilla, no lo sustituye,
      // y solo en esta pagina.
      jsonLd: [bloques.faqsEstructuradas()],
      bloques: { faqs: bloques.acordeonFaqs() },
    })
  );
});

// --- Ubicacion -----------------------------------------------------------
router.get('/ubicacion', (req, res) => {
  enviar(
    res,
    render('ubicacion', {
      meta: {
        titulo: 'Ubicación y horarios · CRENEF, Coyoacán CDMX',
        descripcion:
          'Av. División del Norte 3651, Local 7, Col. San Pablo Tepetlapa, Coyoacán, CDMX. Atendemos de martes a domingo de 9:00 a 21:00 h.',
        ruta: '/ubicacion',
      },
    })
  );
});

// --- Contacto ------------------------------------------------------------
router.get('/contacto', (req, res) => {
  enviar(
    res,
    render('contacto', {
      meta: {
        titulo: 'Contacto y citas · CRENEF',
        descripcion: 'Agenda tu valoración en CRENEF por WhatsApp o déjanos tus datos y te contactamos.',
        ruta: '/contacto',
      },
      bloques: { formulario: bloques.formularioAgenda() },
    })
  );
});

router.get('/gracias', (req, res) => {
  enviar(res, render('gracias', { meta: { titulo: 'Solicitud recibida · CRENEF', ruta: '/gracias', noindex: true } }));
});

// --- Legal ---------------------------------------------------------------
router.get('/aviso-de-privacidad', (req, res) => {
  const contenido = store.getContenido();
  enviar(
    res,
    render('aviso-de-privacidad', {
      meta: {
        titulo: 'Aviso de privacidad · CRENEF',
        descripcion: 'Cómo trata CRENEF los datos personales de sus pacientes y de quienes solicitan una cita.',
        ruta: '/aviso-de-privacidad',
      },
      bloques: { aviso: parrafos(contenido.legal_aviso_privacidad) },
    })
  );
});

// --- Agenda --------------------------------------------------------------
// Paso previo obligatorio antes de WhatsApp: el visitante contesta unas
// preguntas, la solicitud queda guardada y el chat se abre con sus respuestas
// ya escritas. Todos los botones de agendar del sitio llegan aqui.
// Con ?servicio=<slug> el formulario llega con ese servicio ya elegido.
router.get(['/agenda', '/cita'], (req, res) => {
  const elegido = store.getServicio(String(req.query.servicio || '')) ? String(req.query.servicio) : '';
  enviar(
    res,
    render('agenda', {
      meta: {
        titulo: 'Agenda tu cita · CRENEF',
        descripcion:
          'Cuéntanos qué necesitas y agendamos tu valoración en CRENEF. Al enviar el formulario se abre WhatsApp con tus respuestas ya escritas.',
        ruta: '/agenda',
      },
      bloques: { formulario: bloques.formularioAgenda(elegido) },
    })
  );
});

// Atajo directo al chat, sin formulario. No se enlaza desde el sitio: existe
// para usos internos (tarjetas impresas, firma de correo, codigos QR del
// consultorio) donde el paciente ya esta en contacto con la clinica.
router.get('/whatsapp', (req, res) => {
  res.redirect(302, urlWhatsApp(store.getContenido()));
});

module.exports = router;
