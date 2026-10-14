# Anweisungen für Codex – Silbenzauber

## Zielgruppe

Erstleserinnen und Erstleser in Klasse 1, Lehrkräfte, Tablets und Smartboards.

## Unveränderliche Spielregeln

1. Walze 1 zeigt **nie** einen Stern und formatiert jede Silbe mit **Großbuchstaben am Anfang** (z. B. `Ma`).
2. Walzen 2–5 zeigen die Silben **kleingeschrieben** (`ma`).
3. Ganze Silben pro Walze; keine Aufteilung in Einzelbuchstaben ohne neue Produktanforderung.
4. Sterne als optionale Lesepause nur ab Walze 2.
5. Lehrkräfte konfigurieren Buchstaben, mögliche Silben und Sternoptionen pro Walze.
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
- Öffentlich ausgelieferter Inhalt in `public/`.
- Cloudflare Pages: Build `exit 0`, Output `public`, Hauptbranch `main`.
- Reine Spiellogik in `public/logic.js`; UI in `public/app.js`.
- Vor einem Pull Request die Node-Tests ausführen: `node --test tests/logic.test.js`.
- Bei neuen Spielfunktionen Tests ergänzen.
- Keine Tokens, Passwörter, API-Schlüssel oder personenbezogenen Lerndaten ins Git-Repository aufnehmen.

## Geplante, aber noch nicht vorhandene Funktionen

- Mehrbuchstabige Silben und Laute (`sch`, `ch`, `au`, `ei`, `eu`, ...)
- Pädagogisch kuratierte Unterrichts-Vorlagen
- Teilen von Übungskonfigurationen per Link
- Offlineinstallation als PWA

Bitte diese Punkte nicht als bereits implementiert darstellen.
