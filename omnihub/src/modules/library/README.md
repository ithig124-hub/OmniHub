# OmniHub Modules

This directory contains vanilla JavaScript modules that follow the Electron-style architecture pattern. These modules are integrated into the React application through wrapper components.

## Directory Structure

```
src/modules/
└── library/              # Digital Archive & PDF Library Module
    ├── library.html      # Module HTML template
    ├── library.css       # Module styles
    └── library.js        # Module logic and API integration
```

## Module: Library (Digital Archive)

**Location**: `/app/frontend/src/modules/library/`

**Integration**: `src/components/LibraryWrapper.jsx`

**Purpose**: Research-grade digital library system with Internet Archive integration

### Features
- Search Internet Archive for PDF books
- Save books to personal library (localStorage)
- Favorites management
- Grid/List view toggle
- Embedded PDF reader via Internet Archive
- Filter and sort capabilities

### Files
- **library.html** - Module structure and UI template
- **library.css** - Academic aesthetic styling with frosted glass effects
- **library.js** - Core logic, API integration, state management, UI rendering

### Public API
```javascript
window.LibraryModule = {
  initModule(container),      // Initialize module in container element
  addToLibrary(bookId),       // Add book to user's library
  toggleFavorite(bookId),     // Toggle favorite status
  openBook(bookId, title, pdfUrl), // Open PDF viewer
  closePdfViewer(),           // Close PDF viewer
  performSearch(query)        // Search Internet Archive
}
```

### Storage
- `omnihub_library` - User's saved books (localStorage)
- `omnihub_favorites` - Favorited books (localStorage)
- `omnihub_search_cache` - Cached search results (localStorage, 1hr TTL)

## How to Add New Modules

### 1. Create Module Directory
```bash
mkdir -p src/modules/<module-name>
```

### 2. Create Module Files
- `<module-name>.html` - HTML template
- `<module-name>.css` - Module styles
- `<module-name>.js` - Module logic

### 3. Create React Wrapper
```javascript
// src/components/<ModuleName>Wrapper.jsx
import React, { useEffect, useRef } from 'react';
import moduleHTML from '../modules/<module-name>/<module-name>.html';
import '../modules/<module-name>/<module-name>.css';

const ModuleWrapper = () => {
  const containerRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;

    import('../modules/<module-name>/<module-name>.js')
      .then(() => {
        if (containerRef.current && !isInitialized.current) {
          containerRef.current.innerHTML = moduleHTML;
          
          if (window.ModuleName && window.ModuleName.initModule) {
            window.ModuleName.initModule(containerRef.current);
            isInitialized.current = true;
          }
        }
      })
      .catch(console.error);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      isInitialized.current = false;
    };
  }, []);

  return <div ref={containerRef} className="module-container" />;
};

export default ModuleWrapper;
```

### 4. Export Module API
```javascript
// In <module-name>.js
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.ModuleName && window.ModuleName.initialized) {
    return;
  }

  function initModule(container) {
    // Module initialization logic
  }

  // Export public API
  window.ModuleName = {
    initModule,
    // other public methods
    initialized: true
  };

})();
```

## Future Modules

Based on the OmniHub architecture, planned modules include:

1. **Notes Module** (`src/modules/notes/`)
   - Markdown editor
   - Link to Library books
   - Knowledge management

2. **Map Module** (`src/modules/map/`)
   - Geographic exploration
   - Location-based book discovery
   - Spatial organization

3. **Advanced Search** (`src/modules/search/`)
   - Cross-module search
   - Full-text search
   - Knowledge graph

4. **Dashboard** (`src/modules/dashboard/`)
   - Overview widgets
   - Reading statistics
   - Quick access panels

5. **Tracking** (`src/modules/tracking/`)
   - Path tracking
   - Device synchronization
   - Activity logging

## Architecture Benefits

1. **Separation of Concerns**: Each module is self-contained
2. **Reusability**: Modules can be used in different contexts
3. **Maintainability**: Changes to one module don't affect others
4. **Testability**: Modules can be tested independently
5. **Performance**: Lazy loading of modules reduces initial load time

## Integration with React

Modules are integrated through wrapper components that:
- Load module HTML template using raw-loader
- Import module CSS (processed by webpack)
- Dynamically import module JS
- Initialize module in a container element
- Handle cleanup on unmount

## Development Guidelines

1. **Keep modules independent** - Don't create dependencies between modules
2. **Use localStorage for persistence** - Each module manages its own storage
3. **Export clean APIs** - Only expose necessary functions via window.ModuleName
4. **Handle initialization** - Check for existing instances before initializing
5. **Clean up on unmount** - Remove event listeners and clear state
6. **Document public APIs** - Clearly document all exported functions

## Webpack Configuration

The project uses custom webpack configuration in `craco.config.js`:

```javascript
// HTML files loaded as raw strings
{
  test: /\.html$/,
  exclude: /node_modules/,
  use: 'raw-loader'
}
```

This allows importing HTML files directly as strings for injection into the DOM.
