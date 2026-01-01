// =======================
// SMART PINS SYSTEM
// Dynamic research objects that gain information with zoom level
// =======================

class SmartPin {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.lat = data.lat;
    this.lng = data.lng;
    this.name = data.name || 'Unknown Location';
    this.timestamp = data.timestamp || new Date().toISOString();
    
    // Category: geo, history, environment, human
    this.category = data.category || 'geo';
    
    // Data populated progressively
    this.baseData = data.baseData || {};
    this.regionalData = null;
    this.localData = null;
    this.detailData = null;
    
    // Related pins
    this.relatedPins = [];
    
    // Research notes
    this.notes = data.notes || '';
    
    // Tags
    this.tags = data.tags || [];
  }
  
  // Load data appropriate for zoom level
  async loadDataForZoomLevel(zoomLevel) {
    switch (zoomLevel) {
      case 1: // Planetary - minimal data
        return this.getBaseData();
      
      case 2: // Regional - country/region context
        if (!this.regionalData) {
          this.regionalData = await this.fetchRegionalData();
        }
        return { ...this.getBaseData(), ...this.regionalData };
      
      case 3: // Local - detailed location info
        if (!this.localData) {
          this.localData = await this.fetchLocalData();
        }
        return { 
          ...this.getBaseData(), 
          ...this.regionalData, 
          ...this.localData 
        };
      
      case 4: // Detail - maximum information
        if (!this.detailData) {
          this.detailData = await this.fetchDetailData();
        }
        return {
          ...this.getBaseData(),
          ...this.regionalData,
          ...this.localData,
          ...this.detailData
        };
      
      default:
        return this.getBaseData();
    }
  }
  
  // Base data always available
  getBaseData() {
    return {
      id: this.id,
      lat: this.lat,
      lng: this.lng,
      name: this.name,
      category: this.category,
      timestamp: this.timestamp
    };
  }
  
  // Fetch regional context
  async fetchRegionalData() {
    const location = window.GlobeData?.getLocationByCoords(this.lat, this.lng);
    const climate = await window.DataAdapters.climate.getClimate(this.lat, this.lng);
    
    return {
      country: location?.country || 'Unknown',
      region: location?.region || 'Unknown',
      climate: climate.description,
      climateZone: climate.zone,
      koppenType: climate.type
    };
  }
  
  // Fetch local data
  async fetchLocalData() {
    const elevation = await window.DataAdapters.elevation.getElevation(this.lat, this.lng);
    const terrain = await window.DataAdapters.terrain.getTerrain(this.lat, this.lng);
    const population = await window.DataAdapters.population.getPopulationDensity(this.lat, this.lng);
    
    return {
      elevation: elevation + 'm',
      terrainType: terrain.description,
      landcover: terrain.landcover,
      populationDensity: population.density + ' per km²',
      densityCategory: population.category,
      nearestCity: population.nearestCity
    };
  }
  
  // Fetch detailed data
  async fetchDetailData() {
    // In production, fetch from detailed APIs
    return {
      geologicalInfo: this.getGeologicalInfo(),
      historicalEvents: this.getHistoricalEvents(),
      environmentalData: this.getEnvironmentalData(),
      humanActivity: this.getHumanActivity()
    };
  }
  
  getGeologicalInfo() {
    return {
      tectonicPlate: 'Eurasian Plate',
      soilType: 'Loam',
      seismicActivity: 'Low'
    };
  }
  
  getHistoricalEvents() {
    return [];
  }
  
  getEnvironmentalData() {
    return {
      averageTemperature: '15°C',
      precipitation: '800mm annually',
      biodiversity: 'Moderate'
    };
  }
  
  getHumanActivity() {
    return {
      urbanization: 'Moderate',
      agriculture: 'Mixed farming',
      industry: 'Light industrial'
    };
  }
  
  // Add related pin
  addRelatedPin(pinId) {
    if (!this.relatedPins.includes(pinId)) {
      this.relatedPins.push(pinId);
    }
  }
  
  // Add note
  addNote(note) {
    this.notes += (this.notes ? '\n' : '') + note;
  }
  
  // Add tag
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }
  
  // Export pin data
  export() {
    return {
      id: this.id,
      lat: this.lat,
      lng: this.lng,
      name: this.name,
      category: this.category,
      timestamp: this.timestamp,
      notes: this.notes,
      tags: this.tags,
      relatedPins: this.relatedPins,
      allData: {
        base: this.baseData,
        regional: this.regionalData,
        local: this.localData,
        detail: this.detailData
      }
    };
  }
}

// Smart Pins Manager
class SmartPinsManager {
  constructor() {
    this.pins = new Map();
    this.currentZoomLevel = 1;
    this.selectedPin = null;
  }
  
  // Create new smart pin
  createPin(lat, lng, name, category = 'geo') {
    const pin = new SmartPin({ lat, lng, name, category });
    this.pins.set(pin.id, pin);
    
    // Save to state
    this.saveToState();
    
    return pin;
  }
  
  // Get pin by ID
  getPin(pinId) {
    return this.pins.get(pinId);
  }
  
  // Get all pins
  getAllPins() {
    return Array.from(this.pins.values());
  }
  
  // Remove pin
  removePin(pinId) {
    this.pins.delete(pinId);
    this.saveToState();
  }
  
  // Get pin data for current zoom level
  async getPinDataForZoom(pinId) {
    const pin = this.pins.get(pinId);
    if (!pin) return null;
    
    return await pin.loadDataForZoomLevel(this.currentZoomLevel);
  }
  
  // Update zoom level for all pins
  updateZoomLevel(level) {
    this.currentZoomLevel = level;
  }
  
  // Select pin
  selectPin(pinId) {
    this.selectedPin = pinId;
  }
  
  // Get selected pin
  getSelectedPin() {
    return this.pins.get(this.selectedPin);
  }
  
  // Find pins near location
  findNearbyPins(lat, lng, radius = 500) {
    const nearby = [];
    
    this.pins.forEach(pin => {
      const distance = this.calculateDistance(lat, lng, pin.lat, pin.lng);
      if (distance < radius) {
        nearby.push({ pin, distance });
      }
    });
    
    return nearby.sort((a, b) => a.distance - b.distance);
  }
  
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Export all pins
  exportAllPins() {
    const pinsArray = this.getAllPins().map(pin => pin.export());
    return JSON.stringify(pinsArray, null, 2);
  }
  
  // Import pins
  importPins(jsonString) {
    try {
      const pinsData = JSON.parse(jsonString);
      pinsData.forEach(pinData => {
        const pin = new SmartPin(pinData);
        this.pins.set(pin.id, pin);
      });
      this.saveToState();
      return true;
    } catch (e) {
      console.error('Failed to import pins:', e);
      return false;
    }
  }
  
  // Save to global state
  saveToState() {
    const pinsArray = this.getAllPins().map(pin => ({
      id: pin.id,
      lat: pin.lat,
      lng: pin.lng,
      name: pin.name,
      category: pin.category,
      timestamp: pin.timestamp,
      notes: pin.notes,
      tags: pin.tags
    }));
    
    window.globeState?.set('pins', pinsArray);
  }
  
  // Load from global state
  loadFromState() {
    const pinsData = window.globeState?.get('pins') || [];
    pinsData.forEach(pinData => {
      const pin = new SmartPin(pinData);
      this.pins.set(pin.id, pin);
    });
  }
}

// Create global instance
window.SmartPinsManager = new SmartPinsManager();
console.log('📍 Smart Pins system initialized');