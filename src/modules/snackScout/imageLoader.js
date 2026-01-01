// =======================
// SNACKSCOUT - IMAGE LOADER
// Real food images for better user experience
// =======================

class ImageLoader {
  constructor() {
    this.cache = new Map();
    
    // High-quality real food images selected by vision expert
    this.categoryImages = {
      snack: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=800&q=80', // Golden potato chips
      dairy: 'https://images.unsplash.com/photo-1634141510639-d691d86f47be?w=800&q=80', // Milk bottle with cookies
      fruit: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80', // Fresh fruit variety
      bakery: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&q=80', // Sliced bread
      meat: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800&q=80', // Roasted chicken
      beverage: 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800&q=80', // Coca-Cola
      dessert: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80', // Ice cream cone
      spread: 'https://images.unsplash.com/photo-1615110250484-e8c3b151b957?w=800&q=80', // Peanut butter
      default: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80' // General food
    };
    
    // Specific food item mappings for better accuracy
    this.foodItemImages = {
      // Snacks
      'chips': 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=800&q=80',
      'doritos': 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=800&q=80',
      'pretzels': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
      'popcorn': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&q=80',
      'crackers': 'https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229?w=800&q=80',
      
      // Dairy
      'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
      'cheese': 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800&q=80',
      'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
      'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80',
      
      // Fruits
      'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
      'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
      'orange': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&q=80',
      'berries': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
      
      // Bakery
      'bread': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&q=80',
      'bagel': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
      'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
      'muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=80',
      
      // Meat
      'chicken': 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800&q=80',
      'beef': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',
      'bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&q=80',
      'sausage': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80',
      
      // Beverages
      'cola': 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800&q=80',
      'soda': 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800&q=80',
      'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
      'water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
      'energy drink': 'https://images.unsplash.com/photo-1622543925917-763c34f402e9?w=800&q=80',
      
      // Desserts
      'ice cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
      'chocolate': 'https://images.unsplash.com/photo-1606312619070-d48b4cbc9bf5?w=800&q=80',
      'cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
      'candy': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&q=80',
      
      // Spreads
      'peanut butter': 'https://images.unsplash.com/photo-1615110250484-e8c3b151b957?w=800&q=80',
      'jam': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
      'nutella': 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=800&q=80',
      'honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784eff?w=800&q=80'
    };
  }

  /**
   * Get image URL for a food item
   * @param {string} foodName - Name of the food item
   * @param {string} category - Food category
   * @returns {string} Image URL
   */
  getImageUrl(foodName, category = 'default') {
    // Check cache first
    const cacheKey = `${foodName}-${category}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try exact food item match first
    const lowerName = foodName.toLowerCase();
    for (const [key, url] of Object.entries(this.foodItemImages)) {
      if (lowerName.includes(key)) {
        this.cache.set(cacheKey, url);
        return url;
      }
    }
    
    // Fall back to category image
    const categoryImage = this.categoryImages[category] || this.categoryImages.default;
    
    // Cache it
    this.cache.set(cacheKey, categoryImage);
    return categoryImage;
  }

  /**
   * Get fallback image for a category
   * @param {string} category - Food category
   * @returns {string} Fallback image URL
   */
  getFallbackImage(category = 'default') {
    return this.categoryImages[category] || this.categoryImages.default;
  }

  /**
   * Preload an image
   * @param {string} url - Image URL
   * @returns {Promise} Promise that resolves when image is loaded
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Preload multiple images
   * @param {Array<string>} urls - Array of image URLs
   * @returns {Promise<Array>} Promise that resolves with loaded URLs
   */
  preloadImages(urls) {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  /**
   * Clear image cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Image cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}
