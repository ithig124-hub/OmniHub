# FactLens - Research & Insight Module

## Overview

FactLens is OmniHub's deep research and understanding layer. It transforms raw information into clear, structured knowledge perfect for students and researchers.

## Features

### 🔍 Smart Topic Analysis
- Enter any topic and get structured, verified information
- Breaks down topics into:
  - **Definitions** - Clear explanations
  - **Key Concepts** - Important ideas and principles
  - **Timeline** - Historical events and dates (when relevant)
  - **Cause & Effect** - Relationships and connections
  - **Real-world Examples** - Practical applications

### 📊 Difficulty Levels
- **Simple** - Easy to understand, simplified language
- **Student** - Balanced detail for learning
- **Advanced** - Comprehensive, technical information

### 🎨 Visual Explain Mode
- **Flow Diagrams** - Process and cycle visualization
- **Timelines** - Chronological event display
- **Comparison Tables** - Side-by-side analysis
- Automatically detects best visualization type

### 🔗 Cross-Module Integration

FactLens seamlessly integrates with other OmniHub modules:

#### Notes Integration
- Save any section to Notes with one click
- Export entire research as formatted notes
- Automatic tagging and categorization

#### Globe Integration
- Pin locations mentioned in research
- Fly to geographic coordinates
- Visual place-based learning

#### OmniSearch Integration
- All research automatically indexed
- Quick topic jumping
- Related topic suggestions

### 📤 Export System

Multiple export formats for different use cases:
- **Study Notes** - Formatted markdown for review
- **Summary Cards** - Flashcard-style summaries
- **Bullet Points** - Quick reference sheets

### ✅ Fact Verification

- Uses **Wikipedia** as primary knowledge source
- Shows confidence levels for content
- Displays last updated timestamps
- Clean, citation-ready formatting

## Usage

### Basic Search
1. Enter a topic in the search bar
2. Click "Analyze" or press Enter
3. Browse structured results

### Quick Topics
Click any quick topic button for instant research:
- 🌱 Photosynthesis
- ⚔️ World War I
- 🌌 Black Holes
- 🎨 Renaissance

### Saving Content
- Click "💾 Save to Notes" on any section
- Use "💾 Save All to Notes" for complete research
- Content is automatically tagged and organized

### Exporting
1. Click "📤 Export" button
2. Choose format (Notes, Cards, or Bullets)
3. Click "📋 Copy to Clipboard"

### Visual Mode
- Toggle "📊 Visual Mode" to see diagrams
- Automatically generates appropriate visualizations
- Works with processes, timelines, and comparisons

## Technical Details

### File Structure
```
factLens/
├── factLens.html          # Main UI
├── factLens.js            # Controller
├── factLens.css           # Styles
├── services/
│   ├── sourceResolver.js  # Wikipedia API integration
│   ├── topicParser.js     # Content analysis
│   └── summaryEngine.js   # Export generation
├── integrations/
│   ├── notesBridge.js     # Notes module integration
│   ├── globeBridge.js     # Globe module integration
│   └── omniSearchBridge.js # Search integration
└── README.md
```

### API Integration

**Wikipedia REST API**
- Search: `https://en.wikipedia.org/w/api.php?action=opensearch`
- Summary: `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`
- No API key required
- Rate limits respected

### Data Storage

FactLens uses multiple storage methods:
1. **OmniHub DataStore** (primary)
2. **LocalStorage** (fallback)
3. **Session state** (temporary)

### Module Communication

Integrates with OmniHub navigation system:
```javascript
window.parent.OmniHub.navigateToModule('notes')
window.parent.postMessage({ type: 'action', data: {} }, '*')
```

## Development

### Adding New Features

1. **New Visual Type**: Edit `topicParser.js` → `generateVisualData()`
2. **New Export Format**: Edit `summaryEngine.js` → add export method
3. **New Integration**: Create bridge in `integrations/`

### Testing

Test with various topic types:
- **Science**: Photosynthesis, DNA, Gravity
- **History**: World War I, Renaissance, Ancient Rome
- **Geography**: Mount Everest, Pacific Ocean
- **Technology**: Internet, Computer, Algorithm

## Best Practices

### For Students
1. Start with "Student" difficulty
2. Save key concepts immediately
3. Use Visual Mode for complex topics
4. Export as study notes for review

### For Research
1. Use "Advanced" difficulty
2. Check confidence levels
3. Follow related topics
4. Save complete research

## Troubleshooting

### No Results Found
- Try different search terms
- Check spelling
- Use broader topics

### Slow Loading
- Wikipedia API may be busy
- Check internet connection
- Try again in a moment

### Missing Sections
- Not all topics have timelines
- Visual mode depends on content type
- Some topics lack related links

## Future Enhancements

- [ ] Multiple language support
- [ ] Custom knowledge source integration
- [ ] Collaborative research notes
- [ ] AI-powered summaries
- [ ] Offline mode with cached articles
- [ ] Citation generator
- [ ] Research comparison tool

## Credits

Built for OmniHub v2
Data source: Wikipedia
Module: FactLens
Version: 1.0.0
