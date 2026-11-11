// VERBI FONDAMENTALI — sezione «Il verbo avere (έχω)».
(function (root) {
  const D = root.VerbiData;
  const { conj, vocab, ex, note, dlg, fill } = D;
  const P6 = ["εγώ", "εσύ", "αυτός / αυτή / αυτό", "εμείς", "εσείς", "αυτοί / αυτές / αυτά"];

  D.sections.push({
    id: "echo", n: 2, title: "Το ρήμα «έχω»", it: "Il verbo avere",
    sub: "Possesso, sensazioni, «c'è», passato, futuro e passato prossimo",
    intro: "«Έχω» significa «avere», ma in greco fa più cose che in italiano: indica il possesso, molte sensazioni fisiche (έχω δίψα = «ho sete»), un «c'è» impersonale (έχει κόσμο = «c'è gente») e forma il passato prossimo (έχω φάει = «ho mangiato»). Sette lezioni.",
    lessons: [
      {
        id: "a1", part: "Presente", title: "Il presente di έχω",
        intro: [
          "«Έχω» è regolare: si coniuga come i verbi in -ω. La lettera «χ» si pronuncia come una «h» aspirata, un po' più forte (come il «ch» tedesco di «Buch»): έχω si legge «èho».",
          "Dopo «έχω» il complemento va all'accusativo: Έχω ένα αυτοκίνητο, Έχω μια αδελφή. Per i nomi neutri e femminili l'accusativo non cambia rispetto al nominativo, quindi all'inizio è facile."
        ],
        blocks: [
          conj("έχω · presente", [
            [P6[0], "έχω", "èho", "io ho"], [P6[1], "έχεις", "èhis", "tu hai"], [P6[2], "έχει", "èhi", "lui / lei ha"],
            [P6[3], "έχουμε", "èhume", "noi abbiamo"], [P6[4], "έχετε", "èhete", "voi avete / Lei ha"], [P6[5], "έχουν", "èhun", "loro hanno"]
          ]),
          note("Alla terza persona plurale si sente anche «έχουνε». Come con «είμαι», il pronome si omette: Έχω δύο παιδιά = «Ho due figli».", "tip"),
          ex("Frasi d'esempio", [
            ["Έχω ένα αυτοκίνητο.", "Ho una macchina."], ["Έχεις μια αδελφή;", "Hai una sorella?"], ["Η Μαρία έχει ένα σκύλο.", "Maria ha un cane."],
            ["Έχουμε δύο παιδιά.", "Abbiamo due figli."], ["Έχετε χρόνο;", "Avete tempo?"], ["Οι φίλοι μου έχουν ένα σπίτι στο νησί.", "I miei amici hanno una casa sull'isola."]
          ])
        ],
        fills: [
          fill("Εγώ ___ ένα βιβλίο.", "έχω", ["έχω", "έχεις", "έχει", "έχουμε"], "Con «εγώ» il verbo è έχω."),
          fill("Εσύ ___ αδέλφια;", "έχεις", ["έχω", "έχεις", "έχετε", "έχουν"], "Con «εσύ» → έχεις."),
          fill("Εμείς ___ ένα σπίτι.", "έχουμε", ["έχουμε", "έχουν", "έχω", "έχετε"], "Con «εμείς» → έχουμε."),
          fill("Οι φίλοι μου ___ ένα αυτοκίνητο.", "έχουν", ["έχουν", "έχει", "έχετε", "έχεις"], "Soggetto plurale (loro) → έχουν.")
        ]
      },
      {
        id: "a2", part: "Negazione e domande", title: "Negare e domandare con έχω",
        intro: [
          "Come per «είμαι», si nega con «δεν» davanti al verbo: Δεν έχω χρόνο. Le domande si fanno con l'intonazione e con il punto e virgola: Έχεις χρόνο;",
          "Le risposte brevi ripetono il verbo: Ναι, έχω. / Όχι, δεν έχω."
        ],
        blocks: [
          conj("δεν έχω · forma negativa", [
            [P6[0], "δεν έχω", "den èho", "io non ho"], [P6[1], "δεν έχεις", "den èhis", "tu non hai"], [P6[2], "δεν έχει", "den èhi", "lui / lei non ha"],
            [P6[3], "δεν έχουμε", "den èhume", "noi non abbiamo"], [P6[4], "δεν έχετε", "den èhete", "voi non avete"], [P6[5], "δεν έχουν", "den èhun", "loro non hanno"]
          ]),
          vocab("Domande utili con έχω", [
            ["Έχεις …;", "èhis", "Hai …?"], ["Τι έχεις;", "ti èhis", "Che cos'hai? / Che ti succede?"], ["Πόσα αδέλφια έχεις;", "pòsa adèlfia èhis", "Quanti fratelli hai?"],
            ["Έχετε κράτηση;", "èhete kràtisi", "Avete una prenotazione?"], ["Έχεις ώρα;", "èhis òra", "Hai (l')ora? / Hai tempo?"]
          ]),
          ex("Domande e risposte", [
            ["Έχεις αδέλφια;", "Hai fratelli o sorelle?"], ["Ναι, έχω έναν αδελφό και μια αδελφή.", "Sì, ho un fratello e una sorella."],
            ["Όχι, δεν έχω αδέλφια.", "No, non ho fratelli."], ["Δεν έχω χρόνο σήμερα.", "Oggi non ho tempo."],
            ["Τι έχεις; – Δεν έχω τίποτα.", "Che hai? – Niente."], ["Η Ελένη δεν έχει αυτοκίνητο.", "Eleni non ha la macchina."]
          ]),
          note("«Δεν έχω τίποτα» significa «Non ho niente». In greco la doppia negazione è normale: δεν + τίποτα / κανένας / ποτέ.", "tip")
        ],
        fills: [
          fill("Εγώ ___ έχω αυτοκίνητο.", "δεν", ["δεν", "όχι", "μην", "ναι"], "La negazione sta prima del verbo: δεν έχω."),
          fill("___ αδέλφια; – Ναι, έχω δύο.", "Έχεις", ["Έχεις", "Είσαι", "Έχω", "Έχουν"], "Domanda a «tu»: Έχεις …;"),
          fill("Τι ___; – Δεν έχω τίποτα. (tu)", "έχεις", ["έχεις", "έχω", "έχει", "έχετε"], "«Τι έχεις;» = Che hai?"),
          fill("Η Ελένη ___ έχει αυτοκίνητο.", "δεν", ["δεν", "μην", "όχι", "ούτε"], "Negazione verbale: δεν έχει.")
        ]
      },
      {
        id: "a3", part: "Usi", title: "Possesso, famiglia e sensazioni",
        intro: [
          "In greco molte sensazioni si dicono con «έχω» + nome, come in italiano «ho fame»: Έχω πείνα (ho fame), Έχω δίψα (ho sete), Έχω ύπνο (ho sonno). Ma alcune cose si dicono diversamente dall'italiano: l'età con «είμαι» (Είμαι τριάντα χρονών), e il caldo/freddo personale con «έχω ζέστη / κρύο».",
          "Impara queste espressioni come blocchi."
        ],
        blocks: [
          vocab("Έχω + sensazione o bisogno", [
            ["Έχω πείνα.", "èho pìna", "Ho fame."], ["Έχω δίψα.", "èho dìpsa", "Ho sete."], ["Έχω ύπνο.", "èho ìpno", "Ho sonno."], ["Έχω ζέστη.", "èho zèsti", "Ho caldo."],
            ["Έχω κρύο.", "èho krìo", "Ho freddo."], ["Έχω πονοκέφαλο.", "èho ponokèfalo", "Ho mal di testa."], ["Έχω ανάγκη.", "èho anànki", "Ho bisogno."], ["Έχω όρεξη.", "èho òreksi", "Ho voglia / appetito."]
          ]),
          vocab("Altre espressioni con έχω", [
            ["Έχω δίκιο.", "èho dìkio", "Ho ragione."], ["Έχω άδικο.", "èho àdiko", "Ho torto."], ["Έχω μάθημα.", "èho màthima", "Ho lezione."], ["Έχω ραντεβού.", "èho randevù", "Ho un appuntamento."],
            ["Έχω γενέθλια.", "èho yenèthlia", "È il mio compleanno."], ["Έχω δουλειά.", "èho dulià", "Ho da lavorare."], ["Έχω καιρό να σε δω.", "èho kerò na se dho", "È da tanto che non ti vedo."]
          ]),
          ex("Frasi d'esempio", [
            ["Έχω πείνα. Τρώμε;", "Ho fame. Mangiamo?"], ["Έχεις δίκιο!", "Hai ragione!"], ["Σήμερα έχω γενέθλια.", "Oggi è il mio compleanno."],
            ["Έχουμε ραντεβού στις πέντε.", "Abbiamo un appuntamento alle cinque."], ["Έχω πονοκέφαλο και δεν μπορώ να δουλέψω.", "Ho mal di testa e non riesco a lavorare."],
            ["Δεν έχω όρεξη.", "Non ho voglia."]
          ]),
          note("Quando sei molto stanco dirai «Είμαι κουρασμένος» (con είμαι), ma per fame e sete si usa «έχω»: Έχω πείνα, Έχω δίψα. Per l'età ricorda sempre: Είμαι … χρονών (non «έχω»).", "tip")
        ],
        fills: [
          fill("Έχω ___. Θέλω νερό.", "δίψα", ["δίψα", "πείνα", "ύπνο", "δίκιο"], "Vuole acqua → ha sete: δίψα."),
          fill("Έχεις ___! Έτσι είναι.", "δίκιο", ["δίκιο", "δίψα", "ζέστη", "πείνα"], "«Έχεις δίκιο» = hai ragione."),
          fill("Σήμερα έχω ___. Έχω μια τούρτα!", "γενέθλια", ["γενέθλια", "μάθημα", "πείνα", "ύπνο"], "La torta fa pensare al compleanno: γενέθλια."),
          fill("Πόσων χρονών ___; (tu, età)", "είσαι", ["είσαι", "έχεις", "είμαι", "έχει"], "L'età si chiede con είμαι: Πόσων χρονών είσαι;")
        ]
      },
      {
        id: "a4", part: "Usi", title: "«Έχει» impersonale e «έχω να»",
        intro: [
          "La terza persona singolare «έχει» si usa anche senza soggetto, come «c'è / ci sono», soprattutto parlando di tempo atmosferico, luoghi affollati o cose disponibili: Έχει ζέστη σήμερα (fa caldo), Έχει πολύ κόσμο (c'è molta gente).",
          "La costruzione «έχω να + verbo» dice che hai qualcosa da fare (Έχω πολλά να κάνω) oppure da quanto tempo non fai qualcosa (Έχω καιρό να σε δω). Per «c'è / ci sono» c'è anche il verbo υπάρχει: Υπάρχει ένα μουσείο εδώ."
        ],
        blocks: [
          vocab("«Έχει» = c'è / fa", [
            ["Έχει ζέστη.", "èhi zèsti", "Fa caldo."], ["Έχει κρύο.", "èhi krìo", "Fa freddo."], ["Έχει ήλιο.", "èhi ìlio", "C'è il sole."],
            ["Έχει σύννεφα.", "èhi sìnefa", "È nuvoloso."], ["Έχει κόσμο.", "èhi kòzmo", "C'è gente."], ["Έχει πολλή κίνηση.", "èhi polì kìnisi", "C'è molto traffico."]
          ]),
          ex("Frasi d'esempio", [
            ["Έχει πολύ κόσμο στην παραλία.", "C'è molta gente in spiaggia."], ["Έχει ένα καφενείο εδώ κοντά.", "C'è un bar qui vicino."], ["Τι έχει για φαγητό;", "Cosa c'è da mangiare?"],
            ["Σήμερα έχει ζέστη.", "Oggi fa caldo."], ["Έχω πολλά να κάνω.", "Ho molte cose da fare."], ["Δεν έχω τίποτα να φορέσω.", "Non ho niente da mettermi."],
            ["Έχω καιρό να σε δω.", "È da tanto che non ti vedo."]
          ]),
          note("«Έχει» impersonale è molto colloquiale. In frasi più formali o scritte si preferisce «υπάρχει / υπάρχουν» (c'è / ci sono): Υπάρχουν πολλά μουσεία στην Αθήνα.", "tip")
        ],
        fills: [
          fill("___ πολύ κόσμο στην παραλία. (c'è)", "Έχει", ["Έχει", "Έχω", "Έχουν", "Είναι"], "Il «c'è» impersonale: έχει."),
          fill("Σήμερα έχει ___. (fa freddo)", "κρύο", ["κρύο", "πείνα", "δίψα", "δίκιο"], "«Έχει κρύο» = fa freddo."),
          fill("Έχω πολλά ___ κάνω. (da fare)", "να", ["να", "για", "σε", "με"], "Costruzione «έχω να + verbo» = ho da…"),
          fill("Έχω ___ να σε δω! (è da tanto)", "καιρό", ["καιρό", "δίκιο", "ύπνο", "ζέστη"], "«Έχω καιρό να σε δω» = è da tanto che non ti vedo.")
        ]
      },
      {
        id: "a5", part: "Passato e futuro", title: "Passato e futuro: είχα, θα έχω",
        intro: [
          "Il passato semplice di «έχω» (avevo, ebbi) è «είχα». Il futuro si forma con «θα» + presente: θα έχω.",
          "Attenzione: «είχα» si forma come «ήμουν» di είμαι: ha una forma sola per «avevo» e «ebbi». Per dire «ho avuto» di solito si usa lo stesso είχα."
        ],
        blocks: [
          conj("είχα · passato", [
            [P6[0], "είχα", "ìha", "io avevo"], [P6[1], "είχες", "ìhes", "tu avevi"], [P6[2], "είχε", "ìhe", "lui / lei aveva"],
            [P6[3], "είχαμε", "ìhame", "noi avevamo"], [P6[4], "είχατε", "ìhate", "voi avevate"], [P6[5], "είχαν", "ìhan", "loro avevano"]
          ]),
          conj("θα έχω · futuro", [
            [P6[0], "θα έχω", "tha èho", "io avrò"], [P6[1], "θα έχεις", "tha èhis", "tu avrai"], [P6[2], "θα έχει", "tha èhi", "lui / lei avrà"],
            [P6[3], "θα έχουμε", "tha èhume", "noi avremo"], [P6[4], "θα έχετε", "tha èhete", "voi avrete"], [P6[5], "θα έχουν", "tha èhun", "loro avranno"]
          ]),
          ex("Frasi d'esempio", [
            ["Είχα ένα σκύλο όταν ήμουν μικρός.", "Avevo un cane quando ero piccolo."], ["Είχες δίκιο.", "Avevi ragione."], ["Χθες είχαμε μάθημα.", "Ieri avevamo lezione."],
            ["Αύριο θα έχω χρόνο.", "Domani avrò tempo."], ["Θα έχεις καιρό να διαβάσεις;", "Avrai il tempo di leggere?"], ["Την Κυριακή δεν θα έχουμε δουλειά.", "Domenica non avremo lavoro."]
          ])
        ],
        fills: [
          fill("Χθες ___ μάθημα. (io)", "είχα", ["είχα", "έχω", "θα έχω", "είχες"], "Passato, prima persona: είχα."),
          fill("Αύριο ___ χρόνο. (io)", "θα έχω", ["θα έχω", "είχα", "έχω", "θα είχα"], "Futuro: θα + presente → θα έχω."),
          fill("Είχες ___! (avevi ragione)", "δίκιο", ["δίκιο", "δίψα", "ζέστη", "κρύο"], "«Είχες δίκιο» = avevi ragione."),
          fill("Την Κυριακή δεν ___ δουλειά. (noi)", "θα έχουμε", ["θα έχουμε", "είχαμε", "έχουμε", "θα έχουν"], "Futuro, noi: θα έχουμε.")
        ]
      },
      {
        id: "a6", part: "Passato prossimo", title: "Il passato prossimo: έχω + φάει",
        intro: [
          "In greco «έχω» è anche l'ausiliare del passato prossimo: έχω φάει = «ho mangiato». Si forma con «έχω» + una forma fissa del verbo che finisce in -ει (che non cambia mai con la persona).",
          "Per il passato più lontano (trapassato) si usa «είχα»: είχα φάει = «avevo mangiato». Per il «futuro anteriore» θα έχω: θα έχω φάει = «avrò mangiato». Per i verbi più usati la forma in -ει va imparata a memoria."
        ],
        blocks: [
          conj("έχω φάει · passato prossimo", [
            [P6[0], "έχω φάει", "èho fài", "io ho mangiato"], [P6[1], "έχεις φάει", "èhis fài", "tu hai mangiato"], [P6[2], "έχει φάει", "èhi fài", "lui / lei ha mangiato"],
            [P6[3], "έχουμε φάει", "èhume fài", "noi abbiamo mangiato"], [P6[4], "έχετε φάει", "èhete fài", "voi avete mangiato"], [P6[5], "έχουν φάει", "èhun fài", "loro hanno mangiato"]
          ]),
          vocab("Le forme in -ει più usate", [
            ["τρώω → έχω φάει", "tròo → èho fài", "mangiare → ho mangiato"], ["βλέπω → έχω δει", "vlèpo → èho dhi", "vedere → ho visto"], ["πηγαίνω → έχω πάει", "piyèno → èho pài", "andare → sono stato"],
            ["κάνω → έχω κάνει", "kàno → èho kàni", "fare → ho fatto"], ["γράφω → έχω γράψει", "gràfo → èho gràpsi", "scrivere → ho scritto"], ["λέω → έχω πει", "lèo → èho pi", "dire → ho detto"],
            ["πίνω → έχω πιει", "pìno → èho pii", "bere → ho bevuto"], ["παίρνω → έχω πάρει", "pèrno → èho pàri", "prendere → ho preso"], ["έρχομαι → έχω έρθει", "èrhome → èho èrthi", "venire → sono venuto"],
            ["μαθαίνω → έχω μάθει", "mathèno → èho màthi", "imparare → ho imparato"]
          ]),
          ex("Frasi d'esempio", [
            ["Έχεις δει αυτή την ταινία;", "Hai visto questo film?"], ["Δεν έχω φάει ακόμα.", "Non ho ancora mangiato."], ["Έχω πάει στην Ελλάδα δύο φορές.", "Sono stato in Grecia due volte."],
            ["Δεν έχω πάει ποτέ στην Κρήτη.", "Non sono mai stato a Creta."], ["Είχα φάει ήδη.", "Avevo già mangiato."], ["Θα έχω τελειώσει μέχρι αύριο.", "Avrò finito entro domani."]
          ]),
          note("Dopo «έχω» la forma in -ει non cambia mai: έχω φάει, έχεις φάει, έχουν φάει. Parole che accompagnano il passato prossimo: ήδη (già), ακόμα (ancora), ποτέ (mai), πολλές φορές (molte volte), μόλις (appena).", "tip")
        ],
        fills: [
          fill("Έχω ___ αυτή την ταινία. (visto)", "δει", ["δει", "βλέπω", "είδα", "βλέπει"], "Il passato prossimo di βλέπω è έχω δει."),
          fill("Δεν έχω ___ ακόμα. (mangiato)", "φάει", ["φάει", "τρώω", "έφαγα", "φάω"], "Forma fissa in -ει: έχω φάει."),
          fill("Έχεις ___ στην Ελλάδα; (sei stato)", "πάει", ["πάει", "πάω", "πηγαίνω", "πήγα"], "έχω πάει = sono stato (andato)."),
          fill("Είχα ___ ήδη. (avevo mangiato)", "φάει", ["φάει", "φάω", "τρώω", "έφαγα"], "Trapassato: είχα + φάει.")
        ]
      },
      {
        id: "a7", part: "Espressioni e dialoghi", title: "Dialogo e ripasso: έχω",
        intro: [
          "Per finire, un dialogo in hotel e le frasi di sopravvivenza con «έχω» che userai più spesso in viaggio o in negozio.",
          "Leggi il dialogo ad alta voce e poi prova a rispondere cambiando i dettagli (nome, camera, numero di notti)."
        ],
        blocks: [
          vocab("Frasi di sopravvivenza", [
            ["Έχετε ένα δωμάτιο;", "èhete ena domàtio", "Avete una camera?"], ["Έχετε wi-fi;", "èhete wài-fai", "Avete il wi-fi?"], ["Έχετε τίποτα φθηνότερο;", "èhete tìpota fthinòtero", "Avete qualcosa di più economico?"],
            ["Δεν έχω ψιλά.", "den èho psilà", "Non ho spiccioli."], ["Έχω ένα πρόβλημα.", "èho ena pròvlima", "Ho un problema."], ["Έχετε πάρκινγκ;", "èhete pàrking", "Avete un parcheggio?"]
          ]),
          dlg("Al ricevimento", [
            ["Υπάλληλος", "Καλησπέρα σας! Έχετε κράτηση;", "Buonasera! Avete una prenotazione?"],
            ["Πελάτης", "Ναι, έχω μια κράτηση στο όνομα Ρόσι.", "Sì, ho una prenotazione a nome Rossi."],
            ["Υπάλληλος", "Έχετε δελτίο ταυτότητας;", "Avete un documento d'identità?"],
            ["Πελάτης", "Ναι, το έχω εδώ.", "Sì, ce l'ho qui."],
            ["Υπάλληλος", "Ευχαριστώ. Έχετε πολλές βαλίτσες;", "Grazie. Avete molte valigie?"],
            ["Πελάτης", "Όχι, έχω μόνο μία.", "No, ne ho solo una."]
          ])
        ],
        fills: [
          fill("___ κράτηση; – Ναι, έχω. (voi)", "Έχετε", ["Έχετε", "Έχεις", "Έχουν", "Έχω"], "Il receptionist dà del voi / Lei: Έχετε."),
          fill("Ναι, ___ μια κράτηση στο όνομα Ρόσι.", "έχω", ["έχω", "έχεις", "έχει", "είχα"], "Il cliente parla di sé: έχω."),
          fill("Όχι, ___ μόνο μία βαλίτσα.", "έχω", ["έχω", "είμαι", "έχουν", "θα έχει"], "Parla di sé: έχω."),
          fill("Ναι, το ___ εδώ. (ce l'ho)", "έχω", ["έχω", "είχα", "θα έχω", "έχουμε"], "Presente: το έχω εδώ.")
        ]
      }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
