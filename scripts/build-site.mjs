import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { languages, pages, site } from "../site.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const posix = path.posix;
const languageCodes = Object.keys(languages);
const pageEntries = Object.entries(pages);
const baseUrl = new URL(site.origin.replace(/\/+$/, "") + "/");
const voidElements = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr"
]);

function routeFor(language, page) {
  return `${languages[language].path}${pages[page].route}`;
}

function outputFileFor(language, page) {
  return `${routeFor(language, page)}index.html`;
}

function absoluteUrl(language, page) {
  return new URL(routeFor(language, page), baseUrl).href;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function removeLanguageBootstrap(html) {
  return html.replace(
    /<script>\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*<\/script>\s*/,
    ""
  );
}

function keepOnlyLanguage(html, wantedLanguage) {
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g) || [];
  const output = [];
  let suppressedDepth = 0;

  for (const token of tokens) {
    if (!token.startsWith("<") || token.startsWith("<!--") || token.startsWith("<!")) {
      if (suppressedDepth === 0) output.push(token);
      continue;
    }

    const endMatch = token.match(/^<\/\s*([\w:-]+)/);
    if (endMatch) {
      if (suppressedDepth > 0) suppressedDepth -= 1;
      else output.push(token);
      continue;
    }

    const startMatch = token.match(/^<\s*([\w:-]+)/);
    if (!startMatch) {
      if (suppressedDepth === 0) output.push(token);
      continue;
    }

    const tagName = startMatch[1].toLowerCase();
    const selfClosing = token.endsWith("/>") || voidElements.has(tagName);

    if (suppressedDepth > 0) {
      if (!selfClosing) suppressedDepth += 1;
      continue;
    }

    if (tagName !== "html") {
      const langMatch = token.match(/\slang=["']([^"']+)["']/i);
      if (langMatch && langMatch[1].toLowerCase().split("-")[0] !== wantedLanguage) {
        if (!selfClosing) suppressedDepth = 1;
        continue;
      }
    }

    output.push(token);
  }

  if (suppressedDepth !== 0) {
    throw new Error(`Unbalanced localized markup while building ${wantedLanguage}`);
  }
  return output.join("");
}

function localizedMetadata(language, page) {
  const languageConfig = languages[language];
  const pageConfig = pages[page];
  const title = pageConfig.titles[language];
  const description = pageConfig.descriptions[language];
  const canonical = absoluteUrl(language, page);
  const socialImage = new URL(site.socialImage, baseUrl).href;
  const alternateLocales = languageCodes
    .filter((code) => code !== language)
    .map((code) => `<meta property="og:locale:alternate" content="${languages[code].ogLocale}">`)
    .join("\n");
  const alternates = languageCodes
    .map((code) => `<link rel="alternate" hreflang="${languages[code].tag}" href="${absoluteUrl(code, page)}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${absoluteUrl("en", page)}">`)
    .join("\n");

  const applicationJsonLd = page === "home"
    ? `\n<script type="application/ld+json">\n${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: site.name,
        url: canonical,
        description,
        inLanguage: languageConfig.tag,
        applicationCategory: "GameApplication",
        operatingSystem: "Windows, macOS, Linux, Android",
        isAccessibleForFree: true,
        downloadUrl: site.downloadUrl,
        installUrl: site.playStoreUrl,
        screenshot: ["insights", "repertoire", "puzzles", "study"].map(
          (name) => new URL(`assets/shots/${name}.png`, baseUrl).href
        ),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR"
        },
        sameAs: site.repository,
        license: `${site.repository}/blob/main/LICENSE`
      }, null, 2)}\n</script>`
    : "";

  // Konto- und Rückkehrseiten gehören keinem Suchindex: Sie zeigen nur den
  // Zustand einer Sitzung und wären für jeden anderen Besucher leer.
  const robots = pageConfig.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large";

  return `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#0e0e0d">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
${alternates}
<link rel="icon" href="__ICON_128__" type="image/png">
<link rel="apple-touch-icon" href="__ICON__">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kiebitz">
<meta property="og:locale" content="${languageConfig.ogLocale}">
${alternateLocales}
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${socialImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kiebitz · Local-first chess analysis">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${socialImage}">${applicationJsonLd}
`;
}

function rewriteDocumentShell(html, language, page) {
  const languageConfig = languages[language];
  html = html.replace(
    /<html\b[^>]*>/,
    `<html lang="${languageConfig.tag}" dir="${languageConfig.dir}" data-lang="${language}" data-page="${page}">`
  );
  html = html.replace(
    /<title>[\s\S]*?(?=<link rel="preload")/,
    localizedMetadata(language, page)
  );
  html = html.replace(
    /aria-label="Sprache · Language · Langue · Idioma · 语言 · भाषा · اللغة"/g,
    `aria-label="${languageConfig.languageLabel}"`
  );
  html = html.replace(/aria-label="Inhalt"/g, `aria-label="${languageConfig.contentsLabel}"`);
  html = html.replace(/aria-label="Notes"/g, `aria-label="${languageConfig.notesLabel}"`);
  html = html.replace(/\sdata-(placeholder|label)-(de|en|fr|es|zh|hi|ar)="[^"]*"/g, (match, kind, code) => (
    code === language ? match : ""
  ));
  return html;
}

