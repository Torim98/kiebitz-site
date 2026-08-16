/**
 * Die Vertragsanlagen.
 *
 * Die Vertragsbestätigung hängt Dateien an, die der Kunde Jahre später offline
 * öffnen können muss. Eine gespeicherte Website-Seite taugt dafür nicht: Ohne
 * den Server fehlen Stylesheet, Schrift und Bilder, und übrig bleibt eine
 * randlose Textwüste mit Navigation und Sprachwähler darin.
 *
 * Diese Dateien sind deshalb in sich geschlossene Dokumente: ein
 * `<style>`-Block, keine externe Ressource, kein Skript, nur absolute Links.
 *
 * Sie werden nicht von Hand gepflegt. Der Inhalt kommt aus den gerade gebauten
 * Terms-Seiten — eine zweite handgepflegte Rechtsfassung wäre die sicherste
 * Art, zwei verschiedene Verträge im Umlauf zu haben.
 *
 * Maßgeblich ist allein die deutsche Anlage. Die englische ist eine
 * Lesehilfe: Ein Anhang, den der Empfänger nicht lesen kann, erfüllt seinen
 * Zweck nicht. Den Vorrang der deutschen Fassung sagt die englische
 * Terms-Seite bereits in ihrem eigenen Kopf, und dieser Satz wandert beim
 * Ableiten mit.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Die Anlagen in der Reihenfolge, in der die Vertragsbestätigung sie anhängt:
 * zuerst die maßgebliche Fassung, dann die Übersetzung.
 */
export const CONTRACT_ANNEXES = [
  {
    language: "de",
    binding: true,
    source: "de/terms/index.html",
    output: "legal/kiebitz-vertragsbedingungen.html",
    title: "Vertragsbedingungen für Kiebitz Plus · Kiebitz",
    foot: (canonical, termsUrl, other) => `
  <p>Diese Datei ist die Anlage zur Vertragsbestätigung für Kiebitz Plus und gibt die zum Zeitpunkt des Vertragsschlusses geltenden Vertragsbedingungen wieder. Maßgeblich ist diese deutsche Fassung.</p>
  <p>Dauerhaft abrufbar unter <a href="${canonical}">${canonical}</a>, die jeweils aktuelle Fassung unter <a href="${termsUrl}">${termsUrl}</a>. Eine englische Übersetzung steht zur Information unter <a href="${other}">${other}</a>; bei Abweichungen gilt die deutsche Fassung.</p>
  <p>Fragen zum Vertrag: <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a></p>`,
  },
  {
    language: "en",
    binding: false,
    source: "terms/index.html",
    output: "legal/kiebitz-contract-terms.html",
    title: "Contract terms for Kiebitz Plus · Kiebitz",
    foot: (canonical, termsUrl, other) => `
  <p>This file accompanies the Kiebitz Plus contract confirmation and reproduces the contract terms in force when the contract was concluded. It is an English translation provided for information only. The binding version is the German one at <a href="${other}">${other}</a>; in case of discrepancies the German version prevails.</p>
  <p>Permanently available at <a href="${canonical}">${canonical}</a>, the current version at <a href="${termsUrl}">${termsUrl}</a>.</p>
  <p>Questions about the contract: <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a></p>`,
  },
];

