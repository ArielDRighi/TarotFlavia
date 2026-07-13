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

Las dos opcionales se pueden **dejar vacías** (`EMAIL_REPLY_TO=`) para desactivarlas: el string
vacío se trata como "sin valor", no como config inválida, y no rompe el arranque.

---

## Comportamiento según el entorno

### 🔴 Producción — fail-fast (T-PROD-012)

Si **falta cualquiera** de las 5 variables SMTP, **la app no arranca**: el boot falla con un
error que nombra **todas** las variables faltantes de una vez.

Es deliberado. Antes, una configuración incompleta caía en silencio a `jsonTransport`: la app
levantaba **perfecta**, escribía un `logger.warn` que nadie lee, y **ningún email salía** — reset
de contraseña incluido, que es lo que deja a un usuario encerrado afuera de su cuenta. Un typo en
una variable de Railway era un incidente invisible hasta que un cliente reclamaba. Ahora falla
fuerte y temprano.

Lo mismo vale para `FRONTEND_URL`: en producción **debe** ser una URL absoluta (con esquema) y
**no** puede apuntar a un host local. Tiene default (`http://localhost:3001`), así que sin esta
validación los links de todos los emails salían apuntando a localhost sin un solo error en los
logs; y una URL sin esquema (`www.auguriatarot.com`) los dejaría rotos igual de silenciosamente.

La validación vive en `validate()` (`src/config/env-validator.ts`), que corre en
`ConfigModule.forRoot` — es decir, **antes** de que TypeORM conecte y aplique las migraciones. Un
deploy con el email mal configurado muere **sin haber tocado la base**.

### 🟢 Desarrollo y test — jsonTransport

Sin configuración SMTP completa, el módulo cae a **modo de prueba**:

- La app arranca normalmente y los tests pasan.
- Los emails se loguean en la consola, **no se envían**.
- Se emite un warning al arranque nombrando las variables que faltan.
- El `HandlebarsAdapter` **también** se configura en este modo, así el dev local renderiza los
  `.hbs` de verdad en vez de solo serializarlos.

---

## 🧯 El guard de render (`email-templates.spec.ts`)

Los tests de `EmailService` mockean `MailerService`, así que **nadie compilaba un `.hbs`**: un
template roto, o un `{{placeholder}}` que el servicio dejó de pasar en el contexto, atravesaba todo
el ciclo de calidad y explotaba recién en producción.

`email-templates.spec.ts` monta el `MailerModule` **real** con `jsonTransport` y **renderiza los 8
templates** con el mismo contexto que les pasa `EmailService`. Handlebars corre con `strict: true`,
así que una variable faltante **rompe el test**. Si agregás un template o cambiás el contexto de uno
existente, sumalo ahí.

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
