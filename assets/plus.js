/**
 * Kiebitz Plus im Browser.
 *
 * Drei Seiten teilen sich diese Datei: /plus/ (Anmeldung und Kauf),
 * /plus/account/ (Status, Checkout, Portal, Abmelden, Löschen) und
 * /plus/success/ (Rückkehr aus dem Stripe-Checkout).
 *
 * Zwei Regeln bestimmen den Aufbau:
 *
 *   1. Die Sitzung ist ein HttpOnly-Cookie. Dieses Skript sieht sie nie, legt
 *      sie nirgends ab und könnte sie auch gar nicht auslesen. Jeder Aufruf
 *      geht deshalb mit `credentials: "include"`; schreibende Aufrufe tragen
 *      zusätzlich `X-Kiebitz-CSRF: 1`.
 *   2. Aller Text steht übersetzt im HTML. Dieses Skript blendet Zustände ein
 *      und aus und füllt reine Werte (Adresse, Datum) ein · es formuliert
 *      nichts selbst, sonst gäbe es die Sätze nur auf Englisch.
 *
 * Es werden keine Schachdaten übertragen. Konto, Abrechnung und Freischaltung,
 * mehr kennt diese Seite nicht.
 */
(function () {
  "use strict";

  var API = "https://api.kiebitz.dev";
  var root = document.documentElement;
  var page = root.getAttribute("data-page") || "";

  /* ── HTTP ────────────────────────────────────────────────────────────────── */

  function api(path, options) {
    options = options || {};
    var method = options.method || "GET";
    var headers = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    // Schreibende Browseraufrufe weist die API ohne diesen Kopf zurück.
    if (method !== "GET") headers["X-Kiebitz-CSRF"] = "1";

    return fetch(API + path, {
      method: method,
      headers: headers,
      credentials: "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }).then(function (response) {
      if (response.status === 204) return null;
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

  function views() {
    return document.querySelectorAll("[data-plus-view]");
  }

  function showView(name) {
    var all = views();
    for (var i = 0; i < all.length; i++) {
      all[i].hidden = all[i].getAttribute("data-plus-view") !== name;
    }
  }

  /** Blendet Blöcke ein oder aus, die neben dem Hauptzustand stehen. */
  function toggle(selector, visible) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].hidden = !visible;
  }

  function fill(name, value) {
    var nodes = document.querySelectorAll('[data-plus-field="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  /**
   * Meldung anzeigen. `code` wählt den übersetzten Block; ist er unbekannt,
   * erscheint der allgemeine Text. Der rohe Code steht daneben, damit ein
   * Support-Fall nicht raten muss.
   */
  function showMessage(scope, code) {
    var box = document.querySelector('[data-plus-message="' + scope + '"]');
    if (!box) return;
    box.hidden = false;
    var blocks = box.querySelectorAll("[data-plus-error]");
    var matched = false;
    for (var i = 0; i < blocks.length; i++) {
      var hit = blocks[i].getAttribute("data-plus-error") === code;
      blocks[i].hidden = !hit;
      if (hit) matched = true;
    }
    for (var j = 0; j < blocks.length; j++) {
      if (blocks[j].getAttribute("data-plus-error") === "generic") {
        blocks[j].hidden = matched;
      }
    }
    var slot = box.querySelector("[data-plus-code]");
    if (slot) slot.textContent = code || "";
  }

  function hideMessage(scope) {
    var box = document.querySelector('[data-plus-message="' + scope + '"]');
    if (box) box.hidden = true;
  }

  function busy(button, on) {
    if (!button) return;
    button.disabled = !!on;
    button.setAttribute("aria-busy", on ? "true" : "false");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    try {
      return date.toLocaleDateString(root.getAttribute("lang") || "en");
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  /** Der Systembrowser übernimmt Checkout und Portal · nie ein eingebetteter Rahmen. */
  function leaveTo(url) {
    window.location.assign(url);
  }

  /* ── /plus/ · Anmeldung und Kauf ─────────────────────────────────────────── */

  function initSignIn() {
    var form = document.querySelector("[data-plus-signin]");
    if (!form) return;
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');

    // Wer schon angemeldet ist, soll nicht noch einmal einen Link anfordern.
    api("/v1/account/me").then(function (account) {
      if (!account) return;
      fill("email", account.email || "");
      showView("signed-in");
    }, function () {
      showView("form");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideMessage("signin");
      var address = (input && input.value ? input.value : "").trim();
      if (!address) return;
      busy(button, true);
      api("/v1/auth/magic-link/request", {
        method: "POST",
        body: { email: address, client: "web" }
      }).then(function () {
        fill("email", address);
        showView("sent");
      }, function (error) {
        showMessage("signin", error.code);
      }).then(function () {
        busy(button, false);
      });
    });
  }

  /* ── /plus/account/ · Status und Verwaltung ──────────────────────────────── */

  function renderAccount(account, entitlement) {
    // Abmelden und Löschen gibt es nur, wenn eine Sitzung besteht.
    toggle("[data-plus-session]", true);
    fill("email", account.email || "");
    var providers = (entitlement && entitlement.providers) || account.providers || [];
    toggle("[data-plus-provider='stripe']", providers.indexOf("stripe") !== -1);
    toggle("[data-plus-provider='google_play']", providers.indexOf("google_play") !== -1);

    var plus = entitlement && entitlement.plan === "plus";
    var trial = !!(entitlement && entitlement.trial);
    toggle("[data-plus-trial]", plus && trial);
    toggle("[data-plus-grace]", !!(entitlement && entitlement.status === "grace"));
    toggle("[data-plus-eligible]", !plus && account.trial_eligible === true);
    toggle("[data-plus-not-eligible]", !plus && account.trial_eligible !== true);

    fill("valid-until", formatDate(entitlement && entitlement.valid_until));
    fill("trial-until", formatDate(entitlement && entitlement.trial_until));
    toggle("[data-plus-valid-until]", !!(entitlement && entitlement.valid_until));

    showView(plus ? "plus" : "free");
    return plus;
  }

  function loadAccount() {
    return Promise.all([api("/v1/account/me"), api("/v1/entitlements/me")]).then(function (both) {
      return renderAccount(both[0], both[1]);
    });
  }

  function initAccount() {
    if (!document.querySelector("[data-plus-account]")) return;
    showView("loading");

    var refresh = function () {
      return loadAccount().then(null, function (error) {
        if (error.status === 401) {
          toggle("[data-plus-session]", false);
          showView("signed-out");
        } else {
          showView("error");
          showMessage("account", error.code);
        }
        throw error;
      });
    };

    // Nach der Rückkehr aus dem Checkout kann der Stripe-Webhook noch
    // unterwegs sein. Ein kurzer, begrenzter Nachlauf fängt das ab, statt
    // „Free" anzuzeigen und den Nutzer daran zweifeln zu lassen.
    var delayed = /[?&]signed_in=1/.test(window.location.search)
      || /[?&]checkout=1/.test(window.location.search);

    refresh().then(function (plus) {
      if (!plus && delayed) pollFor(refresh, 4);
    }, function () { /* Zustand steht bereits */ });

    document.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("[data-plus-action]") : null;
      if (!target) return;
      var action = target.getAttribute("data-plus-action");
      if (action === "checkout") startCheckout(target);
      else if (action === "portal") openPortal(target);
      else if (action === "logout") logout(target);
      else if (action === "delete-open") toggle("[data-plus-delete-confirm]", true);
      else if (action === "delete-cancel") toggle("[data-plus-delete-confirm]", false);
      else if (action === "delete") deleteAccount(target);
      else return;
      event.preventDefault();
    });

    function startCheckout(button) {
      hideMessage("account");
      busy(button, true);
      api("/v1/billing/stripe/checkout", { method: "POST" }).then(function (session) {
        if (session && session.checkout_url) leaveTo(session.checkout_url);
        else showMessage("account", "stripe_checkout_failed");
      }, function (error) {
        showMessage("account", error.code);
      }).then(function () {
        busy(button, false);
      });
    }

    function openPortal(button) {
      hideMessage("account");
      busy(button, true);
      api("/v1/billing/stripe/portal", { method: "POST" }).then(function (session) {
        if (session && session.portal_url) leaveTo(session.portal_url);
        else showMessage("account", "stripe_portal_failed");
      }, function (error) {
        showMessage("account", error.code);
      }).then(function () {
        busy(button, false);
      });
    }

    function logout(button) {
      hideMessage("account");
      busy(button, true);
      api("/v1/auth/logout", { method: "POST" }).then(function () {
        toggle("[data-plus-session]", false);
        showView("signed-out");
      }, function (error) {
        showMessage("account", error.code);
      }).then(function () {
        busy(button, false);
      });
    }

    function deleteAccount(button) {
      hideMessage("account");
      busy(button, true);
      api("/v1/account", { method: "DELETE", body: { confirmation: "DELETE" } }).then(function () {
        toggle("[data-plus-delete-confirm]", false);
        toggle("[data-plus-session]", false);
        showView("deleted");
      }, function (error) {
        var providers = (error.details && error.details.providers) || [];
        if (error.code === "active_subscription") {
          toggle("[data-plus-cancel-stripe]", providers.indexOf("stripe") !== -1);
          toggle("[data-plus-cancel-play]", providers.indexOf("google_play") !== -1);
        }
        showMessage("account", error.code);
      }).then(function () {
        busy(button, false);
      });
    }
  }

  /* ── /plus/success/ · Rückkehr aus dem Checkout ──────────────────────────── */

  /**
   * Fragt mit wachsendem Abstand nach, bis Plus steht oder die Versuche
   * aufgebraucht sind. Begrenzt und ohne Endlosschleife: Der Webhook kommt
   * gleich, oder er kommt gleich danach · in beiden Fällen hilft Warten mehr
   * als Nachladen.
   */
  var BACKOFF = [1500, 3000, 6000, 10000, 15000, 20000];

  function pollFor(attempt, limit) {
    var max = Math.min(typeof limit === "number" ? limit : BACKOFF.length, BACKOFF.length);
    var index = 0;
    var run = function () {
      if (index >= max) return;
      var wait = BACKOFF[index];
      index += 1;
      window.setTimeout(function () {
        attempt().then(function (done) {
          if (!done) run();
        }, function () {
          run();
        });
      }, wait);
    };
    run();
  }

  function initSuccess() {
    if (!document.querySelector("[data-plus-success]")) return;
    showView("waiting");

    var check = function () {
      return api("/v1/entitlements/me").then(function (entitlement) {
        if (entitlement && entitlement.plan === "plus") {
          fill("valid-until", formatDate(entitlement.valid_until));
          toggle("[data-plus-trial]", !!entitlement.trial);
          showView("ready");
          return true;
        }
        return false;
      }, function (error) {
        if (error.status === 401) {
          showView("signed-out");
          return true;
        }
        return false;
      });
    };

    check().then(function (done) {
      if (done) return;
      pollFor(function () {
        return check();
      }, BACKOFF.length);
      // Nach dem letzten Versuch bleibt der ehrliche Zustand: Es dauert noch.
      var total = BACKOFF.reduce(function (sum, value) { return sum + value; }, 0);
      window.setTimeout(function () {
        var ready = document.querySelector('[data-plus-view="ready"]');
        if (ready && ready.hidden) showView("pending");
      }, total + 1500);
    });
  }

  if (page === "plus") initSignIn();
  if (page === "plusAccount") initAccount();
  if (page === "plusSuccess") initSuccess();
})();
