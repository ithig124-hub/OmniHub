// Static Datasets for Globe Module
// Country data, ocean regions, and geographic information

const GlobeData = {
  // Major countries with coordinates and info
  countries: [
    { name: 'United States', lat: 37.0902, lng: -95.7129, population: '331M', region: 'North America', capital: 'Washington D.C.' },
    { name: 'China', lat: 35.8617, lng: 104.1954, population: '1.4B', region: 'Asia', capital: 'Beijing' },
    { name: 'India', lat: 20.5937, lng: 78.9629, population: '1.4B', region: 'Asia', capital: 'New Delhi' },
    { name: 'Brazil', lat: -14.2350, lng: -51.9253, population: '213M', region: 'South America', capital: 'Brasília' },
    { name: 'Russia', lat: 61.5240, lng: 105.3188, population: '146M', region: 'Europe/Asia', capital: 'Moscow' },
    { name: 'Japan', lat: 36.2048, lng: 138.2529, population: '126M', region: 'Asia', capital: 'Tokyo' },
    { name: 'Germany', lat: 51.1657, lng: 10.4515, population: '83M', region: 'Europe', capital: 'Berlin' },
    { name: 'United Kingdom', lat: 55.3781, lng: -3.4360, population: '67M', region: 'Europe', capital: 'London' },
    { name: 'France', lat: 46.2276, lng: 2.2137, population: '65M', region: 'Europe', capital: 'Paris' },
    { name: 'Italy', lat: 41.8719, lng: 12.5674, population: '60M', region: 'Europe', capital: 'Rome' },
    { name: 'Canada', lat: 56.1304, lng: -106.3468, population: '38M', region: 'North America', capital: 'Ottawa' },
    { name: 'Australia', lat: -25.2744, lng: 133.7751, population: '26M', region: 'Oceania', capital: 'Canberra' },
    { name: 'Mexico', lat: 23.6345, lng: -102.5528, population: '128M', region: 'North America', capital: 'Mexico City' },
    { name: 'South Korea', lat: 35.9078, lng: 127.7669, population: '51M', region: 'Asia', capital: 'Seoul' },
    { name: 'Spain', lat: 40.4637, lng: -3.7492, population: '47M', region: 'Europe', capital: 'Madrid' },
    { name: 'Argentina', lat: -38.4161, lng: -63.6167, population: '45M', region: 'South America', capital: 'Buenos Aires' },
    { name: 'Egypt', lat: 26.8206, lng: 30.8025, population: '102M', region: 'Africa', capital: 'Cairo' },
    { name: 'South Africa', lat: -30.5595, lng: 22.9375, population: '59M', region: 'Africa', capital: 'Pretoria' },
    { name: 'Nigeria', lat: 9.0820, lng: 8.6753, population: '206M', region: 'Africa', capital: 'Abuja' },
    { name: 'Turkey', lat: 38.9637, lng: 35.2433, population: '84M', region: 'Europe/Asia', capital: 'Ankara' }
  ],
  
  // Major cities
  cities: [
    { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, population: '8.3M' },
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, population: '9M' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, population: '14M' },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: '2.2M' },
    { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, population: '21M' },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, population: '20M' },
    { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, population: '12M' },
    { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, population: '12M' },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, population: '3.3M' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, population: '5.7M' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, population: '5.3M' },
    { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, population: '4M' },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, population: '3.6M' },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: '2.8M' },
    { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, population: '21M' }
  ],
  
  // Ocean regions
  oceans: [
    { name: 'Pacific Ocean', lat: 0, lng: -160, area: '165.2M km²', avgDepth: '4,280m', description: 'Largest and deepest ocean' },
    { name: 'Atlantic Ocean', lat: 0, lng: -30, area: '106.5M km²', avgDepth: '3,646m', description: 'Second largest ocean' },
    { name: 'Indian Ocean', lat: -20, lng: 80, area: '70.6M km²', avgDepth: '3,741m', description: 'Third largest ocean' },
    { name: 'Arctic Ocean', lat: 90, lng: 0, area: '14.1M km²', avgDepth: '1,205m', description: 'Smallest and shallowest ocean' },
    { name: 'Southern Ocean', lat: -60, lng: 0, area: '20.3M km²', avgDepth: '3,270m', description: 'Surrounds Antarctica' }
  ],
  
  // Historical trade routes
  historicalRoutes: [
    {
      name: 'Silk Road',
      description: 'Ancient trade route connecting East and West',
      points: [
        { lat: 34.27, lng: 108.94 }, // Xi'an
        { lat: 41.01, lng: 71.47 }, // Kashgar
        { lat: 39.63, lng: 66.97 }, // Samarkand
        { lat: 35.69, lng: 51.42 }, // Tehran
        { lat: 33.31, lng: 44.37 } // Baghdad
      ]
    },
    {
      name: 'Spice Route',
      description: 'Maritime trade route for spices',
      points: [
        { lat: -6.21, lng: 106.85 }, // Jakarta
        { lat: 13.08, lng: 80.27 }, // Chennai
        { lat: 12.97, lng: 77.59 }, // Bangalore
        { lat: 23.03, lng: 72.59 }, // Ahmedabad
        { lat: 25.28, lng: 55.36 } // Dubai
      ]
    }
  ],
  
  // Country information database
  getCountryInfo: function(countryName) {
    const country = this.countries.find(c => 
      c.name.toLowerCase().includes(countryName.toLowerCase())
    );
    
    if (country) {
      return {
        ...country,
        description: `${country.name} is located in ${country.region} with a population of approximately ${country.population}. The capital is ${country.capital}.`
      };
    }
    return null;
  },
  
  // Get location by coordinates (simple reverse lookup)
  getLocationByCoords: function(lat, lng) {
    // Find closest city or country
    let closest = null;
    let minDistance = Infinity;
    
    [...this.countries, ...this.cities].forEach(location => {
      const distance = Math.sqrt(
        Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = location;
      }
    });
    
    if (closest && minDistance < 10) { // Within ~10 degrees
      return closest;
    }
    
    // Check if in ocean
    for (const ocean of this.oceans) {
      const distance = Math.sqrt(
        Math.pow(ocean.lat - lat, 2) + Math.pow(ocean.lng - lng, 2)
      );
      if (distance < 50) {
        return { ...ocean, type: 'ocean' };
      }
    }
    
    return null;
  },
  
  // Search function
  search: function(query) {
    const q = query.toLowerCase();
    const results = [];
    
    // Search countries
    this.countries.forEach(country => {
      if (country.name.toLowerCase().includes(q) || 
          country.capital.toLowerCase().includes(q) ||
          country.region.toLowerCase().includes(q)) {
        results.push({ ...country, type: 'country' });
      }
    });
    
    // Search cities
    this.cities.forEach(city => {
      if (city.name.toLowerCase().includes(q) || 
          city.country.toLowerCase().includes(q)) {
        results.push({ ...city, type: 'city' });
      }
    });
    
    // Search oceans
    this.oceans.forEach(ocean => {
      if (ocean.name.toLowerCase().includes(q)) {
        results.push({ ...ocean, type: 'ocean' });
      }
    });
    
    return results.slice(0, 10); // Return top 10 results
  }
};

// Make globally available
window.GlobeData = GlobeData;
console.log('📊 Globe Data initialized with', GlobeData.countries.length, 'countries');