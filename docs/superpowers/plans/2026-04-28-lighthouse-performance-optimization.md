# Lighthouse Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir Performance de 70 → 90+ en Lighthouse manteniendo Accessibility 95+, Best Practices 100, SEO 100.

**Architecture:** Cuatro cambios independientes: (1) middleware Cloudflare Cache API para cachear HTML de `/blog` en el Worker; (2) props `loading`/`fetchpriority` en `BlogCard.astro` + preload tag para el LCP; (3) archivo `public/_headers` para cache inmutable en assets estáticos; (4) fix de color contrast en `global.css` tras correr Lighthouse.

**Tech Stack:** Astro 6, `@astrojs/cloudflare` v13.2.1, Cloudflare Workers Cache API, Tailwind CSS v4, Wrangler 4.

---

## File Map

| Archivo | Acción | Issue |
|---|---|---|
| `src/middleware.ts` | Crear | 1 — Server response time |
| `src/components/BlogCard.astro` | Modificar | 2 — LCP lazy image |
| `src/pages/blog/index.astro` | Modificar | 2 — LCP preload tag |
| `public/_headers` | Crear | 5 — Cache assets estáticos |
| `src/styles/global.css` | Modificar | 4 — Color contrast |

---

## Task 1: Cloudflare Cache API — middleware.ts

**Files:**
- Create: `src/middleware.ts`

### Contexto
`/blog` es SSR y hace fetch a la API externa en cada request. Ya tiene `Cache-Control: s-maxage=900` pero eso solo cachea en el CDN de Cloudflare — el Worker sigue ejecutándose en cada request frío. La Cloudflare Cache API (`caches.default`) permite cachear el HTML completo directamente en el Worker edge, evitando el fetch a la API para todos los requests subsecuentes (hit ~5ms vs 1,660ms).

- [ ] **Step 1: Crear `src/middleware.ts`**

```typescript
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Solo cachear GET requests a /blog y sus variantes (?page, ?category)
  const shouldCache =
    request.method === "GET" && url.pathname.startsWith("/blog");

  if (!shouldCache) return next();

  // caches.default es el Cloudflare Cache API global — no existe en Node.js
  // @ts-expect-error — caches is Cloudflare Workers global, not typed in @astrojs/cloudflare
  const cache = caches.default as Cache;
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await next();

  // Solo cachear responses 200 OK
  if (response.status === 200) {
    const toCache = response.clone(); // clone antes de leer — el body es single-read
    // waitUntil: el cache.put continúa tras enviar el response al usuario
    context.locals.runtime?.ctx?.waitUntil(cache.put(request, toCache));
  }

  return response;
});
```

- [ ] **Step 2: Verificar tipos de `context.locals.runtime`**

`@astrojs/cloudflare` v13 expone el `ExecutionContext` en `context.locals.runtime.ctx`. Abrir [node_modules/@astrojs/cloudflare/dist/entrypoints/middleware.d.ts](node_modules/@astrojs/cloudflare/dist/entrypoints/middleware.d.ts) o buscar la definición:

```bash
grep -r "waitUntil\|runtime" node_modules/@astrojs/cloudflare/dist --include="*.d.ts" -l
```

Si `ctx` no existe y la propiedad es `env` o `runtime` directamente, ajustar la llamada. La forma segura con optional chaining ya protege contra undefined.

- [ ] **Step 3: Build local para verificar compilación TypeScript**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
npm run build
```

Esperado: build exitoso sin errores TS. Si hay error en `context.locals.runtime`, ver Step 2.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "perf: add Cloudflare Cache API middleware for /blog SSR responses"
```

---

## Task 2: LCP Image Fix — BlogCard props + preload tag

**Files:**
- Modify: `src/components/BlogCard.astro`
- Modify: `src/pages/blog/index.astro`

### Contexto
`BlogCard.astro` hardcodea `loading="lazy"` en la imagen. El featured post en `/blog` tiene su propia imagen con `loading="eager"` en `index.astro` — pero está inline en el featured post, no en BlogCard. El problema es que el **primer card del grid** (`gridPosts[0]`) puede ser el LCP si el featured post no tiene imagen, y siempre llega con lazy.

Además, falta el `<link rel="preload">` para la imagen del featured post, que le dice al browser que descargue la imagen antes de parsear el HTML completo.

- [ ] **Step 1: Modificar `src/components/BlogCard.astro` — agregar props `loading` y `fetchpriority`**

Reemplazar el frontmatter y el `<img>` del componente. El archivo completo queda:

