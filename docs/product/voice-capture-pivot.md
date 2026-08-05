# Analiza: Transkryba Capture — „przycisk → mówisz → gotowa notatka w Apple Notes"

**Data:** 2026-08-04
**Status:** analiza produktowa przed decyzją o budowie
**Właściciel:** solo developer (repo `transkryba`)

---

## TL;DR

**Czy da się to zbudować?** Tak, ale nie w wersji z fantazji. Wersja „telefon nigdy nie wychodzi z kieszeni, wszystko dzieje się przy zablokowanym ekranie" jest **twardo zablokowana przez iOS** i nie powstanie. Wersja, która **jest** budowalna — i to w weekend — wygląda tak: gest (Action Button) startuje **i zatrzymuje** nagrywanie w Voice Memos nawet przy zablokowanym, ciemnym ekranie; potem, przy najbliższym wygodnym momencie, jedno spojrzenie Face ID i jeden gest odpala Shortcut przetwarzający: najnowsze nagranie → POST do backendu Transkryby (fal.ai Whisper, sprawdzony dla polskiego) → gotowa notatka z datą i tytułem AI ląduje w wybranym folderze Apple Notes.

**Czy jest rynek?** Dla języka angielskiego — nie, to jest funkcja, nie produkt; Apple rozdaje 80% tego za darmo, a resztę obsługuje tuzin aplikacji. Ale istnieje realna, dziś **niczyja** nisza: „naciśnij przycisk, mów po polsku, dostań zatytułowaną notatkę tekstową w Apple Notes". Apple w ogóle nie transkrybuje polskiego (Voice Memos, „Transcribe Audio" i Apple Intelligence — zero polskiego na stan iOS 26.1), aplikacje subskrypcyjne obsługujące polski nie kończą przepływu w Apple Notes, a tanie aplikacje jednorazowe nie robią tytułów AI ani routingu do Notes. To nisza na dochodowy produkt indie (ekonomia Just Press Record: 7–20 USD jednorazowo), nie na startup venture — i z ograniczonym oknem czasowym (Apple kiedyś doda polski; realnie 1–3 lata).

**Co budować najpierw?** Opcję A: czysty Shortcut + jeden nowy endpoint w istniejącym repo (`POST /api/v1/note` zwracający `{transcript, title}`). Jeden–dwa dni pracy, zero App Store, zero natywnego kodu. To jednocześnie narzędzie osobiste i sonda popytu. Aplikacja natywna dopiero po twardych sygnałach walidacji — jej „wyróżniające" obietnice (start nagrywania przy zablokowanym telefonie, bezpośredni zapis do Notes) są dokładnie tym, czego iOS zabrania.

---

## Pomysł i pętla główna

Pomysł: maksymalnie bezobsługowe przechwytywanie myśli głosem po polsku, kończące się **w systemie notatek, którego użytkownik już używa** (Apple Notes), a nie w kolejnym silosie z własną skrzynką do przeglądania.

Pętla główna, w wersji uczciwej wobec ograniczeń iOS:

