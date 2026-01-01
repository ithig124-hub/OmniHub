// Shipping Lanes Layer
// Major maritime shipping routes

const ShippingLayer = {
  // Generate major shipping routes
  generateRoutes: function() {
    const majorPorts = [
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
      { name: 'Singapore', lat: 1.2897, lng: 103.8501 },
      { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
      { name: 'Dubai', lat: 25.0657, lng: 55.1713 },
      { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
      { name: 'Los Angeles', lat: 33.7701, lng: -118.1937 },
      { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
      { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
      { name: 'Busan', lat: 35.1796, lng: 129.0756 },
      { name: 'New York', lat: 40.6895, lng: -74.0446 },
      { name: 'Tokyo', lat: 35.6528, lng: 139.8394 },
      { name: 'Mumbai', lat: 18.9387, lng: 72.8355 },
      { name: 'Santos', lat: -23.9608, lng: -46.3336 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
    ];
    
    const routes = [];
    
    // Major shipping lanes
    const lanes = [
      // Trans-Pacific
      ['Shanghai', 'Los Angeles'],
      ['Shanghai', 'Tokyo'],
      ['Shanghai', 'Singapore'],
      ['Hong Kong', 'Los Angeles'],
      ['Singapore', 'Los Angeles'],
      ['Tokyo', 'Los Angeles'],
      
      // Europe-Asia
      ['Singapore', 'Rotterdam'],
      ['Shanghai', 'Hamburg'],
      ['Dubai', 'Rotterdam'],
      ['Mumbai', 'Hamburg'],
      ['Hong Kong', 'Antwerp'],
      
      // Trans-Atlantic
      ['Rotterdam', 'New York'],
      ['Hamburg', 'New York'],
      ['Antwerp', 'New York'],
      
      // Asia-Middle East
      ['Singapore', 'Dubai'],
      ['Shanghai', 'Dubai'],
      ['Mumbai', 'Dubai'],
      
      // Oceania
      ['Singapore', 'Sydney'],
      ['Shanghai', 'Sydney'],
      
      // South America
      ['Santos', 'Shanghai'],
      ['Santos', 'Rotterdam'],
      ['Santos', 'New York']
    ];
    
    lanes.forEach(([from, to]) => {
      const fromPort = majorPorts.find(p => p.name === from);
      const toPort = majorPorts.find(p => p.name === to);
      
      if (fromPort && toPort) {
        routes.push({
          from: fromPort,
          to: toPort,
          startLat: fromPort.lat,
          startLng: fromPort.lng,
          endLat: toPort.lat,
          endLng: toPort.lng,
          color: ['rgba(50, 150, 255, 0.6)', 'rgba(100, 180, 255, 0.8)'],
          label: `${from} → ${to} (Shipping)`
        });
      }
    });
    
    return routes;
  },
  
  // Apply to globe
  applyToGlobe: function(globe, opacity = 0.7) {
    const routes = this.generateRoutes();
    
    // Use paths instead of arcs for shipping
    globe
      .pathsData(routes)
      .pathColor(d => d.color[0])
      .pathStroke(2)
      .pathDashLength(0.3)
      .pathDashGap(0.1)
      .pathDashAnimateTime(5000)
      .pathLabel(d => d.label);
    
    console.log(`🚢 Shipping layer applied: ${routes.length} routes`);
  },
  
  // Remove from globe
  removeFromGlobe: function(globe) {
    globe.pathsData([]);
    console.log('🚢 Shipping layer removed');
  },
  
  // Update opacity
  setOpacity: function(globe, opacity) {
    const routes = this.generateRoutes();
    const alpha = opacity;
    
    routes.forEach(route => {
      route.color = [
        `rgba(50, 150, 255, ${alpha})`,
        `rgba(100, 180, 255, ${alpha * 1.2})`
      ];
    });
    
    globe.pathsData(routes);
  }
};

window.ShippingLayer = ShippingLayer;
console.log('🚢 Shipping Layer initialized');