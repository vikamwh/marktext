# Kroki Always-On Implementation

**Implementation Date:** 2025-09-03  
**Project:** MarkText - Kroki Always-On Integration

## Overview

This document describes the implementation of "Kroki Always-On" functionality in MarkText, where all diagram rendering is exclusively handled through the Kroki server, removing all local diagram renderers.

## Changes Implemented

### 1. Local Renderer Removal

**Files Modified:**
- `src/muya/lib/renderers/index.js`

**Implementation:**
- Completely replaced the `loadRenderer` function with a stub that throws an error
- Removed all local renderer imports and cache logic
- All diagram rendering requests now fail with descriptive error messages directing users to Kroki server

```javascript
const loadRenderer = async (name) => {
  throw new Error(`Local renderer '${name}' is no longer available. All diagrams are now rendered via Kroki server.`)
}
```

### 2. Preference Schema Updates

**Files Modified:**
- `src/main/preferences/schema.json`
- `static/preference.json`

**Changes:**
- **Removed:** `enableKroki` toggle completely from schema and static config
- **Kept:** `krokiServerUrl` and `krokiTimeoutMs` settings for configuration

**New Schema Properties:**
```json
{
  "krokiServerUrl": {
    "description": "Markdown--Kroki server base URL (e.g., https://kroki.io). All diagrams are always rendered via Kroki.",
    "type": "string",
    "default": "https://kroki.io"
  },
  "krokiTimeoutMs": {
    "description": "Markdown--Timeout for Kroki requests in milliseconds.",
    "type": "number",
    "minimum": 1000,
    "default": 10000
  }
}
```

### 3. User Interface Updates

**Files Modified:**
- `src/renderer/prefComponents/markdown/index.vue`

**Changes:**
- Removed Kroki enable/disable toggle from preferences UI
- Added informational message: "Kroki Always-On: All diagrams are rendered via Kroki server"
- Kept server URL and timeout configuration options
- Added CSS styling for the informational message

**UI Elements Removed:**
- Boolean toggle for enabling/disabling Kroki
- Related state management for the toggle

**UI Elements Added:**
- Styled informational div explaining always-on behavior
- CSS styling with blue left border and light blue background

**UI Elements Retained:**
- Text input for Kroki server URL with validation
- Text input for timeout configuration

### 4. Enhanced Error Handling

**Files Modified:**
- `src/muya/lib/parser/render/kroki.js`
- `src/muya/lib/parser/render/index.js`

**Error Message Improvements:**

#### Network Errors:
```javascript
if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
  errorMsg = `Cannot connect to Kroki server. Please check your network connection and server URL: ${serverUrl}`
}
```

#### Timeout Errors:
```javascript
if (err.message.includes('kroki-timeout')) {
  errorMsg = `Kroki server timeout (${timeoutMs}ms). Check server availability.`
}
```

#### HTTP Status Specific Errors:
- **400 Bad Request:** "Invalid diagram syntax" with server response details
- **404 Not Found:** "Diagram type not supported by server"
- **500 Internal Server Error:** "Server processing error" with details
- **5xx Errors:** "Server error - please try again later"

#### Syntax Error Detection:
```javascript
if (err.message.includes('render failed') && err.message.includes('400')) {
  errorMsg = `${diagramName} syntax error. Please check your diagram code.`
}
```

### 5. Kroki Integration Module

**Files Modified:**
- `src/muya/lib/parser/render/kroki.js`

**Features:**
- Comprehensive HTTP status code handling
- Detailed error messages with context
- Timeout management with AbortController
- Support for multiple diagram types: mermaid, plantuml, vega-lite
- Content-Type and Accept header management
- Response validation and sanitization

**Supported Diagram Types:**
```javascript
const TYPE_MAP = {
  mermaid: 'mermaid',
  plantuml: 'plantuml',
  'vega-lite': 'vegalite'
}
```

## Technical Architecture

### Rendering Flow

1. **Diagram Detection:** Parser identifies code blocks with supported diagram types
2. **Kroki Request:** `renderKrokiToSvg()` sends POST request to configured Kroki server
3. **Error Handling:** Comprehensive error handling with user-friendly messages
4. **SVG Integration:** Successful responses are sanitized and injected as SVG
5. **Cache Management:** Render cache is cleared after each rendering cycle

### Error Display

Error messages are displayed in place of diagrams with:
- Clear problem identification
- Actionable suggestions for resolution
- Context-specific information (server URL, timeout values)
- CSS styling via `.kroki-error` and `.AG_MATH_ERROR` classes

### Configuration

Users can configure:
- **Server URL:** Custom Kroki server endpoint (default: https://kroki.io)
- **Timeout:** Request timeout in milliseconds (default: 10000ms, minimum: 1000ms)

## Benefits

### Performance
- Eliminates heavy client-side diagram libraries
- Reduces bundle size significantly
- Offloads diagram rendering to specialized server
- Leverages server-side caching and optimization

### Maintenance
- Single rendering pathway reduces complexity
- Centralized error handling
- No need to maintain multiple diagram library versions
- Simplified dependency management

### Features
- Access to full Kroki diagram ecosystem
- Server-side rendering capabilities
- Consistent diagram output across platforms
- Better memory management

### User Experience
- Detailed error messages with actionable guidance
- Consistent diagram rendering experience
- No local installation requirements
- Server-specific error context

## Configuration Options

### Server URL Validation
- Must match regex: `^(https?:\/\/).*`
- Default: `https://kroki.io`
- Can be changed to private Kroki instances

### Timeout Configuration
- Minimum: 1000ms
- Default: 10000ms
- Configurable based on network conditions and server performance

## Error Recovery

The implementation includes robust error recovery:

1. **Network Issues:** Clear messages about connection problems with server URL
2. **Timeouts:** Timeout duration displayed with suggestions to check server status
3. **Syntax Errors:** Diagram-type-specific error messages for debugging
4. **Server Errors:** Distinction between client (4xx) and server (5xx) errors

## Migration Notes

### Breaking Changes
- All local diagram rendering is removed
- `krokiEnabled` preference no longer exists
- Local diagram libraries are no longer bundled

### Backward Compatibility
- Existing documents continue to work if Kroki server is accessible
- Preference migration handles removal of deprecated settings
- Error messages guide users on configuration requirements

## Future Considerations

### Potential Enhancements
- Diagram caching for offline scenarios
- Multiple Kroki server fallbacks
- Custom diagram type mapping
- Performance monitoring and metrics

### Monitoring
- Track rendering success/failure rates
- Monitor server response times
- Log configuration issues for debugging

## Dependencies

### Removed
- Mermaid client-side library
- js-sequence-diagrams
- PlantUML local rendering
- Vega-Lite client-side processing

### Added/Enhanced
- Enhanced fetch-based Kroki client
- AbortController for timeout management
- Comprehensive error handling system
- DOMPurify for SVG sanitization (existing)

## Testing Notes

The implementation should be tested with:
- Various diagram types (Mermaid, PlantUML, Vega-Lite)
- Network failure scenarios
- Timeout conditions
- Invalid syntax handling
- Server error responses
- Custom Kroki server configurations

---

This implementation successfully achieves the goal of making Kroki the exclusive diagram rendering solution in MarkText while providing excellent user experience through detailed error handling and clear configuration options.