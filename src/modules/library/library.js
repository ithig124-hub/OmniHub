/**
 * Library Module - Digital Archive & PDF Management
 * Integrates with Internet Archive API for book discovery
 * Uses localStorage for persistent library data
 */

// ============================================
// CONFIGURATION
// ============================================
const LIBRARY_CONFIG = {
  INTERNET_ARCHIVE_API: 'https://archive.org/advancedsearch.php',
  STORAGE_KEYS: {
    MY_LIBRARY: 'omnihub_library',
    FAVORITES: 'omnihub_favorites',
    SEARCH_CACHE: 'omnihub_search_cache'
  },
  CACHE_DURATION: 3600000, // 1 hour in milliseconds
  DEBOUNCE_DELAY: 500
};

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
  currentTab: 'search',
  viewMode: 'grid',
  searchResults: [],
  myLibrary: [],
  favorites: [],
  isLoading: false,
  currentQuery: '',
  filterType: 'all',
  sortBy: 'relevance'
};

// ============================================
// STORAGE UTILITIES
// ============================================
const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  },

  append(key, item) {
    const existing = this.get(key) || [];
    const updated = [...existing, { ...item, addedAt: new Date().toISOString() }];
    this.set(key, updated);
    return updated;
  },

  remove(key, itemId) {
    const existing = this.get(key) || [];
    const updated = existing.filter(item => item.identifier !== itemId);
    this.set(key, updated);
    return updated;
  },

  exists(key, itemId) {
    const existing = this.get(key) || [];
    return existing.some(item => item.identifier === itemId);
  }
};

// ============================================
// INTERNET ARCHIVE API
// ============================================
const InternetArchiveAPI = {
  async search(query, options = {}) {
    try {
      const { mediatype = 'texts', rows = 50, page = 1 } = options;
      
      // Build search query
      const searchQuery = `(${query}) AND mediatype:(${mediatype}) AND format:(PDF)`;
      
      const params = new URLSearchParams({
        q: searchQuery,
        fl: 'identifier,title,creator,description,date,downloads,format,item_size,avg_rating',
        rows: rows,
        page: page,
        output: 'json',
        sort: options.sort || 'downloads desc'
      });

      const response = await fetch(`${LIBRARY_CONFIG.INTERNET_ARCHIVE_API}?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformResults(data.response.docs);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  transformResults(docs) {
    return docs.map(doc => ({
      identifier: doc.identifier,
      title: doc.title || 'Untitled',
      author: Array.isArray(doc.creator) ? doc.creator.join(', ') : doc.creator || 'Unknown Author',
      description: doc.description || 'No description available',
      year: doc.date ? new Date(doc.date).getFullYear() : 'N/A',
      downloads: doc.downloads || 0,
      rating: doc.avg_rating || 0,
      coverUrl: `https://archive.org/services/img/${doc.identifier}`,
      pdfUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}.pdf`,
      detailUrl: `https://archive.org/details/${doc.identifier}`,
      size: doc.item_size ? this.formatSize(doc.item_size) : 'N/A'
    }));
  },

  formatSize(bytes) {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1024 ? `${mb.toFixed(2)} MB` : `${(mb / 1024).toFixed(2)} GB`;
  }
};

