// Contenido inicial del sitio de CRENEF.
//
// Todo lo que hay aqui se carga la PRIMERA vez que arranca el servidor con la
// base vacia. A partir de ese momento, el contenido vive en la base de datos y
// se edita desde /admin: cambiar algo aqui ya no afecta a un sitio que ya
// arranco alguna vez.
//
// Fuentes: Manual de Identidad Grafica v1.0 (julio 2026) y Tarifario de
// Servicios 2026 (vigencia 15 de agosto - 31 de diciembre de 2026).

const CONTENIDO = {
  // --- Marca -------------------------------------------------------------
  marca_nombre: 'CRENEF',
  marca_descriptor: 'Clínica de Rehabilitación Neumofisio',
  marca_lema: 'Recuperar el aliento',

  // --- Portada (hero) ----------------------------------------------------
  hero_kicker: 'Rehabilitación pulmonar y fisioterapia · Coyoacán, CDMX',
  hero_titulo: 'Vuelve a respirar con libertad',
  hero_texto:
    'En CRENEF unimos la neumología y la fisioterapia en un solo lugar para devolverte la capacidad de respirar, moverte y vivir plenamente. Te acompañamos en tu recuperación, paso a paso.',
  hero_cta_principal: 'Agenda tu valoración',
  hero_cta_secundario: 'Ver servicios y precios',

  // --- Barra de confianza ------------------------------------------------
  confianza_1_titulo: 'Atención especializada',
  confianza_1_texto: 'Valoración y plan de tratamiento definidos por el profesional responsable.',
  confianza_2_titulo: 'Dos disciplinas, un solo lugar',
  confianza_2_texto: 'Inhaloterapia y fisioterapia coordinadas en la misma clínica.',
  confianza_3_titulo: 'Martes a domingo',
  confianza_3_texto: 'Horario amplio, de 9:00 a 21:00 h, para que la constancia no dependa de tu agenda.',
  confianza_4_titulo: 'Precios claros',
  confianza_4_texto: 'Tarifario publicado, sin sorpresas al momento de pagar.',

  // --- Introducción a servicios -----------------------------------------
  servicios_kicker: 'Nuestros servicios',
  servicios_titulo: 'Tres áreas de atención',
  servicios_texto:
    'Cada tratamiento comienza con una valoración. A partir de ella, el especialista define qué necesitas y cuántas sesiones requiere tu recuperación.',

  // --- Cómo trabajamos ---------------------------------------------------
  proceso_kicker: 'Cómo trabajamos',
  proceso_titulo: 'Tu recuperación, paso a paso',
  proceso_texto:
    'Un camino claro desde la primera llamada hasta el alta. Sin prisas y sin tecnicismos innecesarios.',
  proceso_1_titulo: 'Agendas por WhatsApp',
  proceso_1_texto: 'Nos escribes, revisamos disponibilidad y apartamos tu lugar. Sin filas ni conmutadores.',
  proceso_2_titulo: 'Valoración inicial',
  proceso_2_texto: 'El especialista evalúa tu caso, resuelve tus dudas y determina si necesitas estudios.',
  proceso_3_titulo: 'Plan de tratamiento',
  proceso_3_texto: 'Recibes un plan con objetivos concretos y el número de sesiones que requiere tu tratamiento.',
  proceso_4_titulo: 'Seguimiento',
  proceso_4_texto: 'Medimos tu avance sesión a sesión y ajustamos el plan según cómo respondas.',

  // --- Padecimientos -----------------------------------------------------
  padecimientos_kicker: 'A quién acompañamos',
  padecimientos_titulo: 'Si respirar o moverte te cuesta trabajo, aquí empezamos',
  padecimientos_texto:
    'Atendemos a personas que viven con padecimientos respiratorios crónicos, a quienes se recuperan de una enfermedad o una lesión, y a quienes buscan mantenerse en forma con acompañamiento profesional.',

  // --- Sobre la clínica --------------------------------------------------
  nosotros_kicker: 'Sobre CRENEF',
  nosotros_titulo: 'Ciencia y acompañamiento',
  nosotros_texto:
    'CRENEF — Clínica de Rehabilitación Neumofisio es un centro especializado en rehabilitación pulmonar y fisioterapia respiratoria. Unimos dos disciplinas en un solo propósito: devolver a cada paciente la capacidad de respirar, moverse y vivir plenamente.',
  nosotros_esencia:
    'Nuestra identidad nace de una dualidad que se refleja en todo lo que hacemos: el rigor clínico de la neumología y la calidez humana de la fisioterapia. Precisión y cuidado, evidencia y acompañamiento.',

  // --- Llamado final -----------------------------------------------------
  cta_titulo: '¿Empezamos?',
  cta_texto:
    'Escríbenos por WhatsApp y agendamos tu valoración. Te respondemos en horario de clínica, de martes a domingo.',
  cta_boton: 'Escribir por WhatsApp',

  // --- Contacto ----------------------------------------------------------
  contacto_whatsapp: '5527703927',
  contacto_whatsapp_visible: '55 2770 3927',
  contacto_whatsapp_mensaje: 'Hola, me gustaría agendar una valoración en CRENEF.',
  contacto_telefono: '',
  contacto_correo: 'contacto@crenef.mx',
  contacto_direccion_1: 'Av. División del Norte 3651, Local 7',
  contacto_direccion_2: 'Col. San Pablo Tepetlapa, Coyoacán · C.P. 04620, CDMX',
  contacto_horario: 'Martes a domingo · 9:00 – 21:00 h',
  contacto_maps_url: 'https://www.google.com/maps/search/?api=1&query=Av.+Divisi%C3%B3n+del+Norte+3651+Local+7+San+Pablo+Tepetlapa+Coyoac%C3%A1n+CDMX',
  contacto_maps_embed:
    'https://www.google.com/maps?q=Av.%20Divisi%C3%B3n%20del%20Norte%203651%2C%20San%20Pablo%20Tepetlapa%2C%20Coyoac%C3%A1n%2C%20CDMX&output=embed',
  contacto_instagram: '',
  contacto_facebook: '',

  // --- Tarifario ---------------------------------------------------------
  tarifario_vigencia: 'Vigencia: 15 de agosto — 31 de diciembre de 2026',
  tarifario_nota:
    'Precios en pesos mexicanos (MXN), IVA incluido cuando aplique. Precios sujetos a cambio al término de la vigencia. Todos los tratamientos se realizan previa valoración y bajo indicación del profesional responsable; tu plan de sesiones se define con base en criterios clínicos.',

  // --- Legales -----------------------------------------------------------
  legal_responsable_sanitario: '',
  legal_cedula_responsable: '',
  legal_responsable_datos: 'Ángel Carrillo Linares',
  legal_aviso_privacidad:
    'CRENEF — Clínica de Rehabilitación Neumofisio, con domicilio en Av. División del Norte 3651, Local 7, Col. San Pablo Tepetlapa, Coyoacán, C.P. 04620, Ciudad de México, es responsable del tratamiento de tus datos personales. Responsable de datos personales: Ángel Carrillo Linares.\n\nQué datos recabamos. Nombre, teléfono, correo electrónico y el motivo de consulta que nos compartes al solicitar una cita. En la clínica, y solo cuando el tratamiento lo requiere, se recaban además datos de salud, que son datos personales sensibles.\n\nPara qué los usamos. Para agendar y confirmar tus citas, darte seguimiento clínico, integrar tu expediente y responder tus dudas. No vendemos ni compartimos tus datos con terceros ajenos a estos fines.\n\nTus derechos ARCO. Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos, así como revocar tu consentimiento, escribiendo a nuestro WhatsApp o al correo de contacto. El aviso de privacidad integral está disponible en recepción.',
  legal_aviso_medico:
    'La información de este sitio es de carácter informativo y no sustituye una consulta médica ni un diagnóstico. Todos los tratamientos se realizan previa valoración y bajo indicación del profesional responsable. Ante una urgencia respiratoria, acude al servicio de urgencias más cercano o llama al 911.',

  // --- Pie de página -----------------------------------------------------
  pie_texto:
    'Clínica especializada en rehabilitación pulmonar y fisioterapia respiratoria. Coyoacán, Ciudad de México.',
};

