# Bedienbarkeitsprüfung

Prüfung der Oberfläche mit Blick auf Smartphones im Hochformat, Tablets im Hoch- und Querformat sowie interaktive Tafeln. Die Projektvorgaben für Klasse 1 bleiben maßgeblich: grüne Maschine, serifenlose Druckschrift, Walze 1 ohne Stern, ganze Silben, einzeln auswählbare Silben und voreingestellte Schreibweise `Ma` auf Walze 1 sowie `ma` auf den weiteren Walzen. Lehrkräfte können die Schreibweise jetzt pro Walze auf `Ma`, `ma` oder `MA` stellen.

## Gefundene Probleme und Änderungen

| Bereich | Problem | Änderung |
| --- | --- | --- |
| Smartphone, schmale Ansicht mit fünf Walzen | Die feste Schriftgröße konnte die Silbe der ersten Walze (`Ma`) in einer schmalen Zelle abschneiden. | Schriftgröße für vier und fünf Walzen skaliert jetzt auch an schmalen Ansichten mit der verfügbaren Breite. Die ganze Silbe bleibt die Anzeigeeinheit. |
| Alle Geräte | Die weiße Statusanweisung auf halbtransparentem Grün hatte zu wenig Kontrast. | Die Anweisung hat nun einen hellen, deckenden Hintergrund mit dunkler grüner Schrift. |
| Touchbedienung | Schließen-Schaltfläche und „Alle/Keine“-Aktionen unterschritten knapp die angestrebte 44-Pixel-Touchfläche. | Schließen-Schaltfläche und Aktionsschaltflächen sind mindestens 44–48 Pixel groß; die Aktionen der Silbenauswahl behalten gut nutzbare Abstände. |
| Individuelle Auswahl | Die Zusammenfassung zeigte alle aus Buchstaben erzeugbaren Silben als „aktive“ Silben, auch wenn Lehrkräfte einzelne davon abgewählt hatten. | Sie zeigt jetzt nur die Anzahl der gewählten Silben pro Walze und suggeriert nicht, dass abgewählte Silben im Spiel vorkommen. |
| Tablet quer / interaktive Tafel | Die Maschine blieb auf 700 Pixel begrenzt und nutzte breite Bildschirme wenig aus. | Maschine, Auswahlübersicht und Anleitung können bis 900 Pixel breit werden; auf breiten Ansichten wachsen Walzen und Schrift mit. |
| Schreibweise | Die Schreibweise war an die Walzennummer gebunden und ließ sich nicht an unterschiedliche Leseziele anpassen. | Jede Walze kann unabhängig auf Anfangsbuchstabe groß, Kleinbuchstaben oder Großbuchstaben eingestellt werden; die Klassenstufen-Standards bleiben voreingestellt. |
| Lesepausen | Bei dauerhaftem Zufall konnten erlaubte Sterne lange ausbleiben. | Bei mindestens einer aktiven Sternoption ab Walze 2 wird spätestens nach drei sternlosen Ergebnissen eine Lesepause gezeigt. Walze 1 bleibt sternfrei. |
| Dreh-Feedback | Die bisherige Drehung wechselte Symbole sprunghaft, statt die Walzenbewegung sichtbar zu machen. | Vertikale Silben-Laufbänder stoppen zeitversetzt. „Wenig Bewegung“ überspringt die Animation; Töne lassen sich abschalten. |

## Gerätegrößen

- **Smartphone, 320–480 CSS-Pixel:** Die Walzenanzahl 4 und 5 erhält eine schmalere, responsive Schrift. Bedienknöpfe und Silben-Chips bleiben groß genug für Touch; Schreibweisen-Schaltflächen umbrechen bei Bedarf.
- **Tablet, etwa 740–1024 CSS-Pixel:** Die Oberfläche bleibt flüssig, das Einstellungsfenster nutzt höchstens 94 % der Breite und kann vertikal scrollen.
- **Interaktive Tafel, ab 1000 CSS-Pixel:** Maschine und Walzen nutzen die zusätzliche Fläche, die Schrift wird größer und die Inhaltsbreite bleibt begrenzt, damit Zeilen lesbar bleiben.

## Prüfung

`node --test tests/logic.test.js` besteht mit 11 Tests. Zusätzlich wurden `node --check app.js`, `node --check logic.js` und `git diff --check` ausgeführt.

Im lokalen Browser (Viewport 1265 × 720 CSS-Pixel) wurden Speichern und Wiederherstellen der Schreibweise, 2–5 Walzen, laufende und reduzierte Bewegung, Ton-Einstellung sowie die Rückkehr zu den Standardwerten geprüft. Die responsive CSS-Regeln und Touch-Zielgrößen für Smartphone, Tablet und Tafel wurden im Quellcode geprüft. Eine visuelle Prüfung mit schmalem Smartphone-Viewport konnte diese Browsersteuerung nicht ausführen; diese Gerätegrößen sind deshalb nicht als physisch oder emuliert bestätigt dokumentiert.
