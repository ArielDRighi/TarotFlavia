# Eliminación de Funcionalidad de Borrado de Lecturas

**Fecha:** 15 Enero 2026  
**Decisión:** Eliminar completamente la funcionalidad de borrado de lecturas del historial  
**Razón:** Bug persistente en actualización de UI después de implementar múltiples fixes

---

## 🔍 Contexto

### Problema Original

El bug BUG-F-001 reportaba que al eliminar una lectura del historial, la UI no se actualizaba inmediatamente:

1. Usuario hace clic en "Eliminar"
2. Aparece toast "Lectura eliminada exitosamente"
3. **Pero la tarjeta permanece visible** hasta refrescar manualmente

### Intentos de Solución

#### BUG-F-003: Ajustar staleTime (❌ Fallido)

- **Cambio:** Reducir `staleTime` de 5 minutos a 30 segundos en `useMyReadings`
- **Resultado:** Insuficiente - El problema persistió

#### BUG-F-004: Cambiar invalidateQueries a refetchQueries (❌ Fallido)

- **Cambio:** En todos los mutation hooks cambiar:

  ```typescript
  // Antes
  await queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });

  // Después
  await queryClient.refetchQueries({ queryKey: readingQueryKeys.all, type: "active" });
  ```

- **Archivos modificados:**
  - `useCreateReading()` - línea 135-155
  - `useDeleteReading()` - línea 160-175
  - `useRestoreReading()` - línea 255-270
- **Validación:**
  - ✅ Tests unitarios: 18/18 passing
  - ✅ Backend funciona correctamente (soft-delete exitoso)
  - ✅ Request network: `DELETE /readings/61 => 200 OK`
  - ✅ Refetch ejecutado: `GET /readings?page=1&limit=10 => 200 OK`
  - **❌ UI no se actualiza:** La tarjeta sigue visible después del refetch

### Validación E2E con Playwright

```
Usuario: testfinal@example.com
1. ✅ Crear lectura "El Loco" → Aparece en historial
2. ❌ Eliminar lectura → Toast "eliminada" pero tarjeta permanece visible
3. ✅ Backend confirmado: Segunda eliminación retorna error (ya eliminada)
```

**Conclusión:** El problema no es del backend ni de React Query, es un bug más profundo en la estrategia de cache/state management.

---

## 🗑️ Decisión: Eliminación Completa

Dado que:

- El fix de `refetchQueries` no funcionó después de rebuild + restart
- Usuario ya había decidido: "Tome la desicion de eliminar de la web el boton y la opcion de eliminar tarjetas"
- La funcionalidad de "soft-delete" sigue existiendo en backend (para futuras necesidades)

**Se procede a eliminar completamente la UI de eliminación.**

---

## 📋 Cambios Implementados

### 1. `ReadingsHistory.tsx`

**Archivo:** `frontend/src/components/features/readings/ReadingsHistory.tsx`

**Removido:**

- Import de `useDeleteReading`
- Hook `const { mutate: deleteReading } = useDeleteReading();`
- Función `handleDeleteReading`
- Prop `onDelete={handleDeleteReading}` en `<ReadingCard>`

**Líneas afectadas:** 9, 138-154, 354

---

### 2. `ReadingCard.tsx`

**Archivo:** `frontend/src/components/features/readings/ReadingCard.tsx`

**Removido:**

- Import de `Trash2` icon
- Import de `ConfirmationModal`
- Prop `onDelete` de interface `ReadingCardProps`
- Estado `showDeleteConfirmation`
- Handlers: `handleDeleteClick`, `handleConfirmDelete`
- Botón "Eliminar lectura"
- Modal `<ConfirmationModal>` de confirmación

**Cambios en sección de acciones:**

```tsx
// Antes
<div className="flex shrink-0 items-center gap-1">
  <Button onClick={handleViewClick}>Ver</Button>
  <Button onClick={handleDeleteClick}>Eliminar</Button>
</div>

// Después
<div className="flex shrink-0 items-center gap-1">
  <Button onClick={handleViewClick}>Ver</Button>
</div>
```

**Líneas afectadas:** 5, 13, 27, 63, 81-88, 155-172

---

### 3. Tests Actualizados

#### `ReadingCard.test.tsx`

**Archivo:** `frontend/src/components/features/readings/ReadingCard.test.tsx`

**Removido:**

