// Contenuti dell'app: alfabeto, digrammi e vocaboli per categoria.
const ALPHABET = [
  ["Α","α","άλφα","a come “casa”"],
  ["Β","β","βήτα","v come “vino”"],
  ["Γ","γ","γάμμα","suono gutturale morbido (come una “g” sfregata); davanti a e/i come “i” di “ieri”"],
  ["Δ","δ","δέλτα","come “th” inglese in “the”"],
  ["Ε","ε","έψιλον","e come “pesca”"],
  ["Ζ","ζ","ζήτα","z sonora come in “rosa”"],
  ["Η","η","ήτα","i come “vita”"],
  ["Θ","θ","θήτα","come “th” inglese in “think”"],
  ["Ι","ι","γιώτα","i come “vita”"],
  ["Κ","κ","κάπα","k come “casa”"],
  ["Λ","λ","λάμδα","l come “luna”"],
  ["Μ","μ","μι","m come “mela”"],
  ["Ν","ν","νι","n come “naso”"],
  ["Ξ","ξ","ξι","ks come “taxi”"],
  ["Ο","ο","όμικρον","o come “sole”"],
  ["Π","π","πι","p come “pane”"],
  ["Ρ","ρ","ρο","r vibrata come “rosa”"],
  ["Σ","σ / ς","σίγμα","s come “sole” (ς a fine parola)"],
  ["Τ","τ","ταυ","t come “tavolo”"],
  ["Υ","υ","ύψιλον","i come “vita”"],
  ["Φ","φ","φι","f come “fiore”"],
  ["Χ","χ","χι","h aspirata (come “ch” tedesca in “Bach”)"],
  ["Ψ","ψ","ψι","ps come “capsula”"],
  ["Ω","ω","ωμέγα","o come “sole”"]
];

const DIGRAPHS = [
  ["ει","i","come “vita”"],
  ["οι","i","come “vita”"],
  ["αι","e","come “pesca”"],
  ["ου","u","come “luna”"],
  ["μπ","b","a inizio parola (μπαμπάς = babás)"],
  ["ντ","d","a inizio parola (ντομάτα = domáta)"],
  ["γκ","g","come “gatto” a inizio parola"],
  ["τσ","ts","come “zio”"],
  ["τζ","dz","come “zero”"]
];

