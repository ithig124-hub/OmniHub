// =======================
// OMNIHUB GLOBE MODULE
// Advanced 3D Globe with Research & Intelligence Features
// =======================

let globeInstance = null;
let currentHoverLat = null;
let currentHoverLng = null;
let isInitialized = false;
let zoomUpdateInterval = null;

// Check if dependencies are loaded with detailed diagnostics
function checkDependencies() {
  const deps = {
    'THREE': typeof THREE !== 'undefined',
    'Globe': typeof Globe !== 'undefined',
    'd3': typeof d3 !== 'undefined',
    'globeState': typeof window.globeState !== 'undefined',
    'GlobeData': typeof window.GlobeData !== 'undefined'
  };
  
  console.log('📦 Dependency check:', deps);
  
  const allLoaded = Object.values(deps).every(loaded => loaded);
  if (!allLoaded) {
    const missing = Object.keys(deps).filter(key => !deps[key]);
    console.error('❌ Missing dependencies:', missing);
    
    // Provide detailed diagnostic info
    if (!deps.THREE) {
      console.error('💡 THREE.js not loaded. Check if libs/three.min.js exists and loads correctly.');
    }
    if (!deps.Globe) {
      console.error('💡 Globe.gl not loaded. Check if libs/globe.gl.min.js exists and loads correctly.');
    }
    if (!deps.d3) {
      console.error('💡 D3.js not loaded. Check if libs/d3.min.js exists and loads correctly.');
    }
    if (!deps.GlobeData) {
      console.error('💡 GlobeData not loaded. Check if data/staticDatasets.js loads correctly.');
    }
    
    return false;
  }
  
  console.log('✅ All dependencies loaded successfully');
  return true;
}

