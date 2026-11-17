/* =========================================================================
   Élan Beauty — pacchetti.js
   Pacchetti con totali calcolati in centesimi + "Componi il tuo percorso".
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc, $ = ELAN.$, $$ = ELAN.$$;

  function initPackages() {
    var root = $('[data-packages]');
    if (!root) return;
    root.innerHTML = D.packages.map(function (p) { return ELAN.packageCard(p, { headingLevel: 3 }); }).join('');
  }

  function initBuilder() {
    var list = $('[data-builder-list]');
    var out = $('[data-builder-summary]');
    if (!list || !out) return;
    var rule = D.customPackageRule || { minItems: 3, discountPercent: 10 };
    var ruleEl = $('[data-builder-rule]');
    if (ruleEl) ruleEl.textContent = 'Scegli almeno ' + rule.minItems + ' trattamenti diversi: sul totale viene applicato uno sconto dimostrativo del ' + rule.discountPercent + '%, arrotondato per difetto all’euro.';

    list.innerHTML = D.categories.map(function (c) {
      var items = D.treatments.filter(function (t) { return t.category === c.id; });
      if (!items.length) return '';
      return '<fieldset class="filter-group" style="grid-column:1/-1"><legend>' + e(c.label) + '</legend><div class="builder__list">' +
        items.map(function (t) {
          return '<label class="builder__opt"><input type="checkbox" name="builder" value="' + e(t.id) + '">' +
            '<span><strong>' + e(t.name) + '</strong><small>' + ELAN.duration(t.durationMin) + ' · ' + ELAN.eur(t.priceCents) + '</small></span></label>';
        }).join('') + '</div></fieldset>';
    }).join('');

    function update() {
      var chosen = $$('input[name="builder"]:checked', list).map(function (i) { return ELAN.getTreatment(i.value); }).filter(Boolean);
      var sum = 0, dur = 0;
      chosen.forEach(function (t) { sum += t.priceCents; dur += t.durationMin; });
      var eligible = chosen.length >= rule.minItems;
      var price = eligible ? Math.floor(Math.round(sum * (100 - rule.discountPercent) / 100) / 100) * 100 : sum;
      var saving = sum - price;
      var missing = Math.max(0, rule.minItems - chosen.length);
      out.innerHTML =
        '<h3>Il tuo percorso</h3>' +
        (chosen.length
          ? '<ul class="pkg__items">' + chosen.map(function (t) { return '<li><span>' + e(t.name) + '</span><span class="muted">' + ELAN.eur(t.priceCents) + '</span></li>'; }).join('') + '</ul>'
          : '<p class="muted small">Nessun trattamento selezionato.</p>') +
        '<dl class="pkg__math" style="margin-top:1rem">' +
          '<div><dt>Trattamenti scelti</dt><dd>' + chosen.length + '</dd></div>' +
          '<div><dt>Durata complessiva</dt><dd>' + ELAN.duration(dur) + '</dd></div>' +
          '<div><dt>Valore dei singoli</dt><dd>' + ELAN.eur(sum) + '</dd></div>' +
          '<div><dt>Sconto percorso</dt><dd>' + (eligible ? '− ' + ELAN.eur(saving) : '—') + '</dd></div>' +
          '<div class="pkg__total"><dt>Totale dimostrativo</dt><dd>' + ELAN.eur(price) + '</dd></div>' +
        '</dl>' +
        '<p class="small muted" style="margin-top:.75rem">' + (eligible
          ? 'Sconto percorso applicato.'
          : (chosen.length ? 'Aggiungi ancora ' + missing + (missing === 1 ? ' trattamento' : ' trattamenti') + ' per lo sconto percorso.' : 'Seleziona i trattamenti per vedere il totale.')) + '</p>' +
        (chosen.length
          ? '<a class="btn btn-primary btn-block" href="' + ELAN.bookUrl(chosen[0].id) + '">Prenota il primo trattamento</a>' +
            '<button type="button" class="btn btn-link" data-builder-reset>Svuota selezione</button>'
          : '');
    }
    list.addEventListener('change', update);
    out.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-builder-reset]')) return;
      $$('input[name="builder"]', list).forEach(function (i) { i.checked = false; });
      update();
      var first = $('input[name="builder"]', list);
      if (first) first.focus();
    });
    update();
  }

  function init() { initPackages(); initBuilder(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
