// =======================
// LIVE FLIGHT TRACKER
// Real-time flight data from AviationStack API
// =======================

class FlightTracker {
  constructor() {
    this.flights = [];
    this.updateInterval = null;
    this.isActive = false;
    this.globe = null;
    
    // AviationStack API credentials
    this.apiKey = '10cc4f08e485edb74d8717494bd70746';
    this.apiUrl = 'http://api.aviationstack.com/v1/flights';
    
    // Debounce click events
    this.lastClickTime = 0;
    this.clickDebounceMs = 300;
  }
  
  // Set globe instance
  setGlobe(globeInstance) {
    this.globe = globeInstance;
    console.log('✈️ Flight tracker connected to globe');
  }
  
  // Start tracking
  async start() {
    if (this.isActive) {
      console.log('⚠️ Flight tracking already active');
      return;
    }
    
    this.isActive = true;
    console.log('✈️ Starting live flight tracking...');
    
    // Initial fetch
    await this.fetchFlights();
    
    // Update every 60 seconds (AviationStack rate limit for free tier)
    this.updateInterval = setInterval(() => {
      this.fetchFlights();
    }, 60000);
    
    console.log('✈️ Live flight tracking active');
  }
  
  // Stop tracking
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Clear flights from globe
    if (this.globe) {
      this.globe.customLayerData([]);
    }
    
