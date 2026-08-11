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

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
report((sitemap.match(/<url>/g) || []).length === codes.length * Object.keys(pages).length, "sitemap.xml: URL count is wrong");
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
