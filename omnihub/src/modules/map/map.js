// =======================
// MAP MODULE - OMNIHUB
// IMPROVED VERSION WITH LOADING & ERROR HANDLING
// =======================

// Configuration - Check if config.js exists, otherwise use defaults
let WEATHER_API_KEY = '8c7560db67d91f1f14a8f0a35203c33c';
let MAP_CONFIG = {
  initialCenter: [115.8605, -31.9505], // Perth, Australia
  initialZoom: 12, // Bigger zoom for better initial view
  minZoom: 2,
  maxZoom: 19,
  streetTileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satelliteTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  nominatimUrl: 'https://nominatim.openstreetmap.org',
  osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
  weatherTileUrl: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png',
  geocodingDelay: 500,
  pinsStorageKey: 'omnihub_map_pins',
  enableDebugLogging: true
};

// Global variables
let map;
let streetLayer;
let satelliteLayer;
let terrainLayer;
let hybridLayer;
let weatherLayer;
let currentLayer = 'street';
let pins = [];
let vectorSource;
let vectorLayer;
let routeSource;
let routeLayer;
let routingMode = false;
let routePoints = [];
let tempPinCoords = null;
let isInitialized = false;

// =======================
// LOADING & ERROR HANDLING
// =======================

function updateLoadingStatus(message) {
  const statusEl = document.getElementById('loading-status');
  if (statusEl) {
    statusEl.textContent = message;
  }
  if (MAP_CONFIG.enableDebugLogging) {
    console.log('🔄', message);
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 200);
  }
}

function showError(message, details = '') {
  console.error('❌ Map Error:', message, details);
  
  const errorScreen = document.getElementById('error-screen');
  const errorMessage = document.getElementById('error-message');
  const loadingScreen = document.getElementById('loading-screen');
  
  if (errorScreen && errorMessage) {
    errorMessage.textContent = message;
    if (loadingScreen) loadingScreen.style.display = 'none';
    errorScreen.style.display = 'flex';
  }
}

// =======================
// INITIALIZATION
// =======================

function initModule(container) {
  try {
    console.log('🗺️ =================================');
    console.log('🗺️ OMNIHUB MAP MODULE INITIALIZING');
    console.log('🗺️ =================================');
    
    updateLoadingStatus('Checking OpenLayers...');
    
    // Check if OpenLayers is loaded
    if (typeof ol === 'undefined') {
      throw new Error('OpenLayers library not loaded. Check CDN connection.');
    }
    console.log('✅ OpenLayers library loaded');
    
    updateLoadingStatus('Loading saved pins...');
    loadPinsFromStorage();
    console.log(`✅ Loaded ${pins.length} saved pins`);
    
    updateLoadingStatus('Creating map...');
    initMap();
    
    updateLoadingStatus('Setting up controls...');
    setupEventListeners();
    console.log('✅ Event listeners ready');
    
    // Mark as initialized
    isInitialized = true;
    
    // Hide loading screen immediately (removed artificial delay)
    setTimeout(() => {
      hideLoadingScreen();
      console.log('🎉 =================================');
      console.log('🎉 MAP MODULE READY!');
      console.log('🎉 Move cursor to see coordinates');
      console.log('🎉 =================================');
    }, 200);
    
  } catch (error) {
    showError('Failed to initialize map module', error.message);
    throw error;
  }
}

