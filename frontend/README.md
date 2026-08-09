This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Guardarraíl de contenido indexable

`scripts/check-indexable-content.mjs` recorre el `sitemap.xml` de un host, mide las **palabras
propias** de cada URL (el texto que ve un crawler, menos el chrome de header + footer) y falla si
alguna baja del umbral. También sondea un slug inventado por cada ruta dinámica para detectar
**soft-404** (páginas de "no encontrado" que responden 200).

Existe porque la misma clase de bug —una página que trae su contenido por el cliente y sirve un
cascarón al crawler— se arregló cuatro veces y las cuatro se descubrieron midiendo a mano con
`curl`. Contexto completo en [docs/BACKLOG_SEO_ADSENSE_2026_08.md](../docs/BACKLOG_SEO_ADSENSE_2026_08.md).

```bash
# Producción, sitemap completo (178 URLs, ~1 min)
npm run check:indexable -- --base-url https://auguriatarot.com

# Muestreo estratificado: hasta 2 URLs por sección (cubre todas las secciones, ~30 URLs)
npm run check:indexable -- --base-url https://auguriatarot.com --sample 2

# Contra la imagen de Docker corriendo local
npm run check:indexable -- --base-url http://localhost:3099 --min-words 150
```

| Opción                  | Default               | Para qué                                            |
| ----------------------- | --------------------- | --------------------------------------------------- |
| `--base-url <url>`      | `NEXT_PUBLIC_APP_URL` | Host a medir                                        |
| `--min-words <n>`       | `120`                 | Umbral de palabras propias                          |
| `--sample <n>`          | —                     | Hasta n URLs por sección (sin él, sitemap completo) |
| `--full`                | ✔️                    | Modo completo explícito                             |
| `--chrome-route <ruta>` | `/admin`              | Ruta vacía contra la que se mide el chrome          |
| `--concurrency <n>`     | `6`                   | Requests en paralelo                                |
| `--timeout <ms>`        | `20000`               | Timeout por request                                 |
| `--no-soft-404`         | —                     | No sondear slugs inventados                         |
| `--json`                | —                     | Salida en JSON en vez de tabla                      |

**Exit code 1** si alguna URL queda por debajo del umbral, así que sirve tal cual en un script.

Detalles que importan:

- **El chrome se mide, no se hardcodea.** Se pide `/admin` (que para un visitante sin sesión
  renderiza solo header + footer) y ese conteo se resta de cada página. Al 9-ago-2026 daba 39
  palabras; si alguien agrega un link al menú, el guardarraíl no miente.
- **Todas las requests llevan cache-buster.** El edge de Railway cachea el HTML con
  `s-maxage=31536000`: sin `?cb=…` se mide la versión previa al deploy.
- **Las rutas dinámicas se infieren del sitemap** (un padre con ≥3 hijos es un `[slug]`), así que
  una sección nueva queda cubierta sin tocar el script.
- **Excepciones:** `RUTAS_EXENTAS` dentro del script, con el motivo escrito al lado. Hoy está
  vacía a propósito.
- **No es un gate de CI** (decisión de T-SEO-001): correrlo a mano después de un deploy o antes de
  pedirle a Google que reindexe.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
