> **Aktueller Stand (14.10.2026):** GitHub und Cloudflare Pages sind bereits eingerichtet; der Quellcode liegt direkt im Repository-Stammverzeichnis (nicht in `public/`). Das produktive Pages-Projekt nutzt Build-Ausgabe `.` und ist auf https://silbenzauber.pages.dev veröffentlicht. Die Anleitung unten wurde auf diesen Stand angepasst. Die Wunschdomain `silbenzauber.lessqq.de` wird separat eingerichtet; nicht ohne Bestätigung DNS ändern.

# Silbenzauber veröffentlichen – GitHub, Cloudflare, checkdomain

Diese Anleitung beschreibt die Einrichtung sowie spätere Wartung des bereits veröffentlichten Projekts.

## A. GitHub-Repository erstellen

1. Bei https://github.com anmelden.
2. Oben rechts auf **+ → New repository** gehen oder https://github.com/new öffnen.
3. Als Namen `silbenzauber` eintragen. Beschreibung optional: `Lese-Automat für die Grundschule`.
4. Für eine öffentliche Lern-App ist `Public` möglich. Quellcode ist dann für andere sichtbar. Keine Geheimnisse darin speichern.
5. `Create repository` klicken. Ein automatisch erstelltes README ist nicht notwendig, da dieses Projekt bereits eines enthält.
6. Das ZIP `Silbenzauber_GitHub_Cloudflare.zip` **auf dem eigenen Gerät entpacken**.
7. Im GitHub-Repository **Add file → Upload files** öffnen; bei einem komplett leeren Repository stattdessen auf **uploading an existing file** klicken.
8. **Den Inhalt des entpackten Ordners** hochladen: Verzeichnis `tests/` und die Webdateien `index.html`, `styles.css`, `logic.js`, `app.js` sowie `README.md`, `AGENTS.md`, `CODEX_HANDOFF.md`, `VEROEFFENTLICHUNG.md`. Keinen zusätzlichen obersten Ordner anlegen.
9. Als Commit-Nachricht `Silbenzauber – Veröffentlichung vorbereiten` eintragen und auf den Hauptbranch committen.
10. Prüfen: `index.html` muss direkt im Stammverzeichnis liegen.

## B. Cloudflare Pages mit GitHub verbinden

1. Bei https://dash.cloudflare.com anmelden.
2. **Workers & Pages → Create application → Pages → Connect to Git** auswählen (die Oberfläche kann leicht anders heißen).
3. GitHub autorisieren und das Repository `silbenzauber` wählen.
4. Als Projektname `silbenzauber` wählen, sofern noch verfügbar.
5. Diese Einstellungen vornehmen:

   | Feld | Wert |
   | --- | --- |
   | Framework | None / Kein Framework |
   | Production branch | `main` |
   | Build command | `exit 0` (oder leer) |
   | Build output directory | `.` |
   | Root directory | Standard / Repository-Stamm |

6. **Save and Deploy** klicken.
7. Nach erfolgreicher Veröffentlichung die angezeigte Projektadresse öffnen. Sie sieht etwa so aus: `https://silbenzauber.pages.dev` – der tatsächliche Name kann abweichen.
8. Prüfen: Startknopf, zwei bis fünf Walzen, Einstellungen, erste Walze ohne Stern, Groß-/Kleinschreibung.
9. Weitere Änderungen im Branch `main` werden von Cloudflare Pages automatisch veröffentlicht.

## C. Eigene Subdomain mit checkdomain verbinden (empfohlen)

Beispiel: `silbenzauber.deinedomain.de`.

1. In **Cloudflare → Workers & Pages → silbenzauber → Custom domains → Set up a domain** die gewünschte Subdomain `silbenzauber.deinedomain.de` eintragen und fortfahren.
2. Falls die Domain **checkdomain-Nameserver** verwendet: bei https://www.checkdomain.de anmelden → **Kundenbereich → Domains → Konfiguration → checkdomain Nameserver → Profi-Einstellungen**.
3. Einen **CNAME** anlegen:

   | Feld | Wert |
   | --- | --- |
   | Typ | `CNAME` |
   | Name | `silbenzauber` |
   | Ziel/Wert | die von Cloudflare angezeigte Pages-Adresse, z. B. `silbenzauber.pages.dev` |