- Mock `mockOnDelete`
- Prop `onDelete` de todos los `render(<ReadingCard>)`
- Tests de funcionalidad de eliminación:
  - "should render view and delete buttons"
  - "should open confirmation modal when delete button is clicked"
  - "should call onDelete with reading id when delete is confirmed"
  - "should not call onDelete when delete is cancelled"
  - "should close confirmation modal when cancelled"
- Referencias a botón eliminar en test de accesibilidad

**Resultados:** ✅ 16 tests passing (antes: 18 tests con delete)

---

#### `ReadingsHistory.test.tsx`

**Archivo:** `frontend/src/components/features/readings/ReadingsHistory.test.tsx`

**Removido:**

- Mock `mockDeleteReading`
- Setup de mock `useDeleteReading` en `beforeEach()`

**Resultados:** ✅ 20 tests passing (sin cambios en número de tests)

---

## ✅ Validación Final

### Tests

```bash
# ReadingCard.test.tsx
✓ 16 tests passing
  ✓ Rendering (7)
  ✓ Interactions (1)
  ✓ Responsive Design (1)
  ✓ Styling (2)
  ✓ Accessibility (2)
  ✓ Edge Cases (3)

# ReadingsHistory.test.tsx
✓ 20 tests passing
  ✓ Header (2)
  ✓ Loading State (1)
  ✓ Empty State (2)
  ✓ Readings List (1)
  ✓ Search Filter (3)
  ✓ Pagination (1)
  ✓ Spread Filter (5)
  ✓ View Toggle (3)
  ✓ Error State (2)
```

---

## 🎯 Estado Post-Eliminación

### ✅ Funcionalidad Mantenida en UI

- Ver lecturas en historial (list y grid view)
- Filtrar por fecha y tipo de tirada
- Buscar por pregunta
- Ver detalle de lectura
- Paginación

### ❌ Funcionalidad Removida de UI

- Botón "Eliminar" en ReadingCard
- Modal de confirmación de eliminación
- Toast de eliminación exitosa

### 🔧 Backend Intacto

El endpoint `DELETE /api/readings/:id` y toda la lógica de soft-delete permanecen funcionales por si en el futuro se necesita:

- Implementar papelera de reciclaje
- Admin panel con capacidad de eliminar
- API pública con eliminación

---

## 📊 Impacto

| Aspecto                            | Antes       | Después      | Estado          |
| ---------------------------------- | ----------- | ------------ | --------------- |
| Líneas de código (componentes)     | ~220        | ~190         | ✅ -13%         |
| Líneas de tests                    | ~530        | ~480         | ✅ -9%          |
| Tests de ReadingCard               | 18          | 16           | ✅ Pasan todos  |
| Tests de ReadingsHistory           | 20          | 20           | ✅ Pasan todos  |
| Complejidad del componente         | Media       | Baja         | ✅ Simplificado |
| UX ambigua (elimina pero no se ve) | ❌ Presente | ✅ Eliminada | ✅ Mejorada     |

---

## 🔮 Consideraciones Futuras

Si en el futuro se desea re-implementar eliminación:

1. Investigar por qué `refetchQueries` no fuerza actualización de UI
2. Considerar usar `setQueryData` manual después de mutación:
   ```typescript
   onSuccess: (_, deletedId) => {
     queryClient.setQueryData(readingQueryKeys.list(page, limit), (old) => ({
       ...old,
       data: old.data.filter((r) => r.id !== deletedId),
     }));
   };
   ```
3. Revisar si hay conflicto con Next.js App Router caching
4. Considerar implementar optimistic updates

---

## 📝 Comandos Ejecutados

```bash
# Tests
npm test -- ReadingCard.test --run     # ✅ 16/16 passing
npm test -- ReadingsHistory.test --run  # ✅ 20/20 passing

# Validación E2E (Playwright MCP)
- Crear usuario: testfinal@example.com
- Crear lectura: El Loco (Tirada de 1 Carta)
- Verificar aparece en historial: ✅
- Eliminar lectura: ❌ Bug persiste
```

---

## ✨ Conclusión

La eliminación de la funcionalidad de borrado **simplifica el código, elimina ambigüedad UX y mantiene tests en verde**, cumpliendo con la decisión del usuario de remover esta opción de la web. El backend permanece intacto por si se necesita en el futuro.

**Estado final:** ✅ Completado y validado
