# AI-Arbeitsprotokoll

Datum: 2025-09-02

Zusammenfassung
- Kroki-Integration implementiert (Einstellungen + Verdrahtung im Renderer/Export).
- Option „Keep exact diagram size“ entfernt; Kroki rendert stets in exakter Größe.
- Diagramm-spezifische DOMPurify-Konfiguration und `sanitizeRaw` ergänzt.
- Webpack (Muya) um Node-Polyfills und ProvidePlugin Buffer erweitert.
- keytar optional gemacht; DevTools über Env-Gate gesteuert.
- Build & Packaging auf Windows verifiziert; Dir-Ausgabe unter `build/win-unpacked`.
- Aufräumen: ungenutztes `makeSvgResponsive` entfernt, Kommentar/Einrückungen korrigiert, Accept-Header im Kroki-Client ergänzt.

Geänderte Dateien (High-Level)
- `src/muya/lib/parser/render/index.js`
- `src/muya/lib/parser/render/kroki.js`
- `src/muya/lib/config/index.js`
- `src/muya/lib/utils/exportHtml.js`
- `src/muya/lib/utils/index.js`
- `src/muya/lib/assets/styles/index.css`
- `src/muya/webpack.config.js`
- `src/renderer/components/editorWithTabs/editor.vue`
- `src/renderer/prefComponents/markdown/index.vue`
- `src/renderer/store/preferences.js`, `static/preference.json`
- `package.json`

Validierung
- Lint: ok
- Build: ok
- Packaging: ok (Dir)

Nächste Ideen
- Smoke-Tests für Diagrammtypen (Vorschau/Export) mit Kroki an/aus.
- Integrations-Testharness und CI-Artefakt für Beispiel-Exporte erwägen.