function initMap() {
  try {
    console.log('🔧 Creating map layers...');
    
    // Create street layer (OpenStreetMap) - reduced preload for faster startup
    streetLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous'
      }),
      visible: true,
      preload: 1
    });
    console.log('✅ Street layer created');
    
    // Create satellite layer (ESRI World Imagery) - reduced preload for faster startup
    satelliteLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: MAP_CONFIG.satelliteTileUrl,
        maxZoom: 19,
        crossOrigin: 'anonymous'
      }),
      visible: false,
      preload: 0
    });
    console.log('✅ Satellite layer created');
    
    // Create terrain layer (Stamen Terrain)
    terrainLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://stamen-tiles-{a-d}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
        maxZoom: 18,
        crossOrigin: 'anonymous'
      }),
      visible: false,
      preload: 0
    });
    console.log('✅ Terrain layer created');
    
    // Create hybrid layer (Satellite with labels)
    hybridLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        maxZoom: 20,
        crossOrigin: 'anonymous'
      }),
      visible: false,
      preload: 0
    });
    console.log('✅ Hybrid layer created');
    
    // Create vector source and layer for pins
    vectorSource = new ol.source.Vector();
    vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: createPinStyle(),
      zIndex: 10
    });
    console.log('✅ Pin layer created');
    
    // Create route source and layer
    routeSource = new ol.source.Vector();
    routeLayer = new ol.layer.Vector({
      source: routeSource,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#667eea',
          width: 4
        })
      }),
      zIndex: 5
    });
    console.log('✅ Route layer created');
    
    // Get map container
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      throw new Error('Map container #map not found');
    }
    
    console.log('🌍 Creating map instance...');
    
    // Initialize map with Perth, Australia
    map = new ol.Map({
      target: 'map',
      layers: [streetLayer, satelliteLayer, terrainLayer, hybridLayer, vectorLayer, routeLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(MAP_CONFIG.initialCenter),
        zoom: MAP_CONFIG.initialZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        minZoom: MAP_CONFIG.minZoom
      }),
      controls: ol.control.defaults.defaults({
        attribution: true,
        zoom: true,
        rotate: false
      }).extend([
        new ol.control.ScaleLine(),
        new ol.control.Zoom({
          zoomInTipLabel: 'Zoom in',
          zoomOutTipLabel: 'Zoom out'
        })
      ])
    });
    
    console.log('✅ Map instance created');
    console.log('📍 Starting location: Perth, Australia');
    console.log('🔍 Zoom level:', MAP_CONFIG.initialZoom);
    
    // Setup location search
    setupLocationSearch();
    
    // Mark street view as active
    document.getElementById('street-view-btn').classList.add('active');
    
    // Load existing pins on map
    loadPinsOnMap();
    
    // Mouse move event for coordinate display
    map.on('pointermove', function(evt) {
      const coords = ol.proj.toLonLat(evt.coordinate);
      cursorCoords = coords; // Store for spacebar pin
      updateCoordinateDisplay(coords[1], coords[0]);
    });
    
    // Click event for adding pins or routing
    map.on('click', function(evt) {
      if (routingMode) {
        handleRoutingClick(evt.coordinate);
      }
    });
    
    // Spacebar to add pin at current cursor position
    document.addEventListener('keydown', function(e) {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        addPinAtCursor();
      }
    });
    
    // Log when map is fully loaded
    map.once('postrender', function() {
      console.log('🎨 Map fully rendered!');
      
      // Force update size
      setTimeout(() => {
        map.updateSize();
        console.log('📐 Map size updated:', map.getSize());
      }, 100);
    });
    
    // Check for tile loading errors
    streetLayer.getSource().on('tileloaderror', function() {
      console.warn('⚠️ Street tile failed to load (this is normal for some tiles)');
    });
    
    satelliteLayer.getSource().on('tileloaderror', function() {
      console.warn('⚠️ Satellite tile failed to load (this is normal for some tiles)');
    });
    
  } catch (error) {
    console.error('❌ Map initialization error:', error);
    throw error;
  }
}