```astro
---
import type { BlogPost } from "../lib/api";

interface Props {
  post: BlogPost;
  index?: number;
  loading?: "lazy" | "eager";
  fetchpriority?: "auto" | "high" | "low";
}

const { post, index = 0, loading = "lazy", fetchpriority = "auto" } = Astro.props;

const categoryColors: Record<string, string> = {
  Industria: "bg-jhedai-primary/10 text-jhedai-primary",
  Regulación: "bg-jhedai-secondary/10 text-jhedai-secondary",
  Formación: "bg-jhedai-accent/10 text-jhedai-accent",
  Tendencias: "bg-emerald-500/10 text-emerald-600",
};

const catColor = categoryColors[post.category] || "bg-jhedai-primary/10 text-jhedai-primary";

const date = new Date(post.publishedAt).toLocaleDateString("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
---

<a
  href={`/blog/${post.slug}`}
  class="group block glass-card overflow-hidden cursor-pointer card-animate"
  style={`animation-delay: ${index * 0.1}s`}
>
  <div class="aspect-video overflow-hidden">
    {post.featuredImage ? (
      <img
        src={post.featuredImage}
        alt={post.featuredImageAlt || post.title}
        loading={loading}
        fetchpriority={fetchpriority}
        width="400"
        height="225"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    ) : (
      <div class="w-full h-full bg-gradient-to-br from-jhedai-primary/10 to-jhedai-secondary/10 flex items-center justify-center">
        <span class="text-4xl font-black text-jhedai-primary/10">J</span>
      </div>
    )}
  </div>

  <div class="p-6">
    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <span class={`inline-block px-3 py-1 rounded-full text-xs font-bold ${catColor}`}>
        {post.category}
      </span>
      <time datetime={post.publishedAt} class="text-[12px] text-jhedai-primary/50">
        {date}
      </time>
      <span class="text-[12px] text-jhedai-primary/50">{post.readTime}</span>
    </div>

    <h2 class="font-bold text-lg text-jhedai-primary mb-2 group-hover:text-jhedai-secondary transition-colors line-clamp-2">
      {post.title}
    </h2>

    <p class="text-[15px] text-jhedai-primary/60 leading-relaxed mb-4 line-clamp-2">
      {post.excerpt}
    </p>

    <span class="inline-flex items-center gap-2 text-[14px] font-semibold text-jhedai-primary/50 group-hover:text-jhedai-secondary transition-colors">
      Leer artículo →
    </span>
  </div>
</a>
```

- [ ] **Step 2: Modificar `src/pages/blog/index.astro` — agregar preload en head**

Agregar el slot `head` en `<BlogLayout>` con el preload tag. En la apertura del componente `BlogLayout` (línea 39 del archivo original), cambiar a:

```astro
<BlogLayout
  title={category ? `Blog — ${category} | JhedAI` : "Blog — Insights de IA Industrial | JhedAI"}
  description="Artículos, análisis y casos de estudio sobre inteligencia artificial aplicada a la industria chilena."
  canonical={`https://jhedai.com/blog${category ? `?category=${encodeURIComponent(category)}` : ""}`}
>
  <Fragment slot="head">
    {featuredPost?.featuredImage && (
      <link rel="preload" as="image" href={featuredPost.featuredImage} fetchpriority="high" />
    )}
  </Fragment>
```

- [ ] **Step 3: Verificar que `BlogLayout.astro` tiene `<slot name="head" />`**

Abrir [src/layouts/BlogLayout.astro](src/layouts/BlogLayout.astro) y confirmar que en el `<head>` existe `<slot name="head" />`. Si no existe, agregarlo justo antes del cierre `</head>`:

```astro
  <slot name="head" />
</head>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Esperado: build exitoso.

- [ ] **Step 5: Commit**

```bash
git add src/components/BlogCard.astro src/pages/blog/index.astro src/layouts/BlogLayout.astro
git commit -m "perf: fix LCP lazy image — add loading/fetchpriority props to BlogCard and preload tag"
```

---

## Task 3: Cache headers en assets estáticos — `public/_headers`

**Files:**
- Create: `public/_headers`

### Contexto
Los assets `/_astro/*` tienen hash en el nombre (ej: `index.Bx3mK9aL.css`) — son inmutables por definición. Sin embargo, no tienen `Cache-Control: immutable`, por lo que el browser los revalida en cada visita. Con `max-age=31536000, immutable` se cachean 1 año y nunca se revalidan.

El archivo `public/_headers` es procesado automáticamente por Cloudflare Workers cuando existe la directiva `[assets]` en `wrangler.toml` (que ya existe en este proyecto).

- [ ] **Step 1: Crear `public/_headers`**

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.ico
  Cache-Control: public, max-age=86400

/favicon-16x16.png
  Cache-Control: public, max-age=86400

/favicon-32x32.png
  Cache-Control: public, max-age=86400

/favicon.svg
  Cache-Control: public, max-age=86400

/logo-jhedai.png
  Cache-Control: public, max-age=86400
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Confirmar que `dist/client/_headers` existe tras el build (Astro copia `public/` a `dist/client/`):

