/**
 * OmniHub Search Module
 * Queries all modules via DataStore for unified search
 * Integrates with Wikipedia and Nominatim APIs for real-world data
 */

// ============================================
// SEARCH STATE
// ============================================
const SearchState = {
    activeFilter: 'all',
    selectedTags: [],
    searchHistory: JSON.parse(localStorage.getItem('omnihub_search_history') || '[]'),
    results: [],
    isLoading: false,
    userPreference: localStorage.getItem('omnihub_search_preference') || 'relevance', // relevance, date, alphabetical
    includeExternalData: JSON.parse(localStorage.getItem('omnihub_search_external') || 'true'),
    searchIndex: null, // Persistent search index
    lastIndexUpdate: null
};

// ============================================
// SEARCH INDEX SYSTEM (Phase 3)
// ============================================
class SearchIndex {
    constructor() {
        this.index = new Map();
        this.metadata = {
            version: '2.0',
            lastUpdate: null,
            itemCount: 0
        };
        this.loadIndex();
    }
    
    loadIndex() {
        try {
            const stored = localStorage.getItem('omnihub_search_index_v2');
            if (stored) {
                const data = JSON.parse(stored);
                this.index = new Map(data.index);
                this.metadata = data.metadata;
                console.log(`📚 Loaded search index: ${this.metadata.itemCount} items`);
            }
        } catch (error) {
            console.error('Failed to load search index:', error);
            this.index = new Map();
        }
    }
    
    saveIndex() {
        try {
            const data = {
                index: Array.from(this.index.entries()),
                metadata: this.metadata
            };
            localStorage.setItem('omnihub_search_index_v2', JSON.stringify(data));
            console.log(`💾 Saved search index: ${this.metadata.itemCount} items`);
        } catch (error) {
            console.error('Failed to save search index:', error);
        }
    }
    
    buildIndex(allData) {
        console.log('🔨 Building search index...');
        this.index.clear();
        
        allData.forEach(item => {
            const searchableText = this.extractSearchableText(item);
            const tokens = this.tokenize(searchableText);
            
            // Add to index
            tokens.forEach(token => {
                if (!this.index.has(token)) {
                    this.index.set(token, []);
                }
                this.index.get(token).push({
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    score: this.calculateTokenScore(token, searchableText)
                });
            });
        });
        
        this.metadata.lastUpdate = Date.now();
        this.metadata.itemCount = allData.length;
        this.saveIndex();
        
        console.log(`✅ Index built: ${this.index.size} unique tokens`);
    }
    
