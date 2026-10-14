# Bedienbarkeitsprüfung

Prüfung der Oberfläche mit Blick auf Smartphones im Hochformat, Tablets im Hoch- und Querformat sowie interaktive Tafeln. Die Projektvorgaben für Klasse 1 bleiben maßgeblich: grüne Maschine, serifenlose Druckschrift, Walze 1 mit großem Anfangsbuchstaben und ohne Stern, weitere Walzen in Kleinbuchstaben mit optionalen Sternen sowie einzeln auswählbare Silben.

## Gefundene Probleme und Änderungen

| Bereich | Problem | Änderung |
| --- | --- | --- |
| Smartphone, schmale Ansicht mit fünf Walzen | Die feste Schriftgröße konnte die Silbe der ersten Walze (`Ma`) in einer schmalen Zelle abschneiden. | Schriftgröße für vier und fünf Walzen skaliert jetzt auch an schmalen Ansichten mit der verfügbaren Breite. Die ganze Silbe bleibt die Anzeigeeinheit. |
| Alle Geräte | Die weiße Statusanweisung auf halbtransparentem Grün hatte zu wenig Kontrast. | Die Anweisung hat nun einen hellen, deckenden Hintergrund mit dunkler grüner Schrift. |
| Touchbedienung | Schließen-Schaltfläche und „Alle/Keine“-Aktionen unterschritten knapp die angestrebte 44-Pixel-Touchfläche. | Schließen-Schaltfläche und Aktionsschaltflächen sind mindestens 44–48 Pixel groß; die Aktionen der Silbenauswahl behalten gut nutzbare Abstände. |
| Individuelle Auswahl | Die Zusammenfassung zeigte alle aus Buchstaben erzeugbaren Silben als „aktive“ Silben, auch wenn Lehrkräfte einzelne davon abgewählt hatten. | Sie zeigt jetzt nur die Anzahl der gewählten Silben pro Walze und suggeriert nicht, dass abgewählte Silben im Spiel vorkommen. |
| Tablet quer / interaktive Tafel | Die Maschine blieb auf 700 Pixel begrenzt und nutzte breite Bildschirme wenig aus. | Maschine, Auswahlübersicht und Anleitung können bis 900 Pixel breit werden; auf breiten Ansichten wachsen Walzen und Schrift mit. |

## Gerätegrößen

- **Smartphone, 320–480 CSS-Pixel:** Die Walzenanzahl 4 und 5 erhält eine schmalere, responsive Schrift. Bedienknöpfe und Silben-Chips bleiben groß genug für Touch.
- **Tablet, etwa 740–1024 CSS-Pixel:** Die Oberfläche bleibt flüssig, das Einstellungsfenster nutzt höchstens 94 % der Breite und kann vertikal scrollen.
- **Interaktive Tafel, ab 1000 CSS-Pixel:** Maschine und Walzen nutzen die zusätzliche Fläche, die Schrift wird größer und die Inhaltsbreite bleibt begrenzt, damit Zeilen lesbar bleiben.

## Prüfgrenze

Die vorgeschriebene Logik-Testdatei wurde ausgeführt. Eine Browser-Vorschau mit frei einstellbarer Fenstergröße war in dieser Umgebung nicht erreichbar; deshalb sind die Geräteansichten anhand der responsiven CSS-Regeln und Touch-Zielgrößen geprüft, nicht durch einen visuellen Gerätelauf bestätigt.