// [greco, pronuncia, italiano]
const CATS = [
  { id: "saluti", nome: "Saluti", emoji: "👋", words: [
    ["Γεια σου","ya su","ciao"],
    ["Καλημέρα","kaliméra","buongiorno"],
    ["Καλησπέρα","kalispéra","buonasera"],
    ["Καληνύχτα","kaliníchta","buonanotte"],
    ["Ευχαριστώ","efcharistó","grazie"],
    ["Παρακαλώ","parakaló","prego / per favore"],
    ["Συγγνώμη","signómi","scusa"],
    ["Ναι","ne","sì"],
    ["Όχι","óchi","no"],
    ["Αντίο","adío","arrivederci"],
    ["Καλά","kalá","bene"],
    ["Χαίρω πολύ","chéro polí","piacere"]
  ]},
  { id: "numeri", nome: "Numeri", emoji: "🔢", words: [
    ["ένα","éna","uno"],
    ["δύο","dío","due"],
    ["τρία","tría","tre"],
    ["τέσσερα","téssera","quattro"],
    ["πέντε","pénde","cinque"],
    ["έξι","éksi","sei"],
    ["εφτά","eftá","sette"],
    ["οχτώ","ochtó","otto"],
    ["εννιά","enniá","nove"],
    ["δέκα","déka","dieci"],
    ["είκοσι","íkosi","venti"],
    ["εκατό","ekató","cento"]
  ]},
  { id: "cibo", nome: "Cibo e bevande", emoji: "🍽️", words: [
    ["νερό","neró","acqua"],
    ["ψωμί","psomí","pane"],
    ["τυρί","tirí","formaggio"],
    ["κρέας","kréas","carne"],
    ["ψάρι","psári","pesce"],
    ["μήλο","mílo","mela"],
    ["καφές","kafés","caffè"],
    ["κρασί","krasí","vino"],
    ["γάλα","gála","latte"],
    ["αυγό","avgó","uovo"],
    ["ελιά","eliá","oliva"],
    ["σαλάτα","saláta","insalata"]
  ]},
  { id: "famiglia", nome: "Famiglia", emoji: "👪", words: [
    ["μαμά","mamá","mamma"],
    ["μπαμπάς","babás","papà"],
    ["αδελφός","adelfós","fratello"],
    ["αδελφή","adelfí","sorella"],
    ["παιδί","pedí","bambino / figlio"],
    ["φίλος","fílos","amico"],
    ["γιαγιά","yiayá","nonna"],
    ["παππούς","papús","nonno"]
  ]},
  { id: "viaggi", nome: "Viaggi", emoji: "✈️", words: [
    ["Πού είναι…;","pu íne","dov'è…?"],
    ["ξενοδοχείο","ksenodochío","hotel"],
    ["αεροπλάνο","aeropláno","aereo"],
    ["δρόμος","drómos","strada"],
    ["παραλία","paralía","spiaggia"],
    ["εισιτήριο","isitírio","biglietto"],
    ["πόλη","póli","città"],
    ["λιμάνι","limáni","porto"],
    ["στάση","stási","fermata"]
  ]},
  { id: "verbi", nome: "Verbi base", emoji: "🏃", words: [
    ["είμαι","íme","sono"],
    ["έχω","écho","ho"],
    ["θέλω","thélo","voglio"],
    ["πηγαίνω","pigéno","vado"],
    ["τρώω","tróo","mangio"],
    ["πίνω","píno","bevo"],
    ["μιλάω","miláo","parlo"],
    ["καταλαβαίνω","katalavéno","capisco"],
    ["αγαπώ","agapó","amo"],
    ["βλέπω","vlépo","vedo"],
    ["ξέρω","kséro","so"],
    ["μένω","méno","abito / resto"]
  ]},
  { id: "colori", nome: "Colori", emoji: "🎨", words: [
    ["κόκκινο","kókkino","rosso"],
    ["μπλε","ble","blu"],
    ["πράσινο","prásino","verde"],
    ["κίτρινο","kítrino","giallo"],
    ["άσπρο","áspro","bianco"],
    ["μαύρο","mávro","nero"]
  ]},
  { id: "frasi", nome: "Frasi utili", emoji: "💬", words: [
    ["Δεν καταλαβαίνω","den katalavéno","non capisco"],
    ["Μιλάτε αγγλικά;","miláte angliká","parla inglese?"],
    ["Πόσο κάνει;","póso káni","quanto costa?"],
    ["Με λένε…","me léne","mi chiamo…"],
    ["Είμαι από την Ιταλία","íme apó tin Italía","sono italiano/a"],
    ["Τον λογαριασμό, παρακαλώ","ton logariazmó parakaló","il conto, per favore"],
    ["Μιλάω λίγα ελληνικά","miláo lígha elliniká","parlo poco greco"],
    ["Πώς είσαι;","pos íse","come stai?"]
  ]}
];

// Esempi per i gruppi di lettere e letture brevi: tenuti qui (non in leggere.js/letture.js) perché
// genera_lista.js legge solo data.js e lessons.js per sapere quali testi devono avere un audio.
const DIGRAPH_EX = ["είμαι", "πλοίο", "και", "πού", "μπαμπάς", "ντομάτα", "γκολ", "τσάι", "τζάκι"];