    extractSearchableText(item) {
        return [
            item.title || '',
            item.preview || '',
            item.content || '',
            item.author || '',
            ...(item.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
    }
    
    tokenize(text) {
        // Remove special characters and split into words
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2) // Ignore short words
            .filter((word, index, arr) => arr.indexOf(word) === index); // Unique
    }
    
    calculateTokenScore(token, fullText) {
        // Simple TF score (term frequency)
        const count = (fullText.match(new RegExp(token, 'g')) || []).length;
        return Math.min(count / 10, 1.0); // Normalize to 0-1
    }
    
    search(query, allData) {
        const queryTokens = this.tokenize(query);
        const matches = new Map(); // id -> score
        
        queryTokens.forEach(token => {
            const results = this.index.get(token) || [];
            results.forEach(result => {
                const currentScore = matches.get(result.id) || 0;
                matches.set(result.id, currentScore + result.score);
            });
        });
        
        // Get full items and sort by score
        const results = Array.from(matches.entries())
            .map(([id, score]) => ({
                item: allData.find(item => item.id === id),
                score: score
            }))
            .filter(r => r.item)
            .sort((a, b) => b.score - a.score)
            .map(r => r.item);
        
        return results;
    }
    
    needsRebuild() {
        // Rebuild if index is old (>1 hour) or empty
        if (!this.metadata.lastUpdate) return true;
        const hoursSinceUpdate = (Date.now() - this.metadata.lastUpdate) / (1000 * 60 * 60);
        return hoursSinceUpdate > 1;
    }
}

// Initialize search index
SearchState.searchIndex = new SearchIndex();

// ============================================
// DATASTORE ACCESS
// ============================================
function getDataStore() {
    // Try to get DataStore from parent window (when in iframe) or global
    return window.parent?.OmniHubDataStore || window.OmniHubDataStore || null;
}

// ============================================
// EXTERNAL API INTEGRATION
// ============================================

// Wikipedia API
async function searchWikipedia(query, limit = 5) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?` +
            `action=opensearch&search=${encodeURIComponent(query)}` +
            `&limit=${limit}&format=json&origin=*`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // data format: [query, [titles], [descriptions], [urls]]
        const results = [];
        for (let i = 0; i < data[1].length; i++) {
            results.push({
                id: `wiki_${data[1][i].replace(/\s+/g, '_')}`,
                type: 'wikipedia',
                title: data[1][i],
                preview: data[2][i] || 'No description available',
                url: data[3][i],
                date: new Date().toISOString(),
                icon: '🌐',
                source: 'Wikipedia'
            });
        }
        return results;
    } catch (error) {
        console.error('Wikipedia search error:', error);
        return [];
    }
}

// Nominatim (OpenStreetMap) API for location search
async function searchNominatim(query, limit = 5) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}` +
            `&format=json&limit=${limit}` +
            `&addressdetails=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'OmniHub/1.0'
            }
        });
        const data = await response.json();
        
        return data.map(place => ({
            id: `place_${place.place_id}`,
            type: 'location',
            title: place.display_name.split(',')[0],
            preview: place.display_name,
            coords: `${parseFloat(place.lat).toFixed(4)}, ${parseFloat(place.lon).toFixed(4)}`,
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon),
            category: place.type,
            date: new Date().toISOString(),
            icon: '📍',
            source: 'OpenStreetMap'
        }));
    } catch (error) {
        console.error('Nominatim search error:', error);
        return [];
    }
}

// Combined external search
async function searchExternalData(query) {
    if (!SearchState.includeExternalData || !query.trim()) {
        return [];
    }
    
    try {
        const [wikiResults, locationResults] = await Promise.all([
            searchWikipedia(query, 3),
            searchNominatim(query, 3)
        ]);
        
        return [...wikiResults, ...locationResults];
    } catch (error) {
        console.error('External search error:', error);
        return [];
    }
}

// ============================================
// GET DATA FROM ALL MODULES
// ============================================
function getNotesData() {
    const dataStore = getDataStore();
    if (!dataStore) {
        console.log('📦 DataStore not available, using localStorage fallback');
        // Fallback to direct localStorage access for notes
        return [];
    }
    
    const notesData = dataStore.getModuleData('notes');
    return (notesData?.items || []).map(note => ({
        id: note.id,
        type: 'note',
        title: note.title,
        content: note.content,
        preview: note.content?.substring(0, 150) || '',
        tags: note.tags || [],
        date: note.modified || note.created,
        icon: '📝',
        source: 'Notes'
    }));
}

function getGlobePinsData() {
    try {
        const globeState = JSON.parse(localStorage.getItem('omnihub_globe_state') || '{}');
        const pins = globeState.pins || [];
        
        return pins.map(pin => ({
            id: pin.id || `globe_${pin.lat}_${pin.lng}`,
            type: 'globe',
            title: pin.name,
            preview: `Globe location at ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`,
            coords: `${pin.lat}, ${pin.lng}`,
            lat: pin.lat,
            lng: pin.lng,
            date: pin.timestamp,
            icon: '🌍',
            source: 'Globe'
        }));
    } catch (error) {
        console.error('Error loading globe pins:', error);
        return [];
    }
}

function getMapPinsData() {
    // Map pins from localStorage
    const pins = JSON.parse(localStorage.getItem('omnihub_map_pins') || '[]');
    return pins.map(pin => ({
        id: pin.id,
        type: 'map',
        title: pin.name,
        preview: pin.description || `${pin.lat.toFixed(4)}, ${pin.lon.toFixed(4)}`,
        coords: `${pin.lat}, ${pin.lon}`,
        date: pin.createdAt,
        icon: '🗺️'
    }));
}

function getLibraryData() {
    // Library books from localStorage
    const library = JSON.parse(localStorage.getItem('omnihub_library') || '[]');
    const favorites = JSON.parse(localStorage.getItem('omnihub_favorites') || '[]');
    
    // Combine and dedupe
    const allBooks = [...library];
    favorites.forEach(fav => {
        if (!allBooks.find(b => b.identifier === fav.identifier)) {
            allBooks.push(fav);
        }
    });
    
    return allBooks.map(book => ({
        id: book.identifier,
        type: 'library',
        title: book.title || 'Untitled',
        preview: `by ${book.creator || book.author || 'Unknown Author'}`,
        author: book.creator || book.author,
        year: book.year,
        icon: '📚'
    }));
}

function getDashboardEvents() {
    const events = JSON.parse(localStorage.getItem('omnihub_events') || '[]');
    return events.map(event => ({
        id: `event_${event.date}_${event.title}`,
        type: 'event',
        title: event.title,
        preview: `${event.time} on ${event.date}`,
        date: event.date,
        icon: '📅',
        source: 'Dashboard'
    }));
}

function getSnackScoutData() {
    // Get cart items from SnackScout
    const cartData = JSON.parse(localStorage.getItem('snackScout_cart') || '[]');
    return cartData.map(item => ({
        id: item.id || `snack_${item.name}`,
        type: 'snackscout',
        title: item.name,
        preview: `${item.quantity} • ${item.category} • $${item.price.toFixed(2)} at ${item.store}`,
        category: item.category,
        store: item.store,
        price: item.price,
        calories: item.calories,
        tags: item.tags || [],
        date: item.addedAt ? new Date(item.addedAt).toISOString() : null,
        icon: '🍿',
        source: 'SnackScout'
    }));
}

function getFactLensData() {
    // Get researched topics from FactLens localStorage
    const factLensHistory = JSON.parse(localStorage.getItem('omnihub_factlens_history') || '[]');
    return factLensHistory.map(topic => ({
        id: `factlens_${topic.title || topic.query}`,
        type: 'factlens',
        title: topic.title || topic.query,
        preview: topic.definition || topic.summary || 'Research topic',
        content: topic.content || '',
        tags: topic.tags || ['research', 'factlens'],
        date: topic.timestamp || topic.searchedAt,
        icon: '🔬',
        source: 'FactLens',
        url: topic.url
    }));
}

function getTrackingData() {
    // Get tracking points from Tracking module
    const trackingPoints = JSON.parse(localStorage.getItem('omnihub_tracking_data') || '[]');
    return trackingPoints.map(point => ({
        id: point.id || `track_${point.timestamp}`,
        type: 'tracking',
        title: `${point.source || 'Location'} Tracking Point`,
        preview: `Tracked at ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`,
        coords: `${point.lat}, ${point.lon}`,
        lat: point.lat,
        lon: point.lon,
        source: point.source || 'Tracking Module',
        date: point.timestamp,
        icon: '📍'
    }));
}

function getThemeData() {
    // Get theme settings and presets from Theme module
    const themeSettings = JSON.parse(localStorage.getItem('omnihub_theme_settings') || '{}');
    const results = [];
    
    // Index the current theme preset if active
    if (themeSettings.preset) {
        results.push({
            id: `theme_preset_${themeSettings.preset}`,
            type: 'theme',
            title: `${themeSettings.preset.charAt(0).toUpperCase() + themeSettings.preset.slice(1)} Theme Preset`,
            preview: getPresetDescription(themeSettings.preset),
            tags: ['theme', 'preset', themeSettings.preset],
            date: new Date().toISOString(),
            icon: '🎨',
            source: 'Theme'
        });
    }
    
    // Index current gradient/background
    if (themeSettings.gradient) {
        results.push({
            id: `theme_gradient_${themeSettings.gradient}`,
            type: 'theme',
            title: `${themeSettings.gradient.charAt(0).toUpperCase() + themeSettings.gradient.slice(1)} Gradient`,
            preview: `Background gradient: ${themeSettings.gradient}`,
            tags: ['theme', 'background', 'gradient'],
            date: new Date().toISOString(),
            icon: '🖼️',
            source: 'Theme'
        });
    }
    
    // Index scenery settings
    if (themeSettings.scenery && themeSettings.scenery !== 'none') {
        results.push({
            id: `theme_scenery_${themeSettings.scenery}`,
            type: 'theme',
            title: `${themeSettings.scenery.charAt(0).toUpperCase() + themeSettings.scenery.slice(1)} Scenery`,
            preview: `Ambient scenery: ${themeSettings.scenery}`,
            tags: ['theme', 'scenery', 'animation'],
            date: new Date().toISOString(),
            icon: '🌌',
            source: 'Theme'
        });
    }
    
    // Index video scenery
    if (themeSettings.videoScenery && themeSettings.videoScenery !== 'none') {
        results.push({
            id: `theme_video_${themeSettings.videoScenery}`,
            type: 'theme',
            title: `${themeSettings.videoScenery.charAt(0).toUpperCase() + themeSettings.videoScenery.slice(1)} FPV Video`,
            preview: `FPV drone footage: ${themeSettings.videoScenery}`,
            tags: ['theme', 'video', 'scenery'],
            date: new Date().toISOString(),
            icon: '🎬',
            source: 'Theme'
        });
    }
    
    return results;
}

function getPresetDescription(preset) {
    const descriptions = {
        professional: 'Clean, minimal, business-ready theme',
        creative: 'Vibrant colors with modern feel',
        zen: 'Calm, soft, minimal distraction',
        hacker: 'Dark terminal aesthetic'
    };
    return descriptions[preset] || 'Custom theme preset';
}

// ============================================
// INTELLIGENCE LAYER - RELATIONSHIP DETECTION
// ============================================

/**
 * Enhanced semantic similarity calculation
 */
function calculateSemanticSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    // Jaccard similarity
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    if (union.size === 0) return 0;
    
    const jaccardScore = intersection.size / union.size;
    
    // Cosine similarity approximation (term frequency)
    const allWords = [...union];
    const vec1 = allWords.map(w => words1.has(w) ? 1 : 0);
    const vec2 = allWords.map(w => words2.has(w) ? 1 : 0);
    
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    const cosineScore = mag1 * mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
    
    // Weighted average
    return jaccardScore * 0.4 + cosineScore * 0.6;
}

/**
 * Extract named entities (locations, dates, people, concepts)
 */
function extractAdvancedEntities(text) {
    const entities = {
        coordinates: [],
        locations: [],
        dates: [],
        people: [],
        concepts: [],
        topics: []
    };
    
    if (!text) return entities;
    
    // Extract coordinates (lat, lon patterns)
    const coordPattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g;
    let match;
    while ((match = coordPattern.exec(text)) !== null) {
        entities.coordinates.push({
            lat: parseFloat(match[1]),
            lon: parseFloat(match[2])
        });
    }
    
    // Extract dates (various formats)
    const datePatterns = [
        /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
        /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi
    ];
    
    datePatterns.forEach(pattern => {
        while ((match = pattern.exec(text)) !== null) {
            entities.dates.push(match[0]);
        }
    });
    
    // Extract potential location names (capitalized words/phrases)
    const locationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g;
    while ((match = locationPattern.exec(text)) !== null) {
        const location = match[1];
        // Filter out common non-locations
        if (!['The', 'This', 'That', 'These', 'Those', 'There', 'Here'].includes(location)) {
            entities.locations.push(location);
        }
    }
    
    // Extract potential people names (Title Case Name patterns)
    const personPattern = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g;
    while ((match = personPattern.exec(text)) !== null) {
        entities.people.push(match[1]);
    }
    
    // Extract key concepts (frequently occurring meaningful words)
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    entities.concepts = Object.entries(wordFreq)
        .filter(([word, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    
    return entities;
}

/**
 * Detect relationships between different module items with enhanced intelligence
 */
function detectRelationships(allData) {
    const relationships = {
        noteToPin: [],      // Notes mentioning locations → Pins
        noteTopic: [],      // Notes about same topics (semantic)
        sameTags: [],       // Items with matching tags
        proximity: [],      // Nearby locations
        crossModule: [],    // Generic cross-module connections
        semantic: []        // Semantic similarity across all items
    };
    
    const notes = allData.filter(item => item.type === 'note');
    const pins = allData.filter(item => item.type === 'globe' || item.type === 'map');
    const topics = allData.filter(item => item.type === 'factlens');
    
    // 1. Detect Note → Pin relationships (location mentions)
    notes.forEach(note => {
        const noteContent = `${note.title} ${note.content || ''}`.toLowerCase();
        const noteEntities = extractAdvancedEntities(noteContent);
        
        pins.forEach(pin => {
            const pinName = pin.title.toLowerCase();
            let strength = 0;
            
            // Check if note mentions pin name
            if (noteContent.includes(pinName)) {
                strength += 0.5;
            }
            
            // Check if note contains nearby coordinates
            noteEntities.coordinates.forEach(coord => {
                if (pin.lat && pin.lng) {
                    const distance = calculateDistance(coord.lat, coord.lon, pin.lat, pin.lng);
                    if (distance < 10) { // Within 10km
                        strength += 0.3;
                    }
                }
            });
            
            // Check if note mentions location names near pin
            noteEntities.locations.forEach(location => {
                if (pinName.includes(location.toLowerCase()) || location.toLowerCase().includes(pinName)) {
                    strength += 0.2;
                }
            });
            
            if (strength > 0) {
                relationships.noteToPin.push({
                    from: note.id,
                    to: pin.id,
                    type: 'mention',
                    strength: Math.min(strength, 1.0)
                });
            }
        });
    });
    
    // 2. Detect shared topics between Notes and FactLens (ENHANCED with semantic similarity)
    notes.forEach(note => {
        topics.forEach(topic => {
            const noteText = `${note.title} ${note.content || ''}`.toLowerCase();
            const topicText = `${topic.title} ${topic.preview}`.toLowerCase();
            
            // Use semantic similarity instead of word overlap
            const similarity = calculateSemanticSimilarity(noteText, topicText);
            
            if (similarity >= 0.15) { // Threshold for relatedness
                relationships.noteTopic.push({
                    from: note.id,
                    to: topic.id,
                    type: 'topic',
                    strength: similarity
                });
            }
        });
    });
    
    // 3. Detect items with same tags (WEIGHTED by tag importance)
    allData.forEach((item1, i) => {
        if (!item1.tags || item1.tags.length === 0) return;
        
        allData.slice(i + 1).forEach(item2 => {
            if (!item2.tags || item2.tags.length === 0) return;
            
            const sharedTags = item1.tags.filter(tag => item2.tags.includes(tag));
            if (sharedTags.length > 0) {
                // Weight by tag uniqueness (rare tags = stronger connection)
                const allTags = allData.flatMap(item => item.tags || []);
                const tagWeights = sharedTags.map(tag => {
                    const frequency = allTags.filter(t => t === tag).length;
                    return 1 / frequency; // Rare tags have higher weight
                });
                
                const avgWeight = tagWeights.reduce((sum, w) => sum + w, 0) / tagWeights.length;
                
                relationships.sameTags.push({
                    from: item1.id,
                    to: item2.id,
                    type: 'tags',
                    sharedTags: sharedTags,
                    strength: Math.min(avgWeight * sharedTags.length, 1.0)
                });
            }
        });
    });
    
    // 4. Detect proximity between locations (ENHANCED with clustering)
    pins.forEach((pin1, i) => {
        if (!pin1.lat || !pin1.lng) return;
        
        pins.slice(i + 1).forEach(pin2 => {
            if (!pin2.lat || !pin2.lng) return;
            
            const distance = calculateDistance(pin1.lat, pin1.lng, pin2.lat, pin2.lng);
            
            // Multiple distance thresholds
            let strength = 0;
            if (distance < 1) strength = 1.0;       // < 1km: very close
            else if (distance < 5) strength = 0.8;  // < 5km: close
            else if (distance < 20) strength = 0.5; // < 20km: nearby
            else if (distance < 50) strength = 0.3; // < 50km: same area
            
            if (strength > 0) {
                relationships.proximity.push({
                    from: pin1.id,
                    to: pin2.id,
                    type: 'proximity',
                    distance: distance,
                    strength: strength
                });
            }
        });
    });
    
    // 5. Semantic relationships across ALL items (NEW)
    allData.forEach((item1, i) => {
        const text1 = `${item1.title} ${item1.preview || item1.content || ''}`;
        
        allData.slice(i + 1).forEach(item2 => {
            // Skip if already connected via other means
            const alreadyConnected = [
                ...relationships.noteToPin,
                ...relationships.noteTopic,
                ...relationships.sameTags,
                ...relationships.proximity
            ].some(rel => 
                (rel.from === item1.id && rel.to === item2.id) ||
                (rel.from === item2.id && rel.to === item1.id)
            );
            
            if (alreadyConnected) return;
            
            const text2 = `${item2.title} ${item2.preview || item2.content || ''}`;
            const similarity = calculateSemanticSimilarity(text1, text2);
            
            if (similarity >= 0.2) { // Higher threshold for general semantic similarity
                relationships.semantic.push({
                    from: item1.id,
                    to: item2.id,
                    type: 'semantic',
                    strength: similarity
                });
            }
        });
    });
    
    console.log(`🧠 Intelligence layer:`, {
        noteToPin: relationships.noteToPin.length,
        noteTopic: relationships.noteTopic.length,
        sameTags: relationships.sameTags.length,
        proximity: relationships.proximity.length,
        semantic: relationships.semantic.length
    });
    
    return relationships;
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Find related items for a given result with enhanced scoring
 */
function findRelatedItems(result, allData, relationships) {
    const related = [];
    const maxRelated = 8; // Increased from 5
    
    // Find all relationships involving this item
    const allRelations = [
        ...relationships.noteToPin,
        ...relationships.noteTopic,
        ...relationships.sameTags,
        ...relationships.proximity,
        ...relationships.crossModule,
        ...relationships.semantic
    ];
    
    const itemRelations = allRelations.filter(rel => 
        rel.from === result.id || rel.to === result.id
    );
    
    // Get the related items
    itemRelations.forEach(rel => {
        const relatedId = rel.from === result.id ? rel.to : rel.from;
        const relatedItem = allData.find(item => item.id === relatedId);
        
        if (relatedItem) {
            related.push({
                item: relatedItem,
                relationship: rel.type,
                strength: rel.strength,
                details: rel.sharedTags ? `Shared tags: ${rel.sharedTags.join(', ')}` : 
                         rel.distance ? `${rel.distance.toFixed(1)} km away` : 
                         rel.type === 'semantic' ? `${Math.round(rel.strength * 100)}% similar` :
                         rel.type
            });
        }
    });
    
    // Sort by strength and return top results
    return related
        .sort((a, b) => b.strength - a.strength)
        .slice(0, maxRelated);
}

/**
 * Calculate cross-reference count (how many modules reference this entity)
 */
function calculateCrossReferences(result, allData) {
    const searchTerm = result.title.toLowerCase();
    const modules = new Set();
    let referenceCount = 0;
    
    allData.forEach(item => {
        const itemText = `${item.title} ${item.preview || item.content || ''}`.toLowerCase();
        if (itemText.includes(searchTerm) && item.id !== result.id) {
            modules.add(item.source || item.type);
            referenceCount++;
        }
    });
    
    return {
        count: referenceCount,
        modules: Array.from(modules),
        uniqueModules: modules.size
    };
}

// ============================================
// SEARCH FUNCTION
// ============================================
async function performSearch(query) {
    const normalizedQuery = query.trim().toLowerCase();
    
    if (!normalizedQuery && SearchState.selectedTags.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Show loading state
    SearchState.isLoading = true;
    showLoadingState();
    
    console.log('🔍 Searching for:', normalizedQuery);
    
    // Gather all searchable data
    let allData = [];
    
    // Local module data
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'notes') {
        allData = [...allData, ...getNotesData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'maps') {
        allData = [...allData, ...getMapPinsData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'globe') {
        allData = [...allData, ...getGlobePinsData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'library') {
        allData = [...allData, ...getLibraryData()];
    }
    
    // Search additional modules
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'dashboard') {
        allData = [...allData, ...getDashboardEvents()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'snackscout') {
        allData = [...allData, ...getSnackScoutData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'factlens') {
        allData = [...allData, ...getFactLensData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'tracking') {
        allData = [...allData, ...getTrackingData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'theme') {
        allData = [...allData, ...getThemeData()];
    }
    
    console.log(`📊 Total local items: ${allData.length}`);
    
    // Build/update search index if needed
    if (SearchState.searchIndex.needsRebuild()) {
        console.log('🔄 Rebuilding search index...');
        SearchState.searchIndex.buildIndex(allData);
    }
    
    // Filter by query using index for better performance
    let results = allData;
    
    if (normalizedQuery) {
        // Use search index for fast lookup
        results = SearchState.searchIndex.search(normalizedQuery, allData);
        
        // Fallback to full-text search if index returns nothing
        if (results.length === 0) {
            results = allData.filter(item => {
                const searchableText = [
                    item.title,
                    item.preview,
                    item.content,
                    item.author,
                    ...(item.tags || [])
                ].filter(Boolean).join(' ').toLowerCase();
                
                return searchableText.includes(normalizedQuery);
            });
        }
    }
    
    // Filter by selected tags (for notes)
    if (SearchState.selectedTags.length > 0) {
        results = results.filter(item => {
            if (!item.tags) return false;
            return SearchState.selectedTags.some(tag => item.tags.includes(tag));
        });
    }
    
    // Add external data if enabled and query exists
    if (normalizedQuery && SearchState.includeExternalData && SearchState.activeFilter === 'all') {
        try {
            const externalResults = await searchExternalData(normalizedQuery);
            results = [...results, ...externalResults];
            console.log(`🌐 Added ${externalResults.length} external results`);
        } catch (error) {
            console.error('External search failed:', error);
        }
    }
    
    // ====== INTELLIGENCE LAYER: Detect relationships ======
    console.log('🧠 Running intelligence layer...');
    const relationships = detectRelationships(allData);
    
    // Add relationship info to each result
    results = results.map(result => {
        const related = findRelatedItems(result, allData, relationships);
        const crossRefs = calculateCrossReferences(result, allData);
        const entities = extractAdvancedEntities(`${result.title} ${result.preview || result.content || ''}`);
        
        return {
            ...result,
            relatedItems: related,
            crossReferences: crossRefs,
            entities: entities
        };
    });
    
    // Sort results based on user preference
    results = sortResults(results, SearchState.userPreference);
    
    SearchState.results = results;
    SearchState.isLoading = false;
    
    // Add to search history
    if (normalizedQuery && !SearchState.searchHistory.includes(normalizedQuery)) {
        SearchState.searchHistory = [normalizedQuery, ...SearchState.searchHistory.slice(0, 9)];
        localStorage.setItem('omnihub_search_history', JSON.stringify(SearchState.searchHistory));
    }
    
    console.log(`✅ Search complete: ${results.length} results`);
    renderResults(results);
}

// ============================================
// SORTING FUNCTIONS
// ============================================
function sortResults(results, preference) {
    switch (preference) {
        case 'date':
            return results.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA; // Most recent first
            });
        
        case 'alphabetical':
            return results.sort((a, b) => {
                return (a.title || '').localeCompare(b.title || '');
            });
        
        case 'relevance':
        default:
            // Keep original order (already sorted by relevance from filters)
            // But prioritize local results over external
            return results.sort((a, b) => {
                const aLocal = !a.source || ['Notes', 'Maps', 'Globe', 'Library'].includes(a.source);
                const bLocal = !b.source || ['Notes', 'Maps', 'Globe', 'Library'].includes(b.source);
                
                if (aLocal && !bLocal) return -1;
                if (!aLocal && bLocal) return 1;
                return 0;
            });
    }
}

function showLoadingState() {
    const container = document.getElementById('results-container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⏳</div>
                <h3 class="empty-title">Searching...</h3>
                <p class="empty-description">Looking through your data and the web</p>
            </div>
        `;
    }
}

