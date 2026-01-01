// Ocean Data Layer
// Ocean regions, currents, and environmental data

const OceanLayer = {
  // Ocean region data
  oceanRegions: [
    {
      name: 'Pacific Ocean',
      lat: 0,
      lng: -160,
      size: 40,
      color: 'rgba(30, 144, 255, 0.3)',
      data: {
        area: '165.2M km²',
        avgDepth: '4,280m',
        maxDepth: '10,994m (Mariana Trench)',
        temperature: '0°C to 30°C',
        salinity: '3.4%',
        biodiversity: 'Highest marine biodiversity'
      }
    },
    {
      name: 'Atlantic Ocean',
      lat: 0,
      lng: -30,
      size: 35,
      color: 'rgba(65, 105, 225, 0.3)',
      data: {
        area: '106.5M km²',
        avgDepth: '3,646m',
        maxDepth: '8,486m (Puerto Rico Trench)',
        temperature: '0°C to 28°C',
        salinity: '3.5%',
        biodiversity: 'Rich coastal ecosystems'
      }
    },
    {
      name: 'Indian Ocean',
      lat: -20,
      lng: 80,
      size: 30,
      color: 'rgba(100, 149, 237, 0.3)',
      data: {
        area: '70.6M km²',
        avgDepth: '3,741m',
        maxDepth: '7,258m (Java Trench)',
        temperature: '10°C to 30°C',
        salinity: '3.4%',
        biodiversity: 'Coral triangle region'
      }
    },
    {
      name: 'Arctic Ocean',
      lat: 80,
      lng: 0,
      size: 15,
      color: 'rgba(135, 206, 250, 0.3)',
      data: {
        area: '14.1M km²',
        avgDepth: '1,205m',
        maxDepth: '5,450m (Fram Basin)',
        temperature: '-2°C to 10°C',
        salinity: '3.2%',
        biodiversity: 'Arctic marine life'
      }
    },
    {
      name: 'Southern Ocean',
      lat: -60,
      lng: 0,
      size: 20,
      color: 'rgba(70, 130, 180, 0.3)',
      data: {
        area: '20.3M km²',
        avgDepth: '3,270m',
        maxDepth: '7,235m (South Sandwich Trench)',
        temperature: '-2°C to 10°C',
        salinity: '3.4%',
        biodiversity: 'Antarctic krill, whales'
      }
    }
  ],
  
  // Major ocean currents
  currents: [
    {
      name: 'Gulf Stream',
      path: [
        { lat: 25, lng: -80 },
        { lat: 30, lng: -75 },
        { lat: 40, lng: -60 },
        { lat: 50, lng: -40 }
      ],
      type: 'warm',
      speed: '2.5 m/s'
    },
    {
      name: 'Kuroshio Current',
      path: [
        { lat: 25, lng: 125 },
        { lat: 30, lng: 135 },
        { lat: 35, lng: 140 },
        { lat: 40, lng: 145 }
      ],
      type: 'warm',
      speed: '1.5 m/s'
    },
    {
      name: 'Antarctic Circumpolar Current',
      path: [
        { lat: -55, lng: -180 },
        { lat: -55, lng: -90 },
        { lat: -55, lng: 0 },
        { lat: -55, lng: 90 },
        { lat: -55, lng: 180 }
      ],
      type: 'cold',
      speed: '1.0 m/s'
    }
  ],
  
  // Apply to globe
  applyToGlobe: function(globe, opacity = 0.7) {
    const labels = this.oceanRegions.map(ocean => ({
      lat: ocean.lat,
      lng: ocean.lng,
      text: ocean.name,
      color: 'rgba(255, 255, 255, 0.8)',
      size: 1.5,
      altitude: 0.01
    }));
    
    globe
      .labelsData(labels)
      .labelText('text')
      .labelSize('size')
      .labelColor('color')
      .labelAltitude('altitude')
      .labelDotRadius(0.5)
      .labelResolution(2);
    
    console.log(`🌊 Ocean layer applied: ${this.oceanRegions.length} regions`);
  },
  
  // Remove from globe
  removeFromGlobe: function(globe) {
    globe.labelsData([]);
    console.log('🌊 Ocean layer removed');
  },
  
  // Get ocean info by coordinates
  getOceanInfo: function(lat, lng) {
    // Simple logic to determine which ocean based on coordinates
    if (lat > 60) {
      return this.oceanRegions.find(o => o.name === 'Arctic Ocean');
    } else if (lat < -50) {
      return this.oceanRegions.find(o => o.name === 'Southern Ocean');
    } else if (lng > -20 && lng < 120 && lat < 30) {
      return this.oceanRegions.find(o => o.name === 'Indian Ocean');
    } else if (lng < -20 && lng > -100) {
      return this.oceanRegions.find(o => o.name === 'Atlantic Ocean');
    } else {
      return this.oceanRegions.find(o => o.name === 'Pacific Ocean');
    }
  },

  // Check if coordinates are over ocean (simple heuristic)
  isOcean: function(lat, lng) {
    // Simple check: most of the earth is ocean
    // More sophisticated would use actual coastline data
    // For now, just return true for demonstration
    return true; // Placeholder - can be enhanced later
  }
};

window.OceanLayer = OceanLayer;
console.log('🌊 Ocean Layer initialized');