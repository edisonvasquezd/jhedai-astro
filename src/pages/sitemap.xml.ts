import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const staticRoutes = [
    { loc: "https://jhedai.com/", priority: "1.0", changefreq: "weekly" },
    { loc: "https://jhedai.com/servicios", priority: "0.8", changefreq: "monthly" },
    { loc: "https://jhedai.com/nosotros", priority: "0.8", changefreq: "monthly" },
    { loc: "https://jhedai.com/metodologia", priority: "0.7", changefreq: "monthly" },
    { loc: "https://jhedai.com/ecosistema", priority: "0.7", changefreq: "monthly" },
    { loc: "https://jhedai.com/contacto", priority: "0.6", changefreq: "monthly" },
    { loc: "https://jhedai.com/blog", priority: "0.9", changefreq: "daily" },
    { loc: "https://jhedai.com/privacidad", priority: "0.3", changefreq: "yearly" },
    { loc: "https://jhedai.com/terminos", priority: "0.3", changefreq: "yearly" },
  ];

  const today = new Date().toISOString().split("T")[0];

  const urls = staticRoutes
    .map(
      (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
};
