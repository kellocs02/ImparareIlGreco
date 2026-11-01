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

const WORDS = CATS.flatMap(c => c.words.map((w, i) => ({
  id: c.id + "-" + i, cat: c.id, gr: w[0], tr: w[1], it: w[2]
})));
