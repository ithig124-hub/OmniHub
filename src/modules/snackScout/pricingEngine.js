// =======================
// SNACKSCOUT - PRICING ENGINE
// Price comparison and store pricing logic
// =======================

class PricingEngine {
  constructor() {
    this.storePricing = this.initializeStorePricing();
  }

  /**
   * Initialize realistic store pricing data
   * Format: { foodId: { storeName: price } }
   * @returns {Object} Pricing database
   */
  initializeStorePricing() {
    return {
      // Instant Ramen
      'ramen-2pack': {
        'Woolworths': 2.50,
        'Coles': 2.40,
        'IGA': 2.80,
        'Aldi': 2.20,
        '7-Eleven': 3.50
      },
      // Cheese
      'cheese-shredded-200g': {
        'Woolworths': 4.50,
        'Coles': 4.40,
        'IGA': 4.80,
        'Aldi': 3.90,
        '7-Eleven': 5.50
      },
      // Sausages
      'sausages-6pack': {
        'Woolworths': 5.00,
        'Coles': 4.90,
        'IGA': 5.50,
        'Aldi': 4.50,
        'Foodland': 5.20
      },
      // Butter
      'butter-250g': {
        'Woolworths': 3.50,
        'Coles': 3.40,
        'IGA': 3.80,
        'Aldi': 3.20
      },
      // Soft Drink
      'softdrink-1.25l': {
        'Woolworths': 2.00,
        'Coles': 1.90,
        'IGA': 2.30,
        'Aldi': 1.70,
        '7-Eleven': 3.00
      },
      // Bananas
      'bananas-6pack': {
        'Woolworths': 3.00,
        'Coles': 2.90,
        'IGA': 3.20,
        'Aldi': 2.80,
        'Foodland': 3.10
      },
      // Trail Mix
      'trailmix-250g': {
        'Woolworths': 5.50,
        'Coles': 5.40,
        'IGA': 6.00,
        'Aldi': 4.90
      },
      // Dark Chocolate
      'chocolate-dark-100g': {
        'Woolworths': 3.50,
        'Coles': 3.40,
        'IGA': 3.80,
        'Aldi': 3.00,
        '7-Eleven': 4.50
      },
      // Instant Coffee
      'coffee-instant-10sach': {
        'Woolworths': 6.00,
        'Coles': 5.90,
        'IGA': 6.50,
        'Aldi': 5.50
      },
      // Eggs
      'eggs-12pack': {
        'Woolworths': 5.50,
        'Coles': 5.40,
        'IGA': 6.00,
        'Aldi': 4.90,
        'Foodland': 5.70
      },
      // Milk
      'milk-2l': {
        'Woolworths': 3.20,
        'Coles': 3.10,
        'IGA': 3.50,
        'Aldi': 2.90,
        '7-Eleven': 4.50
      },
      // Peanut Butter
      'peanutbutter-375g': {
        'Woolworths': 4.50,
        'Coles': 4.40,
        'IGA': 5.00,
        'Aldi': 4.00
      },
      // Frozen Chicken
      'chicken-frozen-500g': {
        'Woolworths': 7.00,
        'Coles': 6.90,
        'IGA': 7.50,
        'Aldi': 6.50,
        'Foodland': 7.20
      },
      // Frozen Pizza
      'pizza-frozen-400g': {
        'Woolworths': 5.00,
        'Coles': 4.90,
        'IGA': 5.50,
        'Aldi': 4.50,
        '7-Eleven': 7.00
      },
      // Ice Cream
      'icecream-1l': {
        'Woolworths': 6.00,
        'Coles': 5.90,
        'IGA': 6.50,
        'Aldi': 5.50
      },
      // Sparkling Drink
      'sparkling-1.25l': {
        'Woolworths': 2.50,
        'Coles': 2.40,
        'IGA': 2.80,
        'Aldi': 2.20,
        '7-Eleven': 3.50
      },
      // Popcorn
      'popcorn-300g': {
        'Woolworths': 3.00,
        'Coles': 2.90,
        'IGA': 3.30,
        'Aldi': 2.70
      },
      // Bread
      'bread-loaf': {
        'Woolworths': 2.80,
        'Coles': 2.70,
        'IGA': 3.00,
        'Aldi': 2.50,
        '7-Eleven': 4.00
      },
      // Cheese Slices
      'cheese-slices-250g': {
        'Woolworths': 4.00,
        'Coles': 3.90,
        'IGA': 4.30,
        'Aldi': 3.50,
        '7-Eleven': 5.00
      },
      // Cup Noodles
      'cupnoodles-3pack': {
        'Woolworths': 4.00,
        'Coles': 3.90,
        'IGA': 4.50,
        'Aldi': 3.50,
        '7-Eleven': 5.50
      },
      // Cookies
      'cookies-200g': {
        'Woolworths': 3.50,
        'Coles': 3.40,
        'IGA': 3.80,
        'Aldi': 3.00,
        '7-Eleven': 4.50
      }
    };
  }

