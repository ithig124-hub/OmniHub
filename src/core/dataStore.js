// =======================
// OMNIHUB DATA STORE
// Centralized state management for cross-module data sharing
// =======================

class OmniHubDataStore {
  constructor() {
    this.storageKey = 'omnihub_shared_data';
    this.subscribers = new Map(); // moduleId -> callback[]
    this.data = this.loadFromStorage();
    
    console.log('📦 OmniHub DataStore initialized');
  }

  // =======================
  // STORAGE MANAGEMENT
  // =======================

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultData();
    } catch (e) {
      console.warn('⚠️ Failed to load data from storage:', e);
      return this.getDefaultData();
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('⚠️ Failed to save data to storage:', e);
    }
  }

  getDefaultData() {
    return {
      // Notes data
      notes: {
        items: [],
        tags: [],
        lastModified: null
      },
      
      // Map data
      map: {
        pins: [],
        routes: [],
        lastLocation: null
      },
      
      // Library data
      library: {
        books: [],
        favorites: [],
        readingProgress: {}
      },
      
      // Search history
      search: {
        history: [],
        savedSearches: []
      },
      
      // Dashboard data
      dashboard: {
        events: [],
        preferences: {}
      },
      
      // Tracking data
      tracking: {
        locations: [],
        devices: []
      },
      
      // Global preferences
      preferences: {
        theme: 'auto',
        language: 'en'
      }
    };
  }

  // =======================
  // DATA ACCESS API
  // =======================

  // Get all data for a module
  getModuleData(moduleId) {
    return this.data[moduleId] || {};
  }

  // Set all data for a module
  setModuleData(moduleId, data) {
    this.data[moduleId] = data;
    this.saveToStorage();
    this.notifySubscribers(moduleId, data);
  }

  // Get a specific key from a module
  get(moduleId, key) {
    const moduleData = this.data[moduleId];
    if (!moduleData) return undefined;
    return moduleData[key];
  }

  // Set a specific key for a module
  set(moduleId, key, value) {
    if (!this.data[moduleId]) {
      this.data[moduleId] = {};
    }
    this.data[moduleId][key] = value;
    this.saveToStorage();
    this.notifySubscribers(moduleId, this.data[moduleId]);
  }

  // =======================
  // CROSS-MODULE DATA SHARING
  // =======================

  // Get notes for search module
  getNotesForSearch() {
    const notes = this.data.notes?.items || [];
    return notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content?.substring(0, 200),
      tags: note.tags,
      modified: note.modified,
      type: 'note'
    }));
  }

  // Get map pins for search module
  getMapPinsForSearch() {
    const pins = this.data.map?.pins || [];
    return pins.map(pin => ({
      id: pin.id,
      title: pin.name,
      description: pin.description,
      coords: pin.coords,
      type: 'map'
    }));
  }

  // Get library books for search module
  getLibraryForSearch() {
    const books = this.data.library?.books || [];
    return books.map(book => ({
      id: book.identifier,
      title: book.title,
      author: book.creator,
      type: 'library'
    }));
  }

  // Get all searchable items
  getAllSearchableItems() {
    return [
      ...this.getNotesForSearch(),
      ...this.getMapPinsForSearch(),
      ...this.getLibraryForSearch()
    ];
  }

  // Link note to map pin
  linkNoteToPin(noteId, pinId) {
    if (!this.data.links) this.data.links = [];
    
    this.data.links.push({
      type: 'note-pin',
      noteId,
      pinId,
      created: new Date().toISOString()
    });
    
    this.saveToStorage();
  }

  // Get linked pins for a note
  getLinkedPins(noteId) {
    const links = this.data.links || [];
    const pinIds = links
      .filter(l => l.type === 'note-pin' && l.noteId === noteId)
      .map(l => l.pinId);
    
    const pins = this.data.map?.pins || [];
    return pins.filter(p => pinIds.includes(p.id));
  }

  // Get linked notes for a pin
  getLinkedNotes(pinId) {
    const links = this.data.links || [];
    const noteIds = links
      .filter(l => l.type === 'note-pin' && l.pinId === pinId)
      .map(l => l.noteId);
    
    const notes = this.data.notes?.items || [];
    return notes.filter(n => noteIds.includes(n.id));
  }

  // =======================
  // SUBSCRIPTION SYSTEM
  // =======================

  // Subscribe to module data changes
  subscribe(moduleId, callback) {
    if (!this.subscribers.has(moduleId)) {
      this.subscribers.set(moduleId, []);
    }
    this.subscribers.get(moduleId).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(moduleId);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  // Notify subscribers of changes
  notifySubscribers(moduleId, data) {
    const callbacks = this.subscribers.get(moduleId) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error('Subscriber callback error:', e);
      }
    });
  }

  // =======================
  // IMPORT/EXPORT
  // =======================

  exportAllData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.data = { ...this.data, ...imported };
      this.saveToStorage();
      
      // Notify all subscribers
      Object.keys(this.data).forEach(moduleId => {
        this.notifySubscribers(moduleId, this.data[moduleId]);
      });
      
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // Clear all data
  clearAll() {
    this.data = this.getDefaultData();
    this.saveToStorage();
  }
}

// Create singleton instance
const dataStore = new OmniHubDataStore();

// Expose globally
window.OmniHubDataStore = dataStore;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataStore;
}

console.log('✅ OmniHub DataStore ready');
