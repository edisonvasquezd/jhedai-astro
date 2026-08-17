# Static Site + Auto-Deploy Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar `/` (home) y el blog completo a generación estática en build time, y disparar un rebuild automático de Cloudflare Pages cada vez que se publica, edita o elimina un post. El resto del sitio ya tiene `prerender = true` y no necesita cambios.

**Architecture:** El astro frontend pasa a `hybrid` mode — home y blog estáticos, contacto sigue en SSR. El backend `jhedai-api` llama un Deploy Hook de Cloudflare Pages después de cada mutación de post (create/update/delete), usando un secret `PAGES_DEPLOY_HOOK` almacenado en wrangler secrets.

**Tech Stack:** Astro 4 (hybrid output), @astrojs/cloudflare adapter, Cloudflare Pages Deploy Hooks, jhedai-api (Cloudflare Workers + Hono)

---

## Estado actual del sitio

| Página | Estado | Acción |
|---|---|---|
| `/` home | `prerender = false` — lee User-Agent del request para detección mobile | Migrar a estático, mover detección mobile al browser |
| `/blog` | `prerender = false` — lee query params `?category=X` | Migrar a estático, filtro client-side |
| `/blog/[slug]` | `getStaticPaths()` sin `prerender` explícito | Añadir `prerender = true` explícito |
| `/servicios`, `/nosotros`, `/metodologia`, `/ecosistema`, `/privacidad`, `/terminos` | Ya `prerender = true` | Sin cambios |
| `/contacto` | Ya `prerender = true` | Sin cambios (form va directo al worker via fetch) |

---

## Files Map

### jhedai-astro
| File | Action | Responsabilidad |
|---|---|---|
| `astro.config.mjs` | Modify | Cambiar a `output: 'hybrid'` |
| `src/pages/index.astro` | Modify | `prerender = true`, eliminar lectura de User-Agent, quitar prop `isMobile` |
| `src/components/3d/ParticleSphereLoader.tsx` | Modify | Añadir detección mobile con `getDeviceTier()` antes de montar la esfera |
| `src/pages/blog/index.astro` | Modify | `prerender = true`, fetch estático de todos los posts, filtro client-side |
| `src/pages/blog/[slug].astro` | Modify | Añadir `prerender = true` explícito, quitar Cache-Control manual |

### jhedai-backend
| File | Action | Responsabilidad |
|---|---|---|
| `src/routes/api.ts` | Modify | Añadir `PAGES_DEPLOY_HOOK` al `Env`, función `triggerDeploy()`, llamarla en create/update/delete |

---

## Nota sobre `/blog/index.astro` con categorías

Actualmente `/blog?category=X` es dinámico (query param). Con `prerender = true` las query params no funcionan en estático. **Decisión:** página `/blog` estática con todos los posts, filtro de categoría como interacción client-side (JS puro, sin navegación).

## Nota sobre detección mobile en el home

`index.astro` lee `Astro.request.headers.get("user-agent")` para no renderizar la esfera 3D en móviles. En estático no hay request. La solución: `ParticleSphereLoader` usa `getDeviceTier()` de `src/utils/deviceDetection.ts` (ya existe, ya corre en browser) para decidir si monta la esfera. El prop `isMobile` en `Hero` y `Methodology` se elimina del server — esos componentes pueden detectarlo client-side si lo necesitan.

---

## Task 0: Hacer `/` (home) estático — mover detección mobile al browser

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/3d/ParticleSphereLoader.tsx`

El home tiene `prerender = false` únicamente por esta línea:
```ts
const ua = Astro.request.headers.get("user-agent") ?? "";
const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
```
Ese `isMobile` se pasa a `<Hero>` y `<Methodology>` como prop, y se usa en el template para condicionar `<ParticleSphereLoader>`. La solución: mover esa lógica al browser usando `getDeviceTier()` que ya existe en `src/utils/deviceDetection.ts`.

- [ ] **Step 1: Actualizar `ParticleSphereLoader.tsx` para detectar mobile internamente**

Reemplaza el contenido completo del archivo:

```tsx
import { useEffect, useState, lazy, Suspense } from "react";
import { getDeviceTier } from "../../utils/deviceDetection";

const ParticleSphere = lazy(() => import("./ParticleSphere"));

const ParticleSphereLoader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const tier = getDeviceTier();
    if (tier === "mobile") return;

    const id = requestIdleCallback
      ? requestIdleCallback(() => setMounted(true), { timeout: 3000 })
      : setTimeout(() => setMounted(true), 1500);

    return () => {
      if (requestIdleCallback) cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <ParticleSphere />
    </Suspense>
  );
};

