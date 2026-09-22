// Bloques de HTML que se generan a partir del contenido guardado (servicios,
// preguntas, valores...) y se inyectan en las paginas con {{{marcador}}}.

const store = require('./store');
const { escapar, precio, urlWhatsApp, etiquetaJsonLd } = require('./render');

const { icono } = require('./iconos');

const CLASE_ICONO_AREA = { inhaloterapia: 'icono-azul', fisioterapia: 'icono-teal', 'cuidado-personal': 'icono-teal' };

// Tarjeta de area con sus servicios y precios, para la portada.
function tarjetasAreas() {
  return store
    .getAreas()
    .map((area) => {
      const servicios = store.getServiciosDeArea(area.slug);
      const filas = servicios
        .map(
          (s) =>
            `<li><a href="/servicios/${escapar(s.slug)}">${escapar(s.nombre)}</a><span class="precio">${precio(s.precio)}</span></li>`
        )
        .join('\n');
      return `<article class="tarjeta tarjeta-area">
  ${icono(area.slug, CLASE_ICONO_AREA[area.slug] || '')}
  <h3>${escapar(area.titulo)}</h3>
  <p>${escapar(area.resumen)}</p>
  <ul>${filas}</ul>
  <div class="pie-tarjeta"><a class="boton boton-linea" href="/servicios#${escapar(area.slug)}">Ver el detalle</a></div>
</article>`;
    })
    .join('\n');
}

// Tabla de precios por area, para la pagina de servicios.
function bloquesServicios() {
  return store
    .getAreas()
    .map((area) => {
      const filas = store
        .getServiciosDeArea(area.slug)
        .map(
          (s) => `<tr>
    <td>
      <span class="nombre"><a href="/servicios/${escapar(s.slug)}">${escapar(s.nombre)}</a></span>
      ${s.nota ? `<span class="nota">${escapar(s.nota)}</span>` : `<span class="nota">${escapar(s.resumen || '')}</span>`}
    </td>
    <td><span class="monto">${precio(s.precio)}</span></td>
  </tr>`
        )
        .join('\n');
      return `<section class="bloque-area" id="${escapar(area.slug)}">
  <div class="bloque-area-cabeza">
    ${icono(area.slug, CLASE_ICONO_AREA[area.slug] || '')}
    <div>
      <h2>${escapar(area.titulo)}</h2>
      <p>${escapar(area.descripcion)}</p>
    </div>
  </div>
  <table class="tabla-precios"><tbody>${filas}</tbody></table>
</section>`;
    })
    .join('\n');
}

function tarjetasPadecimientos() {
  return store
    .getPadecimientos()
    .map(
      (p) => `<article class="tarjeta">
  <h3>${escapar(p.titulo)}</h3>
  <p>${escapar(p.texto)}</p>
</article>`
    )
    .join('\n');
}

function tarjetasValores() {
  return store
    .getValores()
    .map(
      (v) => `<article class="tarjeta">
  <h3>${escapar(v.titulo)}</h3>
  <p>${escapar(v.texto)}</p>
</article>`
    )
    .join('\n');
}

function acordeonFaqs(limite) {
  const lista = limite ? store.getFaqs().slice(0, limite) : store.getFaqs();
  return lista
    .map(
      (f) => `<details>
  <summary>${escapar(f.pregunta)}</summary>
  <div class="respuesta">${escapar(f.respuesta).replace(/\n/g, '<br>')}</div>
</details>`
    )
    .join('\n');
}

function pasosProceso(contenido) {
  return [1, 2, 3, 4]
    .map(
      (n) => `<article class="tarjeta paso">
  <span class="numero">Paso ${n}</span>
  <h3>${escapar(contenido[`proceso_${n}_titulo`])}</h3>
  <p>${escapar(contenido[`proceso_${n}_texto`])}</p>
</article>`
    )
    .join('\n');
}

function itemsConfianza(contenido) {
  return [1, 2, 3, 4]
    .map(
      (n) => `<div class="confianza-item">
  <h3>${escapar(contenido[`confianza_${n}_titulo`])}</h3>
  <p>${escapar(contenido[`confianza_${n}_texto`])}</p>
</div>`
    )
    .join('\n');
}

function enlacesPieServicios() {
  return store
    .getAreas()
    .map((a) => `<li><a href="/servicios#${escapar(a.slug)}">${escapar(a.nombre)}</a></li>`)
    .join('\n');
}

function opcionesServicio(slugElegido) {
  return store
    .getServicios()
    .map((s) => `<option value="${escapar(s.nombre)}"${s.slug === slugElegido ? ' selected' : ''}>${escapar(s.nombre)}</option>`)
    .join('\n');
}