const VALORES = [
  { titulo: 'Profesionalismo clínico', texto: 'Cada decisión se toma desde la evidencia y con criterio profesional.' },
  { titulo: 'Calidez humana', texto: 'Hablamos claro, sin tecnicismos innecesarios y sin alarmismos.' },
  { titulo: 'Acompañamiento', texto: 'No damos indicaciones y te soltamos: caminamos contigo todo el tratamiento.' },
  { titulo: 'Recuperación integral', texto: 'Respiración y movimiento se trabajan juntos, no por separado.' },
  { titulo: 'Confianza', texto: 'Precios publicados, planes explicados y expectativas realistas.' },
  { titulo: 'Movimiento', texto: 'La recuperación avanza cuando el cuerpo vuelve a moverse.' },
];

const AREAS = [
  {
    slug: 'inhaloterapia',
    nombre: 'Inhaloterapia',
    titulo: 'Inhaloterapia y rehabilitación pulmonar',
    resumen: 'Valoración, estudios y sesiones para mejorar tu capacidad respiratoria.',
    descripcion:
      'El área neumológica de la clínica: valoración especializada, espirometría con interpretación, sesiones de rehabilitación pulmonar y micronebulizaciones. Aquí se evalúa cómo estás respirando y se define el plan para que respires mejor.',
    color: 'azul',
  },
  {
    slug: 'fisioterapia',
    nombre: 'Fisioterapia',
    titulo: 'Fisioterapia y rehabilitación física',
    resumen: 'Terapia individualizada para recuperar movilidad y liberar tensión muscular.',
    descripcion:
      'Rehabilitación de lesiones, contracturas y limitaciones de movimiento, con sesiones diseñadas para tu caso. El movimiento es el eje del tratamiento: recuperar rango, fuerza y control.',
    color: 'teal',
  },
  {
    slug: 'cuidado-personal',
    nombre: 'Cuidado personal',
    titulo: 'Cuidado personal · Estética no invasiva',
    resumen: 'Tratamientos faciales no invasivos con respaldo clínico.',
    descripcion:
      'Servicios de cuidado facial no invasivo: sin extracciones, peelings químicos, inyectables ni aparatología. Un complemento de bienestar dentro del mismo entorno clínico.',
    color: 'teal-claro',
  },
];

