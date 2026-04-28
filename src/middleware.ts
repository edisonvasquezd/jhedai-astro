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

  // Use a cache key without Vary headers to ensure consistent matching
  const cacheKey = new Request(url.toString(), { method: "GET" });

  const cached = await cache.match(cacheKey);
  if (cached) {
    // Reconstruct response to avoid issues with consumed body streams
    const body = await cached.text();
    return new Response(body, {
      status: cached.status,
      headers: cached.headers,
    });
  }

  const response = await next();

  if (response.status === 200) {
    // Build a clean cacheable response without Transfer-Encoding issues
    const body = await response.text();
    const headers = new Headers(response.headers);
    // Ensure TTL is explicit for the Cache API (15 min)
    headers.set("Cache-Control", "public, s-maxage=900, stale-while-revalidate=900");

    const toCache = new Response(body, { status: 200, headers });
    context.locals.cfContext?.waitUntil(cache.put(cacheKey, toCache));

    return new Response(body, { status: 200, headers: response.headers });
  }

  return response;
});
