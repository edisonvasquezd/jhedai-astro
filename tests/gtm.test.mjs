// Verifica la instalación de Google Tag Manager en el HTML compilado.
// Uso: npm run build && npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GTM_ID = "GTM-T2F7MJRN";
const ADS_ID = "AW-18147429663";
const DIST = fileURLToPath(new URL("../dist/client/", import.meta.url));

function htmlPages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlPages(path);
    return name.endsWith(".html") && !path.includes("/diagramas/") ? [path] : [];
  });
}

assert.ok(existsSync(DIST), "Falta dist/client — ejecuta `npm run build` primero");
const pages = htmlPages(DIST);

test("hay páginas compiladas", () => {
  assert.ok(pages.length > 10, `solo ${pages.length} páginas`);
});

for (const page of pages) {
  const rel = page.slice(DIST.length);
  const html = readFileSync(page, "utf8");
  const [head, rest = ""] = html.split("</head>");
  const body = rest.slice(rest.indexOf("<body"));

  test(`GTM correcto en ${rel}`, () => {
    // Script en <head>, una sola vez, antes del <title> y de gtag.js
    const snippet = `'dataLayer','${GTM_ID}'`;
    assert.equal(head.split(snippet).length - 1, 1, "snippet GTM en <head> (exactamente 1)");
    assert.equal(body.includes(snippet), false, "snippet GTM no debe estar en <body>");
    const gtmPos = head.indexOf("gtm.js");
    assert.ok(gtmPos < head.indexOf("<title"), "GTM debe ir antes del <title>");
    assert.ok(gtmPos < head.indexOf("gtag/js"), "GTM debe ir antes de gtag.js");

    // <noscript> como primer hijo del <body>
    assert.match(
      body,
      new RegExp(`^<body[^>]*>\\s*<!-- Google Tag Manager \\(noscript\\) -->\\s*<noscript><iframe src="https://www\\.googletagmanager\\.com/ns\\.html\\?id=${GTM_ID}"`),
    );

    // La etiqueta de Google Ads se mantiene
    assert.ok(head.includes(`gtag/js?id=${ADS_ID}`), "gtag.js de Google Ads");
    assert.ok(head.includes(`gtag('config', '${ADS_ID}')`), "config de Google Ads");
  });
}

test("el formulario de contacto empuja form_submit_contacto y la conversión de Ads", () => {
  const assets = join(DIST, "_astro");
  const bundle = readdirSync(assets).find((f) => /^ContactoContent\..+\.js$/.test(f));
  assert.ok(bundle, "bundle ContactoContent no encontrado");
  const js = readFileSync(join(assets, bundle), "utf8");
  assert.ok(js.includes('event:"form_submit_contacto"'), "evento dataLayer");
  assert.ok(js.includes(`${ADS_ID}/sYieCKDzsakcEJ-ar81D`), "conversión Google Ads");
});
