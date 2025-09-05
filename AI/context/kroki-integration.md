# Kroki Integration

## Core Components

### Kroki Renderer (`src/muya/lib/parser/render/kroki.js`)
- Handles diagram block parsing
- Sends requests to Kroki server
- Returns SVG/PNG responses
- Error handling for failed requests

### Main Renderer Integration
- `src/muya/lib/parser/render/index.js` - Integrates Kroki renderer
- `src/muya/lib/renderers/index.js` - Registers diagram handlers

## Supported Diagram Types
- PlantUML
- Mermaid  
- GraphViz
- Ditaa
- Blockdiag
- And many more via Kroki

## Configuration Points
- Kroki server URL (preferences)
- Diagram rendering enabled/disabled
- Export behavior for diagrams
- Fallback handling for offline mode

## Request Flow
1. Markdown parser detects diagram blocks
2. Kroki renderer extracts diagram code
3. HTTP request to Kroki server
4. SVG/PNG response embedded in output
5. Export includes rendered diagrams

## Error Handling
- Network failure fallback
- Invalid diagram syntax handling
- Server unavailable scenarios
- Timeout management

## Integration with Export
- HTML export includes rendered diagrams
- PDF export handles diagram assets
- Base64 embedding for self-contained exports