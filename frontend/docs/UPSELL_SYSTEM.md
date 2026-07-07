# Sistema de Upsell — Guía de Uso

> 🎯 **Propósito:** unificar el lenguaje visual de todos los puntos de conversión a
> Premium bajo los **tokens de marca dorados** (`secondary`, `#d69e2e`), coherente con el
> rediseño del circuito premium (T-PREM-007). Documento creado en **T-FBK-002**.
> 📅 **Última actualización:** 6-jul-2026

---

## 🎨 Lenguaje visual único (tokens de marca)

**Regla dura:** ningún punto de conversión usa clases crudas `purple/pink/violet/fuchsia`.
El circuito premium quedó en **dorado (`secondary`)** tras T-PREM-007.

| Elemento | Token / clase canónica |
|----------|------------------------|
| Icono de acento premium | `text-secondary` |
| Círculo de icono (modales) | `bg-secondary/15` + icono `text-secondary` |
| Caja de beneficios / contenedor | `border border-secondary/40 bg-secondary/10` |
| CTA principal | `<Button>` por defecto (token `primary`) + `focus-visible:ring-secondary/50` |
| Banner prominente (fondo de color) | `bg-gradient-to-r from-primary to-secondary` + botón blanco `text-primary` |
| Badge "Premium" | `bg-secondary text-bg-hero` |

> ⚠️ El texto lavanda de marca (`text-primary`, `#805ad5`) y el ámbar (`amber-*`) siguen
> siendo válidos como acentos secundarios; lo prohibido es la clase **cruda** `purple/pink`.

---

## 🧩 Cuándo usar cada forma

El sistema tiene **una base común** (`PremiumUpsellCard`) y un conjunto de **formas
específicas legítimas** (modal, banner, sección, badge, overlay). No todo converge a la
tarjeta: cada forma responde a un momento de conversión distinto.

### 1. Tarjeta de upsell — `ui/premium-upsell-card.tsx` ⭐ base común

Bloque **inline y discreto** (icono + título + descripción + CTA `Link`). Es la invitación
"suave" que convive con otro contenido sin interrumpir.

- **Úsala cuando:** quieras invitar a Premium **dentro de un widget o sección** ya poblada
  (dashboard, listados) sin robar protagonismo.
- **Consumidores actuales:** `SacredEventsWidget`, `PersonalizedRitualsWidget`.
- **No la uses para:** bloqueos duros (límite alcanzado) ni CTAs de página completa.

```tsx
<PremiumUpsellCard
  title="Rituales personalizados para tu momento"
  description="Con Premium, analizamos tus lecturas para sugerirte rituales…"
  href={ROUTES.PREMIUM}
  ctaLabel={CTA_PREMIUM.UPSELL_SOFT}
/>
```

### 2. Banner prominente — `readings/UpgradeBanner.tsx`, `readings/FreeReadingUpgradeBanner.tsx`

Bloque **full-width con fondo de color** (`from-primary to-secondary`, texto blanco). Más
peso visual que la tarjeta; cierra una experiencia invitando a subir de plan.

- **Úsalo cuando:** el usuario **terminó** una acción (una lectura) y es buen momento para
  una invitación destacada, pero **no bloqueante**.
- `UpgradeBanner` dispara el flujo de pago (MercadoPago); `FreeReadingUpgradeBanner` navega a
  `/premium`.

### 3. Modal / diálogo — `conversion/LimitReachedModal.tsx`, `readings/UpgradeModal.tsx`, `readings/DailyLimitReachedModal.tsx`, `conversion/RegisterCTAModal.tsx`

Overlay **interruptivo**. Detiene el flujo para comunicar algo puntual (límite alcanzado,
detalle de beneficios + precio, invitación a registrarse).

- **Úsalo cuando:** necesitás **cortar el flujo** ante un evento (se agotó el cupo, el usuario
  intentó una acción premium). Requiere una decisión explícita (upgrade / cerrar).
- `DailyLimitReachedModal` es informativo para usuarios **Premium** que llegaron a su tope del
  día (no es upsell: comparte solo el lenguaje visual).

### 4. Sección de límite alcanzado — `readings/ReadingLimitReached.tsx`, `daily-reading/DailyCardLimitReached.tsx`, `daily-reading/AnonymousLimitReached.tsx`

`Card` **grande, in-place** que **reemplaza** el contenido cuando el usuario agotó su cupo
gratuito. Lista beneficios + CTA de upgrade (y acciones secundarias).

- **Úsala cuando:** el usuario Free/anónimo **no puede continuar** y hay que ocupar el espacio
  del contenido bloqueado con la propuesta de valor.
- Variante anónima → invita a **registrarse**; variante free → invita a **Premium**.

### 5. Overlay de vista previa — `conversion/PremiumPreview.tsx`

Envuelve contenido premium con **blur + overlay** y CTA de desbloqueo.

- **Úsalo cuando:** quieras **mostrar que existe** contenido premium (teaser) sin revelarlo.

### 6. Badge — `readings/PremiumBadge.tsx`

Marcador **inline** (`bg-secondary text-bg-hero`) para señalar features gated. No es un CTA.

- **Úsalo cuando:** necesites etiquetar un ítem/menú como "Premium".

### 7. Prompt polimórfico — `conversion/PremiumUpgradePrompt.tsx`

Componente con variantes `modal` / `inline` / `banner`; ya token-based. Útil cuando querés un
único punto de entrada configurable.

---

## 🗺️ Árbol de decisión rápido

```
¿El usuario puede seguir usando la app ahora mismo?
├── Sí, es una invitación no bloqueante
│   ├── ¿Dentro de un widget/sección poblada?  → PremiumUpsellCard (base común)
│   ├── ¿Al cerrar una experiencia (post-lectura)? → UpgradeBanner / FreeReadingUpgradeBanner
│   └── ¿Solo marcar un feature como premium?   → PremiumBadge
└── No, se topó con un límite o feature gated
    ├── ¿Hay que cortar el flujo con una decisión? → Modal (LimitReached / Upgrade / RegisterCTA)
    ├── ¿Hay que reemplazar el contenido bloqueado? → Sección LimitReached
    └── ¿Mostrar un teaser difuminado?              → PremiumPreview
```

---

## ✅ Checklist al agregar un punto de conversión

- [ ] ¿Existe ya una forma que encaje? Reutilizá `PremiumUpsellCard` o el modal/banner existente.
- [ ] Solo tokens de marca: **cero** `purple/pink/violet/fuchsia` crudo.
- [ ] Copy del CTA desde `lib/constants/cta-copy.ts` (`CTA_PREMIUM.*`).
- [ ] Beneficios desde la fuente única `lib/constants/premium-benefits.ts` (ver T-FBK-005).
- [ ] Rutas desde `ROUTES` / endpoints centralizados.
- [ ] Texto user-facing en español y sin mención a "IA" (T-FBK-004).