export default ParticleSphereLoader;
```

- [ ] **Step 2: Actualizar `index.astro` — quitar lectura de User-Agent y prop `isMobile`**

Reemplaza el frontmatter completo (líneas 1-48) con:

```astro
---
export const prerender = true;

import SiteLayout from "../layouts/SiteLayout.astro";
import Hero from "../components/sections/Hero";
import ServiceGrid from "../components/sections/ServiceGrid";
import Methodology from "../components/sections/Methodology";
import AgentesAutonomos from "../components/sections/AgentesAutonomos";
import VisionIndustrial from "../components/sections/VisionIndustrial";
import AcademiaJhedai from "../components/sections/AcademiaJhedai";
import DeepLab from "../components/sections/DeepLab";
import NosotrosSimple from "../components/sections/NosotrosSimple";
import Blog from "../components/sections/Blog";
import Assessment from "../components/sections/Assessment";
import ParticleSphereLoader from "../components/3d/ParticleSphereLoader";

const canonical = "https://jhedai.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JhedAI",
  url: "https://jhedai.com",
  logo: "https://jhedai.com/logo-jhedai.png",
  description: "Consultora de inteligencia artificial aplicada a la industria y gobierno en Chile.",
  address: { "@type": "PostalAddress", addressCountry: "CL" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "contacto@jhedai.com" },
  sameAs: [
    "https://www.linkedin.com/company/jhedai/",
    "https://www.instagram.com/jhedai_com/",
    "https://www.youtube.com/channel/UCtBghUFTLLCdpnbRDt9tFRA",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JhedAI",
  url: "https://jhedai.com",
  potentialAction: { "@type": "SearchAction", target: "https://jhedai.com/blog?q={search_term_string}", "query-input": "required name=search_term_string" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: "https://jhedai.com" }],
};
---
```

En el template, quita el prop `isMobile` de `<Hero>` y `<Methodology>`:

```astro
<Hero client:visible />
...
<Methodology client:idle />
```

Y quita la condición SSR de `ParticleSphereLoader` (la detección ya está dentro del componente):

```astro
<ParticleSphereLoader client:only="react" />
```

- [ ] **Step 3: Verificar que Hero y Methodology aceptan el prop como opcional**

Busca en `src/components/sections/Hero.tsx` y `Methodology.tsx` si `isMobile` es requerido. Si lo es, marcarlo como opcional (`isMobile?: boolean`) con un default interno usando `getDeviceTier()`.

```powershell
Select-String -Path "C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-astro/src/components/sections/Hero.tsx" -Pattern "isMobile"
Select-String -Path "C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-astro/src/components/sections/Methodology.tsx" -Pattern "isMobile"
```

- [ ] **Step 4: Build local**

```powershell
cd C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-astro
npm run build
```

Esperado: build exitoso, `/` generado como HTML estático.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/index.astro src/components/3d/ParticleSphereLoader.tsx
git commit -m "feat: prerender home page, move mobile detection to browser"
```

---

## Task 1: Configurar output hybrid en Astro

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Cambiar output a hybrid**

Edita `astro.config.mjs` — agrega `output: 'hybrid'` dentro de `defineConfig`:

```js
export default defineConfig({
  output: 'hybrid',           // ← agregar esta línea
  adapter: cloudflare(),
  integrations: [react(), criticalCSSIntegration()],
  // ... resto igual
});
```

- [ ] **Step 2: Verificar que el build no rompe**

```powershell
cd C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-astro
npm run build
```

Esperado: build exitoso. Si hay errores de tipo SSR en páginas que no son blog, investiga antes de continuar.

- [ ] **Step 3: Commit**

```powershell
git add astro.config.mjs
git commit -m "feat: switch to hybrid output for static blog generation"
```

---

## Task 2: Hacer `/blog/[slug].astro` completamente estático

**Files:**
- Modify: `src/pages/blog/[slug].astro`

El archivo ya tiene `getStaticPaths()` que llama `getAllSlugs()`. Solo hay que asegurarse de que `prerender = true` (en hybrid mode, el default para páginas con `getStaticPaths` es prerender, pero conviene ser explícito).

- [ ] **Step 1: Añadir prerender explícito**

Al inicio del frontmatter (línea 1, antes del primer import), agrega:

```astro
---
export const prerender = true;

import BlogLayout from "../../layouts/BlogLayout.astro";
// ... resto igual
```

- [ ] **Step 2: Eliminar el header Cache-Control manual** (líneas 22-25)

En estático no tiene efecto — Cloudflare Pages ya sirve con headers óptimos. Elimina:

