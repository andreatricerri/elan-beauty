/* =========================================================================
   Élan Beauty — dati del sito (DEMO)
   Tutti i contenuti sono di fantasia e modificabili qui.
   - Prezzi in centesimi di euro (priceCents) per evitare errori di arrotondamento.
   - Durate in minuti.
   - Le immagini sono segnaposto SVG locali: sostituisci i percorsi in IMAGES.
   ========================================================================= */
(function () {
  'use strict';

  var IMG = 'assets/images/';

  /* Percorsi immagine centralizzati: cambia qui per sostituire le foto. */
  var IMAGES = {
    hero: IMG + 'hero-salone.svg',
    heroAlt: 'Ambiente del salone con luce naturale, poltrona imbottita e piante (immagine segnaposto)',
    salone: IMG + 'galleria-reception.svg',
    saloneDettaglio: IMG + 'galleria-cabina-viso.svg',
    mappa: IMG + 'mappa-demo.svg',
    ogImage: IMG + 'hero-salone.svg'
  };

  var categories = [
    { id: 'mani', label: 'Mani', description: 'Cura delle unghie e delle mani, dal classico al semipermanente.' },
    { id: 'piedi', label: 'Piedi', description: 'Pedicure estetici per piedi curati e leggeri.' },
    { id: 'viso', label: 'Viso', description: 'Trattamenti cosmetici per una pelle dall’aspetto fresco e idratato.' },
    { id: 'corpo', label: 'Corpo', description: 'Massaggi e rituali di benessere a scopo estetico e rilassante.' },
    { id: 'sguardo', label: 'Sguardo', description: 'Ciglia e sopracciglia: forma, definizione e ordine.' },
    { id: 'epilazione', label: 'Epilazione', description: 'Epilazione con cera per viso e corpo.' }
  ];

  /* Profili dimostrativi: nessuna qualifica o certificazione dichiarata. */
  var staff = [
    {
      id: 'giulia',
      name: 'Giulia',
      role: 'Operatrice · mani e piedi',
      avatar: IMG + 'avatar-giulia.svg',
      bio: 'Ama i dettagli e i colori sobri. In salone si occupa soprattutto di manicure e pedicure, con un’attenzione particolare alla forma delle unghie.',
      focus: ['Manicure', 'Pedicure', 'Semipermanente'],
      workDays: [2, 3, 4, 5, 6]
    },
    {
      id: 'sara',
      name: 'Sara',
      role: 'Operatrice · viso e sguardo',
      avatar: IMG + 'avatar-sara.svg',
      bio: 'Preferisce i trattamenti lenti e ben spiegati. Segue i rituali viso e la cura di ciglia e sopracciglia, partendo sempre da un breve confronto.',
      focus: ['Viso', 'Laminazione', 'Sopracciglia'],
      workDays: [2, 3, 5, 6]
    },
    {
      id: 'noemi',
      name: 'Noemi',
      role: 'Operatrice · corpo ed epilazione',
      avatar: IMG + 'avatar-noemi.svg',
      bio: 'Cura i rituali corpo e i massaggi rilassanti con ritmo calmo e pressione su misura. Si occupa anche dei servizi di epilazione.',
      focus: ['Massaggi', 'Rituali corpo', 'Epilazione'],
      workDays: [3, 4, 5, 6]
    },
    {
      id: 'alessia',
      name: 'Alessia',
      role: 'Operatrice · mani, sguardo, epilazione',
      avatar: IMG + 'avatar-alessia.svg',
      bio: 'Versatile e precisa, alterna manicure, definizione delle sopracciglia ed epilazione. Le piace consigliare routine semplici da seguire a casa.',
      focus: ['Manicure', 'Sopracciglia', 'Epilazione'],
      workDays: [2, 4, 5, 6]
    }
  ];

  /* Trattamenti dimostrativi (estetica non invasiva, nessuna promessa terapeutica). */
  var treatments = [
    {
      id: 'manicure-classica', name: 'Manicure classica', category: 'mani',
      short: 'Forma, cuticole e smalto tradizionale per mani in ordine.',
      description: 'Una manicure completa e senza fretta: limatura e forma delle unghie, cura delle cuticole, massaggio leggero con crema e applicazione di smalto tradizionale nella tonalità che preferisci.',
      includes: ['Limatura e forma', 'Cura delle cuticole', 'Breve massaggio mani', 'Smalto tradizionale a scelta'],
      notes: ['Lo smalto tradizionale richiede qualche minuto di asciugatura: evita guanti stretti subito dopo.', 'Se hai unghie particolarmente fragili, segnalalo all’inizio.'],
      durationMin: 40, priceCents: 2500, image: IMG + 'trattamento-manicure-classica.svg',
      staff: ['giulia', 'alessia'], featured: true
    },
    {
      id: 'manicure-semipermanente', name: 'Manicure semipermanente', category: 'mani',
      short: 'Colore brillante e uniforme con smalto semipermanente.',
      description: 'Preparazione dell’unghia, cura delle cuticole e applicazione di smalto semipermanente con lampada. Una soluzione pratica per chi desidera un colore uniforme più a lungo rispetto allo smalto tradizionale.',
      includes: ['Preparazione dell’unghia', 'Cura delle cuticole', 'Smalto semipermanente a scelta', 'Olio nutriente finale'],
      notes: ['La durata del colore varia in base alle abitudini e alla crescita dell’unghia.', 'Se hai già un semipermanente, aggiungi la rimozione.'],
      durationMin: 60, priceCents: 3500, image: IMG + 'trattamento-manicure-semipermanente.svg',
      staff: ['giulia', 'alessia'], featured: true
    },
    {
      id: 'rimozione-semipermanente', name: 'Rimozione semipermanente', category: 'mani',
      short: 'Rimozione delicata del semipermanente e riordino dell’unghia.',
      description: 'Rimozione del prodotto con metodo delicato, riordino della forma e applicazione di un olio nutriente. Può essere prenotata da sola o prima di una nuova applicazione.',
      includes: ['Rimozione del prodotto', 'Riordino della forma', 'Olio nutriente'],
      notes: ['Si sconsiglia di rimuovere il semipermanente da sola strappandolo.'],
      durationMin: 30, priceCents: 1500, image: IMG + 'trattamento-rimozione-semipermanente.svg',
      staff: ['giulia', 'alessia']
    },
    {
      id: 'rituale-mani', name: 'Rituale mani nutriente', category: 'mani',
      short: 'Scrub, maschera e massaggio per mani morbide al tatto.',
      description: 'Un momento dedicato alla pelle delle mani: scrub delicato, maschera nutriente con guanti caldi e massaggio rilassante. Si conclude senza smalto, oppure con una base trasparente.',
      includes: ['Scrub delicato', 'Maschera nutriente', 'Massaggio mani e avambracci', 'Base trasparente facoltativa'],
      notes: ['Ideale da abbinare a una manicure classica.'],
      durationMin: 45, priceCents: 3200, image: IMG + 'trattamento-rituale-mani.svg',
      staff: ['giulia']
    },
    {
      id: 'pedicure-estetico', name: 'Pedicure estetico', category: 'piedi',
      short: 'Pediluvio, cura delle unghie e smalto per piedi curati.',
      description: 'Pediluvio tiepido, taglio e forma delle unghie, cura delle cuticole, levigatura cosmetica dei talloni e smalto tradizionale. È un servizio estetico: per problematiche specifiche del piede rivolgiti a un professionista sanitario.',
      includes: ['Pediluvio', 'Taglio e forma', 'Levigatura cosmetica', 'Smalto tradizionale'],
      notes: ['Consigliamo calzature aperte se scegli lo smalto tradizionale.', 'Non trattiamo condizioni che richiedono un parere sanitario.'],
      durationMin: 60, priceCents: 3800, image: IMG + 'trattamento-pedicure-estetico.svg',
      staff: ['giulia'], featured: true
    },
    {
      id: 'pedicure-semipermanente', name: 'Pedicure con semipermanente', category: 'piedi',
      short: 'Pedicure estetico completo con colore semipermanente.',
      description: 'Tutti i passaggi del pedicure estetico, con applicazione finale di smalto semipermanente per un colore uniforme e senza tempi di asciugatura.',
      includes: ['Pediluvio', 'Taglio e forma', 'Levigatura cosmetica', 'Smalto semipermanente'],
      notes: ['Indica se c’è un semipermanente da rimuovere: il tempo aumenta leggermente.'],
      durationMin: 75, priceCents: 4500, image: IMG + 'trattamento-pedicure-semipermanente.svg',
      staff: ['giulia']
    },
    {
      id: 'viso-idratante', name: 'Trattamento viso idratante', category: 'viso',
      short: 'Detersione, maschera e massaggio per una pelle che appare idratata.',
      description: 'Un trattamento cosmetico pensato per la sensazione di comfort: detersione, esfoliazione delicata, maschera idratante e massaggio viso. I prodotti vengono scelti in base alle tue preferenze e alle sensibilità che ci indichi.',
      includes: ['Breve confronto iniziale', 'Detersione e tonico', 'Esfoliazione delicata', 'Maschera idratante', 'Massaggio viso'],
      notes: ['Indica allergie o sensibilità cosmetiche note prima di iniziare.', 'Il trattamento è estetico e non sostituisce un parere dermatologico.'],
      durationMin: 60, priceCents: 5500, image: IMG + 'trattamento-viso-idratante.svg',
      staff: ['sara'], featured: true
    },
    {
      id: 'pulizia-viso', name: 'Pulizia viso cosmetica', category: 'viso',
      short: 'Detersione profonda e riequilibrio con prodotti cosmetici.',
      description: 'Detersione accurata, vapore tiepido, pulizia cosmetica delle zone interessate, maschera riequilibrante e crema finale. Un appuntamento utile per riordinare la routine.',
      includes: ['Detersione e vapore', 'Pulizia cosmetica', 'Maschera riequilibrante', 'Crema finale'],
      notes: ['Nelle ore successive la pelle può apparire leggermente arrossata: è normale e transitorio.', 'Evita trucco pesante subito dopo, se possibile.'],
      durationMin: 75, priceCents: 6000, image: IMG + 'trattamento-pulizia-viso.svg',
      staff: ['sara']
    },
    {
      id: 'viso-express', name: 'Viso express luminosità', category: 'viso',
      short: 'Una pausa di mezz’ora per un viso dall’aspetto più fresco.',
      description: 'Versione breve del rituale viso: detersione, maschera in tessuto e massaggio rapido. Pensato per la pausa pranzo o prima di un evento.',
      includes: ['Detersione', 'Maschera in tessuto', 'Massaggio rapido'],
      notes: ['Non sostituisce un trattamento viso completo.'],
      durationMin: 30, priceCents: 3200, image: IMG + 'trattamento-viso-express.svg',
      staff: ['sara', 'alessia']
    },
    {
      id: 'massaggio-rilassante', name: 'Massaggio rilassante', category: 'corpo',
      short: 'Manualità lente e avvolgenti per staccare dalla giornata.',
      description: 'Massaggio estetico di benessere con olio vegetale, a pressione concordata. Ha scopo esclusivamente rilassante e non terapeutico.',
      includes: ['Scelta della pressione', 'Massaggio schiena, gambe e braccia', 'Tisana finale'],
      notes: ['Massaggio a scopo estetico e di benessere, non sanitario.', 'In gravidanza o con condizioni particolari chiedi prima al tuo medico.'],
      durationMin: 50, priceCents: 5500, image: IMG + 'trattamento-massaggio-rilassante.svg',
      staff: ['noemi'], featured: true
    },
    {
      id: 'rituale-corpo', name: 'Rituale corpo Élan', category: 'corpo',
      short: 'Scrub, impacco e massaggio: novanta minuti di calma.',
      description: 'Il nostro rituale più lungo: scrub corpo delicato, impacco nutriente con teli caldi e massaggio rilassante. Si conclude con una tisana nell’area relax.',
      includes: ['Scrub corpo', 'Impacco nutriente', 'Massaggio rilassante', 'Tisana in area relax'],
      notes: ['Porta con te solo ciò che ti serve: forniamo telo e ciabattine monouso.', 'Scopo estetico e di benessere, non terapeutico.'],
      durationMin: 90, priceCents: 8500, image: IMG + 'trattamento-rituale-corpo.svg',
      staff: ['noemi']
    },
    {
      id: 'scrub-corpo', name: 'Scrub corpo levigante', category: 'corpo',
      short: 'Esfoliazione delicata per una pelle liscia al tatto.',
      description: 'Esfoliazione cosmetica su tutto il corpo con prodotto a base di zuccheri o sali fini, seguita da crema idratante.',
      includes: ['Esfoliazione corpo', 'Doccia', 'Crema idratante'],
      notes: ['Sconsigliato subito dopo l’epilazione o l’esposizione al sole.'],
      durationMin: 45, priceCents: 4500, image: IMG + 'trattamento-scrub-corpo.svg',
      staff: ['noemi']
    },
    {
      id: 'sopracciglia', name: 'Definizione sopracciglia', category: 'sguardo',
      short: 'Forma e ordine nel rispetto della linea naturale.',
      description: 'Studio della forma, epilazione con pinzetta e/o cera e pettinatura finale. Partiamo sempre dalla tua linea naturale.',
      includes: ['Studio della forma', 'Epilazione', 'Pettinatura finale'],
      notes: ['Lascia crescere le sopracciglia qualche settimana prima del primo appuntamento, se vuoi cambiare forma.'],
      durationMin: 20, priceCents: 1500, image: IMG + 'trattamento-sopracciglia.svg',
      staff: ['sara', 'alessia'], featured: true
    },
    {
      id: 'laminazione-ciglia', name: 'Laminazione ciglia', category: 'sguardo',
      short: 'Ciglia naturali dall’aspetto più curvo e ordinato.',
      description: 'Trattamento cosmetico che dà alle ciglia naturali una curvatura più definita, con tinta facoltativa. Non prevede l’applicazione di extension.',
      includes: ['Detersione delle ciglia', 'Laminazione', 'Tinta facoltativa', 'Trattamento nutriente finale'],
      notes: ['Segnala sensibilità oculari o cosmetiche note: in quel caso proporremo un’alternativa.', 'Evita di bagnare le ciglia nelle prime ore successive.'],
      durationMin: 60, priceCents: 5500, image: IMG + 'trattamento-laminazione-ciglia.svg',
      staff: ['sara']
    },
    {
      id: 'laminazione-sopracciglia', name: 'Laminazione sopracciglia', category: 'sguardo',
      short: 'Sopracciglia pettinate e ordinate con effetto più pieno.',
      description: 'Il pelo viene orientato e fissato cosmeticamente per sopracciglia dall’aspetto più ordinato. Include una rifinitura della forma.',
      includes: ['Laminazione', 'Rifinitura della forma', 'Trattamento nutriente'],
      notes: ['Segnala sensibilità cosmetiche note prima dell’appuntamento.'],
      durationMin: 45, priceCents: 4000, image: IMG + 'trattamento-laminazione-sopracciglia.svg',
      staff: ['sara', 'alessia']
    },
    {
      id: 'tinta-ciglia', name: 'Tinta ciglia', category: 'sguardo',
      short: 'Colore alle ciglia naturali per uno sguardo più definito.',
      description: 'Applicazione di tinta cosmetica sulle ciglia naturali, in tonalità scelta insieme.',
      includes: ['Detersione', 'Applicazione tinta', 'Rimozione e rifinitura'],
      notes: ['Segnala sensibilità oculari o cosmetiche note.'],
      durationMin: 20, priceCents: 1800, image: IMG + 'trattamento-tinta-ciglia.svg',
      staff: ['sara', 'alessia']
    },
    {
      id: 'epilazione-gambe', name: 'Epilazione gambe complete', category: 'epilazione',
      short: 'Epilazione con cera di gambe intere.',
      description: 'Epilazione con cera tiepida o a strappo in base alla zona, seguita da lozione lenitiva cosmetica.',
      includes: ['Preparazione della pelle', 'Epilazione con cera', 'Lozione finale'],
      notes: ['La lunghezza ideale del pelo è di qualche millimetro.', 'Evita sole e scrub nelle 24 ore successive.'],
      durationMin: 45, priceCents: 3500, image: IMG + 'trattamento-epilazione-gambe.svg',
      staff: ['noemi', 'alessia']
    },
    {
      id: 'epilazione-mezza-gamba', name: 'Epilazione mezza gamba', category: 'epilazione',
      short: 'Epilazione con cera fino al ginocchio.',
      description: 'Epilazione con cera della parte inferiore della gamba, con lozione cosmetica finale.',
      includes: ['Preparazione della pelle', 'Epilazione con cera', 'Lozione finale'],
      notes: ['Evita sole e scrub nelle 24 ore successive.'],
      durationMin: 30, priceCents: 2200, image: IMG + 'trattamento-epilazione-mezza-gamba.svg',
      staff: ['noemi', 'alessia']
    },
    {
      id: 'epilazione-viso', name: 'Epilazione viso', category: 'epilazione',
      short: 'Labbro superiore, mento o zone del viso con cera delicata.',
      description: 'Epilazione rapida delle piccole zone del viso con cera specifica per pelli delicate.',
      includes: ['Detersione', 'Epilazione con cera', 'Lozione finale'],
      notes: ['Può essere abbinata alla definizione sopracciglia.'],
      durationMin: 15, priceCents: 1000, image: IMG + 'trattamento-epilazione-viso.svg',
      staff: ['noemi', 'alessia']
    }
  ];

  /* Pacchetti: il prezzo è calcolato dal valore dei singoli trattamenti
     meno lo sconto percentuale, arrotondato per difetto all'euro intero. */
  var packages = [
    {
      id: 'mani-piedi', name: 'Mani & piedi essenziale',
      tagline: 'Il classico per tornare in ordine in un’unica visita.',
      items: [{ treatmentId: 'manicure-semipermanente', qty: 1 }, { treatmentId: 'pedicure-estetico', qty: 1 }],
      discountPercent: 10,
      validity: 'Da utilizzare in un’unica visita.',
      conditions: ['Entrambi i trattamenti nella stessa giornata.', 'Non cumulabile con altre promozioni dimostrative.']
    },
    {
      id: 'viso-sguardo', name: 'Viso & sguardo',
      tagline: 'Trattamento viso con cura di ciglia e sopracciglia.',
      items: [{ treatmentId: 'viso-idratante', qty: 1 }, { treatmentId: 'laminazione-ciglia', qty: 1 }, { treatmentId: 'sopracciglia', qty: 1 }],
      discountPercent: 12,
      validity: 'Utilizzabile in una o due visite entro 30 giorni.',
      conditions: ['Prenotazione separata per ogni visita.', 'Non cedibile a terzi.'],
      featured: true
    },
    {
      id: 'mezza-giornata', name: 'Mezza giornata Élan',
      tagline: 'Rituale corpo, viso e manicure: tre ore e mezza solo per te.',
      items: [{ treatmentId: 'rituale-corpo', qty: 1 }, { treatmentId: 'viso-idratante', qty: 1 }, { treatmentId: 'manicure-classica', qty: 1 }],
      discountPercent: 15,
      validity: 'In un’unica giornata, dal martedì al venerdì.',
      conditions: ['Include tisana e piccolo spuntino in area relax.', 'Non cumulabile con altre promozioni dimostrative.']
    },
    {
      id: 'ciclo-viso', name: 'Percorso viso · 3 sedute',
      tagline: 'Tre trattamenti viso idratanti per una routine costante.',
      items: [{ treatmentId: 'viso-idratante', qty: 3 }],
      discountPercent: 15,
      validity: 'Sedute da utilizzare entro 4 mesi dalla prima.',
      conditions: ['Prenotazione separata per ogni seduta.', 'Non cedibile a terzi.', 'Le sedute non utilizzate non sono rimborsabili (condizione dimostrativa).']
    }
  ];

  /* Regola del percorso personalizzato (pagina pacchetti). */
  var customPackageRule = { minItems: 3, discountPercent: 10 };

  /* Orari: giorno della settimana (0 = domenica) -> [apertura, chiusura] o null. */
  var hours = {
    0: null,
    1: null,
    2: ['09:30', '19:00'],
    3: ['09:30', '19:00'],
    4: ['10:00', '20:00'],
    5: ['09:30', '19:00'],
    6: ['09:00', '17:00']
  };

  var booking = {
    slotStepMin: 30,
    maxDaysAhead: 60,
    /* Percentuale indicativa di slot "occupati" simulati (0-1). */
    simulatedBusyRate: 0.35,
    /* Date di chiusura straordinaria (AAAA-MM-GG) — dimostrative. */
    closedDates: ['2026-12-24', '2026-12-25', '2026-12-26', '2026-12-31', '2027-01-01', '2027-01-06']
  };

  var experience = [
    { title: 'Scegli con calma', text: 'Consulta trattamenti, durate e prezzi indicativi. Se hai dubbi, scrivici: ti aiutiamo a orientarti.' },
    { title: 'Un breve confronto', text: 'All’arrivo parliamo di preferenze e sensibilità. Nessuna fretta, nessun trattamento non richiesto.' },
    { title: 'Il tuo tempo', text: 'Cabine riservate, luci morbide e musica bassa. Il tempo indicato è tutto per il trattamento.' },
    { title: 'Consigli semplici', text: 'Ti lasciamo poche indicazioni pratiche per mantenere il risultato estetico a casa.' }
  ];

  var reviews = [
    { text: 'Ambiente silenzioso e curato, mi hanno spiegato ogni passaggio della manicure senza propormi nulla in più.', author: 'Cliente di esempio', treatment: 'Manicure semipermanente' },
    { text: 'Il rituale corpo è stato un vero stacco dalla settimana. Puntuali e gentili dall’inizio alla fine.', author: 'Cliente di esempio', treatment: 'Rituale corpo Élan' },
    { text: 'Mi è piaciuto il confronto iniziale prima della laminazione: ho sentito che il mio parere contava.', author: 'Cliente di esempio', treatment: 'Laminazione ciglia' }
  ];

  var faq = [
    { group: 'Prenotazioni', q: 'Come prenoto un appuntamento?', a: 'In questa demo puoi simulare la richiesta dalla pagina Prenota: scegli trattamento, operatrice, data e fascia oraria. Nessuna richiesta viene realmente inviata.' },
    { group: 'Prenotazioni', q: 'Posso scegliere l’operatrice?', a: 'Sì. Per ogni trattamento mostriamo solo le operatrici che lo eseguono nella demo. Puoi anche scegliere “indifferente” per vedere più disponibilità.' },
    { group: 'Prenotazioni', q: 'Le disponibilità mostrate sono reali?', a: 'No. Le fasce orarie sono simulate a scopo dimostrativo e non corrispondono ad appuntamenti confermati.' },
    { group: 'Prenotazioni', q: 'Cosa succede se arrivo in ritardo?', a: 'Proveremo comunque a svolgere il trattamento, ma potrebbe essere necessario ridurne la durata per rispettare l’appuntamento successivo.' },
    { group: 'Trattamenti', q: 'Eseguite trattamenti di medicina estetica?', a: 'No. Élan Beauty propone solo trattamenti estetici e di benessere non invasivi. Per esigenze di tipo sanitario è sempre bene rivolgersi a un medico.' },
    { group: 'Trattamenti', q: 'Ho la pelle sensibile o allergie: posso prenotare?', a: 'Segnalalo nelle note e all’arrivo. Valuteremo insieme prodotti e alternative; in caso di dubbi ti consigliamo di chiedere prima un parere al tuo medico.' },
    { group: 'Trattamenti', q: 'Quanto dura il semipermanente?', a: 'Dipende dalla crescita dell’unghia e dalle abitudini quotidiane. Non possiamo garantire una durata precisa.' },
    { group: 'Prezzi e pacchetti', q: 'I prezzi sono definitivi?', a: 'No, tutti i prezzi del sito sono dimostrativi e servono solo a mostrare il funzionamento del listino.' },
    { group: 'Prezzi e pacchetti', q: 'Come funzionano i pacchetti?', a: 'Ogni pacchetto raggruppa più trattamenti a un prezzo complessivo indicato insieme al valore dei singoli servizi. Validità e condizioni sono riportate su ciascuna scheda.' },
    { group: 'Il salone', q: 'Il salone è accessibile?', a: 'Nella descrizione dimostrativa il salone si trova al piano terra senza gradini. In un progetto reale queste informazioni andrebbero verificate e indicate con precisione.' }
  ];

  var gallery = [
    { id: 'reception', src: IMG + 'galleria-reception.svg', alt: 'Reception con bancone chiaro, arco e piante', caption: 'Reception e area d’attesa', group: 'ambienti' },
    { id: 'manicure', src: IMG + 'galleria-postazione-mani.svg', alt: 'Postazione manicure con lampada e flaconi di smalto', caption: 'Postazione mani', group: 'ambienti' },
    { id: 'cabina-viso', src: IMG + 'galleria-cabina-viso.svg', alt: 'Cabina viso con lettino, asciugamani arrotolati e luce soffusa', caption: 'Cabina viso', group: 'ambienti' },
    { id: 'cabina-corpo', src: IMG + 'galleria-cabina-corpo.svg', alt: 'Cabina corpo con lettino, candela e pietre levigate', caption: 'Cabina corpo', group: 'ambienti' },
    { id: 'relax', src: IMG + 'galleria-relax.svg', alt: 'Area relax con poltrona, tisana e finestra ad arco', caption: 'Area relax', group: 'ambienti' },
    { id: 'prodotti', src: IMG + 'galleria-prodotti.svg', alt: 'Mensola con flaconi e vasetti cosmetici senza marchi', caption: 'Dettaglio prodotti', group: 'dettagli' },
    { id: 'sguardo', src: IMG + 'galleria-sguardo.svg', alt: 'Postazione sguardo con specchio tondo e pennelli', caption: 'Postazione sguardo', group: 'dettagli' },
    { id: 'tisane', src: IMG + 'galleria-tisane.svg', alt: 'Teiera e tazze su vassoio in legno', caption: 'Angolo tisane', group: 'dettagli' },
    { id: 'vetrina', src: IMG + 'galleria-vetrina.svg', alt: 'Vetrina del salone con tenda leggera e vaso di fiori', caption: 'Ingresso', group: 'ambienti' }
  ];

  var contact = {
    address: 'Via dei Glicini 12 (indirizzo di fantasia)',
    city: 'Città demo',
    email: 'ciao@elanbeauty.example',
    phoneNote: 'Telefono non disponibile: progetto dimostrativo',
    /* Punto di configurazione futura: inserire qui link reali solo se autorizzati. */
    whatsappUrl: '',
    socials: [
      { id: 'instagram', label: 'Instagram', url: '' },
      { id: 'facebook', label: 'Facebook', url: '' }
    ]
  };

  window.SITE_DATA = {
    brand: { name: 'Élan Beauty', tagline: 'Salone di bellezza · progetto dimostrativo' },
    images: IMAGES,
    categories: categories,
    staff: staff,
    treatments: treatments,
    packages: packages,
    customPackageRule: customPackageRule,
    hours: hours,
    booking: booking,
    experience: experience,
    reviews: reviews,
    faq: faq,
    gallery: gallery,
    contact: contact
  };
})();
