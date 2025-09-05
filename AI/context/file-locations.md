# Key File Locations Reference

## Critical Files for Understanding
```
src/main/menu/actions/file.js:712 - Export operations
src/main/preferences/schema.json - Preference definitions
src/muya/lib/parser/render/index.js - Main render dispatcher
src/muya/lib/parser/render/kroki.js - Diagram rendering logic
src/muya/lib/renderers/index.js - Renderer registry
src/muya/lib/utils/exportHtml.js - HTML/PDF export
src/renderer/components/editorWithTabs/editor.vue - Main editor
src/renderer/prefComponents/markdown/index.vue - Markdown prefs
src/renderer/store/editor.js - Editor state management
static/preference.json - Default preferences
```

## Modified Files (Current State)
```
M src/main/menu/actions/file.js
M src/main/preferences/schema.json  
M src/muya/lib/parser/render/index.js
M src/muya/lib/parser/render/kroki.js
M src/muya/lib/renderers/index.js
M src/muya/lib/utils/exportHtml.js
M src/renderer/components/editorWithTabs/editor.vue
M src/renderer/prefComponents/markdown/index.vue
M src/renderer/store/editor.js
M static/preference.json
```

## Data Flow Connections
- File actions → Export utils → Kroki renderer
- Preferences UI → Schema → Static config
- Editor component → Store → Muya engine
- Render dispatcher → Specific renderers → Output