// ============================================
// RENDERING
// ============================================
function renderResults(results) {
    const container = document.getElementById('results-container');
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No Results Found</h3>
                <p class="empty-description">Try different keywords or adjust your filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="results-header">
            <h3 class="results-count">${results.length} Result${results.length !== 1 ? 's' : ''} Found</h3>
        </div>
        <div class="results-grid">
            ${results.map(result => renderResultCard(result)).join('')}
        </div>
    `;
}

function renderResultCard(result) {
    const tagsHtml = result.tags?.length > 0 
        ? `<div class="result-tags">${result.tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}</div>`
        : '';
    
    const dateHtml = result.date 
        ? `<div class="result-meta">📅 ${formatDate(result.date)}</div>`
        : '';
    
    const sourceHtml = result.source 
        ? `<div class="result-meta">🔗 ${result.source}</div>`
        : '';
    
    const coordsHtml = result.coords 
        ? `<div class="result-meta">📍 ${result.coords}</div>`
        : '';
    
    // Intelligence Layer: Cross-references badge
    const crossRefsHtml = result.crossReferences && result.crossReferences.count > 0
        ? `<div class="result-meta cross-refs" title="Referenced in ${result.crossReferences.modules.join(', ')}">
             🔗 ${result.crossReferences.count} ${result.crossReferences.count === 1 ? 'connection' : 'connections'}
           </div>`
        : '';
    
    // Intelligence Layer: Related items preview
    const relatedHtml = result.relatedItems && result.relatedItems.length > 0
        ? `<div class="related-items-preview" onclick="event.stopPropagation(); window.showRelatedPanel(${escapeHtml(JSON.stringify(result))})">
             <span class="related-icon">🧩</span>
             <span class="related-count">${result.relatedItems.length} related</span>
           </div>`
        : '';
    
    // Special handling for external results
    const isExternal = result.type === 'wikipedia' || result.type === 'location';
    const clickHandler = isExternal 
        ? `onclick="handleExternalResultClick('${result.type}', '${escapeHtml(JSON.stringify(result))}')"`
        : `onclick="handleResultClick('${result.type}', '${escapeHtml(result.id)}', ${escapeHtml(JSON.stringify(result))})"`; 
    
    return `
        <div class="result-card" ${clickHandler}>
            <div class="result-header">
                <div class="result-icon">${result.icon}</div>
                <span class="type-badge">${result.type}</span>
            </div>
            <h4 class="result-title">${escapeHtml(result.title)}</h4>
            <p class="result-preview">${escapeHtml(result.preview)}</p>
            ${tagsHtml}
            <div class="result-meta-row">
                ${dateHtml}
                ${coordsHtml}
                ${sourceHtml}
                ${crossRefsHtml}
            </div>
            ${relatedHtml}
        </div>
    `;
}

function renderEmptyState() {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3 class="empty-title">Start Searching</h3>
            <p class="empty-description">Search across your notes, maps, and library to discover connections</p>
        </div>
    `;
}

