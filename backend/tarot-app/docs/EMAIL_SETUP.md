# TASK-016: Email Service - Configuración de Email

## Variables nuevas agregadas a .env.example

Las siguientes variables de entorno son **OPCIONALES** pero recomendadas para habilitar el envío de emails reales:

```bash
# -----------------------------------------------------------------------------
# Email Configuration (OPTIONAL - recommended for production)
# -----------------------------------------------------------------------------
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@tarotflavia.com
FRONTEND_URL=http://localhost:3000
```

## Comportamiento sin configuración

Si las variables de email **NO están configuradas**, el módulo funcionará en **modo de prueba (jsonTransport)**:

- ✅ La aplicación iniciará sin problemas
- ✅ Los tests pasarán correctamente
- ⚠️ Los emails se loguearán en consola pero NO se enviarán realmente
- ℹ️ Se mostrará un warning al iniciar indicando que está en modo de prueba

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

## Notas importantes

- ✅ Las variables de email son **opcionales** - no bloquean la aplicación ni los tests
- ⚠️ En producción, se recomienda configurar un servicio real de email (SendGrid, AWS SES, etc.)
- 📧 Para testing, Mailtrap.io es ideal ya que captura todos los emails sin enviarlos realmente
- 🔍 El módulo emitirá un warning si detecta configuración incompleta
