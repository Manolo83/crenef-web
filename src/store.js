// Almacen de contenido del sitio.
//
// Todo el contenido editable (textos, servicios, preguntas frecuentes,
// solicitudes de cita) vive en un solo documento JSON. Ese documento se guarda
// en PostgreSQL cuando existe DATABASE_URL (produccion en Railway) y en un
// archivo dentro de DATA_DIR cuando no existe (desarrollo local, sin instalar
// nada). En ambos casos se mantiene una copia en memoria, asi que las lecturas
// del sitio publico no tocan la base de datos.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA_DIR, UPLOAD_DIR } = require('./config');
const iniciales = require('./datosIniciales');
const migraciones = require('./migraciones');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ARCHIVO = path.join(DATA_DIR, 'crenef.json');
const USA_POSTGRES = Boolean(process.env.DATABASE_URL);

let pool = null;
if (USA_POSTGRES) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

function documentoInicial() {
  return {
    contenido: { ...iniciales.CONTENIDO },
    areas: iniciales.AREAS.map((a) => ({ ...a })),
    servicios: iniciales.SERVICIOS.map((s) => ({ id: crypto.randomUUID(), imagen: '', ...s })),
    valores: iniciales.VALORES.map((v) => ({ id: crypto.randomUUID(), ...v })),
    padecimientos: iniciales.PADECIMIENTOS.map((p) => ({ id: crypto.randomUUID(), ...p })),
    faqs: iniciales.FAQS.map((f) => ({ id: crypto.randomUUID(), ...f })),
    equipo: [],
    testimonios: [],
    avisos: [],
    solicitudes: [],
    // Ids de las correcciones de contenido ya aplicadas (src/migraciones.js).
    migraciones: [],
    actualizado: new Date().toISOString(),
  };
}

let datos = documentoInicial();
let guardadoPendiente = null;