  /**
   * Get price for item at specific store
   * @param {string} foodId - Food item ID
   * @param {string} storeName - Store name
   * @returns {number|null} Price or null if not available
   */
  getPrice(foodId, storeName) {
    return this.storePricing[foodId]?.[storeName] || null;
  }

  /**
   * Get all prices for an item across stores
   * @param {string} foodId - Food item ID
   * @returns {Array} Array of {store, price} objects
   */
  getAllPrices(foodId) {
    const prices = this.storePricing[foodId] || {};
    return Object.entries(prices).map(([store, price]) => ({
      store,
      price
    })).sort((a, b) => a.price - b.price);
  }

  /**
   * Get cheapest store for an item
   * @param {string} foodId - Food item ID
   * @returns {Object} {store, price}
   */
  getCheapestStore(foodId) {
    const prices = this.getAllPrices(foodId);
    return prices.length > 0 ? prices[0] : null;
  }

  /**
   * Get price range for an item
   * @param {string} foodId - Food item ID
   * @returns {Object} {min, max, average}
   */
  getPriceRange(foodId) {
    const prices = this.getAllPrices(foodId);
    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }
    
    const values = prices.map(p => p.price);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length
    };
  }

  /**
   * Compare prices across stores for multiple items
   * @param {Array} foodIds - Array of food IDs
   * @returns {Object} Store totals
   */
  compareStores(foodIds) {
    const storeTotals = {};
    
    foodIds.forEach(foodId => {
      const prices = this.storePricing[foodId] || {};
      Object.entries(prices).forEach(([store, price]) => {
        storeTotals[store] = (storeTotals[store] || 0) + price;
      });
    });
    
    return Object.entries(storeTotals)
      .map(([store, total]) => ({ store, total }))
      .sort((a, b) => a.total - b.total);
  }

  /**
   * Get savings amount compared to most expensive
   * @param {string} foodId - Food item ID
   * @param {string} storeName - Store name
   * @returns {number} Savings amount
   */
  getSavings(foodId, storeName) {
    const prices = this.getAllPrices(foodId);
    if (prices.length === 0) return 0;
    
    const maxPrice = Math.max(...prices.map(p => p.price));
    const currentPrice = this.getPrice(foodId, storeName);
    
    return currentPrice ? maxPrice - currentPrice : 0;
  }

  /**
   * Check if item is on "sale" (20% below average)
   * @param {string} foodId - Food item ID
   * @param {string} storeName - Store name
   * @returns {boolean} True if on sale
   */
  isOnSale(foodId, storeName) {
    const range = this.getPriceRange(foodId);
    const price = this.getPrice(foodId, storeName);
    
    if (!price) return false;
    return price <= range.average * 0.8;
  }

  /**
   * Get sale percentage
   * @param {string} foodId - Food item ID
   * @param {string} storeName - Store name
   * @returns {number} Sale percentage (0-100)
   */
  getSalePercentage(foodId, storeName) {
    const range = this.getPriceRange(foodId);
    const price = this.getPrice(foodId, storeName);
    
    if (!price || range.average === 0) return 0;
    
    const discount = ((range.average - price) / range.average) * 100;
    return Math.max(0, Math.round(discount));
  }

  /**
   * Get best time to buy (mock data for now)
   * @param {string} foodId - Food item ID
   * @returns {string} Best time hint
   */
  getBestTimeToBuy(foodId) {
    const hints = [
      'Late evening (7-9pm)',
      'Weekday mornings',
      'Weekend sales',
      'Tuesday specials',
      'End of month clearance'
    ];
    
    // Simple hash to get consistent hint per item
    const index = foodId.length % hints.length;
    return hints[index];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PricingEngine;
}