4. Speichern. Einen eventuell vorhandenen, widersprüchlichen DNS-Eintrag für **dieselbe Subdomain** zuerst prüfen. Nicht blind Einträge der Hauptdomain oder E-Mail löschen.
5. Cloudflare prüft die Domainzuordnung und das HTTPS-Zertifikat. Nach DNS-Ausbreitung die Subdomain mit `https://` aufrufen.

**Wichtig:** Der CNAME gehört dorthin, wo die Domain **derzeit ihre autoritativen DNS-Einträge verwaltet**. Falls die Nameserver schon auf Cloudflare oder anderswo zeigen, dort den CNAME setzen statt bei checkdomain.

**Kein Nameserverwechsel erforderlich**, wenn nur eine Subdomain zu Cloudflare Pages zeigen soll und checkdomain bereits die autoritativen Nameserver betreibt. Für die Hauptdomain ohne Subdomain gelten andere Voraussetzungen.

## D. Wenn du unbedingt einen Pfad unter der Hauptdomain willst

`deinedomain.de/QQ/Silbenzauber/` ist **kein DNS-Eintrag**. DNS kann nur Domains/Subdomains zuweisen, keine `/Pfad/`-Abschnitte.

Optionen:
- Auf der vorhandenen Website eine Weiterleitung zum Silbenzauber anlegen (am einfachsten).
- Den Ordner in das bestehende Website-Projekt integrieren, wenn du dessen Hosting verwaltest.
- Für eine direkte Einbindung unter demselben Host eine Reverse-Proxy-/Routing-Regel verwenden; hierfür muss die aktuelle Website/Proxy-Konfiguration bekannt sein.

## E. Codex anbinden

1. Zuerst das Repository bei GitHub anlegen.
2. Codex auf https://chatgpt.com/codex oder über den Codex-Bereich in ChatGPT öffnen, sofern verfügbar.
3. GitHub verbinden/den Zugriff auf das neue Repository erlauben.
4. Das Repository `silbenzauber` als Projekt/Umgebung auswählen.
5. `AGENTS.md` und `CODEX_HANDOFF.md` als Entwicklungsregeln und Projektübergabe verwenden. Erste Aufgabe: `Prüfe die Web-App auf Fehler, führe alle Tests aus und schlage einen Pull Request mit Verbesserungen vor. Erhalte unbedingt die Regeln für Walze 1.`
6. Änderungen vor der Übernahme in `main` ansehen und prüfen. Cloudflare veröffentlicht nach Übernahme automatisch neu.

## F. Häufige Fehler

- **404 auf pages.dev** → Wahrscheinlich falscher Output-Pfad oder `index.html` im Stammverzeichnis fehlt.
- **CSS/JavaScript fehlen** → Achte darauf, dass alle vier Dateien gemeinsam im Stammverzeichnis liegen.
- **Custom Domain funktioniert nicht** → Domain zuerst in Cloudflare unter *Custom domains* hinzufügen und erst dann passenden CNAME beim autoritativen DNS-Anbieter setzen.
- **Checkdomain-DNS wird nicht übernommen** → Prüfen, welche Nameserver tatsächlich für die Domain aktiv sind.
- **Website nach Änderung noch alt** → GitHub-Commit auf `main`, Cloudflare-Deploymentstatus und Browsercache überprüfen.

## G. Vor dem Teilen mit Eltern und Kindern

- Mobil und am Smartboard prüfen.
- Eine Auswahl aus nur wenigen bekannten Buchstaben als Lehrkraft konfigurieren.
- An Impressum und Datenschutzhinweise deiner veröffentlichten Website denken.
- Keine Namen oder Leistungen einzelner Kinder speichern; diese Version benötigt keine persönlichen Angaben.
