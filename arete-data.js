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
    ["ab-wheel", "Ruota addominale", "abs", ["shoulders"], "Ruota", "In ginocchio con le mani sulla ruota. Rotola in avanti mantenendo la schiena piatta finché riesci, poi torna indietro contraendo l'addome."],
    // ---- Aggiunte (v2) ----
    // Petto
    ["panca-inclinata-bilanciere", "Panca inclinata con bilanciere", "chest", ["shoulders", "triceps"], "Bilanciere", "Panca inclinata di 30°. Scendi con il bilanciere verso la parte alta del petto, gomiti a circa 45–60° dal busto, e spingi in verticale senza staccare i glutei."],
    ["panca-declinata", "Panca declinata con bilanciere", "chest", ["triceps"], "Bilanciere", "Panca declinata, piedi bloccati. Abbassa il bilanciere sulla parte bassa del petto con controllo e spingi verso l'alto, scapole addotte."],
    ["panca-piana-manubri", "Panca piana con manubri", "chest", ["triceps", "shoulders"], "Manubri", "Sdraiato, manubri all'altezza del petto. Spingi in alto avvicinandoli senza farli toccare e scendi lentamente fino a sentire lo stiramento del petto."],
    ["croci-manubri", "Croci con manubri", "chest", ["shoulders"], "Manubri", "Sdraiato con i manubri sopra il petto e i gomiti appena flessi. Apri le braccia in un arco fino a sentire lo stiramento, poi richiudile contraendo il petto."],
    ["pec-deck", "Pec deck (croci alla macchina)", "chest", ["shoulders"], "Macchina", "Seduto con la schiena appoggiata e gli avambracci sui cuscinetti. Porta le braccia davanti al petto contraendo e torna indietro lentamente."],
    ["croci-cavi-alti", "Croci ai cavi alti (dall'alto verso il basso)", "chest", ["shoulders"], "Cavi", "Cavi in alto, un passo avanti e busto leggermente inclinato. Porta le mani davanti al bacino in un arco, gomiti appena flessi, e risali controllando."],
    ["croci-cavi-bassi", "Croci ai cavi bassi (dal basso verso l'alto)", "chest", ["shoulders"], "Cavi", "Cavi in basso, mani lungo i fianchi. Solleva le braccia in un arco fino all'altezza del volto, contraendo la parte alta del petto, e scendi lentamente."],
    ["piegamenti-rialzati", "Piegamenti con piedi rialzati", "chest", ["shoulders", "triceps"], "Corpo libero", "Piedi su una panca, mani a terra poco più larghe delle spalle. Scendi con il corpo in linea retta fino a sfiorare il pavimento e risali."],
    ["pullover-manubrio", "Pullover con manubrio", "chest", ["back", "triceps"], "Manubri", "Sdraiato di traverso sulla panca, manubrio sopra il petto. Portalo dietro la testa a braccia quasi tese, senza inarcare la schiena, e torna su."],
    ["svend-press", "Svend press", "chest", ["shoulders"], "Manubri", "In piedi, un disco o due manubri uniti davanti al petto. Spingi in avanti stringendo con forza e torna, mantenendo i gomiti alti."],
    ["piegamenti-elastico", "Piegamenti con elastico", "chest", ["triceps", "shoulders"], "Elastici", "Elastico dietro la schiena e ai polsi. Esegui il piegamento spingendo contro la resistenza dell'elastico in risalita."],
    // Schiena
    ["trazioni-supine", "Trazioni supine (chin-up)", "back", ["biceps"], "Sbarra", "Presa supina alla larghezza delle spalle. Tirati su portando il mento sopra la sbarra con le scapole giù, poi scendi controllando."],
    ["trazioni-presa-stretta", "Trazioni presa neutra", "back", ["biceps"], "Sbarra", "Presa neutra (palmi uno di fronte all'altro). Porta il petto verso le mani senza dondolare e scendi fino ad avere le braccia quasi tese."],
    ["lat-machine-presa-stretta", "Lat machine presa stretta", "back", ["biceps"], "Cavi", "Presa stretta o neutra. Tira la barra al petto abbassando i gomiti lungo i fianchi, senza dondolare con il busto."],
    ["pulldown-braccia-tese", "Pulldown a braccia tese", "back", ["triceps"], "Cavi", "In piedi davanti al cavo alto, braccia quasi tese. Porta la barra alle cosce con un arco, contraendo i dorsali, e risali lentamente."],
    ["rematore-t-bar", "Rematore con T-bar", "back", ["biceps"], "Bilanciere", "Busto inclinato e schiena piatta, ginocchia leggermente flesse. Tira il carico verso l'addome stringendo le scapole e scendi controllando."],
    ["rematore-macchina", "Rematore alla macchina", "back", ["biceps"], "Macchina", "Petto appoggiato al cuscino. Tira le maniglie verso di te avvicinando le scapole e torna lentamente senza staccare il petto."],
    ["rematore-presa-inversa", "Rematore con bilanciere presa inversa", "back", ["biceps"], "Bilanciere", "Presa supina, busto inclinato a schiena piatta. Tira il bilanciere verso l'ombelico tenendo i gomiti vicini al corpo."],
    ["pulley-presa-neutra", "Pulley con presa neutra", "back", ["biceps"], "Cavi", "Seduto, maniglia neutra. Tira verso l'addome portando i gomiti indietro e stringendo le scapole; torna senza lasciar cadere le spalle in avanti."],
    ["rematore-kettlebell", "Rematore con kettlebell", "back", ["biceps"], "Kettlebell", "Un appoggio su una panca, schiena piatta. Tira la kettlebell verso l'anca con il gomito vicino al corpo e scendi lentamente."],
    ["rematore-elastico", "Rematore con elastico", "back", ["biceps"], "Elastici", "Seduto a gambe tese con l'elastico attorno ai piedi. Tira le maniglie verso l'addome stringendo le scapole e torna con controllo."],
    ["stacco-sumo", "Stacco sumo", "back", ["glutes", "hamstrings", "quads"], "Bilanciere", "Piedi larghi, punte aperte, presa stretta all'interno delle gambe. Spingi il pavimento con le gambe mantenendo la schiena neutra e chiudi con i glutei."],
    ["rack-pull", "Rack pull", "back", ["glutes", "hamstrings"], "Bilanciere", "Bilanciere appoggiato ai supporti all'altezza delle ginocchia. Sollevalo estendendo anche e ginocchia con schiena neutra e abbassalo con controllo."],
    ["iperestensioni", "Iperestensioni", "back", ["glutes", "hamstrings"], "Corpo libero", "Sulla panca a 45° con i fianchi appoggiati. Scendi con il busto a schiena neutra e risali contraendo glutei e lombari, senza iperestendere."],
    ["shrug-bilanciere", "Shrug con bilanciere", "back", [], "Bilanciere", "In piedi, bilanciere davanti alle cosce. Solleva le spalle verso le orecchie, tieni un istante e scendi senza ruotare le spalle."],
    ["shrug-manubri", "Shrug con manubri", "back", [], "Manubri", "In piedi con i manubri ai lati. Alza le spalle verticalmente, contrai in alto e scendi lentamente."],
    ["superman", "Superman", "back", ["glutes"], "Corpo libero", "A pancia in giù con le braccia avanti. Solleva braccia e gambe insieme contraendo la schiena, tieni un secondo e scendi."],
    // Spalle
    ["arnold-press", "Arnold press", "shoulders", ["triceps"], "Manubri", "Seduto, manubri davanti al viso con i palmi verso di te. Spingi in alto ruotando i palmi in avanti e torna ruotando in senso inverso."],
    ["shoulder-press-macchina", "Shoulder press alla macchina", "shoulders", ["triceps"], "Macchina", "Regola il sedile con le maniglie all'altezza delle spalle. Spingi in alto senza bloccare i gomiti e scendi lentamente."],
    ["alzate-laterali-cavi", "Alzate laterali ai cavi", "shoulders", [], "Cavi", "In piedi di lato al cavo basso. Solleva il braccio lateralmente fino all'altezza della spalla con il gomito appena flesso e scendi lentamente."],
    ["alzate-frontali-bilanciere", "Alzate frontali con bilanciere", "shoulders", ["chest"], "Bilanciere", "In piedi con il bilanciere davanti alle cosce. Sollevalo a braccia tese fino all'altezza degli occhi senza dondolare e scendi con controllo."],
    ["push-press", "Push press", "shoulders", ["triceps", "quads"], "Bilanciere", "Bilanciere sulle spalle. Piega leggermente le ginocchia e spingi con le gambe per aiutare la distensione delle braccia sopra la testa."],
    ["pike-push-up", "Pike push-up", "shoulders", ["triceps"], "Corpo libero", "A V rovesciata con i fianchi in alto. Piega i gomiti portando la testa verso il pavimento tra le mani e risali."],
    ["tirate-al-mento", "Tirate al mento (upright row)", "shoulders", ["back"], "Bilanciere EZ", "Presa poco più larga delle spalle. Tira il bilanciere lungo il corpo fino al petto con i gomiti più alti dei polsi, senza salire oltre l'altezza delle spalle."],
    ["reverse-pec-deck", "Alzate posteriori alla macchina", "shoulders", ["back"], "Macchina", "Seduto con il petto sul cuscino. Apri le braccia all'indietro fino alla linea delle spalle contraendo la parte posteriore e torna lentamente."],
    ["alzate-laterali-elastico", "Alzate laterali con elastico", "shoulders", [], "Elastici", "In piedi sull'elastico. Solleva le braccia ai lati fino all'altezza delle spalle e scendi controllando la tensione."],
    ["kettlebell-press", "Military press con kettlebell", "shoulders", ["triceps"], "Kettlebell", "Kettlebell appoggiata alla spalla, avambraccio verticale. Spingi sopra la testa e torna con controllo, addome contratto."],
    // Bicipiti
    ["curl-ez", "Curl con bilanciere EZ", "biceps", [], "Bilanciere EZ", "In piedi, presa sulle curve del bilanciere EZ. Fletti i gomiti portando il carico verso le spalle, gomiti fermi, e scendi lentamente."],
    ["curl-panca-inclinata", "Curl su panca inclinata", "biceps", [], "Manubri", "Seduto su una panca inclinata a 45° con le braccia che pendono. Fletti i gomiti senza muoverli in avanti e scendi fino a tendere il bicipite."],
    ["curl-ragno", "Curl ragno (spider curl)", "biceps", [], "Manubri", "Petto appoggiato a una panca inclinata, braccia verticali. Fletti i gomiti contraendo il bicipite e scendi lentamente."],
    ["curl-inverso", "Curl inverso", "biceps", [], "Bilanciere EZ", "Presa prona. Fletti i gomiti mantenendo i polsi rigidi e scendi lentamente; lavora l'avambraccio e il brachioradiale."],
    ["curl-macchina", "Curl alla macchina", "biceps", [], "Macchina", "Gomiti appoggiati al cuscino. Fletti portando le maniglie verso le spalle e torna lentamente."],
    ["curl-elastico", "Curl con elastico", "biceps", [], "Elastici", "In piedi sull'elastico. Fletti i gomiti contro la resistenza e scendi controllando."],
    ["curl-zottman", "Curl Zottman", "biceps", [], "Manubri", "Sali con i palmi verso l'alto, ruota i polsi in cima e scendi con la presa prona, lentamente."],
    ["curl-cavo-sopra-testa", "Curl al cavo con braccia alzate", "biceps", [], "Cavi", "Tra le due colonne con le braccia a T. Fletti i gomiti portando le maniglie verso le orecchie e torna controllando."],
    // Tricipiti
    ["pushdown-corda", "Push-down con corda", "triceps", [], "Cavi", "Cavo alto con la corda, gomiti ai fianchi. Estendi le braccia aprendo la corda in fondo e risali lentamente."],
    ["pushdown-presa-inversa", "Push-down presa inversa", "triceps", [], "Cavi", "Presa supina sulla barra al cavo alto. Estendi le braccia tenendo i gomiti fermi e torna lentamente."],
    ["french-press-manubri", "French press con manubri", "triceps", [], "Manubri", "Sdraiato, manubri sopra il petto. Fletti i gomiti portando i manubri ai lati della testa senza aprirli e distendi."],
    ["estensioni-cavo-corda-sopra-testa", "Estensioni al cavo sopra la testa con corda", "triceps", [], "Cavi", "Di spalle al cavo basso, corda dietro la testa. Estendi le braccia in avanti e in alto mantenendo i gomiti vicini alle orecchie."],
    ["dip-macchina", "Dip alla macchina", "triceps", ["chest"], "Macchina", "Seduto, spingi le maniglie verso il basso estendendo i gomiti e risali lentamente senza sollevare le spalle."],
    ["piegamenti-diamante", "Piegamenti a diamante", "triceps", ["chest", "shoulders"], "Corpo libero", "Mani vicine sotto il petto a formare un diamante. Scendi con i gomiti vicini al corpo e risali."],
    ["kickback-cavi-tricipiti", "Kickback ai cavi per tricipiti", "triceps", [], "Cavi", "Busto inclinato, gomito ai fianchi. Estendi l'avambraccio all'indietro fino a tendere il braccio e torna lentamente."],
    ["estensioni-tricipiti-elastico", "Estensioni tricipiti con elastico", "triceps", [], "Elastici", "Elastico fissato in alto, gomiti ai fianchi. Estendi le braccia verso il basso e torna lentamente."],
    // Quadricipiti
    ["hack-squat", "Hack squat", "quads", ["glutes"], "Macchina", "Schiena appoggiata, piedi sulla pedana. Scendi fino a circa 90° e spingi per risalire senza bloccare le ginocchia."],
    ["squat-smith", "Squat al multipower", "quads", ["glutes"], "Macchina", "Barra sul trapezio, piedi leggermente avanti. Scendi con la schiena neutra fino a cosce parallele e risali."],
    ["affondi-bilanciere", "Affondi con bilanciere", "quads", ["glutes", "hamstrings"], "Bilanciere", "Bilanciere sulle spalle. Fai un passo avanti e scendi finché il ginocchio posteriore sfiora il pavimento, poi spingi per tornare."],
    ["affondi-camminata", "Affondi camminati", "quads", ["glutes", "hamstrings"], "Manubri", "Con i manubri ai lati. Alterna un passo avanti con un affondo e avanza, busto eretto e ginocchio che non crolla all'interno."],
    ["affondi-indietro", "Affondi indietro", "quads", ["glutes"], "Manubri", "Fai un passo indietro e scendi con il ginocchio posteriore verso il pavimento, poi spingi con la gamba avanti per tornare."],
    ["squat-corpo-libero", "Squat a corpo libero", "quads", ["glutes"], "Corpo libero", "Piedi larghi quanto le spalle, braccia avanti. Scendi con il busto eretto finché le cosce sono parallele e risali."],
    ["wall-sit", "Wall sit (sedia al muro)", "quads", ["glutes"], "Corpo libero", "Schiena al muro e cosce parallele al pavimento, ginocchia a 90°. Mantieni la posizione per il tempo previsto."],
    ["squat-box", "Squat al box", "quads", ["glutes", "hamstrings"], "Bilanciere", "Scendi a sederti su un box dietro di te, con controllo, e risali spingendo i piedi nel pavimento senza rimbalzare."],
    ["sissy-squat", "Sissy squat", "quads", [], "Corpo libero", "Appoggiandoti a un sostegno, piega le ginocchia in avanti con il busto inclinato all'indietro, sulle punte dei piedi, poi risali."],
    ["squat-elastico", "Squat con elastico", "quads", ["glutes"], "Elastici", "Elastico sotto i piedi e sulle spalle. Esegui lo squat spingendo contro la resistenza in risalita."],
    ["squat-salto", "Squat jump", "quads", ["glutes", "calves"], "Corpo libero", "Esegui uno squat e salta il più in alto possibile; atterra morbido sulle punte e rientra subito nello squat."],
    // Femorali
    ["stacco-rumeno-manubri", "Stacco rumeno con manubri", "hamstrings", ["glutes", "back"], "Manubri", "Manubri davanti alle cosce. Porta indietro i fianchi con ginocchia appena flesse e schiena neutra, scendi lungo le gambe e risali stringendo i glutei."],
    ["stacco-monopodalico", "Stacco monopodalico", "hamstrings", ["glutes"], "Manubri", "Su una gamba, busto in avanti e gamba libera tesa all'indietro. Scendi a schiena piatta e risali contraendo glutei e femorali."],
    ["glute-ham-raise", "Glute-ham raise", "hamstrings", ["glutes", "back"], "Macchina", "Sulla macchina, flettiti in avanti dai fianchi e risali contraendo glutei e femorali fino a tornare in linea."],
    ["swing-kettlebell", "Swing con kettlebell", "hamstrings", ["glutes", "back"], "Kettlebell", "Piedi larghi quanto le spalle, kettlebell tra le gambe. Spingi i fianchi in avanti con forza per far salire il peso fino all'altezza del petto, a braccia rilassate."],
    ["stacco-rumeno-kettlebell", "Stacco rumeno con kettlebell", "hamstrings", ["glutes"], "Kettlebell", "Kettlebell davanti a te. Porta indietro i fianchi mantenendo la schiena piatta, scendi lungo le gambe e risali stringendo i glutei."],
    ["ponte-piedi-rialzati", "Ponte femorali con piedi rialzati", "hamstrings", ["glutes"], "Corpo libero", "Sdraiato con i talloni su una panca. Solleva il bacino contraendo femorali e glutei, tieni un secondo e scendi."],
    ["slider-leg-curl", "Leg curl con slider", "hamstrings", ["glutes"], "Corpo libero", "Sdraiato con i talloni su un panno o uno slider, bacino alto. Fletti le ginocchia portando i talloni verso i glutei e torna lentamente."],
    ["leg-curl-elastico", "Leg curl con elastico", "hamstrings", [], "Elastici", "A pancia in giù con l'elastico alle caviglie. Fletti le ginocchia contro la resistenza e torna controllando."],
    // Glutei
    ["hip-thrust-monopodalico", "Hip thrust a una gamba", "glutes", ["hamstrings"], "Corpo libero", "Schiena appoggiata alla panca, una gamba alla volta. Spingi il bacino in alto contraendo il gluteo e scendi lentamente."],
    ["hip-thrust-macchina", "Hip thrust alla macchina", "glutes", ["hamstrings"], "Macchina", "Schiena appoggiata alla panca e cintura sul bacino. Spingi i fianchi in alto fino all'allineamento e scendi controllando."],
    ["glute-bridge-monopodalico", "Ponte glutei a una gamba", "glutes", ["hamstrings"], "Corpo libero", "Sdraiato con una gamba tesa in alto. Solleva il bacino spingendo con l'altro piede, contrai e scendi."],
    ["donkey-kick", "Donkey kick", "glutes", ["hamstrings"], "Corpo libero", "A quattro zampe. Porta una gamba piegata all'indietro e in alto contraendo il gluteo, senza inarcare la schiena."],
    ["fire-hydrant", "Fire hydrant", "glutes", [], "Corpo libero", "A quattro zampe. Solleva lateralmente il ginocchio piegato mantenendo il bacino fermo e torna lentamente."],
    ["clamshell-elastico", "Clamshell con elastico", "glutes", [], "Elastici", "Sdraiato di lato con le ginocchia flesse e l'elastico sopra di esse. Apri il ginocchio superiore senza ruotare il bacino e chiudi lentamente."],
    ["camminata-laterale-elastico", "Camminata laterale con elastico", "glutes", ["quads"], "Elastici", "Elastico attorno alle ginocchia, in posizione di mezzo squat. Fai passi laterali mantenendo la tensione."],
    ["abduzioni-cavi", "Abduzioni ai cavi", "glutes", [], "Cavi", "Cavigliera al cavo basso. Porta la gamba lateralmente lontano dal corpo senza inclinarti, poi torna lentamente."],
    ["pull-through-cavi", "Pull-through ai cavi", "glutes", ["hamstrings"], "Cavi", "Di spalle al cavo basso, corda tra le gambe. Porta indietro i fianchi e scatta in avanti contraendo i glutei, schiena neutra."],
    ["hip-thrust-kettlebell", "Hip thrust con kettlebell", "glutes", ["hamstrings"], "Kettlebell", "Schiena su una panca e kettlebell sul bacino. Spingi i fianchi in alto contraendo i glutei e scendi lentamente."],
    // Polpacci
    ["calf-smith", "Calf raise al multipower", "calves", [], "Macchina", "Sotto la barra con le punte su un rialzo. Sali sulle punte il più possibile e scendi fino a sentire lo stiramento."],
    ["calf-manubrio-monopodalico", "Calf raise a una gamba con manubrio", "calves", [], "Manubri", "In piedi su un gradino, una gamba alla volta, manubrio nella mano dallo stesso lato. Sali e scendi controllando."],
    ["salto-corda", "Salto con la corda", "calves", [], "Corpo libero", "Salta con la corda atterrando sull'avampiede con le ginocchia morbide, a ritmo regolare."],
    ["tibiale-anteriore", "Tibiale anteriore alla parete", "calves", [], "Corpo libero", "Schiena al muro e talloni distanti, ginocchia tese. Solleva le punte dei piedi verso gli stinchi e scendi lentamente."],
    // Addominali
    ["crunch-inverso", "Crunch inverso", "abs", [], "Corpo libero", "Sdraiato, ginocchia al petto. Solleva il bacino dal pavimento contraendo il basso addome e scendi lentamente."],
    ["bicycle-crunch", "Bicycle crunch", "abs", [], "Corpo libero", "Sdraiato con le mani dietro la testa. Porta il gomito verso il ginocchio opposto alternando i lati, come in una pedalata."],
    ["mountain-climber", "Mountain climber", "abs", ["shoulders", "quads"], "Corpo libero", "In posizione di plank alta. Porta alternativamente le ginocchia al petto a ritmo sostenuto, bacino basso."],
    ["dead-bug", "Dead bug", "abs", [], "Corpo libero", "Sdraiato con braccia e gambe in alto. Distendi braccio e gamba opposti senza staccare la zona lombare dal pavimento e alterna."],
    ["bird-dog", "Bird dog", "abs", ["back", "glutes"], "Corpo libero", "A quattro zampe. Distendi il braccio e la gamba opposti mantenendo il busto fermo, tieni un secondo e alterna."],
    ["plank-laterale", "Plank laterale", "abs", ["shoulders"], "Corpo libero", "Appoggiato su un avambraccio e sul lato del piede. Solleva il bacino mantenendo il corpo in linea retta e resta fermo."],
    ["hollow-body", "Hollow body hold", "abs", [], "Corpo libero", "Sdraiato con braccia e gambe tese leggermente sollevate. Tieni la zona lombare a terra e mantieni la posizione."],
    ["v-up", "V-up", "abs", [], "Corpo libero", "Sdraiato con braccia e gambe tese. Solleva contemporaneamente busto e gambe toccando le punte dei piedi e torna lentamente."],
    ["pallof-press", "Pallof press", "abs", ["shoulders"], "Cavi", "Di lato al cavo, mani al petto. Estendi le braccia davanti a te resistendo alla rotazione del busto e torna."],
    ["woodchop-cavi", "Woodchop ai cavi", "abs", ["shoulders"], "Cavi", "Cavo alto di lato. Con le braccia tese ruota il busto portando le mani in basso verso il fianco opposto e torna controllando."],
    ["sollevamento-ginocchia", "Sollevamento ginocchia in appoggio", "abs", [], "Parallele", "Con gli avambracci appoggiati e la schiena contro il supporto. Porta le ginocchia al petto senza dondolare e scendi lentamente."],
    ["toes-to-bar", "Toes to bar", "abs", ["back"], "Sbarra", "Appeso alla sbarra. Solleva le gambe tese fino a toccare la sbarra con le punte dei piedi e scendi con controllo."],
    ["crunch-macchina", "Crunch alla macchina", "abs", [], "Macchina", "Seduto con i cuscinetti sul petto. Fletti il busto in avanti contraendo l'addome e torna lentamente."],
    ["russian-twist-peso", "Russian twist con peso", "abs", [], "Manubri", "Seduto con il busto inclinato indietro e un peso tra le mani. Ruota da un lato all'altro portando il peso accanto all'anca."],
    ["turkish-get-up", "Turkish get-up", "abs", ["shoulders", "glutes"], "Kettlebell", "Da sdraiato con la kettlebell tesa verso l'alto. Alzati in piedi a tappe controllate, sempre con lo sguardo sul peso, e ritorna al pavimento."],
    ["l-sit", "L-sit alle parallele", "abs", ["triceps"], "Parallele", "Sorreggiti sulle parallele a braccia tese con le gambe tese davanti, parallele al pavimento. Mantieni la posizione."],
    ["farmer-walk", "Farmer walk", "abs", ["back", "shoulders"], "Manubri", "Cammina con un manubrio per mano, busto eretto e spalle indietro, a passi corti e controllati."]
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
