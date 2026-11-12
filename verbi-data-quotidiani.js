// VERBI FONDAMENTALI — sezione «Verbi di tutti i giorni»: πάω, κάνω, λέω, βλέπω, τρώω, πίνω, έρχομαι.
// Ogni verbo ha due lezioni: presente (con espressioni e frasi) e passato + futuro.
(function (root) {
  const D = root.VerbiData;
  const { conj, vocab, ex, note, dlg, fill } = D;
  const P6 = ["εγώ", "εσύ", "αυτός / αυτή / αυτό", "εμείς", "εσείς", "αυτοί / αυτές / αυτά"];
  const six = (forms, prons, its) => forms.map((f, i) => [P6[i], f, prons[i], its[i]]);

  D.sections.push({
    id: "quotidiani", n: 4, title: "Τα ρήματα της καθημερινότητας", it: "Verbi di tutti i giorni",
    sub: "Andare, fare, dire, vedere, mangiare, bere, venire: presente, passato e futuro",
    intro: "I sette verbi che usi ogni giorno: πάω (andare), κάνω (fare), λέω (dire), βλέπω (vedere), τρώω (mangiare), πίνω (bere) e έρχομαι (venire). Per ognuno una lezione sul presente, con espressioni e frasi pronte, e una sul passato e sul futuro. Il passato (aoristo) di questi verbi è irregolare, quindi conviene impararlo a memoria insieme al presente.",
    lessons: [
      // ───────────── ANDARE ─────────────
      {
        id: "k1", part: "Andare · πάω", title: "Il presente di πάω e i luoghi",
        intro: [
          "«Πάω» significa «vado». È la forma di tutti i giorni; la forma più formale è «πηγαίνω», che si trova nei testi scritti e nelle indicazioni.",
          "Per dire «dove» si usa «σε» + articolo, che si fonde in una parola sola: σε + το = στο, σε + τη(ν) = στη(ν), σε + τον = στον. «A casa» è un caso a parte: Πάω σπίτι, senza articolo."
        ],
        blocks: [
          conj("πάω · presente", six(
            ["πάω", "πας", "πάει", "πάμε", "πάτε", "πάνε"],
            ["pào", "pas", "pài", "pàme", "pàte", "pàne"],
            ["io vado", "tu vai", "lui / lei va", "noi andiamo", "voi andate / Lei va", "loro vanno"])),
          note("«Πάμε!» vale anche come invito: «Andiamo!». Alla terza persona plurale si sente anche «πάνε» scritto «πάν(ε)».", "tip"),
          vocab("Dove vai? I luoghi più comuni", [
            ["στο σχολείο", "sto sholìo", "a scuola"], ["στη δουλειά", "sti dulià", "al lavoro"], ["στην παραλία", "stin paralìa", "in spiaggia"],
            ["στο εστιατόριο", "sto estiatòrio", "al ristorante"], ["στο γυμναστήριο", "sto jimnastìrio", "in palestra"], ["στο σούπερ μάρκετ", "sto sùper màrket", "al supermercato"],
            ["στον γιατρό", "ston iatrò", "dal medico"], ["στο πανεπιστήμιο", "sto panepistìmio", "all'università"]
          ]),
          ex("Frasi d'esempio", [
            ["Πού πας;", "Dove vai?"], ["Πάω σπίτι.", "Vado a casa."], ["Πάω στη δουλειά κάθε μέρα.", "Vado al lavoro ogni giorno."],
            ["Πάμε στην παραλία;", "Andiamo in spiaggia?"], ["Η Μαρία πάει στο σχολείο.", "Maria va a scuola."], ["Πάτε στην Ελλάδα το καλοκαίρι;", "Andate in Grecia d'estate?"],
            ["Τα παιδιά πάνε στο πάρκο.", "I bambini vanno al parco."], ["Πάω στον γιατρό.", "Vado dal medico."]
          ])
        ],
        fills: [
          fill("Εγώ ___ στη δουλειά.", "πάω", ["πάω", "πας", "πάμε", "πάνε"], "Con «εγώ» il verbo è πάω."),
          fill("Εσύ ___ στο σχολείο;", "πας", ["πας", "πάω", "πάει", "πάτε"], "Con «εσύ» → πας."),
          fill("Εμείς ___ στην παραλία.", "πάμε", ["πάμε", "πάτε", "πάω", "πάνε"], "Con «εμείς» → πάμε."),
          fill("Η Ελένη ___ στον γιατρό.", "πάει", ["πάει", "πας", "πάνε", "πάμε"], "Soggetto singolare (lei) → πάει."),
          fill("Η Μαρία πάει ___ σχολείο.", "στο", ["στο", "στη", "στον", "στην"], "«Σχολείο» è neutro: σε + το = στο.")
        ]
      },
      {
        id: "k2", part: "Andare · πάω", title: "πάω: passato e futuro",
        intro: [
          "Il passato di «πάω» è «πήγα» (sono andato/a) e il futuro è «θα πάω» (andrò). Il futuro si forma con «θα» + la forma del verbo che trovi dopo «να» (να πάω, να πας…).",
          "La stessa forma «να πάω» serve dopo i verbi modali: Θέλω να πάω = «Voglio andare», Μπορώ να πάω = «Posso andare». Le parole del tempo (χθες, αύριο) aiutano a scegliere la forma giusta."
        ],
        blocks: [
          conj("πάω · passato (aoristo)", six(
            ["πήγα", "πήγες", "πήγε", "πήγαμε", "πήγατε", "πήγαν"],
            ["pìga", "pìjes", "pìje", "pìgame", "pìgate", "pìgan"],
            ["io sono andato/a", "tu sei andato/a", "lui / lei è andato/a", "noi siamo andati", "voi siete andati", "loro sono andati"])),
          conj("πάω · futuro", six(
            ["θα πάω", "θα πας", "θα πάει", "θα πάμε", "θα πάτε", "θα πάνε"],
            ["tha pào", "tha pas", "tha pài", "tha pàme", "tha pàte", "tha pàne"],
            ["io andrò", "tu andrai", "lui / lei andrà", "noi andremo", "voi andrete", "loro andranno"])),
          vocab("Parole del tempo", [
            ["χθες", "hthes", "ieri"], ["σήμερα", "sìmera", "oggi"], ["αύριο", "àvrio", "domani"],
            ["το Σαββατοκύριακο", "to savatokìriako", "il fine settimana"], ["τον Μάιο", "ton màio", "a maggio"], ["πέρσι", "pèrsi", "l'anno scorso"]
          ]),
          ex("Frasi d'esempio", [
            ["Χθες πήγα στο σινεμά.", "Ieri sono andato al cinema."], ["Πού πήγες το Σαββατοκύριακο;", "Dove sei andato nel fine settimana?"], ["Πήγαμε στη θάλασσα.", "Siamo andati al mare."],
            ["Αύριο θα πάω στη δουλειά νωρίς.", "Domani andrò al lavoro presto."], ["Θα πάμε στην Αθήνα τον Μάιο.", "Andremo ad Atene a maggio."],
            ["Θέλω να πάω στο σούπερ μάρκετ.", "Voglio andare al supermercato."], ["Μπορείς να πας μόνος σου;", "Puoi andare da solo?"]
          ])
        ],
        fills: [
          fill("Εγώ ___ χθες στο σινεμά.", "πήγα", ["πήγα", "πάω", "θα πάω", "πήγαν"], "«Χθες» = passato: πήγα."),
          fill("Αύριο εγώ ___ στη δουλειά.", "θα πάω", ["θα πάω", "πήγα", "πήγε", "πήγαμε"], "Futuro con θα: θα πάω."),
          fill("Εσείς ___ στην Ελλάδα πέρσι;", "πήγατε", ["πήγατε", "πήγαμε", "πάτε", "θα πάτε"], "Passato di «voi»: πήγατε."),
          fill("Μπορώ να ___ στην τουαλέτα;", "πάω", ["πάω", "πας", "πάει", "πάμε"], "Dopo «μπορώ να» la persona resta la stessa: να πάω."),
          fill("Εμείς ___ στη θάλασσα το Σάββατο που πέρασε.", "πήγαμε", ["πήγαμε", "πήγατε", "θα πάμε", "πάμε"], "«Που πέρασε» = passato: πήγαμε.")
        ]
      },
      // ───────────── FARE ─────────────
      {
        id: "k3", part: "Fare · κάνω", title: "Il presente di κάνω",
        intro: [
          "«Κάνω» significa «faccio», ma in greco copre molto più dell'italiano: κάνω ντους (faccio la doccia), κάνω βόλτα (faccio una passeggiata), κάνει κρύο (fa freddo). Molte espressioni si imparano come blocchi.",
          "«Τι κάνεις;» è il saluto più frequente: vuol dire sia «Che fai?» sia «Come stai?». Si risponde di solito Καλά, εσύ; («Bene, e tu?»)."
        ],
        blocks: [
          conj("κάνω · presente", six(
            ["κάνω", "κάνεις", "κάνει", "κάνουμε", "κάνετε", "κάνουν"],
            ["kàno", "kànis", "kàni", "kànume", "kànete", "kànun"],
            ["io faccio", "tu fai", "lui / lei fa", "noi facciamo", "voi fate / Lei fa", "loro fanno"])),
          vocab("Espressioni con κάνω", [
            ["κάνω ντους", "kàno dus", "faccio la doccia"], ["κάνω μπάνιο", "kàno bànio", "faccio il bagno"], ["κάνω βόλτα", "kàno vòlta", "faccio una passeggiata"],
            ["κάνω ψώνια", "kàno psònia", "faccio la spesa / shopping"], ["κάνω διακοπές", "kàno diakopès", "vado in vacanza"], ["κάνω γυμναστική", "kàno jimnastikì", "faccio ginnastica"],
            ["κάνω λάθος", "kàno làthos", "sbaglio"], ["κάνω ερώτηση", "kàno eròtisi", "faccio una domanda"]
          ]),
          ex("Frasi d'esempio", [
            ["Τι κάνεις;", "Come stai? / Che fai?"], ["Τι κάνετε;", "Come state? / Che fate?"], ["Κάνω ντους κάθε πρωί.", "Faccio la doccia ogni mattina."],
            ["Κάνουμε βόλτα στο κέντρο.", "Facciamo una passeggiata in centro."], ["Η Άννα κάνει γυμναστική τρεις φορές την εβδομάδα.", "Anna fa ginnastica tre volte a settimana."],
            ["Κάνω λάθος;", "Sbaglio?"], ["Κάνει κρύο σήμερα.", "Oggi fa freddo."], ["Πόσο κάνει αυτό;", "Quanto costa questo?"]
          ]),
          note("Il tempo atmosferico si dice con «κάνει»: Κάνει κρύο (fa freddo), Κάνει ζέστη (fa caldo). Per chiedere un prezzo si usa «Πόσο κάνει;», cioè «Quanto fa?».", "tip")
        ],
        fills: [
          fill("Εγώ ___ ντους το πρωί.", "κάνω", ["κάνω", "κάνεις", "κάνει", "κάνουν"], "Con «εγώ» → κάνω."),
          fill("Εσείς τι ___;", "κάνετε", ["κάνετε", "κάνεις", "κάνουμε", "κάνω"], "Con «εσείς» → κάνετε."),
          fill("___ κρύο σήμερα.", "Κάνει", ["Κάνει", "Κάνω", "Κάνεις", "Κάνουν"], "Il tempo si dice alla terza persona singolare: Κάνει κρύο."),
          fill("Εμείς ___ ψώνια το Σάββατο.", "κάνουμε", ["κάνουμε", "κάνουν", "κάνετε", "κάνω"], "Con «εμείς» → κάνουμε."),
          fill("Τι ___; – Καλά, ευχαριστώ. (a un amico)", "κάνεις", ["κάνεις", "κάνω", "κάνει", "κάνουμε"], "A un amico (εσύ) → Τι κάνεις;")
        ]
      },
      {
        id: "k4", part: "Fare · κάνω", title: "κάνω: passato e futuro",
        intro: [
          "Il passato di «κάνω» è «έκανα» (ho fatto). Qui il verbo prende una «ε» davanti (έ-κανα), l'aumento: lo vedrai spesso nei passati greci. Alla prima persona plurale l'accento si sposta e la «ε» sparisce: κάναμε.",
          "Il futuro è semplicemente «θα κάνω»: la forma non cambia rispetto al presente, si aggiunge solo «θα»."
        ],
        blocks: [
          conj("κάνω · passato (aoristo)", six(
            ["έκανα", "έκανες", "έκανε", "κάναμε", "κάνατε", "έκαναν"],
            ["èkana", "èkanes", "èkane", "kàname", "kànate", "èkanan"],
            ["io ho fatto", "tu hai fatto", "lui / lei ha fatto", "noi abbiamo fatto", "voi avete fatto", "loro hanno fatto"])),
          conj("κάνω · futuro", six(
            ["θα κάνω", "θα κάνεις", "θα κάνει", "θα κάνουμε", "θα κάνετε", "θα κάνουν"],
            ["tha kàno", "tha kànis", "tha kàni", "tha kànume", "tha kànete", "tha kànun"],
            ["io farò", "tu farai", "lui / lei farà", "noi faremo", "voi farete", "loro faranno"])),
          ex("Frasi d'esempio", [
            ["Τι έκανες χθες;", "Che cosa hai fatto ieri?"], ["Έκανα ψώνια και μετά πήγα σπίτι.", "Ho fatto la spesa e poi sono andato a casa."],
            ["Κάναμε διακοπές στην Κρήτη.", "Abbiamo fatto vacanza a Creta."], ["Τι θα κάνεις το Σαββατοκύριακο;", "Che cosa farai nel fine settimana?"],
            ["Θα κάνω μάθημα ελληνικών.", "Farò lezione di greco."], ["Έκανε ζέστη όλο το καλοκαίρι.", "Ha fatto caldo tutta l'estate."], ["Θα κάνουμε ένα πάρτι.", "Faremo una festa."]
          ])
        ],
        fills: [
          fill("Τι ___ χθες (εσύ);", "έκανες", ["έκανες", "κάνεις", "θα κάνεις", "έκανα"], "«Χθες» + εσύ → έκανες."),
          fill("Αύριο ___ βόλτα (εμείς).", "θα κάνουμε", ["θα κάνουμε", "κάναμε", "έκανα", "έκαναν"], "Futuro di «noi»: θα κάνουμε."),
          fill("Πέρσι ___ διακοπές στην Ιταλία (εγώ).", "έκανα", ["έκανα", "κάνω", "θα κάνω", "έκανε"], "«Πέρσι» = passato: έκανα."),
          fill("Η Μαρία ___ γυμναστική χθες.", "έκανε", ["έκανε", "κάνει", "θα κάνει", "έκαναν"], "Passato di «lei»: έκανε.")
        ]
      },
      // ───────────── DIRE ─────────────
      {
        id: "k5", part: "Dire · λέω", title: "Il presente di λέω e «chiamarsi»",
        intro: [
          "«Λέω» significa «dico». È molto regolare nel presente. Serve per riferire (Λέω ότι… = «Dico che…») e per presentarsi.",
          "In greco ci si presenta con «Με λένε…», che letteralmente è «mi dicono…»: Πώς σε λένε; = «Come ti chiami?», Με λένε Μάρκο = «Mi chiamo Marco». È un uso della terza persona plurale del verbo λέω."
        ],
        blocks: [
          conj("λέω · presente", six(
            ["λέω", "λες", "λέει", "λέμε", "λέτε", "λένε"],
            ["lèo", "les", "lèi", "lème", "lète", "lène"],
            ["io dico", "tu dici", "lui / lei dice", "noi diciamo", "voi dite / Lei dice", "loro dicono"])),
          vocab("Espressioni utili con λέω", [
            ["Πώς σε λένε;", "pos se lène", "Come ti chiami?"], ["Πώς σας λένε;", "pos sas lène", "Come si chiama (Lei)?"], ["Με λένε …", "me lène", "Mi chiamo …"],
            ["Πώς το λένε στα ελληνικά;", "pos to lène sta ellinikà", "Come si dice in greco?"], ["Τι λες;", "ti les", "Che dici? / Come?"],
            ["Τα λέμε!", "ta lème", "Ci sentiamo! / A presto!"]
          ]),
          ex("Frasi d'esempio", [
            ["Πώς σε λένε;", "Come ti chiami?"], ["Με λένε Μάρκο.", "Mi chiamo Marco."], ["Τι λες;", "Che ne dici? / Che cosa dici?"], ["Λέω ότι έχεις δίκιο.", "Dico che hai ragione."],
            ["Λέτε αλήθεια;", "Dite la verità?"], ["Η Ελένη λέει πάντα την αλήθεια.", "Eleni dice sempre la verità."], ["Τα λέμε αύριο!", "Ci sentiamo domani!"]
          ])
        ],
        fills: [
          fill("Εγώ ___ ότι έχεις δίκιο.", "λέω", ["λέω", "λες", "λέει", "λένε"], "Con «εγώ» → λέω."),
          fill("Εσύ τι ___;", "λες", ["λες", "λέω", "λέει", "λέτε"], "Con «εσύ» → λες."),
          fill("Πώς σε ___;", "λένε", ["λένε", "λες", "λέω", "λέμε"], "«Πώς σε λένε;» è un'espressione fissa."),
          fill("Η Μαρία ___ πάντα αλήθεια.", "λέει", ["λέει", "λες", "λέμε", "λέτε"], "Soggetto singolare (lei) → λέει."),
          fill("Τα ___ αύριο!", "λέμε", ["λέμε", "λέω", "λες", "λέτε"], "«Τα λέμε!» = «Ci sentiamo!», prima persona plurale.")
        ]
      },
      {
        id: "k6", part: "Dire · λέω", title: "λέω: passato, futuro e imperativo",
        intro: [
          "Il passato di «λέω» è «είπα» (ho detto) e il futuro è «θα πω» (dirò): il verbo cambia radice, quindi va imparato a memoria. Nota che le forme del futuro sono le stesse di «να πω, να πεις…».",
          "L'imperativo, molto usato, è «πες» (dì) e «πείτε» (dite, o «mi dica» in forma cortese): Πες μου! = «Dimmi!»."
        ],
        blocks: [
          conj("λέω · passato (aoristo)", six(
            ["είπα", "είπες", "είπε", "είπαμε", "είπατε", "είπαν"],
            ["ìpa", "ìpes", "ìpe", "ìpame", "ìpate", "ìpan"],
            ["io ho detto", "tu hai detto", "lui / lei ha detto", "noi abbiamo detto", "voi avete detto", "loro hanno detto"])),
          conj("λέω · futuro", six(
            ["θα πω", "θα πεις", "θα πει", "θα πούμε", "θα πείτε", "θα πουν"],
            ["tha po", "tha pis", "tha pi", "tha pùme", "tha pìte", "tha pun"],
            ["io dirò", "tu dirai", "lui / lei dirà", "noi diremo", "voi direte", "loro diranno"])),
          vocab("Imperativo", [
            ["Πες μου!", "pes mu", "Dimmi!"], ["Πείτε μου, παρακαλώ.", "pìte mu parakalò", "Mi dica, per favore."], ["Πες το ξανά!", "pes to ksanà", "Ridillo! / Dillo ancora!"], ["Πείτε το ξανά!", "pìte to ksanà", "Ripetetelo! / Ditelo ancora!"]
          ]),
          ex("Frasi d'esempio", [
            ["Τι είπες;", "Che cosa hai detto?"], ["Δεν είπα τίποτα.", "Non ho detto niente."], ["Η δασκάλα είπε ότι έχουμε τεστ.", "L'insegnante ha detto che abbiamo un test."],
            ["Θα σου πω την αλήθεια.", "Ti dirò la verità."], ["Θα πούμε στους φίλους μας.", "Lo diremo ai nostri amici."], ["Πες μου τι θέλεις.", "Dimmi che cosa vuoi."]
          ])
        ],
        fills: [
          fill("Χθες η Μαρία ___ ότι δεν έρχεται.", "είπε", ["είπε", "λέει", "θα πει", "είπες"], "«Χθες» = passato; soggetto «lei» → είπε."),
          fill("Χθες δεν ___ τίποτα (εγώ).", "είπα", ["είπα", "λέω", "θα πω", "είπε"], "Passato di «io»: είπα."),
          fill("Αύριο ___ την αλήθεια (εγώ).", "θα πω", ["θα πω", "είπα", "λέω", "θα πεις"], "Futuro di «io»: θα πω."),
          fill("___ μου τι θέλεις!", "Πες", ["Πες", "Λες", "Είπες", "Λέω"], "Imperativo: Πες μου!"),
          fill("Εμείς ___ στη Μαρία χθες.", "είπαμε", ["είπαμε", "είπατε", "θα πούμε", "λέμε"], "Passato di «noi»: είπαμε.")
        ]
      },
      // ───────────── VEDERE ─────────────
      {
        id: "k7", part: "Vedere · βλέπω", title: "Il presente di βλέπω",
        intro: [
          "«Βλέπω» significa «vedo» ma anche «guardo» quando si parla di tv e film: βλέπω τηλεόραση, βλέπω ταινία. Si usa anche per «incontrare» una persona: Βλέπω τους φίλους μου = «Vedo (incontro) i miei amici».",
          "Per guardare con attenzione un oggetto si usa «κοιτάζω» (Κοίτα! = «Guarda!»). Per ascoltare si usa «ακούω»."
        ],
        blocks: [
          conj("βλέπω · presente", six(
            ["βλέπω", "βλέπεις", "βλέπει", "βλέπουμε", "βλέπετε", "βλέπουν"],
            ["vlèpo", "vlèpis", "vlèpi", "vlèpume", "vlèpete", "vlèpun"],
            ["io vedo", "tu vedi", "lui / lei vede", "noi vediamo", "voi vedete", "loro vedono"])),
          vocab("Vedere, guardare, ascoltare", [
            ["βλέπω", "vlèpo", "vedo / guardo (tv, film)"], ["κοιτάζω", "kitàzo", "guardo (con attenzione)"], ["ακούω", "akùo", "sento / ascolto"],
            ["την τηλεόραση", "tin tileòrasi", "la televisione"], ["μια ταινία", "mia tenìa", "un film"]
          ]),
          ex("Frasi d'esempio", [
            ["Βλέπω τηλεόραση το βράδυ.", "Guardo la televisione la sera."], ["Βλέπεις αυτό το σπίτι;", "Vedi questa casa?"], ["Βλέπουμε μια ταινία απόψε.", "Guardiamo un film stasera."],
            ["Δεν βλέπω καλά χωρίς γυαλιά.", "Non vedo bene senza occhiali."], ["Βλέπω τους φίλους μου κάθε Σάββατο.", "Vedo i miei amici ogni sabato."], ["Κοίτα! Ένα δελφίνι!", "Guarda! Un delfino!"],
            ["Ακούω μουσική στο δρόμο.", "Ascolto musica per strada."]
          ])
        ],
        fills: [
          fill("Εγώ ___ τηλεόραση το βράδυ.", "βλέπω", ["βλέπω", "βλέπεις", "βλέπει", "βλέπουν"], "Con «εγώ» → βλέπω."),
          fill("Εσύ ___ καλά;", "βλέπεις", ["βλέπεις", "βλέπω", "βλέπετε", "βλέπουμε"], "Con «εσύ» → βλέπεις."),
          fill("Οι φίλοι μου ___ μια ταινία.", "βλέπουν", ["βλέπουν", "βλέπει", "βλέπετε", "βλέπεις"], "Soggetto plurale (loro) → βλέπουν."),
          fill("Ο Γιώργος ___ τη Μαρία κάθε μέρα.", "βλέπει", ["βλέπει", "βλέπω", "βλέπουμε", "βλέπουν"], "Soggetto singolare → βλέπει.")
        ]
      },
      {
        id: "k8", part: "Vedere · βλέπω", title: "βλέπω: passato e futuro",
        intro: [
          "Il passato di «βλέπω» è «είδα» (ho visto) e il futuro è «θα δω» (vedrò). Come «λέω», il verbo cambia radice: βλεπ- diventa δ-.",
          "Esiste anche l'imperativo «δες» (guarda) e «δείτε» (guardate). «Θα δούμε» («Vedremo») è una frase fatta che si sente continuamente."
        ],
        blocks: [
          conj("βλέπω · passato (aoristo)", six(
            ["είδα", "είδες", "είδε", "είδαμε", "είδατε", "είδαν"],
            ["ìda", "ìdes", "ìde", "ìdame", "ìdate", "ìdan"],
            ["io ho visto", "tu hai visto", "lui / lei ha visto", "noi abbiamo visto", "voi avete visto", "loro hanno visto"])),
          conj("βλέπω · futuro", six(
            ["θα δω", "θα δεις", "θα δει", "θα δούμε", "θα δείτε", "θα δουν"],
            ["tha do", "tha dis", "tha di", "tha dùme", "tha dìte", "tha dun"],
            ["io vedrò", "tu vedrai", "lui / lei vedrà", "noi vedremo", "voi vedrete", "loro vedranno"])),
          ex("Frasi d'esempio", [
            ["Χθες είδα μια ωραία ταινία.", "Ieri ho visto un bel film."], ["Είδες τη Μαρία;", "Hai visto Maria?"], ["Δεν είδαμε τίποτα.", "Non abbiamo visto niente."],
            ["Θα σε δω αύριο.", "Ti vedrò domani."], ["Θα δούμε τον αγώνα στο καφενείο.", "Vedremo la partita al bar."], ["Δες αυτό!", "Guarda questo!"], ["Θα δούμε.", "Vedremo."]
          ])
        ],
        fills: [
          fill("Χθες ___ τη Μαρία (εγώ).", "είδα", ["είδα", "βλέπω", "θα δω", "είδε"], "«Χθες» + io → είδα."),
          fill("___ το νέο σπίτι; (εσύ, hai visto)", "Είδες", ["Είδες", "Βλέπω", "Θα δεις", "Είδα"], "Passato di «tu»: είδες."),
          fill("Αύριο θα ___ τους φίλους μου (εγώ).", "δω", ["δω", "δεις", "δει", "δούμε"], "Dopo «θα», con «io»: δω."),
          fill("Εμείς ___ μια ταινία χθες.", "είδαμε", ["είδαμε", "είδατε", "θα δούμε", "βλέπουμε"], "Passato di «noi»: είδαμε.")
        ]
      },
      // ───────────── MANGIARE ─────────────
      {
        id: "k9", part: "Mangiare · τρώω", title: "Il presente di τρώω e i pasti",
        intro: [
          "«Τρώω» significa «mangio». Si pronuncia «tròo» con due vocali distinte e si coniuga in modo regolare, ma con poche lettere: τρως, τρώει, τρώμε.",
          "I pasti si usano senza preposizione: τρώω πρωινό (faccio colazione), τρώω μεσημεριανό (pranzo), τρώω βραδινό (ceno). Per «ho fame» si dice «πεινάω» oppure «έχω πείνα»."
        ],
        blocks: [
          conj("τρώω · presente", six(
            ["τρώω", "τρως", "τρώει", "τρώμε", "τρώτε", "τρώνε"],
            ["tròo", "tros", "tròi", "tròme", "tròte", "tròne"],
            ["io mangio", "tu mangi", "lui / lei mangia", "noi mangiamo", "voi mangiate", "loro mangiano"])),
          vocab("I pasti", [
            ["το πρωινό", "to proinò", "la colazione"], ["το μεσημεριανό", "to mesimerianò", "il pranzo"], ["το βραδινό", "to vradinò", "la cena"],
            ["το φαγητό", "to fajitò", "il cibo"], ["πεινάω", "pinào", "ho fame"], ["Καλή όρεξη!", "kalì òreksi", "Buon appetito!"]
          ]),
          ex("Frasi d'esempio", [
            ["Τρώω πρωινό στις οκτώ.", "Faccio colazione alle otto."], ["Τι τρως;", "Che cosa mangi?"], ["Η οικογένειά μου τρώει μεσημεριανό στη μία.", "La mia famiglia pranza all'una."],
            ["Τρώμε βραδινό αργά.", "Ceniamo tardi."], ["Τρώτε κρέας;", "Mangiate carne?"], ["Δεν τρώω ψάρι.", "Non mangio pesce."], ["Τα παιδιά τρώνε παγωτό.", "I bambini mangiano il gelato."]
          ])
        ],
        fills: [
          fill("Εγώ ___ πρωινό στις οκτώ.", "τρώω", ["τρώω", "τρως", "τρώει", "τρώνε"], "Con «εγώ» → τρώω."),
          fill("Εσύ ___ κρέας;", "τρως", ["τρως", "τρώω", "τρώτε", "τρώμε"], "Con «εσύ» → τρως."),
          fill("Εμείς ___ βραδινό αργά.", "τρώμε", ["τρώμε", "τρώτε", "τρώω", "τρώνε"], "Con «εμείς» → τρώμε."),
          fill("Τα παιδιά ___ παγωτό.", "τρώνε", ["τρώνε", "τρώει", "τρως", "τρώμε"], "Soggetto plurale (loro) → τρώνε.")
        ]
      },
      {
        id: "k10", part: "Mangiare · τρώω", title: "τρώω: passato e futuro",
        intro: [
          "Il passato di «τρώω» è «έφαγα» (ho mangiato) e il futuro è «θα φάω» (mangerò): il verbo cambia radice (τρώ- diventa φαγ- / φα-).",
          "Alla prima e seconda persona plurale l'accento si sposta e l'«ε» iniziale cade: φάγαμε, φάγατε. Lo stesso succede con «κάναμε» e «κάνατε»."
        ],
        blocks: [
          conj("τρώω · passato (aoristo)", six(
            ["έφαγα", "έφαγες", "έφαγε", "φάγαμε", "φάγατε", "έφαγαν"],
            ["èfaga", "èfajes", "èfaje", "fàgame", "fàgate", "èfagan"],
            ["io ho mangiato", "tu hai mangiato", "lui / lei ha mangiato", "noi abbiamo mangiato", "voi avete mangiato", "loro hanno mangiato"])),
          conj("τρώω · futuro", six(
            ["θα φάω", "θα φας", "θα φάει", "θα φάμε", "θα φάτε", "θα φάνε"],
            ["tha fào", "tha fas", "tha fài", "tha fàme", "tha fàte", "tha fàne"],
            ["io mangerò", "tu mangerai", "lui / lei mangerà", "noi mangeremo", "voi mangerete", "loro mangeranno"])),
          ex("Frasi d'esempio", [
            ["Τι έφαγες χθες;", "Che cosa hai mangiato ieri?"], ["Έφαγα ψάρι και σαλάτα.", "Ho mangiato pesce e insalata."], ["Φάγαμε σε μια ταβέρνα.", "Abbiamo mangiato in una taverna."],
            ["Τι θα φάμε απόψε;", "Che cosa mangeremo stasera?"], ["Θα φάω μια πίτσα.", "Mangerò una pizza."], ["Θέλεις να φας κάτι;", "Vuoi mangiare qualcosa?"], ["Δεν έφαγα ακόμα.", "Non ho ancora mangiato."]
          ])
        ],
        fills: [
          fill("Χθες ___ ψάρι (εγώ).", "έφαγα", ["έφαγα", "τρώω", "θα φάω", "έφαγε"], "«Χθες» + io → έφαγα."),
          fill("Απόψε ___ πίτσα (εμείς).", "θα φάμε", ["θα φάμε", "φάγαμε", "έφαγα", "έφαγαν"], "Futuro di «noi»: θα φάμε."),
          fill("Θέλεις να ___ κάτι;", "φας", ["φας", "τρως", "έφαγες", "φάτε"], "Dopo «να» con «tu»: φας."),
          fill("Τι ___ χθες (εσύ);", "έφαγες", ["έφαγες", "έφαγα", "θα φας", "τρως"], "Passato di «tu»: έφαγες.")
        ]
      },
      // ───────────── BERE ─────────────
      {
        id: "k11", part: "Bere · πίνω", title: "Il presente di πίνω e le bevande",
        intro: [
          "«Πίνω» significa «bevo» ed è un verbo regolare nel presente. Con le bevande si usa senza articolo: Πίνω καφέ, Πίνω νερό.",
          "Attenzione ai nomi maschili in -ς: dopo il verbo perdono la «ς» (accusativo). Così «ο καφές» diventa πίνω καφέ e «ο χυμός» diventa πίνω χυμό. Nei nomi neutri e femminili non cambia nulla."
        ],
        blocks: [
          conj("πίνω · presente", six(
            ["πίνω", "πίνεις", "πίνει", "πίνουμε", "πίνετε", "πίνουν"],
            ["pìno", "pìnis", "pìni", "pìnume", "pìnete", "pìnun"],
            ["io bevo", "tu bevi", "lui / lei beve", "noi beviamo", "voi bevete", "loro bevono"])),
          vocab("Bevande", [
            ["το νερό", "to nerò", "l'acqua"], ["ο καφές", "o kafès", "il caffè"], ["ο χυμός", "o himòs", "il succo"],
            ["το κρασί", "to krasì", "il vino"], ["η μπύρα", "i bìra", "la birra"], ["το τσάι", "to tsài", "il tè"], ["το γάλα", "to gàla", "il latte"]
          ]),
          ex("Frasi d'esempio", [
            ["Πίνω καφέ το πρωί.", "Bevo il caffè la mattina."], ["Τι πίνεις;", "Che cosa bevi?"], ["Πίνουμε ένα ποτήρι κρασί.", "Beviamo un bicchiere di vino."],
            ["Δεν πίνω αλκοόλ.", "Non bevo alcol."], ["Η Μαρία πίνει πολύ νερό.", "Maria beve molta acqua."], ["Πίνετε τσάι ή καφέ;", "Bevete tè o caffè?"],
            ["Τα παιδιά πίνουν χυμό.", "I bambini bevono il succo."], ["Γεια μας!", "Salute!"]
          ])
        ],
        fills: [
          fill("Εγώ ___ νερό.", "πίνω", ["πίνω", "πίνεις", "πίνει", "πίνουν"], "Con «εγώ» → πίνω."),
          fill("Εσύ τι ___;", "πίνεις", ["πίνεις", "πίνω", "πίνετε", "πίνουμε"], "Con «εσύ» → πίνεις."),
          fill("Εμείς ___ κρασί.", "πίνουμε", ["πίνουμε", "πίνουν", "πίνετε", "πίνω"], "Con «εμείς» → πίνουμε."),
          fill("Τα παιδιά ___ χυμό.", "πίνουν", ["πίνουν", "πίνει", "πίνεις", "πίνουμε"], "Soggetto plurale (loro) → πίνουν.")
        ]
      },
      {
        id: "k12", part: "Bere · πίνω", title: "πίνω: passato, futuro e ordinare",
        intro: [
          "Il passato di «πίνω» è «ήπια» (ho bevuto) e il futuro è «θα πιω» (berrò). La radice diventa πι- e nelle forme del futuro la pronuncia è «pyo, pyis»: la «ι» e la vocale seguente si leggono quasi insieme.",
          "Al bar e al ristorante ti serviranno le formule per ordinare. Il cameriere chiede Τι θα πάρετε; («Cosa prenderete?») o Τι θα πιείτε; («Cosa berrete?»)."
        ],
        blocks: [
          conj("πίνω · passato (aoristo)", six(
            ["ήπια", "ήπιες", "ήπιε", "ήπιαμε", "ήπιατε", "ήπιαν"],
            ["ìpya", "ìpyes", "ìpye", "ìpyame", "ìpyate", "ìpyan"],
            ["io ho bevuto", "tu hai bevuto", "lui / lei ha bevuto", "noi abbiamo bevuto", "voi avete bevuto", "loro hanno bevuto"])),
          conj("πίνω · futuro", six(
            ["θα πιω", "θα πιεις", "θα πιει", "θα πιούμε", "θα πιείτε", "θα πιουν"],
            ["tha pyo", "tha pyis", "tha pyi", "tha pyùme", "tha pyìte", "tha pyun"],
            ["io berrò", "tu berrai", "lui / lei berrà", "noi berremo", "voi berrete", "loro berranno"])),
          vocab("Ordinare al bar", [
            ["Θα ήθελα …", "tha ìthela", "Vorrei …"], ["Ένα νερό, παρακαλώ.", "ena nerò parakalò", "Un'acqua, per favore."], ["Τι θα πάρετε;", "ti tha pàrete", "Cosa prenderete?"],
            ["Τι θα πιείτε;", "ti tha pyìte", "Cosa berrete?"], ["Τον λογαριασμό, παρακαλώ.", "ton logariazmò parakalò", "Il conto, per favore."]
          ]),
          ex("Frasi d'esempio", [
            ["Χθες ήπια πολύ καφέ.", "Ieri ho bevuto molto caffè."], ["Τι ήπιες;", "Che cosa hai bevuto?"], ["Ήπιαμε ένα κρασί στο μπαρ.", "Abbiamo bevuto un vino al bar."],
            ["Θα πιω έναν καφέ.", "Prenderò un caffè."], ["Τι θα πιείτε;", "Che cosa berrete?"], ["Θα πιούμε κάτι μαζί;", "Beviamo qualcosa insieme?"], ["Δεν ήπια νερό σήμερα.", "Oggi non ho bevuto acqua."]
          ])
        ],
        fills: [
          fill("Χθες ___ πολύ νερό (εγώ).", "ήπια", ["ήπια", "πίνω", "θα πιω", "ήπιε"], "«Χθες» + io → ήπια."),
          fill("Αύριο ___ έναν καφέ μαζί (εμείς).", "θα πιούμε", ["θα πιούμε", "ήπιαμε", "ήπια", "ήπιαν"], "Futuro di «noi»: θα πιούμε."),
          fill("Τι θα ___ (εσείς);", "πιείτε", ["πιείτε", "πιούμε", "πιω", "πιεις"], "Futuro di «voi»: θα πιείτε."),
          fill("Εμείς ___ ένα κρασί χθες.", "ήπιαμε", ["ήπιαμε", "ήπιατε", "θα πιούμε", "πίνουμε"], "Passato di «noi»: ήπιαμε.")
        ]
      },
      // ───────────── VENIRE ─────────────
      {
        id: "k13", part: "Venire · έρχομαι", title: "Il presente di έρχομαι",
        intro: [
          "«Έρχομαι» significa «vengo». Ha una forma particolare: finisce in -ομαι come «χρειάζομαι», ma ha un significato attivo. Questi verbi si chiamano «passivi» o «deponenti» e li coniugherai con le desinenze -ομαι, -εσαι, -εται, -όμαστε, -εστε, -ονται.",
          "Attenzione alla differenza con «πάω»: «πάω» indica l'andare verso un posto lontano da chi parla (Πάω στη δουλειά), mentre «έρχομαι» indica il venire verso chi parla o verso il luogo in cui si trova (Έρχομαι σε πέντε λεπτά = «Arrivo tra cinque minuti»)."
        ],
        blocks: [
          conj("έρχομαι · presente", six(
            ["έρχομαι", "έρχεσαι", "έρχεται", "ερχόμαστε", "έρχεστε", "έρχονται"],
            ["èrhome", "èrhese", "èrhete", "erhòmaste", "èrheste", "èrhonde"],
            ["io vengo", "tu vieni", "lui / lei viene", "noi veniamo", "voi venite", "loro vengono"])),
          vocab("Muoversi: parole utili", [
            ["Έλα!", "èla", "Vieni!"], ["Ελάτε!", "elàte", "Venite!"], ["φεύγω", "fèvgo", "parto / vado via"], ["φτάνω", "ftàno", "arrivo"], ["γυρίζω", "jirìzo", "torno"]
          ]),
          ex("Frasi d'esempio", [
            ["Έρχομαι!", "Arrivo!"], ["Έρχεσαι στο πάρτι;", "Vieni alla festa?"], ["Η Μαρία έρχεται σε πέντε λεπτά.", "Maria arriva tra cinque minuti."],
            ["Ερχόμαστε από το σπίτι της Ελένης.", "Veniamo da casa di Eleni."], ["Έρχεστε το Σάββατο;", "Venite sabato?"], ["Πότε έρχεται το λεωφορείο;", "Quando arriva l'autobus?"],
            ["Οι γονείς μου έρχονται αύριο.", "I miei genitori vengono domani."], ["Έλα εδώ!", "Vieni qui!"], ["Ελάτε μέσα!", "Entrate!"]
          ])
        ],
        fills: [
          fill("Εγώ ___ σε πέντε λεπτά.", "έρχομαι", ["έρχομαι", "έρχεσαι", "έρχεται", "έρχονται"], "Con «εγώ» → έρχομαι."),
          fill("Εσύ ___ στο πάρτι;", "έρχεσαι", ["έρχεσαι", "έρχομαι", "έρχεστε", "έρχεται"], "Con «εσύ» → έρχεσαι."),
          fill("Ο Νίκος ___ αύριο.", "έρχεται", ["έρχεται", "έρχεσαι", "έρχονται", "έρχομαι"], "Soggetto singolare (lui) → έρχεται."),
          fill("Εμείς ___ από τη δουλειά.", "ερχόμαστε", ["ερχόμαστε", "έρχεστε", "έρχονται", "έρχομαι"], "Con «εμείς» → ερχόμαστε."),
          fill("Οι φίλοι μου ___ το Σάββατο.", "έρχονται", ["έρχονται", "έρχεται", "έρχεστε", "ερχόμαστε"], "Soggetto plurale (loro) → έρχονται.")
        ]
      },
      {
        id: "k14", part: "Venire · έρχομαι", title: "έρχομαι: passato e futuro",
        intro: [
          "Il passato di «έρχομαι» è «ήρθα» (sono venuto/a) e il futuro è «θα έρθω» (verrò). Nel passato il verbo non ha più la forma passiva: usa desinenze normali (-α, -ες, -ε, -αμε, -ατε, -αν).",
          "Anche qui «να έρθω» si usa dopo i verbi modali: Θέλω να έρθω μαζί σου = «Voglio venire con te»."
        ],
        blocks: [
          conj("έρχομαι · passato (aoristo)", six(
            ["ήρθα", "ήρθες", "ήρθε", "ήρθαμε", "ήρθατε", "ήρθαν"],
            ["ìrtha", "ìrthes", "ìrthe", "ìrthame", "ìrthate", "ìrthan"],
            ["io sono venuto/a", "tu sei venuto/a", "lui / lei è venuto/a", "noi siamo venuti", "voi siete venuti", "loro sono venuti"])),
          conj("έρχομαι · futuro", six(
            ["θα έρθω", "θα έρθεις", "θα έρθει", "θα έρθουμε", "θα έρθετε", "θα έρθουν"],
            ["tha èrtho", "tha èrthis", "tha èrthi", "tha èrthume", "tha èrthete", "tha èrthun"],
            ["io verrò", "tu verrai", "lui / lei verrà", "noi verremo", "voi verrete", "loro verranno"])),
          ex("Frasi d'esempio", [
            ["Ήρθα στην Ελλάδα το καλοκαίρι.", "Sono venuto in Grecia in estate."], ["Πότε ήρθες;", "Quando sei venuto / arrivato?"], ["Η Μαρία δεν ήρθε χθες.", "Maria non è venuta ieri."],
            ["Θα έρθεις στο πάρτι;", "Verrai alla festa?"], ["Θα έρθουμε στις εννιά.", "Verremo alle nove."], ["Θέλω να έρθω μαζί σου.", "Voglio venire con te."],
            ["Μπορείτε να έρθετε νωρίς;", "Potete venire presto?"]
          ])
        ],
        fills: [
          fill("Χθες δεν ___ στη δουλειά (εγώ).", "ήρθα", ["ήρθα", "έρχομαι", "θα έρθω", "ήρθε"], "«Χθες» + io → ήρθα."),
          fill("Αύριο ___ στο πάρτι (εμείς).", "θα έρθουμε", ["θα έρθουμε", "ήρθαμε", "ήρθα", "ήρθαν"], "Futuro di «noi»: θα έρθουμε."),
          fill("Μπορώ να ___ μαζί σου;", "έρθω", ["έρθω", "έρθεις", "έρθει", "έρθουμε"], "Dopo «μπορώ να» la persona resta la stessa: να έρθω."),
          fill("Πότε ___ στην Ιταλία (εσύ);", "ήρθες", ["ήρθες", "ήρθα", "θα έρθεις", "ήρθατε"], "Passato di «tu»: ήρθες.")
        ]
      },
      // ───────────── RIPASSO ─────────────
      {
        id: "k15", part: "Ripasso", title: "Ripasso: sette verbi, tre tempi",
        intro: [
          "Una tabella con presente, passato e futuro (prima persona) dei sette verbi, poi due dialoghi per vederli in azione. Prova a leggere la tabella ad alta voce e a coprire la colonna in italiano."
        ],
        blocks: [
          vocab("I sette verbi: io · presente, passato, futuro", [
            ["πάω, πήγα, θα πάω", "pào, pìga, tha pào", "andare: vado, sono andato, andrò"],
            ["κάνω, έκανα, θα κάνω", "kàno, èkana, tha kàno", "fare: faccio, ho fatto, farò"],
            ["λέω, είπα, θα πω", "lèo, ìpa, tha po", "dire: dico, ho detto, dirò"],
            ["βλέπω, είδα, θα δω", "vlèpo, ìda, tha do", "vedere: vedo, ho visto, vedrò"],
            ["τρώω, έφαγα, θα φάω", "tròo, èfaga, tha fào", "mangiare: mangio, ho mangiato, mangerò"],
            ["πίνω, ήπια, θα πιω", "pìno, ìpya, tha pyo", "bere: bevo, ho bevuto, berrò"],
            ["έρχομαι, ήρθα, θα έρθω", "èrhome, ìrtha, tha èrtho", "venire: vengo, sono venuto, verrò"]
          ]),
          dlg("Una mattina qualunque", [
            ["Άννα", "Τι κάνεις; Πού πας;", "Come stai? Dove vai?"],
            ["Νίκος", "Καλά, ευχαριστώ. Πάω στη δουλειά.", "Bene, grazie. Vado al lavoro."],
            ["Άννα", "Έχεις ώρα για έναν καφέ;", "Hai tempo per un caffè?"],
            ["Νίκος", "Ναι, πάμε! Τι θα πιεις;", "Sì, andiamo! Che cosa prendi da bere?"],
            ["Άννα", "Θα πιω έναν καφέ και θα φάω ένα τοστ.", "Berrò un caffè e mangerò un toast."],
            ["Νίκος", "Χθες είδα τη Μαρία. Είπε ότι έρχεται το Σάββατο.", "Ieri ho visto Maria. Ha detto che viene sabato."],
            ["Άννα", "Ωραία! Τα λέμε το Σάββατο.", "Bene! Ci vediamo sabato."]
          ]),
          dlg("Al ristorante", [
            ["Σερβιτόρος", "Καλησπέρα! Τι θα πάρετε;", "Buonasera! Che cosa prenderete?"],
            ["Πελάτης", "Θα φάω ψάρι και σαλάτα.", "Mangerò pesce e insalata."],
            ["Σερβιτόρος", "Και τι θα πιείτε;", "E che cosa berrete?"],
            ["Πελάτης", "Ένα κρασί και νερό, παρακαλώ.", "Un vino e dell'acqua, per favore."],
            ["Σερβιτόρος", "Αμέσως! Καλή όρεξη!", "Subito! Buon appetito!"]
          ])
        ],
        fills: [
          fill("Χθες ___ μια ωραία ταινία (εγώ).", "είδα", ["είδα", "είπα", "έφαγα", "ήρθα"], "«Ταινία» → vedere; passato di io: είδα."),
          fill("Αύριο ___ στην Αθήνα (εμείς).", "θα πάμε", ["θα πάμε", "πήγαμε", "είδαμε", "ήπιαμε"], "Futuro di «andare» con noi: θα πάμε."),
          fill("Τι ___ το πρωί; – Καφέ. (εσύ)", "πίνεις", ["πίνεις", "τρως", "λες", "βλέπεις"], "Si risponde «caffè», quindi si beve: πίνεις."),
          fill("Εσείς ___ στο πάρτι το Σάββατο;", "έρχεστε", ["έρχεστε", "έρχεσαι", "έρχονται", "έρχομαι"], "Con «εσείς» → έρχεστε."),
          fill("Τι ___ αύριο; (εσύ, futuro)", "θα κάνεις", ["θα κάνεις", "έκανες", "κάνω", "θα κάνω"], "Futuro di «tu»: θα κάνεις.")
        ]
      }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
