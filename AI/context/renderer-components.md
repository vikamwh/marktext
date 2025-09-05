# Renderer Components Structure

## Main Components (`src/renderer/components/`)

### Editor With Tabs (`editorWithTabs/`)
- `editor.vue` - Main editor component
- Integrates Muya editor engine
- Tab management for multiple files
- Editor state management

### Export Settings (`exportSettings/`)
- Export configuration UI
- PDF/HTML export options
- Diagram rendering settings

### Preferences (`prefComponents/`)
- `markdown/index.vue` - Markdown-specific preferences
- UI for configuring diagram rendering
- Kroki server settings

## Store Management (`src/renderer/store/`)
- `editor.js` - Editor state (current file, content, etc.)
- `preferences.js` - App preferences
- `tabs.js` - Tab management state
- Vuex-based state management

## Services (`src/renderer/services/`)
- API communication with main process
- File operations
- Export services

## Key Patterns
- Vue.js SPA with component-based architecture
- Vuex for centralized state management
- IPC communication with Electron main process
- Event-driven architecture for editor updates