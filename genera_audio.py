"""Genera i file audio greci (mp3) letti da audio/lista.json.

Uso (serve internet):
    pip install -U edge-tts
    python genera_audio.py

Opzioni:
    python genera_audio.py --prova          prova solo 3 frasi e mostra l'errore completo (per capire cosa non va)
    python genera_audio.py --gtts           se edge-tts non funziona, usa la voce di Google (pip install gTTS)
    python genera_audio.py --parallelo 1    una richiesta alla volta (più lento ma il più sicuro)

Salta i file già presenti: si può interrompere e rilanciare quando si vuole.
Dopo aver aggiunto contenuti rigenera prima la lista (node genera_lista.js e node genera_lista_verbi.js).
Voce: Athina (donna) o Nestoras (uomo), vedi VOICE qui sotto.
"""
import argparse
import asyncio
import json
import os
import random
import sys
import traceback

VOICE = "el-GR-AthinaNeural"  # alternativa: "el-GR-NestorasNeural"
RATE = "-15%"                  # un po' più lenta del normale, utile per imparare
PARALLEL = 2                   # poche richieste insieme: con troppe il servizio rifiuta le connessioni
TENTATIVI = 6

BASE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(BASE, "audio")


def suggerimento(err):
    s = f"{type(err).__name__}: {err}"
    low = s.lower()
    if "403" in low or "invalid response status" in low:
        return s + "\n   -> Versione di edge-tts troppo vecchia: esegui  pip install -U edge-tts"
    if "no audio" in low:
        return s + "\n   -> Il servizio non ha restituito audio per questo testo."
    if "ssl" in low or "certificate" in low:
        return s + "\n   -> Problema di certificati/antivirus/proxy: prova da un'altra rete o disattiva temporaneamente l'ispezione HTTPS."
    if "429" in low or "too many" in low:
        return s + "\n   -> Troppe richieste: usa  --parallelo 1"
    return s


async def con_edge(testo, path):
    import edge_tts
    tmp = path + ".tmp"
    try:
        await edge_tts.Communicate(testo, VOICE, rate=RATE).save(tmp)
        if not os.path.exists(tmp) or os.path.getsize(tmp) < 500:
            raise RuntimeError("file audio vuoto")
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


async def con_gtts(testo, path):
    from gtts import gTTS
    tmp = path + ".tmp"
    try:
        await asyncio.to_thread(lambda: gTTS(testo, lang="el", slow=False).save(tmp))
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prova", action="store_true")
    ap.add_argument("--gtts", action="store_true")
    ap.add_argument("--parallelo", type=int, default=PARALLEL)
    a = ap.parse_args()
    genera = con_gtts if a.gtts else con_edge

    if not a.gtts:
        try:
            import edge_tts  # noqa: F401
        except ImportError:
            sys.exit("Manca edge-tts: esegui  pip install -U edge-tts")
        try:
            from importlib.metadata import version
            print("edge-tts versione", version("edge-tts"))
        except Exception:
            pass

    with open(os.path.join(DIR, "lista.json"), encoding="utf-8") as f:
        lista = json.load(f)
    todo = [(t, n) for t, n in lista.items() if not os.path.exists(os.path.join(DIR, n))]
    print(f"{len(todo)} file da generare ({len(lista)} in tutto)")
    if not todo:
        return

    if a.prova:
        for testo, nome in todo[:3]:
            try:
                await genera(testo, os.path.join(DIR, nome))
                print("OK:", testo)
            except Exception:
                print("ERRORE su:", testo)
                traceback.print_exc()
                return
        print("Prova riuscita: ora lancia lo script senza --prova.")
        return

    sem = asyncio.Semaphore(max(1, a.parallelo))
    state = {"fatti": 0, "errori": []}

    async def one(testo, nome):
        path = os.path.join(DIR, nome)
        async with sem:
            for tentativo in range(TENTATIVI):
                try:
                    await genera(testo, path)
                    break
                except Exception as e:
                    if tentativo == TENTATIVI - 1:
                        state["errori"].append((testo, suggerimento(e)))
                    else:
                        # attesa crescente con un po' di casualità: 2s, 4s, 8s...
                        await asyncio.sleep(2 ** (tentativo + 1) + random.random())
            else:
                pass
            await asyncio.sleep(0.2)
            state["fatti"] += 1
            if state["fatti"] % 25 == 0:
                print(f"{state['fatti']} / {len(todo)}  (errori finora: {len(state['errori'])})", flush=True)

    await asyncio.gather(*(one(t, n) for t, n in todo))

    if not state["errori"]:
        print("Fatto, tutti i file sono stati generati.")
        return
    with open(os.path.join(BASE, "audio-errori.txt"), "w", encoding="utf-8") as f:
        for t, e in state["errori"]:
            f.write(f"{t}\n   {e}\n")
    print(f"\nFinito con {len(state['errori'])} errori (dettagli in audio-errori.txt). Primo errore:")
    print(state["errori"][0][0], "\n  ", state["errori"][0][1])
    print("\nRilancia lo script per riprovare solo quelli mancanti.")


if __name__ == "__main__":
    asyncio.run(main())