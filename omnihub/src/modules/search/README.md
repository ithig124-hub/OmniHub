# Advanced Search Module - OmniHub

## Overview

The Advanced Search module is a powerful local search engine designed for OmniHub, providing intelligent discovery across notes, maps, and library resources. It offers a research-grade interface with frosted glass aesthetics and both light/dark theme support.

---

## File Structure

```
src/modules/search/
├── SearchModule.jsx    # Main React component
├── search.css          # Comprehensive styling with design tokens
├── index.js            # Module export
└── README.md           # This documentation
```

---

## Core Features

### 1. **Multi-Source Search**
- **Notes**: Search titles, content, tags, and linked notes
- **Maps**: Search location names, addresses, coordinates, and notes
- **Library**: Search book titles, authors, subjects, and metadata

### 2. **Advanced Query Support**
- Keyword search (case-insensitive)
- Phrase search using quotes (`"exact phrase"`)
- Real-time search with 300ms debouncing
- Search result highlighting

### 3. **Filtering System**
- Module-based filtering (All, Notes, Maps, Library)
- Tag-based filtering with multi-select
- Combined filter support (query + tags)
- Visual filter state indicators

### 4. **User Experience**
- Instant search results
- Search history (last 5 queries)
- Empty state guidance
- Loading states
- Click-to-navigate results (mocked)
- Responsive design (mobile-first)

### 5. **Theme Support**
- Light mode with subtle gradients
- Dark mode with deep blue-purple palette
- Frosted glass UI effects
- Smooth theme transitions

---

## How the Search Index Works

### Current Implementation (In-Memory)

The search module currently uses **in-memory indexing** with mock data for demonstration purposes. Here's how it works:

#### Data Structure

```javascript
const mockData = {
  notes: [
    {
      id: 'n1',
      title: 'Note title',
      content: 'Note content...',
      tags: ['tag1', 'tag2'],
      date: '2024-01-15',
      linkedNotes: ['n2', 'n3']
    }
  ],
  maps: [
    {
      id: 'm1',
      name: 'Location name',
      address: 'Full address',
      coords: 'lat,long',
      notes: 'Location description'
    }
  ],
  library: [
    {
      id: 'b1',
      title: 'Book title',
      author: 'Author name',
      subject: 'Subject category',
      year: 2000,
      metadata: { publisher: '...', pages: 200 }
    }
  ]
};
```

#### Search Algorithm

The search performs the following steps:

1. **Query Normalization**
   - Convert query to lowercase
   - Detect phrase search (quoted text)
   - Extract actual search terms

2. **Field Matching**
   - Search across all relevant fields for each data type
   - Use `String.includes()` for substring matching
   - Support both keyword and phrase matching

3. **Tag Filtering**
   - If tags are selected, apply as AND filter
   - Only return results that match both query AND selected tags

4. **Result Scoring** (Basic)
   - Currently returns all matches without ranking
   - Future enhancement: relevance scoring based on match location

5. **Result Formatting**
   - Extract context around matches (±20 characters)
   - Add metadata (date, location, author)
   - Include type identifier and icon

---

## Registering New Modules (Future Integration)

When you add new modules (Timeline, Device Logs, Wearables, etc.), follow this pattern:

### Step 1: Define Data Structure

```javascript
// In your module's data layer
export const myModuleData = [
  {
    id: 'unique-id',
    searchableField1: 'value',
    searchableField2: 'value',
    metadata: { ... }
  }
];
```

### Step 2: Register with Search Module

Add your data source to the search module:

```javascript
// In SearchModule.jsx, import your data
import { myModuleData } from '@/modules/myModule/data';

// Add to search targets in mockData or create a dynamic data loader
const mockData = {
  notes: [...],
  maps: [...],
  library: [...],
  myModule: myModuleData  // Add your module
};
```

### Step 3: Add Search Logic

Extend the `performSearch` function:

```javascript
// Search your module
if (filter === 'all' || filter === 'myModule') {
  myModuleData.forEach(item => {
    if (
      item.searchableField1.toLowerCase().includes(lowerQuery) ||
      item.searchableField2.toLowerCase().includes(lowerQuery)
    ) {
      searchResults.push({
        type: 'myModule',
        id: item.id,
        title: item.searchableField1,
        preview: item.searchableField2,
        icon: MyModuleIcon,  // Import from lucide-react
        // Add any additional metadata
      });
    }
  });
}
```

### Step 4: Add Filter Tab

