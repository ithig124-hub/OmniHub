// Globe State Management
// Simple state manager for Globe module

class GlobeState {
  constructor() {
    this.state = {
      // Camera state
      camera: {
        altitude: 2.5,
        lat: 40.7128,
        lng: -74.006
      },
      
      // Layer visibility
      layers: {
        flights: false,
        shipping: false,
        cables: false,
        ocean: false,
        grid: false,
        atmosphere: true
      },
      
      // Layer opacity
      opacity: {
        flights: 0.7,
        shipping: 0.7,
        cables: 0.7,
        ocean: 0.7
      },
      
      // Pins
      pins: [],
      selectedPin: null,
      
      // Search
      searchResults: [],
      
      // UI state
      isLoading: false,
      currentLocation: null
    };
    
    this.listeners = [];
    this.loadFromStorage();
  }
  
  // Get state
  get(key) {
    if (!key) return this.state;
    const keys = key.split('.');
    let value = this.state;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }
  
  // Set state
  set(key, value) {
    const keys = key.split('.');
    let obj = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.notify(key, value);
    this.saveToStorage();
  }
  
  // Update multiple values
  update(updates) {
    Object.keys(updates).forEach(key => {
      this.set(key, updates[key]);
    });
  }
  
  // Subscribe to changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  // Notify listeners
  notify(key, value) {
    this.listeners.forEach(listener => listener(key, value, this.state));
  }
  
  // Persistence
  saveToStorage() {
    try {
      localStorage.setItem('omnihub_globe_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save globe state:', e);
    }
  }
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('omnihub_globe_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
        console.log('Globe state loaded from storage');
      }
    } catch (e) {
      console.warn('Failed to load globe state:', e);
    }
  }
  
  // Pin management
  addPin(pin) {
    const newPin = {
      id: Date.now().toString(),
      ...pin,
      timestamp: new Date().toISOString()
    };
    this.state.pins.push(newPin);
    this.notify('pins', this.state.pins);
    this.saveToStorage();
    return newPin;
  }
  
  removePin(pinId) {
    this.state.pins = this.state.pins.filter(p => p.id !== pinId);
    this.notify('pins', this.state.pins);
    this.saveToStorage();
  }
  
  getPin(pinId) {
    return this.state.pins.find(p => p.id === pinId);
  }
  
  // Camera management
  updateCamera(camera) {
    this.set('camera', { ...this.state.camera, ...camera });
  }
  
  // Layer management
  toggleLayer(layerName) {
    const current = this.state.layers[layerName];
    this.set(`layers.${layerName}`, !current);
  }
  
  setLayerOpacity(layerName, opacity) {
    this.set(`opacity.${layerName}`, opacity);
  }
  
  // Export/Import state
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }
  
  importState(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.state = { ...this.state, ...imported };
      this.saveToStorage();
      this.notify('*', this.state);
      return true;
    } catch (e) {
      console.error('Failed to import state:', e);
      return false;
    }
  }
  
  // Reset to defaults
  reset() {
    const defaultState = {
      camera: { altitude: 2.5, lat: 40.7128, lng: -74.006 },
      layers: {
        flights: false,
        shipping: false,
        cables: false,
        ocean: false,
        grid: false,
        atmosphere: true
      },
      opacity: {
        flights: 0.7,
        shipping: 0.7,
        cables: 0.7,
        ocean: 0.7
      },
      pins: [],
      selectedPin: null,
      searchResults: [],
      isLoading: false,
      currentLocation: null
    };
    this.state = defaultState;
    this.saveToStorage();
    this.notify('*', this.state);
  }
}

// Create global instance
window.globeState = new GlobeState();
console.log('🌍 Globe State initialized');