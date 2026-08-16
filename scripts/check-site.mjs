import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { languages, pages, site } from "../site.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codes = Object.keys(languages);
const errors = [];
const baseUrl = new URL(site.origin.replace(/\/+$/, "") + "/");

function fileFor(language, page) {
  return `${languages[language].path}${pages[page].route}index.html`;
}

function report(condition, message) {
  if (!condition) errors.push(message);
}

for (const language of codes) {
  for (const page of Object.keys(pages)) {
    const relative = fileFor(language, page);
    const filename = path.join(root, ...relative.split("/"));
    const html = await readFile(filename, "utf8");
    const langAttributes = [...html.matchAll(/\slang="([^"]+)"/g)].map((match) => match[1]);
    const allowedTag = languages[language].tag;

    report(langAttributes.every((tag) => tag === allowedTag || tag === language), `${relative}: foreign language remains in DOM`);
    report((html.match(/rel="canonical"/g) || []).length === 1, `${relative}: canonical missing or duplicated`);
    report((html.match(/hreflang=/g) || []).length === codes.length + 1, `${relative}: hreflang set incomplete`);
    report(!html.includes("data-title-"), `${relative}: multilingual title attributes remain`);
    report(html.includes('name="twitter:card" content="summary_large_image"'), `${relative}: Twitter large card missing`);
    report(html.includes('property="og:image:width" content="1200"'), `${relative}: Open Graph dimensions missing`);
    report(page !== "home" || html.includes('"@type": "SoftwareApplication"'), `${relative}: SoftwareApplication JSON-LD missing`);

    const documentDirectory = path.dirname(filename);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1];
      if (/^(?:[a-z]+:|\/\/|#)/i.test(value)) continue;
      const localPath = value.split(/[?#]/)[0];
      if (!localPath) continue;
      try {
        await access(path.resolve(documentDirectory, localPath));
      } catch {
        errors.push(`${relative}: broken local reference ${value}`);
      }
    }
  }
}

// ── Kiebitz Plus ────────────────────────────────────────────────────────────
// Die Kauf- und Kontoseiten leben von ihren Zuständen: Fehlt einer im HTML,
// bleibt die Seite im Ernstfall leer, weil das Skript nur ein- und ausblendet.
const plusRequirements = {
  plus: [
    'data-plus-signin',
    'data-plus-view="form"',
    'data-plus-view="sent"',
    'data-plus-view="signed-in"',
    'data-plus-message="signin"',
    'class="plus-matrix"'
  ],
  plusAccount: [
    'data-plus-account',
    'data-plus-view="loading"',
    'data-plus-view="signed-out"',
    'data-plus-view="error"',
    'data-plus-view="free"',
    'data-plus-view="plus"',
    'data-plus-view="deleted"',
    'data-plus-action="checkout"',
    'data-plus-action="portal"',
    'data-plus-action="logout"',
    'data-plus-action="delete"',
    'data-plus-message="account"'
  ],
  plusSuccess: [
    'data-plus-success',
    'data-plus-view="waiting"',
    'data-plus-view="ready"',
    'data-plus-view="pending"',
    'data-plus-view="signed-out"',
    'kiebitz://open?page=settings'
  ]
};

for (const language of codes) {
  for (const [page, markers] of Object.entries(plusRequirements)) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    for (const marker of markers) {
      report(html.includes(marker), `${relative}: missing ${marker}`);
    }
    report(/<script src="[^"]*assets\/plus\.js" defer><\/script>/.test(html), `${relative}: plus.js not loaded`);
  }

  // Die Matrix nennt genau die elf Funktionen aus docs/KIEBITZ_PLUS.md.
  const plusPage = await readFile(path.join(root, ...fileFor(language, "plus").split("/")), "utf8");
  const rows = (plusPage.match(/<tr><th scope="row">/g) || []).length;
  report(rows === 11, `${fileFor(language, "plus")}: feature matrix has ${rows} rows, expected 11`);

  // Auf der Startseite ist Kiebitz Plus kaufbar, nicht „bald".
  const home = await readFile(path.join(root, ...fileFor(language, "home").split("/")), "utf8");
  report(!home.includes("plan-soon"), `${fileFor(language, "home")}: pricing still marks Plus as upcoming`);
  report(!home.includes("plan-veil"), `${fileFor(language, "home")}: pricing still veils the Plus features`);
  report(/href="[^"]*plus\/index\.html"/.test(home), `${fileFor(language, "home")}: pricing has no link to /plus/`);
}

// ── Vertragsbedingungen ─────────────────────────────────────────────────────
// Kaufen heißt einen Vertrag schließen: Die Bedingungen müssen aus jedem Footer
// erreichbar sein und unmittelbar neben dem Kauf-Aufruf stehen — zusammen mit
// der Datenschutzerklärung, weil beides zur selben Entscheidung gehört.
const purchaseCalls = {
  home: "plan-cta",
  plus: "plus-form",
  plusAccount: 'data-plus-action="checkout"'
};

for (const language of codes) {
  const termsFile = fileFor(language, "terms");
  const terms = await readFile(path.join(root, ...termsFile.split("/")), "utf8");
  // Widerruf (t8) und Kündigung (t7) sind die Abschnitte, auf die die
  // Kaufhinweise verweisen · fehlen sie, laufen diese Links ins Leere.
  for (const marker of ['id="t7"', 'id="t8"', "privacy/index.html", "impressum/index.html", "mailto:support@kiebitz.dev"]) {
    report(terms.includes(marker), `${termsFile}: missing ${marker}`);
  }

  for (const page of Object.keys(pages)) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    const footer = html.slice(html.indexOf('<footer class="foot">'));
    report(page === "terms" || /terms\/index\.html/.test(footer), `${relative}: footer does not link the terms`);
  }

  for (const [page, call] of Object.entries(purchaseCalls)) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    const callIndex = html.indexOf(call);
    const noticeIndex = html.indexOf('class="legal-note"', callIndex);
    const nearby = callIndex !== -1 && noticeIndex !== -1 && noticeIndex - callIndex < 4000;
    report(nearby, `${relative}: no contract notice next to the purchase call to action`);
    const notice = nearby ? html.slice(noticeIndex, html.indexOf("</p>", noticeIndex)) : "";
    report(
      /terms\/index\.html/.test(notice) && /privacy\/index\.html/.test(notice),
      `${relative}: purchase notice must link the terms and the privacy policy`
    );
  }
}

