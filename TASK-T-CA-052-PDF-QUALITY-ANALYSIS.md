# Análisis de Calidad — Branch `feature/T-CA-052-pdf-redesign`

> **Fecha:** Febrero 21, 2026
> **Rama:** `feature/T-CA-052-pdf-redesign`
> **Resultado general:** Correcciones **profesionales y robustas**. Se identifican 3 mejoras de calidad de código a aplicar antes del PR (no son parches — son dead code y type annotations incorrectas producto del último refactoring).

---

## 1. Commits analizados (6)

| Hash       | Descripción                                                       |
| ---------- | ----------------------------------------------------------------- |
| `2054af2d` | Embed DejaVu Sans font para símbolos astronómicos Unicode         |
| `184bd805` | Prevent cover footer de triggear página en blanco                 |
| `380bfdbc` | Flowing layout para secciones Big Three y planetas                |
| `b1f6d4a0` | Fix aspect grid overlapping con título y leyenda                  |
| `3f74c342` | Smooth gradient en portada (reemplaza corte abrupto de color)     |
| `bae14325` | Fix font asset outDir para coincidir con ruta de código compilado |

### Archivos modificados en la rama

| Archivo                        | Naturaleza del cambio                           |
| ------------------------------ | ----------------------------------------------- |
| `nest-cli.json`                | Asset copy config para fonts TTF al build       |
| `chart-pdf.service.ts`         | Rediseño completo del PDF (+1449 / -431 líneas) |
| `chart-pdf.service.spec.ts`    | Tests actualizados + nuevos edge cases          |
| `assets/fonts/DejaVuSans*.ttf` | Fuentes embebidas para Unicode                  |
| `docs/PDF_REDESIGN.md`         | Documentación técnica del rediseño              |

---

## 2. Veredicto por área de cambio

### ✅ PROFESIONAL — Sin acción requerida

| #   | Cambio                                                                                        | Justificación                                                                                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Font embedding (DejaVu Sans + nest-cli.json)**                                              | Enfoque correcto. `sourceRoot: "src"` genera `dist/src/` — verificado. `outDir: "dist/src"` en assets es exactamente donde `__dirname` resuelve en runtime. `path.join(__dirname, '../../assets/fonts')` es el patrón NestJS estándar para assets embebidos. |
| 2   | **Design tokens como constantes de módulo** (`COLORS`, `MARGIN`, `CONTENT_WIDTH`, `as const`) | Best practice completo. Elimina números mágicos y strings de color dispersos, garantiza inmutabilidad con `as const`.                                                                                                                                        |
| 3   | **Extracción de `validateInput()`**                                                           | Aplica SRP correctamente. La validación tiene su propia responsabilidad separada de la orquestación del documento.                                                                                                                                           |
| 4   | **Descomposición en métodos `render*()`**                                                     | El god-method original fue dividido en 9 métodos privados cohesivos. Cada uno tiene una única responsabilidad de renderizado.                                                                                                                                |
| 5   | **`checkPageBreak` para flowing layout**                                                      | Patrón estándar en PDFKit. Detecta desbordamiento antes de dibujar cada bloque de contenido.                                                                                                                                                                 |
| 6   | **Smooth gradient en portada**                                                                | Técnica correcta para PDFKit que no soporta gradientes nativamente: interpolación por bandas con `lerpColor`. No es un hack sino la solución estándar.                                                                                                       |
| 7   | **Page numbering event-based** (`doc.on('pageAdded', ...)`)                                   | **Solución definitiva al problema raíz.** El enfoque anterior (pasar `pageCount` manualmente) nunca cubría páginas añadidas por auto-breaks internos de PDFKit. El evento `pageAdded` es el mecanismo idiomático del framework y cubre el 100% de los casos. |
| 8   | **Chart wheel movido a página 2 (sección Distribución)**                                      | Correcto semánticamente: el gráfico pertenece con los datos que visualiza, no en la portada. La posición (columna derecha del área de Distribución) usa el espacio vacío de forma eficiente.                                                                 |
| 9   | **nest-cli.json `outDir: "dist/src"`**                                                        | VERIFICADO correcto. `ls dist/src/modules/birth-chart/assets/fonts/` confirma que DejaVuSans.ttf y DejaVuSans-Bold.ttf están en el path que `__dirname` resuelve en runtime.                                                                                 |