// ============================================
// UI RENDERING
// ============================================
const UI = {
  renderBookCard(book, context = 'search') {
    const isInLibrary = Storage.exists(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY, book.identifier);
    const isFavorite = Storage.exists(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES, book.identifier);

    return `
      <div class="book-card" data-book-id="${book.identifier}">
        <div class="book-cover">
          <img src="${book.coverUrl}" alt="${book.title}" onerror="this.parentElement.innerHTML='📚'" />
        </div>
        <div class="book-content">
          <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
          <p class="book-author">${this.escapeHtml(book.author)}</p>
          <div class="book-meta">
            ${book.year !== 'N/A' ? `<span class="book-meta-item">📅 ${book.year}</span>` : ''}
            ${book.downloads ? `<span class="book-meta-item">⬇️ ${this.formatNumber(book.downloads)}</span>` : ''}
            ${book.size !== 'N/A' ? `<span class="book-meta-item">💾 ${book.size}</span>` : ''}
          </div>
          <div class="book-actions">
            <button class="book-btn book-btn-primary" onclick="window.LibraryModule.openBook('${book.identifier}', '${this.escapeHtml(book.title)}', '${book.pdfUrl}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Read
            </button>
            ${!isInLibrary ? `
              <button class="book-btn book-btn-secondary" onclick="window.LibraryModule.addToLibrary('${book.identifier}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                Save
              </button>
            ` : ''}
            <button class="book-btn book-btn-icon ${isFavorite ? 'active' : ''}" onclick="window.LibraryModule.toggleFavorite('${book.identifier}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderLoadingState() {
    return `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Searching Internet Archive...</p>
      </div>
    `;
  },

  renderEmptyState(tab) {
    const messages = {
      search: {
        icon: '🔍',
        title: 'Search for Books',
        description: 'Enter a title, author, or subject to discover books from the Internet Archive'
      },
      'my-library': {
        icon: '📚',
        title: 'Your Library is Empty',
        description: 'Search for books and save them to your personal library'
      },
      favorites: {
        icon: '⭐',
        title: 'No Favorites Yet',
        description: 'Mark books as favorites to quickly access them later'
      }
    };

    const message = messages[tab] || messages.search;

    return `
      <div class="empty-state">
        <div class="empty-state-icon">${message.icon}</div>
        <h3 class="empty-state-title">${message.title}</h3>
        <p class="empty-state-description">${message.description}</p>
      </div>
    `;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }
};

// ============================================
// CORE FUNCTIONS
// ============================================
let searchDebounceTimer = null;

function debounce(func, delay) {
  return function(...args) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

async function performSearch(query) {
  if (!query.trim()) {
    renderSearchResults([]);
    document.getElementById('search-status').innerHTML = UI.renderEmptyState('search');
    return;
  }

  state.isLoading = true;
  state.currentQuery = query;
  
  const searchStatus = document.getElementById('search-status');
  searchStatus.innerHTML = UI.renderLoadingState();
  document.getElementById('search-results').innerHTML = '';

  try {
    const results = await InternetArchiveAPI.search(query, {
      mediatype: state.filterType === 'all' ? 'texts' : state.filterType,
      sort: getSortParameter()
    });

    state.searchResults = results;
    renderSearchResults(results);
    
    if (results.length === 0) {
      searchStatus.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3 class="empty-state-title">No Results Found</h3>
          <p class="empty-state-description">Try different keywords or check your spelling</p>
        </div>
      `;
    } else {
      searchStatus.innerHTML = `<p style="color: var(--library-text); font-weight: 600; padding: 1rem 0;">Found ${results.length} books</p>`;
    }
  } catch (error) {
    console.error('Search failed:', error);
    searchStatus.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3 class="empty-state-title">Search Failed</h3>
        <p class="empty-state-description">Unable to connect to Internet Archive. Please try again.</p>
      </div>
    `;
  } finally {
    state.isLoading = false;
  }
}

function getSortParameter() {
  const sortMap = {
    relevance: '',
    date: 'date desc',
    downloads: 'downloads desc'
  };
  return sortMap[state.sortBy] || '';
}

function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  if (results.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.className = `books-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;
  container.innerHTML = results.map(book => UI.renderBookCard(book, 'search')).join('');
}

function renderLibrary() {
  const books = Storage.get(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY) || [];
  const container = document.getElementById('library-books');
  
  container.className = `books-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;
  
  if (books.length === 0) {
    container.innerHTML = UI.renderEmptyState('my-library');
  } else {
    container.innerHTML = books.map(book => UI.renderBookCard(book, 'library')).join('');
  }
}

function renderFavorites() {
  const books = Storage.get(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES) || [];
  const container = document.getElementById('favorite-books');
  
  container.className = `books-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;
  
  if (books.length === 0) {
    container.innerHTML = UI.renderEmptyState('favorites');
  } else {
    container.innerHTML = books.map(book => UI.renderBookCard(book, 'favorites')).join('');
  }
}

// ============================================
// USER ACTIONS
// ============================================
function addToLibrary(bookId) {
  const book = state.searchResults.find(b => b.identifier === bookId);
  if (!book) return;

  if (Storage.exists(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY, bookId)) {
    alert('This book is already in your library!');
    return;
  }

  Storage.append(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY, book);
  alert('Book added to your library!');
  
  // Refresh current view
  renderSearchResults(state.searchResults);
  renderLibrary();
}

