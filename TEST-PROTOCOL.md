# MarkText Kroki Test Protocol

## Test-Setup
1. Build abwarten bis fertig
2. MarkText.exe starten  
3. test/kroki-test-simple.md öffnen

## Test-Szenarien

### Szenario 1: Erweiterte Diagrammtypen in QuickInsert
**Ziel:** Prüfen ob alle neuen Diagrammtypen im QuickInsert menu verfügbar sind

**Schritte:**
1. Strg+/ für QuickInsert
2. Nach "ditaa", "graphviz", "wavedrom", "blockdiag" etc. suchen

**Erwartung:**
- Alle 25+ Diagrammtypen sollten verfügbar sein
- **VORHER:** Nur mermaid, plantuml, vegalite
- **NACHHER:** Alle Kroki-Typen

### Szenario 2: Kroki-Server erreichbar (localhost:8000)
**Ziel:** Normale Funktion mit erreichbarem Server

**Vorbereitung:**
1. Preferences → Kroki → Enable Kroki: ✓
2. Server URL: http://localhost:8000  
3. Kroki-Server starten (falls verfügbar)

**Test:**
1. Ditaa-Diagramm erstellen
2. GraphViz-Diagramm erstellen

**Erwartung:**
- Diagramme werden über Kroki gerendert
- Kein Fallback nötig

### Szenario 3: Kroki-Server nicht erreichbar (localhost:8001)
**Ziel:** Kein automatischer lokaler Fallback mehr

**Vorbereitung:**
1. Preferences → Kroki → Enable Kroki: ✓
2. Server URL: http://localhost:8001 (falscher Port)

**Test:**
1. Ditaa-Diagramm erstellen
2. Mermaid-Diagramm erstellen

**Erwartung:**
- **VORHER:** Nach 5 Sekunden automatischer lokaler Fallback
- **NACHHER:** "Kroki timeout: Server not reachable" Meldung
- **KEIN** automatischer Fallback mehr

### Szenario 4: Kroki deaktiviert
**Ziel:** Korrekte Behandlung wenn Kroki ausgeschaltet

**Vorbereitung:**
1. Preferences → Kroki → Enable Kroki: ✗

**Test:**
1. Ditaa-Diagramm erstellen  
2. Mermaid-Diagramm erstellen

**Erwartung:**
- Ditaa: "Kroki required but not enabled"
- Mermaid: Lokales Rendering (wie gehabt)

## Test-Ergebnisse

### ✅ Fixes implementiert:
- [ ] Erweiterte Diagrammtypen im QuickInsert
- [ ] Kein automatischer Fallback bei Server-Timeout  
- [ ] Spezifische Fehlermeldungen

### Test-Status:
- [ ] Szenario 1: QuickInsert erweiterte Typen
- [ ] Szenario 2: Kroki Server erreichbar
- [ ] Szenario 3: Kroki Server timeout (wichtigster Test!)
- [ ] Szenario 4: Kroki deaktiviert

**Kritischer Test:** Szenario 3 - hier sollte der unerwünschte Fallback behoben sein!
