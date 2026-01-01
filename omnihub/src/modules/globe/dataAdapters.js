// =======================
// DATA ADAPTERS
// Modular data source adapters for various geographic data
// =======================

class DataAdapter {
  constructor(name) {
    this.name = name;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }
  
  // Check cache
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }
  
  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Elevation Data Adapter
class ElevationAdapter extends DataAdapter {
  constructor() {
    super('Elevation');
    this.elevationData = this.generateElevationData();
  }
  
  // Get elevation at coordinates
  async getElevation(lat, lng) {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.getCached(key);
    if (cached) return cached;
    
    // In production, call real elevation API
    // For now, use synthetic data
    const elevation = this.calculateSyntheticElevation(lat, lng);
    this.setCache(key, elevation);
    return elevation;
  }
  
  generateElevationData() {
    return {
      'himalayas': { lat: 28, lng: 84, elevation: 8848, name: 'Mount Everest' },
      'andes': { lat: -16, lng: -68, elevation: 6962, name: 'Andes Range' },
      'rockies': { lat: 50, lng: -115, elevation: 4401, name: 'Rocky Mountains' },
      'alps': { lat: 46, lng: 8, elevation: 4808, name: 'Mont Blanc' },
      'ocean': { lat: 0, lng: 0, elevation: -10911, name: 'Mariana Trench' }
    };
  }
  
  calculateSyntheticElevation(lat, lng) {
    // Simplified elevation calculation
    // Mountain regions have higher elevation
    const isOcean = window.ZoomIntelligence.isOceanLocation(lat, lng);
    if (isOcean) {
      return Math.floor(-Math.random() * 5000);
    }
    
    // Higher elevation near poles and mountain ranges
    const mountainFactor = Math.abs(Math.sin(lat * Math.PI / 180)) * Math.abs(Math.cos(lng * Math.PI / 180));
    return Math.floor(mountainFactor * 5000 + Math.random() * 1000);
  }
}

// Climate Data Adapter
class ClimateAdapter extends DataAdapter {
  constructor() {
    super('Climate');
    this.climateZones = this.initializeClimateZones();
  }
  
  // Get climate info for coordinates
  async getClimate(lat, lng) {
    const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
    const cached = this.getCached(key);
    if (cached) return cached;
    
    const climate = this.determineClimate(lat, lng);
    this.setCache(key, climate);
    return climate;
  }
  
  initializeClimateZones() {
    return {
      tropical: { latRange: [-23, 23], description: 'Tropical', avgTemp: 27 },
      subtropical: { latRange: [23, 35], description: 'Subtropical', avgTemp: 20 },
      temperate: { latRange: [35, 55], description: 'Temperate', avgTemp: 15 },
      continental: { latRange: [40, 60], description: 'Continental', avgTemp: 8 },
      polar: { latRange: [60, 90], description: 'Polar', avgTemp: -10 }
    };
  }
  
  determineClimate(lat, lng) {
    const absLat = Math.abs(lat);
    
    if (absLat < 23) {
      return { zone: 'Tropical', type: 'Af', avgTemp: 27, description: 'Tropical Rainforest' };
    } else if (absLat < 35) {
      return { zone: 'Subtropical', type: 'Cfa', avgTemp: 20, description: 'Humid Subtropical' };
    } else if (absLat < 55) {
      return { zone: 'Temperate', type: 'Cfb', avgTemp: 15, description: 'Oceanic Climate' };
    } else if (absLat < 66) {
      return { zone: 'Continental', type: 'Dfc', avgTemp: 5, description: 'Subarctic' };
    } else {
      return { zone: 'Polar', type: 'ET', avgTemp: -15, description: 'Tundra' };
    }
  }
  
  // Köppen climate classification
  getKoppenClassification(lat, lng) {
    const climate = this.determineClimate(lat, lng);
    return climate.type;
  }
}

// Terrain Data Adapter
class TerrainAdapter extends DataAdapter {
  constructor() {
    super('Terrain');
  }
  
  // Get terrain type at coordinates
  async getTerrain(lat, lng) {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.getCached(key);
    if (cached) return cached;
    
    const terrain = this.determineTerrainType(lat, lng);
    this.setCache(key, terrain);
    return terrain;
  }
  
  determineTerrainType(lat, lng) {
    const isOcean = window.ZoomIntelligence?.isOceanLocation(lat, lng);
    if (isOcean) {
      return { type: 'ocean', description: 'Ocean', landcover: 'water' };
    }
    
    const absLat = Math.abs(lat);
    
    // Simplified terrain classification
    if (absLat < 10) {
      return { type: 'rainforest', description: 'Tropical Rainforest', landcover: 'dense_vegetation' };
    } else if (absLat < 30) {
      return { type: 'grassland', description: 'Grassland/Savanna', landcover: 'grass' };
    } else if (absLat < 50) {
      return { type: 'forest', description: 'Temperate Forest', landcover: 'forest' };
    } else if (absLat < 66) {
      return { type: 'taiga', description: 'Boreal Forest', landcover: 'coniferous' };
    } else {
      return { type: 'tundra', description: 'Arctic Tundra', landcover: 'sparse_vegetation' };
    }
  }
}

// Population Data Adapter
class PopulationAdapter extends DataAdapter {
  constructor() {
    super('Population');
    this.populationCenters = this.initializePopulationCenters();
  }
  
  initializePopulationCenters() {
    return [
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503, population: 37400068 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025, population: 28514000 },
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737, population: 25582000 },
      { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 21650000 },
      { name: 'Mexico City', lat: 19.4326, lng: -99.1332, population: 21581000 },
      { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: 20076000 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 19980000 },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074, population: 19618000 },
      { name: 'Dhaka', lat: 23.8103, lng: 90.4125, population: 19578000 },
      { name: 'Osaka', lat: 34.6937, lng: 135.5023, population: 19281000 },
      { name: 'New York', lat: 40.7128, lng: -74.0060, population: 18819000 },
      { name: 'Karachi', lat: 24.8607, lng: 67.0011, population: 15400000 },
      { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, population: 14967000 },
      { name: 'Istanbul', lat: 41.0082, lng: 28.9784, population: 14751000 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, population: 14681000 }
    ];
  }
  
  // Get population density estimate
  async getPopulationDensity(lat, lng) {
    const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
    const cached = this.getCached(key);
    if (cached) return cached;
    
    // Find nearest population center
    let minDistance = Infinity;
    let nearestCity = null;
    
    this.populationCenters.forEach(city => {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });
    
    // Estimate density based on proximity
    const density = this.estimateDensity(minDistance, nearestCity?.population || 0);
    const result = {
      density,
      category: this.getDensityCategory(density),
      nearestCity: nearestCity?.name || 'Unknown'
    };
    
    this.setCache(key, result);
    return result;
  }
  
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
  
  estimateDensity(distance, cityPopulation) {
    if (distance < 50) {
      return Math.floor((cityPopulation / 1000) / (distance + 1));
    } else if (distance < 200) {
      return Math.floor(Math.random() * 500);
    }
    return Math.floor(Math.random() * 50);
  }
  
  getDensityCategory(density) {
    if (density > 10000) return 'Very High';
    if (density > 1000) return 'High';
    if (density > 100) return 'Medium';
    if (density > 10) return 'Low';
    return 'Very Low';
  }
}

// Create global instances
window.DataAdapters = {
  elevation: new ElevationAdapter(),
  climate: new ClimateAdapter(),
  terrain: new TerrainAdapter(),
  population: new PopulationAdapter()
};

console.log('📊 Data Adapters initialized');