function createPinStyle() {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg width="30" height="40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M15 0 C7 0 0 7 0 15 C0 25 15 40 15 40 S30 25 30 15 C30 7 23 0 15 0 Z" 
                fill="url(#grad)" stroke="white" stroke-width="2"/>
          <circle cx="15" cy="15" r="5" fill="white"/>
        </svg>
      `),
      scale: 1
    })
  });
}

// =======================
// EVENT LISTENERS
// =======================

function setupEventListeners() {
  // View toggle buttons
  document.getElementById('street-view-btn').addEventListener('click', () => switchLayer('street'));
  document.getElementById('satellite-view-btn').addEventListener('click', () => switchLayer('satellite'));
  
  // Weather overlay
  document.getElementById('weather-btn').addEventListener('click', toggleWeatherLayer);
  
  // Routing
  document.getElementById('routing-btn').addEventListener('click', toggleRoutingMode);
  document.getElementById('clear-route-btn').addEventListener('click', clearRoute);
  document.getElementById('close-routing-btn').addEventListener('click', toggleRoutingMode);
  
  // Pin management
  document.getElementById('add-pin-btn').addEventListener('click', addPinAtCenter);
  document.getElementById('pins-list-btn').addEventListener('click', showPinsList);
  document.getElementById('save-pin-btn').addEventListener('click', savePin);
  document.getElementById('cancel-pin-btn').addEventListener('click', closePinModal);
  document.getElementById('close-pins-btn').addEventListener('click', closePinsModal);
}

// =======================
// LAYER SWITCHING
// =======================

function switchLayer(layerType) {
  if (layerType === 'street') {
    streetLayer.setVisible(true);
    satelliteLayer.setVisible(false);
    currentLayer = 'street';
    document.getElementById('street-view-btn').classList.add('active');
    document.getElementById('satellite-view-btn').classList.remove('active');
    console.log('🗺️ Switched to Street View');
  } else if (layerType === 'satellite') {
    streetLayer.setVisible(false);
    satelliteLayer.setVisible(true);
    currentLayer = 'satellite';
    document.getElementById('satellite-view-btn').classList.add('active');
    document.getElementById('street-view-btn').classList.remove('active');
    console.log('🛰️ Switched to Satellite View');
  }
}

// =======================
// COORDINATE DISPLAY
// =======================

function updateCoordinateDisplay(lat, lon) {
  const coordDisplay = document.getElementById('coord-display');
  coordDisplay.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  
  // Debounced reverse geocoding
  if (updateCoordinateDisplay.timeout) {
    clearTimeout(updateCoordinateDisplay.timeout);
  }
  
  updateCoordinateDisplay.timeout = setTimeout(() => {
    reverseGeocode(lat, lon);
  }, MAP_CONFIG.geocodingDelay);
}

function reverseGeocode(lat, lon) {
  const addressDisplay = document.getElementById('address-display');
  addressDisplay.textContent = 'Loading address...';
  
  const url = `${MAP_CONFIG.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  
  fetch(url, {
    headers: { 'User-Agent': 'OmniHub Map Module' }
  })
    .then(response => response.json())
    .then(data => {
      if (data.display_name) {
        addressDisplay.textContent = data.display_name;
      } else {
        addressDisplay.textContent = 'Address not found';
      }
    })
    .catch(error => {
      console.error('Geocoding error:', error);
      addressDisplay.textContent = 'Unable to load address';
    });
}

// =======================
// WEATHER OVERLAY
// =======================

function toggleWeatherLayer() {
  const btn = document.getElementById('weather-btn');
  
  if (!weatherLayer) {
    if (WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
      alert('⚠️ Weather Overlay Setup Required\n\n1. Get a FREE API key from: https://openweathermap.org/api\n2. Open: src/modules/map/config.js\n3. Replace YOUR_API_KEY_HERE with your key\n4. Reload the page\n\nThe weather feature will then work!');
      console.log('ℹ️ Weather API key not configured');
      return;
    }
    
    weatherLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: `${MAP_CONFIG.weatherTileUrl}?appid=${WEATHER_API_KEY}`,
        maxZoom: 19
      }),
      opacity: 0.6,
      visible: false
    });
    
    map.addLayer(weatherLayer);
    console.log('✅ Weather layer created');
  }
  
  const isVisible = weatherLayer.getVisible();
  weatherLayer.setVisible(!isVisible);
  
  if (!isVisible) {
    btn.classList.add('active');
    console.log('☁️ Weather overlay enabled');
  } else {
    btn.classList.remove('active');
    console.log('☁️ Weather overlay disabled');
  }
}