Add a new tab for your module:

```javascript
<TabsTrigger value="myModule" className="tab-trigger">
  <MyModuleIcon className="h-4 w-4 mr-1" />
  My Module
</TabsTrigger>
```

### Step 5: Handle Navigation

Update the `handleResultClick` function to route to your module:

```javascript
const handleResultClick = (result) => {
  switch(result.type) {
    case 'myModule':
      // Navigate to your module
      console.log(`Opening myModule with ID: ${result.id}`);
      // Future: router.push(`/myModule/${result.id}`);
      break;
    // ... other cases
  }
};
```

---

## Advanced Integration Patterns

### Real Data Integration

Replace the mock data with real module data:

```javascript
// Create a data aggregator
import { getAllNotes } from '@/modules/notes/api';
import { getAllMaps } from '@/modules/maps/api';
import { getAllBooks } from '@/modules/library/api';

const loadSearchData = async () => {
  const [notes, maps, library] = await Promise.all([
    getAllNotes(),
    getAllMaps(),
    getAllBooks()
  ]);
  
  return { notes, maps, library };
};

// Use in component
useEffect(() => {
  loadSearchData().then(setSearchData);
}, []);
```

### IndexedDB Integration

For larger datasets, use IndexedDB for persistent indexing:

```javascript
// Create search index in IndexedDB
const createSearchIndex = async (data) => {
  const db = await openDB('OmniHubSearch', 1, {
    upgrade(db) {
      const store = db.createObjectStore('searchIndex', { keyPath: 'id' });
      store.createIndex('type', 'type');
      store.createIndex('content', 'searchableContent');
      store.createIndex('tags', 'tags', { multiEntry: true });
    }
  });
  
  // Add all searchable items
  const tx = db.transaction('searchIndex', 'readwrite');
  data.forEach(item => tx.store.add(item));
  await tx.done;
};

// Query the index
const searchIndex = async (query) => {
  const db = await openDB('OmniHubSearch', 1);
  // Use IDBKeyRange for efficient queries
  const results = await db.getAllFromIndex(
    'searchIndex', 
    'content', 
    IDBKeyRange.bound(query, query + '\uffff')
  );
  return results;
};
```

### Full-Text Search with Lunr.js

For more sophisticated search, integrate Lunr.js:

```javascript
import lunr from 'lunr';

// Build search index
const buildLunrIndex = (documents) => {
  return lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('content');
    this.field('tags', { boost: 5 });
    
    documents.forEach(doc => this.add(doc));
  });
};

// Search with Lunr
const searchWithLunr = (index, query) => {
  return index.search(query).map(result => ({
    ...result,
    score: result.score,  // Relevance score
  }));
};
```

---

## Design System

### Color Tokens

The module uses HSL-based color tokens for consistency:

```css
:root {
  /* Primary Colors */
  --search-primary: 224 64% 45%;      /* Deep Blue Purple */
  --search-secondary: 259 45% 58%;    /* Medium Purple Blue */
  --search-accent: 224 70% 65%;       /* Light Accent */
  
  /* Surface Colors */
  --search-background: 0 0% 100%;
  --search-surface: 0 0% 98%;
  
  /* Text Colors */
  --search-text: 224 15% 20%;
  --search-text-muted: 224 10% 50%;
  
  /* Glass Effect */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(42, 82, 190, 0.15);
  --glass-shadow: 0 8px 32px rgba(42, 82, 190, 0.12);
  --glass-blur: 12px;
}
```

### Typography

- **Primary Font**: Inter (body, UI elements)
- **Display Font**: Space Grotesk (headings, titles)
- **Scale**: 0.75rem to 2.5rem with responsive sizing

### Spacing

- **Base Unit**: 1rem (16px)
- **Scale**: 0.25rem increments
- **Container**: Max-width 1200px, centered

---

## Performance Considerations

### Current Optimizations

1. **Debounced Search**: 300ms delay prevents excessive re-renders
2. **Memoized Callbacks**: `useCallback` for search function
3. **Conditional Rendering**: Only render what's needed
4. **CSS Transitions**: Hardware-accelerated transforms

### Future Optimizations

1. **Virtual Scrolling**: For 1000+ results (react-window)
2. **Web Workers**: Move search logic off main thread
3. **Progressive Loading**: Load results in batches
4. **Search Caching**: Cache recent queries
5. **Lazy Loading**: Load module data on-demand

---

## Accessibility

