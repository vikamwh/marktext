# Branch Analysis: Master vs. Develop

## Frage / Question
**"Analysiere die branches. ist auf dem master dasselbe wie auf dem develop branch?"**
*("Analyze the branches. Is the same thing on the master as on the develop branch?")*

## Antwort / Answer
**NEIN / NO** - Die Branches master und develop enthalten **NICHT** denselben Inhalt.

## Detaillierte Analyse / Detailed Analysis

### Branch Status Übersicht / Branch Status Overview

| Branch | Latest Commit SHA | Date | Description |
|--------|------------------|------|-------------|
| **master** | `318929817c408ad5cb9700edfb05ffb196ca7974` | 2022-07-16 | Remove expired "marktext.app" domain (#3350) |
| **develop** | `4a214a82ed6002922dcaab8a13aa43acbe79617f` | 2025-09-01 | Merge pull request #1 (merge develop → master) |

### Commit Unterschiede / Commit Differences

- **Develop Branch ist 1610 Commits voraus** / *Develop branch is 1610 commits ahead*
- **Master Branch ist 1 Commit voraus** / *Master branch is 1 commit ahead*
- **Insgesamt 105 Dateien geändert** / *Total of 105 files changed*
  - 3,411 Zeilen hinzugefügt / *lines added*
  - 4,091 Zeilen entfernt / *lines deleted*

### Wichtige Unterschiede / Key Differences

#### Neue Features im Develop Branch / New Features in Develop Branch:
1. **Mermaid 10 Upgrade** (März 2024) - mit Mindmap-Unterstützung
2. **MDX Extension Support** (August 2023) - `.mdx` Dateien werden unterstützt
3. **Verbesserte Spellchecker-Integration** - Neue Spellchecker-Architektur
4. **Kommando-System Überarbeitung** - Neue Command-Struktur
5. **Menü-System Refactoring** - Aufgeteilte Menu-Actions
6. **Kontext-Menü Verbesserungen** - Bessere Editor-Kontext-Menüs

#### Technische Verbesserungen / Technical Improvements:
- **Dependencies Updates** - Viele Dependency-Updates über die Jahre
- **Build-System Verbesserungen** - Aktualisierte Electron-Builder-Konfiguration
- **Performance Optimierungen** - Verschiedene Performance-Verbesserungen
- **Bug Fixes** - Hunderte von Bug-Fixes seit 2022

#### Übersetzungen / Translations:
- **Portugiesische Übersetzung verbessert** (Juni 2024)
- **Traditionelle Chinesische Übersetzung aktualisiert** (August 2023)
- **Verschiedene i18n Verbesserungen**

### Zeitrahmen / Timeline
- **Master Branch**: Letztes Update Juli 2022 (über 2 Jahre alt)
- **Develop Branch**: Aktuelle Entwicklung bis September 2025
- **Entwicklungsaktivität**: Kontinuierliche Entwicklung im develop branch

### Code-Struktur Änderungen / Code Structure Changes

#### Entfernte Komponenten / Removed Components:
- Alte Spellchecker-Hunspell Dateien
- Veraltete Context-Menu Struktur im Renderer
- Legacy Dictionary-Downloader

#### Neue Komponenten / New Components:
- `src/main/spellchecker/` - Neue Spellchecker-Architektur
- `src/main/commands/` - Neues Command-System
- `src/main/contextMenu/editor/` - Überarbeitete Context-Menüs
- `src/muya/lib/marktext/spellchecker.js` - Muya Spellchecker-Integration

### Empfehlung / Recommendation

Da der develop branch deutlich aktueller ist und viele wichtige Verbesserungen enthält, sollten neue Entwicklungen auf dem **develop branch** basieren. Der master branch ist erheblich veraltet und enthält nicht die neuesten Features und Bug-Fixes.

*Since the develop branch is significantly more current and contains many important improvements, new development should be based on the **develop branch**. The master branch is considerably outdated and does not contain the latest features and bug fixes.*

### Fazit / Conclusion

**Die Branches sind NICHT identisch.** Der develop branch ist die aktive Entwicklungslinie mit modernen Features und Verbesserungen, während der master branch seit Juli 2022 praktisch unverändert geblieben ist.

*The branches are NOT identical. The develop branch is the active development line with modern features and improvements, while the master branch has remained practically unchanged since July 2022.*