const READINGS = [
    { t: "Presentarsi", s: [["Γεια σου! Με λένε Νίκος.", "Ciao! Mi chiamo Nikos."], ["Είμαι από την Ιταλία.", "Sono dall'Italia."], ["Έχω μια μαμά και έναν μπαμπά.", "Ho una mamma e un papà."], ["Πίνω νερό και τρώω ψωμί.", "Bevo acqua e mangio pane."]],
      g: "Γεια σου|ya su|ciao;Με λένε|me léne|mi chiamo;Είμαι|íme|sono;από|apó|da;την|tin|la;Ιταλία|Italía|Italia;Έχω|écho|ho;μια|mia|una;μαμά|mamá|mamma;και|ke|e;έναν|énan|un;μπαμπά|babá|papà;Πίνω|píno|bevo;νερό|neró|acqua;τρώω|tróo|mangio;ψωμί|psomí|pane" },
    { t: "Al bar", s: [["Καλησπέρα! Θέλω έναν καφέ, παρακαλώ.", "Buonasera! Voglio un caffè, per favore."], ["Μου αρέσει ο καφές με γάλα.", "Mi piace il caffè con latte."], ["Δεν μου αρέσει το τσάι.", "Non mi piace il tè."], ["Το Σάββατο πίνω καφέ με τους φίλους μου.", "Il sabato bevo il caffè con i miei amici."]],
      g: "Καλησπέρα|kalispéra|buonasera;Θέλω|thélo|voglio;έναν|énan|un;καφέ|kafé|caffè;παρακαλώ|parakaló|per favore;Μου αρέσει|mu arési|mi piace;ο|o|il;καφές|kafés|caffè;με|me|con;γάλα|gála|latte;Δεν|den|non;το|to|il;τσάι|tsái|tè;Σάββατο|Sávvato|sabato;πίνω|píno|bevo;τους|tus|i;φίλους|fílus|amici;μου|mu|miei" },
    { t: "Ieri e domani", s: [["Χθες πήγα στο λιμάνι.", "Ieri sono andato al porto."], ["Είδα ένα μεγάλο πλοίο.", "Ho visto una grande nave."], ["Αύριο θα πάω στην παραλία.", "Domani andrò in spiaggia."], ["Θα φάω ψάρι και θα πιω κρασί.", "Mangerò pesce e berrò vino."]],
      g: "Χθες|chtes|ieri;πήγα|píga|sono andato;στο|sto|al;λιμάνι|limáni|porto;Είδα|ída|ho visto;ένα|éna|un;μεγάλο|megálo|grande;πλοίο|plío|nave;Αύριο|ávrio|domani;θα|tha|(futuro);πάω|páo|vado;στην|stin|alla;παραλία|paralía|spiaggia;φάω|fáo|mangiare (dopo θα);ψάρι|psári|pesce;και|ke|e;πιω|pio|bere (dopo θα);κρασί|krasí|vino" },
    { t: "La mia famiglia", s: [["Η οικογένειά μου είναι μεγάλη.", "La mia famiglia è grande."], ["Ο αδελφός μου είναι ψηλός και η αδελφή μου είναι μικρή.", "Mio fratello è alto e mia sorella è piccola."], ["Η γιαγιά μου έχει ένα όμορφο σπίτι.", "Mia nonna ha una bella casa."], ["Το σπίτι της είναι κοντά στη θάλασσα.", "La sua casa è vicino al mare."]],
      g: "οικογένειά|ikoyénia|famiglia;μου|mu|mia / mio;είναι|íne|è;μεγάλη|megáli|grande;αδελφός|adelfós|fratello;ψηλός|psilós|alto;και|ke|e;αδελφή|adelfí|sorella;μικρή|mikrí|piccola;γιαγιά|yiayá|nonna;έχει|échi|ha;ένα|éna|un;όμορφο|ómorfo|bello;σπίτι|spíti|casa;της|tis|sua (di lei);κοντά|kondá|vicino;στη|sti|al / alla;θάλασσα|thálassa|mare" },
    { t: "Ogni giorno", s: [["Κάθε μέρα ξυπνάω στις εφτά.", "Ogni giorno mi sveglio alle sette."], ["Χθες ξύπνησα αργά.", "Ieri mi sono svegliato tardi."], ["Όταν ήμουν παιδί, έπαιζα στην αυλή.", "Quando ero bambino, giocavo in cortile."], ["Αύριο θα ξυπνήσω νωρίς.", "Domani mi sveglierò presto."]],
      g: "Κάθε|káthe|ogni;μέρα|méra|giorno;ξυπνάω|ksipnáo|mi sveglio;στις|stis|alle;εφτά|eftá|sette;Χθες|chtes|ieri;ξύπνησα|ksípnisa|mi sono svegliato;αργά|argá|tardi;Όταν|ótan|quando;ήμουν|ímun|ero;παιδί|pedí|bambino;έπαιζα|épeza|giocavo;στην|stin|nel;αυλή|avlí|cortile;Αύριο|ávrio|domani;θα|tha|(futuro);ξυπνήσω|ksipníso|mi sveglierò;νωρίς|norís|presto" },
  ];

const WORDS = CATS.flatMap(c => c.words.map((w, i) => ({
  id: c.id + "-" + i, cat: c.id, gr: w[0], tr: w[1], it: w[2]
})));