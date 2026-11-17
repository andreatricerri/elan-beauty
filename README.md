# Élan Beauty — sito dimostrativo di un salone di bellezza

Progetto **portfolio** statico, multipagina e multi-file: HTML5, CSS custom (Grid/Flexbox) e JavaScript vanilla.
Élan Beauty è un'attività **fittizia**: nomi, prezzi, orari, recensioni e recapiti sono dimostrativi.
Nessun modulo invia dati, nessuna prenotazione o pagamento è reale.

---

## 1. Avvio

Nessuna build, installazione, backend o API.

**Metodo consigliato (server locale):**

```bash
cd elan-beauty
python3 -m http.server 8000
# poi apri http://localhost:8000
```

In alternativa: estensione "Live Server" di VS Code, oppure `npx serve .`.

**Apertura diretta con doppio clic (`file://`)**: funziona, perché i dati sono in `js/data.js` (nessun `fetch`).
Limitazioni note in `file://`:
- alcuni browser possono non aggiornare l'indirizzo quando cambi i filtri del catalogo (la ricerca funziona comunque);
- il `site.webmanifest` viene ignorato;
- Safari può essere più restrittivo con alcuni file locali: in caso di dubbio usa il server locale.

### Vederlo su smartphone e tablet

- **Stessa rete Wi-Fi**: avvia `python3 -m http.server 8000 --bind 0.0.0.0` sul PC, trova l'IP locale
  (es. `192.168.1.20`) e apri `http://192.168.1.20:8000` da iPhone/Android/iPad.
- **Online**: carica la cartella su GitHub e collegala a Netlify (è incluso `netlify.toml`, publish = root, nessuna build)
  oppure trascina la cartella su Netlify Drop. Va bene anche GitHub Pages o Vercel (progetto statico).
- Le pagine includono `viewport-fit=cover`, gestione `safe-area-inset` per le barre fisse su iPhone, `dvh` con fallback
  `vh`, campi a 16 px (niente zoom automatico iOS), zoom non disabilitato, `theme-color`, icona Apple e manifest.

---

## 2. Struttura

```
elan-beauty/
├── index.html                  Home (hero, trattamenti, percorso, pacchetti, team, galleria, recensioni demo, FAQ, newsletter demo)
├── salone.html                 Il salone
├── trattamenti.html            Catalogo con ricerca, filtri combinabili, ordinamento, stato vuoto
├── dettaglio-trattamento.html  Scheda da ?id= (gestisce ID mancante/non valido)
├── team.html                   4 profili con avatar illustrati
├── listino.html                Listino per categoria (righe con etichette, niente tabelle troncate)
├── pacchetti.html              Pacchetti con totali calcolati + "Componi il tuo percorso"
├── prenota.html                Prenotazione simulata in 6 passi
├── galleria.html               Galleria con filtro e lightbox
├── faq.html                    FAQ con ricerca
├── contatti.html               Recapiti demo + modulo dimostrativo
├── privacy.html                Privacy descrittiva della demo
├── site.webmanifest            Manifest (icone, colori)
├── netlify.toml                Configurazione facoltativa per Netlify
├── css/
│   ├── base.css                Variabili (colori, spacing, radius, ombre), reset, tipografia, layout
│   ├── components.css          Header, drawer, pulsanti, card, accordion, form, modali, footer
│   └── pages.css               Layout specifici delle pagine
├── js/
│   ├── data.js                 SITE_DATA: trattamenti, staff, pacchetti, orari, FAQ, galleria, contatti
│   ├── main.js                 Utility, header/drawer, modali, accordion, validazione, form demo
│   ├── availability.js         Motore delle disponibilità simulate (prenotazione e tile in home)
│   ├── home.js  trattamenti.js  dettaglio.js  team.js  listino.js
│   ├── pacchetti.js  prenota.js  gallery.js  faq.js
└── assets/images/              Segnaposto SVG, avatar, favicon e icone PNG
```

Ordine degli script (tutti `defer`): `data.js` → `main.js` → `availability.js` (home e prenota) → script della pagina.

