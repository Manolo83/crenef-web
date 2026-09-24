// Interacciones del sitio: menu movil y formulario de solicitud de cita.
(function () {
  'use strict';

  // --- Medicion ----------------------------------------------------------
  //
  // Tres momentos, de mayor a menor volumen:
  //
  //   agenda_iniciada     pulso un boton de "Agendar" (intencion)
  //   generate_lead       lleno y envio el formulario
  //   contacto_whatsapp   abrio de verdad el chat  <- LA CONVERSION
  //
  // Solo el tercero se manda a Google Ads: es el fondo del embudo y lo unico
  // que vale la pena optimizar. Los otros dos quedan en GA4 para ver donde se
  // cae la gente.
  //
  // NUNCA se manda nombre, telefono, correo ni el motivo de consulta. Es un
  // sitio de salud: a la analitica solo va el hecho de que ocurrio y de que
  // boton vino.

  function medir(evento, origen) {
    var datos = origen ? { origen: origen } : {};
    try { if (window.gtag) window.gtag('event', evento, datos); } catch (e) {}
  }

  // Conversion de Google Ads. Se dispara una sola vez por visita: si alguien
  // vuelve al formulario y abre WhatsApp otra vez, sigue siendo el mismo
  // paciente y contarlo dos veces inflaria el reporte.
  var yaConvirtio = false;
  function conversionContacto(origen) {
    medir('contacto_whatsapp', origen);
    try { if (window.fbq) window.fbq('track', 'Contact'); } catch (e) {}
    if (yaConvirtio) return;
    yaConvirtio = true;
    try {
      if (window.gtag && window.CRENEF_ADS_CONVERSION) {
        window.gtag('event', 'conversion', { send_to: window.CRENEF_ADS_CONVERSION });
      }
    } catch (e) {}
  }

  // Botones de "Agendar" repartidos por el sitio. Todos llevan a /agenda, asi
  // que esto mide intencion, no contacto. El listener va delegado en el
  // documento para que tambien alcance a los botones del menu movil.
  document.addEventListener('click', function (e) {
    var destino = e.target && e.target.closest && e.target.closest('[data-evento]');
    if (!destino) return;
    medir('agenda_iniciada', destino.getAttribute('data-evento'));
  }, true);

  // --- Menu movil --------------------------------------------------------
  var boton = document.getElementById('boton-menu');
  var menu = document.getElementById('menu-movil');
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  // --- Formulario de solicitud de cita -----------------------------------
  var form = document.getElementById('form-cita');
  if (!form) return;

  var aviso = document.getElementById('mensaje-form');
  var enviar = form.querySelector('button[type="submit"]');
  var textoOriginal = enviar ? enviar.textContent : '';

  function mostrar(clase, texto) {
    if (!aviso) return;
    aviso.className = 'mensaje-form ' + clase;
    aviso.textContent = texto;
    aviso.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var datos = {};
    new FormData(form).forEach(function (valor, clave) { datos[clave] = valor; });

    if (!datos.nombre || !datos.telefono) {
      mostrar('error', 'Necesitamos tu nombre y un teléfono para poder contactarte.');
      return;
    }
    if (!datos.motivo) {
      mostrar('error', 'Cuéntanos brevemente qué te está pasando.');
      return;
    }
    if (!datos.consentimiento) {
      mostrar('error', 'Necesitamos tu autorización para usar tus datos y poder contactarte.');
      return;
    }

    if (enviar) { enviar.disabled = true; enviar.textContent = 'Enviando…'; }

    fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, cuerpo: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.cuerpo.error || 'No se pudo enviar la solicitud.');

        medir('generate_lead', 'formulario de agenda');
        try { if (window.fbq) window.fbq('track', 'Lead'); } catch (err) {}

        var wa = res.cuerpo.waUrl;
        var id = res.cuerpo.id;
        form.reset();

        // Avisa al servidor que esta persona si llego al chat. Se usa
        // sendBeacon porque el navegador esta a punto de salir de la pagina:
        // un fetch normal se cancelaria a medio camino.
        function marcarQueAbrioWhatsApp(origen) {
          // La conversion va primero y es sincrona: el navegador esta a punto
          // de irse a WhatsApp y un evento encolado despues se pierde.
          conversionContacto(typeof origen === 'string' ? origen : 'automatico');
          if (!id) return;
          try {
            if (navigator.sendBeacon) navigator.sendBeacon('/api/solicitudes/' + id + '/whatsapp');
            else fetch('/api/solicitudes/' + id + '/whatsapp', { method: 'POST', keepalive: true });
          } catch (err) { /* si falla, la solicitud igual quedo guardada */ }
        }

        // Se sustituye el formulario por la confirmacion, para que quede
        // claro que falta un paso: pulsar "enviar" dentro de WhatsApp.
        if (aviso) {
          aviso.className = 'mensaje-form ok confirmacion';
          aviso.innerHTML = '';
          var titulo = document.createElement('b');
          titulo.textContent = 'Ya tenemos tus datos.';
          var texto = document.createElement('p');
          texto.textContent = 'Falta un paso: estamos abriendo WhatsApp con tus respuestas ya escritas. ' +
            'Solo pulsa enviar dentro de la aplicación y nos llega tu solicitud.';
          aviso.appendChild(titulo);
          aviso.appendChild(texto);
          if (wa) {
            var enlace = document.createElement('a');
            enlace.href = wa;
            enlace.className = 'boton boton-primario';
            enlace.textContent = 'Abrir WhatsApp y enviar';
            enlace.addEventListener('click', function () { marcarQueAbrioWhatsApp('boton'); });
            aviso.appendChild(enlace);
            var nota = document.createElement('span');
            nota.className = 'ayuda';
            nota.textContent = 'Si no se abre solo, pulsa el botón.';
            aviso.appendChild(nota);
          }
          aviso.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }

        // Se navega en la misma pestaña: es lo que abre la app de WhatsApp de
        // forma confiable en celular, sin que el navegador lo bloquee por
        // venir de una respuesta asincrona.
        if (wa) setTimeout(function () {
          marcarQueAbrioWhatsApp('automatico');
          window.location.href = wa;
        }, 1200);
      })
      .catch(function (err) {
        mostrar('error', err.message + ' Vuelve a intentarlo en un momento.');
      })
      .then(function () {
        if (enviar) { enviar.disabled = false; enviar.textContent = textoOriginal; }
      });
  });
})();
