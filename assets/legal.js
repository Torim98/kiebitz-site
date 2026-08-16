/**
 * Kündigung und Widerruf im Browser.
 *
 * Zwei Seiten teilen sich diese Datei: /cancel/ (Kündigungserklärung nach
 * § 312k BGB) und /withdraw/ (Widerrufserklärung).
 *
 * Drei Regeln bestimmen den Aufbau:
 *
 *   1. Keine Anmeldung. Beide Erklärungen muss auch abgeben können, wer nicht
 *      eingeloggt ist oder kein Konto mehr hat. Die Aufrufe gehen deshalb ohne
 *      Sitzungscookie (`credentials: "omit"`); den CSRF-Kopf verlangt die API
 *      für schreibende Browseraufrufe trotzdem.
 *   2. Aller Text steht übersetzt im HTML. Dieses Skript blendet Zustände ein
 *      und aus und füllt reine Werte (Vorgangsnummer, Eingangszeit) ein · es
 *      formuliert nichts selbst, sonst gäbe es die Sätze nur auf Englisch.
 *   3. Eine gespeicherte Erklärung bleibt gespeichert. Scheitert nur die
 *      Bestätigungs-E-Mail (`legal_confirmation_failed` mit `received`), ist
 *      der Eingang trotzdem bestätigt · die Seite sagt beides.
 */
