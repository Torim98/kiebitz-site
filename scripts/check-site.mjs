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

// ── Kündigung und Widerruf ──────────────────────────────────────────────────
// Beide Seiten leben von ihren Zuständen: Fehlt einer im HTML, bliebe die
// Eingangsbestätigung leer, weil das Skript nur ein- und ausblendet. Und ohne
// den Weg aus jedem Footer wäre die Kündigungsschaltfläche nicht ständig
// verfügbar.
const legalRequirements = {
  cancel: [
    "data-legal-form",
    'data-legal-view="form"',
    'data-legal-view="received"',
    'data-legal-field="request-id"',
    'data-legal-field="received-at"',
    'data-legal-email="sent"',
    'data-legal-email="failed"',
    "data-legal-message",
    "data-legal-sending",
    'name="name"',
    'name="email"',
    'name="provider"',
    'name="contract_reference"',
    'name="cancellation_type"',
    'name="requested_end_mode"',
    'name="reason"',
    'value="stripe"',
    'value="google_play"',
    'value="unknown"',
    'value="ordinary"',
    'value="extraordinary"',
    'value="Kiebitz Plus"'
  ],
  withdraw: [
    "data-legal-form",
    'data-legal-view="form"',
    'data-legal-view="received"',
    'data-legal-field="request-id"',
    'data-legal-field="received-at"',
    'data-legal-email="sent"',
    'data-legal-email="failed"',
    "data-legal-message",
    "data-legal-sending",
    'name="name"',
    'name="email"',
    'name="provider"',
    'name="contract_reference"',
    'name="reason"',
    'value="Kiebitz Plus"'
  ]
};

for (const language of codes) {
  for (const [page, markers] of Object.entries(legalRequirements)) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    for (const marker of markers) {
      report(html.includes(marker), `${relative}: missing ${marker}`);
    }
    report(/<script src="[^"]*assets\/legal\.js" defer><\/script>/.test(html), `${relative}: legal.js not loaded`);
    // Ohne Anmeldung heißt ohne Anmeldung: kein Verweis auf eine Sitzung.
    report(!/data-plus-account|plus\.js/.test(html), `${relative}: must not depend on the account script`);
    report(/terms\/index\.html/.test(html) && /privacy\/index\.html/.test(html), `${relative}: form must link the terms and the privacy policy`);
  }

  // Der Weg zu beiden Erklärungen steht in jedem Footer.
  for (const page of Object.keys(pages)) {
    const relative = fileFor(language, page);
    const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
    const footer = html.slice(html.indexOf('<footer class="foot">'));
    const actions = footer.slice(footer.indexOf('class="foot-links-legal"'), footer.indexOf("</nav>"));
    report((actions.match(/foot-legal-action/g) || []).length === 2, `${relative}: footer must offer both legal actions`);
    // Auf der Seite selbst verkürzt der Build den Verweis auf „index.html“.
    report(page === "cancel" || /cancel\/index\.html/.test(actions), `${relative}: footer does not link the cancellation page`);
    report(page === "withdraw" || /withdraw\/index\.html/.test(actions), `${relative}: footer does not link the withdrawal page`);
    report(!["cancel", "withdraw"].includes(page) || /href="index\.html"/.test(actions), `${relative}: footer must keep the self-reference of the current legal action`);
  }
}

// Die deutschen Beschriftungen gibt das Gesetz vor · sie dürfen nicht driften.
const germanLabels = [
  ["cancel", "Verträge hier kündigen", "cancellation button label"],
  ["cancel", "jetzt kündigen", "confirmation button label"],
  ["withdraw", "Widerruf bestätigen", "withdrawal button label"],
  ["home", "Verträge hier kündigen", "footer cancellation label"],
  ["home", "Vertrag widerrufen", "footer withdrawal label"]
];
for (const [page, label, what] of germanLabels) {
  const relative = fileFor("de", page);
  const html = await readFile(path.join(root, ...relative.split("/")), "utf8");
  report(html.includes(`>${label}<`), `${relative}: ${what} must read “${label}”`);
}

// Vertragsbedingungen und Datenschutzerklärung führen zu den Erklärungen hin.
for (const language of codes) {
  const terms = await readFile(path.join(root, ...fileFor(language, "terms").split("/")), "utf8");
  const cancellationSection = terms.slice(terms.indexOf('id="t7"'), terms.indexOf('id="t8"'));
  const withdrawalSection = terms.slice(terms.indexOf('id="t8"'), terms.indexOf('id="t9"'));
  report(/cancel\/index\.html/.test(cancellationSection), `${fileFor(language, "terms")}: section 7 does not link the cancellation page`);
  report(/withdraw\/index\.html/.test(withdrawalSection), `${fileFor(language, "terms")}: section 8 does not link the withdrawal page`);

  const privacy = await readFile(path.join(root, ...fileFor(language, "privacy").split("/")), "utf8");
  const legalData = privacy.slice(privacy.indexOf('id="c9"'), privacy.indexOf('id="c10"'));
  report(legalData.length > 0, `${fileFor(language, "privacy")}: section 9 on cancellation and withdrawal is missing`);
  report(/cancel\/index\.html/.test(legalData) && /withdraw\/index\.html/.test(legalData), `${fileFor(language, "privacy")}: section 9 must link both forms`);
  report(/Resend/.test(legalData), `${fileFor(language, "privacy")}: section 9 must name the email processor`);
}

// Die Erklärungen laufen ohne Sitzung · schreibende Aufrufe brauchen den
// CSRF-Kopf, und gespeichert wird nichts im Browser.
const legalScript = await readFile(path.join(root, "assets", "legal.js"), "utf8");
report(legalScript.includes('credentials: "omit"'), "assets/legal.js: the forms must work without a session");
report(legalScript.includes('"X-Kiebitz-CSRF"'), "assets/legal.js: writing calls must send the CSRF header");
report(!legalScript.includes("localStorage"), "assets/legal.js: declarations must never touch localStorage");
report(legalScript.includes("/v1/contracts/cancellation"), "assets/legal.js: cancellation endpoint missing");
report(legalScript.includes("/v1/contracts/withdrawal"), "assets/legal.js: withdrawal endpoint missing");
report(legalScript.includes("legal_confirmation_failed"), "assets/legal.js: a stored declaration must survive a failed confirmation email");

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
