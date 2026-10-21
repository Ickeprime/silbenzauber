# Zahlenzauber – Affenwurf

**Eigenständige Mathe-Unterseite der Silbenzauber-Serie für die Grundschule.**

Pfad: \`/zahlenzauber/\`. Vom Silbenzauber-Startbildschirm führt der Link **🎯 Zahlenzauber** hierher; der Link **🏠 Silbenzauber** führt zurück. Die bestehende Lese-App wird nicht umgebaut.

## Kinderansicht

1. **Drei rote Bälle** liegen auf dem geraden Holzbrett.
2. Ein Klick auf den **Affen** löst einen zufälligen Wurf aus. Kein Zielen nötig.
3. Nach dem ersten Wurf sind unten **2 rote Bälle + 1 grauer Platzhalter**, nach dem zweiten **1 roter Ball + 2 graue** zu sehen.
4. Getroffene Bälle **bleiben auf der sichtbaren Scheibe**. Bei einem erlaubten Fehlwurf liegt der Ball **außerhalb der Scheibe**; er zählt **0 Punkte**.
5. Nach dem dritten Wurf wird das Ballbrett **am selben Ort zum Rechenbrett**. Drei Zahlen und **drei Antwortmöglichkeiten** erscheinen, genau eine ist richtig.
6. **Richtig:** jubelnder Affe und Stern. **Falsch:** Augen-zuhaltender Affe 🙈 und Anzeige des Ergebnisses. In beiden Fällen startet **„Nochmal“** die nächste Runde.

Die Zielscheibe und die Würfe bleiben SVG-basiert. Die Dschungelkulisse und der Affe sind lokale WebP-Illustrationen; Schilder, Holzrahmen, Bälle und Bedienflächen werden mit CSS gestaltet. Die Spieloberfläche folgt der beschriebenen Dschungel- und Holzrichtung, ist aber **kein pixelgenaues Exportbild** des ursprünglichen Design-Mockups.

## Lehrkraft-Einstellungen

Über **⚙️ Lehrkraft** erreichbar:

| Feld | Wirkung |
| --- | --- |
| Zahlenart | Nur Zehnerzahlen oder gemischte positive Zahlen |
| Höchste normale Feldzahl | Obergrenze für die **äußeren und inneren normalen Zahlenfelder** (1–1000, im Zehnermodus in Zehnerschritten) |
| Höchste Gesamtsumme | Obergrenze der **Summe der drei Wurfwerte** (bis 3000) |
| Mitte (100) | **Normal treffen**, **nie treffen**, **erst nach zwei Nieten möglich** |
| Fehlwürfe / Nieten | Ein Wurf kann die Scheibe verfehlen und zählt dann **0** |

Die **100 bleibt in der Scheibenmitte sichtbar** und ist ein *Sonderfeld*: Sie zählt nicht zum Feld-Maximum der normalen Felder. Ob sie getroffen werden darf, bestimmt die Mitte-Regel **und zusätzlich die maximale Gesamtsumme**. Beispiel: Ohne Fehlwürfe und mit Maximalsumme 100 ist ein 100er-Treffer rechnerisch unmöglich. Bei **zwei Nieten (0 + 0)** kann der dritte Wurf die 100 treffen, wenn dies in den Einstellungen zugelassen ist. Ein möglicher Treffer wird **nicht garantiert**.

**Speichern** schreibt die Konfiguration in den \`localStorage\` dieses Browsers/Geräts (Schlüssel \`zahlenzauber-settings-v1\`) und startet eine neue Runde. **Abbrechen** verwirft die Änderungen; **Zurücksetzen** füllt Standardwerte ins Formular, die anschließend gespeichert werden können. Bei gesperrtem Browserspeicher gilt eine Änderung nur für die aktuelle Sitzung. Eine Synchronisation zwischen Geräten findet nicht statt.

**Standardeinstellung:** Zehnerzahlen, Feldmaximum 100, Summe maximal 100, Mitte erst nach zwei Nieten möglich, Nieten erlaubt.

## Treffer- und Rechenregeln

- Die Normalfelder sind beim Beginn einer Runde mit gültigen Zahlen beschriftet und ändern sich **während der drei Würfe nicht**.
- Ein Treffer nutzt **genau ein existierendes Feld** und zeigt dessen Wert; dasselbe konkrete Feld kann in einer Runde nicht zweimal gewählt werden.
- Ein Wurf darf nur gewählt werden, wenn die bisherige Summe, die Trefferzahl und **alle restlichen Würfe** die Höchstsumme noch einhalten können.
- Ohne Nieten werden mindestens **10 Punkte (Zehnerzahlen)** bzw. **1 Punkt (gemischt)** pro restlichem Wurf reserviert.
- Mit Nieten darf die Reserve für einen künftigen Wurf **0** sein.
- Ein 100er-Mittentreffer ist nur dann ein Kandidat, wenn er die Gesamtsumme nicht überschreitet und der Mitte-Modus ihn erlaubt.
- Bei „erst nach zwei Nieten“ gilt: nur **Wurf 3**, und nur wenn **Wurf 1 und Wurf 2 Nieten** waren.
- Drei Antwortfelder werden aus dem erlaubten Zahlenraum generiert, mit **genau einer korrekten Antwort**.

Die **Nieten-Wahrscheinlichkeit** ist eine spielerische Gewichtung, keine feinmotorische Treffer-Simulation. Die Lehrkraft steuert den *erlaubten* Zahlenraum; genaue Trefferquoten sind in dieser Version nicht getrennt einstellbar.

## Technisches

Reine statische Webanwendung, kein Backend, keine Anmeldung, keine fremden Skripte. Dateien:
- \`index.html\` – HTML-Seite, Affe, Lehrkraft-Dialog
- \`style.css\` – responsive Dschungel-/Holzoberfläche und Animationen
- \`assets/jungle-clearing.webp\`, \`assets/monkey-mascot.webp\` – lokale Spielillustrationen
- \`logic.js\` – testbarer Zufallsgenerator, Regeln, Antworterstellung
- \`app.js\` – Animationen, Zustandswechsel, Anzeige, Speicher
- \`tests/logic.test.js\` – Grenzfalltests

### Tests

\`\`\`sh
node --test zahlenzauber/tests/logic.test.js
node --check zahlenzauber/logic.js
node --check zahlenzauber/app.js
\`\`\`

## Ausblick

Optional: passwortgeschütztes Lehrkraft-Menü, bessere Zeichenillustrationen (Affen-PNG/SVG), Klang-Effekte, Schwierigkeitsprofile, visuelle Zugänglichkeitsprüfung auf realen Touchgeräten. Diese Punkte sind nicht Teil dieser ersten spielbaren Version.


## Version 0.2: Lehrkraft-Speicherung, Ton und optische Überarbeitung

- Die aktive Konfiguration steht sichtbar unter der Spielanweisung (Zahlenart, Feldgrenze, Summengrenze).
- **Speichern** übernimmt die Werte und blendet eine ausdrückliche Meldung **„Einstellungen gespeichert!“** ein. Nach einem Neustart werden sie aus dem Browser-Speicher wiederhergestellt.
- Die unvereinbare Kombination **„Nieten ausschalten“ + „100 erst nach zwei Nieten“** wird direkt aufgelöst: Beim Ausschalten der Nieten wird die Mitte auf **nie treffen** gesetzt. Wird die Spezialregel gewählt, werden Nieten wieder aktiviert. Ein Hinweis erklärt die Anpassung.
- Fehlerhafte Zahleneingaben werden im Dialog erklärt; die Fehlermeldung wird in den sichtbaren Bereich gebracht.
- Über **🔊 Ton an / 🔇 Ton aus** lassen sich Wurf-, Treffer-, Fehlwurf- und Jubelgeräusche aktivieren. Der Ton startet **standardmäßig ausgeschaltet**, die Auswahl wird lokal gespeichert. Die Klänge entstehen direkt über die Web-Audio-API; es werden keine fremden Audiodateien geladen.
- Holztafeln, Affe, bunte Zielscheibe, Bälle, Dschungelhintergrund, Schatten und Feedback sind gestalterisch überarbeitet. Die Illustrationen liegen lokal im App-Unterordner; beim Spielen werden keine externen Grafiken geladen.
- Die bisherige Silbenzauber-App bleibt unverändert.

### Browser-Smoke-Test

Neben den Node-Logiktests enthält das Projekt einen **Playwright-Chromium-Test**, der auf der GitHub-Actions-Pipeline ausgeführt wird. Er prüft das Speichern über einen echten **Seiten-Reload**, den Formular-Konflikt, die Ton-Einstellung, drei Würfe, Summenfrage, Feedback sowie Mobile/Desktop-Screenshots.

\`\`\`sh
npm install --no-save playwright@1.56.1
npx playwright install chromium
node zahlenzauber/tests/browser-smoke.cjs
\`\`\`


## Design-Freigabe in vier Blöcken – Stand PR #5

**Block 1 (vom Projektinhaber freigegeben):** Dschungel-/Wasserfallkulisse, Haupttitel, Bild-Affe und neue Holzschaltflächen. Diese Gestaltung wurde in Blöcken 2–4 nicht ausgetauscht.

**Block 2 – Zielscheibe und Rechenbrett:**
- Mehrstufiger Holzrahmen, Lichtkanten und dezente Nieten am Zielscheibenrand.
- Glänzende, rot-weiße Trefferbälle mit kleinem Zahlenetikett: Punkte bleiben lesbar, auch wenn ein Ball die aufgedruckte Zahl verdeckt.
- Drei noch verfügbare Bälle rot, verbrauchte Bälle grau; der bestehende Wechsel auf das Rechenbrett **erst nach Wurf 3** bleibt erhalten.
- Gemeinsame Holzfläche für Bälle, Gleichung und drei große Antwortknöpfe mit kleinen Buchstaben A/B/C.

**Block 3 – Affe und Feedback:**
- Deutlichere Wurf- und Jubelbewegung, freundliche Reaktion bei Fehlern (🙈) und Sterne bei Erfolg.
- Für falsche Antworten ermutigendes „Noch nicht richtig!“ statt einer abwertenden Formulierung; die richtige Summe wird gezeigt.
- Neustartbutton heißt weiterhin exakt **„Nochmal“**.
- Tastaturfokus wandert nach Auswertung zu „Nochmal“ und beim Neustart zurück zum Affen.

**Block 4 – Feinschliff und Tests:**
- Zusätzliche Regeln für 320/350/390/700-Pixel-Smartphones, kontrastreichere Spieltafeln und zugängliche Fokusmarkierungen.
- Animationen werden bei aktivierter Systemeinstellung „Bewegung reduzieren“ deaktiviert.
- Der automatisierte Chromium-Test kontrolliert die neue Punkteanzeige, den Zustand des Rechenbretts, Tastaturfokus und horizontale Überläufe bei sechs Bildschirmbreiten.
- Lehrkraft-Speicherung, Sounds, alle drei Würfe und Summenbegrenzung sind unveränderte Spielfunktionen.

**Noch nicht veröffentlicht:** Diese Änderungen liegen ausschließlich auf dem Feature-Branch und in PR #5. Die Veröffentlichung benötigt eine separate Freigabe.