function renderSearchHistory() {
    const container = document.getElementById('search-history');
    const itemsContainer = document.getElementById('history-items');
    
    if (SearchState.searchHistory.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    itemsContainer.innerHTML = SearchState.searchHistory.map(query => 
        `<button class="history-item" onclick="setSearchQuery('${escapeHtml(query)}')">${escapeHtml(query)}</button>`
    ).join('');
}

function renderTagFilters() {
    const container = document.getElementById('tags-container');
    
    // Get all unique tags from notes
    const notes = getNotesData();
    const allTags = [...new Set(notes.flatMap(n => n.tags || []))];
    
    if (allTags.length === 0) {
        container.innerHTML = '<span style="color: hsl(var(--search-text-muted));">No tags found</span>';
        return;
    }
    
    container.innerHTML = allTags.map(tag => 
        `<button class="tag-badge ${SearchState.selectedTags.includes(tag) ? 'active' : ''}" 
                 onclick="toggleTag('${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`
    ).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    } catch {
        return dateStr;
    }
}

// ============================================
// EVENT HANDLERS
// ============================================
function handleResultClick(type, id, resultData) {
    console.log(`Opening ${type} with id: ${id}`);
    
    // Parse resultData if it's a string
    let data = resultData;
    if (typeof resultData === 'string') {
        try {
            data = JSON.parse(resultData);
        } catch (e) {
            data = {};
        }
    }
    
    // Try to navigate via OmniHub API
    if (window.parent && window.parent.OmniHub) {
        try {
            const moduleMap = {
                'note': 'notes',
                'map': 'map',
                'globe': 'globe',
                'library': 'library',
                'event': 'dashboard',
                'snackscout': 'snackScout',
                'factlens': 'factLens',
                'tracking': 'tracking',
                'theme': 'theme'
            };
            
            const targetModule = moduleMap[type] || type;
            
            // Navigate to module
            window.parent.OmniHub.navigateToModule(targetModule);
            
            // Store the item to highlight/show in the target module
            if (id) {
                localStorage.setItem('omnihub_highlight_item', JSON.stringify({
                    module: targetModule,
                    itemId: id,
                    data: data,
                    timestamp: Date.now()
                }));
            }
            
            console.log(`✅ Navigating to ${targetModule} with item ${id}`);
        } catch (e) {
            console.warn('Navigation failed:', e);
        }
    }
    // Fallback to postMessage
    else if (window.parent && window.parent !== window) {
        try {
            const moduleMap = {
                'note': 'notes',
                'map': 'map',
                'globe': 'globe',
                'library': 'library',
                'event': 'dashboard',
                'snackscout': 'snackScout',
                'factlens': 'factLens',
                'tracking': 'tracking',
                'theme': 'theme'
            };
            
            const targetModule = moduleMap[type] || type;
            window.parent.postMessage({ 
                type: 'navigate', 
                module: targetModule,
                itemId: id,
                data: data
            }, '*');
        } catch (e) {
            console.warn('Could not navigate to parent:', e);
        }
    }
}

