# Corporate Identity der Grundschul-Lernspiele

Diese Regeln verbinden Silbenzauber und Zahlenzauber zu einer erweiterbaren Lernspielserie. Jede App behält ihr eigenes Tier, ihre eigene Umgebung und ihren eigenen Lernablauf. Wiederkehrende Materialwirkung, Navigation und Bedienmuster machen die Zugehörigkeit sichtbar.

## Gemeinsame Gestaltung

- **Räumliche Titeltafeln:** Große, gut lesbare Schrift auf einem warmen Holzschild, mit abgerundeten Kanten, Lichtkante, sichtbarer Tiefe und zurückhaltenden Befestigungsdetails.
- **Plastische Bedienelemente:** Große, abgerundete Tasten mit oberer Lichtkante, klarer Grundfarbe, dunkler Unterkante und sichtbarem Drückzustand. Interaktive Tafeln und Touchgeräte erhalten ausreichend große Zielflächen.
- **Licht und Schatten:** Licht kommt von oben links. Schatten bleiben weich und helfen, Vordergrund und Hintergrund zu unterscheiden.
- **Lernfläche zuerst:** Hintergrundillustrationen rahmen die Oberfläche. Überschriften, Silben oder Rechenaufgaben und Bedienelemente erhalten ruhige, kontrastreiche Flächen.
- **Spielbezogene Navigation:** Holzknöpfe verbinden die Lernspiele an gleichwertiger Stelle und verwenden klare App-Namen und Symbole.
- **Barrierearme Bewegung:** Animationen bleiben kurz und unterstützen eine Aktion oder Rückmeldung. Die Systemeinstellung für reduzierte Bewegung wird respektiert.

## App-Identitäten

| App | Tier und Welt | Leitfarben | Lernhandlung |
| --- | --- | --- | --- |
| Silbenzauber | Flamingo an einer tropischen Lagune | Türkis, Lagunengrün, Korallrosa, sonniges Gelb | Walzen drehen, Silben entdecken und lesen |
| Zahlenzauber | Affe an einer Dschungel-Lichtung | Dschungelgrün, Himmelblau und sonniges Gelb | Bälle werfen und rechnen |

Neue Lernspiele können eigene Tiere, Landschaften und Leitfarben erhalten. Sie übernehmen Holztafeln, Tastentiefe, Beleuchtungsrichtung, Fokusdarstellung, Bewegungsvorgaben und den Ort der Seriennavigation. Ein gemeinsames Layout ist keine Voraussetzung; die Lernaufgabe bestimmt den Seitenaufbau.

## Silbenzauber

- Die Maschine bleibt grün und die Lernsilben bleiben in der Original-Grundschul-Druckschrift `Druckschrift BY WOK`. Dekorative 3D-Typografie ist nur für den Titel und geeignete Bedienelemente vorgesehen.
- Die Lagune und Lumi, der Flamingo, unterstützen die Stimmung, überdecken jedoch nie Walzen oder Text. Lumi zeigt mit einer sanften Bewegung die Zustände „bereit“, „Walzen drehen“, „Ergebnis“ und „Lesepause“.
- Das Sternsymbol erscheint ausschließlich als konfigurierbares Walzenfeld. Es gibt keine Dekosterne außerhalb des Automaten.
- Die bestehenden Spielregeln bleiben maßgeblich: 2–5 Walzen, erste Walze sternfrei, pro Walze einstellbare Schreibweise und Auswahl, keine nicht ausgewählten Silben sowie eine vorlesbare Silbe je Walze.
- Hintergründe und Maskottchen werden lokal ausgeliefert und in WebP abgelegt, um Downloadgröße zu reduzieren. Quelldateien für generierte WebP-Bilder sind nicht Bestandteil der Laufzeit.

## Responsive Darstellung und Eingabe

- Desktop und Smartboard zeigen Maskottchen und Automat nebeneinander. Auf schmalen Ansichten wechselt Lumi in eine kompakte Zeile oberhalb des weiterhin vollbreiten Automaten.
- Bei vier und fünf Walzen wird die Schrift stufenweise kleiner, ohne Silben aufzuteilen. Die Walzen dürfen die Seite bei 320 Pixeln Breite nicht horizontal verbreitern.
- Mauszeiger dürfen die Markenwelt aufgreifen; Touchgeräte erhalten keine Cursoränderung.
- Tastaturfokus bleibt kontrastreich sichtbar. Beschriftete Controls, Dialogsemantik und Statusmeldungen bleiben erhalten.

## Lokale Bildassets

- `assets/lagoon-background.webp`: tropische Hintergrundillustration mit offenem Bildzentrum für die Lernfläche.
- `assets/flamingo-mascot.webp`: freigestelltes Flamingo-Maskottchen für die Silbenzauber-Zustände.