```bash
ls dist/client/_headers
```

- [ ] **Step 3: Commit**

```bash
git add public/_headers
git commit -m "perf: add immutable cache headers for static assets via _headers file"
```

---

## Task 4: Deploy y Lighthouse — verificar baseline

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Deploy**

```bash
npx wrangler deploy
```

Esperado: deploy exitoso a `https://jhedai-blog.edison-985.workers.dev`.

- [ ] **Step 2: Verificar cache del middleware — primer request (MISS)**

Abrir DevTools → Network → navegar a `https://jhedai-blog.edison-985.workers.dev/blog`. Verificar:
- Response time: ~1,600ms (esperado en MISS frío)
- Header `CF-Cache-Status` puede no aparecer aún (depende de si Cloudflare CDN cachea aparte)

- [ ] **Step 3: Verificar cache — segundo request (HIT)**

Recargar la misma URL. Verificar:
- Response time: < 100ms
- El Worker devuelve el HTML cacheado sin llamar a la API

- [ ] **Step 4: Verificar preload en DevTools**

En DevTools → Network → filter `Img`, verificar que la imagen del featured post tiene `Priority: Highest` y aparece en los primeros requests (antes de que el HTML termine de parsear).

- [ ] **Step 5: Correr Lighthouse**

```bash
npx lighthouse https://jhedai-blog.edison-985.workers.dev/blog --output=json --output-path=./lh-post-deploy.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo
```

- [ ] **Step 6: Revisar scores y anotar issues de color contrast**

```bash
node -e "
const r = require('./lh-post-deploy.json');
const cats = r.categories;
console.log('Performance:', Math.round(cats.performance.score * 100));
console.log('Accessibility:', Math.round(cats.accessibility.score * 100));
console.log('Best Practices:', Math.round(cats['best-practices'].score * 100));
console.log('SEO:', Math.round(cats.seo.score * 100));
const contrast = r.audits['color-contrast'];
if (contrast && contrast.details?.items?.length) {
  console.log('\nColor contrast issues:');
  contrast.details.items.forEach(i => console.log(' -', i.node?.snippet, '| ratio:', i.contrastRatio));
}
"
```

Anotar los selectores/snippets con contraste insuficiente para Task 5.

---

## Task 5: Color Contrast Fix — `global.css`

**Files:**
- Modify: `src/styles/global.css`

