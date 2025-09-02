# Kontext für den Assistenten (bitte zuerst lesen)

Zweck
- Gib dem Assistenten einen 30‑Sekunden‑Überblick über dieses Repository und die jüngsten Änderungen, damit Unterstützung sofort mit vollem Kontext starten kann.

Projekt‑Kurzinfos
- App: MarkText — Electron + Vue (electron‑vue) mit dem Muya‑Editor/Renderer.
- Build (Windows/PowerShell):
  - Renderer packen: `yarn run pack:renderer`
  - Main packen: `yarn run pack:main`
  - Paket (Dir‑Build): `yarn run build:bin` → Ausgabe: `build/win-unpacked/MarkText.exe`

Aktuelle Entscheidungen und Features (am relevantesten)
- Kroki‑Diagramme mit Einstellungen integriert: `enableKroki`, `krokiServerUrl`, `krokiTimeoutMs`.
- UI‑Schalter „Keep exact diagram size“ entfernt; Verhalten jetzt:
  - Kroki‑gerenderte Diagramme: immer exakte Größe (nicht responsiv) in Vorschau/Export.
  - Lokale Renderer (z. B. Mermaid‑Fallback): bleiben responsiv.
- Sanitizing für SVG‑Diagramme: `DIAGRAM_DOMPURIFY_CONFIG` und `sanitizeRaw` hinzugefügt für sichere, korrekte SVGs.
- Export HTML nutzt Kroki‑first für unterstützte Diagrammtypen; lokaler Fallback, wenn Kroki deaktiviert ist.
- Webpack‑5‑Polyfills für Node‑Built‑ins (Buffer, path, stream, util, zlib) + ProvidePlugin für Buffer.
- keytar‑Nutzung optional; Vue DevTools via Env‑Variable `ENABLE_VUE_DEVTOOLS` gesteuert.

Wichtige Dateien, die ich zuerst öffnen sollte
- `src/muya/lib/parser/render/index.js` (Ablauf des Diagramm‑Renderings)
- `src/muya/lib/parser/render/kroki.js` (Kroki‑Client)
- `src/muya/lib/config/index.js` (DOMPurify‑Konfigurationen inkl. Diagramm‑Profil)
- `src/muya/lib/utils/exportHtml.js` (Export‑Pfad)
- `src/renderer/components/editorWithTabs/editor.vue` (Muya‑Init + Verdrahtung der Einstellungen)
- `src/renderer/prefComponents/markdown/index.vue` (Kroki‑Einstellungs‑UI)
- `src/renderer/store/preferences.js` und `static/preference.json` (Defaults)
- `src/muya/webpack.config.js` (Muya‑Build + Polyfills)

Schneller Test
- Start: `build/win-unpacked/MarkText.exe`
- `test/kroki-sample.md` öffnen → Kroki in den Einstellungen an/aus → Vorschau und Export HTML prüfen.

Offene Punkte (Nice‑to‑have)
- Smoke‑Tests für mehrere Diagrammtypen mit/ohne Kroki.
- Optional: Installer‑Build; Browserslist‑Daten aktualisieren.

So nutzt du diese Datei mit dem Assistenten
- Bitte den Assistenten zu Beginn: „Lies zuerst die ASSISTANT.md.“
- Diese Datei und `AI_WORKLOG.md` aktuell halten, wenn sich Scope/Entscheidungen ändern.
