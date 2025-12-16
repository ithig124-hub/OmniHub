// =======================
// MAP MODULE CONFIGURATION
// =======================

// Weather API Configuration
// Get a free API key from: https://openweathermap.org/api
// After getting your key, replace 'YOUR_API_KEY_HERE' below
const WEATHER_API_KEY = '8c7560db67d91f1f14a8f0a35203c33c';

// Map Configuration
const MAP_CONFIG = {
  // Initial map center (New York City)
  initialCenter: [-74.006, 40.7128],
  initialZoom: 12,
  
  // Tile URLs
  streetTileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satelliteTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  
  // API Endpoints
  nominatimUrl: 'https://nominatim.openstreetmap.org/reverse',
  osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
  weatherTileUrl: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png',
  
  // Debounce delays (ms)
  geocodingDelay: 500,
  
  // LocalStorage keys
  pinsStorageKey: 'omnihub_map_pins',
  
  // Feature flags
  enableWeather: true,
  enableTraffic: false, // Not yet implemented
  enableDebugLogging: true
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WEATHER_API_KEY, MAP_CONFIG };
}