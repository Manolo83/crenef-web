# CRENEF · Clínica de Rehabilitación Neumofisio

Sitio web de CRENEF con panel de administración propio: los textos, los
servicios, los precios, las preguntas frecuentes y las solicitudes de cita se
editan desde `/admin` y cambian en el sitio al instante, sin tocar código ni
volver a desplegar.

Es un proyecto **independiente de Endulcora**: su propio repositorio, su propio
proyecto de Railway, su propia base de datos y su propio dominio.

## Qué incluye

**Sitio público** — una página de inicio que resume todo y, desde ahí, cada
sección con su propia dirección:

| Dirección | Qué es |
|---|---|
| `/` | Portada: quiénes somos, las tres áreas con precios, cómo trabajamos, a quién acompañamos, ubicación y preguntas frecuentes |
| `/servicios` | Tarifario completo, agrupado por área |
| `/servicios/<servicio>` | Una página por servicio (11 en total), con su precio y su explicación |
| `/nosotros` | La clínica, los valores y a quién acompañamos |
| `/preguntas-frecuentes` | Todas las preguntas |
| `/ubicacion` | Dirección, horario y mapa |
| `/contacto` | Formulario de solicitud de cita + datos directos |
| `/aviso-de-privacidad` | Legal |
| `/agenda` | Atajo que **redirige directo al WhatsApp** de la clínica (útil para anuncios, códigos QR y la lona). También responden `/cita` y `/whatsapp` |

Todos los botones de «Agendar» del sitio abren el chat de WhatsApp con el
mensaje ya escrito, y hay un botón flotante de WhatsApp en todas las páginas.

**Panel de administración** (`/admin`, protegido con contraseña):

- **Textos del sitio**: portada, secciones, datos de contacto, tarifario y
  legales.
- **Servicios y precios**: agregar, editar, reordenar o borrar servicios. Cada
  uno genera su propia página automáticamente.
- **Áreas**: las tres agrupaciones (inhaloterapia, fisioterapia, cuidado
  personal).
- **Preguntas frecuentes**, **valores** y **padecimientos**.
- **Solicitudes de cita**: lo que llega por el formulario, con botón para
  contestar por WhatsApp y marcar como atendida.

**Backend** en Node.js + Express. Las páginas se arman en el servidor, así que
el visitante y Google reciben el HTML completo desde la primera respuesta
(bueno para SEO y para conexiones lentas). Incluye `robots.txt`, `sitemap.xml`
generado al vuelo, Open Graph y datos estructurados de tipo `MedicalClinic` y
`FAQPage`.

## Precios y paquetes (importante)

El sitio publica **solo los precios de servicios individuales** del Tarifario
2026. Los **bloques de sesiones prepagadas no se publican aquí** a propósito:
según la *Guía interna de venta de paquetes 2026*, se ofrecen en persona, al
final de la primera consulta y después de que el especialista definió el
tratamiento. Esa guía es un documento de uso interno y su contenido no debe
llegar al sitio, a redes ni a los anuncios.

## Identidad gráfica

Todo sale del *Manual de Identidad Gráfica v1.0 (julio 2026)*:

| Color | HEX | Uso |
|---|---|---|
| Azul CRENEF | `#16355F` | Titulares, pie de página, protagonista |
| Teal Rehabilitación | `#3FA39F` | Acentos, botones de acción |
| Azul Respiratorio | `#2B5EA7` | Degradados |
| Teal Claro | `#7CC5BF` | Acentos suaves |
| Gris Niebla | `#D9E4E6` | Fondos y aire |

Tipografías: **Montserrat** (titulares y elementos de marca) y **Open Sans**
(texto corrido), cargadas desde Google Fonts como indica el manual. Todo eso
vive en un solo lugar: las variables `:root` de `public/css/crenef.css`.

Los archivos del logotipo (`public/img/`) se extrajeron del propio manual en
sus versiones autorizadas: principal a color, negativo, monocromo azul,
isotipo, texto e isotipo en blanco. El favicon usa solo el isotipo, como pide
el manual para tamaños pequeños.

## 1. Desarrollo local

```bash
npm install
cp .env.example .env    # edita ADMIN_PASSWORD y SESSION_SECRET
npm start
```

`http://localhost:3000` para el sitio y `http://localhost:3000/admin` para el
panel. Sin `DATABASE_URL`, el contenido se guarda en `data/crenef.json`, así
que no hace falta instalar PostgreSQL para trabajar en local.

## 2. Desplegar en Railway

