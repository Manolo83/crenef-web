// Panel de administracion de CRENEF. Todo el contenido del sitio se edita
// desde aqui y se guarda en el servidor; no hace falta volver a desplegar.
(function () {
  'use strict';

  var datos = null;
  var pestanaActual = 'contenido';

  var $ = function (sel) { return document.querySelector(sel); };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function avisar(texto, esError) {
    var el = $('#aviso');
    el.textContent = texto;
    el.className = 'aviso visible' + (esError ? ' error' : '');
    setTimeout(function () { el.className = 'aviso'; }, 2600);
  }

  function api(ruta, opciones) {
    opciones = opciones || {};
    if (opciones.cuerpo) {
      opciones.body = JSON.stringify(opciones.cuerpo);
      opciones.headers = { 'Content-Type': 'application/json' };
      delete opciones.cuerpo;
    }
    return fetch('/admin' + ruta, opciones).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || 'Ocurrió un error.');
        return j;
      });
    });
  }

  // --- Acceso ------------------------------------------------------------

  $('#form-acceso').addEventListener('submit', function (e) {
    e.preventDefault();
    api('/login', { method: 'POST', cuerpo: { password: $('#password').value } })
      .then(entrar)
      .catch(function (err) { $('#error-acceso').textContent = err.message; });
  });

  $('#salir').addEventListener('click', function () {
    api('/logout', { method: 'POST' }).then(function () { location.reload(); });
  });

  function entrar() {
    return api('/datos').then(function (d) {
      datos = d;
      $('#acceso').classList.add('oculto');
      $('#app').classList.remove('oculto');
      pintarPestanas();
      pintarTodo();
    });
  }

  // --- Pestañas ----------------------------------------------------------

  var PESTANAS = [
    { id: 'contenido', etiqueta: 'Textos del sitio' },
    { id: 'servicios', etiqueta: 'Servicios y precios' },
    { id: 'areas', etiqueta: 'Áreas' },
    { id: 'faqs', etiqueta: 'Preguntas frecuentes' },
    { id: 'listas', etiqueta: 'Valores y padecimientos' },
    { id: 'solicitudes', etiqueta: 'Solicitudes de cita' },
  ];

  function pintarPestanas() {
    $('#pestanas').innerHTML = PESTANAS.map(function (p) {
      return '<button class="pestana' + (p.id === pestanaActual ? ' activa' : '') + '" data-p="' + p.id + '">' + esc(p.etiqueta) + '</button>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('.pestana'), function (b) {
      b.addEventListener('click', function () {
        pestanaActual = b.dataset.p;
        pintarPestanas();
        mostrarPanel();
      });
    });
    mostrarPanel();
  }

  function mostrarPanel() {
    PESTANAS.forEach(function (p) {
      $('#panel-' + p.id).classList.toggle('activo', p.id === pestanaActual);
    });
    window.scrollTo({ top: 0 });
  }

  function pintarTodo() {
    pintarContenido();
    pintarColeccion('servicios');
    pintarColeccion('areas');
    pintarColeccion('faqs');
    pintarListas();
    pintarSolicitudes();
  }

  // --- Textos del sitio --------------------------------------------------

  var GRUPOS = [
    { titulo: 'Portada', claves: ['hero_kicker', 'hero_titulo', 'hero_texto', 'hero_cta_principal', 'hero_cta_secundario'] },
    { titulo: 'Barra de confianza', claves: ['confianza_1_titulo', 'confianza_1_texto', 'confianza_2_titulo', 'confianza_2_texto', 'confianza_3_titulo', 'confianza_3_texto', 'confianza_4_titulo', 'confianza_4_texto'] },
    { titulo: 'Introducción a servicios', claves: ['servicios_kicker', 'servicios_titulo', 'servicios_texto'] },
    { titulo: 'Cómo trabajamos', claves: ['proceso_kicker', 'proceso_titulo', 'proceso_texto', 'proceso_1_titulo', 'proceso_1_texto', 'proceso_2_titulo', 'proceso_2_texto', 'proceso_3_titulo', 'proceso_3_texto', 'proceso_4_titulo', 'proceso_4_texto'] },
    { titulo: 'A quién acompañamos', claves: ['padecimientos_kicker', 'padecimientos_titulo', 'padecimientos_texto'] },
    { titulo: 'Sobre la clínica', claves: ['nosotros_kicker', 'nosotros_titulo', 'nosotros_texto', 'nosotros_esencia', 'marca_lema'] },
    { titulo: 'Llamado final', claves: ['cta_titulo', 'cta_texto', 'cta_boton'] },
    { titulo: 'Contacto', claves: ['contacto_whatsapp', 'contacto_whatsapp_visible', 'contacto_whatsapp_mensaje', 'contacto_correo', 'contacto_telefono', 'contacto_direccion_1', 'contacto_direccion_2', 'contacto_horario', 'contacto_maps_url', 'contacto_maps_embed', 'contacto_instagram', 'contacto_facebook'] },
    { titulo: 'Tarifario', claves: ['tarifario_vigencia', 'tarifario_nota'] },
    { titulo: 'Legales y pie de página', claves: ['pie_texto', 'legal_aviso_medico', 'legal_aviso_privacidad', 'legal_responsable_datos', 'legal_responsable_sanitario', 'legal_cedula_responsable'] },
  ];

  var ETIQUETAS = {
    hero_kicker: 'Etiqueta sobre el título', hero_titulo: 'Título principal', hero_texto: 'Párrafo de la portada',
    hero_cta_principal: 'Botón principal', hero_cta_secundario: 'Botón secundario',
    servicios_kicker: 'Etiqueta', servicios_titulo: 'Título', servicios_texto: 'Párrafo',
    proceso_kicker: 'Etiqueta', proceso_titulo: 'Título', proceso_texto: 'Párrafo',
    padecimientos_kicker: 'Etiqueta', padecimientos_titulo: 'Título', padecimientos_texto: 'Párrafo',
    nosotros_kicker: 'Etiqueta', nosotros_titulo: 'Título', nosotros_texto: 'Quiénes somos', nosotros_esencia: 'Esencia de marca',
    marca_lema: 'Lema de la marca',
    cta_titulo: 'Título', cta_texto: 'Párrafo', cta_boton: 'Texto del botón',
    contacto_whatsapp: 'WhatsApp (solo 10 dígitos)', contacto_whatsapp_visible: 'WhatsApp como se muestra',
    contacto_whatsapp_mensaje: 'Mensaje con el que abre el chat', contacto_correo: 'Correo', contacto_telefono: 'Teléfono fijo (opcional)',
    contacto_direccion_1: 'Dirección, línea 1', contacto_direccion_2: 'Dirección, línea 2', contacto_horario: 'Horario',
    contacto_maps_url: 'Enlace de Google Maps', contacto_maps_embed: 'Enlace del mapa incrustado',
    contacto_instagram: 'Instagram (opcional)', contacto_facebook: 'Facebook (opcional)',
    tarifario_vigencia: 'Vigencia del tarifario', tarifario_nota: 'Nota al pie del tarifario',
    pie_texto: 'Descripción del pie', legal_aviso_medico: 'Aviso médico',
    legal_aviso_privacidad: 'Aviso de privacidad', legal_responsable_datos: 'Responsable de datos personales',
    legal_responsable_sanitario: 'Responsable sanitario', legal_cedula_responsable: 'Cédula profesional',
  };

  var LARGOS = ['hero_texto', 'servicios_texto', 'proceso_texto', 'padecimientos_texto', 'nosotros_texto', 'nosotros_esencia', 'cta_texto', 'tarifario_nota', 'pie_texto', 'legal_aviso_medico', 'legal_aviso_privacidad', 'contacto_maps_embed'];

  function etiqueta(clave) {
    if (ETIQUETAS[clave]) return ETIQUETAS[clave];
    return clave.replace(/_/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }

  function pintarContenido() {
    var html = '<h2>Textos del sitio</h2><p class="nota">Cambia cualquier texto y pulsa «Guardar cambios». Se refleja de inmediato en el sitio público.</p>';
    html += GRUPOS.map(function (g) {
      var campos = g.claves.map(function (k) {
        var v = datos.contenido[k] || '';
        var control = LARGOS.indexOf(k) >= 0
          ? '<textarea data-clave="' + k + '"' + (k === 'legal_aviso_privacidad' ? ' style="min-height:230px"' : '') + '>' + esc(v) + '</textarea>'
          : '<input type="text" data-clave="' + k + '" value="' + esc(v) + '">';
        return '<div class="campo"><label>' + esc(etiqueta(k)) + '</label>' + control + '</div>';
      }).join('');
      return '<div class="tarjeta"><p class="grupo-titulo">' + esc(g.titulo) + '</p>' + campos + '</div>';
    }).join('');
    html += '<div class="acciones"><button class="btn" id="guardar-contenido">Guardar cambios</button></div>';
    $('#panel-contenido').innerHTML = html;

    $('#guardar-contenido').addEventListener('click', function () {
      var cambios = {};
      Array.prototype.forEach.call($('#panel-contenido').querySelectorAll('[data-clave]'), function (el) {
        cambios[el.dataset.clave] = el.value;
      });
      api('/contenido', { method: 'PUT', cuerpo: cambios })
        .then(function (r) { datos.contenido = r.contenido; avisar('Textos guardados.'); })
        .catch(function (e) { avisar(e.message, true); });
    });
  }

  // --- Colecciones (servicios, áreas, preguntas) -------------------------

  var CAMPOS = {
    servicios: [
      { k: 'nombre', l: 'Nombre del servicio' },
      { k: 'slug', l: 'Dirección web (sin espacios ni acentos)' },
      { k: 'area', l: 'Área', tipo: 'area' },
      { k: 'precio', l: 'Precio en pesos (solo el número)', tipo: 'numero' },
      { k: 'nota', l: 'Nota corta bajo el nombre' },
      { k: 'resumen', l: 'Resumen de una línea' },
      { k: 'descripcion', l: 'Descripción completa', tipo: 'largo' },
      { k: 'bullets', l: 'Puntos clave (uno por renglón)', tipo: 'lista' },
      { k: 'orden', l: 'Orden en la lista', tipo: 'numero' },
    ],
    areas: [
      { k: 'nombre', l: 'Nombre corto' },
      { k: 'slug', l: 'Dirección web' },
      { k: 'titulo', l: 'Título completo' },
      { k: 'resumen', l: 'Resumen de una línea' },
      { k: 'descripcion', l: 'Descripción', tipo: 'largo' },
    ],
    faqs: [
      { k: 'pregunta', l: 'Pregunta' },
      { k: 'respuesta', l: 'Respuesta', tipo: 'largo' },
      { k: 'orden', l: 'Orden', tipo: 'numero' },
    ],
    valores: [
      { k: 'titulo', l: 'Valor' },
      { k: 'texto', l: 'Descripción', tipo: 'largo' },
    ],
    padecimientos: [
      { k: 'titulo', l: 'Padecimiento' },
      { k: 'texto', l: 'Descripción', tipo: 'largo' },
    ],
  };

  var TITULO_ITEM = { servicios: 'nombre', areas: 'nombre', faqs: 'pregunta', valores: 'titulo', padecimientos: 'titulo' };

  function formularioItem(coleccion, item) {
    var campos = CAMPOS[coleccion].map(function (c) {
      var v = item[c.k];
      if (c.tipo === 'lista') v = (v || []).join('\n');
      if (c.tipo === 'area') {
        var opciones = datos.colecciones.areas.map(function (a) {
          return '<option value="' + esc(a.slug) + '"' + (a.slug === v ? ' selected' : '') + '>' + esc(a.nombre) + '</option>';
        }).join('');
        return '<div class="campo"><label>' + esc(c.l) + '</label><select data-k="' + c.k + '">' + opciones + '</select></div>';
      }
      var control = (c.tipo === 'largo' || c.tipo === 'lista')
        ? '<textarea data-k="' + c.k + '">' + esc(v == null ? '' : v) + '</textarea>'
        : '<input type="' + (c.tipo === 'numero' ? 'number' : 'text') + '" data-k="' + c.k + '" value="' + esc(v == null ? '' : v) + '">';
      return '<div class="campo"><label>' + esc(c.l) + '</label>' + control + '</div>';
    }).join('');
    return '<div class="tarjeta" data-form="' + esc(item.id || '') + '">' + campos +
      '<div class="acciones"><button class="btn" data-accion="guardar">Guardar</button>' +
      (item.id ? '<button class="btn-borrar btn-chico" data-accion="borrar">Borrar</button>' : '') +
      '<button class="btn-linea btn-chico" data-accion="cancelar">Cancelar</button></div></div>';
  }

  function pintarColeccion(coleccion) {
    var lista = datos.colecciones[coleccion] || [];
    var titulos = { servicios: 'Servicios y precios', areas: 'Áreas de atención', faqs: 'Preguntas frecuentes' };
    var notas = {
      servicios: 'Estos son los servicios individuales que se muestran en el sitio. Los bloques de sesiones prepagadas no se publican aquí: se ofrecen en persona, después de la valoración.',
      areas: 'Las tres agrupaciones en las que se ordenan los servicios.',
      faqs: 'Se muestran en /preguntas-frecuentes y las primeras cinco en la portada.',
    };
    var html = '<h2>' + esc(titulos[coleccion]) + '</h2><p class="nota">' + esc(notas[coleccion]) + '</p><div class="lista-items">';
    html += lista.map(function (item) {
      var sub = coleccion === 'servicios' ? '$' + Number(item.precio || 0).toLocaleString('es-MX') + ' · ' + esc(item.area || '') : esc(item.resumen || item.respuesta || '').slice(0, 90);
      return '<div class="item"><div><b>' + esc(item[TITULO_ITEM[coleccion]] || 'Sin nombre') + '</b><small>' + sub + '</small></div>' +
        '<button class="btn-linea btn-chico" data-editar="' + esc(item.id) + '">Editar</button></div>';
    }).join('');
    html += '</div><div id="editor-' + coleccion + '"></div><button class="btn-azul" data-nuevo="1">+ Agregar</button>';
    var panel = $('#panel-' + coleccion);
    panel.innerHTML = html;
    conectarColeccion(coleccion, panel);
  }

  function conectarColeccion(coleccion, raiz) {
    if (!raiz) return;
    var editor = raiz.querySelector('#editor-' + coleccion);

    Array.prototype.forEach.call(raiz.querySelectorAll('[data-editar]'), function (b) {
      b.addEventListener('click', function () {
        var item = datos.colecciones[coleccion].filter(function (x) { return x.id === b.dataset.editar; })[0];
        abrirEditor(coleccion, editor, item || {});
      });
    });
    var nuevo = raiz.querySelector('[data-nuevo]');
    if (nuevo) nuevo.addEventListener('click', function () { abrirEditor(coleccion, editor, {}); });
  }

  function abrirEditor(coleccion, editor, item) {
    editor.innerHTML = formularioItem(coleccion, item);
    editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var form = editor.querySelector('[data-form]');

    form.querySelector('[data-accion="cancelar"]').addEventListener('click', function () { editor.innerHTML = ''; });

    form.querySelector('[data-accion="guardar"]').addEventListener('click', function () {
      var cuerpo = { id: item.id };
      Array.prototype.forEach.call(form.querySelectorAll('[data-k]'), function (el) {
        var def = CAMPOS[coleccion].filter(function (c) { return c.k === el.dataset.k; })[0] || {};
        if (def.tipo === 'lista') cuerpo[el.dataset.k] = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        else if (def.tipo === 'numero') cuerpo[el.dataset.k] = Number(el.value) || 0;
        else cuerpo[el.dataset.k] = el.value;
      });
      api('/coleccion/' + coleccion, { method: 'POST', cuerpo: cuerpo })
        .then(function () { return recargar(); })
        .then(function () { avisar('Guardado.'); })
        .catch(function (e) { avisar(e.message, true); });
    });

    var borrar = form.querySelector('[data-accion="borrar"]');
    if (borrar) borrar.addEventListener('click', function () {
      if (!confirm('¿Seguro que quieres borrarlo? No se puede deshacer.')) return;
      api('/coleccion/' + coleccion + '/' + item.id, { method: 'DELETE' })
        .then(function () { return recargar(); })
        .then(function () { avisar('Borrado.'); })
        .catch(function (e) { avisar(e.message, true); });
    });
  }

  // --- Valores y padecimientos (dos colecciones en un panel) -------------

  function pintarListas() {
    var html = '';
    [['valores', 'Valores de la clínica'], ['padecimientos', 'A quién acompañamos']].forEach(function (par) {
      var col = par[0];
      html += '<h2>' + esc(par[1]) + '</h2><div class="lista-items">' +
        (datos.colecciones[col] || []).map(function (item) {
          return '<div class="item"><div><b>' + esc(item.titulo) + '</b><small>' + esc((item.texto || '').slice(0, 90)) + '</small></div>' +
            '<button class="btn-linea btn-chico" data-editar-' + col + '="' + esc(item.id) + '">Editar</button></div>';
        }).join('') +
        '</div><div id="editor-' + col + '"></div><button class="btn-azul" data-nuevo-' + col + '="1" style="margin-bottom:32px">+ Agregar</button>';
    });
    var panel = $('#panel-listas');
    panel.innerHTML = html;

    ['valores', 'padecimientos'].forEach(function (col) {
      var editor = panel.querySelector('#editor-' + col);
      Array.prototype.forEach.call(panel.querySelectorAll('[data-editar-' + col + ']'), function (b) {
        b.addEventListener('click', function () {
          var item = datos.colecciones[col].filter(function (x) { return x.id === b.getAttribute('data-editar-' + col); })[0];
          abrirEditor(col, editor, item || {});
        });
      });
      var nuevo = panel.querySelector('[data-nuevo-' + col + ']');
      if (nuevo) nuevo.addEventListener('click', function () { abrirEditor(col, editor, {}); });
    });
  }

  // --- Solicitudes de cita -----------------------------------------------

  var CAMPOS_SOLICITUD = [
    ['telefono', 'Teléfono'],
    ['correo', 'Correo'],
    ['para_quien', 'La cita es'],
    ['servicio', 'Servicio'],
    ['motivo', 'Motivo'],
    ['mensaje', 'Mensaje'],
    ['desde_cuando', 'Desde cuándo'],
    ['estudios', 'Estudios previos'],
    ['preferencia', 'Horario que le acomoda'],
  ];

  function detalle(s) {
    return CAMPOS_SOLICITUD
      .filter(function (c) { return s[c[0]]; })
      .map(function (c) { return '<b>' + esc(c[1]) + ':</b> ' + esc(s[c[0]]); })
      .join('<br>');
  }

  function pintarSolicitudes() {
    var lista = datos.solicitudes || [];
    var pendientes = lista.filter(function (s) { return !s.atendida; }).length;
    var sinChat = lista.filter(function (s) { return !s.whatsapp; }).length;
    var html = '<h2>Solicitudes de cita</h2><p class="nota">Todas las que llegan por el formulario del sitio quedan aquí, ' +
      'hayan pasado o no por WhatsApp. ' +
      (pendientes ? '<b>' + pendientes + ' sin atender.</b>' : 'Todas atendidas.') +
      (sinChat ? ' <b style="color:#B32020">' + sinChat + ' no llegaron al chat: conviene marcarles tú.</b>' : '') + '</p>';

    if (!lista.length) {
      html += '<div class="tarjeta"><p style="margin:0;color:var(--suave)">Todavía no hay solicitudes.</p></div>';
    } else {
      html += lista.map(function (s) {
        var fecha = new Date(s.fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
        var tel = String(s.telefono || '').replace(/\D/g, '');
        return '<div class="tarjeta"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:center">' +
          '<div><b style="font-family:Montserrat,sans-serif;color:var(--azul)">' + esc(s.nombre) + '</b> ' +
          (s.whatsapp
            ? '<span class="pildora verde">● Formulario enviado por WhatsApp</span>'
            : '<span class="pildora roja">● No llegó al chat de WhatsApp</span>') + ' ' +
          (s.atendida ? '<span class="pildora">Atendida</span>' : '<span class="pildora nueva">Nueva</span>') +
          '<small style="display:block;color:var(--suave)">' + esc(fecha) + '</small></div>' +
          '<div class="acciones">' +
          (tel ? '<a class="btn btn-chico" style="text-decoration:none" href="https://wa.me/52' + tel + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
          '<button class="btn-linea btn-chico" data-atender="' + esc(s.id) + '">' + (s.atendida ? 'Marcar pendiente' : 'Marcar atendida') + '</button>' +
          '<button class="btn-borrar btn-chico" data-borrar="' + esc(s.id) + '">Borrar</button>' +
          '</div></div>' +
          '<p style="margin:14px 0 0;font-size:.92rem">' + detalle(s) + '</p></div>';
      }).join('');
    }
    var panel = $('#panel-solicitudes');
    panel.innerHTML = html;

    Array.prototype.forEach.call(panel.querySelectorAll('[data-atender]'), function (b) {
      b.addEventListener('click', function () {
        var s = lista.filter(function (x) { return x.id === b.dataset.atender; })[0];
        api('/solicitudes/' + b.dataset.atender, { method: 'PATCH', cuerpo: { atendida: !s.atendida } })
          .then(recargar).catch(function (e) { avisar(e.message, true); });
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll('[data-borrar]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('¿Borrar esta solicitud?')) return;
        api('/solicitudes/' + b.dataset.borrar, { method: 'DELETE' }).then(recargar).catch(function (e) { avisar(e.message, true); });
      });
    });
  }

  function recargar() {
    return api('/datos').then(function (d) { datos = d; pintarTodo(); });
  }

  // --- Arranque ----------------------------------------------------------

  api('/sesion').then(function (r) { if (r.autenticado) entrar(); });
})();