// =======================
// PIN MANAGEMENT
// =======================

// Track cursor position
let cursorCoords = null;

function addPinAtCenter() {
  const center = map.getView().getCenter();
  const coords = ol.proj.toLonLat(center);
  
  tempPinCoords = { lat: coords[1], lon: coords[0] };
  console.log('📍 Adding pin at:', tempPinCoords);
  showPinModal();
}

// Add pin at cursor position (spacebar)
function addPinAtCursor() {
  if (!cursorCoords) {
    // Fallback to center if no cursor position
    addPinAtCenter();
    return;
  }
  
  tempPinCoords = { lat: cursorCoords[1], lon: cursorCoords[0] };
  console.log('📍 Spacebar - Adding pin at cursor:', tempPinCoords);
  
  // Show quick pin info panel with all location data
  showQuickPinInfo(tempPinCoords);
}

function showPinModal() {
  document.getElementById('pin-modal').classList.add('active');
  document.getElementById('pin-name').value = '';
  document.getElementById('pin-description').value = '';
  document.getElementById('pin-name').focus();
}

// Quick pin info with auto-populated data
async function showQuickPinInfo(coords) {
  const modal = document.getElementById('pin-modal');
  const nameInput = document.getElementById('pin-name');
  const descInput = document.getElementById('pin-description');
  
  modal.classList.add('active');
  
  // Show coordinates immediately
  nameInput.value = 'Loading location...';
  descInput.value = `📍 Coordinates: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}\n📏 Altitude: Fetching...\n🌍 Location: Fetching...`;
  
  // Fetch location details
  try {
    const url = `${MAP_CONFIG.nominatimUrl}/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OmniHub Map Module' }
    });
    const data = await response.json();
    
    if (data.display_name) {
      // Auto-populate with location name
      const shortName = data.display_name.split(',')[0];
      nameInput.value = shortName;
      
      // Build detailed description
      const address = data.address || {};
      let details = `📍 Coordinates: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}\n`;
      details += `🌍 Location: ${data.display_name}\n`;
      if (address.road) details += `🛣️ Road: ${address.road}\n`;
      if (address.city || address.town || address.village) details += `🏙️ City: ${address.city || address.town || address.village}\n`;
      if (address.state) details += `🗺️ State: ${address.state}\n`;
      if (address.country) details += `🌐 Country: ${address.country}\n`;
      if (address.postcode) details += `📮 Postcode: ${address.postcode}`;
      
      descInput.value = details;
    }
  } catch (e) {
    console.error('Quick pin fetch error:', e);
    descInput.value = `📍 Coordinates: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}\n(Location details unavailable)`;
  }
  
  nameInput.focus();
  nameInput.select();
}

function closePinModal() {
  document.getElementById('pin-modal').classList.remove('active');
  tempPinCoords = null;
}

function savePin() {
  const name = document.getElementById('pin-name').value.trim();
  const description = document.getElementById('pin-description').value.trim();
  
  if (!name) {
    alert('Please enter a pin name');
    return;
  }
  
  const pin = {
    id: Date.now().toString(),
    name,
    description,
    lat: tempPinCoords.lat,
    lon: tempPinCoords.lon,
    createdAt: new Date().toISOString()
  };
  
  pins.push(pin);
  savePinsToStorage();
  addPinToMap(pin);
  closePinModal();
  console.log('✅ Pin saved:', pin.name);
}

function addPinToMap(pin) {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([pin.lon, pin.lat])),
    pinId: pin.id,
    pinName: pin.name
  });
  vectorSource.addFeature(feature);
}

function loadPinsOnMap() {
  vectorSource.clear();
  pins.forEach(pin => addPinToMap(pin));
}

function deletePin(pinId) {
  pins = pins.filter(p => p.id !== pinId);
  savePinsToStorage();
  loadPinsOnMap();
  showPinsList();
  console.log('🗑️ Pin deleted');
}

function flyToPin(pin) {
  const view = map.getView();
  view.animate({
    center: ol.proj.fromLonLat([pin.lon, pin.lat]),
    zoom: 15,
    duration: 1000
  });
  closePinsModal();
  console.log('✈️ Flying to:', pin.name);
}

// =======================
// PINS LIST
// =======================

function showPinsList() {
  const container = document.getElementById('pins-list-container');
  container.innerHTML = '';
  
  if (pins.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center;">No saved pins yet</p>';
  } else {
    pins.forEach(pin => {
      const pinItem = document.createElement('div');
      pinItem.className = 'pin-item';
      pinItem.innerHTML = `
        <div class="pin-item-header">
          <div class="pin-item-name">${pin.name}</div>
          <div class="pin-item-actions">
            <button class="pin-action-btn" onclick="flyToPin(${JSON.stringify(pin).replace(/"/g, '&quot;')})">Go To</button>
            <button class="pin-action-btn delete" onclick="deletePin('${pin.id}')">Delete</button>
          </div>
        </div>
        <div class="pin-item-coords">${pin.lat.toFixed(6)}, ${pin.lon.toFixed(6)}</div>
        ${pin.description ? `<div class="pin-item-description">${pin.description}</div>` : ''}
      `;
      container.appendChild(pinItem);
    });
  }
  
  document.getElementById('pins-modal').classList.add('active');
}

function closePinsModal() {
  document.getElementById('pins-modal').classList.remove('active');
}

// =======================
// LOCAL STORAGE
// =======================

function savePinsToStorage() {
  try {
    localStorage.setItem(MAP_CONFIG.pinsStorageKey, JSON.stringify(pins));
  } catch (error) {
    console.error('Failed to save pins:', error);
  }
}

function loadPinsFromStorage() {
  try {
    const stored = localStorage.getItem(MAP_CONFIG.pinsStorageKey);
    if (stored) {
      pins = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load pins:', error);
    pins = [];
  }
}

// =======================
// ROUTING
// =======================

function toggleRoutingMode() {
  routingMode = !routingMode;
  const btn = document.getElementById('routing-btn');
  const panel = document.getElementById('routing-panel');
  
  if (routingMode) {
    btn.classList.add('active');
    panel.style.display = 'block';
    clearRoute();
    console.log('🛣️ Routing mode enabled');
  } else {
    btn.classList.remove('active');
    panel.style.display = 'none';
    clearRoute();
  }
}

function handleRoutingClick(coordinate) {
  if (routePoints.length < 2) {
    routePoints.push(coordinate);
    
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(coordinate)
    });
    marker.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: routePoints.length === 1 ? '#10b981' : '#ef4444' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
      })
    }));
    routeSource.addFeature(marker);
    
    console.log(`📍 Route point ${routePoints.length} added`);
    
    if (routePoints.length === 2) {
      calculateRoute();
    }
  }
}

function calculateRoute() {
  const start = ol.proj.toLonLat(routePoints[0]);
  const end = ol.proj.toLonLat(routePoints[1]);
  
  console.log('🔄 Calculating route...');
  
  const url = `${MAP_CONFIG.osrmUrl}/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(coord => ol.proj.fromLonLat(coord));
        
        const routeLine = new ol.Feature({
          geometry: new ol.geom.LineString(coords)
        });
        
        routeSource.addFeature(routeLine);
        
        const distance = (route.distance / 1000).toFixed(2);
        const duration = Math.round(route.duration / 60);
        
        document.getElementById('route-distance').textContent = `${distance} km`;
        document.getElementById('route-duration').textContent = `${duration} min`;
        document.getElementById('route-details').style.display = 'block';
        
        const extent = routeLine.getGeometry().getExtent();
        map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
        
        console.log(`✅ Route calculated: ${distance} km, ${duration} min`);
      } else {
        alert('Route not found');
      }
    })
    .catch(error => {
      console.error('Routing error:', error);
      alert('Failed to calculate route');
    });
}

