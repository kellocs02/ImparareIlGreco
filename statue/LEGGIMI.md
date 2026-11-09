# Immagini delle statue di ARETE

Questa cartella contiene le fotografie che appaiono nella home di ARETE, con la citazione sopra.
Le immagini **non sono incluse**: scaricale tu e copiale qui con **esattamente** questi nomi.

| File da creare            | Opera                                  | Autore / note                                   |
|---------------------------|----------------------------------------|-------------------------------------------------|
| `discobolo.jpg`           | Discobolo                              | Mirone (copie romane: Palombara/Lancellotti, Museo Nazionale Romano; copia al British Museum) |
| `doriforo.jpg`            | Doriforo                               | Policleto (copia di Pompei, Museo Archeologico di Napoli) |
| `hermes.jpg`              | Hermes con Dioniso fanciullo           | attribuito a Prassitele (Museo Archeologico di Olimpia) |
| `apollo.jpg`              | Apollo del Belvedere                   | Musei Vaticani                                  |
| `ercole.jpg`              | Ercole Farnese                         | Museo Archeologico Nazionale di Napoli          |
| `laocoonte.jpg`           | Laocoonte e i suoi figli               | Musei Vaticani                                  |

Puoi mettere anche solo alcune immagini: la home ruota tra quelle che trovi.
Se un file manca, la home mostra al suo posto uno sfondo in marmo scuro con la sola citazione.

## Formato consigliato
- JPG (vanno bene anche `.webp` o `.png`, con lo stesso nome base).
- Verticale o quasi quadrato, circa **1200 × 1500 px**, sotto i **300 KB** ciascuna (l'app deve restare leggera).
- Soggetto al centro: il testo della citazione si appoggia nella parte bassa dell'immagine.

## Dove cercarle
Cerca il nome dell'opera su **Wikimedia Commons** (commons.wikimedia.org) e scegli una foto in buona qualità.
**Attenzione alla licenza:** le statue antiche sono di pubblico dominio, ma la *fotografia* può avere una sua licenza.
Preferisci file marcati "Public domain", "CC0" o "CC BY / CC BY-SA" (questi ultimi richiedono di citare l'autore).

## Crediti (consigliato)
Crea un file `credits.json` in questa cartella e ARETE mostrerà il credito sotto la foto:

```json
{
  "discobolo": "Foto: Nome Autore, licenza CC BY-SA 4.0, via Wikimedia Commons",
  "doriforo": "Foto: ..."
}
```

Dopo aver aggiunto le immagini: fai commit e push della cartella `statue/`.