// Die Browsersitzung ist ein HttpOnly-Cookie · sie darf niemals durch
// JavaScript laufen, und schreibende Aufrufe brauchen den CSRF-Kopf.
const plusScript = await readFile(path.join(root, "assets", "plus.js"), "utf8");
report(plusScript.includes('credentials: "include"'), "assets/plus.js: browser calls must send the session cookie");
report(plusScript.includes('"X-Kiebitz-CSRF"'), "assets/plus.js: writing calls must send the CSRF header");
report(!plusScript.includes("localStorage"), "assets/plus.js: session state must never touch localStorage");

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
// Konto- und Rückkehrseite stehen bewusst nicht im Index und nicht im Sitemap.
const indexablePages = Object.entries(pages).filter(([, config]) => !config.noindex);
report((sitemap.match(/<url>/g) || []).length === codes.length * indexablePages.length, "sitemap.xml: URL count is wrong");
for (const [page] of Object.entries(pages)) {
  for (const language of codes) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    const noindex = html.includes('name="robots" content="noindex');
    report(noindex === Boolean(pages[page].noindex), `${relative}: robots directive does not match the page config`);
    report(sitemap.includes(`<loc>${new URL(relative.replace(/index\.html$/, ""), baseUrl).href}</loc>`) !== Boolean(pages[page].noindex), `${relative}: sitemap membership does not match the page config`);
  }
}
report(sitemap.includes(new URL("sitemap.xml", baseUrl).origin), "sitemap.xml: site origin missing");

const socialImage = await readFile(path.join(root, ...site.socialImage.split("/")));
report(socialImage.toString("ascii", 1, 4) === "PNG", `${site.socialImage}: not a PNG file`);
report(socialImage.readUInt32BE(16) === 1200 && socialImage.readUInt32BE(20) === 630, `${site.socialImage}: expected 1200×630 pixels`);

await access(path.join(root, "dist", "server", "index.js"));
await access(path.join(root, "dist", "client", "index.html"));
await access(path.join(root, "dist", "client", "assets", "og-kiebitz.png"));
await access(path.join(root, "dist", "client", "desktop-ad", "index.html"));
const campaignConfig = JSON.parse(await readFile(
  path.join(root, "dist", "client", "desktop-ad", "campaigns.json"),
  "utf8"
));
report(campaignConfig.version === 1, "desktop ad campaign schema version is wrong");
report(Array.isArray(campaignConfig.campaigns), "desktop ad campaigns must be an array");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${codes.length * Object.keys(pages).length} localized pages, metadata, and local links.`);
}