---

## 3. Mejoras de calidad identificadas (aplicar antes del PR)

> Estas NO son parches. Son **dead code** e **incorrecciones de tipo** introducidas como consecuencia natural del refactoring a page numbering event-based. El comportamiento del PDF es correcto; el código necesita limpieza.

---

### 🟡 MEJORA-1: Dead code — `addedPages` en tipos de retorno

**Archivo:** `chart-pdf.service.ts`  
**Severidad:** Media — interfaz de métodos engañosa

**Problema:**  
Con el cambio a `doc.on('pageAdded')`, los métodos `renderBigThreeEntry`, `renderPlanetPage` y `checkPageBreak` siguen retornando `{ y: number; addedPages: number }`, pero ningún caller usa `addedPages`:

```typescript
// ❌ addedPages retornado pero descartado silenciosamente en TODOS los callers
const result = this.renderBigThreeEntry(doc, entry.title, entry.sign, entry.text, flowY);
flowY = result.y; // addedPages ignorado

const check = this.checkPageBreak(doc, y, 80);
y = check.y; // addedPages ignorado
```

Esta interfaz confunde a quien lee el código: sugiere que hay que hacer algo con `addedPages`, cuando en realidad ya no existe ese concepto.

**Solución profesional:**  
Los métodos que sólo necesitan devolver la nueva posición Y deben retornar `number` directamente:

```typescript
// ✅ Simplificación correcta
private checkPageBreak(doc: PDFDocInstance, currentY: number, requiredSpace: number): number {
  if (currentY + requiredSpace > doc.page.height - MARGIN) {
    doc.addPage(); // pageAdded handler automáticamente renderiza el header
    return MARGIN + 10;
  }
  return currentY;
}

// Caller limpio:
y = this.checkPageBreak(doc, y, 80);
```

**Tareas:**

- [x] `checkPageBreak` → retorna `number` directamente (no objeto)
- [x] `renderBigThreeEntry` → retorna `number` (solo posición Y final)
- [x] `renderPlanetPage` → retorna `number` (solo posición Y final)
- [x] Actualizar los callers en `generatePDF` para aceptar `number`
- [x] Eliminar variables internas `addedPages` y `let addedPages = 0`

---

### 🟡 MEJORA-2: Type annotation incorrecta — `doc: typeof PDFDocument`

**Archivo:** `chart-pdf.service.ts` (15 ocurrencias)  
**Severidad:** Baja-Media — type safety semánticamente incorrecto

**Problema:**  
`typeof PDFDocument` es el **tipo del constructor** de la clase, no el tipo de una **instancia**. Los 15 métodos privados reciben instancias creadas con `new PDFDocument(...)` pero las anotan con el tipo del constructor:

```typescript
// ❌ typeof PDFDocument = constructor type, no instance type
private renderCoverPage(doc: typeof PDFDocument, input: PDFGenerationInput): void
```

Funciona sólo porque `noImplicitAny: false` en el tsconfig no fuerza esta verificación. Si en el futuro se activa `strict`, todos los métodos fallarían.

**Solución profesional:**  
Crear un type alias con `InstanceType<>` y usarlo en las 15 firmas:

```typescript
// ✅ Al inicio del archivo, bajo los design tokens
type PDFDocInstance = InstanceType<typeof PDFDocument>;

// ✅ En las firmas de los 15 métodos privados
private renderCoverPage(doc: PDFDocInstance, input: PDFGenerationInput): void
private renderPageHeader(doc: PDFDocInstance, pageNumber: number): void
// ... etc.
```

**Tareas:**

- [x] Agregar `type PDFDocInstance = InstanceType<typeof PDFDocument>` tras los design tokens
- [x] Reemplazar las 15 ocurrencias de `typeof PDFDocument` por `PDFDocInstance`
- [x] Verificar que `npm run build` sigue pasando

