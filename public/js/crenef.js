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

    if (enviar) { enviar.disabled = true; enviar.textContent = 'Enviando…'; }

    fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, cuerpo: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.cuerpo.error || 'No se pudo enviar la solicitud.');
        form.reset();
        mostrar('ok', 'Listo, recibimos tu solicitud. Te contactamos en horario de clínica (martes a domingo, 9:00 a 21:00 h). Si prefieres respuesta inmediata, escríbenos por WhatsApp.');
        if (window.gtag) window.gtag('event', 'generate_lead', { method: 'formulario' });
        if (window.fbq) window.fbq('track', 'Lead');
      })
      .catch(function (err) {
        mostrar('error', err.message + ' También puedes escribirnos directo por WhatsApp.');
      })
      .then(function () {
        if (enviar) { enviar.disabled = false; enviar.textContent = textoOriginal; }
      });
  });
})();
