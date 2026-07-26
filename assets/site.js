/* Kiebitz website — Sprachumschaltung, Reveal, Brett-Choreografie.
   Kein Framework, keine externen Requests. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ── Brett: Springerbahn b1–e8, dann hebt der Zug ab ───────────────────── */
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

  // Springerbahn in (Spalte, Reihe), Reihe 0 = Grundreihe Weiß.
  var tour = [[1, 0], [3, 1], [5, 2], [6, 4], [4, 5], [2, 6], [4, 7]];
  var px = function (col) { return col + 0.5; };
  var py = function (row) { return 7 - row + 0.5; };

  var ns = "http://www.w3.org/2000/svg";
  var line = document.createElementNS(ns, "polyline");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#17835e");
  line.setAttribute("stroke-width", "0.055");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute(
    "points",
    tour.map(function (s) { return px(s[0]) + "," + py(s[1]); }).join(" ")
  );
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

  var total = 0;
  var segs = [];
  for (var s = 1; s < tour.length; s++) {
    var dx = px(tour[s][0]) - px(tour[s - 1][0]);
    var dy = py(tour[s][1]) - py(tour[s - 1][1]);
    var len = Math.sqrt(dx * dx + dy * dy);
    segs.push(len);
    total += len;
  }
  line.setAttribute("stroke-dasharray", total);

  var squareLabel = stage.parentNode.querySelector("[data-square-label]");
  var names = tour.map(function (sq) {
    return "abcdefgh".charAt(sq[0]) + (sq[1] + 1);
  });

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
    line.setAttribute("stroke-dashoffset", total);
    for (var i = 0; i < tour.length; i++) cells[tour[i][1] * 8 + tour[i][0]].classList.remove("on");
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
