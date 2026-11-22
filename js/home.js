/* =========================================================================
   Élan Beauty — home.js
   Hero a bento (dati e fascia simulata), marquee, carosello, esploratore
   categorie, percorso, pacchetti, team, recensioni demo e FAQ.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc, $ = ELAN.$, $$ = ELAN.$$;

  /* ---------- Hero: scorciatoie, numeri reali della demo, fascia simulata ---------- */
  function initHero() {
    var qc = $('[data-quick-cats]');
    if (qc) {
      qc.innerHTML = D.categories.map(function (c) {
        return '<a class="chip" href="trattamenti.html?categoria=' + e(c.id) + '">' + e(c.label) + '</a>';
      }).join('');
    }
    var set = function (k, v) { $$('[data-stat="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
    set('treatments', String(D.treatments.length));
    set('cats', String(D.categories.length));
    var durs = D.treatments.map(function (t) { return t.durationMin; });
    set('duration', Math.min.apply(null, durs) + '–' + Math.max.apply(null, durs) + '′');
    var prices = D.packages.map(function (p) { return ELAN.packageTotals(p).priceCents; });
    if (prices.length) set('pkg', ELAN.eur(Math.min.apply(null, prices)).replace(',00', ''));

    var slot = $('[data-live-slot]');
    var A = ELAN.avail;
    if (slot && A) {
      var t = D.treatments.filter(function (x) { return x.featured; })[0] || D.treatments[0];
      var iso = A.nextAvailable(A.toISO(A.today()), t, A.ANY);
      var val = $('.live-slot__value', slot);
      if (iso) {
        var r = A.computeSlots(iso, t, A.ANY);
        var first = r.slots[0];
        var who = ELAN.getStaff(first.staffId);
        val.textContent = A.shortFmt.format(A.fromISO(iso)) + ' · ' + A.toHHMM(first.start) + ' — ' + t.name + (who ? ' con ' + who.name : '');
        slot.insertAdjacentHTML('beforeend', '<a class="btn-link small" href="' + ELAN.bookUrl(t.id) + '">Simula la richiesta</a>');
      } else {
        val.textContent = 'Nessuna fascia simulata nei prossimi giorni';
      }
    }
  }

  /* ---------- Marquee (decorativo, aria-hidden nell'HTML) ---------- */
  function initMarquee() {
    var m = $('[data-marquee]');
    if (!m) return;
    var group = '<ul class="marquee__group">' + D.treatments.slice(0, 12).map(function (t) {
      return '<li>' + e(t.name) + ELAN.icon('sparkle') + '</li>';
    }).join('') + '</ul>';
    m.innerHTML = group + group;
  }

  /* ---------- Carosello trattamenti principali ---------- */
  function initCarousel() {
    var track = $('[data-featured]');
    if (!track) return;
    track.innerHTML = D.treatments.filter(function (t) { return t.featured; })
      .map(function (t) { return '<li>' + ELAN.treatmentCard(t) + '</li>'; }).join('');
    var prev = $('[data-car="prev"]'), next = $('[data-car="next"]'), bar = $('[data-car-progress]');
    function step() {
      var li = track.querySelector('li');
      return li ? li.getBoundingClientRect().width + 16 : 300;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (bar) {
        var vis = track.clientWidth / track.scrollWidth;
        bar.style.width = Math.max(10, vis * 100) + '%';
        bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * ((1 / vis) - 1) * 100 : 0) + '%)';
      }
    }
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: smooth ? 'smooth' : 'auto' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: smooth ? 'smooth' : 'auto' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Esploratore categorie (tab accessibili) ---------- */
  function initExplorer() {
    var root = $('[data-explorer]');
    if (!root) return;
    var cats = D.categories.filter(function (c) { return D.treatments.some(function (t) { return t.category === c.id; }); });
    root.innerHTML =
      '<div class="explorer__tabs" role="tablist" aria-label="Categorie di trattamenti">' + cats.map(function (c, i) {
        var n = D.treatments.filter(function (t) { return t.category === c.id; }).length;
        return '<button type="button" class="explorer__tab" role="tab" id="ex-tab-' + e(c.id) + '" aria-controls="ex-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? '0' : '-1') + '" data-cat="' + e(c.id) + '">' +
          e(c.label) + '<small>' + n + (n === 1 ? ' trattamento' : ' trattamenti') + '</small></button>';
      }).join('') + '</div>' +
      '<div class="explorer__panel" id="ex-panel" role="tabpanel" tabindex="0"></div>';
    var panel = $('#ex-panel', root);
    var tabs = $$('[role="tab"]', root);

    function show(id) {
      var c = ELAN.getCategory(id);
      var items = D.treatments.filter(function (t) { return t.category === id; });
      panel.setAttribute('aria-labelledby', 'ex-tab-' + id);
      panel.innerHTML =
        '<img class="explorer__img" src="' + e(items[0].image) + '" alt="Immagine segnaposto della categoria ' + e(c.label) + '" width="800" height="600" loading="lazy">' +
        '<div class="explorer__body">' +
          '<h3>' + e(c.label) + '</h3><p>' + e(c.description) + '</p>' +
          '<ul class="explorer__list">' + items.map(function (t) {
            return '<li><a href="' + ELAN.detailUrl(t.id) + '"><span class="explorer__name">' + e(t.name) + '</span>' +
              '<span class="explorer__meta">' + ELAN.duration(t.durationMin) + '</span>' +
              '<span class="explorer__price">' + ELAN.eur(t.priceCents) + '</span></a></li>';
          }).join('') + '</ul>' +
          '<div class="btn-row"><a class="btn btn-primary" href="trattamenti.html?categoria=' + e(id) + '">Filtra: ' + e(c.label) + '</a>' +
          '<a class="btn btn-outline" href="' + ELAN.bookUrl(items[0].id) + '">Prenota ' + e(items[0].name.toLowerCase()) + '</a></div>' +
        '</div>';
      tabs.forEach(function (tb) {
        var on = tb.getAttribute('data-cat') === id;
        tb.setAttribute('aria-selected', on ? 'true' : 'false');
        tb.tabIndex = on ? 0 : -1;
      });
    }
    root.addEventListener('click', function (ev) {
      var tb = ev.target.closest('[role="tab"]');
      if (tb) show(tb.getAttribute('data-cat'));
    });
    root.addEventListener('keydown', function (ev) {
      var tb = ev.target.closest('[role="tab"]');
      if (!tb) return;
      var i = tabs.indexOf(tb), n = null;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') n = (i + 1) % tabs.length;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      if (ev.key === 'Home') n = 0;
      if (ev.key === 'End') n = tabs.length - 1;
      if (n === null) return;
      ev.preventDefault();
      show(tabs[n].getAttribute('data-cat'));
      tabs[n].focus();
    });
    show(cats[0].id);
  }

  function initRest() {
    var exp = $('[data-experience]');
    if (exp) exp.innerHTML = D.experience.map(function (s) { return '<li><h3>' + e(s.title) + '</h3><p>' + e(s.text) + '</p></li>'; }).join('');

    var pk = $('[data-packages-preview]');
    if (pk) pk.innerHTML = D.packages.slice(0, 3).map(function (p) { return ELAN.packageCard(p, { compact: true }); }).join('');

    var team = $('[data-team-preview]');
    if (team) {
      team.innerHTML = D.staff.map(function (s) {
        return '<article class="member-mini">' +
          '<img class="avatar" src="' + e(s.avatar) + '" alt="Avatar illustrato di ' + e(s.name) + '" width="104" height="104" loading="lazy">' +
          '<h3>' + e(s.name) + '</h3><p>' + e(s.role) + '</p>' +
          '<a class="btn-link" href="team.html#' + e(s.id) + '">Conosci ' + e(s.name) + '</a>' +
        '</article>';
      }).join('');
    }

    var rev = $('[data-reviews]');
    if (rev) {
      rev.innerHTML = D.reviews.map(function (r) {
        return '<figure class="review">' +
          '<span class="tag tag--demo">Recensione dimostrativa</span>' +
          '<blockquote><p>' + e(r.text) + '</p></blockquote>' +
          '<figcaption>' + e(r.author) + ' · ' + e(r.treatment) + '</figcaption>' +
        '</figure>';
      }).join('');
    }

    var faq = $('[data-faq-preview]');
    if (faq) faq.innerHTML = D.faq.slice(0, 5).map(function (f, i) { return ELAN.accordionItem('hfaq-' + i, f.q, '<p>' + e(f.a) + '</p>', i === 0, 3); }).join('');
  }

  /* ---------- Mezza dalia: parte dalla fine del titolo e si apre verso il bordo ---------- */
  function initFlower() {
    var wrap = $('.hero-title'), svg = wrap && $('.hero-flower', wrap), h1 = wrap && $('h1', wrap);
    var tile = wrap && wrap.closest('.tile');
    if (!svg || !h1 || !tile) return;
    function place() {
      var range = document.createRange();
      range.selectNodeContents(h1);
      var maxRight = 0;
      Array.prototype.forEach.call(range.getClientRects(), function (r) { if (r.width > 1) maxRight = Math.max(maxRight, r.right); });
      var w = wrap.getBoundingClientRect(), t = tile.getBoundingClientRect();
      var eb = wrap.previousElementSibling, ld = wrap.nextElementSibling;
      var actions = ld && ld.nextElementSibling;
      var wide = window.matchMedia && window.matchMedia('(min-width: 56em)').matches;
      var top, bottom;
      if (wide) {
        top = t.top + 14;
        bottom = actions ? actions.getBoundingClientRect().top - 14 : w.bottom;
      } else {
        top = eb ? eb.getBoundingClientRect().bottom + 6 : w.top;
        bottom = ld ? ld.getBoundingClientRect().top - 6 : w.bottom;
      }
      var edgeX = t.right - 8;
      var r = Math.min((bottom - top) / 2, (edgeX - maxRight) / 1.05, 300);
      if (r < 48) { svg.classList.remove('is-ready'); svg.style.width = '0px'; return; }
      var cx = edgeX - r, cy = (top + bottom) / 2;
      svg.style.left = (cx - r - w.left) + 'px';
      svg.style.top = (cy - w.top) + 'px';
      svg.style.width = (r * 2) + 'px';
      svg.style.height = (r * 2) + 'px';
      svg.classList.add('is-ready');
    }
    var tm = null;
    window.addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(place, 100); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
  }

  function init() { initHero(); initFlower(); initMarquee(); initCarousel(); initExplorer(); initRest(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