async function fetchWikipediaContent(title) {
    try {
        // Fetch formatted HTML content with sections
        const url = `https://en.wikipedia.org/w/api.php?` +
            `action=parse&format=json&page=${encodeURIComponent(title)}` +
            `&prop=text|sections&disabletoc=true&origin=*`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('Wikipedia API error:', data.error);
            return null;
        }
        
        // Parse sections for navigation
        const sections = (data.parse?.sections || []).map(section => ({
            index: section.index,
            level: parseInt(section.level),
            line: section.line,
            anchor: section.anchor
        }));
        
        // Get HTML content
        let html = data.parse?.text?.['*'] || '';
        
        // Clean up Wikipedia HTML
        html = cleanWikipediaHTML(html);
        
        return {
            title: data.parse?.title || title,
            content: html,
            sections: sections,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
        };
    } catch (error) {
        console.error('Failed to fetch Wikipedia content:', error);
        return null;
    }
}

function cleanWikipediaHTML(html) {
    // Create temporary container
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove edit links and unwanted elements
    temp.querySelectorAll('.mw-editsection, .reference, .noprint, .navbox, .vertical-navbox, .ambox, script, style').forEach(el => el.remove());
    
    // Convert Wikipedia links to be non-functional (they won't work in iframe)
    temp.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/wiki/')) {
            const title = decodeURIComponent(href.replace('/wiki/', '').replace(/_/g, ' '));
            link.setAttribute('data-wiki-title', title);
            link.setAttribute('href', '#');
            link.style.color = '#667eea';
            link.style.cursor = 'pointer';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Optionally load this Wikipedia page
                if (confirm(`Load Wikipedia article: ${title}?`)) {
                    showWikipediaViewer({ title: title, type: 'wikipedia' });
                }
            });
        } else if (href && href.startsWith('#')) {
            // Internal anchor - keep functional
        } else {
            // External links - open in new tab
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    // Style images
    temp.querySelectorAll('img').forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '1rem 0';
    });
    
    // Add IDs to sections for navigation
    temp.querySelectorAll('h2, h3, h4').forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `section-${index}`;
        }
        heading.style.marginTop = '2rem';
        heading.style.marginBottom = '1rem';
        heading.style.color = 'hsl(224, 15%, 95%)';
    });
    
    return temp.innerHTML;
}

