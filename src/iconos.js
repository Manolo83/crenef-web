// Iconos en linea (trazo simple, como la señaletica del manual). Viven en su
// propio archivo porque los usan tanto las plantillas como los bloques.

const ICONOS = {
  inhaloterapia:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M8.5 11c0-1.7-1.4-3-3-3-1 0-1.5.6-1.5 1.7 0 3.4.6 6.3 1.7 8.6.4.9 1.1 1.4 2 1.4 1 0 1.8-.8 1.8-1.8V11z"/><path d="M15.5 11c0-1.7 1.4-3 3-3 1 0 1.5.6 1.5 1.7 0 3.4-.6 6.3-1.7 8.6-.4.9-1.1 1.4-2 1.4-1 0-1.8-.8-1.8-1.8V11z"/></svg>',
  fisioterapia:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M11 21l1.5-6-3-2.5V8.5L13 7l3.2 2.3 2.8.7"/><path d="M9.5 12.5 6 14l-1.5 4.5"/><path d="m12.5 15 3 2 1 4"/></svg>',
  'cuidado-personal':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M9 10h.01M15 10h.01"/><path d="M9 15c.8.7 1.8 1 3 1s2.2-.3 3-1"/></svg>',
  reloj:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  wa:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5a9.42 9.42 0 0 1-4.81-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43"/></svg>',
  correo:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
};

const icono = (clave, clase = '') => `<span class="icono ${clase}">${ICONOS[clave] || ICONOS.pin}</span>`;

module.exports = { ICONOS, icono };
