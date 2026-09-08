// Interacciones del sitio: menu movil y formulario de solicitud de cita.
(function () {
  'use strict';

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

        if (window.gtag) window.gtag('event', 'generate_lead', { method: 'formulario de agenda' });
        if (window.fbq) window.fbq('track', 'Lead');

        var wa = res.cuerpo.waUrl;
        form.reset();

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
        if (wa) setTimeout(function () { window.location.href = wa; }, 1200);
      })
      .catch(function (err) {
        mostrar('error', err.message + ' Vuelve a intentarlo en un momento.');
      })
      .then(function () {
        if (enviar) { enviar.disabled = false; enviar.textContent = textoOriginal; }
      });
  });
})();