function showWikipediaViewer(result) {
    const modal = document.getElementById('wikipedia-viewer-modal');
    const modalTitle = document.getElementById('wiki-modal-title');
    const modalContent = document.getElementById('wiki-modal-content');
    const loadingIndicator = document.getElementById('wiki-loading');
    const sectionsNav = document.getElementById('wiki-sections-nav');
    
    if (!modal) {
        console.error('Wikipedia viewer modal not found');
        return;
    }
    
    // Show modal and loading state
    modal.classList.remove('hidden');
    modalTitle.textContent = result.title;
    modalContent.style.display = 'none';
    if (sectionsNav) sectionsNav.style.display = 'none';
    loadingIndicator.style.display = 'flex';
    
    // Fetch and display Wikipedia content
    fetchWikipediaContent(result.title).then(data => {
        loadingIndicator.style.display = 'none';
        
        if (data) {
            // Display formatted HTML content
            modalContent.style.display = 'block';
            modalContent.innerHTML = data.content;
            
            // Store metadata
            modalContent.dataset.wikiUrl = data.url || result.url;
            modalContent.dataset.wikiTitle = data.title;
            modalContent.dataset.sections = JSON.stringify(data.sections || []);
            
            // Render sections navigation if available
            if (data.sections && data.sections.length > 0 && sectionsNav) {
                renderWikipediaSections(data.sections, sectionsNav);
                sectionsNav.style.display = 'block';
            }
            
            // Add export button per section
            addSectionExportButtons(modalContent);
        } else {
            modalContent.style.display = 'block';
            modalContent.innerHTML = '<p style="color: #ef4444; padding: 2rem; text-align: center;">Failed to load Wikipedia content. Please try again.</p>';
        }
    });
}

