# Cloudflare Images Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el variant `/public` por `/card` y `/featured` en todas las imágenes del blog para reducir el LCP de 5.4s y subir Performance de 72 → ~90.

**Architecture:** Se agrega una función `getImageUrl(url, variant)` en `src/lib/api.ts` que reemplaza el último segmento de la URL de Cloudflare Images. Los componentes la importan y la usan en el punto de render — sin cambiar el tipo `BlogPost` ni la API.

**Tech Stack:** Astro 6, TypeScript strict, Cloudflare Images (imagedelivery.net), variants `card` (400×225 WebP) y `featured` (640×360 WebP) ya creados.

---

## File Map

| Archivo | Acción |
|---|---|
| `src/lib/api.ts` | Agregar `ImageVariant` type y `getImageUrl` function (exportados) |
| `src/components/BlogCard.astro` | Importar `getImageUrl`, usar `"card"` en el `<img src>` |
| `src/pages/blog/index.astro` | Importar `getImageUrl`, usar `"featured"` en featured post img y preload |
| `src/pages/blog/[slug].astro` | Importar `getImageUrl`, usar `"featured"` en hero img, `"card"` en related cards |

---

## Task 1: Agregar `getImageUrl` en `src/lib/api.ts`

**Files:**
- Modify: `src/lib/api.ts` — agregar al final del archivo, antes del cierre

- [ ] **Step 1: Agregar el type y la función al final de `src/lib/api.ts`**

Abrir [src/lib/api.ts](src/lib/api.ts). Al final del archivo (después de la función `getAllSlugs`), agregar:

```typescript
// --- Image variant helpers ---

export type ImageVariant = "card" | "featured" | "public";

export function getImageUrl(
  url: string | undefined,
  variant: ImageVariant,
): string | undefined {
  if (!url) return undefined;
  // Replace last path segment (current variant) with the requested variant
  return url.replace(/\/[^/]+$/, `/${variant}`);
}
```

- [ ] **Step 2: Build para verificar TypeScript**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
npm run build
```

Esperado: `[build] Complete!` sin errores TS.

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
git add src/lib/api.ts
git commit -m "feat: add getImageUrl helper for Cloudflare Images variant selection"
```

---

## Task 2: Aplicar variant `card` en `BlogCard.astro`

**Files:**
- Modify: `src/components/BlogCard.astro`

### Contexto
`BlogCard.astro` muestra imágenes de 400×225px en el grid. El variant `card` sirve exactamente ese tamaño en WebP. El `<img>` está en la línea 37 del componente.

- [ ] **Step 1: Importar `getImageUrl` en el frontmatter de `BlogCard.astro`**

En [src/components/BlogCard.astro](src/components/BlogCard.astro), cambiar la línea de import:

```astro
---
import type { BlogPost } from "../lib/api";
import { getImageUrl } from "../lib/api";
```

- [ ] **Step 2: Usar `getImageUrl` en el `<img src>`**

En el mismo archivo, cambiar el atributo `src` del `<img>`:

```astro
<!-- Antes -->
<img
  src={post.featuredImage}
  alt={post.featuredImageAlt || post.title}
  loading={loading}
  fetchpriority={fetchpriority}
  width="400"
  height="225"
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>

<!-- Después -->
<img
  src={getImageUrl(post.featuredImage, "card")}
  alt={post.featuredImageAlt || post.title}
  loading={loading}
  fetchpriority={fetchpriority}
  width="400"
  height="225"
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Esperado: `[build] Complete!` sin errores.

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
git add src/components/BlogCard.astro
git commit -m "perf: use card variant (400x225 WebP) in BlogCard images"
```

---

## Task 3: Aplicar variant `featured` en `src/pages/blog/index.astro`

**Files:**
- Modify: `src/pages/blog/index.astro`

### Contexto
El featured post en `/blog` muestra una imagen grande (640×360px). Hay dos lugares a actualizar:
1. El `<img>` del featured post (línea ~103 del archivo actual)
2. El `<link rel="preload">` en el slot head (agregado en la sesión anterior)

- [ ] **Step 1: Agregar `getImageUrl` al import en el frontmatter**

En [src/pages/blog/index.astro](src/pages/blog/index.astro), cambiar la línea de import:

```astro
import { getPosts, getCategories, getImageUrl } from "../../lib/api";
```

- [ ] **Step 2: Actualizar el `<img>` del featured post**

Buscar el bloque del featured post con la imagen (dentro del `{featuredPost && (...)}`, en el div `lg:min-h-[320px]`). Cambiar el `src`:

```astro
<!-- Antes -->
<img
  src={featuredPost.featuredImage}
  alt={featuredPost.featuredImageAlt || featuredPost.title}
  loading="eager"
  fetchpriority="high"
  width="640"
  height="360"
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
/>

<!-- Después -->
<img
  src={getImageUrl(featuredPost.featuredImage, "featured")}
  alt={featuredPost.featuredImageAlt || featuredPost.title}
  loading="eager"
  fetchpriority="high"
  width="640"
  height="360"
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
/>
```

- [ ] **Step 3: Actualizar el preload tag en el slot head**

Buscar el `<Fragment slot="head">` al inicio del template. Cambiar el `href` del preload:

