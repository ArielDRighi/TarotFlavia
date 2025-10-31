# TASK-016: Email Service - Variables de entorno requeridas

## Variables nuevas agregadas a .env.example

Las siguientes variables de entorno son ahora **REQUERIDAS** y deben agregarse al archivo `.env` local:

```bash
# -----------------------------------------------------------------------------
# Email Configuration (REQUIRED)
# -----------------------------------------------------------------------------
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@tarotflavia.com
FRONTEND_URL=http://localhost:3000
```

## Para desarrollo/testing local

Puedes usar [Mailtrap.io](https://mailtrap.io) (servicio gratuito de testing de emails):

1. Crea una cuenta en Mailtrap.io
2. Crea un nuevo inbox
3. Copia las credenciales SMTP
4. Agrégalas a tu archivo `.env`:

```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_username_de_mailtrap
SMTP_PASS=tu_password_de_mailtrap
EMAIL_FROM=noreply@tarotflavia.com
FRONTEND_URL=http://localhost:3000
```

## Notas

- Las variables de email son requeridas ahora en la validación de entorno
- Los tests E2E fallarán si estas variables no están configuradas
- Para producción, usar un servicio real de email (SendGrid, AWS SES, etc.)