function rewriteLocalReferences(html, language, page, outputRelativePath) {
  const sourceDirectory = posix.dirname(pages[page].source.replace("src/pages/", "").replace(/\.template$/, ""));
  const outputDirectory = `/${posix.dirname(outputRelativePath)}`.replace(/\/$/, "") || "/";
  const pageByOriginalPath = new Map([
    ["/index.html", "home"],
    ["/plus/index.html", "plus"],
    ["/plus/account/index.html", "plusAccount"],
    ["/plus/success/index.html", "plusSuccess"],
    ["/privacy/index.html", "privacy"],
    ["/impressum/index.html", "impressum"]
  ]);

  return html.replace(/\b(href|src)="([^"]+)"/g, (match, attribute, rawValue) => {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(rawValue)) return match;

    const suffixIndex = rawValue.search(/[?#]/);
    const rawPath = suffixIndex === -1 ? rawValue : rawValue.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? "" : rawValue.slice(suffixIndex);
    const sourcePath = posix.normalize(posix.join("/", sourceDirectory, rawPath));
    let targetPath;

    if (pageByOriginalPath.has(sourcePath)) {
      targetPath = `/${outputFileFor(language, pageByOriginalPath.get(sourcePath))}`;
    } else if (sourcePath.startsWith("/assets/")) {
      targetPath = sourcePath;
    } else {
      return match;
    }

    let relative = posix.relative(outputDirectory, targetPath);
    if (!relative) relative = posix.basename(targetPath);
    return `${attribute}="${relative}${suffix}"`;
  });
}

function injectResolvedIconPaths(html) {
  const icon128 = html.match(/(?:href|src)="([^"]*assets\/icon-128\.png)"/)?.[1];
  const icon = icon128?.replace("icon-128.png", "icon.png");
  if (!icon128 || !icon) throw new Error("Could not resolve generated icon paths");
  return html.replaceAll("__ICON_128__", icon128).replaceAll("__ICON__", icon);
}

async function buildPage(language, page, template) {
  const outputRelativePath = outputFileFor(language, page);
  let html = removeLanguageBootstrap(template);
  html = keepOnlyLanguage(html, language);
  html = rewriteDocumentShell(html, language, page);
  html = rewriteLocalReferences(html, language, page, outputRelativePath);
  html = injectResolvedIconPaths(html);
  html = html.replace(/[ \t]+$/gm, "");

  const outputPath = path.join(root, ...outputRelativePath.split("/"));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
}

function buildSitemap() {
  const groups = pageEntries.filter(([, config]) => !config.noindex).map(([page]) => languageCodes.map((language) => {
    const alternates = languageCodes
      .map((alternate) => `    <xhtml:link rel="alternate" hreflang="${languages[alternate].tag}" href="${absoluteUrl(alternate, page)}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl("en", page)}"/>`)
      .join("\n");
    return `  <url>\n    <loc>${absoluteUrl(language, page)}</loc>\n${alternates}\n  </url>`;
  }).join("\n")).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${groups}
</urlset>
`;
}

async function main() {
  for (const language of languageCodes.filter((code) => languages[code].path)) {
    await rm(path.join(root, language), { recursive: true, force: true });
  }

  // The desktop app embeds this deliberately small, self-contained surface.
  // Keep it outside the localized marketing pages so it never inherits the
  // website navigation, analytics, forms, or other unrelated functionality.
  await rm(path.join(root, "desktop-ad"), { recursive: true, force: true });
  await cp(path.join(root, "src", "desktop-ad"), path.join(root, "desktop-ad"), {
    recursive: true
  });

  const templates = new Map();
  for (const [page, pageConfig] of pageEntries) {
    templates.set(page, await readFile(path.join(root, ...pageConfig.source.split("/")), "utf8"));
  }

  for (const language of languageCodes) {
    for (const [page] of pageEntries) {
      await buildPage(language, page, templates.get(page));
    }
  }

  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /src/\nSitemap: ${new URL("sitemap.xml", baseUrl).href}\n`, "utf8");
  await writeFile(path.join(root, "sitemap.xml"), buildSitemap(), "utf8");
  await writeFile(path.join(root, ".nojekyll"), "", "utf8");

  const dist = path.join(root, "dist");
  const client = path.join(dist, "client");
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, "server"), { recursive: true });
  await mkdir(client, { recursive: true });

  for (const entry of [
    "index.html", "plus", "privacy", "impressum", "desktop-ad", "assets", "robots.txt", "sitemap.xml", ".nojekyll",
    ...languageCodes.filter((code) => languages[code].path)
  ]) {
    await cp(path.join(root, entry), path.join(client, entry), { recursive: true });
  }

  await writeFile(path.join(dist, "server", "index.js"), `const FILE_EXTENSION = /\\/[^/]+\\.[^/]+$/;

export default {
  async fetch(request, env) {
    if (!env.ASSETS) return new Response("Static asset binding unavailable", { status: 500 });
    const url = new URL(request.url);
    if (url.pathname.endsWith("/")) url.pathname += "index.html";
    else if (!FILE_EXTENSION.test(url.pathname)) url.pathname += "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }
};
`, "utf8");

  console.log(`Built ${languageCodes.length * pageEntries.length} localized pages for ${baseUrl.href}`);
}

await main();
