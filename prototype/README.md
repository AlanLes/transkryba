# Transkryba — prototyp skrótów iOS (test A/B silników transkrypcji)

Dwa skróty do szybkiego przechwytywania polskich notatek głosowych na iPhonie.
Oba robią dokładnie to samo — **różnią się wyłącznie silnikiem transkrypcji**, więc nadają się do rzetelnego porównania A/B.

| Wariant | Plik | Silnik transkrypcji | Model tytułu |
|---|---|---|---|
| A | `Transkryba Groq.xml` | Groq — `whisper-large-v3` | Groq `llama-3.3-70b-versatile` |
| B | `Transkryba Scribe.xml` | ElevenLabs — `scribe_v1` | Groq `llama-3.3-70b-versatile` (identyczny) |

Przebieg w obu wariantach:

1. Słownik konfiguracyjny (klucze API + nazwa folderu Notatek).
2. **Nagraj dźwięk**.
3. Wysyłka nagrania jako `multipart/form-data` do API transkrypcji, odczyt pola `text`.
4. Jeśli transkrypcja jest pusta → alert „Transkrypcja nie powiodła się" i zatrzymanie skrótu.
5. Oczyszczenie tekstu pod JSON → zapytanie do Groq o krótki polski tytuł (maks. 8 słów).
6. **Formatuj datę** według wzoru `dd.MM.yyyy HH:mm`.
7. **Utwórz notatkę z Markdown** we wskazanym folderze: linia tytułu, linia daty, pusta linia, transkrypcja.

---

## 1. Podpisanie plików na Macu

Pliki `.xml` to **niepodpisane** plisty skrótów. iOS nie zaimportuje ich bezpośrednio — najpierw trzeba je podpisać na Macu narzędziem `shortcuts` (jest wbudowane w macOS, nie trzeba nic instalować).

Skopiuj oba pliki `.xml` na Maca, otwórz Terminal w katalogu z plikami i wykonaj:

```bash
# Wariant A
cp "Transkryba Groq.xml" "Transkryba Groq.shortcut"
shortcuts sign --mode anyone --input "Transkryba Groq.shortcut" --output "Transkryba Groq.shortcut"

# Wariant B
cp "Transkryba Scribe.xml" "Transkryba Scribe.shortcut"
shortcuts sign --mode anyone --input "Transkryba Scribe.shortcut" --output "Transkryba Scribe.shortcut"
```

Po udanym podpisaniu pliki `.shortcut` urosną o ok. 19 KB (dochodzi podpis kryptograficzny).

### Gdy podpisywanie zgłasza błąd

* `Error: The file couldn't be opened because it isn't in the correct format.`
  Przekonwertuj kopię na binarny plist i podpisz ponownie:

  ```bash
  plutil -convert binary1 "Transkryba Groq.shortcut"
  shortcuts sign --mode anyone --input "Transkryba Groq.shortcut" --output "Transkryba Groq.shortcut"
  ```

* `Error: The file doesn't exist.` mimo że plik istnieje — podpisz z czystej ścieżki:

  ```bash
  cp "Transkryba Groq.xml" /tmp/TranskrybaGroq.shortcut
  shortcuts sign --mode anyone --input /tmp/TranskrybaGroq.shortcut --output "Transkryba Groq.shortcut"
  ```

* Ostrzeżenia `ERROR: Unrecognized attribute string flag '?'` są zwykle nieszkodliwe, o ile plik wynikowy powstał.

* Kontrola poprawności XML przed podpisaniem: `plutil -lint "Transkryba Groq.xml"`.

### Tryby podpisu

