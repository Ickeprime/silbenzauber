# Codex-Übergabe – Silbenzauber (Stand: 14.10.2026)

## Projekt
**Silbenzauber** ist eine kostenfreie, browserbasierte Lese-Übungsmaschine für den Grundschulunterricht, besonders für das Lesenlernen. Kinder drücken „START“ und lesen die angezeigten Silben. Lehrkräfte können Walzenzahl, Vokale, Konsonanten, Silbenauswahl je Walze, Sterne, Ton und reduzierte Bewegung festlegen.

## Aktuelle Adressen
- Repository: https://github.com/Ickeprime/silbenzauber
- Öffentliches Hosting: https://silbenzauber.pages.dev/
- Zusätzliche ältere Worker-URL: https://silbenzauber.andreas-wolter.workers.dev/
- Wunschadresse **silbenzauber.lessqq.de**: DNS-Einrichtung bei checkdomain/Cloudflare Pages läuft separat; Status vor jeder Änderung im Dashboard prüfen.

## Ist-Zustand – unbedingt beachten
- Die Web-App liegt **direkt im Repository-Stammverzeichnis**: `index.html`, `styles.css`, `app.js`, `logic.js`.
- **Nicht** von einem `public/`-Ordner ausgehen. Aktuelles Cloudflare-Pages-Deployment: Branch `main`, Framework `None`, Build command `exit 0`, Output-Verzeichnis `.`.
- Änderungen an `main` können automatisch neu veröffentlicht werden. Deshalb Änderungen über Feature-Branch/Pull Request vorschlagen; nicht ohne Freigabe direkt deployen.
- Node.js-Testdatei `tests/logic.test.js` existiert und ist mit `node --test tests/logic.test.js` ausführbar.
- Keine Datenbank und keine Anmeldung notwendig. Konfiguration wird im Browser gespeichert.

## Pädagogisch und visuell verbindlich
1. Große, ruhige, **grüne** Maschine; **Druckschrift** mit klaren Buchstaben; keine Deko-Sterne außerhalb der Walzen.
2. **2 bis 5 Walzen**, jede zeigt ganze offene Silben. Walze 1 bleibt sternfrei. Die Standardschreibweise ist dort `Ma`; Standard für Walze 2 ff. ist `ma`. Lehrkräfte können jede Walze unabhängig auch auf `ma` oder `MA` umstellen. Sterne sind ab Walze 2 optional.
3. Nur bewusst von Lehrkräften gewählte Silben dürfen erscheinen.
4. Erstlesen statt Gamification: kein Punktedruck, keine Werbung, keine unnötigen Reize.
5. Deutschsprachig und gut bedienbar auf Tablets, Smartphones und interaktiven Tafeln.
6. Bisher: einfache zweibuchstabige CV-Silben mit Vokalen `A E I O U Ä Ö Ü` und ausgewählten Konsonanten. **`sch`, `ch`, `au`, `ei`, `eu`, geschlossene Silben und komplexe Mehrfachsilben sind noch nicht umgesetzt**.

## Arbeitsweise für Codex
- Lies zuerst `AGENTS.md`, `README.md`, `logic.js` und `app.js`.
- Starte `node --test tests/logic.test.js` und ergänze Tests für Fehlerbehebungen.
- Arbeite schrittweise auf eigenem Branch mit Pull Request und verständlicher Änderungsbeschreibung.
- Schütze die bestehende Funktion der Live-Seite; keine Änderungen an DNS, Domains, Cloudflare, GitHub-Zugriffsrechten oder Secrets ohne gesonderte Freigabe.

## Erste Aufgaben
**Aufgabe A (zuerst):** Vollständige technische Bestandsaufnahme und systematische Browser-/Mobile-Tests. Prüfe insbesondere Walzenauswahl, Groß-/Kleinschreibung, Sternverbot auf Walze 1, 2–5 Walzen, ungültige/leer werdende Auswahl, Speichern und Wiederherstellen. Berichte über Fehler und erstelle nur klar begründete Korrekturen als Pull Request.

**Aufgabe B (nach Freigabe):** Lehrkräfte-Vorlagen für die 1. Klasse (z. B. Ma/Mi/Mo; La/Li/Lo; silbenlesende Progressionen) als zusätzliche Auswahl, ohne die individuelle Konfiguration zu entfernen.

**Aufgabe C (später):** Pädagogisch kontrollierbare mehrbuchstabige Buchstabenverbindungen und Diphthonge (sch, ch, au, ei, eu) – erst nach Abstimmung mit dem Nutzer.

## Erste Codex-Aufgabe (zum Kopieren)
„Öffne `Ickeprime/silbenzauber`, lies zuerst `AGENTS.md` und `CODEX_HANDOFF.md` sowie den Quellcode. Prüfe den aktuellen Stand einschließlich der Tests mit `node --test tests/logic.test.js`. Untersuche die Bedienung auf Tablet, Mobilgerät und Desktop. Achte unbedingt auf die Regeln: erste Walze Großbuchstabe und niemals Stern, alle weiteren Walzen Kleinbuchstaben; grüne Maschine in Druckschrift ohne äußere Deko-Sterne; individuelle Silbenauswahl für Lehrkräfte. Identifiziere konkrete Fehler und erstelle für notwendige Codeänderungen einen Pull Request. Verändere nicht den Cloudflare- oder DNS-Aufbau und führe keine eigenständige Veröffentlichung durch.“
