# Control de Acceso para Staging — Whitelist de Registro

**Fecha:** Abril 2026
**Estado:** ✅ Implementado
**Branch:** `feature/staging-whitelist-access-control`

---

## Objetivo

Restringir el acceso durante staging para que solo testers autorizados puedan registrarse, y opcionalmente deshabilitar el acceso anónimo para forzar el uso autenticado. Todo es reversible con variables de entorno sin tocar código.

---

## Variables de Entorno

### Backend (`backend/tarot-app/.env`)

```env
# === Staging access control ===

# Lista de emails permitidos para registro (separados por coma, sin espacios)
# Cuando tiene valor: solo esos emails pueden registrarse
# Cuando está vacía o no definida: registro abierto para todos (producción)
REGISTRATION_WHITELIST=tester1@gmail.com,tester2@gmail.com,tester3@gmail.com

# Habilitar/deshabilitar acceso anónimo al tarot
# false = el endpoint POST /public/daily-reading devuelve 403 (staging)
# true o no definida = acceso anónimo habilitado (producción)
ANONYMOUS_ACCESS_ENABLED=false
```

### Frontend (`frontend/.env.local`)

```env
# Solo indicadores — NO pasar la lista de emails al frontend por seguridad

# true = muestra aviso de restricción en /registro
# false o no definida = formulario de registro normal
NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=true

# false = redirige a /login cuando el acceso anónimo está deshabilitado
# true o no definida = acceso anónimo habilitado
NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=false
```

---

## Implementación

### Backend — Whitelist de registro

**Archivo:** `src/modules/auth/application/use-cases/register.use-case.ts`

Al inicio de `execute()`, antes de cualquier otra lógica:

```typescript
const whitelist = this.configService.get<string>('REGISTRATION_WHITELIST');
if (whitelist) {
  const allowedEmails = whitelist.split(',').map(e => e.trim().toLowerCase());
  if (!allowedEmails.includes(createUserDto.email.toLowerCase())) {
    throw new ForbiddenException(
      'El registro está restringido. Si creés que deberías tener acceso, contactá al administrador.'
    );
  }
}
```

- El check es **case-insensitive**
- Solo afecta al registro — login y refresh no están modificados
- `ConfigService` fue inyectado en el constructor del use case

### Backend — Acceso anónimo

**Archivo:** `src/modules/tarot/daily-reading/daily-reading.controller.ts`

En `DailyReadingPublicController.generateAnonymousDailyCard()`:

```typescript
const anonymousEnabled = this.configService.get<string>('ANONYMOUS_ACCESS_ENABLED');
if (anonymousEnabled === 'false') {
  throw new ForbiddenException('El acceso anónimo está deshabilitado en este entorno.');
}
```

- `ConfigService` fue inyectado en `DailyReadingPublicController`
- Solo afecta al endpoint `POST /public/daily-reading`
- El resto de endpoints de carta del día (autenticados) no están afectados

### Frontend — Aviso en /registro

**Archivo:** `src/app/registro/page.tsx`

Cuando `NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE === 'true'`, se muestra un `Alert` encima del formulario informando que el registro está limitado al equipo de testing.

Los errores 403 del backend ya se muestran automáticamente via `toast.error()` en `authStore.register()`, que extrae el `message` de la respuesta del API.

### Frontend — Acceso anónimo

**Archivo:** `src/components/features/daily-reading/DailyCardExperience.tsx`

Cuando `NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED === 'false'` y el usuario no está autenticado:
- Se renderiza un bloque de acceso restringido en lugar de la carta
- Botones de CTA hacia `/login` y `/registro` (no hay redirección automática)
- No se hace fetch al backend (los queries están deshabilitados con `enabled: false`)

---

## Escenarios de Testing

### Con whitelist activa

| Escenario | Resultado esperado |
|---|---|
| Registro con email en whitelist | ✅ Usuario creado |
| Registro con email NO en whitelist | ❌ 403 + mensaje claro en toast |
| Login con usuario existente | ✅ Funciona normalmente (no afectado) |
| Frontend muestra aviso de restricción | ✅ Alert visible en /registro |
| Error 403 se muestra en formulario | ✅ Toast con mensaje del backend |

### Con whitelist vacía/eliminada

| Escenario | Resultado esperado |
|---|---|
| Registro con cualquier email | ✅ Funciona normalmente |

### Con acceso anónimo deshabilitado

| Escenario | Resultado esperado |
|---|---|
| Carta del día sin login (frontend) | ❌ Muestra pantalla de acceso restringido con CTAs hacia /login y /registro |
| Carta del día sin login (API directa) | ❌ 403 del endpoint `/public/daily-reading` |
| Carta del día con login | ✅ Funciona normalmente |

### Con acceso anónimo habilitado

| Escenario | Resultado esperado |
|---|---|
| Carta del día sin login | ✅ Funciona como antes (1/día) |

---

## Configuración por Entorno

### Railway (staging)

```env
REGISTRATION_WHITELIST=email1@gmail.com,email2@gmail.com,email3@gmail.com
ANONYMOUS_ACCESS_ENABLED=false
NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=true
NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=false
```

### Producción

```env
REGISTRATION_WHITELIST=
ANONYMOUS_ACCESS_ENABLED=true
NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=false
NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=true
```

> **Nota:** Vaciar `REGISTRATION_WHITELIST` (o no definirla) abre el registro para todos. No es necesario cambiar código.

---

## Criterios de Aceptación

- [x] Whitelist funciona: emails permitidos pueden registrarse, otros reciben 403
- [x] El check es case-insensitive
- [x] Login no está afectado por la whitelist (solo registro)
- [x] Frontend muestra aviso cuando `NEXT_PUBLIC_REGISTRATION_WHITELIST_ACTIVE=true`
- [x] Errores 403 se muestran via toast con el mensaje del backend
- [x] Acceso anónimo se deshabilita con `ANONYMOUS_ACCESS_ENABLED=false`
- [x] Frontend muestra pantalla de acceso restringido con CTAs cuando `NEXT_PUBLIC_ANONYMOUS_ACCESS_ENABLED=false`
- [x] Todo es reversible con variables de entorno
- [x] Ningún código existente fue eliminado — solo condicionado
- [x] Variables documentadas en `.env.example`

---

**Relacionado:** `docs/DEPLOY_PREPARATION_CHECKLIST.md`, `docs/ADR_STAGING_DEPLOYMENT.md`
