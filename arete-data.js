// ARETE — contenuti fissi: catalogo esercizi, citazioni, schede delle statue.
// Non sono dati dell'utente: i suoi allenamenti vivono solo in arete-db.js.
(function (root) {
  const MUSCLE_NAMES = { chest: "Petto", back: "Schiena", shoulders: "Spalle", biceps: "Bicipiti", triceps: "Tricipiti", quads: "Quadricipiti", hamstrings: "Femorali", glutes: "Glutei", calves: "Polpacci", abs: "Addominali" };

  // [key, nome, principale, secondari, attrezzo, istruzioni]
  const RAW = [
    // Petto
    ["panca-piana", "Panca piana con bilanciere", "chest", ["triceps", "shoulders"], "Bilanciere", "Sdraiati con occhi sotto il bilanciere, scapole addotte e piedi ben a terra. Abbassa il bilanciere al centro del petto con i gomiti a circa 45–60° dal busto, poi spingi in alto senza staccare i glutei dalla panca."],
    ["panca-inclinata-manubri", "Panca inclinata con manubri", "chest", ["shoulders", "triceps"], "Manubri", "Panca inclinata di 30°. Parti con i manubri all'altezza delle spalle, spingi verso l'alto avvicinandoli senza farli toccare, poi scendi lentamente fino a sentire lo stiramento del petto."],
    ["croci-cavi", "Croci ai cavi", "chest", ["shoulders"], "Cavi", "In piedi tra le due colonne, con un passo avanti e il busto leggermente inclinato. A gomiti appena flessi porta le mani davanti al petto in un arco, poi torna indietro controllando il movimento."],
    ["chest-press", "Chest press alla macchina", "chest", ["triceps", "shoulders"], "Macchina", "Regola il sedile in modo che le impugnature siano all'altezza del petto. Spingi in avanti fino quasi a distendere le braccia e ritorna lentamente senza far toccare i pesi."],
    ["piegamenti", "Piegamenti sulle braccia", "chest", ["triceps", "shoulders", "abs"], "Corpo libero", "Mani poco più larghe delle spalle, corpo in linea retta dalla testa ai talloni. Scendi finché il petto è vicino al pavimento, poi risali mantenendo addome e glutei contratti."],
    ["dip-parallele", "Dip alle parallele", "chest", ["triceps", "shoulders"], "Parallele", "Sostieniti a braccia tese, busto leggermente inclinato in avanti. Scendi fino a 90° di gomito (o fin dove la spalla è comoda) e spingi per risalire."],
    // Schiena
    ["trazioni", "Trazioni alla sbarra", "back", ["biceps"], "Sbarra", "Presa prona poco più larga delle spalle, parti a braccia tese. Porta il mento sopra la sbarra tirando i gomiti verso i fianchi, poi scendi in modo controllato fino alla completa distensione."],
    ["lat-machine", "Lat machine presa larga", "back", ["biceps"], "Cavi", "Bloccati le cosce sotto i cuscinetti, petto alto. Tira la barra verso la parte alta del petto portando i gomiti in basso e indietro, poi lasciala risalire senza perdere la tensione."],
    ["rematore-bilanciere", "Rematore con bilanciere", "back", ["biceps", "shoulders"], "Bilanciere", "Busto inclinato a circa 45°, schiena neutra e ginocchia morbide. Tira il bilanciere verso l'ombelico stringendo le scapole, poi scendi controllando."],
    ["rematore-manubrio", "Rematore con manubrio a un braccio", "back", ["biceps"], "Manubri", "Appoggia mano e ginocchio sulla panca, schiena piatta. Tira il manubrio verso l'anca mantenendo il gomito vicino al corpo, poi scendi fino a distendere il braccio."],
    ["pulley-basso", "Pulley basso (rematore ai cavi)", "back", ["biceps"], "Cavi", "Seduto con le gambe leggermente flesse e il busto eretto. Tira l'impugnatura verso l'addome stringendo le scapole, poi torna in avanti senza arrotondare la schiena."],
    ["stacco-terra", "Stacco da terra", "back", ["hamstrings", "glutes"], "Bilanciere", "Piedi sotto il bilanciere, presa appena fuori dalle gambe, schiena neutra e petto alto. Spingi il pavimento con le gambe e porta il bacino in avanti fino a essere eretto; scendi con lo stesso percorso."],
    // Spalle
    ["military-press", "Military press con bilanciere", "shoulders", ["triceps"], "Bilanciere", "In piedi, bilanciere all'altezza delle clavicole, glutei e addome contratti. Spingi sopra la testa fino a distendere le braccia, poi torna lentamente alla posizione di partenza."],
    ["shoulder-press-manubri", "Shoulder press con manubri", "shoulders", ["triceps"], "Manubri", "Da seduto, manubri all'altezza delle orecchie. Spingi verso l'alto avvicinandoli sopra la testa e scendi fino a 90° di gomito."],
    ["alzate-laterali", "Alzate laterali", "shoulders", [], "Manubri", "In piedi con i manubri lungo i fianchi e i gomiti appena flessi. Solleva le braccia di lato fino all'altezza delle spalle, poi scendi lentamente."],
    ["alzate-frontali", "Alzate frontali", "shoulders", ["chest"], "Manubri", "In piedi, manubri davanti alle cosce. Solleva un braccio alla volta in avanti fino all'altezza delle spalle, senza oscillare con il busto."],
    ["face-pull", "Face pull", "shoulders", ["back"], "Cavi", "Cavo all'altezza del viso con la corda. Tira verso il viso aprendo i gomiti in fuori e ruotando le mani verso l'esterno, poi torna controllando."],
    ["alzate-posteriori", "Alzate posteriori (reverse fly)", "shoulders", ["back"], "Manubri", "Busto inclinato in avanti, schiena piatta. Apri le braccia lateralmente a gomiti leggermente flessi, stringendo le scapole, poi scendi piano."],
    // Bicipiti
    ["curl-bilanciere", "Curl con bilanciere", "biceps", [], "Bilanciere", "In piedi, presa supina larghezza spalle, gomiti fermi lungo i fianchi. Porta il bilanciere verso le spalle senza dondolare e scendi lentamente."],
    ["curl-manubri", "Curl con manubri alternato", "biceps", [], "Manubri", "Un manubrio per mano, gomiti ai fianchi. Fletti un braccio alla volta ruotando il polso verso l'alto e scendi con controllo."],
    ["curl-martello", "Curl a martello", "biceps", [], "Manubri", "Presa neutra (palmi uno di fronte all'altro). Fletti i gomiti portando i manubri verso le spalle senza muovere le braccia."],
    ["curl-scott", "Curl alla panca Scott", "biceps", [], "Bilanciere EZ", "Appoggia le braccia al cuscino inclinato. Fletti portando la barra verso il mento e scendi fino a quasi distendere il gomito, senza scatti."],
    ["curl-cavi", "Curl ai cavi", "biceps", [], "Cavi", "Cavo in basso, gomiti vicini al busto. Fletti portando l'impugnatura verso le spalle e torna lentamente: il cavo mantiene la tensione per tutto il movimento."],
    ["curl-concentrato", "Curl concentrato", "biceps", [], "Manubri", "Seduto, appoggia il gomito all'interno della coscia. Fletti il braccio portando il manubrio verso la spalla e scendi lentamente."],
    // Tricipiti
    ["pushdown-cavi", "Push-down ai cavi", "triceps", [], "Cavi", "Gomiti stretti ai fianchi, impugnatura all'altezza del petto. Distendi le braccia verso il basso senza muovere le spalle, poi risali fino a 90° di gomito."],
    ["french-press", "French press (skull crusher)", "triceps", [], "Bilanciere EZ", "Sdraiato, barra sopra il petto a braccia tese. Fletti solo i gomiti portando la barra verso la fronte, poi distendi di nuovo."],
    ["estensioni-sopra-testa", "Estensioni sopra la testa", "triceps", [], "Manubri", "In piedi o seduto, un manubrio tenuto con due mani dietro la nuca. Distendi le braccia verso l'alto tenendo i gomiti vicini alla testa."],
    ["panca-presa-stretta", "Panca piana presa stretta", "triceps", ["chest", "shoulders"], "Bilanciere", "Come la panca piana ma con le mani alla larghezza delle spalle. Gomiti vicini al busto, spingi concentrandoti sui tricipiti."],
    ["dip-panca", "Dip tra due panche", "triceps", ["chest", "shoulders"], "Corpo libero", "Mani sul bordo della panca dietro di te, gambe distese. Scendi piegando i gomiti a 90° e risali spingendo con i tricipiti."],
    ["kickback", "Kickback con manubrio", "triceps", [], "Manubri", "Busto inclinato, gomito alto e fermo. Distendi l'avambraccio all'indietro fino ad allineare il braccio, poi fletti lentamente."],
    // Quadricipiti
    ["squat", "Squat con bilanciere", "quads", ["glutes", "hamstrings", "abs"], "Bilanciere", "Bilanciere sui trapezi, piedi larghi come le spalle, punte leggermente aperte. Scendi spingendo il bacino indietro e le ginocchia in linea con i piedi fino almeno a cosce parallele, poi risali spingendo con tutto il piede."],
    ["front-squat", "Front squat", "quads", ["glutes", "abs"], "Bilanciere", "Bilanciere appoggiato alle spalle anteriori, gomiti alti. Scendi mantenendo il busto verticale e risali spingendo con i talloni."],
    ["leg-press", "Leg press", "quads", ["glutes", "hamstrings"], "Macchina", "Schiena e bacino ben appoggiati. Fletti le ginocchia fino a circa 90° senza staccare il bacino e spingi senza bloccare del tutto le ginocchia."],
    ["leg-extension", "Leg extension", "quads", [], "Macchina", "Seduto, cuscinetto sopra le caviglie. Distendi le gambe contraendo i quadricipiti e scendi lentamente."],
    ["affondi", "Affondi con manubri", "quads", ["glutes", "hamstrings"], "Manubri", "Fai un passo in avanti e scendi finché entrambe le ginocchia sono a circa 90°. Spingi con il piede anteriore per tornare in piedi."],
    ["squat-bulgaro", "Squat bulgaro", "quads", ["glutes"], "Manubri", "Piede posteriore appoggiato su una panca. Scendi in verticale con la gamba anteriore fino a coscia parallela e risali spingendo con il tallone."],
    ["goblet-squat", "Goblet squat", "quads", ["glutes", "abs"], "Manubri", "Tieni un manubrio al petto con due mani. Scendi in squat profondo mantenendo il busto eretto e risali spingendo con i piedi."],
    // Femorali
    ["stacco-rumeno", "Stacco rumeno", "hamstrings", ["glutes", "back"], "Bilanciere", "Gambe quasi tese, bilanciere vicino alle cosce. Porta il bacino indietro facendo scivolare il bilanciere lungo le gambe fino a sentire lo stiramento dei femorali, poi risali spingendo il bacino in avanti."],
    ["leg-curl-sdraiato", "Leg curl sdraiato", "hamstrings", ["calves"], "Macchina", "Sdraiato a pancia in giù, cuscinetto sopra i talloni. Fletti le ginocchia portando i talloni verso i glutei e scendi lentamente."],
    ["leg-curl-seduto", "Leg curl seduto", "hamstrings", [], "Macchina", "Seduto con il cuscinetto dietro le caviglie. Fletti le ginocchia verso il basso e ritorna controllando la fase di risalita."],
    ["good-morning", "Good morning", "hamstrings", ["glutes", "back"], "Bilanciere", "Bilanciere sui trapezi, ginocchia leggermente flesse. Inclina il busto in avanti spingendo il bacino indietro con la schiena neutra, poi torna in posizione eretta."],
    ["stacco-gambe-tese", "Stacco a gambe tese con manubri", "hamstrings", ["glutes"], "Manubri", "Manubri davanti alle cosce. Scendi con la schiena piatta facendo scorrere i pesi lungo le gambe e risali contraendo glutei e femorali."],
    ["nordic-curl", "Nordic hamstring curl", "hamstrings", ["glutes"], "Corpo libero", "In ginocchio con le caviglie bloccate. Scendi in avanti il più lentamente possibile mantenendo il busto in linea con le cosce, poi aiutati con le mani per risalire."],
    // Glutei
    ["hip-thrust", "Hip thrust", "glutes", ["hamstrings"], "Bilanciere", "Schiena alta appoggiata a una panca, bilanciere sul bacino. Spingi i fianchi verso l'alto contraendo i glutei fino ad allineare busto e cosce, poi scendi."],
    ["glute-bridge", "Ponte glutei", "glutes", ["hamstrings"], "Corpo libero", "Sdraiato con le ginocchia flesse e i piedi a terra. Solleva il bacino contraendo i glutei, tieni un secondo in alto e scendi."],
    ["kickback-cavi", "Kickback ai cavi", "glutes", ["hamstrings"], "Cavi", "Cavigliera al cavo basso. Porta la gamba dietro di te con ginocchio quasi teso, senza inarcare la schiena."],
    ["step-up", "Step-up con manubri", "glutes", ["quads"], "Manubri", "Sali su una panca spingendo con il piede appoggiato, estendi completamente l'anca in alto e scendi controllando."],
    ["abduzioni", "Abduzioni alla macchina", "glutes", [], "Macchina", "Seduto, cuscinetti all'esterno delle ginocchia. Apri le gambe contraendo i glutei e ritorna lentamente."],
    ["squat-sumo", "Squat sumo con manubrio", "glutes", ["quads", "hamstrings"], "Manubri", "Piedi molto larghi, punte aperte, manubrio tra le gambe. Scendi mantenendo il busto eretto e risali spingendo con i glutei."],
    // Polpacci
    ["calf-in-piedi", "Calf raise in piedi", "calves", [], "Macchina", "Spalle sotto i cuscinetti, punte sul bordo del rialzo. Sali sulle punte il più possibile, tieni un istante e scendi fino a sentire lo stiramento."],
    ["calf-seduto", "Calf raise da seduto", "calves", [], "Macchina", "Seduto con il cuscinetto sulle cosce. Spingi sulle punte per sollevare i talloni, poi scendi lentamente."],
    ["calf-leg-press", "Calf raise alla leg press", "calves", [], "Macchina", "Sulla pressa con le gambe quasi tese, appoggia le punte sul bordo. Spingi con le caviglie e torna indietro lentamente."],
    ["calf-monopodalico", "Calf raise a una gamba", "calves", [], "Corpo libero", "Su un gradino, una gamba alla volta, appoggiandoti a un sostegno. Sali sulla punta e scendi sotto il livello del gradino."],
    ["donkey-calf", "Donkey calf raise", "calves", [], "Corpo libero", "Busto inclinato in avanti appoggiato a una panca, punte su un rialzo. Alza i talloni il più possibile e scendi controllando."],
    // Addominali
    ["crunch", "Crunch a terra", "abs", [], "Corpo libero", "Sdraiato con le ginocchia flesse. Solleva spalle e parte alta della schiena contraendo l'addome, senza tirare il collo, e scendi lentamente."],
    ["plank", "Plank", "abs", ["shoulders"], "Corpo libero", "Appoggiato sugli avambracci e sulle punte, corpo in linea retta. Contrai addome e glutei e mantieni la posizione senza cedere con il bacino."],
    ["sollevamento-gambe", "Sollevamento gambe alla sbarra", "abs", [], "Sbarra", "Appeso alla sbarra, porta le gambe tese (o le ginocchia) in alto fino all'orizzontale senza dondolare, poi scendi lentamente."],
    ["crunch-cavi", "Crunch ai cavi", "abs", [], "Cavi", "In ginocchio davanti al cavo alto con la corda dietro la testa. Fletti il busto portando i gomiti verso le ginocchia contraendo l'addome."],
    ["russian-twist", "Russian twist", "abs", [], "Corpo libero", "Seduto con il busto inclinato indietro e i piedi sollevati. Ruota il busto da un lato all'altro portando le mani vicino al pavimento."],
    ["ab-wheel", "Ruota addominale", "abs", ["shoulders"], "Ruota", "In ginocchio con le mani sulla ruota. Rotola in avanti mantenendo la schiena piatta finché riesci, poi torna indietro contraendo l'addome."]
  ];
  const EXERCISES = RAW.map(([key, name, primary, secondary, equipment, instructions]) => ({ key, name, primary, secondary, equipment, instructions }));

  // Citazioni: solo testi dei quali è nota la fonte. Le massime delfiche non hanno un autore singolo.
  const QUOTES = [
    { gr: "τῆς δ᾽ ἀρετῆς ἱδρῶτα θεοὶ προπάροιθεν ἔθηκαν ἀθάνατοι", it: "Davanti alla virtù gli dèi immortali posero il sudore.", by: "Esiodo, Opere e giorni, 289-290", statue: "doriforo" },
    { gr: "Γνῶθι σεαυτόν", it: "Conosci te stesso.", by: "Massima delfica, Tempio di Apollo a Delfi", statue: "apollo" },
    { gr: "Μηδὲν ἄγαν", it: "Nulla di troppo.", by: "Massima delfica, Tempio di Apollo a Delfi", statue: "discobolo" },
    { gr: "Ἀρχὴ ἥμισυ παντός", it: "Il principio è la metà del tutto.", by: "Proverbio greco antico", statue: "hermes" },
    { gr: "οὐ τὸ ζῆν περὶ πλείστου ποιητέον, ἀλλὰ τὸ εὖ ζῆν", it: "Non il semplice vivere va stimato più di tutto, ma il vivere bene.", by: "Platone, Critone, 48b", statue: "laocoonte" },
    { gr: "Ὁ βίος βραχύς, ἡ δὲ τέχνη μακρή", it: "La vita è breve, l'arte è lunga.", by: "Ippocrate, Aforismi, I, 1", statue: "ercole" },
    { la: "Mens sana in corpore sano", it: "Una mente sana in un corpo sano.", by: "Giovenale, Satire, X, 356", statue: "doriforo" }
  ];

  // Schede delle statue (le immagini sono illustrazioni stilizzate; vedi arete-art.js).
  const STATUES = [
    { id: "discobolo", name: "Discobolo", by: "Mirone", date: "ca. 460–450 a.C.", note: "L'originale in bronzo è perduto: lo conosciamo da copie romane in marmo." },
    { id: "doriforo", name: "Doriforo", by: "Policleto", date: "ca. 440 a.C.", note: "Il «portatore di lancia», esempio del canone delle proporzioni e del contrapposto." },
    { id: "hermes", name: "Hermes con Dioniso fanciullo", by: "attribuito a Prassitele", date: "IV sec. a.C.", note: "Conservato a Olimpia; l'attribuzione è discussa." },
    { id: "apollo", name: "Apollo del Belvedere", by: "copia romana da un originale greco in bronzo", date: "II sec. d.C. (originale IV sec. a.C.)", note: "Musei Vaticani." },
    { id: "ercole", name: "Ercole Farnese", by: "Glicone (copia da Lisippo)", date: "copia di età romana", note: "Eracle stanco appoggiato alla clava, con le mele delle Esperidi dietro la schiena." },
    { id: "laocoonte", name: "Laocoonte e i suoi figli", by: "Agesandro, Atanodoro e Polidoro di Rodi", date: "età ellenistica o romana", note: "Musei Vaticani; la datazione è oggetto di dibattito." }
  ];

  root.AreteData = { MUSCLE_NAMES, EXERCISES, QUOTES, STATUES };
})(typeof window !== "undefined" ? window : globalThis);
