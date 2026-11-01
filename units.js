// Unità del percorso: ogni livello (stesso ordine di LEVELS) è diviso in unità da studiare e testare.
// Una unità è fatta di una o più "parti" di sezioni di lessons.js. Per cambiare i raggruppamenti basta
// modificare questa tabella: lessons.js non si tocca.
//   part(a, b)            -> tutta la sezione b del livello a (a e b contano da 0)
//   part(a, b, da, fino)  -> solo le righe da..fino (come slice) di quella sezione
//   unit(id, titolo, ...parti)
// Gli id delle unità sono la chiave dei progressi salvati: una volta scelto non cambiarlo.
const part = (a, b, from, to) => ({ a, b, from, to });
const unit = (id, t, ...parts) => ({ id, t, parts });

const UNITS = [
  [ // Livello 1: alfabeto, saluti, numeri, prime parole
    unit("l1-alfa1", "Alfabeto: prime parole", part(0, 0, 0, 12)),
    unit("l1-alfa2", "Alfabeto: altre parole", part(0, 0, 12)),
    unit("l1-suoni1", "Suoni speciali (1)", part(0, 1, 0, 10)),
    unit("l1-suoni2", "Suoni speciali (2)", part(0, 1, 10)),
    unit("l1-amiche", "Parole amiche", part(0, 2)),
    unit("l1-saluti", "Saluti e cortesia", part(0, 3)),
    unit("l1-num", "Numeri da 1 a 10", part(0, 5)),
    unit("l1-persone", "Persone e famiglia", part(0, 6)),
    unit("l1-cose", "Cose di ogni giorno", part(0, 7)),
    unit("l1-present", "Presentarsi", part(0, 4), part(0, 8), part(0, 9))
  ],
  [ // Livello 2: verbi, «mi piace», plurali, giorni, al bar
    unit("l2-omega", "Verbi in -ω", part(1, 0)),
    unit("l2-aw", "Verbi in -άω", part(1, 1)),
    unit("l2-lingue", "Le lingue e altre parole utili", part(1, 2), part(1, 5)),
    unit("l2-piace", "Mi piace e dire di no", part(1, 3), part(1, 4)),
    unit("l2-plurali", "I plurali", part(1, 6)),
    unit("l2-giorni", "Giorni della settimana", part(1, 7)),
    unit("l2-num", "Numeri da 11 a 20", part(1, 8)),
    unit("l2-cibo", "Cibo e bevande", part(1, 10)),
    unit("l2-bar", "Al bar e al ristorante", part(1, 9), part(1, 11))
  ],
  [ // Livello 3: passato e futuro, accusativo, indicazioni, ora e tempo
    unit("l3-passato", "Il passato", part(2, 0), part(2, 1)),
    unit("l3-futuro", "Il futuro con θα", part(2, 2), part(2, 3)),
    unit("l3-acc", "Accusativo e preposizioni", part(2, 4), part(2, 5)),
    unit("l3-se", "σε + articolo e πάω", part(2, 6), part(2, 7)),
    unit("l3-luoghi", "Luoghi", part(2, 8)),
    unit("l3-direz", "Direzioni e chiedere la strada", part(2, 9), part(2, 10)),
    unit("l3-ora", "L'ora", part(2, 11)),
    unit("l3-minuti", "Minuti e momenti della giornata", part(2, 12)),
    unit("l3-tempo", "Che tempo fa?", part(2, 13, 0, 9)),
    unit("l3-stagioni", "Le stagioni", part(2, 13, 9))
  ],
  [ // Livello 4: possesso, famiglia, aggettivi, colori, domande
    unit("l4-possesso", "Il possesso", part(3, 0)),
    unit("l4-famiglia", "La famiglia", part(3, 2)),
    unit("l4-num", "Numeri da 20 a 100", part(3, 3)),
    unit("l4-agg", "Gli aggettivi", part(3, 4), part(3, 5)),
    unit("l4-colori", "I colori", part(3, 6)),
    unit("l4-descr", "Descrivere persone e stati d'animo", part(3, 7)),
    unit("l4-domande", "Le parole interrogative", part(3, 8)),
    unit("l4-accpl", "L'accusativo plurale", part(3, 9)),
    unit("l4-present", "Presentarsi meglio", part(3, 1), part(3, 10))
  ],
  [ // Livello 5: i tempi verbali
    unit("l5-tempi", "I tempi in breve", part(4, 0), part(4, 1)),
    unit("l5-imperf", "Imperfetto o aoristo?", part(4, 2), part(4, 3)),
    unit("l5-futuro", "Il futuro: continuo e semplice", part(4, 4)),
    unit("l5-perfetto", "Il perfetto", part(4, 5)),
    unit("l5-parole", "Parole del tempo", part(4, 6)),
    unit("l5-frasi", "Frasi con tutti i tempi", part(4, 7), part(4, 8))
  ]
];
