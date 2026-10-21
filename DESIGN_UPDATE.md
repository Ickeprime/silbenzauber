# Silbenzauber 0.3 – Design- und Funktionsupdate

## Schreibweise je Walze

Lehrkräfte können für jede Walze unabhängig zwischen Anfangsbuchstabe groß (`Ma`), alles klein (`ma`) und alles groß (`MA`) wählen. Die Auswahl wird zusammen mit der bestehenden Konfiguration im Browser gespeichert. Bereits gespeicherte Einstellungen ohne Schreibweisen-Feld werden beim Laden beibehalten und mit Walze 1 auf `Ma` sowie allen weiteren Walzen auf `ma` ergänzt.

## Sternregel

Wenn Sterne auf mindestens einer Walze ab Walze 2 freigegeben sind, erzwingt die Spiellogik nach drei sternlosen Drehungen beim nächsten Ergebnis mindestens einen Stern. Der Zähler wird bei einem Stern zurückgesetzt und lokal gespeichert, damit ein Neuladen ihn nicht zurücksetzt. Sind alle Sternoptionen aus, bleibt die Regel ausgesetzt. Walze 1 bleibt unabhängig von der Konfiguration sternfrei.

## Animation und Geräusche

Die Walzen zeigen beim Drehen mehrere Silben in einem vertikalen Laufband, das von oben nach unten durch die Fenster läuft. Die Trackfolge beginnt mit der Zielsilbe; der Track startet am unteren Ende der Folge und fährt mit auslaufender Übergangskurve nach oben auf Position null. Dadurch steht die Zielsilbe am Ende bereits an ihrer endgültigen Position. Die Walzen stoppen weiterhin zeitversetzt; ein kurzes vertikales Zusammendrücken markiert den mechanischen Stopp, ohne den Track sichtbar zurückzubewegen. Bei reduzierter Bewegung wird das Laufband übersprungen. Start-, Lauf-, Stopp- und Endtöne werden synthetisch mit der Web Audio API erzeugt, leise begrenzt und nur nach Bedienung durch das Kind abgespielt. Die Tonoption bleibt abschaltbar.

## Gestaltung und Bedienung

Das Gehäuse, die vertieften Walzenfenster und die große Startfläche wurden in ruhigen Grüntönen plastischer gestaltet. Auf Geräten mit Maus zeigt ein kleiner, selbst gezeichneter Zauberstab-Cursor die ganze Seite; Textfelder behalten den Textcursor. Touchgeräte erhalten keine Cursoränderung. Es gibt keine dekorativen Sterne außerhalb der Walzen und kein Punktesystem.

Die unveränderte Originaldatei `fonts/Druckschrift_BY_WOK.ttf` wurde im lokalen Downloads-Ordner gefunden und ins Repository übernommen. SHA-256 vor und nach dem Kopieren: `529f331607684cab03ff9959ef1d82799cebe90f7b6c3e84cf4db6791ce794d7`. Die TTF-Metadaten bestätigen Copyright Wolfram Esser (2008), interne Namen `Druckschrift BY WOK` / `Druckschrift_BY_WOK`, Reserved Font Name `Druckschrift_BY_WOK` und SIL Open Font License 1.1. `fonts/OFL.txt` enthält den eingebetteten Copyright-/Lizenzkopf und den vollständigen OFL-Text. Über `@font-face` wird Druckschrift BY WOK bevorzugt für Walzensilben, Silbenauswahl, Silbenvorschau und die Beispiele `Ma`, `ma`, `MA` verwendet. Das Sternzeichen fehlt in der Glyphenabdeckung und bleibt daher ausdrücklich bei Arial/Helvetica. Die Glyphentabelle enthält alle angeforderten Buchstaben einschließlich `Ä Ö Ü ä ö ü ß`. Eine Browser-Renderprüfung war in dieser Sitzung nicht verfügbar; tatsächlich geladene Browser-Schrift und Pixelbeschnitt sind daher noch visuell zu prüfen.

## Qualitätssicherung

- `node --test tests/logic.test.js`
- `node --check app.js`
- `node --check logic.js`
- `git diff --check`
- Unit-Tests decken Schreibweisen je Walze, Migration alter Einstellungen, Sternverbot auf Walze 1 und die Vier-Drehungen-Regel ab.
- Für die Richtungsänderung: `node --test` (18 Tests), `node --check app.js` und `node --check logic.js` bestanden. Die Bewegung ist im Code geometrisch von einem negativen Y-Versatz nach `translateY(0)` angelegt; ein visueller Browserlauf mit 2–5 Walzen bei 320/375 Pixeln war in dieser Sitzung wegen nicht erreichbarer lokaler Browser-Vorschau nicht möglich. Frühere Mobile-Viewport-Aufnahmen stammen von vor dieser Richtungsänderung und gelten nicht als Animationstest für diese Änderung.
- Schriftintegration: Metadaten, unveränderten SHA-256, Glyphenabdeckung und vollständige eingebettete Lizenzkopie wurden mit dem Python-Standardbibliotheksparser aus der Original-TTF geprüft. Browserprüfung auf Schriftladevorgang und Walzenbreiten steht noch aus.

Die Spiel- und Einstellungslogik bleibt ohne Build-Abhängigkeiten in `logic.js`; Darstellung und Audio-Orchestrierung liegen in `app.js` und `styles.css`. Die Einstellungen für Walzenzahl, Buchstaben, individuelle Silben, Sterne, Ton und reduzierte Bewegung bleiben erhalten.

## Serien-Redesign mit Lagune und Flamingo

Silbenzauber teilt jetzt zentrale Oberflächenmerkmale mit Zahlenzauber: eine große, plastisch gesetzte Titeltafel, Holzknöpfe mit Lichtkante und Untertiefe sowie eine gemeinsame Position für die Seriennavigation. Die eigene Farbwelt bleibt türkis-grün mit Korallakzenten und einer tropischen Lagune. Die neue Corporate Identity und ihre Regeln für zukünftige Apps stehen in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

Lumi, der freigestellte Flamingo, begleitet den Ablauf mit ruhigen CSS-Bewegungen für den Bereitschafts-, Dreh-, Ergebnis- und Lesepausen-Zustand. Bei aktivierter Einstellung „Wenig Bewegung“ oder der entsprechenden Systemeinstellung werden die Maskottchenbewegungen deaktiviert. Die Spiel- und Zahlenzauber-Logik blieb unverändert. Die beiden lokalen WebP-Assets sind zusammen etwa 414 KB groß.

**Visuelle Prüfung:** Die öffentliche Zahlenzauber-Referenz wurde im Browser geöffnet und als Gestaltungsgrundlage verglichen. Eine lokale Vorschau des neuen Silbenzauber konnte in dieser Umgebung nicht starten, weil der lokale HTTP-Server keinen Loopback-Socket öffnen durfte. Daher bleiben Browser-Screenshots und die visuelle Prüfung bei 320/375 Pixeln, Tablet und Desktop als offener Abnahmepunkt bestehen; automatisierte Tests und statische Prüfungen ersetzen diese Sichtprüfung nicht.
