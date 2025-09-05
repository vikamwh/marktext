# Muya Editor Core Components

## Parser System (`src/muya/lib/parser/`)
- `render/index.js` - Main render dispatcher
- `render/kroki.js` - Kroki diagram rendering
- Token-based parsing architecture
- Supports various markdown elements + extensions

## Renderer System (`src/muya/lib/renderers/`)
- `index.js` - Main renderer registry
- Element-specific renderers for different markdown tokens
- HTML output generation
- Custom rendering for diagrams via Kroki

## Key Features
- **Live preview**: Real-time markdown rendering
- **Diagram support**: Kroki integration for PlantUML, Mermaid, etc.
- **Export capabilities**: HTML/PDF export via `utils/exportHtml.js`
- **Extensible parser**: Easy to add new markdown extensions

## Critical Files
- `muya/lib/parser/render/index.js` - Central rendering logic
- `muya/lib/renderers/index.js` - Renderer registration
- `muya/lib/utils/exportHtml.js` - Export functionality
- `muya/lib/parser/render/kroki.js` - Diagram rendering

## Integration Points
- Preferences control diagram rendering behavior
- Export settings managed in renderer components
- Menu actions trigger parser/renderer operations