const STYLE = `
  :root {
    color-scheme: light;
    --ink: #16171a;
    --ink-soft: #4d5158;
    --line: #d8dade;
    --panel: #f5f6f7;
    --link: #1b4f8f;
  }

  * { box-sizing: border-box; }

  html { -webkit-text-size-adjust: 100%; }

  body {
    margin: 0;
    padding: 40px 24px 64px;
    background: #fff;
    color: var(--ink);
    font: 16px/1.65 "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  }

  .sheet { max-width: 42rem; margin: 0 auto; }

  a { color: var(--link); }

  /* ── Kopf ────────────────────────────────────────────────────────────── */

  .eyebrow {
    margin: 0 0 6px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .eyebrow b { font-weight: 700; }

  h1 {
    margin: 0 0 14px;
    font-size: 1.85rem;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .doc-sub { margin: 0 0 10px; font-size: 1.02rem; color: var(--ink-soft); }

  .doc-meta {
    margin: 0 0 8px;
    padding-bottom: 22px;
    border-bottom: 2px solid var(--ink);
    font-size: 0.9rem;
    color: var(--ink-soft);
  }

  /* ── Abschnitte ──────────────────────────────────────────────────────── */

  section {
    margin-top: 34px;
    padding-top: 26px;
    border-top: 1px solid var(--line);
  }

  section:first-of-type { border-top: 0; }

  h2 {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 0 0 14px;
    font-size: 1.2rem;
    line-height: 1.3;
  }

  h2 .num {
    flex: none;
    font-variant-numeric: tabular-nums;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--ink-soft);
  }

  p { margin: 0 0 12px; }

  ul.bul { margin: 0 0 12px; padding-left: 1.25rem; }

  ul.bul li { margin-bottom: 8px; }

  /* ── Hervorgehobene Kästen ───────────────────────────────────────────── */

  .panel {
    margin: 16px 0;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--panel);
  }

  .panel p:last-child { margin-bottom: 0; }

  address { font-style: normal; line-height: 1.75; }

  /* ── Fuß der Anlage ──────────────────────────────────────────────────── */

  .annex-foot {
    margin-top: 40px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
    font-size: 0.85rem;
    color: var(--ink-soft);
  }

  .annex-foot p { margin: 0 0 6px; }

  /* ── Druck ───────────────────────────────────────────────────────────── */

  @media print {
    body {
      padding: 0;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #000;
    }

    .sheet { max-width: none; }

    a { color: #000; text-decoration: underline; }

    /* Auf Papier ist ein Link ohne seine Adresse eine Sackgasse. Adressen und
       Telefonnummern stehen bereits im Text · nur Webadressen fehlen. */
    a[href^="https://"]::after {
      content: " (" attr(href) ")";
      font-size: 0.85em;
      word-break: break-all;
    }

    section {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-top: 20pt;
      padding-top: 14pt;
    }

    h1, h2 { break-after: avoid; page-break-after: avoid; }

    .panel { background: none; border: 1pt solid #000; }

    @page { margin: 18mm 16mm; }
  }
`;

/** Der Artikel der Terms-Seite · alles davor und danach ist Website. */
function extractArticle(html, source) {
  const start = html.indexOf("<article>");
  const end = html.indexOf("</article>");
  if (start === -1 || end === -1) {
    throw new Error(`Could not find the contract article in ${source}`);
  }
  return html.slice(start + "<article>".length, end);
}

/**
 * Aus jedem Link eine Adresse machen, die auch in zwei Jahren im
 * Mailprogramm eines Kunden noch funktioniert.
 *
 * Sprungmarken innerhalb des Dokuments bleiben, wie sie sind: Sie zeigen auf
 * Abschnitte, die hier mit im Dokument stehen.
 */
function absolutizeLinks(html, base) {
  return html.replace(/\b(href|src)="([^"]+)"/g, (match, attribute, value) => {
    if (value.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(value)) return match;
    const resolved = new URL(value, base);
    // /de/impressum/index.html und /de/impressum/ sind dieselbe Seite · die
    // kürzere Form ist die, die überall sonst auf der Website steht.
    resolved.pathname = resolved.pathname.replace(/\/index\.html$/, "/");
    return `${attribute}="${resolved.href}"`;
  });
}

/**
 * Der Sprachfilter des Builds lässt dort Leerzeilen zurück, wo die sechs
 * anderen Sprachen standen. Im Dokument stören sie niemanden, in der Datei
 * schon: Sie machen aus 300 Zeilen 900.
 */
function collapseBlankLines(html) {
  return html.replace(/(?:[ \t]*\r?\n){3,}/g, "\n\n").trim();
}

/**
 * Baut alle Anlagen und gibt ihre Pfade zurück.
 *
 * `origin` ist der veröffentlichte Ursprung aus `site.config.mjs`; die Anlagen
 * verlinken ausschließlich absolut dorthin.
 */
export async function buildContractAnnexes(root, origin) {
  const written = [];

  for (const annex of CONTRACT_ANNEXES) {
    const source = await readFile(path.join(root, ...annex.source.split("/")), "utf8");
    const termsBase = new URL(annex.source.replace(/index\.html$/, ""), origin);
    const article = collapseBlankLines(
      absolutizeLinks(extractArticle(source, annex.source), termsBase)
    );
    const canonical = new URL(annex.output, origin).href;
    const counterpart = CONTRACT_ANNEXES.find((other) => other !== annex);

    const document = `<!DOCTYPE html>
<html lang="${annex.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${annex.title}</title>
<meta name="robots" content="noindex, follow">
<style>${STYLE}</style>
</head>
<body>
<main class="sheet">
${article}

<div class="annex-foot">${annex.foot(
      canonical,
      termsBase.href,
      new URL(counterpart.output, origin).href
    )}
</div>
</main>
</body>
</html>
`;

    const outputPath = path.join(root, ...annex.output.split("/"));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, document, "utf8");
    written.push(annex.output);
  }

  return written;
}