function renderWikipediaSections(sections, container) {
    if (!container) return;
    
    const html = sections
        .filter(section => section.level <= 2) // Only show main sections
        .map(section => `
            <a href="#section-${section.index}" class="wiki-section-link" data-section="${section.index}">
                ${'&nbsp;'.repeat((section.level - 1) * 4)}${section.line}
            </a>
        `)
        .join('');
    
    container.innerHTML = `
        <div class="wiki-sections-title">📑 Sections</div>
        ${html}
    `;
    
    // Add click handlers for smooth scrolling
    container.querySelectorAll('.wiki-section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = link.dataset.section;
            const targetHeading = document.querySelector(`#wiki-modal-content h2:nth-of-type(${sectionIndex}), #wiki-modal-content h3:nth-of-type(${sectionIndex})`);
            if (targetHeading) {
                targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function addSectionExportButtons(container) {
    // Add mini export buttons next to each section heading
    container.querySelectorAll('h2, h3').forEach((heading, index) => {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'section-export-btn';
        exportBtn.innerHTML = '📝';
        exportBtn.title = 'Export this section to Notes';
        exportBtn.onclick = (e) => {
            e.stopPropagation();
            exportSectionToNotes(heading);
        };
        heading.style.position = 'relative';
        heading.appendChild(exportBtn);
    });
}

function closeWikipediaViewer() {
    const modal = document.getElementById('wikipedia-viewer-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showRelatedPanel(result) {
    const panel = document.getElementById('related-items-panel');
    const title = document.getElementById('related-panel-title');
    const body = document.getElementById('related-panel-body');
    
    if (!panel || !title || !body) {
        console.error('Related items panel not found');
        return;
    }
    
    // Set title
    title.textContent = `🧩 Related to: ${result.title}`;
    
    // Render related items
    if (!result.relatedItems || result.relatedItems.length === 0) {
        body.innerHTML = `
            <div class="no-related-items">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <p style="font-size: 1rem; font-weight: 500;">No related items found</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">This item doesn't have any connections to other modules yet.</p>
            </div>
        `;
    } else {
        body.innerHTML = result.relatedItems.map(related => `
            <div class="related-item-card" onclick="handleResultClick('${related.item.type}', '${escapeHtml(related.item.id)}', ${escapeHtml(JSON.stringify(related.item))})">
                <div class="related-item-header">
                    <span class="related-item-icon">${related.item.icon}</span>
                    <span class="related-item-type">${related.item.type}</span>
                </div>
                <h4 class="related-item-title">${escapeHtml(related.item.title)}</h4>
                <p class="related-item-preview">${escapeHtml(related.item.preview || '')}</p>
                <div class="related-item-relationship">
                    <span class="relationship-icon">${getRelationshipIcon(related.relationship)}</span>
                    <span>${getRelationshipLabel(related.relationship)}</span>
                    ${related.details ? `<span style="margin-left: 0.25rem; opacity: 0.8;">• ${related.details}</span>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    // Show panel
    panel.classList.remove('hidden');
}

function closeRelatedPanel() {
    const panel = document.getElementById('related-items-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

function getRelationshipIcon(type) {
    const icons = {
        'mention': '📝',
        'topic': '🔬',
        'tags': '🏷️',
        'proximity': '📍',
        'crossModule': '🔗'
    };
    return icons[type] || '🔗';
}

function getRelationshipLabel(type) {
    const labels = {
        'mention': 'Mentioned in',
        'topic': 'Related topic',
        'tags': 'Shared tags',
        'proximity': 'Nearby location',
        'crossModule': 'Cross-module'
    };
    return labels[type] || 'Related';
}

function exportSectionToNotes(headingElement) {
    // Get the section content (heading + all content until next heading)
    const sectionContent = [];
    let current = headingElement.nextElementSibling;
    
    while (current && !['H2', 'H3', 'H4'].includes(current.tagName)) {
        sectionContent.push(current.outerHTML);
        current = current.nextElementSibling;
    }
    
    const modalTitle = document.getElementById('wiki-modal-title')?.textContent || 'Wikipedia Article';
    const wikiUrl = document.getElementById('wiki-modal-content')?.dataset.wikiUrl || '';
    const sectionTitle = headingElement.textContent.replace('📝', '').trim();
    
    const htmlContent = `<h2>${sectionTitle}</h2>\n${sectionContent.join('\n')}`;
    
    // Convert HTML to markdown-style text
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    const textContent = temp.textContent || temp.innerText;
    
    const noteContent = `# ${modalTitle}\n## ${sectionTitle}\n\n${textContent}\n\n---\n*Source: [Wikipedia](${wikiUrl})*\n*Section: ${sectionTitle}*\n*Exported: ${new Date().toLocaleString()}*`;
    
    exportToNotes(`Wikipedia: ${modalTitle} - ${sectionTitle}`, noteContent, ['wikipedia', 'imported', 'section']);
}

async function exportSelectedTextToNotes() {
    const modalContent = document.getElementById('wiki-modal-content');
    const modalTitle = document.getElementById('wiki-modal-title');
    
    if (!modalContent || !modalTitle) return;
    
    // Get selected text/HTML
    const selection = window.getSelection();
    let selectedContent = '';
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const temp = document.createElement('div');
        temp.appendChild(fragment);
        selectedContent = temp.textContent || temp.innerText;
    }
    
    // If no text selected, use all content
    if (!selectedContent.trim()) {
        selectedContent = modalContent.textContent || modalContent.innerText;
    }
    
    if (!selectedContent.trim()) {
        alert('No text available to export');
        return;
    }
    
    const wikiUrl = modalContent.dataset.wikiUrl || '';
    const wikiTitle = modalTitle.textContent;
    
    // Format the content for Notes with enhanced metadata
    const noteContent = `# ${wikiTitle}\n\n${selectedContent}\n\n---\n**Source:** [Wikipedia](${wikiUrl})\n**Exported:** ${new Date().toLocaleString()}\n**Type:** Research Article\n\n*Imported via OmniSearch*`;
    
    await exportToNotes(`Wikipedia: ${wikiTitle}`, noteContent, ['wikipedia', 'imported', 'research']);
}

async function exportToNotes(title, content, tags = []) {
    try {
        // Enhanced export with better metadata
        const exportData = {
            title: title,
            content: content,
            tags: tags,
            timestamp: Date.now(),
            source: 'OmniSearch',
            sourceType: 'wikipedia',
            exported: new Date().toISOString()
        };
        
        // Try to access Notes module via parent window
        if (window.parent && window.parent.notesModule) {
            const notesManager = window.parent.notesModule.manager || window.notesModule?.manager;
            
            if (notesManager) {
                const note = await notesManager.createNote(title);
                await notesManager.updateNote(note.id, {
                    content: content,
                    tags: tags
                });
                
                showExportSuccess('Exported to Notes successfully!');
                
                setTimeout(() => {
                    closeWikipediaViewer();
                }, 1500);
                
                console.log('✅ Exported to Notes:', note.id);
                return;
            }
        }
        
        // Fallback: Store in localStorage for Notes module to pick up
        localStorage.setItem('omnihub_pending_note_import', JSON.stringify(exportData));
        
        showExportSuccess('Queued for Notes import!');
        
        // Navigate to Notes module
        if (window.parent && window.parent.OmniHub) {
            setTimeout(() => {
                window.parent.OmniHub.navigateToModule('notes');
                closeWikipediaViewer();
            }, 1500);
        }
        
        console.log('✅ Queued for Notes import');
    } catch (error) {
        console.error('Failed to export to Notes:', error);
        alert('Failed to export to Notes. Please try again.');
    }
}

function showExportSuccess(message = 'Exported successfully!') {
    const successMsg = document.getElementById('wiki-export-success');
    if (successMsg) {
        successMsg.querySelector('span:last-child').textContent = message;
        successMsg.classList.remove('hidden');
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 2000);
    }
}

function handleExternalResultClick(type, resultDataStr) {
    let result;
    try {
        result = JSON.parse(resultDataStr);
    } catch (e) {
        console.error('Failed to parse result data:', e);
        return;
    }
    
    if (type === 'wikipedia') {
        // Show Wikipedia viewer instead of opening in new tab
        showWikipediaViewer(result);
    } else if (type === 'location') {
        // Navigate to globe/map and fly to location
        if (window.parent && window.parent.OmniHub) {
            try {
                // Store location data
                localStorage.setItem('omnihub_highlight_item', JSON.stringify({
                    module: 'globe',
                    itemId: `search_location_${result.id}`,
                    data: {
                        lat: result.lat,
                        lon: result.lon,
                        name: result.title,
                        description: result.preview
                    },
                    timestamp: Date.now()
                }));
                
                // Navigate to globe
                window.parent.OmniHub.navigateToModule('globe');
                
                console.log(`✅ Flying to location: ${result.title}`);
            } catch (e) {
                console.warn('Failed to navigate to location:', e);
            }
        }
    }
}

function setSearchQuery(query) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = query;
        performSearch(query);
    }
}

function toggleTag(tag) {
    if (SearchState.selectedTags.includes(tag)) {
        SearchState.selectedTags = SearchState.selectedTags.filter(t => t !== tag);
    } else {
        SearchState.selectedTags.push(tag);
    }
    
    renderTagFilters();
    
    const searchInput = document.getElementById('search-input');
    performSearch(searchInput?.value || '');
}

function setActiveFilter(filter) {
    SearchState.activeFilter = filter;
    
    // Update UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput?.value.trim() || SearchState.selectedTags.length > 0) {
        performSearch(searchInput.value);
    }
}

function setSortPreference(preference) {
    SearchState.userPreference = preference;
    localStorage.setItem('omnihub_search_preference', preference);
    
    // Update UI
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === preference);
    });
    
    // Re-sort and render current results
    if (SearchState.results.length > 0) {
        SearchState.results = sortResults(SearchState.results, preference);
        renderResults(SearchState.results);
    }
}