function clearRoute() {
  routePoints = [];
  routeSource.clear();
  document.getElementById('route-details').style.display = 'none';
}

// =======================
// MODULE EXPORTS
// =======================

function getPinsData() {
  return pins.map(pin => ({
    id: pin.id,
    name: pin.name,
    description: pin.description,
    lat: pin.lat,
    lon: pin.lon,
    createdAt: pin.createdAt
  }));
}

// Make functions globally available
window.flyToPin = flyToPin;
window.deletePin = deletePin;

// =======================
// MODULE LIFECYCLE HOOKS
// =======================
window.mapModule = {
  onActivate: () => {
    console.log('🗺️ Map module activated');
    // Force map to update size when activated
    if (map && isInitialized) {
      setTimeout(() => {
        map.updateSize();
        console.log('📐 Map size updated on activation');
      }, 100);
    }
  },
  
  onDeactivate: () => {
    console.log('🗺️ Map module deactivated');
    // Save any pending changes
    if (pins.length > 0) {
      savePinsToStorage();
    }
  },
  
  getState: () => {
    // Return current map state for preservation
    return {
      center: map ? map.getView().getCenter() : null,
      zoom: map ? map.getView().getZoom() : null,
      pins: pins,
      currentLayer: currentLayer
    };
  },
  
  restoreState: (state) => {
    // Restore map state
    console.log('🔄 Restoring map state...');
    if (state && map) {
      if (state.center) {
        map.getView().setCenter(state.center);
      }
      if (state.zoom) {
        map.getView().setZoom(state.zoom);
      }
      if (state.currentLayer && state.currentLayer !== currentLayer) {
        switchLayer(state.currentLayer);
      }
    }
  }
};

