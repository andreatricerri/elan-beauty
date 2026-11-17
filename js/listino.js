/* =========================================================================
   Élan Beauty — listino.js
   Listino per categoria, leggibile su smartphone (righe con etichette, nessuna tabella).
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc;

  function init() {
    var root = ELAN.$('[data-listino]');
    var jump = ELAN.$('[data-jump]');
    if (!root) return;
    var cats = D.categories.filter(function (c) {
      return D.treatments.some(function (t) { return t.category === c.id; });
    });
    if (jump) {
      jump.innerHTML = cats.map(function (c) { return '<li><a href="#cat-' + e(c.id) + '">' + e(c.label) + '</a></li>'; }).join('') +
        '<li><a href="pacchetti.html">Pacchetti</a></li>';
    }
    root.innerHTML = cats.map(function (c) {
      var items = D.treatments.filter(function (t) { return t.category === c.id; });
      return '<section class="price-cat" id="cat-' + e(c.id) + '" aria-labelledby="cat-' + e(c.id) + '-title">' +
        '<h2 id="cat-' + e(c.id) + '-title">' + e(c.label) + ' <span class="small muted">' + items.length + ' trattamenti</span></h2>' +
        '<p>' + e(c.description) + '</p>' +
        '<ul class="price-list">' + items.map(function (t) {
          return '<li class="price-item">' +
            '<div><div class="price-item__name"><a href="' + ELAN.detailUrl(t.id) + '">' + e(t.name) + '</a></div>' +
              '<p class="price-item__desc">' + e(t.short) + '</p></div>' +
            '<dl class="price-item__meta">' +
              '<div><dt>Durata</dt><dd>' + ELAN.duration(t.durationMin) + '</dd></div>' +
              '<div><dt>Prezzo</dt><dd class="price">' + ELAN.eur(t.priceCents) + '</dd></div>' +
            '</dl>' +
            '<div class="price-item__cta"><a class="btn btn-ghost" href="' + ELAN.bookUrl(t.id) + '" aria-label="Prenota ' + e(t.name) + '">Prenota</a></div>' +
          '</li>';
        }).join('') + '</ul>' +
      '</section>';
    }).join('');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