```astro
<Fragment slot="head">
  {featuredPost?.featuredImage && (
    <link rel="preload" as="image" href={getImageUrl(featuredPost.featuredImage, "featured")} fetchpriority="high" />
  )}
</Fragment>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Esperado: `[build] Complete!` sin errores.

- [ ] **Step 5: Commit**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
git add src/pages/blog/index.astro
git commit -m "perf: use featured variant (640x360 WebP) for featured post image and preload"
```

---

## Task 4: Aplicar variants en `src/pages/blog/[slug].astro`

**Files:**
- Modify: `src/pages/blog/[slug].astro`

### Contexto
Hay dos lugares en este archivo:
1. **Hero image del artículo** (línea ~167): imagen grande del post, usar `"featured"`
2. **Related articles** (línea ~248): usa `<BlogCard>` que ya tiene el variant `"card"` aplicado en Task 2 — no necesita cambio adicional

Solo hay que actualizar la hero image.

- [ ] **Step 1: Agregar `getImageUrl` al import**

En [src/pages/blog/[slug].astro](src/pages/blog/[slug].astro), cambiar la línea de import:

```astro
import { getPost, getRelatedPosts, getAllSlugs, getImageUrl } from "../../lib/api";
```

- [ ] **Step 2: Actualizar el `<img>` hero del artículo**

Buscar el bloque `{post.featuredImage && (...)}` con el div `rounded-2xl overflow-hidden aspect-video` (alrededor de línea 165). Cambiar el `src`:

```astro
<!-- Antes -->
{post.featuredImage && (
  <div class="rounded-2xl overflow-hidden aspect-video mb-10 shadow-lg">
    <img
      src={post.featuredImage}
      alt={post.featuredImageAlt || post.title}
      loading="eager"
      fetchpriority="high"
      width="768"
      height="432"
      class="w-full h-full object-cover"
    />
  </div>
)}

<!-- Después -->
{post.featuredImage && (
  <div class="rounded-2xl overflow-hidden aspect-video mb-10 shadow-lg">
    <img
      src={getImageUrl(post.featuredImage, "featured")}
      alt={post.featuredImageAlt || post.title}
      loading="eager"
      fetchpriority="high"
      width="768"
      height="432"
      class="w-full h-full object-cover"
    />
  </div>
)}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Esperado: `[build] Complete!` sin errores.

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
git add src/pages/blog/[slug].astro
git commit -m "perf: use featured variant (640x360 WebP) for article hero image"
```

---

## Task 5: Deploy y verificación Lighthouse

**Files:** ninguno

- [ ] **Step 1: Deploy**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
npx wrangler deploy
```

Esperado: `Deployed jhedai-blog triggers` con URL `https://jhedai-blog.edison-985.workers.dev`.

- [ ] **Step 2: Verificar URLs de imágenes en el browser**

Abrir `https://jhedai-blog.edison-985.workers.dev/blog` → DevTools → Network → filter `Img`.

Verificar que las URLs de imagen terminan en `/card` (cards del grid) y `/featured` (featured post). No deben aparecer URLs con `/public`.

- [ ] **Step 3: Correr Lighthouse**

```bash
cd "c:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-blog"
npx lighthouse https://jhedai-blog.edison-985.workers.dev/blog --output=json --output-path=./lh-images.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo
```

- [ ] **Step 4: Leer scores**

```bash
node -e "
const r = require('./lh-images.json');
const cats = r.categories;
console.log('Performance:    ', Math.round(cats.performance.score * 100));
console.log('Accessibility:  ', Math.round(cats.accessibility.score * 100));
console.log('Best Practices: ', Math.round(cats['best-practices'].score * 100));
console.log('SEO:            ', Math.round(cats.seo.score * 100));
const lcp = r.audits['largest-contentful-paint'];
const sr = r.audits['server-response-time'];
console.log('LCP:', lcp?.displayValue);
console.log('Server response:', sr?.displayValue);
const img = r.audits['uses-responsive-images'];
console.log('Responsive images savings:', img?.displayValue || 'PASS');
"
```

Targets: Performance ≥ 85, LCP < 2.5s, `uses-responsive-images` sin savings significativos.

---

## Self-Review

**Cobertura del spec:**
- `getImageUrl` en `api.ts` → Task 1 ✅
- `BlogCard.astro` variant `card` → Task 2 ✅
- `index.astro` variant `featured` en img y preload → Task 3 ✅
- `[slug].astro` variant `featured` en hero → Task 4 ✅
- Related articles en `[slug].astro` → usan `BlogCard` que ya tiene `card` en Task 2 ✅
- Schema.org y OG tags no modificados (usan `post.featuredImage` original) → correcto por diseño ✅

**Placeholders:** ninguno.

**Consistencia de tipos:**
- `ImageVariant = "card" | "featured" | "public"` definido en Task 1, usado en Tasks 2, 3, 4 ✅
- `getImageUrl(url: string | undefined, variant: ImageVariant): string | undefined` — firma consistente en todos los usos ✅
- `post.featuredImage` (tipo `string | undefined`) — el `undefined` está manejado por `getImageUrl` que devuelve `undefined` y el `{post.featuredImage && (...)}` guard ya existe en los componentes ✅