```astro
Astro.response.headers.set(
  "Cache-Control",
  "public, s-maxage=3600, stale-while-revalidate=86400",
);
```

- [ ] **Step 3: Build y verificar que los slugs se generan**

```powershell
npm run build 2>&1 | Select-String "blog"
```

Esperado: líneas con rutas `/blog/[slug]` generadas para cada post.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/blog/[slug].astro
git commit -m "feat: prerender blog post pages at build time"
```

---

## Task 3: Hacer `/blog/index.astro` estático con filtro client-side

**Files:**
- Modify: `src/pages/blog/index.astro`

La página de índice actualmente lee query params (`?category=X&page=N`) en SSR. En estático, eso no es posible. La solución: generar una sola página `/blog` con todos los posts en el HTML, y usar JS client-side para filtrar/paginar.

- [ ] **Step 1: Reescribir el frontmatter para fetch estático**

Reemplaza todo el frontmatter (entre `---`) con:

```astro
---
export const prerender = true;

import BlogLayout from "../../layouts/BlogLayout.astro";
import BlogCard from "../../components/BlogCard.astro";
import { getPosts, getCategories, getImageUrl } from "../../lib/api";

// Fetch all posts at build time (max 100 — suficiente para años de contenido semanal)
const [{ data: posts }, categories] = await Promise.all([
  getPosts(1, 100),
  getCategories(),
]);

const featuredPost = posts.find((p) => p.featured) || null;
---
```

- [ ] **Step 2: Actualizar el template — quitar lógica de paginación y categorías dinámicas**

El template ya renderiza `posts` y `categories`. Necesitas:

1. Quitar el componente `<Pagination />` (ya no aplica con todos los posts en estático).
2. Agregar atributos `data-category` a cada card para el filtro JS.
3. Agregar un script client-side para el filtro.

Reemplaza la sección de category filters por:

```astro
<div class="flex flex-wrap justify-center gap-3 mb-12" id="category-filters">
  <button
    data-cat=""
    class="px-4 py-2 rounded-full text-[14px] font-medium transition-all bg-jhedai-primary text-white active-cat"
    onclick="filterCat(this, '')"
  >
    Todos
  </button>
  {categories.map((cat) => (
    <button
      data-cat={cat}
      class="px-4 py-2 rounded-full text-[14px] font-medium transition-all bg-jhedai-primary/5 text-[#3D6B8A] hover:bg-jhedai-primary/10"
      onclick={`filterCat(this, '${cat}')`}
    >
      {cat}
    </button>
  ))}
</div>
```

Reemplaza el grid de cards por (agrega `data-category` a cada item):

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="posts-grid">
  {gridPosts.map((post, i) => (
    <div data-category={post.category}>
      <BlogCard post={post} index={i} />
    </div>
  ))}
</div>
```

Quita `<Pagination ... />` y su import.

Agrega antes del cierre de `</BlogLayout>`:

```astro
<script>
  function filterCat(btn: HTMLButtonElement, cat: string) {
    document.querySelectorAll('#category-filters button').forEach((b) => {
      b.classList.remove('bg-jhedai-primary', 'text-white');
      b.classList.add('bg-jhedai-primary/5', 'text-[#3D6B8A]');
    });
    btn.classList.add('bg-jhedai-primary', 'text-white');
    btn.classList.remove('bg-jhedai-primary/5', 'text-[#3D6B8A]');

    document.querySelectorAll<HTMLElement>('#posts-grid [data-category]').forEach((el) => {
      el.style.display = !cat || el.dataset.category === cat ? '' : 'none';
    });
  }
  (window as Window & { filterCat: typeof filterCat }).filterCat = filterCat;
</script>
```

- [ ] **Step 3: Build y verificar**

```powershell
npm run build
```