---

## 3. Modificare i contenuti

Tutto è in **`js/data.js`** (`window.SITE_DATA`). Catalogo, filtri, listino, pacchetti, team, FAQ e galleria sono generati dai dati.

| Cosa | Dove | Note |
|---|---|---|
| Trattamenti | `treatments` | `id` univoco (usato negli URL), `category`, `durationMin`, `priceCents` (centesimi!), `image`, `staff` (ID operatrici), `includes`, `notes`, `featured` |
| Categorie | `categories` | i filtri si aggiornano da soli |
| Operatrici | `staff` | `workDays`: 0 = domenica … 6 = sabato |
| Pacchetti | `packages` | `items` + `discountPercent`; il prezzo è calcolato e arrotondato per difetto all'euro |
| Orari | `hours` | `null` = chiuso |
| Prenotazione | `booking` | passo slot, giorni prenotabili, % slot occupati simulati, chiusure straordinarie |
| WhatsApp/social | `contact.whatsappUrl`, `contact.socials[].url` | **vuoti di default** → aprono un avviso demo. Inserire solo link reali e autorizzati |

Importi sempre in **centesimi interi** (es. 35,00 € → `3500`), formattati con `Intl.NumberFormat('it-IT', EUR)`.

### Colori e font
Variabili in `css/base.css` (`:root`): `--c-page`, `--c-card`, `--c-section`, `--c-blush`, `--c-text`, `--c-text-2`,
`--c-primary`, `--c-primary-hover`, `--c-champagne`, ecc. Font: Manrope (titoli) e Inter (testo) con fallback di sistema.

### Logo
`assets/images/logo.svg` (logo completo) e `assets/images/logo-mark.svg` (emblema ad arco con monogramma É, usato anche come favicon). Nell'header il logo è un SVG inline + scritta in HTML, per restare nitido su ogni schermo.

### Foto
Le immagini sono **illustrazioni SVG segnaposto** generate per il progetto (nessuna foto di terzi, nessuna licenza da verificare).
Per sostituirle usa lo stesso nome file oppure aggiorna i percorsi in `data.js` (`IMAGES`, `treatments[].image`, `gallery[].src`, `staff[].avatar`)
e quelli nell'HTML di `index.html` (hero), `salone.html` e `contatti.html` (mappa).

Foto consigliate (orizzontali 4:3, ≥ 1200 px, tranne dove indicato):
- `hero-salone` (verticale 4:5): ambiente principale del salone;
- `galleria-*` (9): reception, postazione mani, cabina viso, cabina corpo, area relax, prodotti (senza marchi), postazione sguardo, angolo tisane, ingresso;
- `trattamento-*` (19): dettagli di strumenti o ambienti per ogni trattamento, **senza prima/dopo**;
- `avatar-*` (4, quadrati): mantenere avatar illustrati o usare foto **solo** di persone reali consenzienti con il loro vero nome;
- `mappa-demo`: sostituire con una mappa reale solo se il salone esiste (valutare privacy dei servizi di mappe).

Usa solo immagini con licenza verificabile e conserva le attribuzioni richieste.

---

## 4. Funzionalità

- **Design**: header flottante a pillola, hero a bento con numeri calcolati dai dati e “prossima fascia simulata” aggiornata in tempo reale, nastro scorrevole dei trattamenti (fermo con `prefers-reduced-motion`), carosello con frecce e scroll-snap, esploratore delle categorie a schede (frecce, Home/End), percorso in 4 card, intestazioni delle pagine interne compatte a due colonne con parola decorativa.

