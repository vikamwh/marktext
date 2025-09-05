# MarkText Project Architecture

## Core Structure
- **Electron-based app**: Main process (Node.js) + Renderer process (Vue.js)
- **Main process**: `src/main/` - handles file operations, preferences, menus
- **Renderer process**: `src/renderer/` - Vue.js UI components
- **Muya editor**: `src/muya/` - core markdown editor engine

## Key Components

### Main Process (`src/main/`)
- `main/index.js` - Electron main entry point
- `main/menu/actions/` - Menu action handlers
- `main/preferences/` - App preferences management
- `main/windows/` - Window management

### Renderer Process (`src/renderer/`)
- Vue.js SPA with Vuex store
- `renderer/components/` - UI components
- `renderer/store/` - Vuex state management
- `renderer/services/` - API services

### Muya Editor (`src/muya/`)
- Core markdown editor engine
- `muya/lib/parser/` - Markdown parsing
- `muya/lib/renderers/` - Content rendering
- `muya/lib/utils/` - Utilities

## Data Flow
1. Main process handles file I/O
2. IPC communication between main/renderer
3. Renderer manages UI state via Vuex
4. Muya handles editor content and rendering