function toggleFavorite(bookId) {
  const isFavorite = Storage.exists(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES, bookId);
  
  if (isFavorite) {
    Storage.remove(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES, bookId);
  } else {
    // Find book from search results or library
    let book = state.searchResults.find(b => b.identifier === bookId);
    if (!book) {
      const library = Storage.get(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY) || [];
      book = library.find(b => b.identifier === bookId);
    }
    
    if (book) {
      Storage.append(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES, book);
    }
  }
  
  // Refresh all views
  renderSearchResults(state.searchResults);
  renderLibrary();
  renderFavorites();
}

function openBook(bookId, title, pdfUrl) {
  const modal = document.getElementById('pdf-viewer-modal');
  const iframe = document.getElementById('pdf-iframe');
  const titleElement = document.getElementById('pdf-title');
  
  titleElement.textContent = title;
  
  // Use Internet Archive's built-in reader
  iframe.src = `https://archive.org/embed/${bookId}`;
  
  modal.style.display = 'flex';
}

function closePdfViewer() {
  const modal = document.getElementById('pdf-viewer-modal');
  const iframe = document.getElementById('pdf-iframe');
  
  modal.style.display = 'none';
  iframe.src = '';
}

// ============================================
// EVENT HANDLERS
// ============================================
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('library-search');
  const searchButton = document.getElementById('search-button');
  const searchClear = document.getElementById('search-clear');
  
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    searchClear.style.display = value ? 'block' : 'none';
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });
  
  searchButton.addEventListener('click', () => {
    performSearch(searchInput.value);
  });
  
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    state.searchResults = [];
    renderSearchResults([]);
    document.getElementById('search-status').innerHTML = UI.renderEmptyState('search');
  });

  // Filters
  document.getElementById('filter-type').addEventListener('change', (e) => {
    state.filterType = e.target.value;
    if (state.currentQuery) {
      performSearch(state.currentQuery);
    }
  });

  document.getElementById('sort-by').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    if (state.currentQuery) {
      performSearch(state.currentQuery);
    }
  });

  // View toggle
  document.getElementById('view-grid').addEventListener('click', () => {
    state.viewMode = 'grid';
    document.getElementById('view-grid').classList.add('active');
    document.getElementById('view-list').classList.remove('active');
    refreshCurrentView();
  });

  document.getElementById('view-list').addEventListener('click', () => {
    state.viewMode = 'list';
    document.getElementById('view-list').classList.add('active');
    document.getElementById('view-grid').classList.remove('active');
    refreshCurrentView();
  });

  // Tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      switchTab(tab);
    });
  });

  // PDF Viewer
  document.getElementById('close-pdf-viewer').addEventListener('click', closePdfViewer);
  
  // Close modal on background click
  document.getElementById('pdf-viewer-modal').addEventListener('click', (e) => {
    if (e.target.id === 'pdf-viewer-modal') {
      closePdfViewer();
    }
  });
}

function switchTab(tab) {
  state.currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`tab-${tab}`).classList.add('active');
  
  // Render content
  if (tab === 'my-library') {
    renderLibrary();
  } else if (tab === 'favorites') {
    renderFavorites();
  } else if (tab === 'search') {
    renderSearchResults(state.searchResults);
  }
}

function refreshCurrentView() {
  if (state.currentTab === 'search') {
    renderSearchResults(state.searchResults);
  } else if (state.currentTab === 'my-library') {
    renderLibrary();
  } else if (state.currentTab === 'favorites') {
    renderFavorites();
  }
}

// ============================================
// MODULE INITIALIZATION
// ============================================
function initModule(container) {
  console.log('Initializing Library Module...');
  
  // Load persisted data
  state.myLibrary = Storage.get(LIBRARY_CONFIG.STORAGE_KEYS.MY_LIBRARY) || [];
  state.favorites = Storage.get(LIBRARY_CONFIG.STORAGE_KEYS.FAVORITES) || [];
  
  // Setup event listeners
  setupEventListeners();
  
  // Render initial state
  document.getElementById('search-status').innerHTML = UI.renderEmptyState('search');
  renderLibrary();
  renderFavorites();
  
  console.log('Library Module initialized successfully');
  console.log(`Library contains ${state.myLibrary.length} books`);
  console.log(`Favorites contains ${state.favorites.length} books`);
}

// ============================================
// PUBLIC API
// ============================================
window.LibraryModule = {
  initModule,
  addToLibrary,
  toggleFavorite,
  openBook,
  closePdfViewer,
  performSearch
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initModule };
}