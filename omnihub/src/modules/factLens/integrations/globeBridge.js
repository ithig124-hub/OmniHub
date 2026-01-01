// =======================
// GLOBE BRIDGE
// Integration with Globe Module
// =======================

class GlobeBridge {
  constructor() {
    this.init();
  }

  /**
   * Initialize connection to Globe module
   */
  init() {
    if (window.parent && window.parent.OmniHub) {
      console.log('✅ Connected to OmniHub Globe system');
    }
  }

  /**
   * Pin location to Globe
   */
  async pinToGlobe(locationData) {
    try {
      console.log('📍 Pinning to Globe:', locationData.title);

      // Validate coordinates
      if (!locationData.lat || !locationData.lon) {
        throw new Error('Invalid coordinates');
      }

      // Store in OmniHub DataStore
      if (window.parent?.OmniHub?.DataStore) {
        const dataStore = window.parent.OmniHub.DataStore;
        
        const pin = {
          id: this.generateId(),
          ...locationData,
          createdAt: new Date().toISOString(),
          module: 'factlens',
          type: 'research-location'
        };

        await dataStore.saveLocation(pin);
        console.log('✅ Location pinned successfully');
        return { success: true, pinId: pin.id };
      }

      // Fallback: Store in localStorage
      const pins = this.getStoredPins();
      const pin = {
        id: this.generateId(),
        ...locationData,
        createdAt: new Date().toISOString(),
        module: 'factlens',
        type: 'research-location'
      };
      
      pins.push(pin);
      localStorage.setItem('omnihub_globe_pins', JSON.stringify(pins));
      
      console.log('✅ Location pinned to localStorage');
      this.showNotification(`Pinned "${locationData.title}" to Globe`);
      
      return { success: true, pinId: pin.id };
    } catch (error) {
      console.error('❌ Failed to pin location:', error);
      this.showNotification('Failed to pin location', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to Globe module and fly to location
   */
  async openInGlobe(locationData) {
    try {
      // First pin the location
      const result = await this.pinToGlobe(locationData);
      
      if (!result.success) {
        throw new Error('Failed to pin location');
      }

      // Navigate to Globe module
      if (window.parent?.OmniHub?.navigateToModule) {
        window.parent.OmniHub.navigateToModule('globe');
        
        // Send message to fly to location
        setTimeout(() => {
          window.parent.postMessage({
            type: 'fly-to-location',
            coordinates: {
              lat: locationData.lat,
              lon: locationData.lon
            },
            zoom: 12,
            title: locationData.title
          }, '*');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to open in Globe:', error);
      this.showNotification('Failed to open location in Globe', 'error');
    }
  }

  /**
   * Check if location has coordinates
   */
  hasCoordinates(coordinates) {
    return coordinates && 
           typeof coordinates.lat === 'number' && 
           typeof coordinates.lon === 'number' &&
           coordinates.lat >= -90 && coordinates.lat <= 90 &&
           coordinates.lon >= -180 && coordinates.lon <= 180;
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(lat, lon) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }

  /**
   * Get stored pins from localStorage
   */
  getStoredPins() {
    try {
      const stored = localStorage.getItem('omnihub_globe_pins');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored pins:', error);
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `fl_pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    if (window.parent?.OmniHub?.notify) {
      window.parent.OmniHub.notify(message, type);
      return;
    }
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  }

  /**
   * Check if Globe module is available
   */
  isGlobeAvailable() {
    return window.parent?.OmniHub?.modules?.includes('globe') || true;
  }
}

// Expose globally
window.GlobeBridge = GlobeBridge;
