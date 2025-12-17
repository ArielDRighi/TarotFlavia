# Pasos para Debugging del Login Error

## IMPORTANTE: Sigue estos pasos EXACTAMENTE

### 1. Ejecuta el frontend

```bash
npm run dev
```

### 2. Abre el navegador

- Ve a http://localhost:3001/login
- **ANTES** de hacer nada, abre la consola del navegador:
  - Windows: F12 → pestaña "Console"
  - Mac: Cmd+Option+J

### 3. ⚠️ CRÍTICO: Activa "Preserve log"

- En la consola del navegador, busca la opción "Preserve log" (⚙️ settings icon)
- **MARCA LA CASILLA "Preserve log"** ✅
- Esto evita que los logs se borren cuando la página se recarga
- Sin esto, no podrás ver los logs porque desaparecen

### 4. Limpia la consola

- Haz clic en el ícono de 🚫 (Clear console) o presiona Ctrl+L

### 5. Intenta login con credenciales INCORRECTAS

- Email: `test@test.com`
- Password: `wrongpassword`
- Haz clic en "Iniciar Sesión"

### 6. INMEDIATAMENTE después del error

- **NO CIERRES LA CONSOLA**
- **NO REFRESQUES LA PÁGINA**
- Copia **TODOS** los mensajes que aparecen
- Deberías ver algo como:
  ```
  [LoginForm] onSubmit called with: { email: 'test@test.com' }
  [LoginForm] Calling login...
  [authStore.login] Login error: ...
  [LoginForm] Login failed: ...
  [LoginForm] Setting error message: ...
  [LoginForm] Setting isSubmitting to false
  ```

### 7. Busca mensajes adicionales

- Mira si hay mensajes de error ROJOS
- Mira si hay mensajes de navegación
- Mira si aparece algo como "Navigate to..." o "Redirecting..."

### 8. Copia y pega AQUÍ

- Copia TODOS los logs (incluso los que parezcan irrelevantes)
- Incluye también la pestaña "Network" si ves una petición a /api/auth/login

---

## ¿Qué estoy buscando?

- Ver si hay un router.push() o window.location que no esperamos
- Ver si AuthProvider está triggerando un re-render
- Ver si hay algún error de React que cause unmount
- Ver la secuencia exacta de eventos