(function () {
  "use strict";

  var API = "https://api.kiebitz.dev";
  var ENDPOINTS = {
    cancel: "/v1/contracts/cancellation",
    withdraw: "/v1/contracts/withdrawal"
  };

  var root = document.documentElement;
  var page = root.getAttribute("data-page") || "";
  var endpoint = ENDPOINTS[page];
  if (!endpoint || !window.fetch) return;

  var form = document.querySelector("[data-legal-form]");
  if (!form) return;

  var button = form.querySelector('button[type="submit"]');
  var sending = document.querySelector("[data-legal-sending]");

  /* ── HTTP ────────────────────────────────────────────────────────────────── */

  function api(path, body) {
    return fetch(API + path, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Schreibende Browseraufrufe weist die API ohne diesen Kopf zurück.
        "X-Kiebitz-CSRF": "1"
      },
      // Die Erklärung steht für sich · sie braucht und trägt keine Sitzung.
      credentials: "omit",
      body: JSON.stringify(body)
    }).then(function (response) {
      return response.text().then(function (text) {
        var payload = null;
        if (text) {
          try { payload = JSON.parse(text); } catch (e) { payload = null; }
        }
        if (response.ok) return payload;
        var error = new Error("request failed");
        error.status = response.status;
        error.code = (payload && payload.error && payload.error.code) || "request_failed";
        error.details = (payload && payload.error && payload.error.details) || null;
        throw error;
      });
    }, function () {
      var error = new Error("network");
      error.status = 0;
      error.code = "network_unavailable";
      throw error;
    });
  }

  /* ── Zustände ────────────────────────────────────────────────────────────── */

  function showView(name) {
    var all = document.querySelectorAll("[data-legal-view]");
    for (var i = 0; i < all.length; i++) {
      all[i].hidden = all[i].getAttribute("data-legal-view") !== name;
    }
  }

  function toggle(selector, visible) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].hidden = !visible;
  }

  function fill(name, value) {
    var nodes = document.querySelectorAll('[data-legal-field="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  /**
   * Meldung anzeigen. `code` wählt den übersetzten Block; ist er unbekannt,
   * erscheint der allgemeine Text. Der rohe Code steht daneben, damit ein
   * Support-Fall nicht raten muss.
   */
  function showMessage(code) {
    var box = document.querySelector("[data-legal-message]");
    if (!box) return;
    box.hidden = false;
    var blocks = box.querySelectorAll("[data-legal-error]");
    var matched = false;
    for (var i = 0; i < blocks.length; i++) {
      var hit = blocks[i].getAttribute("data-legal-error") === code;
      blocks[i].hidden = !hit;
      if (hit) matched = true;
    }
    for (var j = 0; j < blocks.length; j++) {
      if (blocks[j].getAttribute("data-legal-error") === "generic") {
        blocks[j].hidden = matched;
      }
    }
    var slot = box.querySelector("[data-legal-code]");
    if (slot) slot.textContent = code || "";
  }

  function hideMessage() {
    var box = document.querySelector("[data-legal-message]");
    if (box) box.hidden = true;
  }

  function busy(on) {
    if (button) {
      button.disabled = !!on;
      button.setAttribute("aria-busy", on ? "true" : "false");
    }
    if (sending) sending.hidden = !on;
  }

  function formatMoment(iso) {
    if (!iso) return "";
    var date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso);
    try {
      return date.toLocaleString(root.getAttribute("lang") || "en");
    } catch (e) {
      return date.toISOString();
    }
  }

  /* ── Eingaben ────────────────────────────────────────────────────────────── */

  function text(name) {
    var field = form.querySelector('[name="' + name + '"]');
    return field ? String(field.value || "").trim() : "";
  }

  function choice(name, fallback) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : fallback;
  }

  /**
   * Zwei Angaben hängen von einer Auswahl ab: Der Grund ist bei
   * außerordentlicher Kündigung Pflicht, das Datum nur beim festen Termin.
   * Beides steuert das Formular über `required`, damit der Browser in seiner
   * eigenen Sprache prüft, statt dass hier Sätze entstehen.
   */
  function syncConditionalFields() {
    var reason = form.querySelector('[name="reason"]');
    var date = form.querySelector('[name="requested_end_date"]');
    var extraordinary = choice("cancellation_type", "ordinary") === "extraordinary";
    var fixedDate = choice("requested_end_mode", "earliest") === "date";

    if (reason && reason.hasAttribute("data-legal-reason")) {
      reason.required = extraordinary;
      toggle("[data-legal-reason-required]", extraordinary);
      toggle("[data-legal-reason-optional]", !extraordinary);
    }
    if (date) {
      date.disabled = !fixedDate;
      date.required = fixedDate;
      var wrapper = date.closest ? date.closest("[data-legal-date-field]") : null;
      if (wrapper) wrapper.hidden = !fixedDate;
    }
  }

  function payload() {
    var body = {
      name: text("name"),
      email: text("email"),
      provider: text("provider") || "unknown",
      contract_reference: text("contract_reference") || "Kiebitz Plus",
      reason: text("reason")
    };
    if (page === "cancel") {
      body.cancellation_type = choice("cancellation_type", "ordinary");
      body.requested_end = choice("requested_end_mode", "earliest") === "date"
        ? text("requested_end_date")
        : "earliest";
    }
    return body;
  }

  /* ── Eingangsbestätigung ─────────────────────────────────────────────────── */

  function receive(requestId, receivedAt, emailSent) {
    fill("request-id", requestId || "—");
    fill("received-at", formatMoment(receivedAt) || "—");
    toggle("[data-legal-email='sent']", !!emailSent);
    toggle("[data-legal-email='failed']", !emailSent);
    hideMessage();
    showView("received");
    // Der Zustand wechselt weit oben im Dokument · ohne Fokuswechsel bliebe
    // die Bestätigung für Tastatur und Screenreader unbemerkt.
    var target = document.querySelector('[data-legal-view="received"] [data-legal-focus]');
    if (target && target.focus) target.focus();
  }

  /* ── Absenden ────────────────────────────────────────────────────────────── */

  form.addEventListener("change", syncConditionalFields);
  syncConditionalFields();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideMessage();
    syncConditionalFields();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    busy(true);
    api(endpoint, payload()).then(function (result) {
      receive(
        result && result.request_id,
        result && result.received_at,
        !result || result.confirmation_email_sent !== false
      );
    }, function (error) {
      var details = error.details || {};
      // Gespeichert ist gespeichert: Nur die Bestätigungsmail fehlt.
      if (error.code === "legal_confirmation_failed" && details.received === true) {
        receive(details.request_id, details.received_at, false);
        return;
      }
      showMessage(error.code);
    }).then(function () {
      busy(false);
    });
  });
})();
