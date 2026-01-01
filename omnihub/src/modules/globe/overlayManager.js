// =======================
// OVERLAY MANAGER
// Manages multiple data overlays with zoom-based activation
// =======================

class OverlayManager {
  constructor() {
    this.overlays = new Map();
    this.activeOverlays = new Set();
    this.globeInstance = null;
    
    this.initializeOverlays();
  }
  
  // Initialize all available overlays
  initializeOverlays() {
    // Register planetary level overlays
    this.registerOverlay('continents', {
      level: 1,
      name: 'Continents',
      type: 'polygons',
      activate: (globe) => this.showContinents(globe),
      deactivate: (globe) => this.hideContinents(globe)
    });
    
    this.registerOverlay('atmosphere', {
      level: 1,
      name: 'Atmosphere',
      type: 'effect',
      activate: (globe) => globe.showAtmosphere(true),
      deactivate: (globe) => globe.showAtmosphere(false)
    });
    
    this.registerOverlay('climate_zones', {
      level: 1,
      name: 'Climate Zones',
      type: 'heatmap',
      activate: (globe) => this.showClimateZones(globe),
      deactivate: (globe) => this.hideClimateZones(globe)
    });
    
    // Register regional level overlays
    this.registerOverlay('borders', {
      level: 2,
      name: 'Country Borders',
      type: 'lines',
      activate: (globe) => this.showBorders(globe),
      deactivate: (globe) => this.hideBorders(globe)
    });
    
    this.registerOverlay('major_cities', {
      level: 2,
      name: 'Major Cities',
      type: 'points',
      activate: (globe) => this.showMajorCities(globe),
      deactivate: (globe) => this.hideMajorCities(globe)
    });
    
    this.registerOverlay('climate_classification', {
      level: 2,
      name: 'Köppen Climate',
      type: 'heatmap',
      activate: (globe) => this.showClimateClassification(globe),
      deactivate: (globe) => this.hideClimateClassification(globe)
    });
    
    this.registerOverlay('elevation_gradient', {
      level: 2,
      name: 'Elevation',
      type: 'heatmap',
      activate: (globe) => this.showElevationGradient(globe),
      deactivate: (globe) => this.hideElevationGradient(globe)
    });
    
    // Register local level overlays
    this.registerOverlay('transport_routes', {
      level: 3,
      name: 'Transport Routes',
      type: 'lines',
      activate: (globe) => this.showTransportRoutes(globe),
      deactivate: (globe) => this.hideTransportRoutes(globe)
    });
    
    this.registerOverlay('terrain_type', {
      level: 3,
      name: 'Terrain Types',
      type: 'polygons',
      activate: (globe) => this.showTerrainTypes(globe),
      deactivate: (globe) => this.hideTerrainTypes(globe)
    });
    
    this.registerOverlay('infrastructure', {
      level: 3,
      name: 'Infrastructure',
      type: 'points',
      activate: (globe) => this.showInfrastructure(globe),
      deactivate: (globe) => this.hideInfrastructure(globe)
    });
    
    // Register detail/ocean level overlays
    this.registerOverlay('ocean_depth', {
      level: 4,
      name: 'Ocean Depth',
      type: 'heatmap',
      condition: 'ocean',
      activate: (globe) => this.showOceanDepth(globe),
      deactivate: (globe) => this.hideOceanDepth(globe)
    });
    
    this.registerOverlay('ocean_temperature', {
      level: 4,
      name: 'Ocean Temperature',
      type: 'heatmap',
      condition: 'ocean',
      activate: (globe) => this.showOceanTemperature(globe),
      deactivate: (globe) => this.hideOceanTemperature(globe)
    });
    
    this.registerOverlay('currents', {
      level: 4,
      name: 'Ocean Currents',
      type: 'arrows',
      condition: 'ocean',
      activate: (globe) => this.showCurrents(globe),
      deactivate: (globe) => this.hideCurrents(globe)
    });
    
    this.registerOverlay('marine_ecosystems', {
      level: 4,
      name: 'Marine Ecosystems',
      type: 'polygons',
      condition: 'ocean',
      activate: (globe) => this.showMarineEcosystems(globe),
      deactivate: (globe) => this.hideMarineEcosystems(globe)
    });
  }
  
  // Register overlay
  registerOverlay(id, config) {
    this.overlays.set(id, config);
  }
  
  // Set globe instance
  setGlobe(globe) {
    this.globeInstance = globe;
  }
  
  // Activate overlay
  activateOverlay(overlayId) {
    const overlay = this.overlays.get(overlayId);
    if (!overlay) {
      console.warn(`Overlay not found: ${overlayId}`);
      return;
    }
    
    if (this.activeOverlays.has(overlayId)) {
      console.log(`Overlay already active: ${overlayId}`);
      return;
    }
    
    try {
      overlay.activate(this.globeInstance);
      this.activeOverlays.add(overlayId);
      console.log(`✅ Activated overlay: ${overlay.name}`);
    } catch (e) {
      console.error(`Failed to activate overlay ${overlayId}:`, e);
    }
  }
  