// Solo servicios individuales del Tarifario 2026 publico. Los bloques de
// sesiones prepagadas NO se publican en el sitio (ver README, seccion
// "Precios y paquetes"): se ofrecen en persona, despues de la valoracion.
const SERVICIOS = [
  {
    slug: 'valoracion-especializada',
    area: 'inhaloterapia',
    nombre: 'Valoración / consulta especializada',
    precio: 875,
    resumen: 'La primera cita: evaluamos tu caso y definimos el plan de tratamiento.',
    descripcion:
      'Es el punto de partida de cualquier tratamiento en CRENEF. El especialista revisa tus antecedentes, escucha lo que te está pasando, te explora y determina qué necesitas: estudios, sesiones de rehabilitación, tratamiento o seguimiento. Sales de la consulta sabiendo cuál es el plan y por qué.',
    bullets: [
      'Revisión de antecedentes y motivo de consulta',
      'Exploración clínica respiratoria',
      'Indicación de estudios si el caso lo requiere',
      'Plan de tratamiento explicado con claridad',
    ],
    destacado: true,
    orden: 1,
  },
  {
    slug: 'consulta-de-seguimiento',
    area: 'inhaloterapia',
    nombre: 'Consulta de seguimiento',
    precio: 775,
    resumen: 'Revisión de avances y ajuste del tratamiento.',
    descripcion:
      'Para pacientes que ya iniciaron tratamiento en la clínica. Se revisa cómo has respondido, se comparan resultados y se ajusta el plan según tu evolución.',
    bullets: ['Comparación con la valoración inicial', 'Ajuste de indicaciones', 'Resolución de dudas del tratamiento'],
    destacado: false,
    orden: 2,
  },
  {
    slug: 'rehabilitacion-pulmonar',
    area: 'inhaloterapia',
    nombre: 'Sesión de rehabilitación pulmonar',
    precio: 875,
    resumen: 'Entrenamiento respiratorio guiado para recuperar capacidad funcional.',
    descripcion:
      'Sesión dirigida por un profesional para entrenar tu respiración y tu tolerancia al esfuerzo: técnicas de respiración, ejercicio adaptado a tu condición y trabajo de la musculatura implicada. Es un tratamiento de continuidad: la mejoría se construye sesión a sesión.',
    bullets: [
      'Técnicas de respiración y control del esfuerzo',
      'Ejercicio adaptado a tu capacidad actual',
      'Trabajo de musculatura respiratoria',
      'Registro de tu avance en cada sesión',
    ],
    destacado: true,
    orden: 3,
  },
  {
    slug: 'espirometria',
    area: 'inhaloterapia',
    nombre: 'Espirometría',
    precio: 875,
    nota: 'Estudio con interpretación por especialista',
    resumen: 'El estudio que mide cuánto aire movilizan tus pulmones.',
    descripcion:
      'Prueba de función respiratoria: soplas en un equipo que mide cuánto aire puedes inhalar y exhalar, y a qué velocidad. Es rápida, no duele y da información objetiva sobre cómo están funcionando tus pulmones. El precio incluye la interpretación del especialista.',
    bullets: ['Estudio no invasivo', 'Interpretación por especialista incluida', 'Base para definir o ajustar tu tratamiento'],
    destacado: true,
    orden: 4,
  },
  {
    slug: 'micronebulizacion-con-medicamento',
    area: 'inhaloterapia',
    nombre: 'Micronebulización con medicamento',
    precio: 325,
    resumen: 'Atención ambulatoria para llevar el medicamento directo a la vía respiratoria.',
    descripcion:
      'Aplicación de medicamento en forma de aerosol mediante nebulizador, bajo indicación del profesional responsable. Se realiza en clínica, con acompañamiento durante toda la sesión.',
    bullets: ['Bajo indicación del profesional responsable', 'Acompañamiento durante la sesión'],
    destacado: false,
    orden: 5,
  },
  {
    slug: 'micronebulizacion-con-solucion-fisiologica',
    area: 'inhaloterapia',
    nombre: 'Micronebulización con solución fisiológica',
    precio: 225,
    resumen: 'Nebulización con solución fisiológica para humidificar la vía aérea.',
    descripcion:
      'Nebulización sin medicamento, indicada para humidificar la vía respiratoria y facilitar el manejo de secreciones cuando el profesional lo considera adecuado.',
    bullets: ['Sin medicamento', 'Bajo indicación del profesional responsable'],
    destacado: false,
    orden: 6,
  },
  {
    slug: 'consulta-inicial-fisioterapeutica',
    area: 'fisioterapia',
    nombre: 'Consulta inicial fisioterapéutica',
    precio: 875,
    resumen: 'Primera cita de fisioterapia: evaluación del movimiento y plan de trabajo.',
    descripcion:
      'El fisioterapeuta evalúa postura, movilidad, fuerza y dolor, identifica qué está limitando tu movimiento y define el plan de rehabilitación: qué se va a trabajar, con qué objetivo y cuántas sesiones requiere.',
    bullets: ['Evaluación de movilidad, fuerza y dolor', 'Objetivos de rehabilitación concretos', 'Plan de sesiones definido con criterio clínico'],
    destacado: true,
    orden: 7,
  },
  {
    slug: 'terapia-fisica-individualizada',
    area: 'fisioterapia',
    nombre: 'Sesión de terapia física individualizada',
    precio: 775,
    resumen: 'Sesión uno a uno, diseñada para tu caso y tu objetivo.',
    descripcion:
      'Sesión de rehabilitación dirigida por tu fisioterapeuta, con ejercicios y técnicas seleccionados para tu diagnóstico. Individualizada de verdad: el plan avanza conforme tú avanzas.',
    bullets: ['Atención uno a uno', 'Progresión ajustada a tu respuesta', 'Indicaciones para continuar en casa'],
    destacado: true,
    orden: 8,
  },
  {
    slug: 'descarga-muscular',
    area: 'fisioterapia',
    nombre: 'Descarga muscular',
    precio: 875,
    resumen: 'Trabajo manual para liberar tensión y contracturas profundas.',
    descripcion:
      'Sesión enfocada en liberar la tensión acumulada en grupos musculares específicos mediante técnicas manuales. Útil tanto para quien entrena como para quien pasa muchas horas en la misma postura.',
    bullets: ['Técnicas manuales de liberación', 'Enfoque en las zonas de mayor tensión', 'Recomendaciones de mantenimiento'],
    destacado: false,
    orden: 9,
  },
  {
    slug: 'mascarilla-facial',
    area: 'cuidado-personal',
    nombre: 'Mascarilla facial',
    precio: 550,
    nota: 'Limpieza e hidratación',
    resumen: 'Limpieza e hidratación facial no invasiva.',
    descripcion:
      'Protocolo facial de limpieza e hidratación, sin extracciones, peelings químicos, inyectables ni aparatología. Cuidado personal dentro de un entorno clínico.',
    bullets: ['Servicio no invasivo', 'Sin peelings químicos ni inyectables'],
    destacado: false,
    orden: 10,
  },
  {
    slug: 'sesion-dermocosmetica-antiedad',
    area: 'cuidado-personal',
    nombre: 'Sesión dermocosmética antiedad',
    precio: 1000,
    resumen: 'Protocolo dermocosmético enfocado en firmeza e hidratación.',
    descripcion:
      'Sesión dermocosmética no invasiva orientada al cuidado de la piel del rostro. Los resultados se construyen con continuidad; el profesional te indica cada cuánto conviene repetirla.',
    bullets: ['Servicio no invasivo', 'Protocolo recomendado con continuidad'],
    destacado: false,
    orden: 11,
  },
];

