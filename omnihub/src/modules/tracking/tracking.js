let trackingData = [];

export function initModule(container) {
  const statusEl = container.querySelector('#tracking-status');
  const logList = container.querySelector('#log-list');

  // Example: placeholder for new tracking data
  function addTrackingPoint(lat, lon, source="Device") {
    const id = trackingData.length;
    const point = { id, lat, lon, source, timestamp: new Date() };
    trackingData.push(point);

    // Update status and log
    statusEl.innerText = `Last point: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    const li = document.createElement('li');
    li.innerText = `[${point.timestamp.toLocaleTimeString()}] ${source} at ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    logList.appendChild(li);

    // Future: plot on map
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
