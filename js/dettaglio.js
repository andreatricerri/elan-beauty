/* =========================================================================
   Élan Beauty — dettaglio.js
   Scheda trattamento da ?id= con gestione ID mancante o non valido.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc, $ = ELAN.$;

  function notFound(root, id) {
    document.title = 'Trattamento non trovato · Élan Beauty';
    var crumb = $('[data-crumb-current]');
    if (crumb) crumb.textContent = 'Trattamento non trovato';
    root.innerHTML =
      '<div class="error-box">' +
        '<h1>Trattamento non trovato</h1>' +
        '<p class="lead">' + (id
          ? 'Il codice “' + e(id) + '” non corrisponde a nessun trattamento della demo.'
          : 'Nessun trattamento indicato nell’indirizzo della pagina.') +
        ' Puoi sceglierne uno dal catalogo.</p>' +
        '<div class="btn-row"><a class="btn btn-primary" href="trattamenti.html">Vai ai trattamenti</a><a class="btn btn-ghost" href="listino.html">Consulta il listino</a></div>' +
      '</div>';
    var rest = $('[data-detail-body]');
    if (rest) {
      rest.innerHTML = '<div class="container"><h2 class="h3">Alcuni trattamenti da cui partire</h2><div class="auto-grid">' +
        D.treatments.filter(function (t) { return t.featured; }).slice(0, 3).map(function (t) { return ELAN.treatmentCard(t); }).join('') +
        '</div></div>';
    }
  }

  function render(root, t) {
    var cat = ELAN.getCategory(t.category);
    var staff = (t.staff || []).map(ELAN.getStaff).filter(Boolean);
    document.title = t.name + ' · Trattamenti · Élan Beauty';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.short + ' Scheda dimostrativa del salone fittizio Élan Beauty.');
    var crumb = $('[data-crumb-current]');
    if (crumb) crumb.textContent = t.name;

    var staffChips = staff.map(function (s) {
      return '<li><img class="avatar" src="' + e(s.avatar) + '" alt="" width="40" height="40"><a href="team.html#' + e(s.id) + '">' + e(s.name) + '</a></li>';
    }).join('');

    root.innerHTML =
      '<div class="detail-hero">' +
        '<img class="detail-hero__img" src="' + e(t.image) + '" alt="Immagine segnaposto per ' + e(t.name) + '" width="800" height="600">' +
        '<div>' +
          '<a class="tag" href="trattamenti.html?categoria=' + e(t.category) + '">' + e(cat ? cat.label : '') + '</a>' +
          '<h1 style="margin-top:.75rem">' + e(t.name) + '</h1>' +
          '<p class="lead">' + e(t.short) + '</p>' +
          '<dl class="detail-facts">' +
            '<div><dt>Durata</dt><dd>' + ELAN.duration(t.durationMin) + '</dd></div>' +
            '<div><dt>Prezzo demo</dt><dd>' + ELAN.eur(t.priceCents) + '</dd></div>' +
          '</dl>' +
          (staffChips ? '<p class="small muted" style="margin-bottom:.5rem">Operatrici abilitate nella demo</p><ul class="staff-chips">' + staffChips + '</ul>' : '') +
          '<div class="btn-row" style="margin-top:1.5rem">' +
            '<a class="btn btn-primary" href="' + ELAN.bookUrl(t.id) + '">' + ELAN.icon('calendar') + 'Richiedi un appuntamento</a>' +
            '<a class="btn btn-ghost" href="trattamenti.html">Tutti i trattamenti</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    var body = $('[data-detail-body]');
    var acc = [
      ELAN.accordionItem('acc-descr', 'Descrizione', '<p>' + e(t.description) + '</p>', true, 2),
      ELAN.accordionItem('acc-incl', 'Cosa include', '<ul>' + t.includes.map(function (i) { return '<li>' + e(i) + '</li>'; }).join('') + '</ul>', false, 2),
      ELAN.accordionItem('acc-note', 'Note generali', '<ul>' + t.notes.map(function (n) { return '<li>' + e(n) + '</li>'; }).join('') + '</ul>', false, 2),
      ELAN.accordionItem('acc-staff', 'Operatrici abilitate nella demo',
        '<p>' + (staff.length ? staff.map(function (s) { return '<a href="team.html#' + e(s.id) + '">' + e(s.name) + '</a> (' + e(s.role.replace('Operatrice · ', '')) + ')'; }).join(', ') + '.' : 'Nessuna operatrice associata.') + '</p>' +
        '<p class="small">In fase di prenotazione puoi scegliere una di loro oppure “indifferente”.</p>', false, 2)
    ].join('');

    var related = D.treatments.filter(function (x) { return x.category === t.category && x.id !== t.id; }).slice(0, 3);
    if (related.length < 3) {
      related = related.concat(D.treatments.filter(function (x) {
        return x.featured && x.id !== t.id && related.indexOf(x) === -1;
      })).slice(0, 3);
    }

    body.innerHTML =
      '<div class="container">' +
        '<div class="detail-layout">' +
          '<div class="accordion">' + acc + '</div>' +
          '<aside class="card" aria-labelledby="info-title">' +
            '<h2 id="info-title" class="h3" style="font-size:var(--fs-lg)">Prima di prenotare</h2>' +
            '<ul class="small muted">' +
              '<li>Codice trattamento: <code>' + e(t.id) + '</code></li>' +
              '<li>Prezzo e durata sono <strong>dimostrativi</strong>.</li>' +
              '<li>Trattamento estetico non invasivo: non sostituisce pareri medici.</li>' +
              '<li>Le disponibilità in prenotazione sono simulate e non confermate.</li>' +
            '</ul>' +
            '<a class="btn btn-outline btn-block" href="' + ELAN.bookUrl(t.id) + '">Prenota questo trattamento</a>' +
          '</aside>' +
        '</div>' +
        '<section aria-labelledby="related-title" style="margin-top:var(--section-y)">' +
          '<div class="section-head"><div><h2 id="related-title">Potrebbe interessarti anche</h2></div><a class="btn-link" href="trattamenti.html">Vedi tutti</a></div>' +
          '<div class="auto-grid">' + related.map(function (r) { return ELAN.treatmentCard(r); }).join('') + '</div>' +
        '</section>' +
      '</div>';

    var relGrid = body.querySelector('section .auto-grid');
    if (relGrid) ELAN.fillGrid(relGrid, ELAN.FILL_TILE_HTML);

    /* Barra CTA fissa solo su smartphone/tablet */
    var bar = document.createElement('div');
    bar.className = 'mobile-cta';
    bar.innerHTML = '<div class="mobile-cta__info"><strong>' + e(t.name) + '</strong><span>' + ELAN.duration(t.durationMin) + ' · ' + ELAN.eur(t.priceCents) + '</span></div>' +
      '<a class="btn btn-primary" href="' + ELAN.bookUrl(t.id) + '">Prenota</a>';
    var main = $('#main');
    main.appendChild(bar);
    document.body.classList.add('has-mobile-cta');
  }

  function init() {
    var root = $('[data-detail]');
    if (!root) return;
    var id = ELAN.param('id');
    var t = id ? ELAN.getTreatment(id.trim()) : null;
    if (!t) notFound(root, id);
    else render(root, t);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
