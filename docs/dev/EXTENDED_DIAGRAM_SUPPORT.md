# Extended Kroki Diagram Support

## Overview

This implementation extends MarkText's diagram rendering capabilities by adding support for additional diagram types through Kroki integration, while maintaining a clear separation between Kroki-based and local rendering.

## Architecture

### Two-Path Design

The implementation follows a clear two-path approach:

1. **Kroki Path**: For diagrams that can be rendered via Kroki server
2. **Local Path**: For diagrams that have local JavaScript renderers

### Core Components

#### 1. `diagramStrategy.js` - Central Strategy Module
- **Purpose**: Unified diagram rendering logic with clear path separation
- **Key Functions**:
  - `determineRenderingStrategy()`: Decides between Kroki/Local/Unsupported
  - `renderWithKroki()`: Handles Kroki-based rendering
  - `renderWithLocal()`: Handles local JavaScript rendering
  - `renderDiagramUnified()`: Main entry point for all diagram rendering

#### 2. Extended `kroki.js` - Enhanced Kroki Client
- **Extended TYPE_MAP**: Now supports 20+ diagram types
- **Helper Functions**:
  - `isKrokiSupported()`: Checks if diagram type is supported by Kroki
  - `hasLocalRenderer()`: Checks if local renderer exists
  - `isKrokiOnly()`: Identifies Kroki-exclusive diagram types

#### 3. Updated Rendering Pipeline
- **`index.js`**: Simplified to use unified strategy
- **`exportHtml.js`**: Updated to support all diagram types in export

## Supported Diagram Types

### Core Types (Kroki + Local Fallback)
- `mermaid` - Flowcharts, sequence diagrams, etc.
- `plantuml` - UML diagrams
- `vega-lite` - Data visualizations
- `flowchart` - Flow diagrams (local only)
- `sequence` - Sequence diagrams (local only)

### Kroki-Only Types
- `ditaa` - ASCII art diagrams
- `graphviz`/`dot` - Graph layouts
- `blockdiag` - Block diagrams
- `seqdiag` - Sequence diagrams (Kroki version)
- `actdiag` - Activity diagrams
- `nwdiag` - Network diagrams
- `packetdiag` - Packet diagrams
- `rackdiag` - Rack diagrams
- `c4plantuml` - C4 model diagrams
- `erd` - Entity relationship diagrams
- `excalidraw` - Hand-drawn style diagrams
- `nomnoml` - UML-like diagrams
- `svgbob` - ASCII to SVG conversion
- `wavedrom` - Digital timing diagrams
- `pikchr` - Pikchr diagrams
- `structurizr` - Architecture diagrams
- `d2` - Declarative diagramming
- `dbml` - Database markup language

## Configuration

No changes to existing configuration:
- `enableKroki`: Boolean to enable/disable Kroki
- `krokiServerUrl`: Default `http://localhost:8000`
- `krokiTimeoutMs`: Default `5000`

## Rendering Logic

### Strategy Selection
```javascript
// Kroki-only types MUST use Kroki
if (isKrokiOnly(type)) {
  return krokiEnabled ? 'kroki' : 'unsupported'
}

// Core types prefer Kroki but fallback to local
if (hasLocalRenderer(type)) {
  return krokiEnabled ? 'kroki-with-fallback' : 'local'
}
```

### Fallback Behavior
- **Kroki-only types**: Show error if Kroki disabled
- **Core types**: Automatic fallback to local renderer if Kroki fails
- **Export**: Same strategy applied to HTML export

## Benefits

1. **Clear Separation**: Two distinct rendering paths
2. **Extensible**: Easy to add new diagram types
3. **Robust Fallback**: Core functionality preserved if Kroki unavailable
4. **Consistent**: Same logic in preview and export
5. **User-Friendly**: Clear error messages for unsupported scenarios

## Testing

Use `test/extended-diagrams-sample.md` to test:
1. Enable/disable Kroki in settings
2. Test core types with and without Kroki
3. Test Kroki-only types (should fail gracefully when Kroki disabled)
4. Test HTML export functionality

## Files Modified

- `src/muya/lib/parser/render/kroki.js` - Extended type support
- `src/muya/lib/parser/render/diagramStrategy.js` - NEW: Central strategy
- `src/muya/lib/parser/render/index.js` - Simplified using strategy
- `src/muya/lib/utils/exportHtml.js` - Updated for all types
- `test/extended-diagrams-sample.md` - NEW: Test document

## Future Enhancements

- Add more Kroki diagram types as they become available
- Implement caching for Kroki responses
- Add diagram type validation in editor
- Support custom Kroki endpoints per diagram type