* `--mode anyone` — plik otworzy każdy (zalecane do przenoszenia na własnego iPhone'a).
* `--mode people-who-know-me` — ograniczony do kontaktów z Twojego iCloud.

---

## 2. Import na iPhone'a

1. Przenieś podpisany plik `.shortcut` na iPhone'a: AirDrop, iCloud Drive albo Wiadomości do siebie.
2. Stuknij plik → **Skróty** zaproponują import.
3. Przewiń podgląd akcji i potwierdź **Dodaj skrót**.
4. Powtórz dla drugiego wariantu.

> **Uwaga:** jeśli w bibliotece istnieje już skrót o tej samej nazwie, iOS potrafi po cichu pominąć import. Przed ponownym wgraniem poprawionej wersji **usuń starą ręcznie** w aplikacji Skróty.

### Alternatywna ścieżka bez podpisywania

Jeśli nie chcesz podpisywać plików, możesz odtworzyć skrót ręcznie: otwórz `.xml` w edytorze, przepisz akcje w aplikacji Skróty na iPhonie. To rozwiązanie awaryjne — przy ~33 akcjach na wariant jest znacznie wolniejsze niż podpisanie na Macu.

---

## 3. Wklejenie kluczy API

Klucze są w **jednym miejscu**: pierwsza akcja **Słownik** na górze skrótu. Nie trzeba grzebać nigdzie indziej.

1. Otwórz Skróty → długie przytrzymanie kafelka → **Edytuj**.
2. Znajdź akcję **Słownik** (zaraz pod komentarzami).
3. Podmień wartości:

**Transkryba Groq**

| Klucz | Wartość do podmiany |
|---|---|
| `GROQ_API_KEY` | `WKLEJ-KLUCZ-GROQ` → Twój klucz z https://console.groq.com/keys |
| `NOTES_FOLDER` | `Transkryba` → nazwa folderu w Notatkach (musi istnieć) |

**Transkryba Scribe**

| Klucz | Wartość do podmiany |
|---|---|
| `ELEVENLABS_API_KEY` | `WKLEJ-KLUCZ-ELEVENLABS` → klucz z https://elevenlabs.io/app/settings/api-keys |
| `GROQ_API_KEY` | `WKLEJ-KLUCZ-GROQ` → ten sam klucz Groq co w wariancie A (potrzebny do tytułu) |
| `NOTES_FOLDER` | `Transkryba` → nazwa folderu w Notatkach |

4. **Załóż folder `Transkryba` w Notatkach zanim uruchomisz skrót pierwszy raz.**

---

## 4. Podpięcie pod Stuknięcie w tył

Do Back Tap można przypisać **jeden** skrót na gest, a gesty są dwa — możesz więc trzymać oba warianty pod ręką jednocześnie.

**Ustawienia → Dostępność → Dotyk → Stuknięcie w tył**

* **Stuknij dwukrotnie** → przewiń listę na sam dół do sekcji ze skrótami → wybierz **Transkryba Groq**
* **Stuknij trzykrotnie** → wybierz **Transkryba Scribe**

Dzięki temu w teście A/B nagrywasz tę samą notatkę raz dwoma stuknięciami, raz trzema, bez wchodzenia do aplikacji.

---

## 5. Protokół testu A/B

Cel: sprawdzić, który silnik lepiej radzi sobie z Twoją polszczyzną, Twoim mikrofonem i Twoim sposobem mówienia.

### Zasady

1. **Ta sama notatka, oba silniki.** Nagraj prawdziwą notatkę wariantem A, potem **powtórz tę samą treść** wariantem B. Nie czytaj z kartki — mów naturalnie, tak jak zwykle.
2. **Nie poprawiaj się między nagraniami.** Jeśli w pierwszym podejściu się zająkniesz, zająknij się też w drugim albo odrzuć obie próbki.
3. **Zbierz 10–20 par notatek** rozłożonych na kilka dni i różne warunki: cicho w domu, w ruchu, w aucie, w hałasie, przy dłuższej wypowiedzi (60 s+).
4. **Kolejność na zmianę.** W połowie prób zacznij od wariantu B, żeby nie faworyzować silnika, który zawsze słyszy „drugie, lepiej przemyślane" nagranie.

### Co mierzyć

Dla każdej pary zanotuj (wystarczy arkusz albo notatka):

| Kolumna | Opis |
|---|---|
| Nr próbki | 1–20 |
| Warunki | cicho / hałas / auto / spacer |
| Długość | ok. sekund |
| Błędy A | liczba źle rozpoznanych słów w wariancie Groq |
| Błędy B | liczba źle rozpoznanych słów w wariancie Scribe |
| Interpunkcja | który wariant lepiej postawił przecinki i kropki (A / B / remis) |
| Nazwy własne | który lepiej poradził sobie z nazwiskami, markami, terminami branżowymi |
| Czas odpowiedzi | subiektywnie: który zwrócił notatkę szybciej |
| Trafność tytułu | czy tytuł AI oddaje treść (tak / nie) — powinien być porównywalny, bo krok tytułu jest identyczny |

### Interpretacja

* Licz **WER na oko**: błędne słowa ÷ wszystkie słowa. Różnica poniżej ~2 punktów procentowych na 20 próbkach to szum, nie przewaga.
* Osobno oceń **interpunkcję i wielkie litery** — przy dyktowaniu notatek to często ważniejsze niż pojedyncze przekręcone słowo.
* Zwróć uwagę na **koszt i limity** obu API — przy podobnej jakości to one rozstrzygają.
* Zwycięzcę zostaw pod dwukrotnym stuknięciem, przegranego usuń albo przepnij na trzykrotne.

---

## Znane ograniczenia

* **Stuknięcie w tył tylko uruchamia skrót — nie kończy nagrania.** Nagrywanie zatrzymasz dopiero stuknięciem w przycisk na ekranie. Nie da się tego obejść: akcja **Nagraj dźwięk** nie ma trybu „nagrywaj przez N sekund i zakończ sama" wyzwalanego gestem. To ograniczenie zaakceptowane w projekcie.
* **Zapis do Notatek może wymagać odblokowania telefonu.** Przy zablokowanym ekranie iOS potrafi poprosić o Face ID / kod, zanim wykona akcję zapisu. Ograniczenie zaakceptowane w projekcie.
* **Folder w Notatkach musi istnieć wcześniej.** Skrót nie zakłada folderu; jeśli `NOTES_FOLDER` nie istnieje, akcja zapisu zawiedzie albo notatka trafi do folderu domyślnego.
* **Pole folderu może wymagać ręcznego wskazania po imporcie.** Pole „Folder" w akcji **Utwórz notatkę z Markdown** to selektor obiektu, a nie zwykłe pole tekstowe. Jeśli po imporcie zobaczysz tam pustkę zamiast wartości ze Słownika, po prostu wybierz folder z listy — reszta skrótu działa bez zmian.
* **Tytuł może pojawić się dwa razy.** Tytuł AI trafia jednocześnie do pola nazwy notatki i do pierwszej linii treści (zabezpieczenie na wypadek, gdyby iOS zignorował pole nazwy). Jeśli w notatkach widzisz zdublowany tytuł, usuń pierwszy wiersz z akcji **Tekst** tuż przed zapisem.
* **Zależność od sieci.** Oba warianty wymagają internetu; przy słabym zasięgu żądanie może się urwać, a skrót zwróci pusty tekst i pokaże alert.
* **Klucze API są w treści skrótu.** Kto ma dostęp do odblokowanego telefonu, może je odczytać w edytorze skrótów. Nie udostępniaj podpisanych plików `.shortcut` z już wklejonymi kluczami.
* **Obsługa błędów jest minimalna.** Wykrywany jest wyłącznie pusty tekst transkrypcji. Błędy HTTP (zły klucz, przekroczony limit, HTTP 401/429) objawią się tym samym komunikatem „Transkrypcja nie powiodła się".
* **Znaki specjalne w transkrypcji.** Przed wysłaniem do modelu tytułu tekst jest czyszczony (ukośniki, cudzysłowy, znaki nowej linii). Bardzo nietypowe znaki sterujące mogą teoretycznie zepsuć zapytanie o tytuł — sama transkrypcja i zapis notatki pozostaną poprawne.
* **`model_id` dla ElevenLabs = `scribe_v1`.** To identyfikator modelu Scribe dla wsadowego endpointu `POST /v1/speech-to-text`. Warianty „v2" w ofercie ElevenLabs dotyczą trybu czasu rzeczywistego (websocket), a nie tego endpointu. Zweryfikuj to jednym poleceniem, zanim ruszysz z testem:

  ```bash
  curl -s https://api.elevenlabs.io/v1/models -H "xi-api-key: $ELEVENLABS_API_KEY" | grep -i scribe
  ```

  Jeśli zwróci inny identyfikator, podmień wartość `model_id` w akcji **Pobierz zawartość URL** w wariancie Scribe.

---

## Zawartość katalogu

```
prototype/
├── README.md                    ← ten plik
├── Transkryba Groq.xml          ← wariant A, niepodpisany plist do podpisania na Macu
├── Transkryba Scribe.xml        ← wariant B, niepodpisany plist do podpisania na Macu
├── drafts/                      ← robocze kopie źródłowe (do porównywania zmian)
└── 2026-08-05/                  ← archiwum z sygnaturą czasową
```