Esperado: `/blog` generado como HTML estático, sin errores de SSR.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/blog/index.astro
git commit -m "feat: static blog index with client-side category filter"
```

---

## Task 4: Agregar `PAGES_DEPLOY_HOOK` al Env del backend

**Files:**
- Modify: `C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-backend/src/routes/api.ts` (línea ~7)

- [ ] **Step 1: Crear el Deploy Hook en Cloudflare Pages**

1. Ir a Cloudflare Dashboard → Pages → `jhedai-astro` (o el nombre de tu proyecto Pages)
2. Settings → Builds & deployments → Deploy hooks
3. Crear hook: nombre `blog-publish`, branch `main`
4. Copiar la URL generada (tiene formato `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/XXXXX`)

- [ ] **Step 2: Agregar el secret al worker**

```powershell
cd C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-backend
npx wrangler secret put PAGES_DEPLOY_HOOK
```

Pegar la URL del hook cuando lo pida.

- [ ] **Step 3: Agregar `PAGES_DEPLOY_HOOK` al interface `Env`**

En `src/routes/api.ts` línea ~13, dentro del `interface Env`:

```ts
export interface Env {
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string;
  DB: D1Database;
  JHEDAI_CACHE: KVNamespace;
  RESEND_API_KEY?: string;
  API_KEY?: string;
  PAGES_DEPLOY_HOOK?: string;  // ← agregar
}
```

- [ ] **Step 4: Commit (solo el tipo, el secret no se commitea)**

```powershell
git add src/routes/api.ts
git commit -m "feat: add PAGES_DEPLOY_HOOK to Env interface"
```

---

## Task 5: Implementar `triggerDeploy()` y llamarla en mutaciones

**Files:**
- Modify: `C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-backend/src/routes/api.ts`

- [ ] **Step 1: Agregar la función `triggerDeploy` justo antes de `handleCreateBlogPost` (~línea 488)**

```ts
async function triggerDeploy(env: Env): Promise<void> {
  if (!env.PAGES_DEPLOY_HOOK) return;
  await fetch(env.PAGES_DEPLOY_HOOK, { method: 'POST' });
}
```

No hay que await la respuesta ni manejar errores — si el deploy falla, el post ya se guardó y el usuario puede publicar de nuevo. El deploy es best-effort.

- [ ] **Step 2: Llamar `triggerDeploy` en `handleCreateBlogPost`**

Localiza el `return corsResponse(...)` final de `handleCreateBlogPost` (~línea 538). Antes de ese return, agrega:

```ts
  await triggerDeploy(env);
  return corsResponse(...);
```

- [ ] **Step 3: Llamar `triggerDeploy` en `handleUpdateBlogPost`**

Mismo patrón: antes del `return corsResponse(...)` final de `handleUpdateBlogPost` (~línea 599):

```ts
  await triggerDeploy(env);
  return corsResponse(...);
```

- [ ] **Step 4: Llamar `triggerDeploy` en `handleDeleteBlogPost`**

Antes del `return corsResponse(...)` final de `handleDeleteBlogPost` (~línea 625):

```ts
  await triggerDeploy(env);
  return corsResponse(...);
```

- [ ] **Step 5: Deploy del backend**

```powershell
cd C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-backend
npm run deploy
```

Esperado: worker actualizado en `jhedai-api.edison-985.workers.dev`.

- [ ] **Step 6: Commit**

```powershell
git add src/routes/api.ts
git commit -m "feat: trigger Cloudflare Pages rebuild on blog post mutations"
```

---

## Task 6: Deploy del frontend y verificación end-to-end

- [ ] **Step 1: Push del astro a su repositorio**

```powershell
cd C:/Users/Lenovo/.gemini/antigravity/scratch/jhedai-astro
git push origin fix/servicios-ssr-flash
```

O merge a main si está listo.

- [ ] **Step 2: Verificar que Cloudflare Pages hace el build estático**

En Cloudflare Dashboard → Pages → tu proyecto → ver el último deploy. Debe mostrar rutas `/blog/[slug]` generadas.

- [ ] **Step 3: Test del webhook**

Publicar o editar un post usando la API con X-API-Key. Verificar en Cloudflare Pages que se dispara un nuevo deploy automáticamente (~2 min después).

```powershell
# Ejemplo: editar un post para disparar el hook
$headers = @{ "X-API-Key" = "TU_API_KEY"; "Content-Type" = "application/json" }
$body = '{"title":"Test rebuild"}'
Invoke-RestMethod -Uri "https://jhedai-api.edison-985.workers.dev/api/blog/posts/TU_SLUG" -Method PUT -Headers $headers -Body $body
```

Esperado: nuevo deploy aparece en Pages dashboard en ~30 segundos.

- [ ] **Step 4: Verificar el blog en producción**

Abrir `https://jhedai.com/blog` — debe cargar instantáneo desde CDN. Abrir un post individual — mismo comportamiento.

---

## Resumen del flujo final

```
Tú (con X-API-Key) → PUT/POST/DELETE /api/blog/posts
  → jhedai-api guarda en D1 + invalida KV
  → llama PAGES_DEPLOY_HOOK (fire & forget)
    → Cloudflare Pages hace `astro build`
      → fetch al worker durante build (getAllSlugs, getPosts, getPost)
      → genera HTML estático para cada post
      → deploy ~2 min después
        → visitantes ven HTML estático desde CDN, cero latencia
```