function toggleExternalSearch(enabled) {
    SearchState.includeExternalData = enabled;
    localStorage.setItem('omnihub_search_external', JSON.stringify(enabled));
    
    // Re-search if there's an active query
    const searchInput = document.getElementById('search-input');
    if (searchInput?.value.trim()) {
        performSearch(searchInput.value);
    }
}

// ============================================
// INITIALIZATION
// ============================================
function initSearchModule() {
    console.log('🔍 Initializing Search Module...');
    
    // Load user preferences
    const savedPreference = localStorage.getItem('omnihub_search_preference') || 'relevance';
    const savedExternal = JSON.parse(localStorage.getItem('omnihub_search_external') || 'true');
    SearchState.userPreference = savedPreference;
    SearchState.includeExternalData = savedExternal;
    
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    const filterToggle = document.getElementById('filter-toggle');
    const advancedFilters = document.getElementById('advanced-filters');
    
    // Search input events
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            clearBtn.style.display = value ? 'block' : 'none';
            
            // Debounced search
            clearTimeout(searchInput._debounceTimeout);
            searchInput._debounceTimeout = setTimeout(() => {
                performSearch(value);
            }, 300);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchInput._debounceTimeout);
                performSearch(searchInput.value);
            }
        });
        
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                renderSearchHistory();
            }
        });
    }
    
    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            SearchState.selectedTags = [];
            SearchState.results = [];
            renderTagFilters();
            renderEmptyState();
            renderSearchHistory();
        });
    }
    
    // Filter toggle
    if (filterToggle) {
        filterToggle.addEventListener('click', () => {
            advancedFilters.classList.toggle('show');
        });
    }
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveFilter(btn.dataset.filter);
        });
    });
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === savedPreference);
    });
    
    // External search toggle
    const externalToggle = document.getElementById('external-search-toggle');
    if (externalToggle) {
        externalToggle.checked = savedExternal;
    }
    
    // Initial render
    renderTagFilters();
    renderSearchHistory();
    renderEmptyState();
    
    console.log('✅ Search Module initialized');
    console.log(`📊 Preferences: Sort=${savedPreference}, External=${savedExternal}`);
}

// ============================================
// MODULE LIFECYCLE
// ============================================
window.searchModule = {
    onActivate: () => {
        console.log('🔍 Search module activated');
        renderTagFilters();
        renderSearchHistory();
    },
    
    onDeactivate: () => {
        console.log('🔍 Search module deactivated');
    },
    
    getState: () => ({
        activeFilter: SearchState.activeFilter,
        selectedTags: SearchState.selectedTags,
        lastQuery: document.getElementById('search-input')?.value || ''
    }),
    
    restoreState: (state) => {
        if (state) {
            SearchState.activeFilter = state.activeFilter || 'all';
            SearchState.selectedTags = state.selectedTags || [];
            
            const searchInput = document.getElementById('search-input');
            if (searchInput && state.lastQuery) {
                searchInput.value = state.lastQuery;
                performSearch(state.lastQuery);
            }
        }
    },
    
    // Public API for external calls
    search: performSearch,
    getResults: () => SearchState.results
};

// Make functions globally available for onclick handlers
window.handleResultClick = handleResultClick;
window.handleExternalResultClick = handleExternalResultClick;
window.setSearchQuery = setSearchQuery;
window.toggleTag = toggleTag;
window.setSortPreference = setSortPreference;
window.toggleExternalSearch = toggleExternalSearch;
window.showWikipediaViewer = showWikipediaViewer;
window.closeWikipediaViewer = closeWikipediaViewer;
window.exportSelectedTextToNotes = exportSelectedTextToNotes;
window.showRelatedPanel = showRelatedPanel;
window.closeRelatedPanel = closeRelatedPanel;
window.exportSectionToNotes = exportSectionToNotes;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchModule);
} else {
    initSearchModule();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSearchModule, performSearch };
}
