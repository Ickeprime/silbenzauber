# Bedienbarkeitsprüfung

Prüfung der Oberfläche mit Blick auf Smartphones im Hochformat, Tablets im Hoch- und Querformat sowie interaktive Tafeln. Die Projektvorgaben für den Grundschulunterricht bleiben maßgeblich: grüne Maschine, serifenlose Druckschrift, Walze 1 ohne Stern, ganze Silben, einzeln auswählbare Silben und voreingestellte Schreibweise `Ma` auf Walze 1 sowie `ma` auf den weiteren Walzen. Lehrkräfte können die Schreibweise jetzt pro Walze auf `Ma`, `ma` oder `MA` stellen.

## Gefundene Probleme und Änderungen

| Bereich | Problem | Änderung |
| --- | --- | --- |
| Smartphone, schmale Ansicht mit fünf Walzen | Die feste Schriftgröße konnte die Silbe der ersten Walze (`Ma`) in einer schmalen Zelle abschneiden. | Schriftgröße für vier und fünf Walzen skaliert jetzt auch an schmalen Ansichten mit der verfügbaren Breite. Die ganze Silbe bleibt die Anzeigeeinheit. |
| Sehr schmales Smartphone, 320 CSS-Pixel | Der Text im Einstellungsbutton verbreiterte den Kopfbereich über den Bildschirmrand. | Bei höchstens 375 CSS-Pixeln bleibt das Zahnradsymbol als kompakter, mindestens 44 Pixel großer Button sichtbar; `aria-label` erhält den zugänglichen Namen. |
| Alle Geräte | Die weiße Statusanweisung auf halbtransparentem Grün hatte zu wenig Kontrast. | Die Anweisung hat nun einen hellen, deckenden Hintergrund mit dunkler grüner Schrift. |
| Touchbedienung | Schließen-Schaltfläche und „Alle/Keine“-Aktionen unterschritten knapp die angestrebte 44-Pixel-Touchfläche. | Schließen-Schaltfläche und Aktionsschaltflächen sind mindestens 44–48 Pixel groß; die Aktionen der Silbenauswahl behalten gut nutzbare Abstände. |
| Individuelle Auswahl | Die Zusammenfassung zeigte alle aus Buchstaben erzeugbaren Silben als „aktive“ Silben, auch wenn Lehrkräfte einzelne davon abgewählt hatten. | Sie zeigt jetzt nur die Anzahl der gewählten Silben pro Walze und suggeriert nicht, dass abgewählte Silben im Spiel vorkommen. |
| Tablet quer / interaktive Tafel | Die Maschine blieb auf 700 Pixel begrenzt und nutzte breite Bildschirme wenig aus. | Maschine, Auswahlübersicht und Anleitung können bis 900 Pixel breit werden; auf breiten Ansichten wachsen Walzen und Schrift mit. |
| Schreibweise | Die Schreibweise war an die Walzennummer gebunden und ließ sich nicht an unterschiedliche Leseziele anpassen. | Jede Walze kann unabhängig auf Anfangsbuchstabe groß, Kleinbuchstaben oder Großbuchstaben eingestellt werden; die Klassenstufen-Standards bleiben voreingestellt. |
| Lesepausen | Bei dauerhaftem Zufall konnten erlaubte Sterne lange ausbleiben. | Bei mindestens einer aktiven Sternoption ab Walze 2 wird spätestens nach drei sternlosen Ergebnissen eine Lesepause gezeigt. Walze 1 bleibt sternfrei. |
| Dreh-Feedback | Die bisherige Drehung wechselte Symbole sprunghaft, statt die Walzenbewegung sichtbar zu machen. | Vertikale Silben-Laufbänder stoppen zeitversetzt. „Wenig Bewegung“ überspringt die Animation; Töne lassen sich abschalten. |
| Mauszeiger | Der Zauberstab war nur über Bedienelementen sichtbar, nicht auf freien Flächen oder der Maschine. | Auf Geräten mit Maus und Hover gilt er jetzt seitenweit. Texteingaben behalten den Textcursor; Touchgeräte erhalten keine Cursoränderung. |
| Druckschrift-Datei | Die Datei war nicht im Checkout, wurde aber im lokalen Downloads-Ordner unter ihrem exakten Namen gefunden. | Das unveränderte Original ist nun in `fonts/Druckschrift_BY_WOK.ttf`; TTF-Metadaten bestätigen Copyright Wolfram Esser (2008), SIL Open Font License 1.1 und Reserved Font Name `Druckschrift_BY_WOK`. `fonts/OFL.txt` enthält den vollständigen eingebetteten Lizenztext. Walzensilben, Silbenauswahl, Vorschau und Schreibweisen-Beispiele bevorzugen die Schrift. Das Sternsymbol bleibt bei Arial/Helvetica. Die Glyphentabelle deckt `Ä Ö Ü ä ö ü ß` ab; Browser-Lade- und Beschnittprüfung steht noch aus. |

## Gerätegrößen

- **Smartphone, 320–480 CSS-Pixel:** Die Walzenanzahl 4 und 5 erhält eine schmalere, responsive Schrift. Bedienknöpfe und Silben-Chips bleiben groß genug für Touch; Schreibweisen-Schaltflächen umbrechen bei Bedarf.
- **Tablet, etwa 740–1024 CSS-Pixel:** Die Oberfläche bleibt flüssig, das Einstellungsfenster nutzt höchstens 94 % der Breite und kann vertikal scrollen.
- **Interaktive Tafel, ab 1000 CSS-Pixel:** Maschine und Walzen nutzen die zusätzliche Fläche, die Schrift wird größer und die Inhaltsbreite bleibt begrenzt, damit Zeilen lesbar bleiben.

## Prüfung

`node --test tests/logic.test.js` besteht mit 11 Tests. Der Gesamtlauf `node --test` besteht mit 18 Tests (einschließlich der älteren Tests im Repository-Stamm). Zusätzlich wurden `node --check app.js`, `node --check logic.js` und `git diff --check` ausgeführt.

Im lokalen Browser (Viewport 1265 × 720 CSS-Pixel) wurden zuvor Speichern und Wiederherstellen der Schreibweise, 2–5 Walzen, laufende und reduzierte Bewegung, Ton-Einstellung sowie die Rückkehr zu den Standardwerten geprüft. Auch vier und fünf Walzen wurden bei 320 × 800 und 375 × 812 CSS-Pixeln visuell mit der damaligen Systemschrift geprüft; die Dokumentbreite blieb innerhalb des Viewports. Diese Viewport-Emulation war kein Test auf physischen Mobilgeräten und fand vor der Einbindung der Originalschrift statt. In der aktuellen Sitzung ließ sich die lokale Browser-Vorschau nicht öffnen, daher sind die neue Schrift im Browser, Zellbreiten und Beschneidung bei 2–5 Walzen auf Smartphone, Tablet und Desktop noch nicht visuell bestätigt. Die Unicode-Glyphentabelle der TTF enthält `Ä Ö Ü ä ö ü ß` und alle Buchstaben aus `Ma`, `ma`, `MA`, `La`, `li`, `Mo`, `Su` sowie nicht das Sternsymbol.
