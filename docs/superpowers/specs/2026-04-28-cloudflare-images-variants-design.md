# Cloudflare Images Variants — jhedai-blog

**Date:** 2026-04-28  
**Branch:** feat/initial-setup  
**Goal:** Reducir peso de imágenes (560 KiB estimado) usando variants WebP de Cloudflare Images para bajar LCP de 5.4s y subir Performance de 72 → ~90.

---

## Contexto

Las imágenes del blog provienen de Cloudflare Images con el variant `/public` (imagen original sin redimensionar ni convertir). Cloudflare Images ya tiene los variants `card` (400×225 WebP) y `featured` (640×360 WebP) creados y respondiendo 200 OK.

El cambio es reemplazar el sufijo `/public` por el variant correcto según el contexto de uso. Todo se hace en el frontend — cero cambios en la API ni en la base de datos.

**Estructura de URL de Cloudflare Images:**
```
https://imagedelivery.net/{account-hash}/{image-id}/{variant}
```

---

## Solución

Exportar una función `getImageUrl` desde `src/lib/api.ts` que reemplaza el variant en la URL. Llamarla en los tres lugares donde se muestran imágenes.

### Función auxiliar — `src/lib/api.ts`

```typescript
export type ImageVariant = "card" | "featured" | "public";

export function getImageUrl(
  url: string | undefined,
  variant: ImageVariant,
): string | undefined {
  if (!url) return undefined;
  // Reemplaza el último segmento de la URL (variant actual) por el nuevo
  return url.replace(/\/[^/]+$/, `/${variant}`);
}
```

**Robustez:** Si la URL no tiene el formato esperado (ej: no es de imagedelivery.net), el regex `/\/[^/]+$/` simplemente reemplaza el último segmento igual — no rompe nada. Si `url` es undefined, devuelve undefined y el fallback del componente muestra el placeholder "J".

---

## Uso por contexto

| Lugar | Variant | Razón |
|---|---|---|
| `BlogCard.astro` — cards del grid | `card` | 400×225px, miniatura |
| `index.astro` — featured post | `featured` | 640×360px, imagen destacada |
| `index.astro` — preload tag | `featured` | mismo que el featured post |
| `[slug].astro` — imagen principal del artículo | `featured` | 640×360px, hero image |
| `[slug].astro` — cards de posts relacionados | `card` | 400×225px, miniatura |

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/lib/api.ts` | Agregar `getImageUrl` y `ImageVariant` type |
| `src/components/BlogCard.astro` | Importar `getImageUrl`, usar variant `"card"` en `<img src>` |
| `src/pages/blog/index.astro` | Importar `getImageUrl`, usar `"featured"` en featured post img y preload |
| `src/pages/blog/[slug].astro` | Importar `getImageUrl`, usar `"featured"` en hero img, `"card"` en related cards |

---

## Lo que NO cambia

- La interfaz `BlogPost` — `featuredImage` sigue siendo la URL `/public` original
- La API Worker — ningún cambio
- La base de datos — ningún cambio
- El Schema.org JSON-LD en `[slug].astro` — usa `post.featuredImage` (URL original está bien para SEO)
- El Open Graph `og:image` en el layout — usa `post.featuredImage` o `post.ogImage` (original está bien para redes sociales, necesitan resolución alta)

---

## Verificación

1. `npm run build` — build exitoso sin errores TS
2. `npx wrangler deploy`
3. Abrir `/blog` — verificar que las imágenes se ven correctamente (misma visual, más rápido)
4. DevTools → Network → filter Img → verificar que las URLs terminan en `/card` y `/featured`
5. Correr Lighthouse: `npx lighthouse https://jhedai-blog.edison-985.workers.dev/blog --only-categories=performance,accessibility,best-practices,seo`
6. Verificar Performance ≥ 85, LCP < 2.5s