  // Deactivate overlay
  deactivateOverlay(overlayId) {
    const overlay = this.overlays.get(overlayId);
    if (!overlay) return;
    
    if (!this.activeOverlays.has(overlayId)) return;
    
    try {
      overlay.deactivate(this.globeInstance);
      this.activeOverlays.delete(overlayId);
      console.log(`❌ Deactivated overlay: ${overlay.name}`);
    } catch (e) {
      console.error(`Failed to deactivate overlay ${overlayId}:`, e);
    }
  }
  
  // Get overlays for zoom level
  getOverlaysForLevel(level) {
    const overlaysForLevel = [];
    this.overlays.forEach((overlay, id) => {
      if (overlay.level === level) {
        overlaysForLevel.push({ id, ...overlay });
      }
    });
    return overlaysForLevel;
  }
  
  // === OVERLAY IMPLEMENTATIONS ===
  
  // Continents
  showContinents(globe) {
    // Show continent outlines
    console.log('Showing continents');
  }
  
  hideContinents(globe) {
    console.log('Hiding continents');
  }
  
  // Climate Zones
  showClimateZones(globe) {
    const zones = [
      { lat: 0, lng: 0, color: 'red', label: 'Tropical' },
      { lat: 30, lng: 0, color: 'orange', label: 'Subtropical' },
      { lat: 50, lng: 0, color: 'yellow', label: 'Temperate' },
      { lat: 70, lng: 0, color: 'blue', label: 'Polar' }
    ];
    
    globe.labelsData(zones)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.label)
      .labelSize(1.5)
      .labelDotRadius(0.4)
      .labelColor(d => d.color);
  }
  
  hideClimateZones(globe) {
    globe.labelsData([]);
  }
  
  // Borders
  showBorders(globe) {
    // In production, load GeoJSON country borders
    console.log('Showing country borders');
  }
  
  hideBorders(globe) {
    console.log('Hiding country borders');
  }
  
  // Major Cities
  showMajorCities(globe) {
    const cities = window.DataAdapters?.population.populationCenters || [];
    
    globe.labelsData(cities)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.name)
      .labelSize(0.8)
      .labelDotRadius(0.3)
      .labelColor(() => 'rgba(255, 255, 255, 0.9)')
      .labelResolution(2);
  }
  
  hideMajorCities(globe) {
    globe.labelsData([]);
  }
  
  // Climate Classification
  showClimateClassification(globe) {
    console.log('Showing Köppen classification');
  }
  
  hideClimateClassification(globe) {
    console.log('Hiding Köppen classification');
  }
  
  // Elevation Gradient
  showElevationGradient(globe) {
    console.log('Showing elevation gradient');
  }
  
  hideElevationGradient(globe) {
    console.log('Hiding elevation gradient');
  }
  
  // Transport Routes
  showTransportRoutes(globe) {
    // Use existing flight and shipping layers
    if (window.FlightLayer) {
      window.FlightLayer.applyToGlobe(globe, 0.5);
    }
    if (window.ShippingLayer) {
      window.ShippingLayer.applyToGlobe(globe, 0.5);
    }
  }
  
  hideTransportRoutes(globe) {
    if (window.FlightLayer) {
      window.FlightLayer.removeFromGlobe(globe);
    }
    if (window.ShippingLayer) {
      window.ShippingLayer.removeFromGlobe(globe);
    }
  }
  
  // Terrain Types
  showTerrainTypes(globe) {
    console.log('Showing terrain types');
  }
  
  hideTerrainTypes(globe) {
    console.log('Hiding terrain types');
  }
  
  // Infrastructure
  showInfrastructure(globe) {
    console.log('Showing infrastructure');
  }
  
  hideInfrastructure(globe) {
    console.log('Hiding infrastructure');
  }
  
  // Ocean Depth
  showOceanDepth(globe) {
    console.log('Showing ocean depth contours');
  }
  
  hideOceanDepth(globe) {
    console.log('Hiding ocean depth contours');
  }
  
  // Ocean Temperature
  showOceanTemperature(globe) {
    console.log('Showing ocean temperature');
  }
  
  hideOceanTemperature(globe) {
    console.log('Hiding ocean temperature');
  }
  
  // Currents
  showCurrents(globe) {
    console.log('Showing ocean currents');
  }
  
  hideCurrents(globe) {
    console.log('Hiding ocean currents');
  }
  
  // Marine Ecosystems
  showMarineEcosystems(globe) {
    if (window.OceanLayer) {
      window.OceanLayer.applyToGlobe(globe, 0.7);
    }
  }
  
  hideMarineEcosystems(globe) {
    if (window.OceanLayer) {
      window.OceanLayer.removeFromGlobe(globe);
    }
  }
}

// Create global instance
window.OverlayManager = new OverlayManager();
console.log('🗺️ Overlay Manager initialized');