1. **Przechwycenie (działa przy zablokowanym telefonie):** wciskasz Action Button (lub kontrolkę Voice Memos na ekranie blokady / w Control Center) → Voice Memos zaczyna nagrywać, także z ciemnego, zablokowanego ekranu. Mówisz. Wciskasz ten sam przycisk ponownie → nagrywanie się kończy. Voice Memos nagrywa w tle godzinami, blokada ekranu nie przerywa.
2. **Przetworzenie (wymaga jednego odblokowania):** w dowolnym późniejszym momencie — jedno spojrzenie Face ID i jeden gest (Back Tap, widżet ekranu blokady albo Siri) odpala jeden Shortcut, który: bierze najnowsze nagranie (akcja „Find Voice Recording"), POST-uje plik m4a do backendu Transkryby, dostaje w odpowiedzi `{transcript, title}` i tworzy notatkę w wybranym folderze Apple Notes („Create Note" z wyłączonym arkuszem kompozycji + „Move Notes to Folder" jako zabezpieczenie), z sformatowaną datą i godziną oraz polskim tytułem wygenerowanym przez LLM.
3. **Koniec pętli:** notatka jest w Apple Notes. Żadnego UI aplikacji, żadnej skrzynki do triage'owania, żadnej drugiej aplikacji do otwierania.

Kluczowa uczciwość komunikacyjna: gest startuje **i** zatrzymuje nagrywanie przy zablokowanym telefonie; etap „transkrybuj i zapisz" wymaga jednego odblokowania. Wersji w pełni zablokowanej end-to-end **nie wolno obiecywać** — nie istnieje na iOS.

---

## Wykonalność techniczna na iOS

Poniższe ustalenia traktuję jako grunt faktograficzny — tam, gdzie pierwotna analiza wykonalności i weryfikacja sceptyczna się różniły, **obowiązuje wersja sceptyka**.

### Triggery (co czym można odpalić)

- **Action Button (iPhone 15 Pro i nowsze) przypisany do Voice Memos — najlepsza ścieżka.** Wbrew wcześniejszej ocenie („tylko press-and-hold, brak toggle") użytkownicy potwierdzają, że **Action Button działa jako prawdziwy przełącznik start/stop**: przytrzymanie startuje nagrywanie, które kontynuuje w tle przy zablokowanym ekranie, a ponowne naciśnięcie je zatrzymuje. To jest ten sam gest do startu i stopu — natywnie, przy zablokowanym telefonie. Zastrzeżenie: istnieje realny bug w iOS 26.x (raporty AppleVis, iPhone 16 Pro Max), gdzie z ekranu blokady pojawia się „hold to record", ale nagrywanie nie startuje, dopóki Voice Memos nie było niedawno otwarte — praktyczny workaround: otworzyć Voice Memos raz po restarcie/aktualizacji.
- **Kontrolka Voice Memos na ekranie blokady / w Control Center (iOS 18+):** uprzywilejowana kontrolka Apple **startuje nagrywanie bez odblokowania** — to sensowny fallback dla telefonów bez Action Button. Kontrolki firm trzecich potrzebujące mikrofonu wymuszają odblokowanie; jedyna usankcjonowana ścieżka „locked capture" (LockedCameraCapture) dotyczy wyłącznie kamery.
- **Back Tap:** wymaga **włączonego ekranu** i **odblokowanego telefonu** — Shortcut przypisany do Back Tap nie wykona się przed odblokowaniem. Back Tap nie może być triggerem „w kieszeni" ani „przy zablokowanym ekranie"; nadaje się natomiast świetnie jako trigger Shortcuta **przetwarzającego** (po glancu Face ID).
- **Apple Watch Double Tap:** nadal nie może uruchomić dowolnego Shortcuta (tylko Playback i Smart Stack); workaround przez AssistiveTouch wyłącza natywny Double Tap. Action Button w Watch Ultra może odpalić Shortcut. Na dziś: nie budować na zegarku.
- **Toggle jednym gestem w czystych Shortcuts:** wcześniejsza teza „drugi identyczny gest nie zatrzyma nagrywania" była **przesadzona** — dotyczy tylko blokującej akcji „Record Audio". Gdy przechwytywanie deleguje się do Voice Memos przez „Create Recording", Shortcut kończy się, a nagrywanie trwa — więc ten sam gest może odpalić się ponownie; Shortcuts ma zresztą pierwszopartyjną akcję **„Stop Recording"**, co umożliwia zbudowanie shortcuta-przełącznika na odblokowanym telefonie.

### Nagrywanie

- **Voice Memos to jedyny niezawodny rejestrator długich nagrań przy zablokowanym ekranie na iOS.** Ma uprzywilejowane uprawnienia (background audio, start z blokady), brak twardego limitu czasu (ogranicza pamięć).
- **Akcja Shortcuts „Record Audio" — nie używać:** działa w foregroundzie nakładki Shortcuts, nagranie **umiera przy zablokowaniu ekranu**, plus znany bug zawieszania przy wywołaniu przez Siri.
- **Akcja „Dictate Text" — nie używać:** opcja zatrzymania „On Tap" jest zepsuta od ~iOS 17.4 i zawsze zachowuje się jak „After Pause" — praktyczny sufit to jedna ciągła wypowiedź; nieużywalna dla notatek wielominutowych.
- **Aplikacja natywna:** iOS **zabrania** zimnego startu nowej sesji AVAudioSession z tła lub z zablokowanego urządzenia (potwierdzone przez Apple DTS, forum wątek 815725) — intenty mogą tylko pauzować/wznawiać już trwającą sesję. Aplikacje reklamujące „nagrywanie z ekranu blokady" (np. Whisper Memos) w rzeczywistości **otwierają aplikację**, czyli wymuszają niejawne odblokowanie Face ID. Dozwolony przepływ natywny: gest → aplikacja otwiera się (jeden glance Face ID) → nagrywanie startuje natychmiast w foregroundzie → telefon można zablokować, nagrywanie trwa w tle → stop z przycisku Live Activity (AudioRecordingIntent).

### STT — z naciskiem na jakość polskiego

- **Apple nie transkrybuje polskiego. Kropka (na stan iOS 26.1).** Transkrypcja Voice Memos i akcja Shortcuts „Transcribe Audio" obsługują tylko ~9–10 języków (EN/ES/PT/IT/FR/DE/JA/KO/ZH) — bez polskiego. Nowe API SpeechAnalyzer/SpeechTranscriber (iOS 26), najlepsze on-device STT Apple, **nie wspiera pl_PL** (uwaga: dokładna lista `supportedLocales` nie jest publicznie enumerowana — zweryfikować na urządzeniu przez `SpeechTranscriber.supportedLocale(equivalentTo: Locale(identifier: "pl-PL"))` przy każdym większym wydaniu). Fallback `DictationTranscriber` obsługuje polski, ale na poziomie starego dyktowania klawiaturowego — jakościowo nieakceptowalne dla notatek.
- **Ważny niuans z weryfikacji:** dla dziewięciu wspieranych języków cały pipeline (nagraj → Find Voice Recording → Transcribe Audio → Create Note) jest **w 100% darmowy, on-device i bez chmury**. To oznacza, że produkt anglojęzyczny nie ma racji bytu — i że nasza wartość jest ściśle związana z językami osieroconymi przez Apple.
- **Dla polskiego jedyną jakościową ścieżką jest klasa Whisper:** chmura (fal.ai Whisper large — już sprawdzony w Transkrybie; ElevenLabs Scribe — 3.1% WER na FLEURS Polish, ~0,22 USD/h; Groq whisper-large-v3-turbo ~0,04 USD/h) albo, w aplikacji natywnej, on-device WhisperKit large-v3-turbo (~1,6 GB modelu, iPhone 12+, Neural Engine). Ranking jakości dla polskiego: ElevenLabs Scribe ≈ chmurowy Whisper large-v3 > on-device WhisperKit > wszystko od Apple.
- Wywołanie chmury z Shortcuta to zwykły „Get Contents of URL" z multipart POST — działa, ale **nie przy zablokowanym telefonie** (stąd dwuetapowa pętla).

### Zapis do Apple Notes

- **Nie istnieje publiczne API deweloperskie do Apple Notes** — Apple DTS potwierdziło wprost „No" (wątek 813810). Aplikacja natywna **nie może** programistycznie zapisać notatki w Apple Notes na iOS. Jedyne usankcjonowane mosty: (a) akcje Shortcuts, (b) share sheet (ręcznie), (c) legacy SiriKit (INCreateNoteIntent — niepraktyczne).
- **Shortcuts w pełni pokrywa nasz wymóg:** „Create Note" potrafi celować w konkretny folder i z wyłączonym „Show Compose Sheet" zapisuje **cicho, w tle**. Data i godzina w tytule/treści to trywialne akcje Current Date + Format Date. Zastrzeżenie praktyczne: niektóre wersje iOS ignorują parametr Folder w trybie tła i wrzucają notatkę do folderu domyślnego — obowiązkowo dokładać „Move Notes to Folder" jako siatkę bezpieczeństwa. Notatki tworzone przez Shortcuts są czystym tekstem (bez formatowania); „Append to Note" dokleja tylko na końcu notatki.
- **Konsekwencja architektoniczna:** każda architektura, także przyszła aplikacja natywna, **musi** przepuszczać finalny zapis przez Shortcut (App Intent zwracający `{transcript, title}`, który malutki towarzyszący Shortcut wlewa do „Create Note"). Ta niewygoda jest jednocześnie powodem, dla którego żaden konkurent tego nie robi — czyli naszą fosą.
- Poprawka nazewnicza z weryfikacji: akcja „Get Latest Voice Memo" **nie istnieje**; właściwa akcja (nowa w iOS 26) to Voice Memos **„Find Voice Recording"** (sortowanie po najnowszych, limit 1), obok „Create Recording", „Stop Recording", „Play/Select/Delete Recording".

### Tytuł AI

- **Apple Intelligence nie wspiera polskiego** (oficjalna lista iOS 26.1: 16 języków, bez pl; dodatkowo nowe funkcje Siri AI bywają ograniczone w UE). Akcja „Use Model" na polskim tekście jest więc niepewna. Uwaga na dryf: pojawiły się sygnały, że polska Siri mogła wejść ok. iOS 26.4/26.5 — twierdzenie „brak polskiego" jest **aktualne na 26.1 i wymaga ponownego sprawdzania przy każdym wydaniu**.
- Działające opcje: akcja „Ask ChatGPT" z aplikacji ChatGPT (każdy iPhone, dobry polski), bezpośredni POST do API z Shortcuta — albo, **najlepiej**, tytułowanie po stronie naszego serwera w tej samej odpowiedzi co transkrypt. To omija zarówno brak polskiego w Apple Intelligence, jak i problem kluczy API osadzonych w Shortcucie.
- Tani fallback bez AI: pierwsze 6–8 słów transkryptu + data.

### Czego iOS NIE pozwala — lista twardych blokerów

1. **Żaden gest nie wystartuje nowego nagrywania w aplikacji firm trzecich ani w Shortcucie przy zablokowanym telefonie bez odblokowania** — tylko Voice Memos ma ten przywilej. Budowalna wersja to „gest → glance Face ID → nagrywanie", nie „double-tap w kieszeni".
2. **Back Tap nie zadziała przed odblokowaniem** i wymaga włączonego ekranu.
3. **Brak API do Apple Notes** — finalny zapis zawsze przez Shortcut lub share sheet.
4. **„Record Audio" ginie przy blokadzie ekranu, „Dictate Text" ucina po pauzie** — czysty Shortcut nie nagra niezawodnie wielominutowej notatki; przechwytywanie musi oprzeć się o Voice Memos.
5. **SpeechTranscriber bez polskiego** — jakościowe polskie STT to wyłącznie klasa Whisper (chmura lub natywny WhisperKit).
6. **Watch Double Tap nie odpali Shortcuta.**
7. **Apple Intelligence bez polskiego** (stan 26.1) — tytułowanie przez ChatGPT extension lub własne API.
8. Konsekwencja dla monetyzacji: **wyróżniający UX (capture jednym gestem przy blokadzie) jest dokładnie tym, co iOS rezerwuje dla Voice Memos** — płatna aplikacja nie przebije Apple na triggerze; sprzedawalna wartość musi żyć w jakości polskiej transkrypcji, auto-tytułach i organizacji.

---

## Co z repo transkryba da się wykorzystać

**Werdykt: repo zostaje jako backend towarzyszący, nie jako produkt.** Powierzchnia produktu żyje w całości na iPhonie; nic z obecnego web UI nie uczestniczy w pętli. Ale repo nie jest ślepą uliczką — jego realnym aktywem jest sprawdzona, dostrojona do polskiego integracja z fal.ai Whisper plus gotowy do wdrożenia host Next.js.

**Do wykorzystania wprost:**

- **Najcenniejsza wiedza w repo — działająca konfiguracja STT dla polskiego:** model `fal-ai/whisper` z dokładnymi parametrami (`audio_url`, `language: "pl"`, `task: "transcribe"`, `chunk_level: "segment"`) i typem odpowiedzi `WhisperOutput` — w `app/_hooks/use-transcription.ts`, `app/_lib/fal-client.ts` i `docs/general.md`. Przenosi się 1:1.
- **Konto/billing/klucz fal.ai** i konwencja `FAL_KEY` (`.env.example`) — koszty już rozpoznane do modelowania.
- **Repo Next.js jako szkielet brakującego backendu:** Shortcut („Get Contents of URL", multipart POST) nie uruchomi klienta JS fal — potrzebny jest jeden nowy route handler, np. `app/api/transcribe/route.ts` (lub `POST /api/v1/note`), który przyjmuje plik audio, robi `fal.storage.upload` po stronie serwera, uruchamia Whispera, generuje tytuł AI (mały LLM) i zwraca JSON `{title, text, timestamp}`. Rzędu 60–80 linii, z reużyciem typów z `_lib/fal-client.ts`. ~Dzień pracy zamiast odbudowywania wiedzy o fal od zera.
- **Istniejąca strona web** jako darmowa powierzchnia QA/debug (wrzuć m4a z Voice Memos, porównaj jakość) i później strona marketingowa/konto.
- **Infrastruktura repo:** GitHub Issues, etykiety triage, konwencje docs/adr (`AGENTS.md`, `docs/agents/*`) — do użycia bez zmian.
- **Deployowalność:** Vercel = zero-ops hosting endpointu dla Shortcuta. Uwaga na limit ~4,5 MB body w serverless — m4a to ~0,5–1 MB/min, krótkie notatki mieszczą się spokojnie; dłuższe nagrania będą wymagały presigned-upload.
- Proxy `@fal-ai/server-proxy` (`app/api/fal/proxy/route.ts`) — jeśli przyszłe web UI zachowa wywołania klienckie.

**Nie do wykorzystania:**

- Całe UI przepływu webowego (`file-upload-section.tsx`, `transcription-widget.tsx`, `transcription-result.tsx`, `error-alert.tsx`, `page-header.tsx`, `use-transcription.ts`) — pivot jest bezekranowy.
- Sam wzorzec orkiestracji klienckiej (przeglądarka → fal przez proxy) — Shortcuts go nie wykona; pipeline musi przejść na serwer.
- Synchoniczny `fal.run` — produkcyjny backend powinien przejść na `fal.subscribe`/queue dla nagrań dłuższych niż krótkie klipy.
- **Nieautoryzowane proxy w obecnej formie to pasywo** na publicznym deployu (otwarte wydawanie kredytów fal) — nowy endpoint musi mieć co najmniej shared-secret w nagłówku.
- Brak w repo: nagrywania (zero MediaRecorder), generowania tytułów, integracji z Notes, auth, persystencji — każda funkcja specyficzna dla pivotu jest greenfieldem. Do ewentualnej aplikacji natywnej (Swift) repo nie wnosi nic poza rolą API.

---

## Konkurencja i pozycjonowanie

**Krajobraz:** Apple Voice Memos + Apple Intelligence (darmowy baseline, zero polskiego), Just Press Record (6,99 USD jednorazowo — najbliższy „gesture capture", ale bez AI-tytułów i bez Notes), Whisper Memos (~5 USD/mc, dostarcza e-mailem — nie do Notes), AudioPen (99 USD/rok, przepisuje zamiast transkrybować, limit 15 min), Voicenotes (lider kategorii, ~90–100 USD/rok, **silos** — notatki uwięzione w aplikacji), superwhisper / Wispr Flow / Monologue (dyktowanie pod kursor, nie asynchroniczny capture), Otter (meetingi, angielski), Cleft Notes (filozoficznie najbliższy „capture layer", ale też własna aplikacja najpierw), Aiko / Whisper Notes (on-device, jednorazowe — dowód, że sama transkrypcja to commodity).

**Zagrożenie natywne od Apple:** dla angielskiego — miażdżące i rosnące. Ale stack Apple ma trzy trwałe dziury: **(1) język** — brak polskiego w transkrypcji i w Apple Intelligence (WWDC 2025 dodało języki rynków 6-milionowych, pomijając ~8 mln polskich iPhone'ów; kadencja Apple sugeruje polski za 1–3 lata); **(2) destynacja** — natywny output jest uwięziony przy pliku audio: copy-paste, bez eksportu, bez czystej tekstowej notatki w Notes; **(3) tytuły/organizacja** — generyczne znaczniki czasu, zero AI-tytułów. Ryzyko jest asymetryczne: dowolny point release z polskim kasuje dziurę #1 z dnia na dzień — produkt musi więc wygrywać też na #2 i #3, które Apple strukturalnie naprawia wolniej (Apple trzyma transkrypty przy plikach audio, nie robi z nich notatek).

**Pozycjonowanie:**

- **Polish-first** (i szerzej: języki osierocone przez Apple — czeski, ukraiński, rumuński): Whisper large daje polskiemu WER ~3–8%, przepaść wobec zerowego wsparcia Apple, tania w serwowaniu przez fal.ai — dokładnie istniejący stack Transkryby.
- **Apple Notes jako destynacja, nie kolejny silos:** dosłownie żaden mainstreamowy konkurent nie zapisuje czystej, zatytułowanej notatki tekstowej wprost do Apple Notes. Niewygoda braku API to mała fosa.
- **Prawdziwa pętla zero-friction:** przepływ kończy się w systemie notatek użytkownika, bez UI, bez skrzynki. Wszyscy konkurenci kończą we własnej aplikacji.
- **Tytuł AI + lekki cleanup po polsku** (usuwanie „yyy", „no więc"), ale **transkrypt verbatim** — bez agresywnego przepisywania à la AudioPen.
- **Cena przeciw zmęczeniu subskrypcjami:** jednorazowe 9,99–19,99 USD / 39–79 PLN podcina wszystkich i pasuje do udokumentowanej alergii polskiego rynku na subskrypcje-pułapki.
- **Prywatność bez konta:** przetwórz audio, zwróć tekst, nic nie przechowuj — notatki żyją w iCloud użytkownika.

**Szczery werdykt rynkowy:** dla globalnego rynku angielskiego — nie budować. Dla niszy „polski głos → zatytułowana notatka w Apple Notes" — nikt tego dziś nie serwuje; to żywotny produkt indie/lifestyle z 2–3-letnią przewagą, z jawnym ryzykiem, że Apple wchłonie warstwę językową, a Voicenotes mógłby (gdyby zechciał) wchłonąć warstwę destynacji.

---

## Opcje MVP

| Opcja | Zakres | Nakład | Ryzyko |
|---|---|---|---|
| **A — Czysty Shortcut + istniejący backend** | Jeden Shortcut przetwarzający (Find Voice Recording → POST do Transkryby → Create Note z datą + tytułem AI w wybranym folderze) + jeden nowy route API opakowujący istniejący pipeline fal.ai i dodający tytuł LLM w tej samej odpowiedzi. Capture w 100% natywnie: Voice Memos przez Action Button. Użytek osobisty, token na sztywno. | **1–2 dni** (weekend): 2–4 h backend, 2–4 h składanie i testy Shortcuta, reszta szlif (formaty dat, folder, obsługa błędów). | **Niskie.** Każde ogniwo zweryfikowane na aktualnym iOS. Rezydualne: bug locked-start Action Button w 26.x (znany workaround), sporadyczne ignorowanie parametru Folder (mitygacja: Move Notes to Folder), możliwe zmiany akcji Voice Memos w przyszłym iOS. Sam w sobie bez ścieżki monetyzacji — to instrument walidacji. |
| **B — Współdzielony produkt hybrydowy** | Opcja A utwardzona dla obcych: tokeny per-user z rate-limitami i limitami kosztów, instalator (link iCloud Shortcut + import questions na token i folder), polski landing z waitlistą/testem cenowym, minimalna telemetria (requesty per token, minuty audio), opcjonalny TL;DR. Zero natywnego kodu, zero App Store. | **1–2 tygodnie** part-time ponad Opcję A (auth, kontrola kosztów/nadużyć, landing, dokumentacja instalacji). | **Średnie.** Tarcie instalacji Shortcuta odsieje część użytkowników; koszty serwera na Tobie do czasu płatności; Shortcuty są trywialnie kopiowalne — cena musi żyć po stronie serwera (token = produkt); wsparcie nietechnicznych użytkowników na kruchym stacku Shortcuts. |
| **C — Natywna aplikacja SwiftUI + towarzyszący Shortcut** | Aplikacja capture: AppIntent „Start Recording" (`openAppWhenRun = true`: jeden glance Face ID, potem natychmiastowe nagrywanie kontynuowane w tle), Live Activity/Dynamic Island z pauzą/stopem, własna historia, tier chmurowy Whisper + on-device WhisperKit large-v3-turbo offline, App Intent zwracający `{transcript, title}` dla malutkiego Shortcuta „Create Note", płatne wydanie App Store (jednorazowo 30–80 PLN lub pakiet kredytów). | **4–8 tygodni**: SwiftUI + AVAudioSession + Live Activities + App Intents + WhisperKit (zarządzanie modelem ~1,6 GB), review App Store, płatności. | **Wysokie.** Nie przebije Voice Memos na triggerze przy blokadzie (twardy bloker iOS, potwierdzony przez DTS), i tak nie zapisze do Notes bez towarzyszącego Shortcuta, konkuruje z finansowanymi graczami we wszystkim poza polski+Notes, a dodanie polskiego przez Apple w dowolnym point release kasuje klin językowy. Uzasadniona dopiero po realnym, utrzymanym popycie z Opcji B. |

**Rekomendacja: Opcja A, w ten weekend**, jawnie w podwójnej roli — narzędzie osobiste i sonda popytu dla Opcji B. Uzasadnienie: (1) respektuje każde potwierdzone ograniczenie iOS — Voice Memos to jedyny rejestrator przy blokadzie, Shortcuts to jedyny pisarz do Notes, serwer to jedyna jakościowa ścieżka polskiego STT + tytułowania; (2) reużywa posiadany aktyw (proxy fal.ai), więc marginalna budowa to jeden route API i jeden Shortcut; (3) weryfikacja sceptyczna obaliła największy strach UX-owy — **Action Button naprawdę jest natywnym przełącznikiem start/stop dla Voice Memos, także przy blokadzie** — więc codzienne doświadczenie jest autentycznie dobre, nie kompromisowe; (4) produkuje dokładnie ten artefakt (link iCloud Shortcut), który dystrybuuje plan walidacji — zero pracy do wyrzucenia: A wyrasta w B przez dodanie tokenów i landingu, a C jest bramkowane liczbami z B. **Nie zaczynać od aplikacji natywnej** — to 4–8 tygodni budowania gorszego triggera, niż darmowy Shortcut już ma.

---

## Plan walidacji (najtańsze eksperymenty najpierw)

1. **Tydzień 0 (0 zł):** dogfooding Opcji A przez 14 dni. Loguj każde przechwycenie (liczba, długość, jak szybko faktycznie przetwarzasz, jakość transkryptu/tytułu na realnej polszczyźnie). **Sygnał kill: jeśli sam przestaniesz używać przed dniem 10 — stop.**
2. **Tydzień 1–2 (~0 zł + grosze serwera):** link iCloud Shortcut + 3-minutowe polskie wideo setupowe do 10–20 polskich posiadaczy iPhone'ów (znajomi, r/apple_polska, polskie grupy FB o Apple, forum MyApple). **Próg sukcesu: ≥5 osób kończy setup bez pomocy i ≥3 nadal używają po 2 tygodniach** (widoczne w logach backendu per token).
3. **Równolegle (~1 dzień):** jednostronicowy polski landing („Przycisk → mówisz → gotowa notatka w Apple Notes") z waitlistą i fake-door pytaniem cenowym: jednorazowo 39–79 PLN vs 9 PLN/mc vs własny klucz. **Próg: ≥15–20% odwiedzających na waitliście, dominacja opcji jednorazowej** (dane konkurencyjne przewidują polską alergię subskrypcyjną).
4. **Tydzień 2–4 (~200–400 PLN, opcjonalnie):** ruch — jeden polski wpis blogowy / YouTube Short demonstrujący pętlę („iPhone nie transkrybuje po polsku — to to naprawia"), ewentualnie mikro-test reklam FB/Google na PL iPhone. Mierz koszt zapisu na waitlistę; **poniżej ~5 PLN/zapis = zielone światło.**
5. **Przed jakąkolwiek pracą natywną:** wywiady z 3–5 najaktywniejszymi testerami — co nagrywają, czy jednorazowe odblokowanie przy przetwarzaniu przeszkadza, czy zapłaciliby za przetwarzanie offline/on-device. **Opcja C powstaje tylko, jeśli jednocześnie wystąpią: retencja (≥3 użycia/tydzień, utrzymane), gotowość do płacenia i organiczne polecanie.**
6. **Ciągle, za darmo:** przy każdej becie iOS sprawdzaj ryzyko kill — czy polski wszedł do listy języków Voice Memos/„Transcribe Audio" lub Apple Intelligence; weryfikuj `SpeechTranscriber.supportedLocale(equivalentTo: Locale(identifier: "pl-PL"))` na urządzeniu. Jeśli Apple wypuści polski, przeżywalny pitch to destynacja-Notes + tytuły AI + zero-UI — komunikacja walidacyjna powinna testować ten kąt **już teraz**, nie tylko „działa po polsku".

---

## Monetyzacja

**Kontekst cenowy rynku:** dwie czyste ścieżki — tanie jednorazowe/on-device (Just Press Record i Whisper Notes 6,99 USD, Aiko ~22 USD) oraz subskrypcje cloud-AI (Whisper Memos ~40 USD/rok, AudioPen 99 USD/rok bez auto-odnowienia, Voicenotes ~100 USD/rok, Otter ~204 USD/rok jako górna kotwica). **Koszt własny jest pomijalny:** chmurowe STT to 0,003–0,006 USD/min (Groq ~0,0006 USD/min) — intensywny użytkownik (30 h/mc) kosztuje ~1–11 USD/mc. Jednocześnie iOS 26 SpeechAnalyzer skomodytyzował angielską transkrypcję do zera — wartość musi żyć w workflow, nie w samej transkrypcji.

**Rekomendacja dla tego projektu (etap walidacji, solo dev):** nie budować biznesu subskrypcyjnego, zanim ktokolwiek udowodni, że płaci. Konkretnie:

- **Freemium z twardym limitem** (~10 notatek / ~30 min), jedna ścieżka płatna.
- Dopóki rdzeń jest chmurowy (fal.ai + LLM): **pojedynczy nieodnawialny roczny pass ~29,99 USD/rok / analogicznie w PLN**, z framingiem AudioPen „bez auto-odnowienia", plus mały pakiet kredytów dla heavy userów — kredyty inkasują przychód **przed** rachunkiem za API i ograniczają straty na „wielorybach".
- Jeśli w fazie natywnej rdzeń przejdzie on-device (WhisperKit): **jednorazowe 9,99–14,99 USD (39–79 PLN)** z pozycjonowaniem „płacisz raz, bez subskrypcji" — to demonstracyjnie sprzedaje się w tej niszy i jest najłatwiejsze do utrzymania w pojedynkę.
- **Pomijamy:** plany miesięczne, BYOK jako główny model (co najwyżej ukryta opcja), unlimited-lifetime z kosztami chmury (nieograniczone pasywo), oraz wycenę klasy Voicenotes 14,99 USD/mc (wymaga cross-platformu i marki, których nie ma).
- **GTM:** ASO na long-tail, surowe krótkie wideo-dema (założycielskie, nie reklamowe), 20–30 mikroinfluencerów produktywność/ADHD z lifetime za szczerą recenzję, App Intent „Transkrybuj" jako klin dystrybucyjny w r/shortcuts (precedens: Actions→Aiko Sindre Sorhusa), Product Hunt jako jednodniowy event wiarygodności, strony porównawcze SEO („alternatywa dla Whisper Memos" itd.), prasa Apple-niche (MacStories realnie podłapuje indie transkrypcję).
- **Metryki, nie vanity:** >60% konwersji zachodzi w pierwszym tygodniu, ~1/3 w dniu 0 (RevenueCat 2026) — instrumentować konwersję paywalla D0/D7 przed wydaniem złotówki na reklamy. Kalibracja oczekiwań: mediana aplikacji subskrypcyjnej zarabia ~72 USD/mc, a aplikacje AI retencjonują ~36% gorzej — walidować gotowość do płacenia w tygodniach, nie kwartałach.

---

## Roadmapa (fazy)

- **Faza 1 — Osobiste MVP (weekend):** rozszerzenie Transkryby o `POST /api/v1/note` zwracający `{transcript, title}` (z shared-secret!); Shortcut przetwarzający na prawdziwych akcjach iOS 26 (Find Voice Recording, Get Contents of URL, Create Note + Move Notes to Folder); Action Button → Voice Memos; codzienny dogfooding.
- **Faza 2 — Hybryda do współdzielenia + walidacja (tygodnie 1–4):** tokeny per-user, limity rate/kosztów, instalator iCloud Shortcut z import questions, polski landing + waitlista + fake-door cenowy, dystrybucja do polskich społeczności Apple, retencja w logach backendu. **Bramka decyzyjna: liczby retencji i gotowości do płacenia z planu walidacji.**
- **Faza 3 — Płatna hybryda (miesiąc 2–3, tylko po przejściu bramki):** checkout Stripe/Przelewy24 sprzedający tokeny dostępu lub pakiety minut; linia TL;DR i style tytułów; podstawowy status page i docs wsparcia; zbieranie listy zainteresowanych TestFlightem spośród płacących.
- **Faza 4 — Alfa aplikacji natywnej (miesiąc 3–5, bramkowana popytem):** SwiftUI — AppIntent Start Recording (`openAppWhenRun`), kontynuacja w tle z Live Activity pauza/stop, własna przeszukiwalna historia, tier chmurowy Whisper, App Intent `{transcript, title}` + towarzyszący Shortcut Create Note; TestFlight z klientami Fazy 3. **Nigdy nie reklamować „nagrywa przy pełnej blokadzie" ani „zapisuje bezpośrednio do Notes" — oba zakazane przez iOS.**
- **Faza 5 — Wydanie App Store + monetyzacja (miesiąc 5–7):** jednorazowe 39–79 PLN (ekonomia Just Press Record) z opcjonalnym pakietem kredytów lub BYO-key na minuty chmurowe; on-device WhisperKit large-v3-turbo jako premium prywatność/offline; pozycjonowanie „bez konta, nic nie przechowujemy".
- **Faza 6 — Ekspansja i obrona (miesiąc 7+):** kolejne języki osierocone przez Apple (czeski, ukraiński, rumuński) z lokalnymi landingami; drugie destynacje, które aplikacje **mogą** integrować (Notion, Google Drive, Obsidian, webhooki); pogłębianie fosy Notes/tytuły/organizacja, tak by produkt przeżył dzień, w którym Apple doda polską transkrypcję — **traktować to zdarzenie jako zaplanowany trigger pivotu, nie zaskoczenie**.

---

## Ryzyka główne

1. **Apple dodaje polski do transkrypcji (kill risk #1):** dowolny point release kasuje klin językowy z dnia na dzień. Mitygacja: od pierwszego dnia budować i komunikować wartość na destynacji (Notes), tytułach AI i pętli zero-UI; monitorować każdą betę; Faza 6 jako zaplanowany pivot.
2. **Kruchość stosu Shortcuts/Voice Memos:** akcje Voice Memos są nowe (iOS 26), bug locked-start Action Button jest realny, parametr Folder bywa ignorowany, a Apple może zmienić lub zepsuć akcje w każdej aktualizacji. Mitygacja: warstwy zabezpieczeń w Shortcucie (Move Notes to Folder), dokumentacja workaroundów, testy po każdej becie.
3. **Tarcie instalacji i „szklany sufit" Shortcuts:** import questions, nadawanie uprawnień, dwuetapowa pętla (jedno odblokowanie) — część nietechnicznych użytkowników odpadnie; produkt oparty o Shortcut jest też trywialnie kopiowalny. Mitygacja: cena i wartość po stronie serwera (token = produkt), wideo setupowe, walidacja właśnie tego tarcia w tygodniach 1–2.
4. **Otwarte koszty i nadużycia backendu:** obecne proxy fal jest nieautoryzowane; publiczny endpoint bez tokenów i limitów to otwarty portfel. Mitygacja: shared-secret od Fazy 1, tokeny + rate-limity + capy kosztowe przed jakąkolwiek dystrybucją; przejście z `fal.run` na queue dla dłuższych nagrań; limit 4,5 MB body na Vercelu (presigned upload dla długich nagrań).
5. **Rynek może być za mały lub niepłacący:** nisza to podzbiór polskich użytkowników iPhone'a, którzy notują głosem i używają Apple Notes; mediana aplikacji subskrypcyjnej zarabia ~72 USD/mc, aplikacje AI churnują mocniej. Mitygacja: sufit ambicji ustawiony świadomie na „mały, dochodowy produkt indie"; twarde bramki walidacyjne (retencja, fake-door pricing) zanim powstanie cokolwiek droższego niż weekend pracy.
6. **Konkurencja domyka lukę destynacji:** Voicenotes lub inny gracz mógłby dodać przełącznik „eksportuj do Apple Notes". Mitygacja: szybkość (okno 2–3 lata), głębia integracji (foldery, tytuły po polsku, zero-UI) i pozycjonowanie prywatności bez konta, którego silosowe subskrypcje nie skopiują bez kanibalizacji własnego modelu.
7. **Ryzyko regulacyjno-platformowe UE:** funkcje Siri/AI bywają opóźniane w UE; zmiany polityk App Store lub Shortcuts mogą przesunąć grunt. Mitygacja: architektura hybrydowa trzyma zróżnicowaną wartość (STT, tytuły) w kodzie, który posiadamy po stronie serwera.
8. **Bus factor = 1:** solo developer, chmurowy backend, użytkownicy zależni od działającego endpointu. Mitygacja: minimalna powierzchnia operacyjna (Vercel zero-ops), status page od Fazy 3, model on-device w Fazie 5 jako droga do produktu działającego bez serwera.