    this.flights = [];
    console.log('✈️ Flight tracking stopped');
  }
  
  // Fetch live flights from AviationStack API
  async fetchFlights() {
    try {
      console.log('🔄 Fetching live flights from AviationStack...');
      
      // Build API URL with parameters
      const url = `${this.apiUrl}?access_key=${this.apiKey}&limit=100`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ AviationStack API error:', data.error);
        throw new Error(data.error.info || 'API request failed');
      }
      
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('⚠️ No flight data received');
        return;
      }
      
      // Parse flight data
      this.flights = data.data
        .filter(flight => {
          // Filter valid flights with position data
          return flight.live && 
                 flight.live.latitude !== null && 
                 flight.live.longitude !== null &&
                 flight.live.altitude !== null &&
                 flight.live.latitude >= -90 && 
                 flight.live.latitude <= 90 &&
                 flight.live.longitude >= -180 && 
                 flight.live.longitude <= 180;
        })
        .map(flight => this.parseFlightData(flight))
        .filter(flight => flight !== null);
      
      console.log(`✅ Fetched ${this.flights.length} live flights from AviationStack`);
      
      // Update globe
      this.updateGlobe();
      
    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      
      // Show user-friendly error
      if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        this.showError('Authentication failed. Please check API credentials.');
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        this.showError('API rate limit exceeded. Retrying in 60 seconds...');
      } else if (error.message.includes('quota')) {
        this.showError('API quota exceeded. Please upgrade your AviationStack plan.');
      } else {
        this.showError('Failed to fetch flight data. Check your internet connection.');
      }
    }
  }
  
  // Parse AviationStack flight data
  parseFlightData(flight) {
    try {
      // Validate that we have position data
      if (!flight.live || 
          flight.live.latitude === null || 
          flight.live.longitude === null) {
        return null;
      }
      
      const parsedFlight = {
        // Flight identification
        flightDate: flight.flight_date,
        flightStatus: flight.flight_status,
        
        // Departure info
        departureAirport: flight.departure?.airport || 'Unknown',
        departureIata: flight.departure?.iata || 'N/A',
        departureCity: flight.departure?.timezone || '',
        
        // Arrival info
        arrivalAirport: flight.arrival?.airport || 'Unknown',
        arrivalIata: flight.arrival?.iata || 'N/A',
        arrivalCity: flight.arrival?.timezone || '',
        
        // Airline info
        airlineName: flight.airline?.name || 'Unknown Airline',
        airlineIata: flight.airline?.iata || '',
        
        // Flight number
        flightNumber: flight.flight?.iata || flight.flight?.icao || 'N/A',
        flightIata: flight.flight?.iata || 'N/A',
        flightIcao: flight.flight?.icao || 'N/A',
        
        // Aircraft info
        aircraftRegistration: flight.aircraft?.registration || 'N/A',
        aircraftIcao24: flight.aircraft?.icao24 || 'N/A',
        
        // Live position data
        latitude: parseFloat(flight.live.latitude),
        longitude: parseFloat(flight.live.longitude),
        altitude: parseFloat(flight.live.altitude) || 10000, // Default altitude if missing
        direction: flight.live.direction !== null ? parseFloat(flight.live.direction) : 0,
        speedHorizontal: flight.live.speed_horizontal || 0,
        speedVertical: flight.live.speed_vertical || 0,
        isGround: flight.live.is_ground || false,
        
        // Timestamp
        updated: flight.live.updated
      };
      
      // Log for debugging
      console.log(`✈️ Parsed flight: ${parsedFlight.flightNumber} at (${parsedFlight.latitude}, ${parsedFlight.longitude})`);
      
      return parsedFlight;
    } catch (error) {
      console.warn('⚠️ Error parsing flight data:', error, flight);
      return null;
    }
  }
  
  // Update globe with flight data
  updateGlobe() {
    if (!this.globe) return;
    
    // Convert flights to 3D objects with accurate positioning
    const flightObjects = this.flights.map(flight => ({
      lat: flight.latitude,
      lng: flight.longitude,
      altitude: Math.max(0.002, (flight.altitude || 10000) / 80000), // Improved altitude scaling for better visibility
      flight: flight // Store full flight data
    }));
    
    console.log(`✈️ Rendering ${flightObjects.length} flights on globe`);
    
    // Update globe with custom layer
    this.globe
      .customLayerData(flightObjects)
      .customThreeObject(() => {
        // Create larger, more visible plane mesh
        const geometry = new THREE.ConeGeometry(0.4, 1.2, 4); // Larger size
        const material = new THREE.MeshLambertMaterial({
          color: '#ff6b35',
          emissive: '#ff3300',
          emissiveIntensity: 0.7 // Brighter glow
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2; // Point forward
        return mesh;
      })
      .customThreeObjectUpdate((obj, d) => {
        // Update position with accurate coordinates
        const coords = this.globe.getCoords(d.lat, d.lng, d.altitude);
        
        // Verify coordinates are valid
        if (coords && !isNaN(coords.x) && !isNaN(coords.y) && !isNaN(coords.z)) {
          Object.assign(obj.position, coords);
          
          // Rotate plane based on heading (direction)
          if (d.flight.direction !== null && d.flight.direction !== undefined) {
            obj.rotation.z = (d.flight.direction * Math.PI) / 180;
          }
        } else {
          console.warn('⚠️ Invalid coordinates for flight:', d.flight.flightNumber);
        }
      });
    
    // Add click handler
    this.globe.onCustomLayerClick((obj) => {
      const now = Date.now();
      if (now - this.lastClickTime < this.clickDebounceMs) {
        return; // Debounce
      }
      this.lastClickTime = now;
      
      if (obj && obj.flight) {
        this.showFlightDetails(obj.flight);
      }
    });
    
    console.log(`✅ Successfully rendered ${flightObjects.length} flights with accurate positions`);
  }
  
  // Show flight details modal
  showFlightDetails(flight) {
    console.log('✈️ Showing details for flight:', flight.flightNumber);
    
    // Create or get modal
    let modal = document.getElementById('flight-details-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'flight-details-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    
    // Convert units
    const altitudeFt = flight.altitude ? Math.round(flight.altitude * 3.28084) : 'N/A';
    const speedKnots = flight.speedHorizontal ? Math.round(flight.speedHorizontal * 0.539957) : 'N/A';
    const verticalRateFpm = flight.speedVertical ? Math.round(flight.speedVertical * 196.85) : 0;
    const heading = flight.direction !== null && flight.direction !== undefined ? Math.round(flight.direction) : 'N/A';
    
    // Determine climb/descent
    let verticalStatus = 'Level';
    if (verticalRateFpm > 100) verticalStatus = `↑ Climbing (${verticalRateFpm} fpm)`;
    else if (verticalRateFpm < -100) verticalStatus = `↓ Descending (${Math.abs(verticalRateFpm)} fpm)`;
    
    // Format timestamp
    const lastUpdated = flight.updated ? new Date(flight.updated).toLocaleString() : 'N/A';
    
    modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width: 600px;">
        <span class="close-btn" onclick="document.getElementById('flight-details-modal').classList.add('hidden')">&times;</span>
        <h2>✈️ Flight Details</h2>
        <div class="flight-details-grid">
          <div class="detail-row">
            <strong>Flight Number:</strong>
            <span>${flight.flightNumber}</span>
          </div>
          <div class="detail-row">
            <strong>Airline:</strong>
            <span>${flight.airlineName}</span>
          </div>
          <div class="detail-row">
            <strong>Status:</strong>
            <span>${flight.flightStatus}</span>
          </div>
          <div class="detail-row">
            <strong>Aircraft:</strong>
            <span>${flight.aircraftRegistration}</span>
          </div>
          <div class="detail-row">
            <strong>Departure:</strong>
            <span>${flight.departureAirport} (${flight.departureIata})</span>
          </div>
          <div class="detail-row">
            <strong>Arrival:</strong>
            <span>${flight.arrivalAirport} (${flight.arrivalIata})</span>
          </div>
          <div class="detail-row">
            <strong>Altitude:</strong>
            <span>${altitudeFt} ft</span>
          </div>
          <div class="detail-row">
            <strong>Ground Speed:</strong>
            <span>${speedKnots} knots</span>
          </div>
          <div class="detail-row">
            <strong>Heading:</strong>
            <span>${heading}°</span>
          </div>
          <div class="detail-row">
            <strong>Vertical Rate:</strong>
            <span>${verticalStatus}</span>
          </div>
          <div class="detail-row">
            <strong>Position:</strong>
            <span>${flight.latitude.toFixed(4)}°, ${flight.longitude.toFixed(4)}°</span>
          </div>
          <div class="detail-row">
            <strong>On Ground:</strong>
            <span>${flight.isGround ? '🛬 Yes' : '🛫 No'}</span>
          </div>
          <div class="detail-row">
            <strong>Last Updated:</strong>
            <span>${lastUpdated}</span>
          </div>
        </div>
        <div class="modal-actions" style="margin-top: 20px;">
          <button onclick="document.getElementById('flight-details-modal').classList.add('hidden')" class="tool-btn">Close</button>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  }
  
  // Show error message
  showError(message) {
    console.error('❌', message);
    // Could show toast notification here
  }
  
  // Get flight count
  getFlightCount() {
    return this.flights.length;
  }
}

// Create global instance
window.FlightTracker = new FlightTracker();
console.log('✈️ Live Flight Tracker initialized');
