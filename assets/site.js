/* Kiebitz website — Sprachnavigation, Feedback, Reveal, Brett-Choreografie.
   Kein Framework; externe Anfrage nur beim bewussten Absenden des Feedback-Formulars. */
(function () {
  "use strict";

  /* ── Sprachen ───────────────────────────────────────────────────────────── */
  // Die Reihenfolge bestimmt nichts; das Auswahlfeld im Markup gibt sie vor.
  var LANGS = ["de", "en", "fr", "es", "zh", "hi", "ar"];
  // Kurzcode im DOM, vollständiges BCP-47-Tag im lang-Attribut des Dokuments.
  var LANG_TAG = { de: "de", en: "en", fr: "fr", es: "es", zh: "zh-Hans", hi: "hi", ar: "ar" };
  var RTL = { ar: true };
  var root = document.documentElement;
  var scriptUrl = document.currentScript && document.currentScript.src;

  function known(code) {
    return LANGS.indexOf(code) !== -1;
  }

  // Von JavaScript erzeugte Zeichenketten; alles andere steht im HTML.
  var STR = {
    close: {
      de: "Schließen", en: "Close", fr: "Fermer", es: "Cerrar",
      zh: "关闭", hi: "बंद करें", ar: "إغلاق"
    },
    screenshot: {
      de: "Screenshot vergrößern", en: "Enlarge screenshot", fr: "Agrandir la capture",
      es: "Ampliar la captura", zh: "放大截图", hi: "स्क्रीनशॉट बड़ा करें",
      ar: "تكبير لقطة الشاشة"
    },
    animations: {
      de: "Animationen", en: "Animations", fr: "Animations", es: "Animaciones",
      zh: "动画", hi: "एनिमेशन", ar: "الحركات"
    },
    sending: {
      de: "Meldung wird sicher übermittelt …",
      en: "Sending your report securely …",
      fr: "Envoi sécurisé de votre message …",
      es: "Enviando tu mensaje de forma segura …",
      zh: "正在安全发送你的反馈 …",
      hi: "आपकी रिपोर्ट सुरक्षित रूप से भेजी जा रही है …",
      ar: "يجري إرسال رسالتك بأمان …"
    },
    sent: {
      de: "Danke. Deine Meldung ist unterwegs. Jeder Hinweis hilft Kiebitz weiter.",
      en: "Thank you. Your report is on its way. Every note helps Kiebitz improve.",
      fr: "Merci. Votre message est parti. Chaque retour fait avancer Kiebitz.",
      es: "Gracias. Tu mensaje está en camino. Cada comentario ayuda a mejorar Kiebitz.",
      zh: "谢谢。你的反馈已经发出。每一条意见都会让 Kiebitz 更好。",
      hi: "धन्यवाद। आपकी रिपोर्ट भेज दी गई है। हर सुझाव Kiebitz को बेहतर बनाता है।",
      ar: "شكرًا لك. رسالتك في طريقها. كل ملاحظة تساعد Kiebitz على التحسّن."
    },
    sentShort: {
      de: "Danke. Deine Meldung wurde übermittelt.",
      en: "Thank you. Your report has been sent.",
      fr: "Merci. Votre message a été envoyé.",
      es: "Gracias. Tu mensaje se ha enviado.",
      zh: "谢谢。你的反馈已发送。",
      hi: "धन्यवाद। आपकी रिपोर्ट भेज दी गई है।",
      ar: "شكرًا لك. تم إرسال رسالتك."
    },
    failed: {
      de: 'Die Zustellung konnte nicht bestätigt werden. Bitte versuche es noch einmal oder schreib direkt an <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a>.',
      en: 'Delivery could not be confirmed. Please try again or email <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a> directly.',
      fr: 'La remise n’a pas pu être confirmée. Réessayez ou écrivez directement à <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a>.',
      es: 'No se pudo confirmar la entrega. Inténtalo de nuevo o escribe directamente a <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a>.',
      zh: '无法确认送达。请重试，或直接发邮件到 <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a>。',
      hi: 'डिलीवरी की पुष्टि नहीं हो सकी। कृपया दोबारा कोशिश करें या सीधे <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a> पर लिखें।',
      ar: 'تعذّر تأكيد التسليم. حاول مرة أخرى أو راسل <a href="mailto:support@kiebitz.dev">support@kiebitz.dev</a> مباشرة.'
    }
  };

  var current = known(root.getAttribute("data-lang")) ? root.getAttribute("data-lang") : "en";

  // Nur die aktuelle Fassung erzeugen; andere Sprachen haben eigene URLs.
  function allLangs(key) {
    return STR[key][current];
  }

  var systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionPref = null;
  try { motionPref = localStorage.getItem("kiebitz-motion"); } catch (e) { /* egal */ }
  if (motionPref !== "on" && motionPref !== "off") motionPref = null;
  var reduced = motionPref ? motionPref === "off" : systemReduced;

  /* ── Bewegungsschalter ──────────────────────────────────────────────────── */
  (function () {
    var root = document.documentElement;
    if (motionPref) root.setAttribute("data-motion", motionPref);
    // Schalter nur anbieten, wenn Bewegung sonst unterdrückt würde
    if (!systemReduced && !motionPref) return;
    root.setAttribute("data-motion-relevant", "");

    var host = document.querySelector(".foot-links");
    if (!host) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "motion-toggle";
    btn.setAttribute("aria-pressed", reduced ? "false" : "true");
    btn.innerHTML = allLangs("animations");
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-motion") === "on" ? "off" : "on";
      root.setAttribute("data-motion", next);
      btn.setAttribute("aria-pressed", next === "on" ? "true" : "false");
      try { localStorage.setItem("kiebitz-motion", next); } catch (e) { /* egal */ }
      location.reload();
    });
    host.appendChild(btn);
  })();

  /* ── Sprache ────────────────────────────────────────────────────────────── */
  function prepareLanguage(next) {
    var lang = known(next) ? next : "en";
    current = lang;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", LANG_TAG[lang]);
    root.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");

    var selects = document.querySelectorAll("[data-lang-select]");
    for (var s = 0; s < selects.length; s++) selects[s].value = lang;

    var placeholders = document.querySelectorAll("[data-placeholder-" + lang + "]");
    for (var p = 0; p < placeholders.length; p++) {
      placeholders[p].setAttribute("placeholder", placeholders[p].getAttribute("data-placeholder-" + lang));
    }
    var labels = document.querySelectorAll("[data-label-" + lang + "]");
    for (var l = 0; l < labels.length; l++) {
      labels[l].textContent = labels[l].getAttribute("data-label-" + lang);
    }
    // aria-label lässt keine verborgenen Geschwister zu, also hier nachziehen.
    var aria = document.querySelectorAll("[data-aria]");
    for (var a = 0; a < aria.length; a++) {
      var key = aria[a].getAttribute("data-aria");
      if (STR[key]) aria[a].setAttribute("aria-label", STR[key][lang]);
    }
    document.dispatchEvent(new Event("kiebitz:langchange"));
  }

  function navigateToLanguage(next) {
    var lang = known(next) ? next : "en";
    var page = root.getAttribute("data-page") || "home";
    var pagePaths = {
      home: "index.html",
      plus: "plus/index.html",
      plusAccount: "plus/account/index.html",
      plusSuccess: "plus/success/index.html",
      privacy: "privacy/index.html",
      impressum: "impressum/index.html"
    };
    if (!scriptUrl || !pagePaths[page]) return;
    var siteRoot = new URL("../", scriptUrl);
    var localizedPath = (lang === "en" ? "" : lang + "/") + pagePaths[page];
    var target = new URL(localizedPath, siteRoot);
    target.hash = window.location.hash;
    try { localStorage.setItem("kiebitz-lang", lang); } catch (e) { /* egal */ }
    window.location.assign(target.href);
  }

  prepareLanguage(current);

  document.addEventListener("change", function (ev) {
    var sel = ev.target.closest ? ev.target.closest("[data-lang-select]") : null;
    if (!sel) return;
    navigateToLanguage(sel.value);
  });

  /* ── Reveal ─────────────────────────────────────────────────────────────── */
  var rv = document.querySelectorAll(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    for (var i = 0; i < rv.length; i++) rv[i].classList.add("in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    for (var j = 0; j < rv.length; j++) io.observe(rv[j]);
  }

  /* ── Balken (Insights) füllen, sobald sichtbar ─────────────────────────── */
  var bars = document.querySelectorAll(".bar-t i");
  function fillBars() {
    for (var i = 0; i < bars.length; i++) bars[i].style.width = bars[i].getAttribute("data-w") + "%";
  }
  if (reduced || !("IntersectionObserver" in window)) {
    fillBars();
  } else {
    var barHost = document.querySelector(".bars");
    if (barHost) {
      var bo = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { fillBars(); bo.disconnect(); }
      }, { threshold: 0.3 });
      bo.observe(barHost);
    }
  }

  /* ── Eval-Balken: läuft durch eine Partie, solange er sichtbar ist ─────── */
  var evalFill = document.querySelector(".evalbar .w");
  if (evalFill) {
    var evals = [52, 56, 49, 58, 46, 71, 34, 61, 55];
    var step = 0;
    var timer = null;
    var tick = function () {
      evalFill.style.width = evals[step % evals.length] + "%";
      step++;
    };
    tick();
    if (!reduced) {
      var start = function () { if (!timer) timer = setInterval(tick, 1300); };
      var stop = function () { clearInterval(timer); timer = null; };
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (e) {
          e[0].isIntersecting ? start() : stop();
        }, { threshold: 0.4 }).observe(evalFill.parentNode);
      } else {
        start();
      }
    }
  }

  /* ── Lightbox für Screenshots ───────────────────────────────────────────── */
  var zooms = document.querySelectorAll(".shot-zoom");
  if (zooms.length) {
    var box = document.createElement("div");
    box.className = "lb";
    box.hidden = true;
    box.innerHTML =
      '<button class="lb-close" type="button" data-aria="close">\u2715</button>' +
      '<img alt=""><p class="lb-cap"></p>';
    document.body.appendChild(box);
    box.querySelector(".lb-close").setAttribute("aria-label", STR.close[current]);
    var boxImg = box.querySelector("img");
    var boxCap = box.querySelector(".lb-cap");
    var closeBtn = box.querySelector(".lb-close");
    var opener = null;

    var open = function (btn) {
      var img = btn.querySelector("img");
      if (!img) return;
      opener = btn;
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt || "";
      var cap = btn.parentNode.querySelector("figcaption");
      var parts = [];
      if (cap) {
        var vis = cap.querySelectorAll("span[lang], span:not([lang])");
        for (var k = 0; k < vis.length; k++) {
          if (vis[k].querySelector("span")) continue;
          if (vis[k].offsetParent === null && vis[k].getClientRects().length === 0) continue;
          parts.push(vis[k].textContent.trim());
        }
      }
      boxCap.textContent = parts.join(" · ");
      box.hidden = false;
      document.documentElement.style.overflow = "hidden";
      closeBtn.focus();
    };

    var close = function () {
      box.hidden = true;
      boxImg.removeAttribute("src");
      document.documentElement.style.overflow = "";
      if (opener) opener.focus();
      opener = null;
    };

    for (var z = 0; z < zooms.length; z++) {
      zooms[z].addEventListener("click", function () { open(this); });
    }
    box.addEventListener("click", function (ev) {
      if (ev.target === box || ev.target === closeBtn || ev.target === boxCap) close();
    });
    document.addEventListener("keydown", function (ev) {
      if (!box.hidden && (ev.key === "Escape" || ev.key === "Esc")) close();
    });
  }

  /* ── Dialoge ────────────────────────────────────────────────────────────── */
  function setupModal(id, openerSelector) {
    var modal = document.getElementById(id);
    var openers = document.querySelectorAll(openerSelector);
    if (!modal || !openers.length) return;

    var card = modal.querySelector(".modal-card");
    var closers = modal.querySelectorAll("[data-modal-close]");
    var closeBtn = closers[0];
    if (!card || !closeBtn) return;
    var last = null;

    function focusables() {
      var all = card.querySelectorAll("a[href], button:not([disabled])");
      var out = [];
      for (var i = 0; i < all.length; i++) {
        if (all[i].offsetParent !== null || all[i].getClientRects().length) out.push(all[i]);
      }
      return out;
    }

    function open(trigger) {
      last = trigger || document.activeElement;
      modal.hidden = false;
      document.documentElement.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.documentElement.style.overflow = "";
      if (last && last.focus) last.focus();
      last = null;
    }

    for (var i = 0; i < openers.length; i++) {
      openers[i].addEventListener("click", function (ev) {
        // Ohne JavaScript bleibt der Auslöser ein gewöhnlicher Link.
        ev.preventDefault();
        open(this);
      });
    }

    for (var c = 0; c < closers.length; c++) {
      closers[c].addEventListener("click", close);
    }
    modal.addEventListener("click", function (ev) {
      if (ev.target === modal) close();
    });
    // Links im Dialog führen weg oder öffnen einen neuen Tab: Dialog schließen.
    var links = card.querySelectorAll("a[href]");
    for (var j = 0; j < links.length; j++) {
      links[j].addEventListener("click", function () { close(); });
    }

    document.addEventListener("keydown", function (ev) {
      if (modal.hidden) return;
      if (ev.key === "Escape" || ev.key === "Esc") { close(); return; }
      if (ev.key !== "Tab") return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0];
      var lastEl = list[list.length - 1];
      if (ev.shiftKey && (document.activeElement === first || !card.contains(document.activeElement))) {
        ev.preventDefault();
        lastEl.focus();
      } else if (!ev.shiftKey && document.activeElement === lastEl) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  setupModal("sponsor-kiebitz", "[data-sponsor-open]");

  /* ── Feedback-Formular ──────────────────────────────────────────────────── */
  (function () {
    var form = document.querySelector("[data-feedback-form]");
    if (!form || !window.fetch) return;

    var button = form.querySelector("[data-feedback-send]");
    var status = form.querySelector("[data-feedback-status]");
    var subject = form.querySelector("[data-feedback-subject]");
    var message = form.querySelector("#feedback-message");
    var counter = form.querySelector("[data-feedback-count]");
    var urlField = form.querySelector('input[name="_url"]');
    var endpoint = form.getAttribute("data-feedback-endpoint");
    if (!button || !status || !subject || !endpoint) return;

    function typeValue() {
      var selected = form.querySelector('input[name="report_type"]:checked');
      return selected ? selected.value : "Feedback";
    }

    function setStatus(state, key) {
      status.setAttribute("data-state", state);
      status.innerHTML = allLangs(key);
    }

    function updateCount() {
      if (message && counter) counter.textContent = message.value.length + " / 4000";
    }

    if (message) message.addEventListener("input", updateCount);
    form.addEventListener("input", function () {
      if (button.getAttribute("aria-busy") === "true" || !status.textContent) return;
      status.textContent = "";
      status.removeAttribute("data-state");
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        form.reset();
        setStatus("success", "sentShort");
        return;
      }

      var reportType = typeValue();
      subject.value = "Kiebitz · " + reportType;
      if (urlField) urlField.value = window.location.href.split("#")[0] + "#feedback";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      setStatus("sending", "sending");

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            var confirmed = data && (data.success === true || data.success === "true");
            if (!response.ok || !confirmed) {
              throw new Error(data && data.message ? data.message : "submit failed");
            }
            return data;
          });
        })
        .then(function () {
          form.reset();
          updateCount();
          setStatus("success", "sent");
        })
        .catch(function () {
          setStatus("error", "failed");
        })
        .then(function () {
          button.disabled = false;
          button.removeAttribute("aria-busy");
        });
    });
  })();

  /* ── Brett: Figurenbahnen, dann hebt der Zug ab ────────────────────────── */
  var stage = document.querySelector(".board-stage");
  if (!stage) return;

  var lattice = stage.querySelector(".board-lattice");
  var svg = stage.querySelector(".board-path");
  if (!lattice || !svg) return;

  var cells = [];
  for (var r = 7; r >= 0; r--) {
    for (var c = 0; c < 8; c++) {
      var cell = document.createElement("i");
      if ((r + c) % 2 === 0) cell.className = "shade";
      lattice.appendChild(cell);
      cells[r * 8 + c] = cell;
    }
  }

  // Zugfolgen in (Spalte, Reihe), Reihe 0 = Grundreihe Weiß.
  // Spiegelungen, Drehungen und Umkehrungen erzeugen über 200 gültige Bahnen.
  var pieces = [
    {
      id: "knight",
      de: "Springer", en: "Knight", fr: "Cavalier", es: "Caballo",
      zh: "马", hi: "घोड़ा", ar: "الحصان",
      bases: [
        [[1, 0], [3, 1], [5, 2], [6, 4], [4, 5], [2, 6], [4, 7]],
        [[0, 0], [2, 1], [4, 0], [6, 1], [7, 3], [5, 4], [7, 5]],
        [[3, 0], [5, 1], [7, 2], [6, 4], [4, 3], [2, 4], [0, 5]],
        [[7, 0], [5, 1], [3, 2], [1, 3], [0, 5], [2, 6], [4, 7]],
        [[2, 0], [0, 1], [1, 3], [3, 4], [5, 3], [7, 4], [6, 6]]
      ]
    },
    {
      id: "rook",
      de: "Turm", en: "Rook", fr: "Tour", es: "Torre",
      zh: "车", hi: "हाथी", ar: "الرخ",
      bases: [
        [[0, 0], [0, 3], [4, 3], [4, 6], [1, 6], [1, 1], [7, 1]],
        [[3, 0], [3, 5], [7, 5], [7, 2], [1, 2], [1, 7], [5, 7]]
      ]
    },
    {
      id: "queen",
      de: "Dame", en: "Queen", fr: "Dame", es: "Dama",
      zh: "后", hi: "वज़ीर", ar: "الوزير",
      bases: [
        [[3, 0], [7, 4], [7, 7], [0, 7], [0, 0], [4, 4], [4, 7]],
        [[2, 0], [6, 4], [6, 7], [1, 7], [1, 2], [4, 5], [7, 2]]
      ]
    },
    {
      id: "bishop",
      de: "Läufer", en: "Bishop", fr: "Fou", es: "Alfil",
      zh: "象", hi: "ऊँट", ar: "الفيل",
      bases: [
        [[0, 0], [2, 2], [4, 4], [6, 6], [7, 7], [5, 5], [3, 3]],
        [[2, 0], [4, 2], [6, 4], [7, 5], [5, 7], [3, 5], [1, 3]]
      ]
    },
    {
      id: "king",
      de: "König", en: "King", fr: "Roi", es: "Rey",
      zh: "王", hi: "राजा", ar: "الملك",
      bases: [
        [[1, 0], [2, 1], [3, 1], [4, 2], [5, 2], [6, 3], [7, 4]],
        [[4, 0], [3, 1], [2, 1], [1, 2], [1, 3], [2, 4], [3, 5]]
      ]
    },
    {
      id: "pawn",
      de: "Bauer", en: "Pawn", fr: "Pion", es: "Peón",
      zh: "兵", hi: "प्यादा", ar: "البيدق",
      bases: []
    }
  ];

  function transformSquare(sq, variant) {
    var x = sq[0];
    var y = sq[1];
    switch (variant) {
      case 1: return [7 - y, x];
      case 2: return [7 - x, 7 - y];
      case 3: return [y, 7 - x];
      case 4: return [7 - x, y];
      case 5: return [x, 7 - y];
      case 6: return [y, x];
      case 7: return [7 - y, 7 - x];
      default: return [x, y];
    }
  }

  var routesByPiece = {};
  var routeKeys = {};
  pieces.forEach(function (piece) {
    routesByPiece[piece.id] = [];
    routeKeys[piece.id] = {};
  });

  function addRoute(pieceId, candidate) {
    var key = candidate.map(function (sq) { return sq[0] + "," + sq[1]; }).join(";");
    if (routeKeys[pieceId][key]) return;
    routeKeys[pieceId][key] = true;
    routesByPiece[pieceId].push(candidate);
  }

  pieces.forEach(function (piece) {
    piece.bases.forEach(function (base) {
      for (var variant = 0; variant < 8; variant++) {
        var transformed = base.map(function (sq) {
          return transformSquare(sq, variant);
        });
        addRoute(piece.id, transformed);
        addRoute(piece.id, transformed.slice().reverse());
      }
    });
  });

  // Bauern dürfen nicht gedreht werden: Weiß zieht nach oben, Schwarz nach unten.
  for (var file = 0; file < 8; file++) {
    var straightPawn = [];
    for (var rank = 1; rank < 8; rank++) straightPawn.push([file, rank]);
    addRoute("pawn", straightPawn);
    addRoute("pawn", straightPawn.map(function (sq) { return [sq[0], 7 - sq[1]]; }));
  }
  [
    [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7]],
    [[2, 1], [2, 2], [3, 3], [3, 4], [4, 5], [4, 6], [4, 7]]
  ].forEach(function (pawnRoute) {
    [pawnRoute, pawnRoute.map(function (sq) { return [7 - sq[0], sq[1]]; })]
      .forEach(function (whiteRoute) {
        addRoute("pawn", whiteRoute);
        addRoute("pawn", whiteRoute.map(function (sq) {
          return [sq[0], 7 - sq[1]];
        }));
      });
  });

  var pieceBag = [];
  var lastPieceId = "";
  var lastRouteIndex = {};

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
  }

  function refillPieceBag() {
    pieceBag = pieces.slice();
    shuffle(pieceBag);
    var nextIndex = pieceBag.length - 1;
    if (pieceBag.length > 1 && pieceBag[nextIndex].id === lastPieceId) {
      var swap = pieceBag[0];
      pieceBag[0] = pieceBag[nextIndex];
      pieceBag[nextIndex] = swap;
    }
  }

  function chooseSequence() {
    if (!pieceBag.length) refillPieceBag();
    var piece = pieceBag.pop();
    var routes = routesByPiece[piece.id];
    var next = Math.floor(Math.random() * routes.length);
    if (routes.length > 1) {
      while (next === lastRouteIndex[piece.id]) {
        next = Math.floor(Math.random() * routes.length);
      }
    }
    lastRouteIndex[piece.id] = next;
    lastPieceId = piece.id;
    return { piece: piece, tour: routes[next] };
  }

  var sequence = chooseSequence();
  var tour = sequence.tour;
  var px = function (col) { return col + 0.5; };
  var py = function (row) { return 7 - row + 0.5; };

  var ns = "http://www.w3.org/2000/svg";
  var line = document.createElementNS(ns, "polyline");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#17835e");
  line.setAttribute("stroke-width", "0.055");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  svg.appendChild(line);

  var marker = document.createElementNS(ns, "circle");
  marker.setAttribute("r", "0.14");
  marker.setAttribute("fill", "#22c08a");
  marker.setAttribute("cx", px(tour[0][0]));
  marker.setAttribute("cy", py(tour[0][1]));
  svg.appendChild(marker);

  var birds = [];
  for (var b = 0; b < 3; b++) {
    var bird = document.createElementNS(ns, "rect");
    bird.setAttribute("width", "0.13");
    bird.setAttribute("height", "0.13");
    bird.setAttribute("rx", "0.03");
    bird.setAttribute("fill", "#17835e");
    bird.setAttribute("opacity", "0");
    svg.appendChild(bird);
    birds.push(bird);
  }

  var squareLabel = stage.parentNode.querySelector("[data-square-label]");
  var routeLabel = stage.parentNode.querySelector("[data-route-label]");
  var total = 0;
  var segs = [];
  var names = [];

  function updateRouteLabel() {
    if (!routeLabel) return;
    routeLabel.textContent =
      sequence.piece[current] + " · " + names[0] + " → " + names[names.length - 1];
  }

  function useSequence(nextSequence) {
    sequence = nextSequence;
    tour = sequence.tour;
    segs = [];
    names = [];
    total = 0;

    line.setAttribute(
      "points",
      tour.map(function (s) { return px(s[0]) + "," + py(s[1]); }).join(" ")
    );
    names = tour.map(function (sq) {
      return "abcdefgh".charAt(sq[0]) + (sq[1] + 1);
    });
    for (var s = 1; s < tour.length; s++) {
      var dx = px(tour[s][0]) - px(tour[s - 1][0]);
      var dy = py(tour[s][1]) - py(tour[s - 1][1]);
      var len = Math.sqrt(dx * dx + dy * dy);
      segs.push(len);
      total += len;
    }
    line.setAttribute("stroke-dasharray", total);
    updateRouteLabel();
  }

  useSequence(sequence);
  document.addEventListener("kiebitz:langchange", updateRouteLabel);

  function paintFull() {
    line.setAttribute("stroke-dashoffset", 0);
    for (var i = 0; i < tour.length; i++) cells[tour[i][1] * 8 + tour[i][0]].classList.add("on");
    marker.setAttribute("cx", px(tour[tour.length - 1][0]));
    marker.setAttribute("cy", py(tour[tour.length - 1][1]));
    if (squareLabel) squareLabel.textContent = names[names.length - 1];
  }

  if (reduced) {
    paintFull();
    return;
  }

  line.setAttribute("stroke-dashoffset", total);
  line.style.transition = "stroke-dashoffset 0.62s cubic-bezier(0.22,0.61,0.36,1)";
  marker.style.transition = "cx 0.62s cubic-bezier(0.34,1.3,0.64,1), cy 0.62s cubic-bezier(0.34,1.3,0.64,1)";

  var idx = 0;
  var drawn = 0;
  var timers = [];
  var running = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function reset() {
    idx = 0;
    drawn = 0;
    [marker].concat(birds).forEach(function (el) {
      if (el.getAnimations) {
        el.getAnimations().forEach(function (animation) { animation.cancel(); });
      }
    });
    line.setAttribute("stroke-dashoffset", total);
    for (var i = 0; i < cells.length; i++) cells[i].classList.remove("on");
    marker.setAttribute("cx", px(tour[0][0]));
    marker.setAttribute("cy", py(tour[0][1]));
    marker.setAttribute("opacity", "1");
    birds.forEach(function (bd) { bd.setAttribute("opacity", "0"); });
    if (squareLabel) squareLabel.textContent = names[0];
  }

  function hop() {
    if (!running) return;
    if (idx >= tour.length) { takeFlight(); return; }
    var sq = tour[idx];
    cells[sq[1] * 8 + sq[0]].classList.add("on");
    marker.setAttribute("cx", px(sq[0]));
    marker.setAttribute("cy", py(sq[1]));
    if (squareLabel) squareLabel.textContent = names[idx];
    if (idx > 0) {
      drawn += segs[idx - 1];
      line.setAttribute("stroke-dashoffset", Math.max(0, total - drawn));
    }
    idx++;
    later(hop, idx === 1 ? 480 : 760);
  }

  function takeFlight() {
    var fromX = px(tour[tour.length - 1][0]);
    var fromY = py(tour[tour.length - 1][1]);
    var fly = function (el, dx, dy, delay, dur) {
      el.setAttribute("opacity", "1");
      if (el.tagName === "rect") {
        el.setAttribute("x", fromX - 0.065);
        el.setAttribute("y", fromY - 0.065);
      }
      el.animate(
        [
          { transform: "translate(0px,0px)", opacity: 1 },
          { transform: "translate(" + dx + "px," + dy + "px)", opacity: 0 }
        ],
        { duration: dur, delay: delay, easing: "cubic-bezier(0.3,0.1,0.2,1)", fill: "forwards" }
      );
    };
    fly(marker, 2.1, -1.9, 0, 1500);
    fly(birds[0], 1.7, -1.5, 120, 1500);
    fly(birds[1], 2.4, -1.2, 260, 1600);
    fly(birds[2], 1.3, -2.2, 380, 1600);
    later(function () {
      if (!running) return;
      useSequence(chooseSequence());
      reset();
      later(hop, 700);
    }, 2600);
  }

  function play() {
    if (running) return;
    running = true;
    reset();
    later(hop, 500);
  }

  function pause() {
    running = false;
    clearTimers();
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      e[0].isIntersecting ? play() : pause();
    }, { threshold: 0.25 }).observe(stage);
  } else {
    play();
  }
})();
