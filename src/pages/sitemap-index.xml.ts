import type { APIRoute } from "astro";

interface SitemapPost {
  slug: string;
  updatedAt: string;
}

export const GET: APIRoute = async () => {
  let posts: SitemapPost[] = [];

  try {
    const res = await fetch(
      "https://jhedai-api.edison-985.workers.dev/api/sitemap-data",
    );
    if (res.ok) {
      const json = await res.json() as { data?: SitemapPost[] };
      posts = json.data ?? [];
    }
  } catch {
    // Si la API falla, el sitemap queda vacío — no es fatal
  }

  const urls = posts
    .map((post) => {
      const lastmod = new Date(post.updatedAt).toISOString().split("T")[0];
      return `  <url>
    <loc>https://jhedai.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
