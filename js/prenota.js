/* =========================================================================
   Élan Beauty — prenota.js
   Prenotazione simulata a passi:
   1 trattamento · 2 operatrice · 3 data · 4 fascia · 5 contatti · 6 riepilogo.
   Disponibilità generate in modo deterministico (simulate, non confermate).
   Nessun dato viene inviato o salvato nel browser.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D || !ELAN.avail) return;
  var e = ELAN.esc, $ = ELAN.$, $$ = ELAN.$$;

  var STEPS = ['Trattamento', 'Operatrice', 'Data', 'Fascia oraria', 'Contatti', 'Riepilogo'];
  var ANY = 'indifferente';
  var state = { step: 1, treatment: null, staff: '', date: '', slot: null, pkg: null };
  var els = {};

  var A = ELAN.avail;
  var pad = A.pad, toISO = A.toISO, fromISO = A.fromISO, today = A.today, addDays = A.addDays;
  var fmtDate = A.fmtDate, shortFmt = A.shortFmt, minDate = A.minDate, maxDate = A.maxDate, toHHMM = A.toHHMM;
  var closedReason = A.closedReason, computeSlots = A.computeSlots, nextAvailable = A.nextAvailable, compatibleStaff = A.compatibleStaff;

  /* ---------- Render ---------- */
  function renderStepper() {
    els.stepNum.textContent = state.step;
    els.stepName.textContent = STEPS[state.step - 1];
    els.bar.style.width = Math.round(state.step / STEPS.length * 100) + '%';
    els.stepper.innerHTML = STEPS.map(function (s, i) {
      var n = i + 1;
      var cls = n < state.step ? 'is-done' : (n === state.step ? 'is-current' : '');
      return '<li class="' + cls + '"' + (n === state.step ? ' aria-current="step"' : '') + '>' + (n < state.step ? ELAN.icon('check') : '') + n + '. ' + e(s) + '</li>';
    }).join('');
  }

  function showStep(n, focus) {
    state.step = n;
    $$('[data-step]', els.form).forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== n; });
    renderStepper();
    if (n === 2) renderStaff();
    if (n === 3) renderQuickDates();
    if (n === 4) renderSlots();
    if (n === 6) renderSummary(els.finalSummary, true);
    if (focus !== false) {
      var h = $('[data-step="' + n + '"] h2', els.form);
      if (h) {
        h.focus();
        var top = els.progress.getBoundingClientRect().top + window.pageYOffset - 90;
        if (els.progress.getBoundingClientRect().top < 70) window.scrollTo(0, Math.max(0, top));
      }
    }
  }

  function renderTreatmentSelect() {
    els.treatment.innerHTML = '<option value="">Seleziona un trattamento</option>' + D.categories.map(function (c) {
      var items = D.treatments.filter(function (t) { return t.category === c.id; });
      if (!items.length) return '';
      return '<optgroup label="' + e(c.label) + '">' + items.map(function (t) {
        return '<option value="' + e(t.id) + '">' + e(t.name) + ' · ' + ELAN.duration(t.durationMin) + ' · ' + ELAN.eur(t.priceCents) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
    if (state.treatment) els.treatment.value = state.treatment.id;
  }

  function renderPreview() {
    var t = state.treatment;
    if (!t) { els.preview.innerHTML = ''; return; }
    var staff = compatibleStaff(t).map(function (s) { return s.name; }).join(', ');
    els.preview.innerHTML = '<div class="notice" style="margin-top:1rem">' + ELAN.icon('sparkle') +
      '<div><strong>' + e(t.name) + '</strong>' + e(t.short) +
      '<ul class="meta" style="margin-top:.5rem"><li>' + ELAN.icon('clock') + ELAN.duration(t.durationMin) + '</li><li>' + ELAN.icon('tag') + ELAN.eur(t.priceCents) + ' (demo)</li><li>' + ELAN.icon('user') + e(staff) + '</li></ul>' +
      '<a href="' + ELAN.detailUrl(t.id) + '">Leggi la scheda del trattamento</a></div></div>';
  }

  function renderStaff() {
    var t = state.treatment;
    var list = compatibleStaff(t);
    var html = list.map(function (s) {
      var days = s.workDays.map(function (d) { return ELAN.DAYS[d].slice(0, 3); }).join(' · ');
      return '<label class="choice"><input type="radio" name="staff" value="' + e(s.id) + '"' + (state.staff === s.id ? ' checked' : '') + '>' +
        '<img class="avatar" src="' + e(s.avatar) + '" alt="" width="44" height="44">' +
        '<span class="choice__text"><strong>' + e(s.name) + '</strong><small>In salone (demo): ' + e(days) + '</small></span></label>';
    }).join('');
    html += '<label class="choice"><input type="radio" name="staff" value="' + ANY + '"' + (state.staff === ANY ? ' checked' : '') + '>' +
      '<span class="icon-btn" aria-hidden="true" style="pointer-events:none">' + ELAN.icon('user') + '</span>' +
      '<span class="choice__text"><strong>Indifferente</strong><small>Più fasce disponibili</small></span></label>';
    els.staffOptions.innerHTML = html;

    var others = D.staff.filter(function (s) { return list.indexOf(s) === -1; });
    els.staffNote.innerHTML = others.length
      ? ELAN.icon('info') + '<p>Per “' + e(t.name) + '” nella demo non sono disponibili: ' + e(others.map(function (s) { return s.name; }).join(', ')) + '.</p>'
      : '';
    els.staffNote.hidden = !others.length;
  }

  function renderQuickDates() {
    els.date.min = toISO(minDate());
    els.date.max = toISO(maxDate());
    var out = [], d = minDate(), i = 0;
    while (out.length < 6 && d <= maxDate() && i < 60) {
      var iso = toISO(d);
      if (computeSlots(iso, state.treatment, state.staff).slots.length) out.push(iso);
      d = addDays(d, 1); i++;
    }
    els.quick.innerHTML = out.length
      ? '<p class="small muted" style="margin:0 0 .5rem">Prossime date con fasce simulate libere:</p><div class="chips">' + out.map(function (iso) {
          return '<button type="button" class="chip" data-quick="' + iso + '" aria-pressed="' + (state.date === iso ? 'true' : 'false') + '">' + e(shortFmt ? shortFmt.format(fromISO(iso)) : iso) + '</button>';
        }).join('') + '</div>'
      : '<p class="small muted">Nessuna data con disponibilità simulata nei prossimi giorni per questa scelta.</p>';
  }

  function renderSlots() {
    var t = state.treatment;
    var res = computeSlots(state.date, t, state.staff);
    var staffLabel = state.staff === ANY ? 'operatrice indifferente' : (ELAN.getStaff(state.staff) || {}).name;
    els.slotContext.textContent = t.name + ' · ' + ELAN.duration(t.durationMin) + ' · ' + fmtDate(state.date) + ' · ' + staffLabel;

    if (!res.slots.length) {
      var alt = nextAvailable(state.date, t, state.staff);
      var actions = '';
      if (alt) actions += '<button type="button" class="btn btn-outline" data-goto-date="' + alt + '">Vai al ' + e(fmtDate(alt)) + '</button>';
      if (state.staff !== ANY) actions += '<button type="button" class="btn btn-ghost" data-set-any>Scegli “indifferente”</button>';
      actions += '<button type="button" class="btn btn-link" data-goto-step="3">Cambia data</button>';
      els.slots.innerHTML = '<div class="empty-state" role="status">' + ELAN.icon('calendar') +
        '<h3>Nessuna fascia disponibile</h3><p>' + e(res.message || '') + '</p>' +
        '<div class="btn-row" style="justify-content:center">' + actions + '</div></div>';
      state.slot = null;
      return;
    }
    var groups = [
      { label: 'Mattina', test: function (m) { return m < 13 * 60; } },
      { label: 'Pomeriggio', test: function (m) { return m >= 13 * 60 && m < 17 * 60; } },
      { label: 'Sera', test: function (m) { return m >= 17 * 60; } }
    ];
    els.slots.innerHTML = '<p class="small muted">' + res.slots.length + ' fasce simulate disponibili. Seleziona un orario di inizio.</p>' +
      groups.map(function (g) {
        var items = res.slots.filter(function (s) { return g.test(s.start); });
        if (!items.length) return '';
        return '<div class="slot-group" role="group" aria-label="' + g.label + '"><h3>' + g.label + '</h3><div class="slots">' + items.map(function (s) {
          var sel = state.slot && state.slot.start === s.start;
          var who = state.staff === ANY ? (ELAN.getStaff(s.staffId) || {}).name : '';
          return '<button type="button" class="slot" data-slot="' + s.start + '" data-staff-id="' + e(s.staffId) + '" aria-pressed="' + (sel ? 'true' : 'false') + '" aria-label="Ore ' + toHHMM(s.start) + ', fine prevista ' + toHHMM(s.end) + (who ? ', con ' + e(who) : '') + '">' +
            toHHMM(s.start) + (who ? '<small>' + e(who) + '</small>' : '<small>fino ' + toHHMM(s.end) + '</small>') + '</button>';
        }).join('') + '</div></div>';
      }).join('');
    if (state.slot && !res.slots.some(function (s) { return s.start === state.slot.start; })) state.slot = null;
  }

  function summaryRows(final) {
    var t = state.treatment;
    var staffName = !state.staff ? '' : (state.staff === ANY
      ? 'Indifferente' + (state.slot ? ' (assegnata: ' + (ELAN.getStaff(state.slot.staffId) || {}).name + ')' : '')
      : (ELAN.getStaff(state.staff) || {}).name);
    var rows = [
      ['Trattamento', t ? t.name : ''],
      ['Durata', t ? ELAN.duration(t.durationMin) : ''],
      ['Prezzo demo', t ? ELAN.eur(t.priceCents) : ''],
      ['Operatrice', staffName],
      ['Data', state.date ? fmtDate(state.date) : ''],
      ['Orario', state.slot ? toHHMM(state.slot.start) + '–' + toHHMM(state.slot.end) : '']
    ];
    if (state.pkg) rows.unshift(['Pacchetto', state.pkg.name]);
    if (final) {
      rows.push(['Nome', els.name.value.trim()]);
      rows.push(['Email', els.email.value.trim()]);
      if (els.phone.value.trim()) rows.push(['Telefono', els.phone.value.trim()]);
      if (els.notes.value.trim()) rows.push(['Note', els.notes.value.trim()]);
    }
    return rows;
  }
  function renderSummary(target, final) {
    var editMap = { 'Trattamento': 1, 'Operatrice': 2, 'Data': 3, 'Orario': 4, 'Nome': 5, 'Email': 5, 'Telefono': 5, 'Note': 5 };
    target.innerHTML = summaryRows(final).map(function (r) {
      var edit = final && editMap[r[0]] ? ' <button type="button" class="btn-link small" data-goto-step="' + editMap[r[0]] + '" aria-label="Modifica ' + r[0].toLowerCase() + '">Modifica</button>' : '';
      return '<div><dt>' + e(r[0]) + '</dt><dd' + (r[1] ? '' : ' class="is-empty"') + '>' + (r[1] ? e(r[1]) : 'da scegliere') + edit + '</dd></div>';
    }).join('');
  }
  function refreshLive() { renderSummary(els.liveSummary, false); }

  /* ---------- Validazione per passo ---------- */
  function validateStep(n) {
    if (n === 1) {
      return ELAN.validateField(els.treatment) || (els.treatment.focus(), false);
    }
    if (n === 2) {
      if (!state.staff) {
        els.staffErr.innerHTML = ELAN.icon('alert') + '<span>Scegli un’operatrice oppure “indifferente”.</span>';
        var first = $('input[name="staff"]', els.staffOptions); if (first) first.focus();
        return false;
      }
      els.staffErr.innerHTML = '';
      return true;
    }
    if (n === 3) {
      var v = els.date.value;
      var d = fromISO(v);
      var msg = '';
      if (!v) msg = 'Scegli una data.';
      else if (!d) msg = 'Data non valida.';
      else if (d < minDate()) msg = 'Scegli una data futura, a partire da domani.';
      else if (d > maxDate()) msg = 'Le richieste demo sono possibili entro ' + D.booking.maxDaysAhead + ' giorni.';
      else msg = closedReason(d);
      ELAN.setFieldError(els.date, msg);
      if (msg) { els.date.focus(); return false; }
      state.date = v;
      return true;
    }
    if (n === 4) {
      if (!state.slot) {
        els.slotErr.innerHTML = ELAN.icon('alert') + '<span>Seleziona una fascia oraria per continuare.</span>';
        var s = $('.slot', els.slots) || $('[data-goto-step]', els.slots);
        if (s) s.focus();
        return false;
      }
      els.slotErr.innerHTML = '';
      return true;
    }
    if (n === 5) {
      return ELAN.validateForm($('[data-step="5"]', els.form));
    }
    return true;
  }

  /* ---------- Conferma simulata ---------- */
  function complete() {
    var t = state.treatment;
    var when = fmtDate(state.date) + ', ore ' + toHHMM(state.slot.start);
    els.form.hidden = true;
    els.progress.hidden = true;
    els.aside.hidden = true;
    els.done.innerHTML =
      '<div class="notice notice--success">' + ELAN.icon('check') + '<div><strong>Simulazione completata</strong>' +
      'Nessun appuntamento è stato prenotato o inoltrato. Nessuna email o messaggio è stato inviato.</div></div>' +
      '<h2 style="margin-top:1.5rem">Ecco cosa avresti richiesto</h2>' +
      '<p>' + e(t.name) + ' · ' + e(when) + '.</p>' +
      '<p class="muted small">I dati di contatto inseriti sono stati cancellati da questa pagina e non sono stati salvati nel browser.</p>' +
      '<div class="btn-row"><button type="button" class="btn btn-primary" data-restart>Nuova simulazione</button><a class="btn btn-ghost" href="trattamenti.html">Torna ai trattamenti</a></div>';
    els.done.hidden = false;
    ['name', 'email', 'phone', 'notes'].forEach(function (k) { els[k].value = ''; });
    els.consent.checked = false;
    els.done.focus();
  }

  function restart() {
    state.staff = ''; state.date = ''; state.slot = null;
    els.date.value = '';
    els.done.hidden = true;
    els.form.hidden = false;
    els.progress.hidden = false;
    els.aside.hidden = false;
    refreshLive();
    showStep(1);
  }

  /* ---------- Parametri URL ---------- */
  function readParams() {
    var notes = [];
    var pid = ELAN.param('pacchetto');
    var tid = ELAN.param('trattamento');
    var sid = ELAN.param('operatrice');
    if (pid) {
      var p = ELAN.getPackage(pid);
      if (p) {
        state.pkg = p;
        var first = ELAN.getTreatment(p.items[0].treatmentId);
        if (first && !tid) state.treatment = first;
        var tot = ELAN.packageTotals(p);
        notes.push({ type: 'info', html: '<strong>Pacchetto: ' + e(p.name) + ' (' + ELAN.eur(tot.priceCents) + ', demo)</strong>Scegli il trattamento della prima seduta: abbiamo preselezionato il primo incluso.' });
      } else {
        notes.push({ type: 'error', html: '<strong>Pacchetto non trovato</strong>Il pacchetto indicato non esiste. Puoi comunque scegliere un trattamento o <a href="pacchetti.html">consultare i pacchetti</a>.' });
      }
    }
    if (tid) {
      var t = ELAN.getTreatment(tid);
      if (t) state.treatment = t;
      else notes.push({ type: 'error', html: '<strong>Trattamento non trovato</strong>Il trattamento indicato nell’indirizzo non esiste: sceglilo dall’elenco.' });
    }
    if (sid) {
      var s = ELAN.getStaff(sid);
      if (!s) notes.push({ type: 'error', html: '<strong>Operatrice non trovata</strong>Potrai scegliere un’operatrice al passo 2.' });
      else if (state.treatment && state.treatment.staff.indexOf(s.id) === -1) {
        notes.push({ type: 'error', html: '<strong>' + e(s.name) + ' non esegue questo trattamento nella demo</strong>Al passo 2 vedrai le operatrici compatibili o potrai scegliere “indifferente”.' });
      } else {
        state.staff = s.id;
        notes.push({ type: 'info', html: '<strong>Operatrice preselezionata: ' + e(s.name) + '</strong>' + (state.treatment ? '' : 'Ti mostreremo i trattamenti che esegue nella demo.') });
        state.preferredStaff = s.id;
      }
    }
    els.alerts.innerHTML = notes.map(function (n) {
      return '<div class="notice' + (n.type === 'error' ? ' notice--error' : '') + '" style="margin-bottom:1rem">' + ELAN.icon(n.type === 'error' ? 'alert' : 'info') + '<div>' + n.html + '</div></div>';
    }).join('');
  }

  function onTreatmentChange() {
    var t = ELAN.getTreatment(els.treatment.value);
    state.treatment = t;
    if (t && state.staff && state.staff !== ANY && t.staff.indexOf(state.staff) === -1) state.staff = '';
    if (t && !state.staff && state.preferredStaff && t.staff.indexOf(state.preferredStaff) !== -1) state.staff = state.preferredStaff;
    state.slot = null;
    renderPreview();
    refreshLive();
  }

  /* ---------- Avvio ---------- */
  function init() {
    els.form = $('#booking-form');
    if (!els.form) return;
    els.form.setAttribute('novalidate', '');
    els.progress = $('[data-progress]');
    els.stepNum = $('[data-step-num]');
    els.stepName = $('[data-step-name]');
    els.bar = $('[data-progress-bar]');
    els.stepper = $('[data-stepper]');
    els.alerts = $('[data-booking-alerts]');
    els.treatment = $('#b-treatment');
    els.preview = $('[data-treatment-preview]');
    els.staffOptions = $('[data-staff-options]');
    els.staffNote = $('[data-staff-note]');
    els.staffErr = $('#b-staff-error');
    els.date = $('#b-date');
    els.quick = $('[data-quick-dates]');
    els.slots = $('[data-slots]');
    els.slotContext = $('[data-slot-context]');
    els.slotErr = $('#b-slot-error');
    els.name = $('#b-name'); els.email = $('#b-email'); els.phone = $('#b-phone'); els.notes = $('#b-notes'); els.consent = $('#b-consent');
    els.finalSummary = $('[data-final-summary]');
    els.liveSummary = $('[data-live-summary]');
    els.aside = $('[data-booking-aside]');
    els.done = $('[data-booking-done]');

    readParams();
    renderTreatmentSelect();
    /* Se è stata scelta un'operatrice, nel menu evidenziamo i suoi trattamenti */
    if (state.preferredStaff && !state.treatment) {
      $$('option', els.treatment).forEach(function (o) {
        var t = ELAN.getTreatment(o.value);
        if (t && t.staff.indexOf(state.preferredStaff) === -1) o.textContent += ' — non con ' + ELAN.getStaff(state.preferredStaff).name;
      });
    }
    renderPreview();
    refreshLive();
    showStep(1, false);
    ELAN.liveValidation($('[data-step="5"]', els.form));

    els.treatment.addEventListener('change', function () { ELAN.validateField(els.treatment); onTreatmentChange(); });

    els.staffOptions.addEventListener('change', function (ev) {
      if (ev.target.name !== 'staff') return;
      state.staff = ev.target.value;
      state.slot = null;
      els.staffErr.innerHTML = '';
      refreshLive();
    });

    els.date.addEventListener('change', function () {
      state.slot = null;
      if (els.date.getAttribute('aria-invalid')) validateStep(3);
      state.date = fromISO(els.date.value) ? els.date.value : '';
      $$('[data-quick]', els.quick).forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-quick') === els.date.value ? 'true' : 'false'); });
      refreshLive();
    });
    els.quick.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-quick]');
      if (!b) return;
      els.date.value = b.getAttribute('data-quick');
      ELAN.setFieldError(els.date, '');
      state.date = els.date.value;
      state.slot = null;
      $$('[data-quick]', els.quick).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      refreshLive();
    });

    els.slots.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-slot]');
      if (b) {
        var start = Number(b.getAttribute('data-slot'));
        state.slot = { start: start, end: start + state.treatment.durationMin, staffId: b.getAttribute('data-staff-id') };
        $$('[data-slot]', els.slots).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        els.slotErr.innerHTML = '';
        refreshLive();
        return;
      }
      var g = ev.target.closest('[data-goto-date]');
      if (g) {
        els.date.value = g.getAttribute('data-goto-date');
        state.date = els.date.value;
        ELAN.setFieldError(els.date, '');
        refreshLive();
        renderSlots();
        var first = $('.slot', els.slots); if (first) first.focus();
        return;
      }
      if (ev.target.closest('[data-set-any]')) {
        state.staff = ANY;
        refreshLive();
        renderSlots();
        var f = $('.slot', els.slots) || $('[data-goto-date]', els.slots); if (f) f.focus();
      }
    });

    els.form.addEventListener('click', function (ev) {
      var gs = ev.target.closest('[data-goto-step]');
      if (gs) { showStep(Number(gs.getAttribute('data-goto-step'))); return; }
      if (ev.target.closest('[data-next]')) {
        if (validateStep(state.step)) showStep(state.step + 1);
        return;
      }
      if (ev.target.closest('[data-prev]')) showStep(Math.max(1, state.step - 1));
    });

    els.form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (state.step < 6) {
        if (validateStep(state.step)) showStep(state.step + 1);
        return;
      }
      for (var i = 1; i <= 5; i++) {
        if (!validateStep(i)) { showStep(i); validateStep(i); return; }
      }
      complete();
    });

    els.done.addEventListener('click', function (ev) { if (ev.target.closest('[data-restart]')) restart(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
