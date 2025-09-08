# Test-Protokoll: Erweiterte Kroki-Unterstützung

## Vorbereitung
1. MarkText starten: `.\MarkText.exe` aus `build\win-unpacked\`
2. Test-Datei öffnen: `test\kroki-test-simple.md`

## Test-Szenarien

### Szenario 1: Kroki deaktiviert (Standard)
**Einstellungen:** Preferences → Markdown → Diagrams → "Render diagrams via Kroki" = ❌

**Erwartete Ergebnisse:**
- ✅ Mermaid: Lokal gerendert (funktioniert)
- ✅ PlantUML: Lokal gerendert (funktioniert)
- ❌ Ditaa: "< Kroki required but not enabled >"
- ❌ GraphViz: "< Kroki required but not enabled >"

### Szenario 2: Kroki aktiviert mit korrektem Server
**Einstellungen:** 
- "Render diagrams via Kroki" = ✅
- "Kroki Server URL" = `http://localhost:8000`
- Kroki-Server muss laufen!

**Erwartete Ergebnisse:**
- ✅ Alle Diagramme: Über Kroki gerendert
- Bessere Qualität und mehr Features

### Szenario 3: Kroki aktiviert mit falschem Port (Haupttest!)
**Einstellungen:**
- "Render diagrams via Kroki" = ✅  
- "Kroki Server URL" = `http://localhost:8001` (falscher Port!)

**Erwartete Ergebnisse (NEUE VERHALTEN):**
- ❌ Mermaid: "< Kroki timeout: Server not reachable >" (KEIN lokaler Fallback!)
- ❌ PlantUML: "< Kroki timeout: Server not reachable >" (KEIN lokaler Fallback!)
- ❌ Ditaa: "< Kroki timeout: Server not reachable >"
- ❌ GraphViz: "< Kroki timeout: Server not reachable >"

## Quick-Insert Test
1. In MarkText: Typ `@` 
2. Wähle "diagram"
3. **Erwartung:** Mehr Diagramm-Typen sichtbar:
   - Vega Chart
   - Flow Chart  
   - Sequence Diagram
   - PlantUML Diagram
   - Mermaid
   - **NEU:** Ditaa Diagram
   - **NEU:** GraphViz/DOT
   - **NEU:** BlockDiag
   - **NEU:** WaveDrom
   - **NEU:** C4 PlantUML
   - **NEU:** D2 Diagram

## Code-Block-Erstellung Test
1. Erstelle neuen Code-Block mit: ```ditaa
2. **Erwartung:** Block wird als Diagramm erkannt (nicht als Code)
3. Wiederhole mit: graphviz, blockdiag, d2, etc.

## Erfolgs-Kriterien
- ✅ Alle neuen Diagramm-Typen im QuickInsert sichtbar
- ✅ Neue Code-Blöcke werden als Diagramme erkannt
- ✅ Kein automatischer Fallback bei Kroki-Timeout
- ✅ Spezifische Fehlermeldungen statt generische
- ✅ Kroki-only Typen funktionieren nur mit Kroki