// =======================
// LOCATION SEARCH
// =======================
let searchTimeout = null;

function setupLocationSearch() {
  const searchInput = document.getElementById('location-search');
  const searchBtn = document.getElementById('search-btn');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchBtn) {
    console.warn('⚠️ Search elements not found');
    return;
  }
  
  // Search on button click
  searchBtn.addEventListener('click', () => {
    performLocationSearch(searchInput.value);
  });
  
  // Search on Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performLocationSearch(searchInput.value);
    }
  });
  
  // Live search with debounce
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    
    if (query.length < 3) {
      searchResults.classList.add('hidden');
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performLocationSearch(query);
    }, 500);
  });
  
  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-panel')) {
      searchResults.classList.add('hidden');
    }
  });
  
  console.log('🔍 Location search initialized');
}

async function performLocationSearch(query) {
  if (!query || query.trim().length < 2) return;
  
  const searchResults = document.getElementById('search-results');
  
  try {
    const url = `${MAP_CONFIG.nominatimUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OmniHub-Map/1.0' }
    });
    
    const results = await response.json();
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item"><div class="result-name">No results found</div></div>';
      searchResults.classList.remove('hidden');
      return;
    }
    
    searchResults.innerHTML = '';
    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="result-name">${result.display_name.split(',')[0]}</div>
        <div class="result-address">${result.display_name}</div>
      `;
      
      item.addEventListener('click', () => {
        goToLocation(parseFloat(result.lon), parseFloat(result.lat), result.display_name);
        searchResults.classList.add('hidden');
        document.getElementById('location-search').value = result.display_name.split(',')[0];
      });
      
      searchResults.appendChild(item);
    });
    
    searchResults.classList.remove('hidden');
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<div class="search-result-item"><div class="result-name">Search failed</div></div>';
    searchResults.classList.remove('hidden');
  }
}

function goToLocation(lon, lat, name) {
  if (!map) return;
  
  const view = map.getView();
  view.animate({
    center: ol.proj.fromLonLat([lon, lat]),
    zoom: 14,
    duration: 1000
  });
  
  console.log(`📍 Navigated to: ${name}`);
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initModule());
} else {
  initModule();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initModule, getPinsData, goToLocation };
}