# Anweisungen für Codex – Silbenzauber

## Zielgruppe

Kinder in der Grundschule, besonders beim Lesenlernen, Lehrkräfte, Tablets und Smartboards.

## Unveränderliche Spielregeln

1. Walze 1 zeigt **nie** einen Stern. Die Standardschreibweise ist mit **Großbuchstaben am Anfang** (z. B. `Ma`).
2. Jede Walze kann unabhängig auf Großbuchstaben am Anfang, alles klein oder alles groß gestellt werden. Standard sind Walze 2–5 in Kleinbuchstaben (`ma`).
3. Ganze Silben pro Walze; keine Aufteilung in Einzelbuchstaben ohne neue Produktanforderung.
4. Sterne als optionale Lesepause nur ab Walze 2.
5. Lehrkräfte konfigurieren Buchstaben, mögliche Silben, Schreibweise und Sternoptionen pro Walze.
6. Nicht ausgewählte Silben dürfen nicht zufällig erscheinen.
7. Es muss immer mindestens eine vorlesbare Silbe pro Walze verfügbar sein.

## Oberfläche

- Name: **Silbenzauber**.
- Freundliche, nicht grelle **grüne** Maschine.
- **Druckschrift**: klare serifenlose Schrift, keine Zierschrift.
- **Keine Deko-Sterne außerhalb der Walzen**.
- Wenig Ablenkung, gute Lesbarkeit, große Bedienflächen, mobile Bedienbarkeit.
- Deutsche UI-Sprache, verständliche kurze Anweisungen.
- Einstellungen der Lehrkräfte nicht während laufender Drehung verändern.

## Code und Veröffentlichung

- Statische HTML-, CSS- und JavaScript-Anwendung ohne erforderliche Build-Abhängigkeiten.
- Die veröffentlichten HTML-, CSS- und JS-Dateien liegen im Repository-Stammverzeichnis: `index.html`, `styles.css`, `app.js`, `logic.js` (kein `public/`-Ordner).
- Cloudflare Pages: Build `exit 0`, Output `.`, Hauptbranch `main`. `main` wird bei Änderungen automatisch erneut veröffentlicht.
- Reine Spiellogik in `logic.js`; UI in `app.js`.
- Vor einem Pull Request die Node-Tests ausführen: `node --test tests/logic.test.js`.
- Bei neuen Spielfunktionen Tests ergänzen.
- Keine Tokens, Passwörter, API-Schlüssel oder personenbezogenen Lerndaten ins Git-Repository aufnehmen.

## Sicherer Entwicklungsablauf

- Lies zu Beginn auch `CODEX_HANDOFF.md` für aktuellen Projektstand, Deployment und erste Aufgaben.
- Änderungen vorzugsweise auf einem Feature-Branch durchführen und als Pull Request zur Prüfung vorlegen; keine direkte Veröffentlichung ohne Freigabe.
- Cloudflare-/checkdomain-DNS, Zertifikate, Domains und Berechtigungen nicht eigenmächtig verändern.

## Geplante, aber noch nicht vorhandene Funktionen

- Mehrbuchstabige Silben und Laute (`sch`, `ch`, `au`, `ei`, `eu`, ...)
- Pädagogisch kuratierte Unterrichts-Vorlagen
- Teilen von Übungskonfigurationen per Link
- Offlineinstallation als PWA

Bitte diese Punkte nicht als bereits implementiert darstellen.
