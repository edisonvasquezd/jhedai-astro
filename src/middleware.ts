import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  const shouldCache =
    request.method === "GET" && url.pathname.startsWith("/blog");

  if (!shouldCache) return next();

  // caches.default is Cloudflare Workers Cache API global — unavailable in local Node.js dev
  // @ts-expect-error — caches is not typed in the Workers environment declarations
  const cache = caches.default as Cache;

  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await next();

  if (response.status === 200) {
    const toCache = response.clone();
    // cfContext.waitUntil keeps the Worker alive until cache.put completes
    context.locals.cfContext?.waitUntil(cache.put(request, toCache));
  }

  return response;
});
