# Lighthouse Performance Optimization — jhedai-blog

**Date:** 2026-04-28  
**Branch:** feat/initial-setup  
**Goal:** Subir Performance de 70 → 90+, manteniendo Accessibility 95+, Best Practices 100, SEO 100.

---

## Contexto

El blog Astro 6 desplegado en `https://jhedai-blog.edison-985.workers.dev` obtiene Performance 70 en Lighthouse. Los issues principales son:

1. Server response time 1,660ms — `/blog` es SSR y hace fetch a la API externa en cada request sin cache efectiva
2. LCP image lazy loaded — la imagen del featured post llega con `loading="lazy"` porque `BlogCard.astro` lo hardcodea
3. Sin cache headers en assets estáticos `/_astro/*`
4. Color contrast insuficiente en algunos elementos (selectores por confirmar con Lighthouse)
5. Modern image formats — fuera de control (imágenes de API externa)

---

## Issue 1 — Cloudflare Cache API en middleware (mayor impacto)

### Problema
`/blog` ya emite `Cache-Control: public, s-maxage=900` pero el Worker ejecuta la página SSR completa (fetch a API externa) en cada request frío. En requests cacheados por Cloudflare CDN es rápido, pero el primer request por variante de URL (page, category) paga los 1,660ms.

### Solución
Crear `src/middleware.ts` que usa la **Cloudflare Cache API** (`caches.default`) para cachear el HTML completo de `/blog` y sus variantes.

**Flujo:**
```
GET /blog?page=1&category=ia
  → middleware.ts
  → caches.default.match(request)
    HIT  → return cached Response (~5ms)
    MISS → next() → Astro genera HTML
         → cache.put(request, response.clone(), { cf: { cacheTtl: 900 } })
         → return response
```

**Reglas de cache:**
- Solo `GET` requests
- Solo paths que empiezan con `/blog`
- Solo responses con `status === 200`
- TTL: 900 segundos (15 min) — consistente con el `s-maxage` existente
- Cache key = URL completa (cada combinación page+category se cachea por separado)
- El clone se hace antes de devolver la respuesta (stream single-read)

**Archivo a crear:** `src/middleware.ts`

```typescript
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  const shouldCache =
    request.method === "GET" && url.pathname.startsWith("/blog");

  if (!shouldCache) return next();

  // @ts-expect-error — caches is Cloudflare Workers global
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await next();

  if (response.status === 200) {
    const toCache = response.clone();
    context.locals.runtime?.waitUntil?.(cache.put(request, toCache));
  }

  return response;
});
```

**Nota sobre `waitUntil`:** Usar `waitUntil` para el `cache.put` es crítico — evita que el Worker cierre la conexión antes de que el put termine, sin bloquear el response al usuario.

---

## Issue 2 — LCP Image Fix

### Problema
`BlogCard.astro` tiene hardcodeado `loading="lazy"` en todas las imágenes. El featured post en `/blog` usa `BlogCard`, por lo que Lighthouse detecta la imagen LCP con lazy loading.

### Solución — dos cambios

**1. `src/components/BlogCard.astro`** — agregar props `loading` y `fetchpriority`:

```astro
---
interface Props {
  post: BlogPost;
  loading?: "lazy" | "eager";
  fetchpriority?: "auto" | "high" | "low";
}
const { post, loading = "lazy", fetchpriority = "auto" } = Astro.props;
---
<!-- En el <img>: -->
<img
  src={post.featured_image}
  alt={post.featured_image_alt || post.title}
  width="400"
  height="225"
  loading={loading}
  fetchpriority={fetchpriority}
  class="..."
/>
```

**2. `src/pages/blog/index.astro`** — pasar props al featured post y agregar preload en `<head>`:

```astro
<!-- Featured post card -->
<BlogCard post={featuredPost} loading="eager" fetchpriority="high" />

<!-- En el slot head del layout -->
{featuredPost?.featured_image && (
  <link rel="preload" as="image" href={featuredPost.featured_image} />
)}
```

**Condición del featured post:** Solo en page 1 sin filtro de categoría (`page === 1 && !category`).

---

## Issue 3 — Modern Image Formats

Las imágenes provienen de URLs externas (`jhedai-api.edison-985.workers.dev`). Sin Cloudflare Images (plan pago) no es posible transformarlas a WebP desde el frontend.

**Decisión:** Aceptar este issue en Lighthouse. Mitigación: asegurar que todos los `<img>` tengan `width` y `height` explícitos para eliminar CLS (Cumulative Layout Shift), que sí impacta Performance score.

---

## Issue 4 — Color Contrast

### Plan
1. Ejecutar Lighthouse en producción tras el deploy
2. Identificar selectores CSS con contraste insuficiente en el reporte
3. Ajustar en `src/styles/global.css` los colores afectados

**Candidatos probables** (sin correr Lighthouse):
- Texto sobre fondos con `text-jhedai-neutral` (#D0D3D4) — contraste muy bajo sobre blanco
- Badges de categoría con fondo claro + texto blanco
- Links en prose sobre fondo blanco

**Fix genérico:** Aumentar opacidad o cambiar tono. Para texto gris sobre blanco, subir a al menos `#767676` (ratio 4.5:1 mínimo WCAG AA).

---

## Issue 5 — Cache Headers en Assets Estáticos

### Problema
Los assets `/_astro/*` generados por Vite tienen hash en el nombre (inmutables), pero no tienen `Cache-Control: immutable`. Cloudflare los sirve sin cache agresiva.

### Solución
Crear `public/_headers` — Cloudflare Workers/Pages lo lee automáticamente y aplica los headers a los assets estáticos:

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.ico
  Cache-Control: public, max-age=86400

/favicon-*.png
  Cache-Control: public, max-age=86400

/logo-jhedai.png
  Cache-Control: public, max-age=86400
```

**Sin cambios en `wrangler.toml`** — el `_headers` file es suficiente y más portable.

---

## Archivos a crear / modificar

| Archivo | Acción | Issue |
|---|---|---|
| `src/middleware.ts` | Crear | 1 |
| `src/components/BlogCard.astro` | Modificar — agregar props `loading`, `fetchpriority` | 2 |
| `src/pages/blog/index.astro` | Modificar — pasar props al featured post + preload en head | 2 |
| `public/_headers` | Crear | 5 |
| `src/styles/global.css` | Modificar — fix colores tras Lighthouse | 4 |

---

## Verificación

1. `npm run build` — debe compilar sin errores TypeScript
2. `npx wrangler deploy` — deploy a `jhedai-blog.edison-985.workers.dev`
3. Primer request a `/blog` — verificar tiempo de respuesta (debe ser lento, ~1,600ms)
4. Segundo request a `/blog` — debe ser rápido (~5-50ms) — confirma cache hit
5. Verificar header `CF-Cache-Status: HIT` en DevTools → Network
6. Correr Lighthouse: `npx lighthouse https://jhedai-blog.edison-985.workers.dev/blog --only-categories=performance,accessibility,best-practices,seo`
7. Verificar Performance ≥ 90, LCP sin warning de lazy, Accessibility ≥ 95
8. Verificar assets `/_astro/*` tienen `Cache-Control: immutable` en DevTools