- **Catalogo**: ricerca testuale, filtri combinabili (più categorie, durata, budget), ordinamento, conteggio, chip dei filtri attivi rimovibili, azzeramento, stato "nessun risultato", sincronizzazione con l'URL (`?categoria=viso,corpo&budget=40&durata=media&q=…&ordina=prezzo-asc`). Su smartphone/tablet i filtri sono in un pannello a schermo intero.
- **Dettaglio**: accordion (`aria-expanded`), operatrici abilitate, correlati, barra CTA fissa su mobile con safe-area. ID mancante/errato → messaggio e suggerimenti.
- **Pacchetti**: valore dei singoli, risparmio, durata e prezzo calcolati in centesimi; percorso personalizzato con sconto dimostrativo da 3 trattamenti.
- **Prenotazione simulata**: trattamento → operatrice compatibile o indifferente → data futura (da domani a +60 giorni, chiusure gestite) → fascia (slot simulati deterministici) → contatti di fantasia → riepilogo con "Modifica". Casi gestiti: nessuno slot, giorno di chiusura, durata oltre l'orario, operatrice non in salone (con proposta della prossima data o di "indifferente"), parametri URL non validi. Le CTA precompilano `?trattamento=`, `?operatrice=`, `?pacchetto=`.
- **Galleria**: filtro, lightbox con frecce, tastiera (← → Esc), swipe, focus intrappolato e ripristinato.
- **Accessibilità**: un H1 per pagina, breadcrumb, skip link, focus visibile, label reali, errori accanto ai campi con `aria-describedby`, conferme in `role="status"`, menu e sottomenu apribili con click/touch/tastiera (mai solo hover), drawer con Escape e focus gestito, `prefers-reduced-motion`.
- **Privacy**: nessun dato inviato, nessun `localStorage`/`sessionStorage`/cookie, nessun analytics. Unica richiesta esterna: Google Fonts (dichiarata in `privacy.html`).

---

## 5. Verifiche eseguite

Eseguite in Chromium headless (Playwright) — **non** su dispositivi fisici:

- 12 pagine + varianti di `dettaglio-trattamento` (ID valido, non valido, mancante) a 320, 375, 390, 430, 768, 820, 1024, 1280, 1440 px e in orizzontale (844×390, 667×375): nessuno scroll orizzontale, nessun elemento fuori viewport, un solo H1, nessun errore JavaScript.
- Link e risorse locali: nessun file mancante, nessun `href="#"`.
- Test funzionali (36 controlli): drawer e sottomenu (click, Escape, focus), lightbox, newsletter e contatti demo, filtri combinati da URL, azzeramento, stato vuoto, accordion, intero flusso di prenotazione con tutti i casi limite, nessun dato salvato nel browser, calcolo pacchetti.
- Contrasto colori (WCAG): testo principale 12,6:1, secondario ≥ 5,3:1, bianco su prugna 7,6:1.

**Da verificare ancora** su dispositivi e browser reali: Safari iOS/iPadOS (date picker nativo, tastiera virtuale, barra indirizzi), Chrome Android, Firefox, Edge, Safari macOS; lettori di schermo (VoiceOver, TalkBack, NVDA).

---

## 6. Limiti della demo

- Disponibilità generate da un algoritmo deterministico: non riflettono un'agenda reale.
- Prezzi, pacchetti e condizioni sono dimostrativi.
- Profili del team senza qualifiche: in un sito reale vanno inseriti solo dati veri e verificati.
- Recensioni scritte per il layout ed etichettate come dimostrative.
- La pagina privacy è descrittiva e non garantisce conformità normativa.

## 7. Checklist di pubblicazione (se diventasse un sito reale)

- [ ] Sostituire tutti i dati in `data.js` con informazioni reali e verificate (indirizzo, orari, prezzi, P. IVA se dovuta).
- [ ] Sostituire i segnaposto con foto autorizzate e con licenza; aggiornare gli `alt`.
- [ ] Collegare la prenotazione a un sistema reale (o rimuoverla) e aggiornare i testi "simulata".
- [ ] Rimuovere la banda "progetto dimostrativo", `noindex` nei meta e `X-Robots-Tag` in `netlify.toml`.
- [ ] Informativa privacy redatta da un professionista; valutare font in locale al posto di Google Fonts.
- [ ] Configurare link WhatsApp/social autorizzati in `data.js`.
- [ ] Test su dispositivi fisici e con tecnologie assistive.