The module follows WCAG 2.1 AA standards:

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators on all focusable elements
- ✅ Sufficient color contrast (4.5:1 minimum)
- ✅ Semantic HTML structure
- ✅ Screen reader friendly

### Keyboard Shortcuts (Future Enhancement)

```javascript
// Suggested shortcuts
Ctrl/Cmd + K    → Focus search
Esc             → Clear search
Arrow keys      → Navigate results
Enter           → Open selected result
Tab             → Move between filters
```

---

## Testing

### Manual Testing Checklist

- [ ] Search returns correct results for each module type
- [ ] Phrase search with quotes works correctly
- [ ] Tag filtering narrows results appropriately
- [ ] Module tabs filter correctly
- [ ] Clear button removes search and tags
- [ ] Dark mode toggle works smoothly
- [ ] Search history displays recent queries
- [ ] Result cards are clickable and log navigation
- [ ] Empty states display appropriately
- [ ] Loading state appears during search
- [ ] Responsive design works on mobile

### Automated Testing (Future)

```javascript
// Example test structure
describe('SearchModule', () => {
  it('should display results for keyword search', () => {
    // Test implementation
  });
  
  it('should filter results by module type', () => {
    // Test implementation
  });
  
  it('should support phrase search with quotes', () => {
    // Test implementation
  });
  
  it('should handle empty search state', () => {
    // Test implementation
  });
});
```

---

## Console Logging

The module logs navigation attempts to help with integration:

```javascript
// When clicking a result
[MOCK NAVIGATION] Opening note module with ID: n1
Result details: { type: 'note', id: 'n1', title: '...' }
```

Replace these console logs with actual navigation once routing is set up.

---

## Future Enhancements

### Phase 1: Core Improvements
- [ ] Relevance scoring and ranking
- [ ] Search result pagination
- [ ] Advanced query syntax (AND, OR, NOT operators)
- [ ] Date range filtering
- [ ] Sort options (relevance, date, alphabetical)

### Phase 2: Intelligence Features
- [ ] Saved searches with notifications
- [ ] Search suggestions and autocomplete
- [ ] Related content recommendations
- [ ] Cross-reference visualization (graph view)
- [ ] Search analytics and insights

### Phase 3: Advanced Features
- [ ] PDF full-text indexing
- [ ] OCR for image-based content
- [ ] Geospatial queries for map data
- [ ] Semantic search (meaning-based, not just keywords)
- [ ] Export search results (CSV, JSON)

### Phase 4: AI Integration (Optional)
- [ ] Natural language query understanding
- [ ] Automatic categorization
- [ ] Entity recognition and linking
- [ ] Smart summaries of search results

---

## Troubleshooting

### Search Not Working

1. Check browser console for errors
2. Verify mockData is properly defined
3. Ensure debounce timeout hasn't been set too high
4. Check if filters are correctly applied

### Results Not Displaying

1. Verify search query matches data
2. Check filter state (module/tag filters may be active)
3. Inspect network tab for data loading issues
4. Confirm result rendering logic

### Theme Issues

1. Check CSS custom properties are defined
2. Verify dark class is toggled on root element
3. Inspect computed styles for token values
4. Ensure backdrop-filter is supported in browser

---

## Contributing

When extending this module:

1. Follow existing code patterns
2. Use the design token system (no hardcoded colors)
3. Maintain accessibility standards
4. Add appropriate JSDoc comments
5. Test on both light and dark themes
6. Ensure mobile responsiveness

---

## API Reference

### SearchModule Component Props

Currently accepts no props (standalone module). Future version may accept:

```typescript
interface SearchModuleProps {
  onResultClick?: (result: SearchResult) => void;
  initialQuery?: string;
  dataSource?: SearchDataSource;
  theme?: 'light' | 'dark' | 'auto';
}
```

### SearchResult Interface

```typescript
interface SearchResult {
  type: 'note' | 'map' | 'library';
  id: string;
  title: string;
  preview: string;
  subtitle?: string;
  tags?: string[];
  date?: string;
  coords?: string;
  icon: LucideIcon;
  metadata?: Record<string, any>;
}
```

---

## License

Part of the OmniHub project. See main project license for details.

---

## Support

For questions or issues with the Search Module:

1. Check this README first
2. Review console logs for navigation/error messages
3. Inspect the code comments in SearchModule.jsx
4. Check the OmniHub project documentation

---

**Built with ❤️ for OmniHub - Your Personal Knowledge Intelligence System**