async function init() {
  if (USA_POSTGRES) {
    await pool.query('CREATE TABLE IF NOT EXISTS sitio (id integer PRIMARY KEY, datos jsonb NOT NULL, actualizado timestamptz NOT NULL DEFAULT now())');
    const { rows } = await pool.query('SELECT datos FROM sitio WHERE id = 1');
    if (rows.length) {
      datos = combinar(documentoInicial(), rows[0].datos);
      console.log('[store] Contenido cargado de PostgreSQL.');
      // Las dos se evaluan siempre: con || la segunda no correria cuando la
      // primera devuelve true.
      const cambioAviso = migrarAvisoPrivacidadLevent();
      const cambioContenido = migraciones.aplicar(datos);
      if (cambioAviso || cambioContenido) await guardarAhora();
    } else {
      datos.migraciones = migraciones.MIGRACIONES.map((m) => m.id);
      await pool.query('INSERT INTO sitio (id, datos) VALUES (1, $1)', [JSON.stringify(datos)]);
      console.log('[store] Base vacia: se sembro el contenido inicial de CRENEF.');
    }
    return;
  }

  if (fs.existsSync(ARCHIVO)) {
    try {
      datos = combinar(documentoInicial(), JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')));
      console.log(`[store] Contenido cargado de ${ARCHIVO}.`);
      // Las dos se evaluan siempre: con || la segunda no correria cuando la
      // primera devuelve true.
      const cambioAviso = migrarAvisoPrivacidadLevent();
      const cambioContenido = migraciones.aplicar(datos);
      if (cambioAviso || cambioContenido) await guardarAhora();
    } catch (e) {
      console.error('[store] El archivo de datos esta danado, se usa el contenido inicial:', e.message);
    }
  } else {
    datos.migraciones = migraciones.MIGRACIONES.map((m) => m.id);
    guardarAhora();
    console.log(`[store] Sin DATABASE_URL: el contenido se guarda en ${ARCHIVO}.`);
  }
}

// Actualiza el aviso de privacidad ya guardado para que diga que los datos
// de CONTACTO (nunca los clinicos) pueden compartirse con las demas marcas
// del grupo Levent para marketing. Solo lo toca si el texto sigue igual al
// anterior por defecto (si el admin ya lo edito a mano, se respeta tal
// cual). Corre una sola vez, marcado por datos._migAvisoPrivacidadLevent.
function migrarAvisoPrivacidadLevent() {
  if (datos._migAvisoPrivacidadLevent) return false;
  const textoViejo =
    'CRENEF — Clínica de Rehabilitación Neumofisio, con domicilio en Av. División del Norte 3651, Local 7, Col. San Pablo Tepetlapa, Coyoacán, C.P. 04620, Ciudad de México, es responsable del tratamiento de tus datos personales. Responsable de datos personales: Ángel Carrillo Linares.\n\nQué datos recabamos. Nombre, teléfono, correo electrónico y el motivo de consulta que nos compartes al solicitar una cita. En la clínica, y solo cuando el tratamiento lo requiere, se recaban además datos de salud, que son datos personales sensibles.\n\nPara qué los usamos. Para agendar y confirmar tus citas, darte seguimiento clínico, integrar tu expediente y responder tus dudas. No vendemos ni compartimos tus datos con terceros ajenos a estos fines.\n\nTus derechos ARCO. Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos, así como revocar tu consentimiento, escribiendo a nuestro WhatsApp o al correo de contacto. El aviso de privacidad integral está disponible en recepción.';
  if (datos.contenido.legal_aviso_privacidad === textoViejo) {
    datos.contenido.legal_aviso_privacidad = iniciales.CONTENIDO.legal_aviso_privacidad;
  }
  datos._migAvisoPrivacidadLevent = true;
  return true;
}

// Une lo guardado sobre la estructura inicial, para que al agregar una seccion
// nueva al codigo no se pierda ni quede indefinida en un sitio que ya existia.
function combinar(base, guardado) {
  const salida = { ...base, ...guardado };
  salida.contenido = { ...base.contenido, ...(guardado.contenido || {}) };
  return salida;
}

function guardarAhora() {
  const copia = JSON.stringify({ ...datos, actualizado: new Date().toISOString() });
  if (USA_POSTGRES) {
    return pool
      .query('INSERT INTO sitio (id, datos, actualizado) VALUES (1, $1, now()) ON CONFLICT (id) DO UPDATE SET datos = $1, actualizado = now()', [copia])
      .catch((e) => console.error('[store] No se pudo guardar en PostgreSQL:', e.message));
  }
  try {
    fs.writeFileSync(ARCHIVO, copia);
  } catch (e) {
    console.error('[store] No se pudo escribir el archivo de datos:', e.message);
  }
  return Promise.resolve();
}

// Se agrupa la escritura: varios cambios seguidos desde /admin se guardan una
// sola vez, un segundo despues del ultimo.
function guardar() {
  datos.actualizado = new Date().toISOString();
  if (guardadoPendiente) clearTimeout(guardadoPendiente);
  guardadoPendiente = setTimeout(() => {
    guardadoPendiente = null;
    guardarAhora();
  }, 1000);
}

async function flush() {
  if (guardadoPendiente) {
    clearTimeout(guardadoPendiente);
    guardadoPendiente = null;
  }
  await guardarAhora();
}

// --- Lecturas ------------------------------------------------------------

const getContenido = () => ({ ...datos.contenido });
const getAreas = () => datos.areas.slice();
const getArea = (slug) => datos.areas.find((a) => a.slug === slug) || null;
const getServicios = () => datos.servicios.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
const getServiciosDeArea = (slug) => getServicios().filter((s) => s.area === slug);
const getServicio = (slug) => datos.servicios.find((s) => s.slug === slug) || null;
const getFaqs = () => datos.faqs.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
const getValores = () => datos.valores.slice();
const getPadecimientos = () => datos.padecimientos.slice();
const getEquipo = () => datos.equipo.slice();
const getTestimonios = () => datos.testimonios.filter((t) => t.publicado !== false);
const getAvisos = () => datos.avisos.filter((a) => a.publicado !== false);
const getSolicitudes = () => datos.solicitudes.slice().reverse();
// Fecha de la ultima edicion de contenido. La usa el sitemap como <lastmod>.
const getActualizado = () => datos.actualizado || new Date().toISOString();

// --- Escrituras ----------------------------------------------------------

function setContenido(cambios) {
  Object.entries(cambios || {}).forEach(([clave, valor]) => {
    if (typeof valor === 'string') datos.contenido[clave] = valor;
  });
  guardar();
  return getContenido();
}

// Colecciones editables desde /admin. Todas comparten la misma mecanica:
// lista de objetos con id propio.
const COLECCIONES = ['servicios', 'areas', 'valores', 'padecimientos', 'faqs', 'equipo', 'testimonios', 'avisos'];

function getColeccion(nombre) {
  if (!COLECCIONES.includes(nombre)) throw new Error(`Coleccion desconocida: ${nombre}`);
  return datos[nombre].slice();
}

function guardarItem(nombre, item) {
  if (!COLECCIONES.includes(nombre)) throw new Error(`Coleccion desconocida: ${nombre}`);
  const lista = datos[nombre];
  if (item.id) {
    const i = lista.findIndex((x) => x.id === item.id);
    if (i >= 0) {
      lista[i] = { ...lista[i], ...item };
      guardar();
      return lista[i];
    }
  }
  const nuevo = { ...item, id: item.id || crypto.randomUUID() };
  lista.push(nuevo);
  guardar();
  return nuevo;
}

function borrarItem(nombre, id) {
  if (!COLECCIONES.includes(nombre)) throw new Error(`Coleccion desconocida: ${nombre}`);
  const antes = datos[nombre].length;
  datos[nombre] = datos[nombre].filter((x) => x.id !== id);
  guardar();
  return datos[nombre].length < antes;
}

function agregarSolicitud(solicitud) {
  const nueva = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    atendida: false,
    // Se marca en true cuando el navegador de la persona alcanza a abrir el
    // chat de WhatsApp (ver marcarWhatsapp). Sirve para distinguir en /admin
    // a quien llego al chat de quien lleno el formulario y se fue.
    whatsapp: false,
    whatsappFecha: '',
    ...solicitud,
  };
  datos.solicitudes.push(nueva);
  // Se conservan las ultimas 1000 solicitudes; mas alla no aporta y solo
  // engorda el documento.
  if (datos.solicitudes.length > 1000) datos.solicitudes = datos.solicitudes.slice(-1000);
  guardar();
  return nueva;
}