// Initialize Globe
function initGlobe() {
  if (isInitialized) {
    console.log('⚠️ Globe already initialized');
    return;
  }
  
  console.log('🌍 Initializing Globe Module...');
  
  // Check dependencies
  if (!checkDependencies()) {
    console.error('❌ Cannot initialize Globe: missing dependencies');
    showError('Failed to load required libraries. Please refresh the page.');
    return;
  }
  
  // Show loader
  showLoader(true);
  
  try {
    // Create globe instance
    const container = document.getElementById('globe-container');
    
    if (!container) {
      throw new Error('Globe container not found');
    }
    
    console.log('📐 Container dimensions:', {
      width: container.offsetWidth,
      height: container.offsetHeight
    });
    
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.warn('⚠️ Container has zero dimensions, setting defaults');
      container.style.width = '100%';
      container.style.height = '100%';
    }
    
    // Create globe with error handling
    globeInstance = Globe()(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('lightskyblue')
      .atmosphereAltitude(0.15)
      .width(container.offsetWidth || window.innerWidth)
      .height(container.offsetHeight || window.innerHeight);
    
    console.log('✅ Globe instance created');
    
    // Restore camera position from state
    const camera = window.globeState.get('camera');
    if (camera) {
      globeInstance.pointOfView({
        lat: camera.lat,
        lng: camera.lng,
        altitude: camera.altitude
      }, 0);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup layer controls
    setupLayerControls();
    
    // Setup search
    setupSearch();
    
    // Setup pins
    loadPins();
    
    // Setup hover detection
    setupHoverDetection();
    
    // Setup zoom intelligence
    setupZoomIntelligence();
    
    // Setup research mode toggle
    setupResearchMode();
    
    // Initialize overlay manager
    window.OverlayManager.setGlobe(globeInstance);
    
    // Load smart pins
    window.SmartPinsManager.loadFromState();
    
    // Setup unified panel controls
    setupUnifiedPanel();
    
    // Setup flight tracker
    setupFlightTracker();
    
    // Country labels removed for cleaner globe view
    // addCountryLabels();
    
    isInitialized = true;
    
    // Hide loader after initialization
    setTimeout(() => {
      showLoader(false);
      console.log('✅ Globe initialized successfully');
      console.log('🔬 Advanced features: Zoom Intelligence, Smart Pins, Research Mode, Overlays');
    }, 1500);
    
  } catch (error) {
    console.error('❌ Globe initialization failed:', error);
    showLoader(false);
    showError('Failed to initialize Globe: ' + error.message);
  }
}

// Show error message
function showError(message) {
  const container = document.getElementById('globe-container');
  if (container) {
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: white;
        text-align: center;
        padding: 40px;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h2 style="margin-bottom: 15px;">Globe Module Error</h2>
        <p style="max-width: 500px; line-height: 1.5;">${message}</p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
        ">Reload Module</button>
      </div>
    `;
  }
}

// =======================
// ZOOM INTELLIGENCE SETUP
// =======================

function setupZoomIntelligence() {
  // Track zoom changes continuously
  zoomUpdateInterval = setInterval(() => {
    if (globeInstance) {
      const pov = globeInstance.pointOfView();
      const zoomLevel = window.ZoomIntelligence.updateZoom(pov.altitude, pov.lat, pov.lng);
      
      // Update UI
      updateZoomLevelIndicator(zoomLevel);
      
      // Update smart pins data based on zoom
      window.SmartPinsManager.updateZoomLevel(zoomLevel);
      
      // Update location info based on zoom level
      updateLocationInfoForZoom(pov.lat, pov.lng, zoomLevel);
    }
  }, 1000); // Update every second
  
  // Listen for overlay activation/deactivation
  window.addEventListener('globe:overlay:activate', (e) => {
    const overlayId = e.detail.overlay;
    window.OverlayManager.activateOverlay(overlayId);
  });
  
  window.addEventListener('globe:overlay:deactivate', (e) => {
    const overlayId = e.detail.overlay;
    window.OverlayManager.deactivateOverlay(overlayId);
  });
  
  console.log('🔬 Zoom Intelligence connected to globe');
}

function updateZoomLevelIndicator(level) {
  const indicator = document.getElementById('zoom-level-text');
  if (indicator) {
    const levelName = window.ZoomIntelligence.getLevelName(level);
    const density = window.ZoomIntelligence.getDataDensity(level);
    indicator.textContent = `Zoom: ${levelName} (${density} detail)`;
  }
}

async function updateLocationInfoForZoom(lat, lng, zoomLevel) {
  const infoDiv = document.getElementById('location-info');
  if (!infoDiv) return;
  
  // Get data based on zoom level
  let info = '<h4>Location Information</h4>';
  
  if (zoomLevel >= 2) {
    // Regional data
    const climate = await window.DataAdapters.climate.getClimate(lat, lng);
    info += `<p><strong>Climate:</strong> ${climate.description}</p>`;
  }
  
  if (zoomLevel >= 3) {
    // Local data
    const terrain = await window.DataAdapters.terrain.getTerrain(lat, lng);
    const population = await window.DataAdapters.population.getPopulationDensity(lat, lng);
    
    info += `<p><strong>Terrain:</strong> ${terrain.description}</p>`;
    info += `<p><strong>Population Density:</strong> ${population.category}</p>`;
  }
  
  if (zoomLevel >= 4) {
    // Detail data
    const elevation = await window.DataAdapters.elevation.getElevation(lat, lng);
    info += `<p><strong>Elevation:</strong> ${elevation}m</p>`;
  }
  
  infoDiv.innerHTML = info;
}

// =======================
// RESEARCH MODE SETUP
// =======================

function setupResearchMode() {
  const toggleBtn = document.getElementById('toggle-research-btn');
  const statusDiv = document.getElementById('research-mode-status');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      window.ResearchMode.toggle();
      
      // Update button appearance and status
      if (window.ResearchMode.isActive) {
        toggleBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        toggleBtn.textContent = '🔬 Research Mode (Active)';
        if (statusDiv) {
          statusDiv.textContent = 'Research tools active - click globe for measurements';
          statusDiv.style.opacity = '1';
        }
      } else {
        toggleBtn.style.background = '';
        toggleBtn.textContent = '🔬 Research Mode';
        if (statusDiv) {
          statusDiv.textContent = 'Click to activate advanced measurement tools';
          statusDiv.style.opacity = '0.7';
        }
      }
    });
  }
  
  // Connect research mode to globe clicks
  globeInstance.onGlobeClick((coords) => {
    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
      if (window.ResearchMode.isActive && window.ResearchMode.measurementClickHandler) {
        window.ResearchMode.measurementClickHandler(coords);
      } else {
        handleGlobeClick(coords.lat, coords.lng);
      }
    }
  });
  
  console.log('🔬 Research Mode connected');
}

// =======================
// EVENT LISTENERS
// =======================

function setupEventListeners() {
  // Track camera position
  let lastSaveTime = Date.now();
  
  globeInstance.controls().addEventListener('change', () => {
    const pov = globeInstance.pointOfView();
    currentHoverLat = pov.lat;
    currentHoverLng = pov.lng;
    
    // Throttle state saves (every 2 seconds)
    const now = Date.now();
    if (now - lastSaveTime > 2000) {
      window.globeState.updateCamera({
        lat: pov.lat,
        lng: pov.lng,
        altitude: pov.altitude
      });
      lastSaveTime = now;
    }
  });
  
  // Handle globe clicks (for pin placement)
  globeInstance.onGlobeClick((coords) => {
    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
      handleGlobeClick(coords.lat, coords.lng);
    }
  });
}

// =======================
// HOVER DETECTION
// =======================

function setupHoverDetection() {
  const container = document.getElementById('globe-container');
  
  container.addEventListener('mousemove', (event) => {
    // Get globe coordinates from mouse position
    const coords = getGlobeCoordsFromMouse(event);
    
    if (coords) {
      updateCoordinateDisplay(coords.lat, coords.lng);
      updateLocationInfo(coords.lat, coords.lng);
    }
  });
}

function getGlobeCoordsFromMouse(event) {
  // This is a simplified approach - in production, use proper raycasting
  const pov = globeInstance.pointOfView();
  return { lat: pov.lat, lng: pov.lng };
}

function updateCoordinateDisplay(lat, lng) {
  document.getElementById('lat-display').textContent = `Lat: ${lat.toFixed(4)}°`;
  document.getElementById('lng-display').textContent = `Lng: ${lng.toFixed(4)}°`;
}

function updateLocationInfo(lat, lng) {
  const infoDiv = document.getElementById('location-info');
  
  // Try to find location info
  const location = window.GlobeData.getLocationByCoords(lat, lng);
  
  if (location) {
    if (location.type === 'ocean') {
      const oceanInfo = window.OceanLayer.getOceanInfo(lat, lng);
      if (oceanInfo) {
        infoDiv.innerHTML = `
          <h4>${oceanInfo.name}</h4>
          <p><strong>Area:</strong> ${oceanInfo.data.area}</p>
          <p><strong>Avg Depth:</strong> ${oceanInfo.data.avgDepth}</p>
          <p><strong>Temperature:</strong> ${oceanInfo.data.temperature}</p>
        `;
      }
    } else {
      infoDiv.innerHTML = `
        <h4>${location.name}</h4>
        <p><strong>Population:</strong> ${location.population || 'N/A'}</p>
        <p><strong>Region:</strong> ${location.region || location.country || 'N/A'}</p>
      `;
    }
  } else {
    infoDiv.innerHTML = '<p>Hover over locations to see details</p>';
  }
}

// =======================
// LAYER CONTROLS
// =======================

function setupLayerControls() {
  // Ocean data
  document.getElementById('layer-ocean')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      const opacity = document.getElementById('opacity-ocean').value / 100;
      window.OceanLayer.applyToGlobe(globeInstance, opacity);
    } else {
      window.OceanLayer.removeFromGlobe(globeInstance);
    }
    window.globeState.toggleLayer('ocean');
  });
  
  document.getElementById('opacity-ocean')?.addEventListener('input', (e) => {
    if (document.getElementById('layer-ocean').checked) {
      const opacity = e.target.value / 100;
      window.OceanLayer.applyToGlobe(globeInstance, opacity);
      window.globeState.setLayerOpacity('ocean', opacity);
    }
  });
  
  // Atmosphere
  document.getElementById('layer-atmosphere')?.addEventListener('change', (e) => {
    globeInstance.showAtmosphere(e.target.checked);
    window.globeState.toggleLayer('atmosphere');
  });
  
  // Grid (simplified - just toggle visual indicator)
  document.getElementById('layer-grid')?.addEventListener('change', (e) => {
    // In production, add graticule lines here
    window.globeState.toggleLayer('grid');
    console.log('Grid toggle:', e.target.checked);
  });
  
  // Restore layer states
  const layers = window.globeState.get('layers');
  if (layers) {
    Object.keys(layers).forEach(layerName => {
      const checkbox = document.getElementById(`layer-${layerName}`);
      if (checkbox) {
        checkbox.checked = layers[layerName];
      }
    });
  }
}

// =======================
// SEARCH FUNCTIONALITY
// =======================

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchResults = document.getElementById('search-results');
  
  searchBtn.addEventListener('click', () => {
    performSearch(searchInput.value);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });
}

function performSearch(query) {
  if (!query.trim()) return;
  
  console.log('🔍 Searching for:', query);
  
  const results = window.GlobeData.search(query);
  const searchResults = document.getElementById('search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    return;
  }
  
  searchResults.innerHTML = results.map(result => `
    <div class="search-result-item" onclick="flyToLocation(${result.lat}, ${result.lng}, '${result.name}')">
      <strong>${result.name}</strong>
      <br>
      <small>${result.type === 'country' ? result.region : result.country || result.description || ''}</small>
    </div>
  `).join('');
  
  window.globeState.set('searchResults', results);
}

function flyToLocation(lat, lng, name) {
  console.log('✈️ Flying to:', name);
  
  globeInstance.pointOfView({
    lat: lat,
    lng: lng,
    altitude: 1.5
  }, 2000);
  
  // Show location details after flying
  setTimeout(() => {
    showLocationModal(lat, lng, name);
  }, 2100);
}

// =======================
// PIN MANAGEMENT
// =======================

function handleGlobeClick(lat, lng) {
  console.log('📍 Globe clicked at:', lat, lng);
  showLocationModal(lat, lng);
}

function showLocationModal(lat, lng, name = null) {
  const modal = document.getElementById('pin-modal');
  const location = window.GlobeData.getLocationByCoords(lat, lng);
  
  // Populate modal
  document.getElementById('modal-title').textContent = name || location?.name || 'Unknown Location';
  document.getElementById('modal-coords').textContent = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  document.getElementById('modal-country').textContent = location?.country || location?.name || 'Unknown';
  document.getElementById('modal-region').textContent = location?.region || 'Unknown';
  document.getElementById('modal-population').textContent = location?.population || 'N/A';
  
  if (location?.description) {
    document.getElementById('modal-description').innerHTML = `<p>${location.description}</p>`;
  } else {
    document.getElementById('modal-description').innerHTML = '';
  }
  
  // Show modal
  modal.classList.remove('hidden');
  
  // Setup save pin button
  document.getElementById('save-pin-btn').onclick = () => {
    savePin(lat, lng, name || location?.name || 'Custom Pin');
    modal.classList.add('hidden');
  };
}

function savePin(lat, lng, name) {
  // Create smart pin instead of simple pin
  const smartPin = window.SmartPinsManager.createPin(lat, lng, name);
  
  // Also save to old state for backwards compatibility
  const pin = {
    lat,
    lng,
    name,
    timestamp: new Date().toISOString()
  };
  
  window.globeState.addPin(pin);
  loadPins();
  
  console.log('💾 Smart Pin saved:', name);
}

function loadPins() {
  const pins = window.globeState.get('pins');
  const container = document.getElementById('pins-container');
  
  if (!pins || pins.length === 0) {
    container.innerHTML = '<p style="opacity: 0.7; font-size: 0.9rem;">No saved pins yet</p>';
    return;
  }
  
  container.innerHTML = pins.map(pin => `
    <div class="pin-item">
      <span onclick="flyToLocation(${pin.lat}, ${pin.lng}, '${pin.name}')" style="cursor: pointer;">
        📍 ${pin.name}
      </span>
      <button onclick="deletePin('${pin.id}')">Delete</button>
    </div>
  `).join('');
  
  // Update globe with pin markers
  updatePinMarkers(pins);
}

function deletePin(pinId) {
  window.globeState.removePin(pinId);
  loadPins();
}

function updatePinMarkers(pins) {
  const pinData = pins.map(pin => ({
    lat: pin.lat,
    lng: pin.lng,
    label: pin.name,
    color: 'red',
    size: 30
  }));
  
  globeInstance
    .htmlElementsData(pinData)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.innerHTML = '📍';
      el.style.fontSize = '20px';
      el.style.cursor = 'pointer';
      el.onclick = () => flyToLocation(d.lat, d.lng, d.label);
      return el;
    });
}

// =======================
// MODAL CONTROLS
// =======================

document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('pin-modal').classList.add('hidden');
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
  document.getElementById('pin-modal').classList.add('hidden');
});

// =======================
// LOADER
// =======================

function showLoader(show) {
  const loader = document.getElementById('globe-loader');
  if (show) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

// =======================
// UNIFIED PANEL CONTROLS
// =======================

function setupUnifiedPanel() {
  // Panel collapse toggle
  const toggleBtn = document.getElementById('toggle-panel-btn');
  const panelContent = document.getElementById('panel-content');
  
  if (toggleBtn && panelContent) {
    toggleBtn.addEventListener('click', () => {
      panelContent.classList.toggle('collapsed');
      toggleBtn.textContent = panelContent.classList.contains('collapsed') ? '+' : '−';
    });
  }
  
  // Section toggles
  const sectionToggles = document.querySelectorAll('.section-toggle');
  sectionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const sectionName = toggle.getAttribute('data-section');
      const content = document.getElementById(`${sectionName}-content`);
      
      if (content) {
        content.classList.toggle('collapsed');
        toggle.classList.toggle('active');
      }
    });
  });
  
  console.log('📋 Unified panel controls initialized');
}

// =======================
// COUNTRY LABELS FOR GEOGRAPHIC REFERENCE
// =======================

function addCountryLabels() {
  if (!globeInstance || !window.GlobeData) return;
  
  console.log('🗺️ Adding country labels for geographic reference...');
  
  // Get major countries and cities
  const locations = [
    ...window.GlobeData.countries.map(c => ({ ...c, type: 'country' })),
    ...window.GlobeData.cities.map(c => ({ ...c, type: 'city' }))
  ];
  
  // Add labels to globe
  globeInstance
    .labelsData(locations)
    .labelLat(d => d.lat)
    .labelLng(d => d.lng)
    .labelText(d => d.name)
    .labelSize(d => d.type === 'country' ? 1.5 : 0.8)
    .labelDotRadius(d => d.type === 'country' ? 0.4 : 0.2)
    .labelColor(d => d.type === 'country' ? '#ffeb3b' : '#4fc3f7')
    .labelResolution(2)
    .labelAltitude(0.01);
  
  console.log(`✅ Added ${locations.length} location labels to globe`);
}

// =======================
// FLIGHT TRACKER SETUP
// =======================

function setupFlightTracker() {
  const toggleBtn = document.getElementById('toggle-live-flights-btn');
  const flightCount = document.getElementById('flight-count');
  
  if (!toggleBtn) {
    console.warn('⚠️ Flight toggle button not found');
    return;
  }
  
  // Connect flight tracker to globe
  if (window.FlightTracker) {
    window.FlightTracker.setGlobe(globeInstance);
  }
  
  let isTracking = false;
  
  toggleBtn.addEventListener('click', async () => {
    if (!isTracking) {
      // Start tracking
      toggleBtn.textContent = '⏸️ Stop Live Tracking';
      toggleBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      flightCount.textContent = 'Loading flights...';
      
      try {
        await window.FlightTracker.start();
        isTracking = true;
        
        // Update flight count periodically
        setInterval(() => {
          if (isTracking) {
            const count = window.FlightTracker.getFlightCount();
            flightCount.textContent = `🛫 ${count} live flights tracked`;
          }
        }, 5000);
        
      } catch (error) {
        console.error('❌ Failed to start flight tracking:', error);
        flightCount.textContent = 'Failed to load flights';
        toggleBtn.textContent = '🛫 Start Live Tracking';
        toggleBtn.style.background = '';
      }
    } else {
      // Stop tracking
      window.FlightTracker.stop();
      isTracking = false;
      toggleBtn.textContent = '🛫 Start Live Tracking';
      toggleBtn.style.background = '';
      flightCount.textContent = 'No active flights';
    }
  });
  
  console.log('✈️ Flight tracker UI initialized');
}

// =======================
// MODULE LIFECYCLE HOOKS
// For integration with OmniHub navigation system
// =======================

window.globeModule = {
  onActivate: function() {
    console.log('🌍 Globe module activated');
    
    // Resize globe renderer
    if (globeInstance) {
      globeInstance.width(window.innerWidth);
      globeInstance.height(window.innerHeight);
    }
    
    // Check for highlight item from search
    try {
      const highlightData = localStorage.getItem('omnihub_highlight_item');
      if (highlightData) {
        const highlight = JSON.parse(highlightData);
        
        // Check if it's for this module and recent (within 5 seconds)
        if (highlight.module === 'globe' && (Date.now() - highlight.timestamp < 5000)) {
          console.log('🎯 Highlighting item from search:', highlight);
          
          // Clear the highlight data
          localStorage.removeItem('omnihub_highlight_item');
          
          // Handle different types of highlighting
          if (highlight.data && highlight.data.lat && highlight.data.lon) {
            // Fly to location
            setTimeout(() => {
              if (globeInstance) {
                globeInstance.pointOfView({
                  lat: highlight.data.lat,
                  lng: highlight.data.lon,
                  altitude: 1.5
                }, 2000);
                
                // Show location info after flying
                setTimeout(() => {
                  showLocationModal(
                    highlight.data.lat,
                    highlight.data.lon,
                    highlight.data.name || 'Search Result'
                  );
                }, 2100);
              }
            }, 500);
          } else if (highlight.itemId) {
            // Try to find and highlight existing pin
            const pins = window.globeState.get('pins');
            const pin = pins?.find(p => p.id === highlight.itemId);
            if (pin) {
              setTimeout(() => {
                flyToLocation(pin.lat, pin.lng, pin.name);
              }, 500);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to process highlight data:', e);
    }
  },
  
  onDeactivate: function() {
    console.log('🌍 Globe module deactivated');
    
    // Save current state
    const pov = globeInstance.pointOfView();
    window.globeState.updateCamera({
      lat: pov.lat,
      lng: pov.lng,
      altitude: pov.altitude
    });
  },
  
  getState: function() {
    // Return current state for preservation
    return window.globeState.get();
  },
  
  restoreState: function(state) {
    // Restore state when returning to module
    if (state && state.camera) {
      globeInstance.pointOfView({
        lat: state.camera.lat,
        lng: state.camera.lng,
        altitude: state.camera.altitude
      }, 1000);
    }
  }
};

// =======================
// INITIALIZE ON LOAD
// =======================

// Wait for all dependencies to load with improved error handling
let initAttempts = 0;
const maxAttempts = 10; // Reduced from 20 for faster failure
const retryDelay = 300; // Reduced from 500ms

function tryInitialize() {
  initAttempts++;
  
  console.log(`🔄 Initialization attempt ${initAttempts}/${maxAttempts}`);
  
  if (checkDependencies()) {
    console.log('✅ All dependencies loaded, initializing Globe...');
    initGlobe();
  } else if (initAttempts < maxAttempts) {
    console.log(`⏳ Waiting for dependencies... (retry in ${retryDelay}ms)`);
    setTimeout(tryInitialize, retryDelay);
  } else {
    const errorMsg = `Failed to load required libraries after ${maxAttempts} attempts. This usually means:\n` +
                     '1. Library files are missing from libs/ folder\n' +
                     '2. Scripts are blocked by CSP/security settings\n' +
                     '3. File paths are incorrect\n\n' +
                     'Check the browser console for specific missing dependencies.';
    console.error('❌', errorMsg);
    showError(errorMsg);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, starting Globe initialization...');
    tryInitialize();
  });
} else {
  console.log('📄 DOM already loaded, starting Globe initialization...');
  tryInitialize();
}

// Handle window resize
window.addEventListener('resize', () => {
  if (globeInstance && isInitialized) {
    const container = document.getElementById('globe-container');
    if (container) {
      globeInstance.width(container.offsetWidth);
      globeInstance.height(container.offsetHeight);
    }
  }
});

// Debug: Log when script loads
console.log('🌍 Globe Module script loaded');
console.log('📍 Document state:', document.readyState);
