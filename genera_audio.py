"""Genera i file audio greci (mp3) letti da audio/lista.json.

Uso (una volta sola, serve internet):
    pip install edge-tts
    python genera_audio.py

Salta i file già presenti, quindi si può rilanciare dopo aver aggiunto contenuti
(prima: node genera_lista.js). Per cambiare voce: Athina (donna) o Nestoras (uomo).
"""
import asyncio
import json
import os

import edge_tts

VOICE = "el-GR-AthinaNeural"  # alternativa: "el-GR-NestorasNeural"
RATE = "-15%"                  # un po' più lenta del normale, utile per imparare
PARALLEL = 4

BASE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(BASE, "audio")


async def main():
    with open(os.path.join(DIR, "lista.json"), encoding="utf-8") as f:
        lista = json.load(f)
    todo = [(t, n) for t, n in lista.items() if not os.path.exists(os.path.join(DIR, n))]
    print(f"{len(todo)} file da generare ({len(lista)} in tutto)")
    sem = asyncio.Semaphore(PARALLEL)
    state = {"fatti": 0, "errori": 0}

    async def one(testo, nome):
        path = os.path.join(DIR, nome)
        async with sem:
            for tentativo in range(3):
                try:
                    await edge_tts.Communicate(testo, VOICE, rate=RATE).save(path)
                    break
                except Exception as e:
                    if os.path.exists(path):
                        os.remove(path)
                    if tentativo == 2:
                        state["errori"] += 1
                        print("ERRORE:", testo, e)
                    else:
                        await asyncio.sleep(2)
            state["fatti"] += 1
            if state["fatti"] % 25 == 0:
                print(f"{state['fatti']} / {len(todo)}")

    await asyncio.gather(*(one(t, n) for t, n in todo))
    print("Fatto." if not state["errori"] else f"Finito con {state['errori']} errori: rilancia lo script per riprovare.")


if __name__ == "__main__":
    asyncio.run(main())
