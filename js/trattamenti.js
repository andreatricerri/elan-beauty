/* =========================================================================
   Élan Beauty — trattamenti.js
   Catalogo con ricerca, filtri combinabili (categoria, durata, budget),
   ordinamento, conteggio, stato vuoto e sincronizzazione con l'URL.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc, $ = ELAN.$, $$ = ELAN.$$;

  var DURATIONS = [
    { id: '', label: 'Qualsiasi durata', test: function () { return true; } },
    { id: 'breve', label: 'Fino a 30 min', test: function (m) { return m <= 30; } },
    { id: 'media', label: 'Da 31 a 60 min', test: function (m) { return m > 30 && m <= 60; } },
    { id: 'lunga', label: 'Oltre 60 min', test: function (m) { return m > 60; } }
  ];
  var BUDGETS = [
    { id: '', label: 'Qualsiasi budget', max: Infinity },
    { id: '20', label: 'Fino a 20 €', max: 2000 },
    { id: '40', label: 'Fino a 40 €', max: 4000 },
    { id: '60', label: 'Fino a 60 €', max: 6000 }
  ];
  var SORTS = {
    consigliati: null,
    'prezzo-asc': function (a, b) { return a.priceCents - b.priceCents; },
    'prezzo-desc': function (a, b) { return b.priceCents - a.priceCents; },
    'durata-asc': function (a, b) { return a.durationMin - b.durationMin; }
  };

  var state = { q: '', cats: [], dur: '', budget: '', sort: 'consigliati' };

  function readUrl() {
    var q = ELAN.param('q');
    var cat = ELAN.param('categoria');
    var dur = ELAN.param('durata');
    var bud = ELAN.param('budget');
    var sort = ELAN.param('ordina');
    state.q = q ? q.slice(0, 60) : '';
    state.cats = cat ? cat.split(',').filter(function (c) { return !!ELAN.getCategory(c); }) : [];
    state.dur = DURATIONS.some(function (d) { return d.id === dur; }) ? dur : '';
    state.budget = BUDGETS.some(function (b) { return b.id === bud; }) ? bud : '';
    state.sort = SORTS.hasOwnProperty(sort) ? sort : 'consigliati';
  }

  function writeUrl() {
    if (!window.history || !history.replaceState) return;
    var p = [];
    if (state.q) p.push('q=' + encodeURIComponent(state.q));
    if (state.cats.length) p.push('categoria=' + state.cats.map(encodeURIComponent).join(','));
    if (state.dur) p.push('durata=' + state.dur);
    if (state.budget) p.push('budget=' + state.budget);
    if (state.sort !== 'consigliati') p.push('ordina=' + state.sort);
    try { history.replaceState(null, '', window.location.pathname + (p.length ? '?' + p.join('&') : '')); } catch (err) { /* file:// in alcuni browser */ }
  }

  function filtered() {
    var nq = ELAN.normalize(state.q);
    var durDef = DURATIONS.filter(function (d) { return d.id === state.dur; })[0] || DURATIONS[0];
    var budDef = BUDGETS.filter(function (b) { return b.id === state.budget; })[0] || BUDGETS[0];
    var list = D.treatments.filter(function (t) {
      if (state.cats.length && state.cats.indexOf(t.category) === -1) return false;
      if (!durDef.test(t.durationMin)) return false;
      if (t.priceCents > budDef.max) return false;
      if (nq) {
        var cat = ELAN.getCategory(t.category);
        var hay = ELAN.normalize([t.name, t.short, t.description, cat ? cat.label : ''].join(' '));
        var words = nq.split(/\s+/);
        for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) === -1) return false;
      }
      return true;
    });
    if (SORTS[state.sort]) list = list.slice().sort(SORTS[state.sort]);
    return list;
  }

  function activeCount() {
    return state.cats.length + (state.dur ? 1 : 0) + (state.budget ? 1 : 0);
  }

  var els = {};

  function buildFilters() {
    els.catOptions.innerHTML = D.categories.map(function (c) {
      var n = D.treatments.filter(function (t) { return t.category === c.id; }).length;
      return '<label class="check"><input type="checkbox" name="categoria" value="' + e(c.id) + '"><span>' + e(c.label) + ' <span class="muted">(' + n + ')</span></span></label>';
    }).join('');
    els.durOptions.innerHTML = DURATIONS.map(function (d, i) {
      return '<label class="check"><input type="radio" name="durata" value="' + d.id + '"' + (i === 0 ? ' checked' : '') + '><span>' + e(d.label) + '</span></label>';
    }).join('');
    els.budOptions.innerHTML = BUDGETS.map(function (b, i) {
      return '<label class="check"><input type="radio" name="budget" value="' + b.id + '"' + (i === 0 ? ' checked' : '') + '><span>' + e(b.label) + '</span></label>';
    }).join('');
  }

  function syncControls() {
    els.search.value = state.q;
    els.sort.value = state.sort;
    $$('input[name="categoria"]', els.form).forEach(function (i) { i.checked = state.cats.indexOf(i.value) !== -1; });
    $$('input[name="durata"]', els.form).forEach(function (i) { i.checked = i.value === state.dur; });
    $$('input[name="budget"]', els.form).forEach(function (i) { i.checked = i.value === state.budget; });
  }

  function chip(label, key, value) {
    return '<li><button type="button" class="chip" data-remove="' + key + '" data-value="' + e(value) + '" aria-label="Rimuovi filtro: ' + e(label) + '">' + e(label) + ' ' + ELAN.icon('x') + '</button></li>';
  }

  function render() {
    var list = filtered();
    els.results.innerHTML = list.map(function (t) { return ELAN.treatmentCard(t); }).join('');
    els.empty.hidden = list.length > 0;
    els.results.hidden = list.length === 0;
    ELAN.fillGrid(els.results, ELAN.FILL_TILE_HTML);
    var txt = list.length === 1 ? '1 trattamento trovato' : list.length + ' trattamenti trovati';
    els.count.textContent = txt;
    els.applyBtn.textContent = list.length ? 'Mostra ' + (list.length === 1 ? '1 risultato' : list.length + ' risultati') : 'Nessun risultato';

    var n = activeCount();
    els.badge.textContent = n;
    els.badge.hidden = n === 0;
    els.filtersBtn.setAttribute('aria-label', 'Filtri' + (n ? ', ' + n + ' attivi' : ''));

    var chips = [];
    if (state.q) chips.push(chip('Ricerca: “' + state.q + '”', 'q', ''));
    state.cats.forEach(function (c) { chips.push(chip(ELAN.getCategory(c).label, 'cat', c)); });
    if (state.dur) chips.push(chip(DURATIONS.filter(function (d) { return d.id === state.dur; })[0].label, 'dur', ''));
    if (state.budget) chips.push(chip(BUDGETS.filter(function (b) { return b.id === state.budget; })[0].label, 'budget', ''));
    els.active.innerHTML = chips.join('');
    els.active.hidden = chips.length === 0;
    els.resetInline.hidden = chips.length === 0;
    writeUrl();
  }

  function reset() {
    state = { q: '', cats: [], dur: '', budget: '', sort: state.sort };
    syncControls();
    render();
  }

  /* Pannello filtri a schermo intero su smartphone/tablet */
  var releaseTrap = null;
  var mq = window.matchMedia ? window.matchMedia('(max-width: 63.99em)') : { matches: false };
  function openPanel() {
    els.panel.classList.add('is-open');
    els.panel.setAttribute('role', 'dialog');
    els.panel.setAttribute('aria-modal', 'true');
    els.panel.setAttribute('aria-labelledby', 'filters-title');
    document.body.classList.add('is-locked');
    els.filtersBtn.setAttribute('aria-expanded', 'true');
    releaseTrap = ELAN.trapFocus(els.panel);
    var c = $('[data-filters-close].icon-btn', els.panel);
    if (c) c.focus();
  }
  function closePanel(focusBack) {
    if (!els.panel.classList.contains('is-open')) return;
    els.panel.classList.remove('is-open');
    els.panel.removeAttribute('role');
    els.panel.removeAttribute('aria-modal');
    document.body.classList.remove('is-locked');
    els.filtersBtn.setAttribute('aria-expanded', 'false');
    if (releaseTrap) releaseTrap();
    if (focusBack !== false) els.filtersBtn.focus();
  }

  function init() {
    els.form = $('#filters-form');
    if (!els.form) return;
    els.panel = $('#filters-panel');
    els.catOptions = $('[data-cat-options]');
    els.durOptions = $('[data-dur-options]');
    els.budOptions = $('[data-budget-options]');
    els.search = $('#search-input');
    els.sort = $('#sort-select');
    els.results = $('[data-results]');
    els.empty = $('[data-empty]');
    els.count = $('[data-count]');
    els.active = $('[data-active-filters]');
    els.badge = $('[data-filter-badge]');
    els.filtersBtn = $('[data-filters-open]');
    els.applyBtn = $('[data-filters-apply]');
    els.resetInline = $('[data-reset-inline]');

    buildFilters();
    readUrl();
    syncControls();
    render();

    els.form.addEventListener('change', function () {
      state.cats = $$('input[name="categoria"]:checked', els.form).map(function (i) { return i.value; });
      var d = $('input[name="durata"]:checked', els.form);
      var b = $('input[name="budget"]:checked', els.form);
      state.dur = d ? d.value : '';
      state.budget = b ? b.value : '';
      render();
    });
    els.form.addEventListener('submit', function (ev) { ev.preventDefault(); });

    var t = null;
    els.search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = els.search.value.trim().slice(0, 60); render(); }, 180);
    });
    $('#search-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      state.q = els.search.value.trim().slice(0, 60);
      render();
    });
    els.sort.addEventListener('change', function () { state.sort = els.sort.value; render(); });

    $$('[data-filters-reset]').forEach(function (b) { b.addEventListener('click', reset); });
    els.resetInline.addEventListener('click', reset);
    els.active.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-remove]');
      if (!b) return;
      var k = b.getAttribute('data-remove');
      if (k === 'q') state.q = '';
      if (k === 'cat') state.cats = state.cats.filter(function (c) { return c !== b.getAttribute('data-value'); });
      if (k === 'dur') state.dur = '';
      if (k === 'budget') state.budget = '';
      syncControls();
      render();
      els.count.focus();
    });

    els.filtersBtn.addEventListener('click', openPanel);
    $$('[data-filters-close]', els.panel).forEach(function (b) { b.addEventListener('click', function () { closePanel(); }); });
    els.panel.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePanel(); });
    function onMq() { if (!mq.matches) closePanel(false); }
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
