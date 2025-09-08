# Aktuelle Aufgabe

**Datum: 2025-09-04**

Implementiere fehlende Kroki Diagramme

- Verändere nicht diese Datei. verändere keine Datei in diesem Ordner die im filname mit Aufgabe beginnt.
- Schreibe keine tests
- Erstelle die App
- chat ist deutsch, file-inhalt auf englisch

## Implementiertung

Kroki kann noch mehr Diagramm Typen die aktuell nicht unterstützt werden.

- Implementiere die fehlenden Diagramme
- Analysiere zuvor den Code. Analysiere den Pfad vom Parsen bis hin zum generieren des Grafik vollständig.
  - Falls Du mehrfach damit Probleme hast, dann füge einen einfachen Debug Mechanismus über logfiles o.ä. ein.
  - Entferne unnötigen Debug-Code wieder, wenn Du ihn nicht mehr benötigst, spätestens wenn die Aufgabe abgeschlossen ist.
- Diagramme sollen parallel vom Server angefordert werden.
  - Die Anzahl der max. parallelen Requests soll begrenzt sein. Erstelle hierfür einen weiteren Parameter in dem Einstellungs-Dialog. Default soll 5 sein (max. 5 parallele Requests).
  - Der Kroki-Server soll mit einem cache-Mechanismus geschont werden.
    - Der cache soll nicht nur im RAM verfügbar, sondern auch auf der Festplatte persistiert sein.
    - Beachte eine sichere Erkennung von Änderungen im Diagramm-Code, auch außerhalb der Applikation. Implementiere daher eine sichere Erkennung über Hash-Summen vom Diagramm-Code.



## git

- Mache keine Veränderungen am git repo
- Checke nichts ein, solange ich es nicht explizit fordere
- rein lesende Zugriffe sind erlaubt

## Dokumentation
- `AI/KROKI_MISSING_DIAGRAMS.md` - Erstelle vollständige technische Dokumentation der Implementierung

