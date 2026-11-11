// VERBI FONDAMENTALI — sezione «I verbi modali».
// In greco non esistono veri verbi ausiliari modali come «can», «must»: si usano verbi comuni (μπορώ, θέλω, ξέρω…),
// espressioni impersonali (πρέπει, χρειάζεται, επιτρέπεται) e la particella «να» + congiuntivo.
(function (root) {
  const D = root.VerbiData;
  const { conj, vocab, ex, note, dlg, fill } = D;
  const P6 = ["εγώ", "εσύ", "αυτός / αυτή / αυτό", "εμείς", "εσείς", "αυτοί / αυτές / αυτά"];

  D.sections.push({
    id: "modali", n: 3, title: "Τα ρήματα «μπορώ, θέλω, πρέπει…»", it: "I verbi modali",
    sub: "Potere, volere, dovere, sapere, bisogno, permesso, possibilità e cortesia",
    intro: "In italiano diciamo «posso, voglio, devo, so»; in greco lo stesso ruolo lo fanno μπορώ, θέλω, πρέπει, ξέρω, χρειάζεται, επιτρέπεται. Dopo di loro non c'è l'infinito (il greco moderno non lo usa): si mette «να» seguito dal verbo coniugato. Ogni modale ha la sua parte, divisa in lezioni brevi.",
    lessons: [
      {
        id: "m0", part: "Introduzione: la particella να", title: "Come funzionano i modali: να + verbo",
        intro: [
          "In greco moderno l'infinito non esiste. Dove l'italiano dice «voglio partire», il greco dice «voglio che io parta»: Θέλω να φύγω. Il verbo dopo «να» si coniuga e concorda con il soggetto: Θέλεις να φύγεις; Θέλουμε να φύγουμε.",
          "Per la negazione si usa «δεν» davanti al modale (Δεν θέλω να φύγω) oppure «να μην» davanti al verbo (Θέλω να μην φύγεις = voglio che tu non parta)."
        ],
        blocks: [
          conj("να φύγω · «να» + φεύγω (andare via)", [
            [P6[0], "να φύγω", "na fìgo", "che io parta / (di) partire"], [P6[1], "να φύγεις", "na fìgis", "che tu parta"], [P6[2], "να φύγει", "na fìgi", "che lui / lei parta"],
            [P6[3], "να φύγουμε", "na fìgume", "che noi partiamo"], [P6[4], "να φύγετε", "na fìgete", "che voi partiate"], [P6[5], "να φύγουν", "na fìgun", "che loro partano"]
          ]),
          vocab("«Να» + verbo: forme di uso comune (prima persona)", [
            ["να φάω", "na fào", "mangiare"], ["να πάω", "na pào", "andare"], ["να δω", "na dho", "vedere"], ["να κάνω", "na kàno", "fare"], ["να πιω", "na pio", "bere"], ["να έρθω", "na èrtho", "venire"],
            ["να πω", "na po", "dire"], ["να πάρω", "na pàro", "prendere"], ["να γράψω", "na gràpso", "scrivere"], ["να μιλήσω", "na milìso", "parlare"], ["να περιμένω", "na perimèno", "aspettare"],
            ["να βοηθήσω", "na voithìso", "aiutare"], ["να αγοράσω", "na agoràso", "comprare"], ["να μείνω", "na mìno", "restare"], ["να ανοίξω", "na anìkso", "aprire"], ["να κλείσω", "na klìso", "chiudere"]
          ]),
          ex("Frasi d'esempio", [
            ["Θέλω να φύγω.", "Voglio andare via."], ["Μπορείς να έρθεις;", "Puoi venire?"], ["Πρέπει να φάμε.", "Dobbiamo mangiare."],
            ["Δεν θέλω να μιλήσω.", "Non voglio parlare."], ["Ξέρω να οδηγώ.", "So guidare."], ["Θέλω να μην φύγεις.", "Voglio che tu non parta."]
          ]),
          note("Due «forme» dopo να: una per l'azione singola («να φάω» = mangiare una volta), una per l'abitudine o per l'azione che dura («να τρώω» = mangiare di solito). Per ora impara le forme singole del riquadro: sono quelle che servono quasi sempre.", "tip")
        ],
        fills: [
          fill("Θέλω ___ φύγω.", "να", ["να", "για", "σε", "και"], "Dopo un modale si usa «να» + verbo."),
          fill("Θέλεις να ___; (tu, andare via)", "φύγεις", ["φύγεις", "φύγω", "φύγει", "φύγουμε"], "Il verbo concorda con «tu»: να φύγεις."),
          fill("Θέλουμε να ___. (noi, andare via)", "φύγουμε", ["φύγουμε", "φύγω", "φύγεις", "φύγουν"], "Con «noi»: να φύγουμε."),
          fill("Δεν θέλω να ___. (io, parlare)", "μιλήσω", ["μιλήσω", "μιλήσεις", "μιλήσει", "μιλήσουμε"], "Con «io»: να μιλήσω.")
        ]
      },
      {
        id: "m1", part: "Μπορώ · potere", title: "Μπορώ: potere (presente)",
        intro: [
          "«Μπορώ» significa «posso, riesco, so». Serve per la capacità (Μπορώ να κολυμπήσω = «so/riesco a nuotare»), per chiedere un favore o un permesso (Μπορώ να καθίσω εδώ; = «Posso sedermi qui?») e per fare richieste educate (Μπορείτε να μου πείτε…;).",
          "È regolare ma con la desinenza dei verbi in -ώ / -είς: μπορώ, μπορείς, μπορεί, μπορούμε, μπορείτε, μπορούν. Dopo μπορώ si usa «να» + verbo."
        ],
        blocks: [
          conj("μπορώ · presente", [
            [P6[0], "μπορώ", "boró", "io posso"], [P6[1], "μπορείς", "borìs", "tu puoi"], [P6[2], "μπορεί", "borì", "lui / lei può"],
            [P6[3], "μπορούμε", "borùme", "noi possiamo"], [P6[4], "μπορείτε", "borìte", "voi potete / Lei può"], [P6[5], "μπορούν", "borùn", "loro possono"]
          ]),
          ex("Frasi d'esempio", [
            ["Μπορώ να σε βοηθήσω;", "Posso aiutarti?"], ["Μπορείς να μιλήσεις πιο αργά;", "Puoi parlare più piano?"], ["Δεν μπορώ να έρθω αύριο.", "Domani non posso venire."],
            ["Μπορούμε να φάμε μαζί;", "Possiamo mangiare insieme?"], ["Μπορώ να πάρω έναν καφέ;", "Posso prendere un caffè?"], ["Μπορείτε να μου πείτε πού είναι το μουσείο;", "Può dirmi dov'è il museo?"]
          ]),
          note("Alla terza persona plurale si sente anche «μπορούνε». Per dire «non posso» si mette «δεν» davanti: Δεν μπορώ να σε ακούσω = «Non riesco a sentirti».", "tip")
        ],
        fills: [
          fill("___ να σε βοηθήσω; (io)", "Μπορώ", ["Μπορώ", "Μπορείς", "Μπορεί", "Μπορούμε"], "Con «io»: μπορώ."),
          fill("Εσύ ___ να έρθεις αύριο;", "μπορείς", ["μπορώ", "μπορείς", "μπορεί", "μπορούν"], "Con «tu»: μπορείς."),
          fill("Εμείς δεν ___ να έρθουμε.", "μπορούμε", ["μπορούμε", "μπορώ", "μπορείτε", "μπορούν"], "Con «noi»: μπορούμε."),
          fill("Μπορείτε ___ μου πείτε πού είναι το μουσείο;", "να", ["να", "για", "σε", "που"], "Dopo μπορώ si usa «να».")
        ]
      },
      {
        id: "m2", part: "Μπορώ · potere", title: "Μπορώ: passato, futuro e «μπορεί»",
        intro: [
          "Il passato abituale o descrittivo è «μπορούσα» (potevo): Μπορούσα να τρέξω πιο γρήγορα όταν ήμουν μικρός. Per dire che in una certa occasione non sei riuscito a fare qualcosa si usa «δεν μπόρεσα» (non sono riuscito): Δεν μπόρεσα να κοιμηθώ.",
          "Il futuro è «θα μπορώ» (potrò). La forma impersonale «μπορεί να…» significa «può darsi che…»: Μπορεί να βρέξει = «Può darsi che piova»."
        ],
        blocks: [
          conj("μπορούσα · passato (potevo)", [
            [P6[0], "μπορούσα", "borùsa", "io potevo"], [P6[1], "μπορούσες", "borùses", "tu potevi"], [P6[2], "μπορούσε", "borùse", "lui / lei poteva"],
            [P6[3], "μπορούσαμε", "borùsame", "noi potevamo"], [P6[4], "μπορούσατε", "borùsate", "voi potevate"], [P6[5], "μπορούσαν", "borùsan", "loro potevano"]
          ]),
          vocab("Altre forme utili", [
            ["θα μπορώ", "tha boró", "potrò"], ["δεν μπόρεσα", "den bòresa", "non sono riuscito"], ["μπορεί να βρέξει", "borì na vrèksi", "può darsi che piova"], ["Δεν μπορεί!", "den borì", "Non è possibile!"]
          ]),
          ex("Frasi d'esempio", [
            ["Μπορούσα να τρέξω πιο γρήγορα όταν ήμουν μικρός.", "Riuscivo a correre più veloce quando ero piccolo."], ["Δεν μπόρεσα να κοιμηθώ χθες.", "Ieri non sono riuscito a dormire."],
            ["Θα μπορώ να έρθω την Παρασκευή.", "Venerdì potrò venire."], ["Μπορεί να βρέξει αύριο.", "Può darsi che domani piova."], ["Μπορεί να έχεις δίκιο.", "Può darsi che tu abbia ragione."]
          ])
        ],
        fills: [
          fill("Όταν ήμουν μικρός, ___ να τρέξω γρήγορα. (potevo)", "μπορούσα", ["μπορούσα", "μπορώ", "θα μπορώ", "μπόρεσα"], "Descrizione del passato abituale: μπορούσα."),
          fill("Την Παρασκευή ___ να έρθω. (potrò)", "θα μπορώ", ["θα μπορώ", "μπορούσα", "μπορώ", "μπόρεσα"], "Futuro: θα + presente."),
          fill("___ να βρέξει αύριο. (può darsi)", "Μπορεί", ["Μπορεί", "Μπορώ", "Μπορούν", "Πρέπει"], "«Μπορεί να…» = può darsi che…"),
          fill("Χθες δεν ___ να κοιμηθώ. (non sono riuscito)", "μπόρεσα", ["μπόρεσα", "μπορώ", "μπορούσα", "μπορεί"], "Una singola occasione fallita: δεν μπόρεσα.")
        ]
      },
      {
        id: "m3", part: "Θέλω · volere", title: "Θέλω: volere (presente)",
        intro: [
          "«Θέλω» significa «voglio». Si può usare con un nome (Θέλω έναν καφέ = «Voglio un caffè») oppure con «να» + verbo (Θέλω να φάω = «Voglio mangiare»).",
          "Alla terza persona singolare si usa anche in modo impersonale: «Θέλει δύο ώρες» = «Ci vogliono due ore»."
        ],
        blocks: [
          conj("θέλω · presente", [
            [P6[0], "θέλω", "thèlo", "io voglio"], [P6[1], "θέλεις", "thèlis", "tu vuoi"], [P6[2], "θέλει", "thèli", "lui / lei vuole"],
            [P6[3], "θέλουμε", "thèlume", "noi vogliamo"], [P6[4], "θέλετε", "thèlete", "voi volete"], [P6[5], "θέλουν", "thèlun", "loro vogliono"]
          ]),
          ex("Frasi d'esempio", [
            ["Θέλω έναν καφέ.", "Voglio un caffè."], ["Θέλω να μάθω ελληνικά.", "Voglio imparare il greco."], ["Τι θέλεις να φας;", "Che cosa vuoi mangiare?"],
            ["Δεν θέλουμε να χάσουμε το λεωφορείο.", "Non vogliamo perdere l'autobus."], ["Θέλει δύο ώρες για να φτάσουμε.", "Ci vogliono due ore per arrivare."], ["Αυτό το φαγητό θέλει αλάτι.", "Questo piatto ha bisogno di sale."]
          ]),
          note("«Τι θέλεις;» è diretto (come «Che cosa vuoi?»). Per chiedere gentilmente si preferisce «Τι θα θέλατε;» (Che cosa desidera?): lo vedi nella lezione sul «θα ήθελα».", "tip")
        ],
        fills: [
          fill("Εγώ ___ να μάθω ελληνικά.", "θέλω", ["θέλω", "θέλεις", "θέλει", "θέλουν"], "Con «io»: θέλω."),
          fill("Τι ___ να φας; (tu)", "θέλεις", ["θέλεις", "θέλω", "θέλετε", "θέλει"], "Con «tu»: θέλεις."),
          fill("Εμείς δεν ___ να χάσουμε το λεωφορείο.", "θέλουμε", ["θέλουμε", "θέλω", "θέλουν", "θέλετε"], "Con «noi»: θέλουμε."),
          fill("___ δύο ώρες για να φτάσουμε. (ci vogliono)", "Θέλει", ["Θέλει", "Θέλω", "Θέλουν", "Έχει"], "Costruzione impersonale: θέλει + durata.")
        ]
      },
      {
        id: "m4", part: "Θέλω · volere", title: "Θέλω: ήθελα e θα ήθελα (cortesia)",
        intro: [
          "Il passato è «ήθελα» (volevo): Ήθελα να σε δω. Ma attenzione: per chiedere qualcosa con gentilezza si usa «θα ήθελα» (vorrei), che corrisponde al condizionale italiano.",
          "«Θα ήθελα έναν καφέ, παρακαλώ» è la frase che userai più spesso al bar o al ristorante. Dopo «θα ήθελα» c'è «να» + verbo oppure un nome."
        ],
        blocks: [
          conj("ήθελα · passato (volevo)", [
            [P6[0], "ήθελα", "ìthela", "io volevo"], [P6[1], "ήθελες", "ìtheles", "tu volevi"], [P6[2], "ήθελε", "ìthele", "lui / lei voleva"],
            [P6[3], "θέλαμε", "thèlame", "noi volevamo"], [P6[4], "θέλατε", "thèlate", "voi volevate"], [P6[5], "ήθελαν", "ìthelan", "loro volevano"]
          ]),
          conj("θα ήθελα · condizionale (vorrei)", [
            [P6[0], "θα ήθελα", "tha ìthela", "io vorrei"], [P6[1], "θα ήθελες", "tha ìtheles", "tu vorresti"], [P6[2], "θα ήθελε", "tha ìthele", "lui / lei vorrebbe"],
            [P6[3], "θα θέλαμε", "tha thèlame", "noi vorremmo"], [P6[4], "θα θέλατε", "tha thèlate", "voi vorreste / Lei vorrebbe"], [P6[5], "θα ήθελαν", "tha ìthelan", "loro vorrebbero"]
          ]),
          ex("Frasi d'esempio", [
            ["Ήθελα να σε δω.", "Volevo vederti."], ["Θα ήθελα έναν καφέ, παρακαλώ.", "Vorrei un caffè, per favore."], ["Θα ήθελα να κλείσω ένα τραπέζι για δύο.", "Vorrei prenotare un tavolo per due."],
            ["Τι θα θέλατε;", "Che cosa desidera?"], ["Θα θέλαμε τον λογαριασμό.", "Vorremmo il conto."], ["Δεν ήθελα να σε ενοχλήσω.", "Non volevo disturbarti."]
          ])
        ],
        fills: [
          fill("___ να σε δω. (volevo)", "Ήθελα", ["Ήθελα", "Θέλω", "Θα ήθελα", "Θέλει"], "Passato: ήθελα."),
          fill("___ έναν καφέ, παρακαλώ. (vorrei)", "Θα ήθελα", ["Θα ήθελα", "Ήθελα", "Θέλω", "Θα θέλεις"], "Richiesta gentile: θα ήθελα."),
          fill("Εμείς ___ τον λογαριασμό. (vorremmo)", "θα θέλαμε", ["θα θέλαμε", "θα ήθελα", "θέλουμε", "ήθελαν"], "Condizionale di «noi»: θα θέλαμε."),
          fill("Τι ___; (Lei desidera?)", "θα θέλατε", ["θα θέλατε", "θα ήθελα", "θέλω", "ήθελα"], "Per la cortesia al «voi»: Τι θα θέλατε;")
        ]
      },
      {
        id: "m5", part: "Πρέπει · dovere", title: "Πρέπει να: dovere",
        intro: [
          "«Πρέπει» significa «devo, devi, deve…» ed è invariabile: non cambia con la persona. A cambiare è il verbo dopo «να»: Πρέπει να φύγω (devo partire), Πρέπει να φύγεις (devi partire), Πρέπει να φύγουμε (dobbiamo partire).",
          "Attenzione al contrario del dovere: «Δεν πρέπει να…» significa «non devi / non si deve» (è un divieto, una cosa sconsigliata): Δεν πρέπει να καπνίζεις εδώ. Per dire che non c'è bisogno si usa un'altra espressione: «Δεν χρειάζεται να…» (vedi la lezione sul χρειάζεται)."
        ],
        blocks: [
          conj("πρέπει να φύγω · πρέπει + να + verbo", [
            [P6[0], "πρέπει να φύγω", "prèpi na fìgo", "devo partire"], [P6[1], "πρέπει να φύγεις", "prèpi na fìgis", "devi partire"], [P6[2], "πρέπει να φύγει", "prèpi na fìgi", "deve partire"],
            [P6[3], "πρέπει να φύγουμε", "prèpi na fìgume", "dobbiamo partire"], [P6[4], "πρέπει να φύγετε", "prèpi na fìgete", "dovete partire"], [P6[5], "πρέπει να φύγουν", "prèpi na fìgun", "devono partire"]
          ]),
          ex("Frasi d'esempio", [
            ["Πρέπει να φύγω τώρα.", "Devo andare ora."], ["Πρέπει να μελετάς κάθε μέρα.", "Devi studiare ogni giorno."], ["Δεν πρέπει να καπνίζεις εδώ.", "Non devi fumare qui."],
            ["Πρέπει να είσαι προσεκτικός.", "Devi stare attento."], ["Πρέπει να αγοράσουμε ψωμί.", "Dobbiamo comprare il pane."], ["Δεν πρέπει να αργήσουμε.", "Non dobbiamo fare tardi."]
          ]),
          note("«Πρέπει» non si coniuga mai: dire «πρέπω», «πρέπεις» è sbagliato. Cambi solo il verbo dopo «να».", "warn")
        ],
        fills: [
          fill("___ να φύγω τώρα. (devo)", "Πρέπει", ["Πρέπει", "Πρέπω", "Θέλει", "Μπορεί"], "Dovere: πρέπει (invariabile)."),
          fill("Πρέπει να ___ τώρα. (tu, partire)", "φύγεις", ["φύγεις", "φύγω", "φύγει", "φύγουμε"], "Soggetto «tu»: να φύγεις."),
          fill("Δεν ___ να καπνίζεις εδώ. (non devi)", "πρέπει", ["πρέπει", "χρειάζεται", "μπορώ", "θέλω"], "Divieto o sconsiglio: δεν πρέπει να."),
          fill("Πρέπει να ___ προσεκτικός. (tu, essere)", "είσαι", ["είσαι", "είμαι", "είναι", "είστε"], "Dopo να il verbo concorda: να είσαι.")
        ]
      },
      {
        id: "m6", part: "Πρέπει · dovere", title: "Πρέπει: έπρεπε, θα έπρεπε e deduzione",
        intro: [
          "Il passato è «έπρεπε να»: Έπρεπε να φύγω νωρίτερα = «Dovevo / avrei dovuto partire prima». Per un consiglio (dovresti) si usa «θα έπρεπε να»: Θα έπρεπε να πας στον γιατρό = «Dovresti andare dal medico».",
          "Con «πρέπει να» si può anche fare una deduzione: Πρέπει να είναι αργά = «Dev'essere tardi»."
        ],
        blocks: [
          vocab("Forme di πρέπει", [
            ["πρέπει να", "prèpi na", "devo / devi / deve (presente)"], ["έπρεπε να", "èprepe na", "dovevo / avrei dovuto"], ["θα έπρεπε να", "tha èprepe na", "dovrei / dovresti / dovrebbe"],
            ["δεν πρέπει να", "den prèpi na", "non devo / non si deve"], ["δεν έπρεπε να", "den èprepe na", "non avrei dovuto"], ["πρέπει να είναι", "prèpi na ìne", "dev'essere (deduzione)"]
          ]),
          ex("Frasi d'esempio", [
            ["Έπρεπε να φύγω νωρίτερα.", "Avrei dovuto partire prima."], ["Θα έπρεπε να πας στον γιατρό.", "Dovresti andare dal medico."], ["Θα έπρεπε να κοιμάσαι νωρίτερα.", "Dovresti dormire prima."],
            ["Πρέπει να είναι αργά.", "Dev'essere tardi."], ["Δεν έπρεπε να του το πω.", "Non avrei dovuto dirglielo."], ["Πρέπει να έχει πολλή δουλειά.", "Deve avere molto lavoro."]
          ]),
          note("Tre livelli: πρέπει να (devo: è necessario ora), έπρεπε να (dovevo / avrei dovuto: nel passato), θα έπρεπε να (dovrei: consiglio gentile).", "tip")
        ],
        fills: [
          fill("___ να πας στον γιατρό. (dovresti)", "Θα έπρεπε", ["Θα έπρεπε", "Έπρεπε", "Πρέπει", "Δεν πρέπει"], "Consiglio gentile: θα έπρεπε να."),
          fill("Χθες ___ να φύγω νωρίτερα. (avrei dovuto)", "έπρεπε", ["έπρεπε", "πρέπει", "θα έπρεπε", "πρέπουν"], "Passato: έπρεπε να."),
          fill("Πρέπει να ___ αργά. (dev'essere tardi)", "είναι", ["είναι", "είμαι", "είσαι", "ήταν"], "«Πρέπει να είναι» = dev'essere."),
          fill("Δεν ___ να του το πω. (non avrei dovuto)", "έπρεπε", ["έπρεπε", "πρέπει", "χρειάζεται", "θέλω"], "Passato negativo: δεν έπρεπε να.")
        ]
      },
      {
        id: "m7", part: "Ξέρω · sapere", title: "Ξέρω: sapere e saper fare",
        intro: [
          "«Ξέρω» significa «so». Con un nome o una frase indica un fatto (Ξέρω ότι είσαι κουρασμένος), con una persona vale «conosco» (Ξέρεις τον Γιώργο;), con «να» + verbo indica un'abilità acquisita: Ξέρω να κολυμπάω = «So nuotare».",
          "Differenza con μπορώ: «Ξέρω να κολυμπάω» = l'ho imparato, ho la capacità; «Μπορώ να κολυμπήσω σήμερα» = posso farlo oggi (non c'è impedimento)."
        ],
        blocks: [
          conj("ξέρω · presente", [
            [P6[0], "ξέρω", "ksèro", "io so"], [P6[1], "ξέρεις", "ksèris", "tu sai"], [P6[2], "ξέρει", "ksèri", "lui / lei sa"],
            [P6[3], "ξέρουμε", "ksèrume", "noi sappiamo"], [P6[4], "ξέρετε", "ksèrete", "voi sapete"], [P6[5], "ξέρουν", "ksèrun", "loro sanno"]
          ]),
          vocab("Passato", [
            ["ήξερα", "ìksera", "sapevo"], ["ήξερες", "ìkseres", "sapevi"], ["ήξερε", "ìksere", "sapeva"], ["ξέραμε", "ksèrame", "sapevamo"], ["ξέρατε", "ksèrate", "sapevate"], ["ήξεραν", "ìkseran", "sapevano"]
          ]),
          ex("Frasi d'esempio", [
            ["Ξέρω να κολυμπάω.", "So nuotare."], ["Δεν ξέρω να οδηγώ.", "Non so guidare."], ["Ξέρεις να μαγειρεύεις;", "Sai cucinare?"],
            ["Ξέρω ότι είσαι κουρασμένος.", "So che sei stanco."], ["Δεν ξέρω τι ώρα είναι.", "Non so che ora è."], ["Ήξερα να παίζω κιθάρα, αλλά το ξέχασα.", "Sapevo suonare la chitarra, ma l'ho dimenticato."]
          ]),
          note("Per «non lo so» si dice semplicemente «Δεν ξέρω». Per «lo so già» si dice «Το ξέρω».", "tip")
        ],
        fills: [
          fill("___ να κολυμπάω. (so)", "Ξέρω", ["Ξέρω", "Ξέρεις", "Ξέρει", "Ξέρουν"], "Prima persona: ξέρω."),
          fill("Εσύ ___ να μαγειρεύεις;", "ξέρεις", ["ξέρεις", "ξέρω", "ξέρει", "ξέρουμε"], "Con «tu»: ξέρεις."),
          fill("Δεν ___ να οδηγώ. (non so guidare)", "ξέρω", ["ξέρω", "μπορώ", "πρέπει", "θέλω"], "Abilità appresa: ξέρω να."),
          fill("___ να παίζω κιθάρα, αλλά το ξέχασα. (sapevo)", "Ήξερα", ["Ήξερα", "Ξέρω", "Ξέρεις", "Ήξερες"], "Passato: ήξερα.")
        ]
      },
      {
        id: "m8", part: "Χρειάζεται · aver bisogno", title: "Χρειάζομαι e χρειάζεται: aver bisogno",
        intro: [
          "«Χρειάζομαι» significa «ho bisogno di, mi serve»: Χρειάζομαι βοήθεια. Si coniuga come un verbo medio (desinenze in -ομαι).",
          "La forma impersonale «χρειάζεται να + verbo» = «bisogna, è necessario»: Χρειάζεται να περιμένουμε. Il suo negativo «δεν χρειάζεται να» = «non c'è bisogno di, non serve»: Δεν χρειάζεται να βιαστείς = «Non serve che ti affretti»."
        ],
        blocks: [
          conj("χρειάζομαι · presente", [
            [P6[0], "χρειάζομαι", "hriàzome", "ho bisogno"], [P6[1], "χρειάζεσαι", "hriàzese", "hai bisogno"], [P6[2], "χρειάζεται", "hriàzete", "ha bisogno / serve"],
            [P6[3], "χρειαζόμαστε", "hriazòmaste", "abbiamo bisogno"], [P6[4], "χρειάζεστε", "hriàzeste", "avete bisogno"], [P6[5], "χρειάζονται", "hriàzonde", "hanno bisogno / servono"]
          ]),
          ex("Frasi d'esempio", [
            ["Χρειάζομαι βοήθεια.", "Ho bisogno di aiuto."], ["Τι χρειάζεσαι;", "Di che cosa hai bisogno?"], ["Χρειαζόμαστε περισσότερο χρόνο.", "Abbiamo bisogno di più tempo."],
            ["Χρειάζεται να περιμένουμε.", "Bisogna aspettare."], ["Δεν χρειάζεται να μου πεις.", "Non serve che me lo dica."], ["Χρειάζεται υπομονή.", "Ci vuole pazienza."]
          ]),
          note("Attenzione: «δεν πρέπει» (è vietato / sconsigliato) e «δεν χρειάζεται» (non serve) NON sono la stessa cosa. Δεν πρέπει να φύγεις = non devi andare via. Δεν χρειάζεται να φύγεις = non serve che tu vada via.", "warn")
        ],
        fills: [
          fill("___ βοήθεια. (ho bisogno)", "Χρειάζομαι", ["Χρειάζομαι", "Χρειάζεται", "Χρειάζεσαι", "Χρειαζόμαστε"], "Prima persona: χρειάζομαι."),
          fill("Τι ___; (di che cosa hai bisogno?)", "χρειάζεσαι", ["χρειάζεσαι", "χρειάζομαι", "χρειάζεται", "χρειάζονται"], "Seconda persona: χρειάζεσαι."),
          fill("___ να περιμένουμε. (bisogna)", "Χρειάζεται", ["Χρειάζεται", "Χρειάζομαι", "Χρειάζονται", "Πρέπουν"], "Impersonale: χρειάζεται να."),
          fill("Δεν ___ να βιαστείς. (non serve)", "χρειάζεται", ["χρειάζεται", "πρέπει", "ξέρει", "μπορώ"], "«Non serve» = δεν χρειάζεται να.")
        ]
      },
      {
        id: "m9", part: "Επιτρέπεται · permesso e divieto", title: "Permesso e divieto: επιτρέπεται, απαγορεύεται",
        intro: [
          "Per dire che qualcosa è permesso si usa «επιτρέπεται» (è permesso), per il divieto «απαγορεύεται» (è vietato). Sono forme impersonali che si trovano su cartelli e avvisi: Απαγορεύεται το κάπνισμα (Vietato fumare).",
          "Per chiedere il permesso: Μπορώ να καθίσω εδώ; (Posso sedermi qui?) oppure, più formale, Μου επιτρέπετε να…; (Mi permette di…?)"
        ],
        blocks: [
          vocab("Permesso e divieto", [
            ["Επιτρέπεται", "epitrèpete", "È permesso"], ["Δεν επιτρέπεται", "den epitrèpete", "Non è permesso"], ["Απαγορεύεται", "apagorèvete", "È vietato"],
            ["Απαγορεύεται η είσοδος.", "apagorèvete i ìsodhos", "Vietato l'ingresso."], ["Απαγορεύεται το κάπνισμα.", "apagorèvete to kàpnisma", "Vietato fumare."], ["Μου επιτρέπετε;", "mu epitrèpete", "Mi permette?"]
          ]),
          ex("Frasi d'esempio", [
            ["Επιτρέπεται το κάπνισμα εδώ;", "Qui si può fumare?"], ["Δεν επιτρέπεται να παρκάρεις εδώ.", "Qui non è permesso parcheggiare."], ["Επιτρέπεται να βγάλω φωτογραφία;", "Posso fare una foto?"],
            ["Μπορώ να καθίσω εδώ;", "Posso sedermi qui?"], ["Απαγορεύεται η είσοδος σε ζώα.", "Vietato l'ingresso agli animali."], ["Μου επιτρέπετε να περάσω;", "Mi permette di passare?"]
          ]),
          note("«Δεν επιτρέπεται να…» e «Απαγορεύεται να…» si usano per divieti ufficiali. Tra amici diresti piuttosto «Δεν μπορείς να…» o «Δεν πρέπει να…».", "tip")
        ],
        fills: [
          fill("___ το κάπνισμα. (Vietato fumare)", "Απαγορεύεται", ["Απαγορεύεται", "Επιτρέπεται", "Χρειάζεται", "Μπορεί"], "Divieto: απαγορεύεται."),
          fill("Δεν ___ να παρκάρεις εδώ. (non è permesso)", "επιτρέπεται", ["επιτρέπεται", "απαγορεύεται", "χρειάζεται", "θέλει"], "Con «δεν» il permesso diventa negazione: δεν επιτρέπεται."),
          fill("___ να βγάλω φωτογραφία; (è permesso?)", "Επιτρέπεται", ["Επιτρέπεται", "Απαγορεύεται", "Ξέρω", "Θέλει"], "Domanda di permesso: Επιτρέπεται να…;"),
          fill("Μπορώ να ___ εδώ; (sedermi)", "καθίσω", ["καθίσω", "καθίσεις", "καθίσει", "καθίσουμε"], "Con «io»: να καθίσω.")
        ]
      },
      {
        id: "m10", part: "Possibilità e probabilità", title: "Ίσως, μπορεί να, θα: possibilità e supposizione",
        intro: [
          "Per dire «forse» o «può darsi» il greco ha «ίσως» e «μπορεί να». Dopo «ίσως» il verbo è nella forma del «να», ma senza «να»: Ίσως έρθω αύριο = «Forse verrò domani».",
          "Per fare una supposizione si usa anche «θα» + presente: Θα είναι στο σπίτι = «Sarà a casa» (penso che sia a casa). E per una deduzione «πρέπει να»: Πρέπει να είναι στο σπίτι = «Dev'essere a casa»."
        ],
        blocks: [
          vocab("Espressioni di possibilità", [
            ["Ίσως", "ìsos", "Forse"], ["Μπορεί να …", "borì na", "Può darsi che…"], ["Πρέπει να …", "prèpi na", "Dev'essere… / Deve…"], ["Θα είναι …", "tha ìne", "Sarà… (supposizione)"],
            ["Φαίνεται ότι …", "fènete òti", "Sembra che…"], ["Φαίνεται κουρασμένος.", "fènete kurazmènos", "Sembra stanco."]
          ]),
          ex("Frasi d'esempio", [
            ["Ίσως έρθω αύριο.", "Forse verrò domani."], ["Μπορεί να έρθει αργότερα.", "Può darsi che venga più tardi."], ["Θα είναι στο γραφείο.", "Sarà in ufficio."],
            ["Πρέπει να είναι στο σπίτι.", "Dev'essere a casa."], ["Φαίνεται ότι θα βρέξει.", "Sembra che pioverà."], ["Ίσως να έχεις δίκιο.", "Forse hai ragione."]
          ]),
          note("Gradi di sicurezza: Ίσως (forse), Μπορεί να (può darsi), Θα … (penso di sì), Πρέπει να … (sono quasi sicuro). Per «sicuramente» si usa σίγουρα: Σίγουρα θα έρθει.", "tip")
        ],
        fills: [
          fill("___ έρθω αύριο. (forse)", "Ίσως", ["Ίσως", "Πρέπει", "Θέλω", "Ξέρω"], "«Ίσως» = forse."),
          fill("___ να έρθει αργότερα. (può darsi)", "Μπορεί", ["Μπορεί", "Μπορώ", "Ξέρει", "Θέλω"], "«Μπορεί να» = può darsi che."),
          fill("Πρέπει να ___ στο σπίτι. (dev'essere)", "είναι", ["είναι", "είμαι", "είσαι", "ήταν"], "«Πρέπει να είναι» = dev'essere."),
          fill("Φαίνεται ___ θα βρέξει. (sembra che)", "ότι", ["ότι", "να", "για", "με"], "«Φαίνεται ότι» = sembra che.")
        ]
      },
      {
        id: "m11", part: "Cortesia e consigli", title: "Θα μπορούσα, θα ήθελα, θα προτιμούσα",
        intro: [
          "Il greco ha una serie di forme con «θα» che servono per essere gentili: Θα μπορούσατε να…; (Potrebbe…?), Θα ήθελα… (Vorrei…), Θα προτιμούσα… (Preferirei…). Sono il corrispondente del condizionale italiano.",
          "Per dare un consiglio educato usa «Θα μπορούσες να…» (Potresti…) o «Θα έπρεπε να…» (Dovresti…)."
        ],
        blocks: [
          conj("θα μπορούσα · condizionale (potrei)", [
            [P6[0], "θα μπορούσα", "tha borùsa", "io potrei"], [P6[1], "θα μπορούσες", "tha borùses", "tu potresti"], [P6[2], "θα μπορούσε", "tha borùse", "lui / lei potrebbe"],
            [P6[3], "θα μπορούσαμε", "tha borùsame", "noi potremmo"], [P6[4], "θα μπορούσατε", "tha borùsate", "voi potreste / Lei potrebbe"], [P6[5], "θα μπορούσαν", "tha borùsan", "loro potrebbero"]
          ]),
          vocab("Frasi gentili", [
            ["Θα μπορούσατε να με βοηθήσετε;", "tha borùsate na me voithìsete", "Potrebbe aiutarmi?"], ["Θα ήθελα να κλείσω ένα τραπέζι.", "tha ìthela na klìso èna trapèzi", "Vorrei prenotare un tavolo."],
            ["Θα προτιμούσα τσάι.", "tha protimùsa tsài", "Preferirei un tè."], ["Θα μπορούσες να έρθεις νωρίτερα;", "tha borùses na èrthis norìtera", "Potresti venire prima?"]
          ]),
          ex("Frasi d'esempio", [
            ["Θα μπορούσατε να μου πείτε πού είναι το μουσείο;", "Potrebbe dirmi dov'è il museo?"], ["Θα μπορούσες να με βοηθήσεις;", "Potresti aiutarmi?"], ["Θα προτιμούσα τσάι.", "Preferirei un tè."],
            ["Θα μπορούσα να έρθω αύριο.", "Potrei venire domani."], ["Θα ήθελα να κλείσω ένα τραπέζι για δύο.", "Vorrei prenotare un tavolo per due."]
          ]),
          note("Per essere cortese al bar o in negozio basta ricordare tre frasi: Θα ήθελα … (Vorrei…), Μπορώ να έχω …; (Posso avere…?), Θα μπορούσατε να …; (Potrebbe…?).", "tip")
        ],
        fills: [
          fill("___ να με βοηθήσετε; (Potrebbe aiutarmi?)", "Θα μπορούσατε", ["Θα μπορούσατε", "Μπορείτε", "Θα μπορούσες", "Μπορούσατε"], "Richiesta formale (voi / Lei): θα μπορούσατε."),
          fill("Εσύ ___ να έρθεις νωρίτερα; (potresti)", "θα μπορούσες", ["θα μπορούσες", "μπορείς", "μπορούσες", "θα μπορούσα"], "Con «tu»: θα μπορούσες."),
          fill("___ τσάι. (Preferirei)", "Θα προτιμούσα", ["Θα προτιμούσα", "Προτιμώ", "Θα ήθελες", "Ήθελα"], "Condizionale di προτιμώ: θα προτιμούσα."),
          fill("Εγώ ___ να έρθω αύριο. (potrei)", "θα μπορούσα", ["θα μπορούσα", "μπορώ", "μπορούσα", "μπορούσατε"], "Con «io»: θα μπορούσα.")
        ]
      },
      {
        id: "m12", part: "Ripasso e dialoghi", title: "Ripasso dei modali e dialoghi",
        intro: [
          "Riepilogo dei modali con la differenza fra i valori simili. Poi due dialoghi di uso quotidiano: al ristorante e per chiedere indicazioni.",
          "Leggili ad alta voce e prova a cambiarli: nuove ordinazioni, nuovi luoghi, nuove richieste."
        ],
        blocks: [
          vocab("Confronti da non confondere", [
            ["Μπορώ να …", "boró na", "Posso / riesco a… (capacità, permesso)"], ["Ξέρω να …", "ksèro na", "So… (abilità appresa)"], ["Θέλω να …", "thèlo na", "Voglio…"],
            ["Πρέπει να …", "prèpi na", "Devo… (obbligo)"], ["Δεν πρέπει να …", "den prèpi na", "Non devo… (divieto)"], ["Δεν χρειάζεται να …", "den hriàzete na", "Non serve… (nessun bisogno)"],
            ["Θα ήθελα να …", "tha ìthela na", "Vorrei… (cortesia)"], ["Θα μπορούσα να …", "tha borùsa na", "Potrei… (cortesia / proposta)"]
          ]),
          dlg("Al ristorante", [
            ["Σερβιτόρος", "Καλησπέρα! Τι θα θέλατε;", "Buonasera! Che cosa desiderate?"],
            ["Πελάτης", "Θα ήθελα μια σαλάτα και ένα νερό, παρακαλώ.", "Vorrei un'insalata e un'acqua, per favore."],
            ["Σερβιτόρος", "Φυσικά! Θέλετε να δείτε και τον κατάλογο των επιδορπίων;", "Certo! Volete vedere anche il menù dei dolci?"],
            ["Πελάτης", "Όχι, ευχαριστώ. Δεν χρειάζεται. Μπορώ να έχω και λίγο ψωμί;", "No, grazie. Non serve. Posso avere anche un po' di pane?"],
            ["Σερβιτόρος", "Βεβαίως, αμέσως!", "Certamente, subito!"]
          ]),
          dlg("Per strada", [
            ["Τουρίστας", "Με συγχωρείτε, μπορείτε να με βοηθήσετε;", "Mi scusi, può aiutarmi?"],
            ["Περαστικός", "Βεβαίως! Τι θέλετε;", "Certo! Che cosa desidera?"],
            ["Τουρίστας", "Θέλω να πάω στο μουσείο. Πρέπει να πάρω λεωφορείο;", "Voglio andare al museo. Devo prendere l'autobus?"],
            ["Περαστικός", "Όχι, δεν χρειάζεται. Μπορείτε να πάτε με τα πόδια. Θέλει δέκα λεπτά.", "No, non serve. Può andare a piedi. Ci vogliono dieci minuti."],
            ["Τουρίστας", "Ευχαριστώ πολύ!", "Grazie mille!"]
          ])
        ],
        fills: [
          fill("___ να κολυμπάω. (So)", "Ξέρω", ["Ξέρω", "Μπορώ", "Πρέπει", "Χρειάζεται"], "Un'abilità imparata: ξέρω να."),
          fill("Δεν ___ να βιαστείς. (Non serve)", "χρειάζεται", ["χρειάζεται", "πρέπει", "ξέρει", "θέλω"], "Nessun bisogno: δεν χρειάζεται να."),
          fill("Δεν ___ να καπνίζεις εδώ. (Non devi)", "πρέπει", ["πρέπει", "χρειάζεται", "θέλω", "ξέρω"], "Divieto: δεν πρέπει να."),
          fill("___ να έχω και λίγο ψωμί; (Posso)", "Μπορώ", ["Μπορώ", "Ξέρω", "Πρέπει", "Χρειάζομαι"], "Richiesta: μπορώ να έχω;")
        ]
      }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