const PADECIMIENTOS = [
  { titulo: 'EPOC', texto: 'Enfermedad pulmonar obstructiva crónica, donde la constancia del entrenamiento respiratorio marca la diferencia.' },
  { titulo: 'Secuelas post-COVID', texto: 'Fatiga, falta de aire al esfuerzo y pérdida de condición física después de la infección.' },
  { titulo: 'Asma y alergias', texto: 'Manejo ambulatorio de crisis y acompañamiento en temporadas de mayor exposición.' },
  { titulo: 'Padecimientos respiratorios crónicos', texto: 'Seguimiento continuo con estudios objetivos y plan de rehabilitación.' },
  { titulo: 'Lesiones y contracturas', texto: 'Rehabilitación de lesiones musculoesqueléticas que requieren continuidad.' },
  { titulo: 'Tensión laboral y deportiva', texto: 'Mantenimiento preventivo para quien entrena o pasa muchas horas en la misma postura.' },
];

const FAQS = [
  {
    pregunta: '¿Necesito cita para ser atendido?',
    respuesta:
      'Sí. Agendamos por WhatsApp al 55 2770 3927, de martes a domingo de 9:00 a 21:00 h. Nos escribes, revisamos disponibilidad y apartamos tu lugar.',
    orden: 1,
  },
  {
    pregunta: '¿Necesito una referencia médica para ir?',
    respuesta:
      'No. Puedes agendar directamente tu valoración. En esa primera cita el especialista determina qué necesitas: todos los tratamientos se realizan previa valoración y bajo indicación del profesional responsable.',
    orden: 2,
  },
  {
    pregunta: '¿Cuánto cuesta la primera cita?',
    respuesta:
      'La valoración o consulta especializada cuesta $875 MXN, igual que la consulta inicial de fisioterapia. Todos los precios están publicados en la página de servicios.',
    orden: 3,
  },
  {
    pregunta: '¿Qué es la rehabilitación pulmonar?',
    respuesta:
      'Es un tratamiento que combina entrenamiento respiratorio y ejercicio adaptado para mejorar tu capacidad funcional y tu tolerancia al esfuerzo. No es una sesión aislada: la mejoría se construye con continuidad, por eso el especialista define desde el inicio cuántas sesiones requiere tu caso.',
    orden: 4,
  },
  {
    pregunta: '¿La espirometría duele?',
    respuesta:
      'No. Es un estudio no invasivo: soplas en un equipo que mide cuánto aire movilizas y a qué velocidad. Toma pocos minutos y el precio incluye la interpretación del especialista. Si necesitas alguna preparación previa, te la indicamos al agendar.',
    orden: 5,
  },
  {
    pregunta: '¿Qué pasa si no puedo asistir a mi cita?',
    respuesta:
      'Avísanos con al menos 24 horas de anticipación y la reprogramamos sin problema. Las cancelaciones con menos de 24 horas o las inasistencias sí descuentan la sesión correspondiente.',
    orden: 6,
  },
  {
    pregunta: '¿Los precios incluyen IVA?',
    respuesta:
      'Los precios están en pesos mexicanos (MXN), con IVA incluido cuando aplica, y tienen la vigencia indicada en el tarifario. Al término de la vigencia se publica un tarifario actualizado.',
    orden: 7,
  },
  {
    pregunta: '¿Qué formas de pago aceptan?',
    respuesta: 'Consulta las formas de pago disponibles al agendar tu cita por WhatsApp o directamente en recepción.',
    orden: 8,
  },
  {
    pregunta: '¿Dónde están y en qué horario atienden?',
    respuesta:
      'Estamos en Av. División del Norte 3651, Local 7, Col. San Pablo Tepetlapa, Coyoacán, C.P. 04620, CDMX. Atendemos de martes a domingo, de 9:00 a 21:00 h.',
    orden: 9,
  },
];

module.exports = { CONTENIDO, VALORES, AREAS, SERVICIOS, PADECIMIENTOS, FAQS };
