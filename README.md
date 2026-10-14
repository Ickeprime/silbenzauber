# Silbenzauber – Web-App für die Schulanfangsphase

Der **Silbenzauber** ist eine einfache Web-App, in der Kinder durch Drehen von Walzen Silben lesen üben. Lehrkräfte können Buchstaben, Silben und Sternfelder pro Walze auswählen.

## Funktionen

- 2–5 Walzen mit vollständigen offenen Silben nach dem Muster *Konsonant + Vokal*
- Erste Walze: **großer Anfangsbuchstabe**, nie ein Stern
- Alle weiteren Walzen: **kleine Buchstaben**, Sterne optional
- Frei wählbare Vokale (A E I O U Ä Ö Ü) und Konsonanten (B C D F G H J K L M N P Q R S T V W X Y Z)
- Pro Walze eine eigene Silbenauswahl
- Großes Bedienfeld, ruhige grüne Maschine, Druckschrift, einstellbare Bewegung und Ton
- Einstellungen bleiben im jeweiligen Browser gespeichert

> Aktueller Funktionsumfang: zweibuchstabige offene Silben (CV). Mehrbuchstabige Laute wie `sch`, `ch`, `au`, `ei` und `eu` oder geschlossene Silben sind noch nicht Teil dieser Version.

## Projektaufbau

\`\`\`text
Silbenzauber/
├── index.html
├── styles.css
├── logic.js
├── app.js
├── tests/
│   └── logic.test.js
├── README.md
├── AGENTS.md
├── CODEX_HANDOFF.md
└── VEROEFFENTLICHUNG.md
\`\`\`

## Lokal ausführen

Doppelklick auf `index.html` oder im Projektordner mit Python:

```bash
python -m http.server 8000
```

Danach im Browser `http://localhost:8000` öffnen. Wenn lokale Dateizugriffe blockiert werden, bitte die Servervariante verwenden.

## Tests

```bash
node --test tests/logic.test.js
```

## Cloudflare Pages

- Framework: **None**
- Production branch: **main**
- Build command: **exit 0** (oder leer lassen)
- Build output directory: **.** (Repository-Stammverzeichnis)
- Root directory: **Repository-Stammverzeichnis** (Standard)
- Keine Umgebungsvariablen erforderlich

Detaillierte Klick-für-Klick-Anleitung: [VEROEFFENTLICHUNG.md](VEROEFFENTLICHUNG.md).

## Änderungen in Codex

Codex kann dieses Repository zur Weiterentwicklung öffnen. Die Projektregeln sind in [AGENTS.md](AGENTS.md) notiert. Die aktuelle Übergabe und nächste Aufgabe stehen in [CODEX_HANDOFF.md](CODEX_HANDOFF.md). Bitte Änderungen über Pull Requests prüfen und erst danach in `main` übernehmen.

## Datenschutz

Die Anwendung benötigt kein Nutzerkonto und keinen Backend-Server; die Einstellungen liegen lokal im Browser. Bei einer Veröffentlichung über einen Hostinganbieter fallen üblicherweise technisch notwendige Zugriffs-/Serverdaten an. Die rechtlichen Anforderungen an deine konkrete Website (z. B. Impressum und Datenschutzhinweise) bitte vor öffentlicher Nutzung prüfen.
