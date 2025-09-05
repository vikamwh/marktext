# Aktuelle Aufgabe

**Datum: 2025-09-03**

Implementiere Kroki Always-On

- Verändere nicht diese Datei.
- Schreibe keine tests
- Erstelle die App
- verwende das beste AI Modell, wenn vorhanden das Thinking Modell
- chat ist deutsch, file-inhalt auf englisch
- Ändere diese Datei nicht

## Implementierte Änderungen

**Lokales Rendering entfernen**: Alle lokalen Diagramm-Renderer (Mermaid, PlantUML, Flowchart, Sequence, Vega-Lite) aus code löschen

**Kroki-Schalter entfernen**: Der Enable/Disable Toggle aus den Einstellungen entfernen - Kroki soll immer aktiv sein

**Aussagekräftige Fehlermeldungen**: Bei nicht erreichbarem Kroki-Server sollen detaillierte Fehlermeldungen angezeigt werden

**Server-spezifische Fehlermeldungen**: Syntax-Fehler und andere Server-Errors sollen mit Details vom Server angezeigt werden, sofern diese vorhanden sind

**Druck und Export wie im Editor**. Drucken und Export soll nach wie vor möglich sein. Wenn der kroki Server nicht verfügbar ist, dann soll im gedruckten/exportierten Dokument die gleiche Fehlermeldung stehen wie im Editor.
Beim Druck/Export kommt normalerweise ein grünes Bestätigungs-Popup. Sollte beim Export oder Druck bei einem oder mehreren Diagrammen ein Fehler auftreten, so soll die Farbe des PopUps orange sein und es soll ein Hinweis kommen, dass nicht alle Diagramme korrekt enthalten sind.

## Dokumentation
- `AI/KROKI_ALWAYS_ON.md` - Erstelle vollständige technische Dokumentation der Implementierung

