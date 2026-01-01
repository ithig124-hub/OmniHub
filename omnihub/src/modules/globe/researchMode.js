// =======================
// RESEARCH MODE
// Advanced tools for measurement, analysis, and data export
// =======================

class ResearchMode {
  constructor() {
    this.isActive = false;
    this.measurementTool = null;
    this.lockedCoordinates = [];
    this.measurements = [];
    this.comparisonPoints = [];
  }
  
  // Activate research mode
  activate() {
    this.isActive = true;
    console.log('🔬 Research Mode activated');
    
    // Show research tools UI
    this.showResearchUI();
    
    // Enable measurement tools
    this.enableMeasurementTools();
    
    // Update state
    window.globeState?.set('researchMode', true);
  }
  
  // Deactivate research mode
  deactivate() {
    this.isActive = false;
    console.log('🔬 Research Mode deactivated');
    
    // Hide research tools UI
    this.hideResearchUI();
    
    // Disable measurement tools
    this.disableMeasurementTools();
    
    window.globeState?.set('researchMode', false);
  }
  
  // Toggle research mode
  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }
  
  // Show research UI
  showResearchUI() {
    let researchPanel = document.getElementById('research-mode-panel');
    
    if (!researchPanel) {
      researchPanel = document.createElement('div');
      researchPanel.id = 'research-mode-panel';
      researchPanel.className = 'glass-panel research-mode-panel';
      researchPanel.innerHTML = `
        <h3>🔬 Research Tools</h3>
        <div class="research-tools">
          <button id="tool-distance" class="tool-btn">📏 Measure Distance</button>
          <button id="tool-area" class="tool-btn">📐 Measure Area</button>
          <button id="tool-lock" class="tool-btn">🔒 Lock Coordinates</button>
          <button id="tool-compare" class="tool-btn">⚖️ Compare Points</button>
          <button id="tool-export" class="tool-btn">💾 Export Data</button>
        </div>
        <div id="research-results">
          <h4>Measurements</h4>
          <div id="measurements-list"></div>
        </div>
        <div id="locked-coords">
          <h4>Locked Coordinates</h4>
          <div id="locked-coords-list"></div>
        </div>
      `;
      
      document.body.appendChild(researchPanel);
      
      // Setup tool button listeners
      this.setupToolListeners();
    }
    
    researchPanel.style.display = 'block';
  }
  
  // Hide research UI
  hideResearchUI() {
    const researchPanel = document.getElementById('research-mode-panel');
    if (researchPanel) {
      researchPanel.style.display = 'none';
    }
  }
  
  // Setup tool button listeners
  setupToolListeners() {
    document.getElementById('tool-distance')?.addEventListener('click', () => {
      this.startDistanceMeasurement();
    });
    
    document.getElementById('tool-area')?.addEventListener('click', () => {
      this.startAreaMeasurement();
    });
    
    document.getElementById('tool-lock')?.addEventListener('click', () => {
      this.lockCurrentCoordinates();
    });
    
    document.getElementById('tool-compare')?.addEventListener('click', () => {
      this.startComparison();
    });
    
    document.getElementById('tool-export')?.addEventListener('click', () => {
      this.exportResearchData();
    });
  }
  
  // Enable measurement tools
  enableMeasurementTools() {
    // Add click listener for measurements
    this.measurementClickHandler = (coords) => {
      if (this.measurementTool === 'distance' && coords) {
        this.addDistancePoint(coords.lat, coords.lng);
      } else if (this.measurementTool === 'area' && coords) {
        this.addAreaPoint(coords.lat, coords.lng);
      }
    };
  }
  
  // Disable measurement tools
  disableMeasurementTools() {
    this.measurementTool = null;
    this.measurementClickHandler = null;
  }
  
  // Start distance measurement
  startDistanceMeasurement() {
    this.measurementTool = 'distance';
    this.comparisonPoints = [];
    console.log('📏 Distance measurement started. Click two points on globe.');
    this.showMessage('Click two points to measure distance');
  }
  
  // Add distance point
  addDistancePoint(lat, lng) {
    this.comparisonPoints.push({ lat, lng });
    
    if (this.comparisonPoints.length === 2) {
      const distance = this.calculateDistance(
        this.comparisonPoints[0].lat,
        this.comparisonPoints[0].lng,
        this.comparisonPoints[1].lat,
        this.comparisonPoints[1].lng
      );
      
      const measurement = {
        type: 'distance',
        points: [...this.comparisonPoints],
        value: distance,
        unit: 'km',
        timestamp: new Date().toISOString()
      };
      
      this.measurements.push(measurement);
      this.displayMeasurement(measurement);
      
      console.log(`📏 Distance: ${distance.toFixed(2)} km`);
      this.showMessage(`Distance: ${distance.toFixed(2)} km`);
      
      // Reset
      this.comparisonPoints = [];
      this.measurementTool = null;
    }
  }
  
  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Start area measurement
  startAreaMeasurement() {
    this.measurementTool = 'area';
    this.comparisonPoints = [];
    console.log('📐 Area measurement started. Click points to form polygon.');
    this.showMessage('Click points to form polygon. Double-click to finish.');
  }
  
  // Add area point
  addAreaPoint(lat, lng) {
    this.comparisonPoints.push({ lat, lng });
    console.log(`📐 Point ${this.comparisonPoints.length} added`);
  }
  
  // Calculate area
  finishAreaMeasurement() {
    if (this.comparisonPoints.length < 3) {
      this.showMessage('Need at least 3 points for area measurement');
      return;
    }
    
    const area = this.calculatePolygonArea(this.comparisonPoints);
    
    const measurement = {
      type: 'area',
      points: [...this.comparisonPoints],
      value: area,
      unit: 'km²',
      timestamp: new Date().toISOString()
    };
    
    this.measurements.push(measurement);
    this.displayMeasurement(measurement);
    
    console.log(`📐 Area: ${area.toFixed(2)} km²`);
    this.showMessage(`Area: ${area.toFixed(2)} km²`);
    
    this.comparisonPoints = [];
    this.measurementTool = null;
  }
  
  // Calculate polygon area
  calculatePolygonArea(points) {
    // Simplified area calculation
    // In production, use proper spherical geometry
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    area = Math.abs(area / 2);
    
    // Convert to km² (very rough approximation)
    const kmPerDegree = 111;
    return area * kmPerDegree * kmPerDegree;
  }
  
  // Lock current coordinates
  lockCurrentCoordinates() {
    const pov = window.globeInstance?.pointOfView();
    if (pov) {
      const locked = {
        lat: pov.lat,
        lng: pov.lng,
        altitude: pov.altitude,
        timestamp: new Date().toISOString()
      };
      
      this.lockedCoordinates.push(locked);
      this.displayLockedCoordinate(locked);
      
      console.log('🔒 Coordinates locked:', locked);
      this.showMessage('Coordinates locked');
    }
  }
  
  // Display locked coordinate
  displayLockedCoordinate(coord) {
    const list = document.getElementById('locked-coords-list');
    if (list) {
      const item = document.createElement('div');
      item.className = 'locked-coord-item';
      item.innerHTML = `
        <div>
          <strong>Lat:</strong> ${coord.lat.toFixed(4)}°<br>
          <strong>Lng:</strong> ${coord.lng.toFixed(4)}°<br>
          <strong>Alt:</strong> ${coord.altitude.toFixed(2)}
        </div>
        <button onclick="window.ResearchMode.removeLockedCoord(${this.lockedCoordinates.length - 1})">Remove</button>
      `;
      list.appendChild(item);
    }
  }
  
  // Remove locked coordinate
  removeLockedCoord(index) {
    this.lockedCoordinates.splice(index, 1);
    this.refreshLockedCoordsList();
  }
  
  // Refresh locked coordinates list
  refreshLockedCoordsList() {
    const list = document.getElementById('locked-coords-list');
    if (list) {
      list.innerHTML = '';
      this.lockedCoordinates.forEach((coord, index) => {
        this.displayLockedCoordinate(coord);
      });
    }
  }
  
  // Display measurement
  displayMeasurement(measurement) {
    const list = document.getElementById('measurements-list');
    if (list) {
      const item = document.createElement('div');
      item.className = 'measurement-item';
      item.innerHTML = `
        <div>
          <strong>${measurement.type}:</strong> ${measurement.value.toFixed(2)} ${measurement.unit}
        </div>
        <button onclick="window.ResearchMode.removeMeasurement(${this.measurements.length - 1})">Remove</button>
      `;
      list.appendChild(item);
    }
  }
  
  // Remove measurement
  removeMeasurement(index) {
    this.measurements.splice(index, 1);
    this.refreshMeasurementsList();
  }
  
  // Refresh measurements list
  refreshMeasurementsList() {
    const list = document.getElementById('measurements-list');
    if (list) {
      list.innerHTML = '';
      this.measurements.forEach((m, i) => {
        this.displayMeasurement(m);
      });
    }
  }
  
  // Start comparison mode
  startComparison() {
    console.log('⚖️ Comparison mode activated');
    this.showMessage('Select pins to compare their data');
  }
  
  // Export research data
  exportResearchData() {
    const data = {
      measurements: this.measurements,
      lockedCoordinates: this.lockedCoordinates,
      pins: window.SmartPinsManager?.exportAllPins(),
      timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnihub-research-data-${Date.now()}.json`;
    a.click();
    
    console.log('💾 Research data exported');
    this.showMessage('Research data exported successfully');
  }
  
  // Show message
  showMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'research-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Create global instance
window.ResearchMode = new ResearchMode();
console.log('🔬 Research Mode initialized');