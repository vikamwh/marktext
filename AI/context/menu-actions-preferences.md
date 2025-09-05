# Menu Actions & Preferences System

## Menu Actions (`src/main/menu/actions/`)
- `file.js` - File operations (open, save, export)
- Menu handlers for main process
- Triggers export operations
- File dialog management

## Preferences System

### Schema (`src/main/preferences/schema.json`)
- Defines all preference structures
- Validation rules
- Default values
- Includes diagram rendering settings

### Static Config (`static/preference.json`)
- Default preference values
- Runtime preference storage
- Kroki server configuration

### UI Components
- `src/renderer/prefComponents/markdown/index.vue` - Markdown preferences UI
- Diagram rendering toggles
- Kroki server settings

## Key Preference Categories
- **Editor settings**: Theme, font, etc.
- **Markdown rendering**: Diagram support, Kroki integration
- **Export settings**: Format options, diagram handling
- **File handling**: Auto-save, recent files

## Configuration Flow
1. Schema defines structure in main process
2. Static config provides defaults
3. UI components allow user modifications
4. Changes propagate via IPC to main process