1. Entra a [railway.app](https://railway.app) con tu cuenta de GitHub.
2. **New Project → Deploy from GitHub repo** y elige `Manolo83/crenef-web`.
   Este es un proyecto **nuevo y aparte** del de Endulcora.
3. Railway detecta Node.js solo (`npm install` y `npm start`). No hace falta
   Dockerfile.
4. **Agrega PostgreSQL**: en el proyecto, **New → Database → Add PostgreSQL**.
   Railway crea `DATABASE_URL` sola; no hay que copiar nada.
5. **Agrega un Volume** (solo para las fotos que subas desde `/admin`): en el
   servicio, **Volumes → New Volume**, montado en `/data`.
6. **Variables** (pestaña *Variables*):

   | Variable | Valor |
   |---|---|
   | `ADMIN_PASSWORD` | una contraseña fuerte para `/admin` |
   | `SESSION_SECRET` | un texto aleatorio de 32+ caracteres |
   | `DATA_DIR` | `/data` |
   | `NODE_ENV` | `production` |
   | `SITE_URL` | `https://www.crenef.mx` |

   `DATABASE_URL` y `PORT` los pone Railway solo.

7. Railway despliega y te da una URL tipo
   `crenef-web-production.up.railway.app`. Pruébala antes de conectar el
   dominio.

Cada `git push` a la rama conectada vuelve a desplegar solo.

## 3. Conectar crenef.mx

1. En Railway: servicio → **Settings → Networking → Custom Domain**.
2. Agrega `crenef.mx` y `www.crenef.mx`.
3. Railway te da los registros DNS (normalmente un `CNAME` para `www` y un
   `A`/`ALIAS` para el dominio raíz).
4. Cópialos tal cual en el panel DNS de tu registrador.
5. Espera a que propague. El certificado SSL se emite solo.

## 4. Que Google encuentre la clínica

1. Entra a [Google Search Console](https://search.google.com/search-console) y
   agrega la propiedad `crenef.mx` (verificación por DNS).
2. En **Sitemaps**, envía `https://www.crenef.mx/sitemap.xml`.
3. Con **Inspección de URL**, pide indexación de la portada.
4. Aparte, reclama la ficha de **Google Business Profile** de la clínica: para
   un negocio local con dirección física, esa ficha trae más pacientes que
   cualquier otra cosa. Usa el mismo nombre, dirección y teléfono que el sitio.

## 5. Avisos por correo de las solicitudes (opcional)

Las solicitudes del formulario siempre se guardan y se ven en `/admin`. Si
además quieres que llegue un correo al recibirlas:

1. Crea una cuenta gratis en [resend.com](https://resend.com) y saca una API
   Key.
2. En Railway agrega `RESEND_API_KEY` y `AVISOS_EMAIL` (el correo de la
   clínica).
3. Deja `RESEND_FROM` como `CRENEF <onboarding@resend.dev>` para probar. Para
   que salga desde `noreply@crenef.mx`, verifica el dominio en Resend
   (**Domains → Add Domain**) y cambia la variable.

## 6. Medición para anuncios (opcional)

Sin estas variables, el sitio **no carga nada de terceros**. Para activarlas,
en Railway:

- `GA_ID` — Google Analytics 4.
- `GOOGLE_ADS_ID` — etiqueta de Google Ads. La cuenta de CRENEF es la
  `905-783-5688`, dentro del MCC `894-945-9356` que ya administra las cuatro
  cuentas del grupo.
- `META_PIXEL_ID` — pixel de Facebook/Instagram.

## 7. Seguridad y respaldos

- Cambia `ADMIN_PASSWORD` a algo fuerte y no lo compartas fuera del equipo.
- El panel está bloqueado para buscadores (`robots.txt` y `noindex`) y limita
  los intentos de acceso (20 cada 15 minutos).
- El formulario público está limitado a 10 envíos cada 15 minutos por IP y
  tiene un campo trampa contra robots de spam.
- Todo el contenido vive en PostgreSQL, no en el Volume, así que sobrevive a
  cada despliegue. Solo las imágenes que subas quedan en `/data`.
- Railway no respalda solo en el plan gratuito: de vez en cuando exporta la
  base (`railway connect postgres` y `pg_dump`).

## 8. Pendientes de contenido

Cosas que hay que confirmar con la clínica antes de publicar el sitio:

- **Responsable sanitario y su cédula profesional** — el tarifario los deja
  marcados como pendientes. Se capturan en `/admin → Textos del sitio →
  Legales`.
- **Correo de contacto**: se usó `contacto@crenef.mx`, que aparece en el
  ejemplo de papelería del manual. Confirmar que la cuenta existe.
- **Fotografías reales** de la clínica, el equipo y las salas. Hoy el sitio se
  sostiene con la marca; con fotos propias sube mucho.
- **Textos clínicos**: las descripciones de cada servicio son redacciones
  generales, escritas con el tono de voz del manual y sin inventar promesas de
  resultado. Aun así, conviene que el profesional responsable las revise y
  apruebe antes de publicar.
- **Aviso de privacidad integral**: el del sitio es una versión resumida; el
  completo debe estar disponible en recepción.

## Estructura del proyecto

```
server.js              arranque, seguridad, sitemap y robots
src/
  config.js            variables de entorno
  store.js             contenido en PostgreSQL (o archivo si no hay base)
  datosIniciales.js    contenido con el que nace el sitio (tarifario y manual)
  render.js            arma cada página con la plantilla común
  bloques.js           HTML generado: tarjetas, tablas de precios, acordeones
  iconos.js            iconos en línea
  auth.js              contraseña y sesión del panel
  uploads.js           subida y optimización de imágenes
  email.js             aviso por correo de las solicitudes (opcional)
  routes/
    publico.js         las páginas del sitio
    api.js             solicitudes de cita
    admin.js           el panel
paginas/               plantillas HTML de cada página
public/
  css/crenef.css       toda la identidad visual
  js/crenef.js         menú móvil y formulario
  js/admin.js          el panel
  img/                 logotipos extraídos del manual
  admin/index.html     el panel
```
