// =======================
// NOTES BRIDGE
// Integration with Notes Module
// =======================

class NotesBridge {
  constructor() {
    this.notesDataStore = null;
    this.init();
  }

  /**
   * Initialize connection to Notes module
   */
  init() {
    // Try to access parent OmniHub system
    if (window.parent && window.parent.OmniHub) {
      console.log('✅ Connected to OmniHub system');
    }
  }

  /**
   * Save content to Notes module
   */
  async saveToNotes(noteData) {
    try {
      console.log('💾 Saving to Notes:', noteData.title);

      // Store in OmniHub DataStore
      if (window.parent?.OmniHub?.DataStore) {
        const dataStore = window.parent.OmniHub.DataStore;
        
        const note = {
          id: this.generateId(),
          ...noteData,
          createdAt: new Date().toISOString(),
          module: 'factlens'
        };

        await dataStore.saveNote(note);
        console.log('✅ Note saved successfully');
        return { success: true, noteId: note.id };
      }

      // Fallback: Store in localStorage
      const notes = this.getStoredNotes();
      const note = {
        id: this.generateId(),
        ...noteData,
        createdAt: new Date().toISOString(),
        module: 'factlens'
      };
      
      notes.push(note);
      localStorage.setItem('omnihub_notes', JSON.stringify(notes));
      
      console.log('✅ Note saved to localStorage');
      this.showNotification(`Saved "${noteData.title}" to Notes`);
      
      return { success: true, noteId: note.id };
    } catch (error) {
      console.error('❌ Failed to save note:', error);
      this.showNotification('Failed to save note', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Save multiple sections as separate notes
   */
  async saveAllSections(sections) {
    const results = [];
    
    for (const section of sections) {
      const result = await this.saveToNotes(section);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    this.showNotification(`Saved ${successCount}/${sections.length} sections to Notes`);
    
    return results;
  }

  /**
   * Navigate to Notes module
   */
  openNotesModule(noteId = null) {
    try {
      if (window.parent?.OmniHub?.navigateToModule) {
        window.parent.OmniHub.navigateToModule('notes');
        
        // If noteId provided, send message to highlight it
        if (noteId) {
          setTimeout(() => {
            window.parent.postMessage({
              type: 'highlight-note',
              noteId: noteId
            }, '*');
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to navigate to Notes:', error);
    }
  }

  /**
   * Get stored notes from localStorage
   */
  getStoredNotes() {
    try {
      const stored = localStorage.getItem('omnihub_notes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored notes:', error);
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `fl_note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    // Try parent OmniHub notification system
    if (window.parent?.OmniHub?.notify) {
      window.parent.OmniHub.notify(message, type);
      return;
    }

    // Fallback: console log
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  }

  /**
   * Check if Notes module is available
   */
  isNotesAvailable() {
    return window.parent?.OmniHub?.modules?.includes('notes') || true;
  }
}

// Expose globally
window.NotesBridge = NotesBridge;