// La llama el propio sitio justo antes de mandar a la persona al chat.
function marcarWhatsapp(id) {
  const s = datos.solicitudes.find((x) => x.id === id);
  if (!s || s.whatsapp) return s || null;
  s.whatsapp = true;
  s.whatsappFecha = new Date().toISOString();
  guardar();
  return s;
}

function marcarSolicitud(id, atendida) {
  const s = datos.solicitudes.find((x) => x.id === id);
  if (!s) return null;
  s.atendida = Boolean(atendida);
  guardar();
  return s;
}

function borrarSolicitud(id) {
  const antes = datos.solicitudes.length;
  datos.solicitudes = datos.solicitudes.filter((x) => x.id !== id);
  guardar();
  return datos.solicitudes.length < antes;
}

module.exports = {
  init,
  flush,
  getContenido,
  setContenido,
  getAreas,
  getArea,
  getServicios,
  getServiciosDeArea,
  getServicio,
  getFaqs,
  getValores,
  getPadecimientos,
  getEquipo,
  getTestimonios,
  getAvisos,
  getSolicitudes,
  getActualizado,
  getColeccion,
  guardarItem,
  borrarItem,
  agregarSolicitud,
  marcarWhatsapp,
  marcarSolicitud,
  borrarSolicitud,
  COLECCIONES,
};
