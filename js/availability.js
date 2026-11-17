/* =========================================================================
   Élan Beauty — availability.js
   Motore delle disponibilità SIMULATE (deterministiche, non confermate).
   Usato da prenota.js e dalla home (tile "prossima fascia").
   ========================================================================= */
(function () {
  'use strict';
  var ELAN = window.ELAN, D = window.SITE_DATA;
  if (!ELAN || !D) return;
  var ANY = 'indifferente';

  /* ---------- Date ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getMonth() === +m[2] - 1) ? d : null;
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var dateFmt = (typeof Intl !== 'undefined') ? new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;
  var shortFmt = (typeof Intl !== 'undefined') ? new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) : null;
  function fmtDate(iso) { var d = fromISO(iso); return d ? (dateFmt ? dateFmt.format(d) : iso) : ''; }
  function minDate() { return addDays(today(), 1); }
  function maxDate() { return addDays(today(), (D.booking && D.booking.maxDaysAhead) || 60); }
  function toMin(hhmm) { var p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function toHHMM(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }

  function closedReason(d) {
    var iso = toISO(d);
    if ((D.booking.closedDates || []).indexOf(iso) !== -1) return 'Il salone è chiuso in questa data (chiusura straordinaria dimostrativa).';
    if (!D.hours[d.getDay()]) return 'Il salone è chiuso di ' + ELAN.DAYS[d.getDay()].toLowerCase() + '.';
    return '';
  }

  /* Hash deterministico (FNV-1a) -> [0,1) per simulare slot occupati */
  function rand(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul ? Math.imul(h, 16777619) : (h * 16777619) >>> 0; }
    return ((h >>> 0) % 10000) / 10000;
  }
  function isFree(iso, staffId, startMin, duration) {
    var step = D.booking.slotStepMin || 30;
    for (var m = startMin; m < startMin + duration; m += step) {
      if (rand(iso + '|' + staffId + '|' + m) < (D.booking.simulatedBusyRate || 0)) return false;
    }
    return true;
  }

  function compatibleStaff(t) { return t ? (t.staff || []).map(ELAN.getStaff).filter(Boolean) : []; }

  /* Calcola le fasce per data/trattamento/operatrice. Ritorna {slots, reason} */
  function computeSlots(iso, t, staffChoice) {
    var d = fromISO(iso);
    if (!d || !t) return { slots: [], reason: 'missing' };
    var cr = closedReason(d);
    if (cr) return { slots: [], reason: 'closed', message: cr };
    var h = D.hours[d.getDay()];
    var open = toMin(h[0]), close = toMin(h[1]);
    if (t.durationMin > close - open) return { slots: [], reason: 'duration', message: 'La durata del trattamento (' + ELAN.duration(t.durationMin) + ') supera l’orario di apertura di questa giornata.' };
    var pool = compatibleStaff(t);
    if (staffChoice && staffChoice !== ANY) pool = pool.filter(function (s) { return s.id === staffChoice; });
    var working = pool.filter(function (s) { return s.workDays.indexOf(d.getDay()) !== -1; });
    if (!working.length) {
      if (staffChoice && staffChoice !== ANY) {
        var s = ELAN.getStaff(staffChoice);
        return { slots: [], reason: 'staff-off', message: (s ? s.name : 'L’operatrice scelta') + ' non è in salone di ' + ELAN.DAYS[d.getDay()].toLowerCase() + ' (calendario dimostrativo).' };
      }
      return { slots: [], reason: 'staff-off', message: 'Nessuna operatrice abilitata è in salone in questa giornata (calendario dimostrativo).' };
    }
    var step = D.booking.slotStepMin || 30;
    var slots = [];
    for (var m = open; m + t.durationMin <= close; m += step) {
      var free = working.filter(function (s) { return isFree(iso, s.id, m, t.durationMin); });
      if (free.length) slots.push({ start: m, end: m + t.durationMin, staffId: free[0].id });
    }
    if (!slots.length) return { slots: [], reason: 'full', message: 'Nessuna fascia libera simulata in questa data per il trattamento scelto.' };
    return { slots: slots, reason: '' };
  }

  function nextAvailable(fromIso, t, staffChoice) {
    var start = fromISO(fromIso) || minDate();
    if (start < minDate()) start = minDate();
    for (var d = start, i = 0; d <= maxDate() && i < 90; d = addDays(d, 1), i++) {
      var iso = toISO(d);
      if (iso === fromIso) continue;
      if (computeSlots(iso, t, staffChoice).slots.length) return iso;
    }
    return '';
  }

  function compatibleStaffList(t) { return compatibleStaff(t); }

  ELAN.avail = {
    ANY: ANY, pad: pad, toISO: toISO, fromISO: fromISO, today: today, addDays: addDays,
    fmtDate: fmtDate, shortFmt: shortFmt, minDate: minDate, maxDate: maxDate, toMin: toMin, toHHMM: toHHMM,
    closedReason: closedReason, computeSlots: computeSlots, nextAvailable: nextAvailable,
    compatibleStaff: compatibleStaffList
  };
})();
