# Silbenzauber 0.3 – Design- und Funktionsupdate

## Schreibweise je Walze

Lehrkräfte können für jede Walze unabhängig zwischen Anfangsbuchstabe groß (`Ma`), alles klein (`ma`) und alles groß (`MA`) wählen. Die Auswahl wird zusammen mit der bestehenden Konfiguration im Browser gespeichert. Bereits gespeicherte Einstellungen ohne Schreibweisen-Feld werden beim Laden beibehalten und mit Walze 1 auf `Ma` sowie allen weiteren Walzen auf `ma` ergänzt.

## Sternregel

Wenn Sterne auf mindestens einer Walze ab Walze 2 freigegeben sind, erzwingt die Spiellogik nach drei sternlosen Drehungen beim nächsten Ergebnis mindestens einen Stern. Der Zähler wird bei einem Stern zurückgesetzt und lokal gespeichert, damit ein Neuladen ihn nicht zurücksetzt. Sind alle Sternoptionen aus, bleibt die Regel ausgesetzt. Walze 1 bleibt unabhängig von der Konfiguration sternfrei.

## Animation und Geräusche

Die Walzen zeigen beim Drehen mehrere Silben in einem vertikalen Laufband. Die Bewegung stoppt mit einer sanften Verzögerung nacheinander je Walze; ein kurzes Einrasten markiert jeden Stopp. Bei reduzierter Bewegung wird das Laufband übersprungen. Start-, Lauf-, Stopp- und Endtöne werden synthetisch mit der Web Audio API erzeugt, leise begrenzt und nur nach Bedienung durch das Kind abgespielt. Die Tonoption bleibt abschaltbar.

## Gestaltung und Bedienung

Das Gehäuse, die vertieften Walzenfenster und die große Startfläche wurden in ruhigen Grüntönen plastischer gestaltet. Auf Geräten mit Maus zeigt ein kleiner, selbst gezeichneter Zauberstab-Cursor die ganze Seite; Textfelder behalten den Textcursor. Touchgeräte erhalten keine Cursoränderung. Es gibt keine dekorativen Sterne außerhalb der Walzen und kein Punktesystem.

Der Nutzer meldet die Originalschrift unter `fonts/Druckschrift_BY_WOK.ttf`; im aktuellen Checkout fehlt der Ordner `fonts/` und die Datei konnte auch im Projektverzeichnis nicht gefunden werden. Deshalb wurden weder Schriftdatei noch Metadaten unabhängig geprüft. Laut Nutzerangabe enthält die Originaldatei SIL Open Font License 1.1, Copyright Wolfram Esser (2008) und Reserved Font Name `Druckschrift_BY_WOK`. Die Schrift wurde nicht rekonstruiert oder eingebunden; Arial/Helvetica bleibt aktiv. Das Sternsymbol verwendet explizit Arial/Helvetica als Fallback. Die Integration und vollständige OFL-Datei sind offen, bis das unveränderte Original samt Lizenzkopf im Checkout liegt. Offizieller Lizenztext: [SIL Open Font License 1.1](https://openfontlicense.org/open-font-license-official-text/).

## Qualitätssicherung

- `node --test tests/logic.test.js`
- `node --check app.js`
- `node --check logic.js`
- `git diff --check`
- Unit-Tests decken Schreibweisen je Walze, Migration alter Einstellungen, Sternverbot auf Walze 1 und die Vier-Drehungen-Regel ab.

Die Spiel- und Einstellungslogik bleibt ohne Build-Abhängigkeiten in `logic.js`; Darstellung und Audio-Orchestrierung liegen in `app.js` und `styles.css`. Die Einstellungen für Walzenzahl, Buchstaben, individuelle Silben, Sterne, Ton und reduzierte Bewegung bleiben erhalten.
