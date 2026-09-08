// Bloques de HTML que se generan a partir del contenido guardado (servicios,
// preguntas, valores...) y se inyectan en las paginas con {{{marcador}}}.

const store = require('./store');
const { escapar, precio, urlWhatsApp } = require('./render');

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

function opcionesServicio() {
  return store
    .getServicios()
    .map((s) => `<option value="${escapar(s.nombre)}">${escapar(s.nombre)}</option>`)
    .join('\n');
}

// Preguntas frecuentes en JSON-LD: son las que Google puede mostrar
// desplegadas en los resultados de busqueda.
function faqsEstructuradas() {
  const ficha = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: store.getFaqs().map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(ficha).replace(/</g, '\\u003c')}</script>`;
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
  migas,
};
