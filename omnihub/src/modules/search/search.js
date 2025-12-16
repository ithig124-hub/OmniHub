/**
 * OmniHub Search Module
 * Queries all modules via DataStore for unified search
 */

// ============================================
// SEARCH STATE
// ============================================
const SearchState = {
    activeFilter: 'all',
    selectedTags: [],
    searchHistory: JSON.parse(localStorage.getItem('omnihub_search_history') || '[]'),
    results: [],
    isLoading: false
};

// ============================================
// DATASTORE ACCESS
// ============================================
function getDataStore() {
    // Try to get DataStore from parent window (when in iframe) or global
    return window.parent?.OmniHubDataStore || window.OmniHubDataStore || null;
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
        icon: '📝'
    }));
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
        icon: '📅'
    }));
}

// ============================================
// SEARCH FUNCTION
// ============================================
function performSearch(query) {
    const normalizedQuery = query.trim().toLowerCase();
    
    if (!normalizedQuery && SearchState.selectedTags.length === 0) {
        renderEmptyState();
        return;
    }
    
    console.log('🔍 Searching for:', normalizedQuery);
    
    // Gather all searchable data
    let allData = [];
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'notes') {
        allData = [...allData, ...getNotesData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'maps') {
        allData = [...allData, ...getMapPinsData()];
    }
    
    if (SearchState.activeFilter === 'all' || SearchState.activeFilter === 'library') {
        allData = [...allData, ...getLibraryData()];
    }
    
    // Also search dashboard events
    if (SearchState.activeFilter === 'all') {
        allData = [...allData, ...getDashboardEvents()];
    }
    
    console.log(`📊 Total items to search: ${allData.length}`);
    
    // Filter by query
    let results = allData;
    
    if (normalizedQuery) {
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
    
    // Filter by selected tags (for notes)
    if (SearchState.selectedTags.length > 0) {
        results = results.filter(item => {
            if (!item.tags) return false;
            return SearchState.selectedTags.some(tag => item.tags.includes(tag));
        });
    }
    
    SearchState.results = results;
    
    // Add to search history
    if (normalizedQuery && !SearchState.searchHistory.includes(normalizedQuery)) {
        SearchState.searchHistory = [normalizedQuery, ...SearchState.searchHistory.slice(0, 9)];
        localStorage.setItem('omnihub_search_history', JSON.stringify(SearchState.searchHistory));
    }
    
    renderResults(results);
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
    
    return `
        <div class="result-card" onclick="handleResultClick('${result.type}', '${result.id}')">
            <div class="result-header">
                <div class="result-icon">${result.icon}</div>
                <span class="type-badge">${result.type}</span>
            </div>
            <h4 class="result-title">${escapeHtml(result.title)}</h4>
            <p class="result-preview">${escapeHtml(result.preview)}</p>
            ${tagsHtml}
            ${dateHtml}
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
function handleResultClick(type, id) {
    console.log(`Opening ${type} with id: ${id}`);
    
    // Try to navigate via parent window
    if (window.parent && window.parent !== window) {
        // Send message to parent to navigate
        try {
            const moduleMap = {
                'note': 'notes',
                'map': 'map',
                'library': 'library',
                'event': 'dashboard'
            };
            
            const targetModule = moduleMap[type] || type;
            window.parent.postMessage({ 
                type: 'navigate', 
                module: targetModule,
                itemId: id 
            }, '*');
        } catch (e) {
            console.warn('Could not navigate to parent:', e);
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

// ============================================
// INITIALIZATION
// ============================================
function initSearchModule() {
    console.log('🔍 Initializing Search Module...');
    
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
    
    // Initial render
    renderTagFilters();
    renderSearchHistory();
    renderEmptyState();
    
    console.log('✅ Search Module initialized');
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
window.setSearchQuery = setSearchQuery;
window.toggleTag = toggleTag;

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
