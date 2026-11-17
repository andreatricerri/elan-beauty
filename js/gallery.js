/* =========================================================================
   Élan Beauty — gallery.js
   Griglia galleria generata dai dati + lightbox accessibile.
   Usato in index.html (anteprima) e galleria.html (completa con filtro).
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc;

  /* Lightbox: items = [{src, alt, caption}] */
  ELAN.lightbox = function (items, start) {
    if (!items || !items.length) return;
    var index = Math.min(Math.max(0, start || 0), items.length - 1);
    var multi = items.length > 1;
    var html =
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" src="" alt="" width="1200" height="900">' +
        '<figcaption class="lightbox__bar">' +
          '<span><span class="lightbox__caption" id="lb-caption"></span><br><span class="lightbox__count" aria-live="polite"></span></span>' +
          '<span class="lightbox__nav">' +
            (multi ? '<button type="button" class="icon-btn" data-lb="prev" aria-label="Immagine precedente">' + ELAN.icon('chevron-left') + '</button>' +
                     '<button type="button" class="icon-btn" data-lb="next" aria-label="Immagine successiva">' + ELAN.icon('chevron-right') + '</button>' : '') +
            '<button type="button" class="icon-btn modal__close" data-modal-close aria-label="Chiudi galleria">' + ELAN.icon('x') + '</button>' +
          '</span>' +
        '</figcaption>' +
      '</figure>';

    var modal = ELAN.openModal({
      className: 'lightbox',
      label: 'Galleria immagini',
      noDefaultClose: true,
      html: html,
      initialFocus: multi ? '[data-lb="next"]' : '[data-modal-close]',
      onKey: function (ev) {
        if (!multi) return;
        if (ev.key === 'ArrowRight') { ev.preventDefault(); go(1); }
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(-1); }
      }
    });
    var img = modal.dialog.querySelector('.lightbox__img');
    var cap = modal.dialog.querySelector('.lightbox__caption');
    var count = modal.dialog.querySelector('.lightbox__count');

    function show() {
      var it = items[index];
      img.src = it.src;
      img.alt = it.alt || '';
      cap.textContent = it.caption || '';
      count.textContent = multi ? 'Immagine ' + (index + 1) + ' di ' + items.length : '';
    }
    function go(step) { index = (index + step + items.length) % items.length; show(); }

    modal.dialog.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-lb]');
      if (!b) return;
      go(b.getAttribute('data-lb') === 'next' ? 1 : -1);
    });

    /* Swipe su touch */
    var x0 = null;
    img.addEventListener('touchstart', function (ev) { x0 = ev.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', function (ev) {
      if (x0 === null || !multi) return;
      var dx = ev.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      x0 = null;
    });
    show();
  };

  function itemHtml(g, i, wide) {
    return '<figure class="gallery-item' + (wide ? ' gallery-item--wide' : '') + '">' +
      '<button type="button" class="gallery-btn" data-index="' + i + '" aria-label="Apri ingrandimento: ' + e(g.caption) + '">' +
        '<img src="' + e(g.src) + '" alt="' + e(g.alt) + '" width="800" height="800" loading="lazy" decoding="async">' +
        '<span class="gallery-zoom" aria-hidden="true">' + ELAN.icon('zoom') + '</span>' +
      '</button>' +
      '<figcaption>' + e(g.caption) + '</figcaption>' +
    '</figure>';
  }

  function renderGrid(root) {
    var limit = Number(root.getAttribute('data-limit')) || 0;
    var filterBar = document.querySelector('[data-gallery-filter]');
    var state = { group: 'tutte' };

    function current() {
      var list = D.gallery.filter(function (g) { return state.group === 'tutte' || g.group === state.group; });
      return limit ? list.slice(0, limit) : list;
    }
    function draw() {
      var list = current();
      root.innerHTML = list.map(function (g, i) { return itemHtml(g, i, false); }).join('');
      balance();
      var counter = document.querySelector('[data-gallery-count]');
      if (counter) counter.textContent = list.length + (list.length === 1 ? ' immagine' : ' immagini');
    }
    /* Allarga alcune immagini perché l'ultima riga sia sempre piena */
    function balance() {
      if (limit) return;
      var items = ELAN.$$('.gallery-item', root);
      items.forEach(function (it) { it.classList.remove('gallery-item--wide'); });
      var cols = getComputedStyle(root).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      if (cols < 2) return;
      var k = (cols - (items.length % cols)) % cols;
      var picks = [0, 4, 8, 2, 6];
      for (var i = 0; i < k && i < picks.length; i++) if (items[picks[i]]) items[picks[i]].classList.add('gallery-item--wide');
    }
    var rt = null;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(balance, 120); });
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('.gallery-btn');
      if (!b) return;
      ELAN.lightbox(current(), Number(b.getAttribute('data-index')));
    });
    if (filterBar && !limit) {
      filterBar.addEventListener('click', function (ev) {
        var chip = ev.target.closest('[data-group]');
        if (!chip) return;
        state.group = chip.getAttribute('data-group');
        ELAN.$$('[data-group]', filterBar).forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        draw();
      });
    }
    draw();
  }

  function init() { ELAN.$$('[data-gallery]').forEach(renderGrid); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
