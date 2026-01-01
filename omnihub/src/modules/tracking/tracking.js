let trackingData = [];
const STORAGE_KEY = 'omnihub_tracking_data';

// Load tracking data from localStorage on init
function loadTrackingData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load tracking data:', error);
    return [];
  }
}

function saveTrackingData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackingData));
  } catch (error) {
    console.error('Failed to save tracking data:', error);
  }
}

// Initialize from storage
trackingData = loadTrackingData();

export function initModule(container) {
  const statusEl = container.querySelector('#tracking-status');
  const logList = container.querySelector('#log-list');

  // Example: placeholder for new tracking data
  function addTrackingPoint(lat, lon, source="Device") {
    const id = `track_${Date.now()}`;
    const point = { id, lat, lon, source, timestamp: new Date().toISOString() };
    trackingData.push(point);
    
    // Save to localStorage
    saveTrackingData();

    // Update status and log
    statusEl.innerText = `Last point: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    const li = document.createElement('li');
    li.innerText = `[${new Date(point.timestamp).toLocaleTimeString()}] ${source} at ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    logList.appendChild(li);

    // Future: plot on map
    console.log('📍 Tracking point added:', point);
  }

  // Example: add a test point every 5 seconds
  setInterval(() => {
    const lat = 37.7749 + Math.random() * 0.01;
    const lon = -122.4194 + Math.random() * 0.01;
    addTrackingPoint(lat, lon, "Test Device");
  }, 5000);
}

// Export function to provide data to search module later
export function getTrackingData() {
  return trackingData;
}