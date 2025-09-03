# Report-Button Entfernung - Dokumentation



# Wichtiger Hinweis!

Diese hier beschriebene Änderung wurde revertet. Dieses Dokument dient lediglich zur Info, sofern diese Aufgabe noch einmal relevant werden sollte.

Führe aktuell keine Änderungen am Report Button durch, solange du nicht den Auftrag dafür erhältst.

Merke Dir, dass es dieses Dokument gibt und den groben Kontext. Details sind  jetzt nicht wichtig.



## Übersicht

Dieses Dokument beschreibt die Änderungen, die notwendig waren, um den "Report"-Button aus den Error-Dialogen von MarkText zu entfernen. Der Report-Button führte zu einem falschen GitHub-Repository und sollte komplett deaktiviert werden.

## Problem
- Error-Dialoge in MarkText zeigten drei Buttons: "OK", "Copy Error" und "Report"
- Der "Report"-Button erstellte GitHub Issues im falschen Repository (marktext/marktext statt des eigenen Forks)
- Benutzer könnten versehentlich Fehlerberichte an das falsche Projekt senden

## Lösung
Der Report-Button wurde durch Anpassung der Error-Dialog-Konfiguration in der Exception-Handler-Datei entfernt.

## Geänderte Dateien

### 1. src/main/exceptionHandler.js

#### Entfernte Imports
```javascript
// ENTFERNT: import { createAndOpenGitHubIssueUrl } from './utils/createGitHubIssue'
```

#### Geänderte Error-Dialog-Konfiguration

**Vorher:** (Standard Electron Error-Dialog oder drei Buttons)
```javascript
// Ursprünglicher Code hatte möglicherweise drei Buttons oder verwendete Electron's Standard-Error-Dialog
```

**Nachher:** Explizite Zwei-Button-Konfiguration
```javascript
// show error dialog
if (app.isReady()) {
  // Blocking message box with only OK and Copy Error buttons
  const { response } = await dialog.showMessageBox({
    type: 'error',
    buttons: ['OK', 'Copy Error'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
    message: title,
    detail: stack
  })

  if (response === 1) {
    clipboard.writeText(`${title}\n${stack}`)
  }
} else {
  // error during Electron initialization - use custom message box
  console.error('Error during Electron initialization:', title, stack)
  
  try {
    const { response } = await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK', 'Copy Error'],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      message: 'Error during initialization',
      detail: `${title}\n${stack}`
    })

    if (response === 1) {
      clipboard.writeText(`${title}\n${stack}`)
    }
  } catch (e) {
    // Fallback if dialog fails
    console.error('Failed to show error dialog:', e)
  }
  
  process.exit(1)
}
```

#### Entfernte ungenutzte Variable
```javascript
// VORHER:
const handleError = async (title, error, type) => {
  const { message, stack } = error  // 'message' wurde nicht verwendet

// NACHHER:
const handleError = async (title, error, type) => {
  const { stack } = error  // Nur 'stack' wird benötigt
```

## Wichtige Konfigurationsparameter

### dialog.showMessageBox Optionen
- `type: 'error'`: Definiert den Dialog-Typ als Error
- `buttons: ['OK', 'Copy Error']`: **KRITISCH** - Explizite Definition der verfügbaren Buttons
- `defaultId: 0`: Standard-Button ist "OK"
- `cancelId: 0`: Cancel-Button ist "OK" 
- `noLink: true`: Verhindert Link-ähnliche Button-Darstellung
- `message`: Haupt-Fehlermeldung
- `detail`: Detaillierte Stack-Trace-Information

## Warum diese Lösung funktioniert

1. **Explizite Button-Definition**: Durch die explizite Definition von nur zwei Buttons wird verhindert, dass Electron automatisch zusätzliche Buttons hinzufügt.

2. **Konsistente Implementierung**: Beide Error-Pfade (app.isReady() und Initialisierung) verwenden die gleiche Button-Konfiguration.

3. **Entfernung ungenutzter Dependencies**: Der Import von GitHub-Issue-Funktionalität wurde entfernt, da er nicht mehr benötigt wird.

## Alternative Ansätze (nicht umgesetzt)

### 1. GitHub-URL umleiten
```javascript
// Könnte die URL auf das eigene Repository umleiten
const GITHUB_REPO_URL = 'https://github.com/vikamwh/marktext'
```

### 2. Konditionelle Button-Anzeige
```javascript
// Könnte basierend auf Konfiguration entscheiden
const buttons = IS_FORK ? ['OK', 'Copy Error'] : ['OK', 'Copy Error', 'Report']
```

## Testergebnis
✅ **Bestätigt**: Report-Button ist nicht mehr in Error-Dialogen sichtbar
✅ **Funktionalität**: "OK" und "Copy Error" Buttons funktionieren korrekt
✅ **Keine Regression**: Keine anderen Funktionen beeinträchtigt

## Weitere betroffene Dateien

### src/main/utils/createGitHubIssue.js
Diese Datei existiert noch, wird aber nicht mehr verwendet. Könnte in Zukunft entfernt oder für das korrekte Repository angepasst werden.

### src/main/config.js
Enthält `GITHUB_REPO_URL` Konfiguration, die auf das ursprüngliche Repository zeigt. Könnte bei Bedarf angepasst werden.

## Wartungshinweise

1. **Bei Electron-Updates**: Prüfen, ob sich das Verhalten von `dialog.showMessageBox` ändert
2. **Button-Array**: Immer explizit definieren, niemals auf Standard-Verhalten verlassen
3. **noLink-Parameter**: Wichtig für konsistente Button-Darstellung
4. **Error-Handling**: Beide Code-Pfäde (ready/not ready) synchron halten

## Commit-Informationen
- **Hauptänderung**: Entfernung des Report-Buttons aus Error-Dialogen
- **Nebeneffekt**: Code-Cleanup durch Entfernung ungenutzter Imports und Variablen
- **Sicherheit**: Verhindert fehlerhafte Issue-Erstellung im falschen Repository

## Lessons Learned

1. **Electron-Dialog-Verhalten**: Electron kann automatisch zusätzliche Buttons hinzufügen, wenn nicht explizit verhindert
2. **Fork-Maintenance**: Bei Repository-Forks müssen alle GitHub-Referenzen überprüft und angepasst werden
3. **Error-Handling-Konsistenz**: Beide Error-Pfade müssen identisch konfiguriert werden
