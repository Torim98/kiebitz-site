/* Kiebitz website — Sprachumschaltung, Feedback, Reveal, Brett-Choreografie.
   Kein Framework; externe Anfrage nur beim bewussten Absenden des Feedback-Formulars. */
(function () {
  "use strict";

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
    btn.innerHTML =
      '<span lang="de">Animationen</span><span lang="en">Animations</span>';
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
  var root = document.documentElement;

  function setLang(lang, persist) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    var btns = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-set-lang") === lang ? "true" : "false");
    }
    var t = document.querySelector("[data-title-" + lang + "]");
    if (t) document.title = t.getAttribute("data-title-" + lang);
    var placeholders = document.querySelectorAll("[data-placeholder-" + lang + "]");
    for (var p = 0; p < placeholders.length; p++) {
      placeholders[p].setAttribute("placeholder", placeholders[p].getAttribute("data-placeholder-" + lang));
    }
    var labels = document.querySelectorAll("[data-label-" + lang + "]");
    for (var l = 0; l < labels.length; l++) {
      labels[l].textContent = labels[l].getAttribute("data-label-" + lang);
    }
    document.dispatchEvent(new Event("kiebitz:langchange"));
    if (persist) {
      try { localStorage.setItem("kiebitz-lang", lang); } catch (e) { /* egal */ }
    }
  }

  setLang(root.getAttribute("data-lang") || "en", false);

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("[data-set-lang]") : null;
    if (!btn) return;
    setLang(btn.getAttribute("data-set-lang"), true);
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
      '<button class="lb-close" type="button" aria-label="Schließen / Close">\u2715</button>' +
      '<img alt=""><p class="lb-cap"></p>';
    document.body.appendChild(box);
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

  /* ── Dialog: Android Closed Test ────────────────────────────────────────── */
  (function () {
    var modal = document.getElementById("beta-android");
    var openers = document.querySelectorAll("[data-beta-open]");
    if (!modal || !openers.length) return;

    var card = modal.querySelector(".modal-card");
    var closeBtn = modal.querySelector("[data-beta-close]");
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
        // Ohne JavaScript bleibt der Link die APK auf GitHub.
        ev.preventDefault();
        open(this);
      });
    }

    closeBtn.addEventListener("click", close);
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
  })();

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

    function setStatus(state, de, en) {
      status.setAttribute("data-state", state);
      status.innerHTML = '<span lang="de">' + de + '</span><span lang="en">' + en + "</span>";
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
        setStatus("success", "Danke. Deine Meldung wurde übermittelt.", "Thank you. Your report has been sent.");
        return;
      }

      var reportType = typeValue();
      subject.value = "Kiebitz · " + reportType;
      if (urlField) urlField.value = window.location.href.split("#")[0] + "#feedback";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      setStatus("sending", "Meldung wird sicher übermittelt …", "Sending your report securely …");

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
          setStatus(
            "success",
            "Danke. Deine Meldung ist unterwegs. Jeder Hinweis hilft Kiebitz weiter.",
            "Thank you. Your report is on its way. Every note helps Kiebitz improve."
          );
        })
        .catch(function () {
          setStatus(
            "error",
            'Die Zustellung konnte nicht bestätigt werden. Bitte versuche es noch einmal oder schreib direkt an <a href="mailto:kiebitz.chess@gmail.com">kiebitz.chess@gmail.com</a>.',
            'Delivery could not be confirmed. Please try again or email <a href="mailto:kiebitz.chess@gmail.com">kiebitz.chess@gmail.com</a> directly.'
          );
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
      id: "knight", de: "Springer", en: "Knight",
      bases: [
        [[1, 0], [3, 1], [5, 2], [6, 4], [4, 5], [2, 6], [4, 7]],
        [[0, 0], [2, 1], [4, 0], [6, 1], [7, 3], [5, 4], [7, 5]],
        [[3, 0], [5, 1], [7, 2], [6, 4], [4, 3], [2, 4], [0, 5]],
        [[7, 0], [5, 1], [3, 2], [1, 3], [0, 5], [2, 6], [4, 7]],
        [[2, 0], [0, 1], [1, 3], [3, 4], [5, 3], [7, 4], [6, 6]]
      ]
    },
    {
      id: "rook", de: "Turm", en: "Rook",
      bases: [
        [[0, 0], [0, 3], [4, 3], [4, 6], [1, 6], [1, 1], [7, 1]],
        [[3, 0], [3, 5], [7, 5], [7, 2], [1, 2], [1, 7], [5, 7]]
      ]
    },
    {
      id: "queen", de: "Dame", en: "Queen",
      bases: [
        [[3, 0], [7, 4], [7, 7], [0, 7], [0, 0], [4, 4], [4, 7]],
        [[2, 0], [6, 4], [6, 7], [1, 7], [1, 2], [4, 5], [7, 2]]
      ]
    },
    {
      id: "bishop", de: "Läufer", en: "Bishop",
      bases: [
        [[0, 0], [2, 2], [4, 4], [6, 6], [7, 7], [5, 5], [3, 3]],
        [[2, 0], [4, 2], [6, 4], [7, 5], [5, 7], [3, 5], [1, 3]]
      ]
    },
    {
      id: "king", de: "König", en: "King",
      bases: [
        [[1, 0], [2, 1], [3, 1], [4, 2], [5, 2], [6, 3], [7, 4]],
        [[4, 0], [3, 1], [2, 1], [1, 2], [1, 3], [2, 4], [3, 5]]
      ]
    },
    { id: "pawn", de: "Bauer", en: "Pawn", bases: [] }
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
    var lang = root.getAttribute("data-lang") === "de" ? "de" : "en";
    routeLabel.textContent =
      sequence.piece[lang] + " · " + names[0] + " → " + names[names.length - 1];
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
