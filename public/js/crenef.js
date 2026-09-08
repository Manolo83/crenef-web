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
        mostrar('ok', 'Listo, ya tenemos tus datos. Abriendo WhatsApp con tus respuestas… Si no se abre solo, ' +
          'usa el botón de abajo.');
        if (aviso && wa) {
          var enlace = document.createElement('a');
          enlace.href = wa;
          enlace.target = '_blank';
          enlace.rel = 'noopener';
          enlace.className = 'boton boton-primario';
          enlace.style.marginTop = '14px';
          enlace.textContent = 'Abrir WhatsApp';
          aviso.appendChild(document.createElement('br'));
          aviso.appendChild(enlace);
        }
        form.reset();
        // Se manda al chat en la misma pestaña: es lo que abre la app de
        // WhatsApp de forma confiable en celular, sin que lo bloquee el
        // navegador por venir de una respuesta asincrona.
        if (wa) setTimeout(function () { window.location.href = wa; }, 900);
      })
      .catch(function (err) {
        mostrar('error', err.message + ' Vuelve a intentarlo en un momento.');
      })
      .then(function () {
        if (enviar) { enviar.disabled = false; enviar.textContent = textoOriginal; }
      });
  });
})();
