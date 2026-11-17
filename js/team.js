/* =========================================================================
   Élan Beauty — team.js
   Profili dimostrativi generati da SITE_DATA.staff.
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var e = ELAN.esc;

  function init() {
    var root = ELAN.$('[data-team]');
    if (!root) return;
    root.innerHTML = D.staff.map(function (s) {
      var treatments = D.treatments.filter(function (t) { return (t.staff || []).indexOf(s.id) !== -1; });
      var days = s.workDays.map(function (d) { return ELAN.DAYS[d]; }).join(', ');
      return '<article class="member" id="' + e(s.id) + '" aria-labelledby="' + e(s.id) + '-name">' +
        '<img class="avatar member__avatar" src="' + e(s.avatar) + '" alt="Avatar illustrato di ' + e(s.name) + '" width="144" height="144" loading="lazy">' +
        '<div>' +
          '<h2 id="' + e(s.id) + '-name">' + e(s.name) + '</h2>' +
          '<p class="member__role">' + e(s.role) + '</p>' +
          '<p class="member__bio">' + e(s.bio) + '</p>' +
          '<ul class="member__focus">' + s.focus.map(function (f) { return '<li class="tag">' + e(f) + '</li>'; }).join('') + '</ul>' +
          '<div class="member__treat"><p class="small muted" style="margin-bottom:.25rem">Trattamenti nella demo (' + treatments.length + ')</p>' +
            '<ul>' + treatments.map(function (t) { return '<li><a href="' + ELAN.detailUrl(t.id) + '">' + e(t.name) + '</a></li>'; }).join('') + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="member__side">' +
          '<p class="small"><strong>In salone (demo):</strong><br>' + e(days) + '</p>' +
          '<a class="btn btn-outline btn-block" href="prenota.html?operatrice=' + e(s.id) + '">Prenota con ' + e(s.name) + '</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
