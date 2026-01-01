// Flight Routes Layer
// Simulates major international flight paths

const FlightLayer = {
  // Generate major flight routes
  generateRoutes: function() {
    const majorAirports = [
      { name: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
      { name: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
      { name: 'NRT', lat: 35.7647, lng: 140.3864, city: 'Tokyo' },
      { name: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
      { name: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
      { name: 'SIN', lat: 1.3644, lng: 103.9915, city: 'Singapore' },
      { name: 'LAX', lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
      { name: 'HKG', lat: 22.3080, lng: 113.9185, city: 'Hong Kong' },
      { name: 'FRA', lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
      { name: 'AMS', lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
      { name: 'SYD', lat: -33.9399, lng: 151.1753, city: 'Sydney' },
      { name: 'GRU', lat: -23.4356, lng: -46.4731, city: 'São Paulo' },
      { name: 'PEK', lat: 40.0799, lng: 116.6031, city: 'Beijing' },
      { name: 'DEL', lat: 28.5562, lng: 77.1000, city: 'Delhi' },
      { name: 'ORD', lat: 41.9742, lng: -87.9073, city: 'Chicago' }
    ];
    
    const routes = [];
    
    // Generate routes between major hubs
    const connections = [
      ['JFK', 'LHR'], ['JFK', 'CDG'], ['JFK', 'NRT'], ['JFK', 'LAX'],
      ['LHR', 'DXB'], ['LHR', 'SIN'], ['LHR', 'JFK'], ['LHR', 'HKG'],
      ['NRT', 'LAX'], ['NRT', 'SIN'], ['NRT', 'PEK'], ['NRT', 'SYD'],
      ['DXB', 'SIN'], ['DXB', 'LHR'], ['DXB', 'DEL'], ['DXB', 'HKG'],
      ['SIN', 'SYD'], ['SIN', 'HKG'], ['SIN', 'NRT'], ['SIN', 'DXB'],
      ['LAX', 'NRT'], ['LAX', 'SYD'], ['LAX', 'JFK'], ['LAX', 'HKG'],
      ['FRA', 'LHR'], ['FRA', 'DXB'], ['FRA', 'JFK'], ['FRA', 'PEK'],
      ['AMS', 'JFK'], ['AMS', 'SIN'], ['AMS', 'LHR'], ['AMS', 'CDG'],
      ['SYD', 'SIN'], ['SYD', 'LAX'], ['SYD', 'HKG'], ['SYD', 'NRT'],
      ['GRU', 'JFK'], ['GRU', 'LHR'], ['GRU', 'CDG'], ['GRU', 'FRA'],
      ['PEK', 'NRT'], ['PEK', 'SIN'], ['PEK', 'LAX'], ['PEK', 'FRA'],
      ['DEL', 'DXB'], ['DEL', 'SIN'], ['DEL', 'LHR'], ['DEL', 'HKG'],
      ['ORD', 'JFK'], ['ORD', 'LAX'], ['ORD', 'LHR'], ['ORD', 'NRT']
    ];
    
    connections.forEach(([from, to]) => {
      const fromAirport = majorAirports.find(a => a.name === from);
      const toAirport = majorAirports.find(a => a.name === to);
      
      if (fromAirport && toAirport) {
        routes.push({
          from: fromAirport,
          to: toAirport,
          startLat: fromAirport.lat,
          startLng: fromAirport.lng,
          endLat: toAirport.lat,
          endLng: toAirport.lng,
          color: ['rgba(255, 100, 50, 0.6)', 'rgba(255, 150, 100, 0.8)'],
          label: `${from} → ${to}`
        });
      }
    });
    
    return routes;
  },
  
  // Apply to globe
  applyToGlobe: function(globe, opacity = 0.7) {
    const routes = this.generateRoutes();
    
    globe
      .arcsData(routes)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(3000)
      .arcStroke(0.5)
      .arcAltitude(0.1)
      .arcAltitudeAutoScale(0.3)
      .arcLabel(d => d.label);
    
    console.log(`✈️ Flight layer applied: ${routes.length} routes`);
  },
  
  // Remove from globe
  removeFromGlobe: function(globe) {
    globe.arcsData([]);
    console.log('✈️ Flight layer removed');
  },
  
  // Update opacity
  setOpacity: function(globe, opacity) {
    const routes = this.generateRoutes();
    const alpha = opacity;
    
    routes.forEach(route => {
      route.color = [
        `rgba(255, 100, 50, ${alpha})`,
        `rgba(255, 150, 100, ${alpha * 1.2})`
      ];
    });
    
    globe.arcsData(routes);
  }
};

window.FlightLayer = FlightLayer;
console.log('✈️ Flight Layer initialized');