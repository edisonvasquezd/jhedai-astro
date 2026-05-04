# JhedAI — Sitio Web Corporativo

Sitio web de [JhedAI](https://jhedai.com), consultora de inteligencia artificial aplicada a la industria y gobierno en Chile.

## Stack

- **Framework**: Astro 5 + React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + CSS custom
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Animaciones**: Framer Motion
- **Deploy**: Cloudflare Workers (SSR) via `@astrojs/cloudflare`
- **Assets**: Cloudflare Images
- **API**: `https://jhedai-api.edison-985.workers.dev`

## URLs

| Entorno | URL |
|---------|-----|
| Producción (Workers) | https://jhedai-astro.edison-985.workers.dev |
| API | https://jhedai-api.edison-985.workers.dev |

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Dev server en localhost:4321
npm run build        # Build para producción
npm run preview      # Preview local del build
npx wrangler deploy  # Deploy a Cloudflare Workers
```

## Estructura

```
src/
├── components/
│   ├── 3d/              # Componentes Three.js (HeroTorus, MethodologyScene, etc.)
│   ├── sections/        # Secciones del home y páginas interiores
│   ├── BlogCard.tsx
│   └── Navbar.astro
├── layouts/
│   └── SiteLayout.astro
├── pages/               # Rutas Astro (index, blog, servicios, etc.)
├── styles/
│   └── global.css       # Variables, utilidades, animaciones
├── lib/
│   └── api.ts           # Cliente API blog
├── utils/
│   └── deviceDetection.ts
└── hooks/
    └── useInViewport.ts
public/
├── logos-partners/      # Logos del carrusel Hero
├── vision/              # Imágenes sección Visión Industrial
└── ...
```

## Performance

| Métrica | Mobile | Desktop |
|---------|--------|---------|
| Score | 87 | 77 |
| FCP | 0.3s | 0.3s |
| LCP | 1.1s | 1.0s |
| TBT | ~12s* | ~7.6s* |
| CLS | 0 | 0 |
| SEO | 100 | 100 |

*TBT elevado en desktop por Three.js ejecutando en main thread. En mobile, Three.js no se carga — se detecta UA server-side y se sirve fallback CSS.

## Decisiones de arquitectura

- **SSR con Cloudflare Workers**: todas las páginas se renderizan en el servidor para SEO óptimo
- **Detección UA server-side**: `index.astro` detecta mobile via User-Agent y no envía `three-vendor.js` (231 KB) a dispositivos móviles
- **client:idle para secciones below-fold**: reduce TBT al diferir hidratación de React hasta que el browser esté idle
- **Posts del home hardcodeados**: la sección Blog del home usa datos estáticos (sin llamada a API) para carga instantánea
