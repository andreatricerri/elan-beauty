/* =========================================================================
   Élan Beauty — faq.js
   FAQ raggruppate con ricerca testuale.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc, $ = ELAN.$;

  function init() {
    var root = $('[data-faq]');
    if (!root) return;
    var input = $('#faq-search');
    var count = $('[data-faq-count]');
    var empty = $('[data-faq-empty]');

    function draw() {
      var q = ELAN.normalize(input ? input.value : '');
      var groups = [];
      var n = 0;
      D.faq.forEach(function (f, i) {
        if (q && ELAN.normalize(f.q + ' ' + f.a).indexOf(q) === -1) return;
        var g = groups.filter(function (x) { return x.name === f.group; })[0];
        if (!g) { g = { name: f.group, items: [] }; groups.push(g); }
        g.items.push({ f: f, i: i });
        n++;
      });
      root.innerHTML = groups.map(function (g, gi) {
        return '<section class="faq-group" aria-labelledby="faqg-' + gi + '"><h2 id="faqg-' + gi + '">' + e(g.name) + '</h2>' +
          '<div class="accordion">' + g.items.map(function (x) {
            return ELAN.accordionItem('faq-' + x.i, x.f.q, '<p>' + e(x.f.a) + '</p>', !!q, 3);
          }).join('') + '</div></section>';
      }).join('');
      var topics = $('[data-faq-groups]');
      if (topics) topics.innerHTML = groups.map(function (g, gi) {
        return '<li><a href="#faqg-' + gi + '"><span>' + e(g.name) + '</span><span class="tag">' + g.items.length + '</span></a></li>';
      }).join('');
      if (count) count.textContent = q ? (n === 1 ? '1 risposta trovata' : n + ' risposte trovate') : D.faq.length + ' domande';
      if (empty) empty.hidden = n > 0;
    }
    if (input) {
      input.addEventListener('input', draw);
      var form = input.closest('form');
      if (form) form.addEventListener('submit', function (ev) { ev.preventDefault(); draw(); });
    }
    var reset = $('[data-faq-reset]');
    if (reset) reset.addEventListener('click', function () { input.value = ''; draw(); input.focus(); });
    draw();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