---

### 🟡 MEJORA-3: `renderSynthesisPage` sin protección de overflow

**Archivo:** `chart-pdf.service.ts`  
**Severidad:** Media — bug latente para usuarios Premium con síntesis largas

**Problema:**  
Todas las secciones que renderizan texto variable (Big Three, Planetas) usan `checkPageBreak`. `renderSynthesisPage` es el único método que no, y la síntesis IA puede ser muy larga:

```typescript
// ❌ Si aiSynthesis > ~600 chars, el texto se corta al llegar al margen inferior
private renderSynthesisPage(doc: PDFDocInstance, aiSynthesis: string): void {
  // ...header box fijo...
  doc.text(aiSynthesis, MARGIN, MARGIN + boxH + 25, {
    width: CONTENT_WIDTH,
    align: 'justify',
    lineGap: 5,
  });
  // Sin detección de desbordamiento
}
```

_Nota técnica:_ PDFKit continúa el texto dentro de la página actual pero no agrega páginas automáticamente para texto que desborda.

**Solución profesional:**  
Dividir el texto en párrafos y aplicar `checkPageBreak` antes de cada uno:

```typescript
// ✅ Flowing synthesis con page breaks automáticos
private renderSynthesisPage(doc: PDFDocInstance, aiSynthesis: string, startY: number): number {
  let y = startY;
  const boxH = 55;
  // ...render header box...
  y += boxH + 20;

  const paragraphs = aiSynthesis.split(/\n\n+/).filter(Boolean);
  for (const para of paragraphs) {
    const estimatedH = doc.heightOfString(para, { width: CONTENT_WIDTH, lineGap: 5 });
    y = this.checkPageBreak(doc, y, estimatedH + 15);
    doc.fontSize(11).font('MainFont').fillColor(COLORS.textPrimary)
       .text(para, MARGIN, y, { width: CONTENT_WIDTH, align: 'justify', lineGap: 5 });
    y = doc.y + 12;
  }
  return y;
}
```

**Tareas:**

- [x] Refactorizar `renderSynthesisPage` para recibir `startY: number` y retornar `number`
- [x] Implementar loop de párrafos con `checkPageBreak`
- [x] Actualizar el caller en `generatePDF` para pasar `MARGIN + 5` como `startY`
- [x] Agregar test: síntesis > 1500 caracteres genera ≥ 1 más página que sin síntesis (ya cubierto por el test existente de premium)

---

## 4. Lo que NO es problema (evaluado y descartado)

| Ítem                                                         | Resultado                                                                                                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ELEMENT_COLORS: Record<string, string>` con keys en español | ✅ Aceptable. Los keys coinciden exactamente con `el.name` del modelo de datos. Refactorizar a enum requeriría cambiar la capa de dominio sin beneficio. |
| `path.join(__dirname, '../../assets/fonts')`                 | ✅ Correcto. Verify: `dist/src/modules/birth-chart/assets/fonts/` existe y tiene ambos TTF.                                                              |
| Mocks en tests sin `any`                                     | ✅ Los mocks usan tipos explícitos correctos.                                                                                                            |
| Gradient con bucle de bandas                                 | ✅ Es la solución estándar para PDFKit. No hay API nativa de gradientes.                                                                                 |
| `nest-cli.json outDir: "dist/src"`                           | ✅ Verificado correcto (ver sección 2 ítem 9).                                                                                                           |

---

## 5. Estado de ejecución

- [x] MEJORA-1: Dead code `addedPages` eliminado
- [x] MEJORA-2: Type alias `PDFDocInstance` aplicado (15 ocurrencias)
- [x] MEJORA-3: `renderSynthesisPage` con overflow protection
- [x] `npm run format`
- [x] `npm run lint`
- [x] `npm run test:cov` (coverage ≥ 80%)
- [x] `npm run build`
- [x] `node scripts/validate-architecture.js`
- [x] Commit y PR → `develop`
