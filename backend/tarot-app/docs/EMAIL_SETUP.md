# Configuración de Email

> Envío transaccional: reset de contraseña, avisos de cuota, confirmación de compra y
> alertas de costo al admin.
> **Producción:** Resend (SMTP) sobre el dominio `auguriatarot.com`.

---

## Variables

| Variable | ¿Obligatoria? | Para qué |
| --- | --- | --- |
| `SMTP_HOST` | 🔴 sí en producción | Servidor SMTP (`smtp.resend.com`) |
| `SMTP_PORT` | 🔴 sí en producción | `587` (STARTTLS) o `465` (TLS implícito) |
| `SMTP_USER` | 🔴 sí en producción | Usuario SMTP (en Resend, el literal `resend`) |
| `SMTP_PASS` | 🔴 sí en producción | Password SMTP (en Resend, la API key `re_…`) |
| `EMAIL_FROM` | 🔴 sí en producción | Remitente (`noreply@auguriatarot.com`) |
| `FRONTEND_URL` | 🔴 sí en producción | Base de los links de los emails. **No puede ser localhost** |
| `EMAIL_REPLY_TO` | 🟡 opcional | Buzón que recibe las respuestas a `noreply@`. Sin ella, caen en `EMAIL_FROM`, donde nadie las lee |
| `ADMIN_EMAIL_COST_ALERTS` | 🟡 opcional | Destinatario de las alertas de costo de IA. Sin ella, las alertas se saltean con un warning |

---

## Comportamiento según el entorno

### 🔴 Producción — fail-fast (T-PROD-012)

Si **falta cualquiera** de las 5 variables SMTP, **la app no arranca**: el boot falla con un
error que nombra las variables faltantes.

Es deliberado. Antes, una configuración incompleta caía en silencio a `jsonTransport`: la app
levantaba **perfecta**, escribía un `logger.warn` que nadie lee, y **ningún email salía** — reset
de contraseña incluido, que es lo que deja a un usuario encerrado afuera de su cuenta. Un typo en
una variable de Railway era un incidente invisible hasta que un cliente reclamaba. Ahora falla
fuerte y temprano.

Lo mismo vale para `FRONTEND_URL`: en producción **debe** estar seteada y **no** puede apuntar a
localhost. Tiene default (`http://localhost:3001`), así que sin esta validación los links de todos
los emails salían apuntando a localhost sin un solo error en los logs.

### 🟢 Desarrollo y test — jsonTransport

Sin configuración SMTP completa, el módulo cae a **modo de prueba**:

- La app arranca normalmente y los tests pasan.
- Los emails se loguean en la consola, **no se envían**.
- Se emite un warning al arranque nombrando las variables que faltan.
- El `HandlebarsAdapter` **también** se configura en este modo, así una plantilla `.hbs` rota se
  detecta corriendo los tests y no en producción.

---

## Reply-To

El remitente es `noreply@`, pero mucha gente **responde igual**. Por eso el módulo setea
`replyTo` en los `defaults` del mailer: si `EMAIL_REPLY_TO` está seteada, la respuesta del cliente
aterriza en el buzón humano (`consultas@auguriatarot.com`); si no, cae a `EMAIL_FROM`.

---

## Setup local

Basta con **no** setear las variables SMTP: los emails se imprimen en la consola. Es lo que usan
los tests.

Si querés ver los emails renderizados de verdad, podés apuntar el SMTP a cualquier servicio de
captura (Mailtrap, MailHog) o a tu propia API key de Resend. En ese caso **deshabilitá las
credenciales cuando termines**: los tests de integración con SMTP real mandan mails a direcciones
inexistentes y acumulan hard bounces.

---

## ⚠️ El ciclo de calidad no prueba el envío real

Los tests unitarios corren desde `src/` (ts-jest), donde los `.hbs` **siempre** existen. Por eso
pasaban con un `dist/` sin una sola plantilla. **Cualquier cambio que toque emails debe probarse
contra el build** (`npm run build && node dist/src/main`) o directamente en el entorno desplegado.

---

## Referencias

- `src/modules/email/mailer.config.ts` — construcción de la config del mailer (fail-fast, replyTo)
- `src/modules/email/email.service.ts` — métodos de envío
- `src/modules/email/templates/` — plantillas Handlebars
- `src/config/env.validation.ts` — declaración y validación de las variables
