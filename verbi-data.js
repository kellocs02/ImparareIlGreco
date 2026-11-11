// VERBI FONDAMENTALI — contenuti: base comune + sezione «Il verbo essere (είμαι)».
// Le altre sezioni stanno in verbi-data-avere.js e verbi-data-modali.js e si aggiungono a VerbiData.sections.
//
// Struttura di una lezione:
//   id, part (gruppo nell'elenco), title, intro[] (paragrafi),
//   blocks[]: { k:"table"|"ex"|"note"|"dlg", ... }
//   fills[]:  esercizi a scelta scritti a mano { q, a, o[], why }
// Gli altri esercizi si generano da tabelle e frasi d'esempio (vedi verbi.js).
(function (root) {
  const D = root.VerbiData = root.VerbiData || { sections: [] };
  // tabella di coniugazione: righe [persona, forma, pronuncia, italiano]
  D.conj = (title, rows, head) => ({ k: "table", kind: "conj", title, head: head || ["Persona", "Greco", "Pronuncia", "Italiano"], rows });
  // tabella di vocaboli: righe [greco, pronuncia, italiano]
  D.vocab = (title, rows, head) => ({ k: "table", kind: "vocab", title, head: head || ["Greco", "Pronuncia", "Italiano"], rows });
  D.ex = (title, items) => ({ k: "ex", title, items });
  D.note = (text, tone) => ({ k: "note", text, tone: tone || "" });
  D.dlg = (title, lines) => ({ k: "dlg", title, lines });
  D.fill = (q, a, o, why) => ({ q, a, o, why });
  const { conj, vocab, ex, note, dlg, fill } = D;
  const P6 = ["εγώ", "εσύ", "αυτός / αυτή / αυτό", "εμείς", "εσείς", "αυτοί / αυτές / αυτά"];

  D.sections.push({
    id: "eimai", n: 1, title: "Το ρήμα «είμαι»", it: "Il verbo essere",
    sub: "Presente, negazione, domande, usi, passato e futuro",
    intro: "«Είμαι» è il verbo più importante del greco: serve per dire chi sei, da dove vieni, come stai e dove ti trovi. È irregolare, quindi va imparato bene a memoria. Sette lezioni dal presente fino al passato e al futuro.",
    lessons: [
      {
        id: "e1", part: "Presente", title: "Il presente di είμαι",
        intro: [
          "«Είμαι» significa «essere». In greco il pronome soggetto di solito si omette: la desinenza dice già chi parla (Είμαι κουρασμένος = «Sono stanco»). I pronomi si usano per dare enfasi o contrasto: Εγώ είμαι από την Ιταλία, εσύ από πού είσαι;",
          "Pronuncia utile: ει = i (είμαι si legge «ìme»), αι = e, ου = u. L'accento scritto (ά, έ, ή, ί, ό, ύ, ώ) indica la sillaba su cui cade la voce."
        ],
        blocks: [
          conj("είμαι · presente", [
            [P6[0], "είμαι", "ìme", "io sono"], [P6[1], "είσαι", "ìse", "tu sei"], [P6[2], "είναι", "ìne", "lui / lei è"],
            [P6[3], "είμαστε", "ìmaste", "noi siamo"], [P6[4], "είστε", "ìste", "voi siete / Lei è"], [P6[5], "είναι", "ìne", "loro sono"]
          ]),
          note("«Είναι» vale sia per la terza persona singolare (lui è) sia per la terza plurale (loro sono): si capisce dal soggetto. Al posto di «είστε» si sente anche «είσαστε»."),
          note("«Εσείς» è il «voi», ma è anche il «Lei» di cortesia: a una persona che non conosci dai del «voi»: Είστε ο κύριος Ρόσι;", "tip"),
          ex("Frasi d'esempio", [
            ["Είμαι ο Γιώργος.", "Sono Giorgio."], ["Είσαι έτοιμη;", "Sei pronta?"], ["Η Μαρία είναι εδώ.", "Maria è qui."],
            ["Είμαστε φίλοι.", "Siamo amici."], ["Είστε Έλληνες;", "Siete greci?"], ["Οι γονείς μου είναι στο σπίτι.", "I miei genitori sono a casa."]
          ])
        ],
        fills: [
          fill("Εγώ ___ φοιτητής.", "είμαι", ["είμαι", "είσαι", "είναι", "είμαστε"], "Con «εγώ» (io) il verbo è είμαι."),
          fill("Εσείς ___ από την Ελλάδα;", "είστε", ["είσαι", "είστε", "είμαστε", "είναι"], "«Εσείς» (voi / Lei) vuole είστε."),
          fill("Εμείς ___ στο σπίτι.", "είμαστε", ["είμαι", "είστε", "είμαστε", "είσαι"], "«Εμείς» (noi) vuole είμαστε."),
          fill("Η Άννα ___ δασκάλα.", "είναι", ["είμαι", "είναι", "είσαι", "είστε"], "Terza persona singolare: είναι.")
        ]
      },
      {
        id: "e2", part: "Negazione e domande", title: "Negare e domandare",
        intro: [
          "Per negare si mette «δεν» davanti al verbo: Δεν είμαι κουρασμένος. Il «δεν» sta sempre attaccato al verbo.",
          "Per fare una domanda non cambia l'ordine delle parole: basta l'intonazione. Il punto interrogativo greco è il punto e virgola: Είσαι έτοιμος;"
        ],
        blocks: [
          conj("δεν είμαι · forma negativa", [
            [P6[0], "δεν είμαι", "den ìme", "io non sono"], [P6[1], "δεν είσαι", "den ìse", "tu non sei"], [P6[2], "δεν είναι", "den ìne", "lui / lei non è"],
            [P6[3], "δεν είμαστε", "den ìmaste", "noi non siamo"], [P6[4], "δεν είστε", "den ìste", "voi non siete"], [P6[5], "δεν είναι", "den ìne", "loro non sono"]
          ]),
          vocab("Parole interrogative", [
            ["Ποιος / Ποια / Ποιο", "piòs / pià / piò", "Chi / quale"], ["Πού", "pu", "Dove"], ["Τι", "ti", "Che cosa"], ["Πώς", "pos", "Come"],
            ["Από πού", "apò pu", "Di dove"], ["Πόσο", "pòso", "Quanto"], ["Γιατί", "yatì", "Perché"]
          ]),
          ex("Domande e risposte", [
            ["Είσαι κουρασμένος;", "Sei stanco?"], ["Ναι, είμαι κουρασμένος.", "Sì, sono stanco."], ["Όχι, δεν είμαι κουρασμένος.", "No, non sono stanco."],
            ["Πού είσαι;", "Dove sei?"], ["Είμαι στο σπίτι.", "Sono a casa."], ["Τι είναι αυτό;", "Che cos'è questo?"],
            ["Από πού είστε;", "Di dove siete?"], ["Ποιος είναι αυτός;", "Chi è lui?"], ["Πώς είσαι;", "Come stai?"], ["Είμαι καλά, ευχαριστώ.", "Sto bene, grazie."]
          ]),
          note("Risposta breve: «Ναι, είμαι.» / «Όχι, δεν είμαι.» Il verbo si ripete, come in «Sì, lo sono». «Ποιος» cambia col genere: Ποια είναι αυτή; (Chi è lei?), Ποιο είναι αυτό; (Qual è questo?)", "tip")
        ],
        fills: [
          fill("Εγώ ___ είμαι Έλληνας.", "δεν", ["δεν", "όχι", "μη", "ναι"], "La negazione del verbo è «δεν» e sta subito prima del verbo."),
          fill("___ είσαι; – Είμαι στο σπίτι.", "Πού", ["Πού", "Τι", "Ποιος", "Γιατί"], "La risposta indica un luogo, quindi la domanda è «Πού» (dove)."),
          fill("Από ___ είστε; – Από την Ιταλία.", "πού", ["πού", "ποιος", "τι", "πώς"], "«Από πού» = «di dove», risposta con un paese."),
          fill("___ είναι αυτός; – Είναι ο Νίκος.", "Ποιος", ["Ποιος", "Πού", "Πώς", "Πόσο"], "Si chiede una persona maschile: «Ποιος» (chi).")
        ]
      },
      {
        id: "e3", part: "Usi", title: "Identità, origine, professione ed età",
        intro: [
          "Con «είμαι» si dice chi si è: nome, nazionalità, professione. Dopo «είμαι» la professione non vuole l'articolo: Είμαι γιατρός (non «Είμαι ο γιατρός» se vuoi solo dire il tuo mestiere).",
          "Attenzione all'età: in greco non si «ha» un'età come in italiano, si «è di tanti anni». Si dice Είμαι είκοσι πέντε χρονών e NON «έχω είκοσι πέντε χρόνια»."
        ],
        blocks: [
          vocab("Nazionalità (maschile – femminile)", [
            ["Ιταλός – Ιταλίδα", "italòs – italìda", "italiano – italiana"], ["Έλληνας – Ελληνίδα", "èlinas – elinìda", "greco – greca"],
            ["Γάλλος – Γαλλίδα", "gàlos – galìda", "francese (m/f)"], ["Άγγλος – Αγγλίδα", "àglos – aglìda", "inglese (m/f)"],
            ["Γερμανός – Γερμανίδα", "yermanòs – yermanìda", "tedesco – tedesca"], ["Ισπανός – Ισπανίδα", "ispanòs – ispanìda", "spagnolo – spagnola"]
          ]),
          vocab("Professioni", [
            ["φοιτητής – φοιτήτρια", "fitìtis – fitìtria", "studente – studentessa"], ["δάσκαλος – δασκάλα", "dàskalos – daskàla", "maestro – maestra"],
            ["γιατρός", "yatròs", "medico (m/f)"], ["μηχανικός", "mihanikòs", "ingegnere (m/f)"],
            ["προγραμματιστής – προγραμματίστρια", "programatistìs – programatìstria", "programmatore – programmatrice"], ["πληροφορικός", "pliroforikòs", "informatico (m/f)"]
          ]),
          ex("Frasi d'esempio", [
            ["Είμαι Ιταλός.", "Sono italiano."], ["Η Ελένη είναι Ελληνίδα.", "Eleni è greca."], ["Είμαι από τη Σικελία.", "Vengo dalla Sicilia."],
            ["Είμαι φοιτητής πληροφορικής.", "Sono studente di informatica."], ["Η αδελφή μου είναι γιατρός.", "Mia sorella è medico."],
            ["Είμαι είκοσι πέντε χρονών.", "Ho venticinque anni."], ["Πόσο χρονών είσαι;", "Quanti anni hai?"]
          ]),
          note("«Είμαι από + accusativo» indica l'origine: από την Ιταλία (dall'Italia), από τη Σικελία (dalla Sicilia), από το Μιλάνο (da Milano). Per l'età si può dire anche «Πόσων χρονών είσαι;».", "tip")
        ],
        fills: [
          fill("Είμαι είκοσι πέντε ___.", "χρονών", ["χρονών", "χρόνια έχω", "έχω", "ετών έχω"], "L'età si dice con είμαι + «χρονών», non con «έχω»."),
          fill("Η Μαρία ___ γιατρός.", "είναι", ["είμαι", "είναι", "έχει", "είσαι"], "Si descrive una professione: είναι."),
          fill("Είμαι ___ τη Σικελία.", "από", ["από", "σε", "για", "με"], "L'origine si indica con «από»."),
          fill("Ο Νίκος είναι ___ (italiano).", "Ιταλός", ["Ιταλός", "Ιταλίδα", "Ιταλοί", "Ιταλικός"], "Soggetto maschile singolare: Ιταλός.")
        ]
      },
      {
        id: "e4", part: "Usi", title: "Stati, luoghi e tempo con είμαι",
        intro: [
          "Con «είμαι» si dicono anche gli stati (stanco, contento), il luogo dove ci si trova e l'ora. Gli aggettivi concordano col soggetto: κουρασμένος (m), κουρασμένη (f), κουρασμένο (n); al plurale κουρασμένοι, κουρασμένες, κουρασμένα.",
          "Per il luogo si usa «σε» che con l'articolo si fonde: σε + το = στο, σε + τη(ν) = στη(ν), σε + τον = στον."
        ],
        blocks: [
          vocab("Aggettivi di stato (maschile / femminile / neutro)", [
            ["κουρασμένος / -η / -ο", "kurazmènos", "stanco"], ["χαρούμενος / -η / -ο", "harùmenos", "contento"], ["έτοιμος / -η / -ο", "ètimos", "pronto"],
            ["λυπημένος / -η / -ο", "lipimènos", "triste"], ["καλός / -ή / -ό", "kalòs", "buono / bravo"], ["σίγουρος / -η / -ο", "sìguros", "sicuro"]
          ]),
          ex("Luoghi", [
            ["Είμαι στο σπίτι.", "Sono a casa."], ["Είμαι στη δουλειά.", "Sono al lavoro."], ["Είμαστε στην Ελλάδα.", "Siamo in Grecia."],
            ["Ο Νίκος είναι στον σταθμό.", "Nikos è alla stazione."], ["Πού είναι το μουσείο;", "Dov'è il museo?"]
          ]),
          ex("Tempo", [
            ["Τι ώρα είναι;", "Che ora è?"], ["Είναι μία.", "È l'una."], ["Είναι τρεις και μισή.", "Sono le tre e mezza."],
            ["Σήμερα είναι Τετάρτη.", "Oggi è mercoledì."], ["Είναι Νοέμβριος.", "È novembre."]
          ]),
          ex("Stati", [
            ["Είμαι κουρασμένος σήμερα.", "Oggi sono stanco."], ["Η Ελένη είναι χαρούμενη.", "Eleni è contenta."], ["Είμαστε έτοιμοι.", "Siamo pronti."],
            ["Δεν είμαι σίγουρος.", "Non sono sicuro."]
          ]),
          note("L'ora: «Είναι μία» (singolare, l'una) ma «Είναι δύο, τρεις, τέσσερις…» (plurale). Giorni e mesi non vogliono l'articolo dopo «είναι»: Είναι Δευτέρα, Είναι Μάιος.", "tip")
        ],
        fills: [
          fill("Η Μαρία είναι ___ (stanca).", "κουρασμένη", ["κουρασμένος", "κουρασμένη", "κουρασμένο", "κουρασμένοι"], "Soggetto femminile → κουρασμένη."),
          fill("Είμαι ___ σπίτι. (a casa)", "στο", ["στο", "στη", "στον", "από"], "«Σπίτι» è neutro: σε + το = στο."),
          fill("Είμαστε ___ Ελλάδα. (in Grecia)", "στην", ["στο", "στην", "στον", "από"], "«Ελλάδα» è femminile: σε + την = στην."),
          fill("Σήμερα ___ Τετάρτη.", "είναι", ["είμαι", "είναι", "είσαι", "είμαστε"], "Giorni e ore si dicono con la terza persona: είναι.")
        ]
      },
      {
        id: "e5", part: "Passato e futuro", title: "Il passato: ήμουν",
        intro: [
          "Il passato di «είμαι» (era, ero) si usa per descrivere come eri, dove eri o com'era qualcosa: Χθες ήμουν στο σπίτι. Ήταν ωραία! È una forma sola, senza distinzione fra «fui» e «ero».",
          "Attenzione: «ήταν» vale sia per la terza persona singolare (lui era) sia per la terza plurale (loro erano)."
        ],
        blocks: [
          conj("ήμουν · passato", [
            [P6[0], "ήμουν", "ìmun", "io ero"], [P6[1], "ήσουν", "ìsun", "tu eri"], [P6[2], "ήταν", "ìtan", "lui / lei era"],
            [P6[3], "ήμασταν", "ìmastan", "noi eravamo"], [P6[4], "ήσασταν", "ìsastan", "voi eravate"], [P6[5], "ήταν", "ìtan", "loro erano"]
          ]),
          ex("Frasi d'esempio", [
            ["Χθες ήμουν στο σπίτι.", "Ieri ero a casa."], ["Πού ήσουν;", "Dove eri?"], ["Ήταν ωραία!", "Era bello!"],
            ["Ήμασταν κουρασμένοι.", "Eravamo stanchi."], ["Οι φίλοι μου ήταν εδώ.", "I miei amici erano qui."], ["Ήσασταν στην Αθήνα;", "Eravate ad Atene?"]
          ]),
          note("Parole utili per il passato: χθες (ieri), πέρυσι (l'anno scorso), πριν (prima), τότε (allora), την Κυριακή (domenica scorsa).", "tip")
        ],
        fills: [
          fill("Χθες ___ στο σπίτι. (io)", "ήμουν", ["ήμουν", "ήσουν", "ήταν", "ήμασταν"], "Con «io» il passato è ήμουν."),
          fill("Πού ___ χθες; (tu)", "ήσουν", ["ήμουν", "ήσουν", "ήταν", "ήσασταν"], "Con «tu» il passato è ήσουν."),
          fill("Οι φίλοι μου ___ εδώ.", "ήταν", ["ήταν", "ήμουν", "ήσουν", "ήμασταν"], "Anche con la terza persona plurale si usa ήταν."),
          fill("Εμείς ___ στην Ελλάδα το καλοκαίρι.", "ήμασταν", ["ήμασταν", "ήμουν", "ήταν", "ήσασταν"], "«Εμείς» → ήμασταν.")
        ]
      },
      {
        id: "e6", part: "Passato e futuro", title: "Il futuro: θα είμαι",
        intro: [
          "Il futuro si forma con la particella «θα» seguita dal verbo al presente: θα είμαι, θα είσαι, θα είναι… Non cambia nient'altro.",
          "Con «θα» si può anche fare una supposizione sul presente: Θα είναι στο γραφείο = «Sarà in ufficio» (probabilmente è in ufficio)."
        ],
        blocks: [
          conj("θα είμαι · futuro", [
            [P6[0], "θα είμαι", "tha ìme", "io sarò"], [P6[1], "θα είσαι", "tha ìse", "tu sarai"], [P6[2], "θα είναι", "tha ìne", "lui / lei sarà"],
            [P6[3], "θα είμαστε", "tha ìmaste", "noi saremo"], [P6[4], "θα είστε", "tha ìste", "voi sarete"], [P6[5], "θα είναι", "tha ìne", "loro saranno"]
          ]),
          ex("Frasi d'esempio", [
            ["Αύριο θα είμαι στη δουλειά.", "Domani sarò al lavoro."], ["Θα είσαι εκεί;", "Ci sarai?"], ["Θα είναι ωραία.", "Sarà bello."],
            ["Θα είμαστε στο σπίτι στις οκτώ.", "Saremo a casa alle otto."], ["Δεν θα είμαι εδώ τη Δευτέρα.", "Lunedì non sarò qui."],
            ["Θα είναι στο γραφείο.", "Sarà (probabilmente è) in ufficio."]
          ]),
          note("Negazione del futuro: «δεν θα + verbo». Parole utili: αύριο (domani), μεθαύριο (dopodomani), του χρόνου (l'anno prossimo), σύντομα (presto), αργότερα (più tardi).", "tip")
        ],
        fills: [
          fill("Αύριο ___ στη δουλειά. (io)", "θα είμαι", ["θα είμαι", "ήμουν", "είμαι", "θα ήμουν"], "Il futuro si fa con «θα» + presente: θα είμαι."),
          fill("___ στο σπίτι το βράδυ; (voi)", "Θα είστε", ["Θα είστε", "Ήσασταν", "Είστε", "Θα είσαι"], "Voi → θα είστε."),
          fill("Δεν ___ εδώ τη Δευτέρα. (io)", "θα είμαι", ["θα είμαι", "είμαι", "ήμουν", "θα είσαι"], "Si mette «δεν» prima di «θα»: δεν θα είμαι."),
          fill("Αύριο ___ ωραία! (sarà)", "θα είναι", ["θα είναι", "ήταν", "είναι", "θα είμαι"], "Terza persona: θα είναι.")
        ]
      },
      {
        id: "e7", part: "Espressioni e dialoghi", title: "Espressioni con είμαι e dialogo",
        intro: [
          "Alcune espressioni con «είμαι» sono molto frequenti nella conversazione di ogni giorno. Imparale come blocchi unici.",
          "In fondo trovi un breve dialogo di presentazione: leggilo ad alta voce e poi prova a riscriverlo cambiando nomi e città."
        ],
        blocks: [
          vocab("Espressioni utili", [
            ["Είμαι καλά.", "ìme kalà", "Sto bene."], ["Είμαι μια χαρά.", "ìme mia hará", "Sto benissimo."], ["Είμαι έτοιμος / έτοιμη.", "ìme ètimos", "Sono pronto / pronta."],
            ["Είμαι εδώ.", "ìme edò", "Sono qui."], ["Δεν είμαι σίγουρος.", "den ìme sìguros", "Non sono sicuro."], ["Είναι δικό μου.", "ìne dikò mu", "È mio."],
            ["Είναι αλήθεια.", "ìne alìthia", "È vero."], ["Να είσαι καλά!", "na ìse kalà", "Stammi bene! / Grazie, stai bene!"]
          ]),
          dlg("Presentazioni", [
            ["Μαρία", "Γεια σου! Είσαι ο Νίκος;", "Ciao! Sei Nikos?"],
            ["Νίκος", "Ναι, εγώ είμαι. Εσύ είσαι η Μαρία;", "Sì, sono io. Tu sei Maria?"],
            ["Μαρία", "Ναι. Χαίρω πολύ! Από πού είσαι;", "Sì. Piacere! Di dove sei?"],
            ["Νίκος", "Είμαι από την Αθήνα, αλλά τώρα είμαι στη Θεσσαλονίκη για δουλειά.", "Sono di Atene, ma ora sono a Salonicco per lavoro."],
            ["Μαρία", "Πόσο χρονών είσαι;", "Quanti anni hai?"],
            ["Νίκος", "Είμαι τριάντα χρονών. Εσύ;", "Ho trent'anni. E tu?"],
            ["Μαρία", "Είμαι είκοσι οκτώ. Είμαι φοιτήτρια.", "Ho ventotto anni. Sono studentessa."]
          ])
        ],
        fills: [
          fill("Πώς είσαι; – ___ μια χαρά!", "Είμαι", ["Είμαι", "Είσαι", "Είναι", "Έχω"], "Rispondi in prima persona: Είμαι μια χαρά."),
          fill("Είσαι σίγουρος; – Όχι, ___ είμαι σίγουρος.", "δεν", ["δεν", "όχι", "ναι", "μην"], "Negazione davanti al verbo: δεν είμαι."),
          fill("Ο Νίκος είναι ___ την Αθήνα.", "από", ["από", "στο", "με", "για"], "Origine: από + accusativo."),
          fill("Η Μαρία είναι ___.", "φοιτήτρια", ["φοιτήτρια", "φοιτητής", "φοιτητές", "φοιτήτριες"], "Soggetto femminile singolare: φοιτήτρια.")
        ]
      }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
