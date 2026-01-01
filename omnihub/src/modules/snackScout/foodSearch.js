// =======================
// SNACKSCOUT - FOOD SEARCH ENGINE
// Complete food database with search functionality
// =======================

class FoodSearch {
  constructor() {
    this.foodDatabase = this.initializeFoodDatabase();
  }

  /**
   * Initialize comprehensive food database
   * @returns {Array} Food items
   */
  initializeFoodDatabase() {
    return [
      // SNACKS
      {
        id: 'ramen-2pack',
        name: 'Instant Ramen',
        quantity: '2-pack',
        category: 'snack',
        type: 'snack',
        servings: 2,
        calories: 380,
        tags: ['cheap', 'quick', 'study', 'late-night'],
        dietType: ['vegetarian']
      },
      {
        id: 'cupnoodles-3pack',
        name: 'Cup Noodles',
        quantity: '3-pack',
        category: 'snack',
        type: 'snack',
        servings: 3,
        calories: 300,
        tags: ['cheap', 'quick', 'late-night'],
        dietType: ['vegetarian']
      },
      {
        id: 'trailmix-250g',
        name: 'Trail Mix',
        quantity: '250g',
        category: 'snack',
        type: 'snack',
        servings: 5,
        calories: 150,
        tags: ['healthy', 'study', 'protein'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'chocolate-dark-100g',
        name: 'Dark Chocolate',
        quantity: '100g',
        category: 'snack',
        type: 'snack',
        servings: 4,
        calories: 540,
        tags: ['study', 'sweet'],
        dietType: ['vegetarian']
      },
      {
        id: 'popcorn-300g',
        name: 'Popcorn',
        quantity: '300g',
        category: 'snack',
        type: 'snack',
        servings: 6,
        calories: 387,
        tags: ['movie', 'party'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'cookies-200g',
        name: 'Cookies',
        quantity: '200g pack',
        category: 'snack',
        type: 'snack',
        servings: 8,
        calories: 500,
        tags: ['sweet', 'late-night'],
        dietType: ['vegetarian']
      },
      {
        id: 'chips-175g',
        name: 'Potato Chips',
        quantity: '175g',
        category: 'snack',
        type: 'snack',
        servings: 3,
        calories: 536,
        tags: ['party', 'movie'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // DAIRY & PROTEIN
      {
        id: 'eggs-12pack',
        name: 'Eggs',
        quantity: '12-pack',
        category: 'dairy',
        type: 'meal',
        servings: 12,
        calories: 70,
        tags: ['protein', 'breakfast', 'gym'],
        dietType: ['vegetarian', 'high-protein']
      },
      {
        id: 'milk-2l',
        name: 'Milk',
        quantity: '2L',
        category: 'dairy',
        type: 'beverage',
        servings: 8,
        calories: 122,
        tags: ['protein', 'breakfast', 'gym'],
        dietType: ['vegetarian']
      },
      {
        id: 'cheese-shredded-200g',
        name: 'Shredded Cheese',
        quantity: '200g',
        category: 'dairy',
        type: 'meal',
        servings: 8,
        calories: 402,
        tags: ['protein', 'cooking'],
        dietType: ['vegetarian']
      },
      {
        id: 'cheese-slices-250g',
        name: 'Cheese Slices',
        quantity: '250g',
        category: 'dairy',
        type: 'meal',
        servings: 10,
        calories: 300,
        tags: ['quick', 'sandwich'],
        dietType: ['vegetarian']
      },
      {
        id: 'yogurt-1kg',
        name: 'Greek Yogurt',
        quantity: '1kg',
        category: 'dairy',
        type: 'snack',
        servings: 10,
        calories: 59,
        tags: ['healthy', 'protein', 'breakfast'],
        dietType: ['vegetarian', 'high-protein']
      },
      
      // MEAT & PROTEIN
      {
        id: 'sausages-6pack',
        name: 'Sausages',
        quantity: '6-pack',
        category: 'meat',
        type: 'meal',
        servings: 6,
        calories: 301,
        tags: ['protein', 'bbq', 'dinner'],
        dietType: ['high-protein']
      },
      {
        id: 'chicken-frozen-500g',
        name: 'Frozen Chicken Strips',
        quantity: '500g',
        category: 'meat',
        type: 'meal',
        servings: 4,
        calories: 165,
        tags: ['protein', 'gym', 'dinner'],
        dietType: ['high-protein', 'halal']
      },
      {
        id: 'tuna-cans-4pack',
        name: 'Canned Tuna',
        quantity: '4-pack',
        category: 'meat',
        type: 'meal',
        servings: 4,
        calories: 132,
        tags: ['protein', 'healthy', 'gym'],
        dietType: ['high-protein', 'halal']
      },
      
      // FRUITS & VEGETABLES
      {
        id: 'bananas-6pack',
        name: 'Bananas',
        quantity: '6-pack',
        category: 'fruit',
        type: 'snack',
        servings: 6,
        calories: 105,
        tags: ['healthy', 'study', 'gym'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'apples-6pack',
        name: 'Apples',
        quantity: '6-pack',
        category: 'fruit',
        type: 'snack',
        servings: 6,
        calories: 95,
        tags: ['healthy', 'study'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'carrots-1kg',
        name: 'Carrots',
        quantity: '1kg',
        category: 'vegetable',
        type: 'meal',
        servings: 10,
        calories: 41,
        tags: ['healthy', 'cooking'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // BAKERY & BREAD
      {
        id: 'bread-loaf',
        name: 'Bread',
        quantity: 'Loaf',
        category: 'bakery',
        type: 'meal',
        servings: 12,
        calories: 79,
        tags: ['breakfast', 'sandwich', 'cheap'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'bagels-6pack',
        name: 'Bagels',
        quantity: '6-pack',
        category: 'bakery',
        type: 'meal',
        servings: 6,
        calories: 245,
        tags: ['breakfast'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // SPREADS & CONDIMENTS
      {
        id: 'peanutbutter-375g',
        name: 'Peanut Butter',
        quantity: '375g',
        category: 'spread',
        type: 'meal',
        servings: 15,
        calories: 588,
        tags: ['protein', 'gym', 'breakfast'],
        dietType: ['vegetarian', 'vegan', 'high-protein']
      },
      {
        id: 'butter-250g',
        name: 'Butter',
        quantity: '250g',
        category: 'dairy',
        type: 'meal',
        servings: 20,
        calories: 717,
        tags: ['cooking'],
        dietType: ['vegetarian']
      },
      {
        id: 'jam-500g',
        name: 'Strawberry Jam',
        quantity: '500g',
        category: 'spread',
        type: 'meal',
        servings: 20,
        calories: 278,
        tags: ['breakfast', 'sweet'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // BEVERAGES
      {
        id: 'softdrink-1.25l',
        name: 'Soft Drink',
        quantity: '1.25L',
        category: 'beverage',
        type: 'beverage',
        servings: 5,
        calories: 140,
        tags: ['party', 'movie'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'sparkling-1.25l',
        name: 'Sparkling Drink',
        quantity: '1.25L',
        category: 'beverage',
        type: 'beverage',
        servings: 5,
        calories: 0,
        tags: ['party', 'date'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'coffee-instant-10sach',
        name: 'Instant Coffee',
        quantity: '10 sachets',
        category: 'beverage',
        type: 'beverage',
        servings: 10,
        calories: 2,
        tags: ['study', 'morning'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'energy-drink-4pack',
        name: 'Energy Drink',
        quantity: '4-pack',
        category: 'beverage',
        type: 'beverage',
        servings: 4,
        calories: 110,
        tags: ['study', 'late-night'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // FROZEN & READY MEALS
      {
        id: 'pizza-frozen-400g',
        name: 'Frozen Pizza',
        quantity: '400g',
        category: 'meal',
        type: 'meal',
        servings: 2,
        calories: 1200,
        tags: ['quick', 'dinner', 'party'],
        dietType: ['vegetarian']
      },
      {
        id: 'icecream-1l',
        name: 'Ice Cream',
        quantity: '1L tub',
        category: 'dessert',
        type: 'dessert',
        servings: 8,
        calories: 207,
        tags: ['sweet', 'date', 'party'],
        dietType: ['vegetarian']
      },
      {
        id: 'fries-frozen-1kg',
        name: 'Frozen Fries',
        quantity: '1kg',
        category: 'meal',
        type: 'meal',
        servings: 6,
        calories: 312,
        tags: ['quick', 'cheap'],
        dietType: ['vegetarian', 'vegan']
      },
      
      // PASTA & RICE
      {
        id: 'pasta-500g',
        name: 'Pasta',
        quantity: '500g',
        category: 'meal',
        type: 'meal',
        servings: 5,
        calories: 371,
        tags: ['cheap', 'dinner', 'bulk'],
        dietType: ['vegetarian', 'vegan']
      },
      {
        id: 'rice-2kg',
        name: 'White Rice',
        quantity: '2kg',
        category: 'meal',
        type: 'meal',
        servings: 20,
        calories: 130,
        tags: ['cheap', 'bulk', 'dinner'],
        dietType: ['vegetarian', 'vegan', 'halal']
      }
    ];
  }

  /**
   * Search food items
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Array} Matching food items
   */
  search(query = '', filters = {}) {
    let results = [...this.foodDatabase];
    
    // Text search
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      results = results.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    
    // Filter by type
    if (filters.type) {
      results = results.filter(item => item.type === filters.type);
    }
    
    // Filter by category
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }
    
    // Filter by diet
    if (filters.diet) {
      results = results.filter(item => 
        item.dietType.includes(filters.diet)
      );
    }
    
    // Filter by tags
    if (filters.tag) {
      results = results.filter(item => 
        item.tags.includes(filters.tag)
      );
    }
    
    // Filter by max calories
    if (filters.maxCalories) {
      results = results.filter(item => item.calories <= filters.maxCalories);
    }
    
    return results;
  }

  /**
   * Get food item by ID
   * @param {string} id - Food ID
   * @returns {Object|null} Food item
   */
  getById(id) {
    return this.foodDatabase.find(item => item.id === id) || null;
  }

  /**
   * Get all categories
   * @returns {Array} Unique categories
   */
  getCategories() {
    return [...new Set(this.foodDatabase.map(item => item.category))].sort();
  }

  /**
   * Get all types
   * @returns {Array} Unique types
   */
  getTypes() {
    return [...new Set(this.foodDatabase.map(item => item.type))].sort();
  }

  /**
   * Get all tags
   * @returns {Array} Unique tags
   */
  getTags() {
    const tags = new Set();
    this.foodDatabase.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return [...tags].sort();
  }

  /**
   * Get all diet types
   * @returns {Array} Unique diet types
   */
  getDietTypes() {
    const diets = new Set();
    this.foodDatabase.forEach(item => {
      item.dietType.forEach(diet => diets.add(diet));
    });
    return [...diets].sort();
  }

  /**
   * Get random food items
   * @param {number} count - Number of items
   * @returns {Array} Random items
   */
  getRandom(count = 10) {
    const shuffled = [...this.foodDatabase].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get items by meal time
   * @param {string} mealTime - breakfast, lunch, dinner, snack
   * @returns {Array} Matching items
   */
  getByMealTime(mealTime) {
    const mealTags = {
      breakfast: ['breakfast', 'morning'],
      lunch: ['lunch', 'quick', 'sandwich'],
      dinner: ['dinner', 'meal', 'cooking'],
      snack: ['snack', 'study', 'late-night']
    };
    
    const tags = mealTags[mealTime] || [];
    return this.foodDatabase.filter(item => 
      item.tags.some(tag => tags.includes(tag))
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FoodSearch;
}