// Preguntas frecuentes en JSON-LD (FAQPage). Se genera desde el MISMO arreglo
// que pinta el acordeon, asi que la respuesta marcada y la que lee el visitante
// nunca pueden diferir: si difirieran, Google descarta el marcado.
//
// Va UNICAMENTE en /preguntas-frecuentes. Ponerlo en otras paginas (por
// ejemplo en la portada, que muestra solo cinco) incumple las guias de Google.
function faqsEstructuradas() {
  return etiquetaJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: store.getFaqs().map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  });
}


const OPCIONES = {
  para_quien: ['Para mí', 'Para un familiar o alguien a mi cargo'],
  desde_cuando: ['Menos de una semana', 'Entre una semana y un mes', 'Entre uno y seis meses', 'Más de seis meses', 'Es una revisión o control'],
  estudios: ['No tengo estudios ni diagnóstico', 'Sí, tengo estudios o diagnóstico previos', 'Un médico me canalizó', 'No estoy seguro'],
  preferencia: ['Entre semana por la mañana', 'Entre semana por la tarde', 'Fin de semana', 'Cualquier horario me funciona'],
};

const selector = (nombre, etiqueta, opciones, vacio) => {
  const items = [vacio ? `<option value="">${escapar(vacio)}</option>` : '']
    .concat(opciones.map((o) => `<option value="${escapar(o)}">${escapar(o)}</option>`))
    .join('');
  return `<div class="campo"><label for="${nombre}">${escapar(etiqueta)}</label><select id="${nombre}" name="${nombre}">${items}</select></div>`;
};

function formularioAgenda(slugElegido) {
  return `<form class="formulario" id="form-cita" novalidate>
  <div class="campo-doble">
    <div class="campo">
      <label for="nombre">Nombre completo *</label>
      <input type="text" id="nombre" name="nombre" autocomplete="name" required>
    </div>
    <div class="campo">
      <label for="telefono">Teléfono o WhatsApp *</label>
      <input type="tel" id="telefono" name="telefono" autocomplete="tel" inputmode="tel" required>
    </div>
  </div>

  <div class="campo-doble">
    <div class="campo">
      <label for="correo">Correo electrónico</label>
      <input type="email" id="correo" name="correo" autocomplete="email">
    </div>
    ${selector('para_quien', '¿Para quién es la cita?', OPCIONES.para_quien)}
  </div>

  <div class="campo">
    <label for="servicio">¿Qué servicio necesitas?</label>
    <select id="servicio" name="servicio">
      <option value=""${slugElegido ? '' : ' selected'}>No estoy seguro, quiero orientación</option>
      ${opcionesServicio(slugElegido)}
    </select>
    <span class="ayuda">Si no sabes cuál, déjalo en «no estoy seguro»: el especialista lo define en la valoración.</span>
  </div>

  <div class="campo">
    <label for="motivo">¿Qué te está pasando? *</label>
    <textarea id="motivo" name="motivo" placeholder="Por ejemplo: me falta el aire al subir escaleras y me canso más rápido que antes." required></textarea>
    <span class="ayuda">Con dos o tres renglones basta. Lo demás lo revisamos en consulta.</span>
  </div>

  <div class="campo-doble">
    ${selector('desde_cuando', '¿Desde cuándo?', OPCIONES.desde_cuando, 'Selecciona una opción')}
    ${selector('estudios', '¿Tienes estudios o diagnóstico previos?', OPCIONES.estudios, 'Selecciona una opción')}
  </div>

  ${selector('preferencia', '¿Cuándo te queda mejor venir?', OPCIONES.preferencia, 'Selecciona una opción')}

  <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">

  <label class="consentimiento">
    <input type="checkbox" name="consentimiento" required>
    <span>Acepto que CRENEF use mis datos para contactarme y agendar mi cita, conforme al <a href="/aviso-de-privacidad">aviso de privacidad</a>. *</span>
  </label>

  <div class="mensaje-form" id="mensaje-form" role="status" aria-live="polite"></div>

  <button class="boton boton-primario" type="submit">Enviar y abrir WhatsApp</button>
  <p class="ayuda" style="margin:0">Al enviar se abre el chat de la clínica con tus respuestas ya escritas. No tienes que repetir nada.</p>
</form>`;
}

function migas(items) {
  const partes = items.map((i, idx) =>
    idx === items.length - 1 ? `<span aria-current="page">${escapar(i.texto)}</span>` : `<a href="${i.ruta}">${escapar(i.texto)}</a>`
  );
  return `<nav class="migas contenedor" aria-label="Ruta de navegación">${partes.join('<span>›</span>')}</nav>`;
}

module.exports = {
  icono,
  tarjetasAreas,
  bloquesServicios,
  tarjetasPadecimientos,
  tarjetasValores,
  acordeonFaqs,
  pasosProceso,
  itemsConfianza,
  enlacesPieServicios,
  opcionesServicio,
  faqsEstructuradas,
  formularioAgenda,
  migas,
};