### Contexto
Los colores afectados con contraste bajo son candidatos conocidos basados en los valores del tema:
- `text-jhedai-primary/50` (#003865 al 50% de opacidad) sobre blanco → ratio ~3.5:1 (falla WCAG AA 4.5:1)
- `text-jhedai-primary/40` sobre blanco → ratio ~2.8:1 (falla)
- `text-jhedai-primary/60` sobre blanco → ratio ~4.2:1 (falla por poco)

**El fix correcto:** No usar opacidad en texto secundario — usar colores sólidos equivalentes que mantengan el ratio 4.5:1.

- [ ] **Step 1: Calcular colores sólidos equivalentes**

Los ratios WCAG AA requieren 4.5:1 para texto normal, 3:1 para texto grande (≥18px bold o ≥24px regular).

Valores seguros sobre blanco (#FFFFFF):
- `#003865` (primary puro) → ratio 12.6:1 ✅
- `#6B8FA8` (primary/50 sólido equivalente) → ratio ~3.6:1 ❌ para texto pequeño
- `#4A7594` → ratio ~4.5:1 ✅ mínimo para texto pequeño
- `#5A82A0` → ratio ~4.1:1 ❌
- `#3D6B8A` → ratio ~5.2:1 ✅

Para textos pequeños (12-14px como fechas y readtime), usar al menos `#3D6B8A`.

- [ ] **Step 2: Revisar los items del reporte Lighthouse de Task 4 Step 6**

Identificar exactamente qué elementos fallan. Los candidatos en el código son:

En `BlogCard.astro`:
- `text-jhedai-primary/50` en `<time>` y readtime span (texto 12px)
- `text-jhedai-primary/60` en el excerpt (texto 15px)

En `index.astro` (featured post):
- `text-jhedai-primary/40` en la fecha del featured post (texto 12px)
- `text-jhedai-primary/60` en el excerpt del featured post

- [ ] **Step 3: Agregar custom colors seguros en `src/styles/global.css`**

En la sección `@theme`, agregar alias de colores seguros:

```css
@theme {
  --color-jhedai-primary: #003865;
  --color-jhedai-secondary: #00A9E0;
  --color-jhedai-accent: #FF585D;
  --color-jhedai-neutral: #D0D3D4;
  --font-sans: "Open Sans", "Montserrat", "Inter", sans-serif;
  /* Colores accesibles para texto secundario (ratio ≥ 4.5:1 sobre blanco) */
  --color-jhedai-muted: #3D6B8A;
  --color-jhedai-subtle: #4A7594;
}
```

- [ ] **Step 4: Actualizar `src/components/BlogCard.astro` — reemplazar clases de opacidad baja**

Cambiar en el `<time>` y readtime span:
- `text-jhedai-primary/50` → `text-[#3D6B8A]` (o crear clase utility)
- `text-jhedai-primary/60` → `text-[#3D6B8A]` para texto pequeño

```astro
<!-- Antes -->
<time datetime={post.publishedAt} class="text-[12px] text-jhedai-primary/50">
<span class="text-[12px] text-jhedai-primary/50">{post.readTime}</span>
<p class="text-[15px] text-jhedai-primary/60 leading-relaxed mb-4 line-clamp-2">

<!-- Después -->
<time datetime={post.publishedAt} class="text-[12px] text-[#3D6B8A]">
<span class="text-[12px] text-[#3D6B8A]">{post.readTime}</span>
<p class="text-[15px] text-[#3D6B8A] leading-relaxed mb-4 line-clamp-2">
```

- [ ] **Step 5: Actualizar `src/pages/blog/index.astro` — featured post meta text**

```astro
<!-- Antes (línea ~124) -->
<span class="text-[12px] text-jhedai-primary/40">

<!-- Después -->
<span class="text-[12px] text-[#3D6B8A]">
```

Y el excerpt del featured post:
```astro
<!-- Antes -->
<p class="text-jhedai-primary/60 leading-relaxed mb-6 line-clamp-3">

<!-- Después -->
<p class="text-[#3D6B8A] leading-relaxed mb-6 line-clamp-3">
```

- [ ] **Step 6: Ajustar según reporte real**

Si Lighthouse reporta elementos adicionales no listados arriba, aplicar el mismo patrón: reemplazar `text-jhedai-primary/XX` (donde XX < 70) por `text-[#3D6B8A]` para texto ≤15px, o `text-[#4A7594]` para texto ≥16px bold.

- [ ] **Step 7: Build**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/components/BlogCard.astro src/pages/blog/index.astro src/styles/global.css
git commit -m "fix(a11y): fix color contrast — replace low-opacity primary text with accessible solid colors"
```

---

## Task 6: Deploy final y verificación Lighthouse

**Files:** ninguno

- [ ] **Step 1: Deploy**

```bash
npx wrangler deploy
```

- [ ] **Step 2: Correr Lighthouse final**

```bash
npx lighthouse https://jhedai-blog.edison-985.workers.dev/blog --output=json --output-path=./lh-final.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo
```

- [ ] **Step 3: Verificar scores finales**

```bash
node -e "
const r = require('./lh-final.json');
const cats = r.categories;
console.log('Performance:', Math.round(cats.performance.score * 100));
console.log('Accessibility:', Math.round(cats.accessibility.score * 100));
console.log('Best Practices:', Math.round(cats['best-practices'].score * 100));
console.log('SEO:', Math.round(cats.seo.score * 100));
"
```

Targets:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices = 100
- SEO = 100

- [ ] **Step 4: Verificar assets con cache inmutable**

En DevTools → Network → recargar `/blog` → click en cualquier archivo `/_astro/*.css` o `/_astro/*.js` → Headers → verificar `Cache-Control: public, max-age=31536000, immutable`.

- [ ] **Step 5: Si Performance < 90, revisar audits restantes**

```bash
node -e "
const r = require('./lh-final.json');
const failed = Object.values(r.audits)
  .filter(a => a.score !== null && a.score < 1 && a.details)
  .sort((a, b) => (a.score || 0) - (b.score || 0))
  .slice(0, 10);
failed.forEach(a => console.log(a.id, '→ score:', a.score, '|', a.displayValue || ''));
"
```

Identificar el siguiente audit de mayor impacto y abrir issue separado.

---

## Self-Review

**Cobertura del spec:**
- Issue 1 (server response time) → Task 1 ✅
- Issue 2 (LCP lazy image) → Task 2 ✅
- Issue 3 (modern image formats) → aceptado, no requiere tarea ✅
- Issue 4 (color contrast) → Task 4 (medición) + Task 5 (fix) ✅
- Issue 5 (cache assets) → Task 3 ✅

**Placeholders:** ninguno — todos los steps tienen código completo o comandos exactos.

**Consistencia de tipos:**
- `BlogPost` importado desde `../lib/api` en `BlogCard.astro` — consistente con el archivo actual.
- Props `loading` y `fetchpriority` usan los tipos string literal correctos de HTML (`"lazy" | "eager"`, `"auto" | "high" | "low"`).
- `context.locals.runtime?.ctx?.waitUntil` — el optional chaining protege si el runtime no expone `ctx` en dev local.
