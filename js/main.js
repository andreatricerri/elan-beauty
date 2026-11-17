/* =========================================================================
   Élan Beauty — main.js
   Utility condivise, header/drawer, modali, accordion, form demo, footer.
   Richiede js/data.js caricato prima (script defer in ordine).
   ========================================================================= */
(function () {
  'use strict';

  var D = window.SITE_DATA || {};
  var ELAN = (window.ELAN = window.ELAN || {});

  /* ---------- Utility ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  ELAN.$ = $;
  ELAN.$$ = $$;

  ELAN.esc = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var eurFmt = (typeof Intl !== 'undefined' && Intl.NumberFormat)
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
    : null;
  /* Importi sempre in centesimi interi */
  ELAN.eur = function (cents) {
    var c = Math.round(Number(cents) || 0);
    if (eurFmt) return eurFmt.format(c / 100);
    return (c / 100).toFixed(2).replace('.', ',') + ' €';
  };

  ELAN.duration = function (min) {
    min = Number(min) || 0;
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60), m = min % 60;
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  };

  ELAN.param = function (name) {
    try { return new URLSearchParams(window.location.search).get(name); }
    catch (e) {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  };

  ELAN.normalize = function (s) {
    s = String(s || '').toLowerCase();
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* vecchi browser */ }
    return s.replace(/[’']/g, ' ').trim();
  };

  /* ---------- Accesso ai dati ---------- */
  function byId(list, id) {
    for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  ELAN.getTreatment = function (id) { return byId(D.treatments, id); };
  ELAN.getCategory = function (id) { return byId(D.categories, id); };
  ELAN.getStaff = function (id) { return byId(D.staff, id); };
  ELAN.getPackage = function (id) { return byId(D.packages, id); };

  /* Totali pacchetto calcolati in centesimi */
  ELAN.packageTotals = function (pkg) {
    var value = 0, duration = 0, count = 0;
    (pkg.items || []).forEach(function (it) {
      var t = ELAN.getTreatment(it.treatmentId);
      if (!t) return;
      var q = Math.max(1, it.qty || 1);
      value += t.priceCents * q;
      duration += t.durationMin * q;
      count += q;
    });
    var discounted = Math.round(value * (100 - (pkg.discountPercent || 0)) / 100);
    var price = Math.floor(discounted / 100) * 100; /* arrotondato per difetto all'euro */
    return { valueCents: value, priceCents: price, savingCents: value - price, durationMin: duration, count: count };
  };

  /* ---------- Icone SVG ---------- */
  var ICONS = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',
    leaf: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19 13 11"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6L20 9"/><path d="M20 4v5h-5"/>',
    cup: '<path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>'
  };
  ELAN.icon = function (name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  };

  /* ---------- Render condivisi ---------- */
  ELAN.detailUrl = function (id) { return 'dettaglio-trattamento.html?id=' + encodeURIComponent(id); };
  ELAN.bookUrl = function (id, extra) {
    var q = 'trattamento=' + encodeURIComponent(id);
    if (extra) q += '&' + extra;
    return 'prenota.html?' + q;
  };

  ELAN.treatmentCard = function (t, opts) {
    opts = opts || {};
    var h = opts.headingLevel || 3;
    var cat = ELAN.getCategory(t.category);
    var catLabel = cat ? cat.label : '';
    var e = ELAN.esc;
    return '' +
      '<article class="t-card">' +
        '<div class="t-card__media">' +
          '<img src="' + e(t.image) + '" alt="Immagine segnaposto per ' + e(t.name) + '" width="800" height="600" loading="lazy" decoding="async">' +
          (catLabel ? '<span class="tag tag--light">' + e(catLabel) + '</span>' : '') +
          '<span class="t-card__chip">' + ELAN.icon('clock') + '<span><span class="visually-hidden">Durata: </span>' + ELAN.duration(t.durationMin) + '</span></span>' +
        '</div>' +
        '<div class="t-card__body">' +
          '<h' + h + ' class="t-card__title"><a href="' + ELAN.detailUrl(t.id) + '">' + e(t.name) + '</a></h' + h + '>' +
          '<p class="t-card__text">' + e(t.short) + '</p>' +
          '<div class="t-card__foot">' +
            '<span class="price"><span class="visually-hidden">Prezzo dimostrativo: </span>' + ELAN.eur(t.priceCents) + '</span>' +
            '<div class="t-card__actions">' +
              '<a class="btn btn-ghost" href="' + ELAN.detailUrl(t.id) + '" aria-label="Dettagli: ' + e(t.name) + '">Dettagli</a>' +
              '<a class="btn btn-primary" href="' + ELAN.bookUrl(t.id) + '" aria-label="Prenota: ' + e(t.name) + '">Prenota</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  };

  ELAN.packageCard = function (pkg, opts) {
    opts = opts || {};
    var e = ELAN.esc;
    var tot = ELAN.packageTotals(pkg);
    var h = opts.headingLevel || 3;
    var items = (pkg.items || []).map(function (it) {
      var t = ELAN.getTreatment(it.treatmentId);
      if (!t) return '';
      var q = Math.max(1, it.qty || 1);
      return '<li><span>' + ELAN.icon('check') + '<span><a href="' + ELAN.detailUrl(t.id) + '">' + e(t.name) + '</a>' + (q > 1 ? ' × ' + q : '') + '</span></span>' +
        '<span class="muted">' + ELAN.eur(t.priceCents * q) + '</span></li>';
    }).join('');
    return '<article class="pkg' + (pkg.featured ? ' pkg--featured' : '') + '" id="pacchetto-' + e(pkg.id) + '">' +
      (pkg.featured ? '<span class="tag pkg__badge">Il più scelto nella demo</span>' : '') +
      '<h' + h + '>' + e(pkg.name) + '</h' + h + '>' +
      '<p class="pkg__tagline">' + e(pkg.tagline) + '</p>' +
      '<ul class="pkg__items">' + items + '</ul>' +
      '<dl class="pkg__math">' +
        '<div><dt>Valore dei singoli trattamenti</dt><dd>' + ELAN.eur(tot.valueCents) + '</dd></div>' +
        '<div><dt>Risparmio (' + pkg.discountPercent + '%, arrotondato)</dt><dd>− ' + ELAN.eur(tot.savingCents) + '</dd></div>' +
        '<div><dt>Durata complessiva</dt><dd>' + ELAN.duration(tot.durationMin) + '</dd></div>' +
        '<div class="pkg__total"><dt>Prezzo pacchetto</dt><dd>' + ELAN.eur(tot.priceCents) + '</dd></div>' +
      '</dl>' +
      (opts.compact ? '' :
        '<div class="small"><strong>Validità:</strong> ' + e(pkg.validity) + '</div>' +
        '<ul class="pkg__conditions">' + (pkg.conditions || []).map(function (c) { return '<li>' + e(c) + '</li>'; }).join('') + '</ul>') +
      '<a class="btn ' + (pkg.featured ? 'btn-primary' : 'btn-outline') + '" href="prenota.html?pacchetto=' + encodeURIComponent(pkg.id) + '" aria-label="Richiedi il pacchetto ' + e(pkg.name) + '">Richiedi questo pacchetto</a>' +
    '</article>';
  };

  /* Riempie l'ultima riga incompleta di una griglia con una card di invito (niente buchi) */
  ELAN.fillGrid = function (grid, html) {
    function run() {
      var old = grid.querySelector('.fill-tile');
      if (old) old.parentNode.removeChild(old);
      var n = grid.children.length;
      if (!n || grid.hidden) return;
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      var rem = n % cols;
      if (cols < 2 || rem === 0) return;
      var tile = document.createElement('div');
      tile.className = 'fill-tile';
      tile.style.gridColumn = 'span ' + (cols - rem);
      tile.innerHTML = html;
      grid.appendChild(tile);
    }
    if (!grid.__fillBound) {
      grid.__fillBound = true;
      var t = null;
      window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(run, 120); });
    }
    run();
  };
  ELAN.FILL_TILE_HTML =
    '<p class="eyebrow">Non sai cosa scegliere?</p>' +
    '<h3>Confronta tutto nel listino o lasciati guidare da un pacchetto</h3>' +
    '<p>Il listino riunisce durate e prezzi dimostrativi di ogni trattamento; i pacchetti combinano più servizi con il calcolo del risparmio sempre visibile.</p>' +
    '<div class="btn-row"><a class="btn btn-primary" href="listino.html">Apri il listino</a><a class="btn btn-outline" href="pacchetti.html">Vedi i pacchetti</a></div>';

  ELAN.accordionItem = function (idBase, title, bodyHtml, open, headingLevel) {
    var h = headingLevel || 3;
    var e = ELAN.esc;
    return '<div class="accordion__item">' +
      '<h' + h + ' class="accordion__heading">' +
        '<button type="button" class="accordion__btn" id="' + idBase + '-btn" aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + idBase + '-panel">' +
          '<span>' + e(title) + '</span>' + ELAN.icon('plus') +
        '</button>' +
      '</h' + h + '>' +
      '<div class="accordion__panel" id="' + idBase + '-panel" role="region" aria-labelledby="' + idBase + '-btn"' + (open ? '' : ' hidden') + '>' + bodyHtml + '</div>' +
    '</div>';
  };

  /* ---------- Focus, inert e blocco scroll ---------- */
  var FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  ELAN.focusables = function (root) {
    return $$(FOCUSABLE, root).filter(function (el) {
      return !el.closest('[hidden]') && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
    });
  };
  ELAN.trapFocus = function (container) {
    function onKey(ev) {
      if (ev.key !== 'Tab') return;
      var f = ELAN.focusables(container);
      if (!f.length) { ev.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  };

  var lockCount = 0;
  ELAN.isolate = function (keepEl, on) {
    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child === keepEl || child.tagName === 'SCRIPT') return;
      if (on) {
        if (!child.hasAttribute('data-was-inert')) {
          child.setAttribute('data-was-inert', child.inert ? '1' : '0');
        }
        child.inert = true;
        child.setAttribute('aria-hidden', 'true');
      } else if (child.hasAttribute('data-was-inert')) {
        var was = child.getAttribute('data-was-inert') === '1';
        child.inert = was;
        if (!was) child.removeAttribute('aria-hidden');
        child.removeAttribute('data-was-inert');
      }
    });
    lockCount += on ? 1 : -1;
    if (lockCount < 0) lockCount = 0;
    document.body.classList.toggle('is-locked', lockCount > 0);
  };

  /* ---------- Modale generica ---------- */
  var modalSeq = 0;
  ELAN.openModal = function (opts) {
    opts = opts || {};
    var prevFocus = document.activeElement;
    var id = 'modal-' + (++modalSeq);
    var wrap = document.createElement('div');
    wrap.className = 'modal' + (opts.className ? ' ' + opts.className : '');
    wrap.innerHTML =
      '<div class="modal__backdrop" data-modal-close></div>' +
      '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="' + id + '-title" tabindex="-1">' +
        (opts.noDefaultClose ? '' : '<button type="button" class="icon-btn modal__close" data-modal-close aria-label="Chiudi finestra">' + ELAN.icon('x') + '</button>') +
        (opts.title ? '<h2 id="' + id + '-title">' + ELAN.esc(opts.title) + '</h2>' : '') +
        (opts.html || '') +
      '</div>';
    document.body.appendChild(wrap);
    var dialog = $('.modal__dialog', wrap);
    if (!opts.title) dialog.setAttribute('aria-label', opts.label || 'Finestra');
    if (!opts.title) dialog.removeAttribute('aria-labelledby');
    ELAN.isolate(wrap, true);
    var release = ELAN.trapFocus(dialog);
    requestAnimationFrame(function () { wrap.classList.add('is-open'); });

    var api = {
      el: wrap,
      dialog: dialog,
      close: function () {
        document.removeEventListener('keydown', onKey);
        release();
        ELAN.isolate(wrap, false);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (typeof opts.onClose === 'function') opts.onClose();
        if (prevFocus && typeof prevFocus.focus === 'function' && document.contains(prevFocus)) prevFocus.focus();
      }
    };
    function onKey(ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); api.close(); }
      else if (typeof opts.onKey === 'function') opts.onKey(ev, api);
    }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-modal-close]')) api.close();
    });
    if (typeof opts.onOpen === 'function') opts.onOpen(api);
    var target = opts.initialFocus ? $(opts.initialFocus, dialog) : null;
    (target || ELAN.focusables(dialog)[0] || dialog).focus();
    return api;
  };

  /* Avviso per funzioni non reali (WhatsApp, social, ecc.) */
  var DEMO_TEXT = {
    whatsapp: { title: 'WhatsApp non attivo', text: 'Questo è un progetto dimostrativo: il pulsante WhatsApp non apre alcuna chat reale. In un sito vero andrebbe configurato con un numero autorizzato.' },
    instagram: { title: 'Profilo Instagram dimostrativo', text: 'Élan Beauty è un salone di fantasia e non ha profili social reali. Il link potrà essere configurato in js/data.js.' },
    facebook: { title: 'Pagina Facebook dimostrativa', text: 'Élan Beauty è un salone di fantasia e non ha profili social reali. Il link potrà essere configurato in js/data.js.' },
    phone: { title: 'Telefono non disponibile', text: 'Nessun numero di telefono è pubblicato: il salone è fittizio e non è contattabile.' },
    generic: { title: 'Funzione dimostrativa', text: 'Questa funzione non è attiva in un progetto portfolio.' }
  };
  ELAN.demoNotice = function (kind) {
    var c = DEMO_TEXT[kind] || DEMO_TEXT.generic;
    ELAN.openModal({
      title: c.title,
      html: '<p class="muted">' + ELAN.esc(c.text) + '</p>' +
        '<div class="notice" role="note">' + ELAN.icon('info') + '<p>Nessun dato è stato inviato e nessuna pagina esterna è stata aperta.</p></div>' +
        '<div class="btn-row" style="margin-top:1.5rem"><button type="button" class="btn btn-primary" data-modal-close>Ho capito</button></div>'
    });
  };

  function configuredUrl(kind) {
    var c = D.contact || {};
    if (kind === 'whatsapp') return c.whatsappUrl || '';
    var s = (c.socials || []).filter(function (x) { return x.id === kind; })[0];
    return s && s.url ? s.url : '';
  }

  /* ---------- Header: sottomenu desktop ---------- */
  function initSubmenus() {
    $$('.nav-desktop .sub-toggle').forEach(function (btn) {
      var menu = document.getElementById(btn.getAttribute('aria-controls'));
      var li = btn.closest('.has-sub');
      if (!menu || !li) return;
      function set(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.hidden = !open;
      }
      btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
      btn.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') {
          ev.preventDefault(); set(true);
          var first = $('a', menu); if (first) first.focus();
        }
      });
      li.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
      });
      li.addEventListener('focusout', function (ev) {
        if (ev.relatedTarget && !li.contains(ev.relatedTarget)) set(false);
      });
      document.addEventListener('click', function (ev) { if (!li.contains(ev.target)) set(false); });
    });
  }

  /* ---------- Drawer mobile ---------- */
  function initDrawer() {
    var toggle = $('.menu-toggle');
    var drawer = document.getElementById('drawer');
    if (!toggle || !drawer) return;
    var panel = $('.drawer-panel', drawer);
    var release = null;

    function open() {
      drawer.hidden = false;
      drawer.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      ELAN.isolate(drawer, true);
      release = ELAN.trapFocus(panel);
      var closeBtn = $('[data-drawer-close].icon-btn', drawer);
      (closeBtn || panel).focus();
    }
    function close(returnFocus) {
      if (drawer.hidden) return;
      drawer.hidden = true;
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      ELAN.isolate(drawer, false);
      if (release) release();
      if (returnFocus !== false) toggle.focus();
    }
    toggle.addEventListener('click', open);
    drawer.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-drawer-close]')) close();
    });
    drawer.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') close(); });

    $$('.sub-toggle', drawer).forEach(function (btn) {
      var menu = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var openNow = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', openNow ? 'true' : 'false');
        if (menu) menu.hidden = !openNow;
      });
    });

    var mq = window.matchMedia ? window.matchMedia('(min-width: 64em)') : null;
    function onMq() { if (mq.matches) close(false); }
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
  }

  /* ---------- Accordion (delegato) ---------- */
  function initAccordions() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.accordion__btn');
      if (!btn) return;
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.hidden = !open;
    });
  }

  /* ---------- Validazione form ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  ELAN.validateField = function (field) {
    var v = (field.type === 'checkbox') ? field.checked : String(field.value || '').trim();
    var label = field.getAttribute('data-label') || 'Questo campo';
    var msg = '';
    if (field.required && (field.type === 'checkbox' ? !v : v === '')) {
      msg = field.type === 'checkbox' ? 'Conferma per continuare.' : label + ' è obbligatorio.';
    } else if (v && field.type === 'email' && !EMAIL_RE.test(v)) {
      msg = 'Inserisci un indirizzo email valido (es. nome@esempio.example).';
    } else if (v && field.getAttribute('data-minlength') && v.length < Number(field.getAttribute('data-minlength'))) {
      msg = label + ' deve contenere almeno ' + field.getAttribute('data-minlength') + ' caratteri.';
    } else if (v && field.getAttribute('data-pattern') && !new RegExp(field.getAttribute('data-pattern')).test(v)) {
      msg = field.getAttribute('data-pattern-msg') || 'Formato non valido.';
    }
    ELAN.setFieldError(field, msg);
    return !msg;
  };
  ELAN.setFieldError = function (field, msg) {
    var errId = field.id + '-error';
    var err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = errId;
      var host = field.closest('.field') || field.parentNode;
      host.appendChild(err);
    }
    err.innerHTML = msg ? ELAN.icon('alert') + '<span>' + ELAN.esc(msg) + '</span>' : '';
    var described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (described.indexOf(errId) === -1) described.push(errId);
    } else {
      field.removeAttribute('aria-invalid');
      described = described.filter(function (d) { return d !== errId; });
    }
    if (described.length) field.setAttribute('aria-describedby', described.join(' '));
    else field.removeAttribute('aria-describedby');
  };
  ELAN.validateForm = function (form) {
    var fields = $$('input, select, textarea', form).filter(function (f) { return f.type !== 'hidden' && !f.disabled && !f.closest('[hidden]'); });
    var firstBad = null;
    fields.forEach(function (f) { if (!ELAN.validateField(f) && !firstBad) firstBad = f; });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };
  function liveValidation(form) {
    form.addEventListener('blur', function (ev) {
      var f = ev.target;
      if (f.matches && f.matches('input, select, textarea') && (f.value || f.getAttribute('aria-invalid'))) ELAN.validateField(f);
    }, true);
    /* Rimuove l'errore mentre si scrive: evita spostamenti del layout al tocco sul pulsante */
    form.addEventListener('input', function (ev) {
      var f = ev.target;
      if (f.getAttribute && f.getAttribute('aria-invalid')) ELAN.validateField(f);
    });
    form.addEventListener('change', function (ev) {
      var f = ev.target;
      if (f.getAttribute && f.getAttribute('aria-invalid')) ELAN.validateField(f);
    });
  }
  ELAN.liveValidation = liveValidation;

  /* Form dimostrativi: nessun invio, nessuna memorizzazione */
  function initDemoForms() {
    $$('form[data-demo-form]').forEach(function (form) {
      form.setAttribute('novalidate', '');
      liveValidation(form);
      var status = $('[data-form-status]', form.parentNode) || $('[data-form-status]', form);
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (status) { status.hidden = true; status.innerHTML = ''; }
        if (!ELAN.validateForm(form)) return;
        var kind = form.getAttribute('data-demo-form');
        var msg = kind === 'newsletter'
          ? '<strong>Iscrizione simulata.</strong> Nessuna email è stata registrata o inviata: la newsletter è solo dimostrativa.'
          : '<strong>Messaggio non inviato.</strong> Questo è un progetto dimostrativo: nessun dato è stato trasmesso né salvato. Il modulo è stato svuotato.';
        form.reset();
        $$('[aria-invalid]', form).forEach(function (f) { ELAN.setFieldError(f, ''); });
        if (status) {
          status.innerHTML = ELAN.icon('check') + '<div>' + msg + '</div>';
          status.hidden = false;
          status.focus();
        }
      });
    });
  }

  /* ---------- Pulsanti demo (WhatsApp, social) ---------- */
  function initDemoButtons() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-demo]');
      if (!btn) return;
      ev.preventDefault();
      var kind = btn.getAttribute('data-demo');
      /* Punto di configurazione futura: se in data.js è presente un URL autorizzato, lo apre. */
      var url = configuredUrl(kind);
      if (url) { window.open(url, '_blank', 'noopener'); return; }
      ELAN.demoNotice(kind);
    });
  }

  /* ---------- Orari e anno nel footer ---------- */
  var DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  ELAN.DAYS = DAYS;
  ELAN.hoursHtml = function () {
    var order = [1, 2, 3, 4, 5, 6, 0];
    return order.map(function (d) {
      var h = D.hours ? D.hours[d] : null;
      return '<li' + (h ? '' : ' class="closed"') + '><span>' + DAYS[d] + '</span><span>' + (h ? h[0] + '–' + h[1] : 'Chiuso') + '</span></li>';
    }).join('');
  };
  function initFooter() {
    $$('[data-hours]').forEach(function (el) { el.innerHTML = ELAN.hoursHtml(); });
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Avvio ---------- */
  function initHeaderScroll() {
    var h = $('.site-header');
    if (!h) return;
    var ticking = false;
    function upd() { h.classList.toggle('is-scrolled', window.pageYOffset > 8); ticking = false; }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  function init() {
    document.documentElement.classList.add('js');
    initHeaderScroll();
    initSubmenus();
    initDrawer();
    initAccordions();
    initDemoForms();
    initDemoButtons();
    initFooter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
