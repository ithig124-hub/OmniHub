// =======================
// SNACKSCOUT - CART STATE MANAGER
// Handles shopping cart with localStorage persistence
// =======================

class CartState {
  constructor() {
    this.storageKey = 'snackScout_cart';
    this.cart = this.loadCart();
    this.listeners = [];
  }

  /**
   * Load cart from localStorage
   * @returns {Array} Cart items
   */
  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }

  /**
   * Add item to cart
   * @param {Object} item - Food item with price, name, etc.
   */
  addItem(item) {
    const existingIndex = this.cart.findIndex(i => i.id === item.id && i.store === item.store);
    
    if (existingIndex >= 0) {
      // Item exists, increase quantity
      this.cart[existingIndex].quantity = (this.cart[existingIndex].quantity || 1) + 1;
    } else {
      // New item
      this.cart.push({
        ...item,
        quantity: 1,
        addedAt: Date.now()
      });
    }
    
    this.saveCart();
  }

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID
   * @param {string} store - Store name
   */
  removeItem(itemId, store) {
    this.cart = this.cart.filter(item => !(item.id === itemId && item.store === store));
    this.saveCart();
  }

  /**
   * Update item quantity
   * @param {string} itemId - Item ID
   * @param {string} store - Store name
   * @param {number} quantity - New quantity
   */
  updateQuantity(itemId, store, quantity) {
    const item = this.cart.find(i => i.id === itemId && i.store === store);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Get all cart items
   * @returns {Array} Cart items
   */
  getItems() {
    return this.cart;
  }

  /**
   * Get total cost
   * @returns {number} Total cost
   */
  getTotalCost() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  }

  /**
   * Get item count
   * @returns {number} Total number of items
   */
  getItemCount() {
    return this.cart.reduce((count, item) => count + (item.quantity || 1), 0);
  }

  /**
   * Get total servings estimate
   * @returns {number} Estimated servings
   */
  getTotalServings() {
    return this.cart.reduce((servings, item) => {
      return servings + (item.servings || 1) * (item.quantity || 1);
    }, 0);
  }

  /**
   * Get cost per meal/snack
   * @returns {number} Cost per serving
   */
  getCostPerServing() {
    const total = this.getTotalCost();
    const servings = this.getTotalServings();
    return servings > 0 ? total / servings : 0;
  }

  /**
   * Check if within budget
   * @param {number} budget - Budget limit
   * @returns {boolean} True if within budget
   */
  isWithinBudget(budget) {
    return this.getTotalCost() <= budget;
  }

  /**
   * Get items grouped by store
   * @returns {Object} Items grouped by store
   */
  getItemsByStore() {
    return this.cart.reduce((grouped, item) => {
      const store = item.store || 'Unknown';
      if (!grouped[store]) {
        grouped[store] = [];
      }
      grouped[store].push(item);
      return grouped;
    }, {});
  }

  /**
   * Add change listener
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove change listener
   * @param {Function} callback - Callback function
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.cart));
  }

  /**
   * Export cart as text
   * @returns {string} Cart as formatted text
   */
  exportAsText() {
    let text = '🛒 SnackScout Shopping List\n';
    text += '=' .repeat(40) + '\n\n';
    
    const byStore = this.getItemsByStore();
    for (const [store, items] of Object.entries(byStore)) {
      text += `📍 ${store}\n`;
      items.forEach(item => {
        text += `  • ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      text += '\n';
    }
    
    text += `💰 Total: $${this.getTotalCost().toFixed(2)}\n`;
    text += `🍽️ Servings: ${this.getTotalServings()}\n`;
    text += `📊 Cost per serving: $${this.getCostPerServing().toFixed(2)}\n`;
    
    return text;
  }

  /**
   * Export cart as CSV
   * @returns {string} Cart as CSV
   */
  exportAsCSV() {
    let csv = 'Store,Item,Quantity,Price,Total\n';
    this.cart.forEach(item => {
      csv += `${item.store},${item.name},${item.quantity},$${item.price},$${(item.price * item.quantity).toFixed(2)}\n`;
    });
    return csv;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartState;
}