// =======================
// SNACKSCOUT - LOCATION FINDER
// Store location finder with map integration
// =======================

class LocationFinder {
  constructor() {
    this.stores = this.initializeStores();
    this.userLocation = null;
  }

  /**
   * Initialize store database with realistic locations
   * @returns {Array} Store database
   */
  initializeStores() {
    return [
      // Woolworths
      { id: 'ww-1', name: 'Woolworths', suburb: 'Sydney CBD', street: 'George Street', distance: null, coords: [-33.8688, 151.2093] },
      { id: 'ww-2', name: 'Woolworths', suburb: 'Bondi', street: 'Oxford Street', distance: null, coords: [-33.8915, 151.2767] },
      { id: 'ww-3', name: 'Woolworths', suburb: 'Parramatta', street: 'Church Street', distance: null, coords: [-33.8150, 151.0010] },
      
      // Coles
      { id: 'col-1', name: 'Coles', suburb: 'Sydney CBD', street: 'Pitt Street', distance: null, coords: [-33.8704, 151.2075] },
      { id: 'col-2', name: 'Coles', suburb: 'Newtown', street: 'King Street', distance: null, coords: [-33.8985, 151.1794] },
      { id: 'col-3', name: 'Coles', suburb: 'Chatswood', street: 'Victoria Avenue', distance: null, coords: [-33.7969, 151.1831] },
      
      // IGA
      { id: 'iga-1', name: 'IGA', suburb: 'Glebe', street: 'Glebe Point Road', distance: null, coords: [-33.8794, 151.1850] },
      { id: 'iga-2', name: 'IGA', suburb: 'Surry Hills', street: 'Crown Street', distance: null, coords: [-33.8835, 151.2133] },
      
      // Aldi
      { id: 'ald-1', name: 'Aldi', suburb: 'Sydney CBD', street: 'Kent Street', distance: null, coords: [-33.8677, 151.2040] },
      { id: 'ald-2', name: 'Aldi', suburb: 'Bondi Junction', street: 'Oxford Street', distance: null, coords: [-33.8921, 151.2501] },
      { id: 'ald-3', name: 'Aldi', suburb: 'Marrickville', street: 'Illawarra Road', distance: null, coords: [-33.9113, 151.1556] },
      
      // 7-Eleven
      { id: '7e-1', name: '7-Eleven', suburb: 'Sydney CBD', street: 'George Street', distance: null, coords: [-33.8695, 151.2087] },
      { id: '7e-2', name: '7-Eleven', suburb: 'Kings Cross', street: 'Darlinghurst Road', distance: null, coords: [-33.8754, 151.2223] },
      { id: '7e-3', name: '7-Eleven', suburb: 'Redfern', street: 'Redfern Street', distance: null, coords: [-33.8924, 151.2040] },
      
      // Foodland (SA)
      { id: 'fl-1', name: 'Foodland', suburb: 'Adelaide CBD', street: 'Rundle Mall', distance: null, coords: [-34.9236, 138.5998] },
      { id: 'fl-2', name: 'Foodland', suburb: 'Norwood', street: 'The Parade', distance: null, coords: [-34.9193, 138.6291] }
    ];
  }

  /**
   * Find stores by suburb
   * @param {string} suburb - Suburb name
   * @returns {Array} Matching stores
   */
  findBySuburb(suburb) {
    const query = suburb.toLowerCase().trim();
    return this.stores.filter(store => 
      store.suburb.toLowerCase().includes(query)
    );
  }

  /**
   * Find stores by street
   * @param {string} street - Street name
   * @returns {Array} Matching stores
   */
  findByStreet(street) {
    const query = street.toLowerCase().trim();
    return this.stores.filter(store => 
      store.street.toLowerCase().includes(query)
    );
  }

  /**
   * Find stores by name
   * @param {string} storeName - Store name
   * @returns {Array} Matching stores
   */
  findByName(storeName) {
    const query = storeName.toLowerCase().trim();
    return this.stores.filter(store => 
      store.name.toLowerCase().includes(query)
    );
  }

  /**
   * Search stores by any criteria
   * @param {string} query - Search query
   * @returns {Array} Matching stores
   */
  search(query) {
    if (!query || query.trim() === '') {
      return this.stores;
    }
    
    const q = query.toLowerCase().trim();
    return this.stores.filter(store => 
      store.name.toLowerCase().includes(q) ||
      store.suburb.toLowerCase().includes(q) ||
      store.street.toLowerCase().includes(q)
    );
  }

  /**
   * Calculate distance between two coordinates
   * @param {Array} coords1 - [lat, lon]
   * @param {Array} coords2 - [lat, lon]
   * @returns {number} Distance in km
   */
  calculateDistance(coords1, coords2) {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} Radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Set user location
   * @param {Array} coords - [lat, lon]
   */
  setUserLocation(coords) {
    this.userLocation = coords;
    this.updateDistances();
  }

  /**
   * Update distances from user location
   */
  updateDistances() {
    if (!this.userLocation) return;
    
    this.stores.forEach(store => {
      store.distance = this.calculateDistance(this.userLocation, store.coords);
    });
  }

  /**
   * Get nearest stores
   * @param {number} limit - Max number of stores
   * @returns {Array} Nearest stores
   */
  getNearestStores(limit = 5) {
    if (!this.userLocation) {
      return this.stores.slice(0, limit);
    }
    
    return [...this.stores]
      .sort((a, b) => (a.distance || 999) - (b.distance || 999))
      .slice(0, limit);
  }

  /**
   * Get stores within radius
   * @param {number} radius - Radius in km
   * @returns {Array} Stores within radius
   */
  getStoresWithinRadius(radius) {
    if (!this.userLocation) {
      return this.stores;
    }
    
    return this.stores.filter(store => 
      store.distance !== null && store.distance <= radius
    );
  }

  /**
   * Format distance for display
   * @param {number} distance - Distance in km
   * @returns {string} Formatted distance
   */
  formatDistance(distance) {
    if (distance === null || distance === undefined) {
      return 'Unknown';
    }
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  /**
   * Get walking time estimate
   * @param {number} distance - Distance in km
   * @returns {string} Walking time
   */
  getWalkingTime(distance) {
    if (!distance) return 'Unknown';
    
    const minutes = Math.round((distance / 5) * 60); // Assuming 5 km/h walking speed
    if (minutes < 60) {
      return `${minutes} min walk`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m walk`;
  }

  /**
   * Open store location in map module
   * @param {Object} store - Store object
   */
  openInMap(store) {
    // Try to communicate with OmniHub's map module
    if (window.parent && window.parent.OmniHub) {
      try {
        // Store the location data for map module
        window.parent.OmniHub.setModuleData('snackScout_mapTarget', {
          name: `${store.name} - ${store.suburb}`,
          coords: store.coords,
          address: `${store.street}, ${store.suburb}`
        });
        
        // Navigate to map module
        window.parent.OmniHub.navigateToModule('map');
      } catch (error) {
        console.error('Failed to open in map:', error);
        alert(`${store.name}\n${store.street}, ${store.suburb}\nCoords: ${store.coords[0]}, ${store.coords[1]}`);
      }
    }
  }

  /**
   * Get all unique store names
   * @returns {Array} Store names
   */
  getStoreNames() {
    return [...new Set(this.stores.map(s => s.name))].sort();
  }

  /**
   * Get all unique suburbs
   * @returns {Array} Suburb names
   */
  getSuburbs() {
    return [...new Set(this.stores.map(s => s.suburb))].sort();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationFinder;
}