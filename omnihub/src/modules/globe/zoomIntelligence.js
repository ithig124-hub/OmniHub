// =======================
// ZOOM-BASED INTELLIGENCE SYSTEM
// Multi-tier zoom intelligence for progressive data disclosure
// =======================

class ZoomIntelligence {
  constructor() {
    this.currentZoomLevel = 1;
    this.zoomThresholds = {
      PLANETARY: { min: 0, max: 3, level: 1 },
      REGIONAL: { min: 1.5, max: 2.5, level: 2 },
      LOCAL: { min: 1, max: 2, level: 3 },
      DETAIL: { min: 0, max: 1.5, level: 4 }
    };
    
    this.listeners = [];
    this.activeOverlays = new Set();
  }
  
  // Determine zoom level from altitude
  determineZoomLevel(altitude) {
    if (altitude > 3) return 1; // Planetary
    if (altitude > 2) return 2; // Regional
    if (altitude > 1) return 3; // Local
    return 4; // Detail
  }
  
  // Update zoom level and trigger changes
  updateZoom(altitude, lat, lng) {
    const newLevel = this.determineZoomLevel(altitude);
    
    if (newLevel !== this.currentZoomLevel) {
      const oldLevel = this.currentZoomLevel;
      this.currentZoomLevel = newLevel;
      
      console.log(`📊 Zoom level changed: ${oldLevel} → ${newLevel} (altitude: ${altitude.toFixed(2)})`);
      
      // Notify listeners
      this.notifyZoomChange(oldLevel, newLevel, { altitude, lat, lng });
      
      // Auto-activate appropriate overlays
      this.activateOverlaysForLevel(newLevel, lat, lng);
    }
    
    return newLevel;
  }
  
  // Subscribe to zoom level changes
  onZoomLevelChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  // Notify all listeners
  notifyZoomChange(oldLevel, newLevel, context) {
    this.listeners.forEach(listener => {
      listener(oldLevel, newLevel, context);
    });
  }
  
  // Activate overlays appropriate for zoom level
  activateOverlaysForLevel(level, lat, lng) {
    const overlaysToActivate = this.getOverlaysForLevel(level, lat, lng);
    
    // Deactivate overlays not needed for this level
    this.activeOverlays.forEach(overlay => {
      if (!overlaysToActivate.includes(overlay)) {
        this.deactivateOverlay(overlay);
      }
    });
    
    // Activate new overlays
    overlaysToActivate.forEach(overlay => {
      if (!this.activeOverlays.has(overlay)) {
        this.activateOverlay(overlay);
      }
    });
  }
  
  // Get overlays for specific zoom level
  getOverlaysForLevel(level, lat, lng) {
    const isOcean = this.isOceanLocation(lat, lng);
    
    switch (level) {
      case 1: // Planetary
        return ['continents', 'atmosphere', 'climate_zones'];
      
      case 2: // Regional
        return ['borders', 'major_cities', 'climate_classification', 'elevation_gradient'];
      
      case 3: // Local
        return ['transport_routes', 'terrain_type', 'infrastructure'];
      
      case 4: // Detail
        if (isOcean) {
          return ['ocean_depth', 'ocean_temperature', 'currents', 'marine_ecosystems'];
        }
        return ['detailed_terrain', 'buildings', 'roads', 'landmarks'];
      
      default:
        return [];
    }
  }
  
  // Check if location is ocean
  isOceanLocation(lat, lng) {
    // Simplified ocean detection - in production, use proper geographic data
    // This checks if coordinates are in major ocean regions
    return window.OceanLayer && window.OceanLayer.isOcean(lat, lng);
  }
  
  // Activate specific overlay
  activateOverlay(overlayName) {
    this.activeOverlays.add(overlayName);
    console.log(`✅ Activated overlay: ${overlayName}`);
    
    // Emit event for overlay manager to handle
    window.dispatchEvent(new CustomEvent('globe:overlay:activate', {
      detail: { overlay: overlayName }
    }));
  }
  
  // Deactivate specific overlay
  deactivateOverlay(overlayName) {
    this.activeOverlays.delete(overlayName);
    console.log(`❌ Deactivated overlay: ${overlayName}`);
    
    window.dispatchEvent(new CustomEvent('globe:overlay:deactivate', {
      detail: { overlay: overlayName }
    }));
  }
  
  // Get current zoom level
  getCurrentLevel() {
    return this.currentZoomLevel;
  }
  
  // Get level name
  getLevelName(level) {
    const names = {
      1: 'Planetary',
      2: 'Regional',
      3: 'Local',
      4: 'Detail'
    };
    return names[level] || 'Unknown';
  }
  
  // Get appropriate data density for level
  getDataDensity(level) {
    return {
      1: 'low',      // Planetary: Few data points
      2: 'medium',   // Regional: Moderate data
      3: 'high',     // Local: Dense data
      4: 'ultra'     // Detail: Maximum detail
    }[level] || 'low';
  }
}

// Create global instance
window.ZoomIntelligence = new ZoomIntelligence();
console.log('🔬 Zoom Intelligence system initialized');