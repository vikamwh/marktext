# Kroki Always-On Implementation Documentation

**Date: 2025-09-04**

## Overview
This document describes the implementation of the "Kroki Always-On" feature, which involved:
1.  Completely removing local diagram rendering.
2.  Removing the Kroki toggle from the settings, making Kroki always active.
3.  Implementing informative error messages for server-related issues.
4.  Displaying detailed error messages from the server for syntax errors.

## Key Objectives
-   **Simplification**: No more choosing between local and Kroki renderers.
-   **Consistency**: All diagrams are rendered via Kroki.
-   **Robustness**: Better error handling for various failure scenarios.
-   **User-Friendliness**: Clear guidance when problems occur.

## Modified Files

### 1. Settings UI Removed

#### `src/renderer/prefComponents/markdown/index.vue`
-   **Removed**: Kroki enable/disable toggle.
-   **Kept**: Kroki server URL and timeout settings.
-   **Reason**: Kroki is now always active.

```vue
<!-- REMOVED -->
<bool
  description="Render diagrams via Kroki"
  notes="If enabled, MarkText sends diagram code to the configured Kroki server and embeds the returned SVG."
  :bool="enableKroki"
  :onChange="value => onSelectChange('enableKroki', value)"
></bool>
```

#### `src/renderer/store/preferences.js`
-   **Removed**: `enableKroki: false` from the state.
-   **Kept**: `krokiServerUrl` and `krokiTimeoutMs`.

#### `static/preference.json`
-   **Removed**: `"enableKroki": false`.
-   **Kept**: Kroki server URL and timeout configuration.

### 2. Enhanced Kroki Client

#### `src/muya/lib/parser/render/kroki.js`
-   **Improved Error Messages**: Specific errors for different HTTP status codes.
-   **Timeout Handling**: Better timeout messages.
-   **Server Reachability**: Network errors are detected and reported.
-   **Increased Default Timeout**: From 1500ms to 5000ms.

**New Error Types:**
-   `400 Bad Request`: "Diagram syntax error: ..."
-   `404 Not Found`: "Diagram type 'X' not supported by Kroki server"
-   `500+ Server Error`: "Kroki server internal error"
-   `Network Error`: "Cannot reach Kroki server at ... - Check server URL and network connection"
-   `Timeout`: "Kroki server timeout (Xms) - Server may be unreachable"

### 3. Main Rendering Engine Switched

#### `src/muya/lib/parser/render/index.js`

**Mermaid Rendering (`renderMermaid`):**
-   **Removed**: Local Mermaid library integration.
-   **Removed**: `useKroki` condition - always use Kroki.
-   **Added**: Loading indicator during Kroki request.
-   **Added**: Detailed error messages on Kroki failures.

**Diagram Rendering (`renderDiagram`):**
-   **Removed**: Local renderers (flowchart, sequence, plantuml, vega-lite).
-   **Removed**: `useKroki` condition and fallback logic.
-   **Added**: Support check for diagram types.
-   **Added**: Loading indicator and better error messages.

### 4. HTML Export Adapted

#### `src/muya/lib/utils/exportHtml.js`
-   **Removed**: Local renderer dependencies.
-   **Removed**: Fallback to local libraries.
-   **Simplified**: Always use Kroki for all diagram types.
-   **Improved**: Error handling with HTML styling for export.

### 5. CSS for Better Error Messages

#### `src/muya/lib/assets/styles/index.css`
**New CSS Classes:**
```css
.ag-diagram-error {
  color: var(--deleteColor);
  font-size: 14px;
  font-style: italic;
  font-family: monospace;
  padding: 8px;
  border: 1px dashed var(--deleteColor);
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.05);
  display: block;
  text-align: center;
}

.ag-diagram-loading {
  color: var(--editorColor);
  font-size: 14px;
  font-style: italic;
  font-family: monospace;
  padding: 8px;
  text-align: center;
  display: block;
}
```

## New User Experience

### 1. Successful Diagram Rendering
-   Diagrams are rendered via Kroki.
-   Loading indicator during the request.
-   Exact size (not responsive) for consistent display.

### 2. Server Unreachable
```
Cannot reach Kroki server at http://localhost:8000 - Check server URL and network connection
```

### 3. Server Timeout
```
Kroki server timeout (5000ms) - Server may be unreachable
```

### 4. Syntax Error in Diagram
```
Mermaid Error: Diagram syntax error: Parse error on line 2
```

### 5. Unsupported Diagram Type
```
Diagram type 'unsupported' not supported by Kroki
```

### 6. Server Error
```
PlantUML Error: Kroki server internal error (503)
```

## Technical Details

### Default Configuration
-   **Kroki Server URL**: `http://localhost:8000` (default)
-   **Timeout**: `5000ms` (increased from 1500ms)
-   **Supported Types**: mermaid, plantuml, vega-lite, flowchart, sequence

### Error Handling Pipeline
1.  **Module Load Check**: Checks if Kroki modules can be loaded.
2.  **Support Check**: Checks if the diagram type is supported.
3.  **Network Request**: Makes an HTTP POST to the Kroki server.
4.  **Response Parsing**: Analyzes HTTP status and body for specific errors.
5.  **Display**: Shows either the SVG or a formatted error message.

### Removed Dependencies
Since local renderers are no longer used, the following dependencies can be removed:
-   Mermaid-specific local initialization
-   Flowchart/Sequence renderer
-   PlantUML local renderer
-   Vega-Lite local renderer

## Migration

### For Users
-   **Kroki Server Required**: Local rendering no longer works.
-   **Settings**: The Kroki enable/disable toggle is removed.
-   **Server URL**: Must be configured correctly.

### For Developers
-   **Imports**: Local renderer imports can be removed.
-   **Conditions**: `enableKroki` checks are no longer necessary.
-   **Error Handling**: Use the new error classes.

## Test File
A test file could be created at `test/kroki-always-on.md` to include all supported diagram types and error cases.

## Future
-   **Server Redundancy**: Support multiple Kroki server URLs.
-   **Caching**: Client-side caching for rendered SVGs.
-   **Offline Mode**: Warning when the server is not available.
