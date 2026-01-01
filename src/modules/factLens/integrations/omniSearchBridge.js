// =======================
// FACTLENS - OMNISEARCH BRIDGE
// Indexes FactLens research topics for global search
// =======================

class OmniSearchBridge {
  constructor() {
    this.storageKey = 'omnihub_factlens_history';
    this.maxHistory = 50; // Keep last 50 researched topics
  }

  /**
   * Index a researched topic for OmniSearch
   * @param {Object} topicData - Topic data to index
   */
  async indexTopic(topicData) {
    try {
      const history = this.getHistory();
      
      // Create search entry
      const entry = {
        id: `factlens_${Date.now()}`,
        title: topicData.title,
        query: topicData.query || topicData.title,
        definition: topicData.definition || '',
        concepts: topicData.concepts || [],
        url: topicData.url || '',
        timestamp: new Date().toISOString(),
        searchedAt: Date.now(),
        tags: ['research', 'factlens', ...(topicData.tags || [])]
      };
      
      // Check if topic already exists
      const existingIndex = history.findIndex(
        h => h.title === entry.title || h.query === entry.query
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex] = { ...history[existingIndex], ...entry };
      } else {
        // Add new entry at beginning
        history.unshift(entry);
      }
      
      // Keep only last N items
      const trimmedHistory = history.slice(0, this.maxHistory);
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
      
      console.log('✅ Indexed topic for OmniSearch:', entry.title);
      return true;
    } catch (error) {
      console.error('Failed to index topic:', error);
      return false;
    }
  }

  /**
   * Get search history
   * @returns {Array} History items
   */
  getHistory() {
    try {
      const history = localStorage.getItem(this.storageKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('✅ Cleared FactLens search history');
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  /**
   * Remove specific topic from history
   * @param {string} topicId - Topic ID to remove
   */
  removeTopic(topicId) {
    try {
      const history = this.getHistory();
      const filtered = history.filter(h => h.id !== topicId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log('✅ Removed topic from history:', topicId);
      return true;
    } catch (error) {
      console.error('Failed to remove topic:', error);
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OmniSearchBridge;
}
