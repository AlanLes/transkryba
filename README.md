# Transkryba

[![Licencja: MIT](https://img.shields.io/badge/licencja-MIT-green.svg)](LICENSE)
![Platforma: iOS](https://img.shields.io/badge/platforma-iOS%20%2B%20macOS%20%28podpisywanie%29-blue.svg)

Stukasz w tył iPhone'a, mówisz po polsku, a w Apple Notes ląduje gotowa, zatytułowana notatka. Bez otwierania żadnej aplikacji.

> **EN:** A pair of Apple Shortcuts that turn an iPhone Back Tap into a titled Polish voice note in Apple Notes — cloud speech-to-text plus an AI-generated title, no app required.

## Jak to działa

1. **Stuknięcie w tył** (Back Tap) uruchamia skrót.
2. Skrót **nagrywa dźwięk** — nagranie kończysz stuknięciem w przycisk na ekranie.
3. Nagranie leci jako `multipart/form-data` do API transkrypcji (Groq Whisper albo ElevenLabs Scribe); pusta odpowiedź kończy się alertem „Transkrypcja nie powiodła się".
4. Groq `llama-3.3-70b-versatile` generuje krótki polski tytuł (maks. 8 słów).
5. W wybranym folderze **Apple Notes** powstaje notatka: tytuł, data (`dd.MM.yyyy HH:mm`), pusta linia, transkrypcja.

## Dwa warianty

Skróty są dwa i robią dokładnie to samo — różnią się wyłącznie silnikiem transkrypcji. Powstały do porównania A/B (który silnik lepiej radzi sobie z Twoją polszczyzną); możesz zainstalować oba i zostawić ten, który wygra.

| Wariant | Pliki | Silnik transkrypcji | Tytuł | Wymagane klucze |
|---|---|---|---|---|
| **Groq** | [`Transkryba Groq.shortcut`](<Transkryba Groq.shortcut>) / [`Transkryba Groq.xml`](<Transkryba Groq.xml>) | Groq `whisper-large-v3` (darmowy tier) | Groq `llama-3.3-70b-versatile` | Groq |
| **Scribe** | [`Transkryba Scribe.shortcut`](<Transkryba Scribe.shortcut>) / [`Transkryba Scribe.xml`](<Transkryba Scribe.xml>) | ElevenLabs `scribe_v1` | Groq `llama-3.3-70b-versatile` (identyczny) | Groq + ElevenLabs |

## Instalacja

### Ścieżka A: gotowe pliki `.shortcut` (bez Maca)

1. Przenieś plik `.shortcut` na iPhone'a: AirDrop, iCloud Drive albo Wiadomości do siebie.
2. Stuknij plik → aplikacja **Skróty** zaproponuje import → przewiń podgląd i potwierdź **Dodaj skrót**.
3. Sprawdź ostatnią akcję **Utwórz notatkę**: pole „Folder" to selektor obiektu i po imporcie potrafi być puste — wybierz wtedy folder z listy (domyślnie `Transkryba`).

> **Uwaga:** jeśli w bibliotece istnieje już skrót o tej samej nazwie, iOS potrafi po cichu pominąć import. Przed wgraniem nowej wersji usuń starą ręcznie.

### Ścieżka B: podpisz `.xml` samodzielnie na Macu

Pliki `.xml` to niepodpisane plisty skrótów — iOS ich bezpośrednio nie zaimportuje. Podpisuje się je wbudowanym w macOS narzędziem `shortcuts` (nic nie trzeba instalować):

```bash
plutil -convert binary1 "Transkryba Groq.xml" -o /tmp/TranskrybaGroq.shortcut
shortcuts sign --mode anyone \
  --input /tmp/TranskrybaGroq.shortcut \
  --output "Transkryba Groq.shortcut"
# Wariant Scribe analogicznie
```

Akcją zapisu jest klasyczne **Utwórz notatkę** (`com.apple.mobilenotes.SharingExtension`), które — w odróżnieniu od App Intentu *Utwórz notatkę z Markdown* używanego we wcześniejszych wersjach — powinno podpisywać się w całości. Gdyby `shortcuts sign` mimo to zgłosił `This shortcut can't be shared because it contains unsupported features.`, użyj procedury awaryjnej: usuń ostatnią akcję przed podpisaniem i doklej ją ręcznie po imporcie:

```bash
python3 - <<'PY'
import plistlib
from pathlib import Path
data = plistlib.loads(Path("Transkryba Groq.xml").read_bytes())
assert data["WFWorkflowActions"][-1]["WFWorkflowActionIdentifier"] == \
    "com.apple.mobilenotes.SharingExtension"
data["WFWorkflowActions"].pop()
# XML + plutil — czysty binary1 od Apple; FMT_BINARY z plistlib bywa odrzucany
Path("/tmp/TranskrybaGroq-signable.plist").write_bytes(
    plistlib.dumps(data, fmt=plistlib.FMT_XML)
)
PY
plutil -convert binary1 /tmp/TranskrybaGroq-signable.plist \
  -o /tmp/TranskrybaGroq-signable.shortcut
shortcuts sign --mode anyone \
  --input /tmp/TranskrybaGroq-signable.shortcut \
  --output "Transkryba Groq.shortcut"
```

Po imporcie doklej wtedy na końcu akcję **Utwórz notatkę**: treść → wyjście ostatniej akcji **Tekst** (tej składającej tytuł + datę + transkrypcję), nazwa → zmienna `Tytul`, folder → wybierz z listy, a „Otwórz po uruchomieniu" zostaw wyłączone.

Po udanym podpisaniu plik urośnie o kilkanaście KB (podpis kryptograficzny). Tryby podpisu: `--mode anyone` — otworzy każdy (zalecane na własnego iPhone'a); `--mode people-who-know-me` — tylko kontakty z Twojego iCloud.

**Na koniec wykonaj kroki ze ścieżki A**: przenieś podpisany plik na iPhone'a i zaimportuj.

**Inne błędy podpisywania:**

* `The file couldn't be opened because it isn't in the correct format.` — plik wejściowy nie jest binarnym plistem; upewnij się, że podpisujesz wynik `plutil -convert binary1` z procedury, a nie surowy `.xml` ani już podpisany plik z repo.
* `The file doesn't exist.` mimo że plik istnieje — podaj w `--input` prostą ścieżkę bez spacji (procedura celowo pracuje na plikach w `/tmp`).
* Ostrzeżenia `ERROR: Unrecognized attribute string flag '?'` są zwykle nieszkodliwe, o ile plik wynikowy powstał.
* Kontrola poprawności XML przed podpisaniem: `plutil -lint "Transkryba Groq.xml"`.

Ostateczność bez Maca: otwórz `.xml` w edytorze i przepisz akcje ręcznie w aplikacji Skróty — przy 33–34 akcjach na wariant to znacznie wolniejsze niż podpisanie.

## Klucze API

Klucze są w **jednym miejscu**: pierwsza akcja **Słownik** na górze skrótu. Otwórz Skróty → przytrzymaj kafelek → **Edytuj** → znajdź Słownik i podmień wartości:

| Klucz | Wariant | Skąd wziąć / co wpisać |
|---|---|---|
| `GROQ_API_KEY` | oba | klucz z https://console.groq.com/keys (Scribe też go potrzebuje — do tytułu) |
| `ELEVENLABS_API_KEY` | tylko Scribe | klucz z https://elevenlabs.io/app/settings/api-keys |
| `NOTES_FOLDER` | oba | nazwa folderu w Notatkach (domyślnie `Transkryba`) |

**Załóż folder w Notatkach, zanim uruchomisz skrót pierwszy raz** — skrót sam go nie utworzy.

## Pierwsze uruchomienie

Uruchom skrót raz ręcznie z aplikacji Skróty i zezwól na wszystkie prompty: mikrofon, połączenia z `api.groq.com` / `api.elevenlabs.io` oraz dostęp do Notatek. Dopiero potem podpinaj Back Tap — gdy pierwszym uruchomieniem jest gest, ściana promptów zaskakuje, a przypadkowa odmowa kończy się tym samym ogólnym alertem co nieudana transkrypcja. Odmówione zezwolenia zmienisz później w ustawieniach skrótu (zakładka Prywatność).

## Podpięcie pod Stuknięcie w tył

**Ustawienia → Dostępność → Dotyk → Stuknięcie w tył**, potem przewiń listę na sam dół do sekcji ze skrótami:

* **Stuknij dwukrotnie** → **Transkryba Groq**
* **Stuknij trzykrotnie** → **Transkryba Scribe**

Do jednego gestu można przypiąć jeden skrót, ale gesty są dwa — oba warianty masz pod ręką jednocześnie, co ułatwia porównanie A/B.

## Znane ograniczenia

* **Treść notatki to zwykły tekst, nie Markdown — celowo.** App Intent *Utwórz notatkę z Markdown* twardo zawija treść co ~90 znaków i każdą linię renderuje jako osobny akapit, przez co zdania łamały się w środku. Klasyczna akcja *Utwórz notatkę* zapisuje tekst bez takich niespodzianek.
* **Back Tap tylko uruchamia skrót — nie kończy nagrania.** Nagrywanie zatrzymasz stuknięciem w przycisk na ekranie; akcja *Nagraj dźwięk* nie ma trybu automatycznego zakończenia wyzwalanego gestem.
* **Zapis do Notatek może wymagać odblokowania telefonu** (Face ID / kod przy zablokowanym ekranie).
* **Folder w Notatkach musi istnieć wcześniej** — inaczej zapis zawiedzie albo notatka trafi do folderu domyślnego.
* **Pole „Folder" może wymagać ręcznego wskazania po imporcie** — to selektor obiektu, nie pole tekstowe; jeśli po imporcie jest puste, wybierz folder z listy.
* **Tytuł może pojawić się dwa razy** — trafia do nazwy notatki i do pierwszej linii treści (zabezpieczenie, gdyby iOS zignorował pole nazwy). Przeszkadza? Usuń pierwszy wiersz w akcji **Tekst** tuż przed zapisem.
* **Wymagany internet** — przy słabym zasięgu żądanie może się urwać i skrót pokaże alert o nieudanej transkrypcji.
* **Klucze API są w treści skrótu.** Każdy z dostępem do odblokowanego telefonu może je odczytać. Nie udostępniaj plików `.shortcut` z wklejonymi kluczami.
* **Obsługa błędów jest minimalna** — wykrywany jest tylko pusty tekst transkrypcji; błędy HTTP (zły klucz, limit, 401/429) dają ten sam komunikat.
* **`model_id` dla ElevenLabs = `scribe_v1`** (wsadowy endpoint `POST /v1/speech-to-text`; warianty „v2" dotyczą trybu realtime). Weryfikacja: `curl -s https://api.elevenlabs.io/v1/models -H "xi-api-key: $ELEVENLABS_API_KEY" | grep -i scribe` — jeśli zwróci inny identyfikator, podmień `model_id` w akcji **Pobierz zawartość URL** wariantu Scribe.

## Skąd się to wzięło

Transkryba zaczynała jako webowa aplikacja do transkrypcji audio (Next.js — jest w historii gita, jeśli ktoś ciekaw). Okazało się jednak, że prawdziwy problem to nie „strona do wgrywania plików", tylko szybkie łapanie myśli głosem po polsku — czego Apple nie obsługuje (Voice Memos i Apple Intelligence nie transkrybują polskiego). Dwa skróty rozwiązują to lepiej niż cała aplikacja, więc aplikacja poszła do kosza, a skróty zostały. To gotowe narzędzie osobiste, nie rozwijany produkt.

## Licencja i wkład

[MIT](LICENSE) — rób z tym, co chcesz.

Issues i PR-y mile widziane (literówki, poprawki w plistach, nowe silniki STT), ale bez obietnic aktywnego rozwoju — narzędzie robi to, co miało robić.
