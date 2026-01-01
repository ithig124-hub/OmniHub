// =======================
// SNACKSCOUT - MAIN CONTROLLER
// Student-focused food & snack discovery
// =======================

console.log('🍿 SnackScout Module Loading...');

// =======================
// INITIALIZE CORE SYSTEMS
// =======================
let imageLoader;
let cartState;
let foodSearch;
let pricingEngine;
let locationFinder;
let currentFilters = {};
let mealModeActive = false;

// =======================
// DOM ELEMENTS
// =======================
let searchInput, foodGrid, emptyState;
let cartBadge, cartItemsContainer, cartItemsCount, cartServingsCount;
let cartSubtotal, cartPerServing, cartTotal;
let filterType, filterDiet, filterTag, filterBudget;

// =======================
// INITIALIZATION
// =======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Initializing SnackScout...');
  
  try {
    // Initialize core systems
    imageLoader = new ImageLoader();
    cartState = new CartState();
    foodSearch = new FoodSearch();
    pricingEngine = new PricingEngine();
    locationFinder = new LocationFinder();
    
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Listen for cart changes
    cartState.addListener(updateCartDisplay);
    
    // Initial render
    renderFoodGrid();
    updateCartDisplay();
    
    console.log('✅ SnackScout initialized successfully!');
  } catch (error) {
    console.error('❌ SnackScout initialization failed:', error);
  }
});

/**
 * Cache DOM elements
 */
function cacheElements() {
  // Search & Filters
  searchInput = document.getElementById('search-input');
  foodGrid = document.getElementById('food-grid');
  emptyState = document.getElementById('empty-state');
  filterType = document.getElementById('filter-type');
  filterDiet = document.getElementById('filter-diet');
  filterTag = document.getElementById('filter-tag');
  filterBudget = document.getElementById('filter-budget');
  
  // Cart elements
  cartBadge = document.getElementById('cart-badge');
  cartItemsContainer = document.getElementById('cart-items');
  cartItemsCount = document.getElementById('cart-items-count');
  cartServingsCount = document.getElementById('cart-servings-count');
  cartSubtotal = document.getElementById('cart-subtotal');
  cartPerServing = document.getElementById('cart-per-serving');
  cartTotal = document.getElementById('cart-total');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search
  document.getElementById('search-btn').addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Filters
  filterType.addEventListener('change', handleSearch);
  filterDiet.addEventListener('change', handleSearch);
  filterTag.addEventListener('change', handleSearch);
  filterBudget.addEventListener('change', handleSearch);
  
  // Header buttons
  document.getElementById('templates-btn').addEventListener('click', openTemplatesModal);
  document.getElementById('stores-btn').addEventListener('click', openStoresModal);
  document.getElementById('meal-mode-btn').addEventListener('click', toggleMealMode);
  
  // Cart actions
  document.getElementById('export-cart-btn').addEventListener('click', openExportModal);
  document.getElementById('clear-cart-btn').addEventListener('click', handleClearCart);
  
  // Modal close buttons
  document.getElementById('close-templates').addEventListener('click', () => closeModal('templates-modal'));
  document.getElementById('close-stores').addEventListener('click', () => closeModal('stores-modal'));
  document.getElementById('close-export').addEventListener('click', () => closeModal('export-modal'));
  
  // Export buttons
  document.getElementById('copy-text-btn').addEventListener('click', () => copyToClipboard('text'));
  document.getElementById('copy-csv-btn').addEventListener('click', () => copyToClipboard('csv'));
  
  // Store search
  document.getElementById('store-search').addEventListener('input', handleStoreSearch);
  
  // Close modals on outside click
  ['templates-modal', 'stores-modal', 'export-modal'].forEach(modalId => {
    document.getElementById(modalId).addEventListener('click', (e) => {
      if (e.target.id === modalId) closeModal(modalId);
    });
  });
}

/**
 * Handle search
 */
function handleSearch() {
  const query = searchInput.value;
  currentFilters = {
    type: filterType.value || undefined,
    diet: filterDiet.value || undefined,
    tag: filterTag.value || undefined
  };
  
  renderFoodGrid(query);
}

/**
 * Render food grid
 */
function renderFoodGrid(query = '') {
  const results = foodSearch.search(query, currentFilters);
  
  foodGrid.innerHTML = '';
  
  if (results.length === 0) {
    foodGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  foodGrid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  results.forEach(food => {
    const card = createFoodCard(food);
    foodGrid.appendChild(card);
  });
}

/**
 * Create food card
 */
function createFoodCard(food) {
  const card = document.createElement('div');
  card.className = 'food-card';
  card.setAttribute('data-testid', `food-card-${food.id}`);
  
  // Get image
  const imageUrl = imageLoader.getImageUrl(food.name, food.category);
  
  // Get prices
  const prices = pricingEngine.getAllPrices(food.id);
  const cheapest = pricingEngine.getCheapestStore(food.id);
  
  // Build price rows
  let priceHTML = '';
  prices.slice(0, 3).forEach(p => {
    const isCheapest = cheapest && p.store === cheapest.store;
    priceHTML += `
      <div class="price-row">
        <span class="price-store">${p.store}</span>
        <span class="price-amount ${isCheapest ? 'cheapest' : ''}">$${p.price.toFixed(2)}</span>
      </div>
    `;
  });
  
  card.innerHTML = `
    <img src="${imageUrl}" alt="${food.name}" class="food-image" loading="lazy">
    <div class="food-info">
      <div class="food-name">${food.name}</div>
      <div class="food-quantity">${food.quantity}</div>
      <div class="food-meta">
        <span class="food-category">${food.category}</span>
        <span class="food-calories">${food.calories} cal</span>
      </div>
      <div class="food-prices">
        ${priceHTML}
      </div>
      <button class="add-to-cart-btn" data-food-id="${food.id}" data-store="${cheapest?.store || 'Woolworths'}" data-testid="add-to-cart-${food.id}">
        🛒 Add to Cart - $${cheapest?.price.toFixed(2) || '0.00'}
      </button>
    </div>
  `;
  
  // Add to cart listener
  const addBtn = card.querySelector('.add-to-cart-btn');
  addBtn.addEventListener('click', () => {
    handleAddToCart(food.id, addBtn.dataset.store);
  });
  
  return card;
}

/**
 * Handle add to cart
 */
function handleAddToCart(foodId, storeName) {
  const food = foodSearch.getById(foodId);
  const price = pricingEngine.getPrice(foodId, storeName);
  
  if (!food || !price) {
    console.error('Food or price not found');
    return;
  }
  
  const cartItem = {
    id: foodId,
    name: food.name,
    quantity: food.quantity,
    category: food.category,
    price: price,
    store: storeName,
    servings: food.servings,
    calories: food.calories
  };
  
  cartState.addItem(cartItem);
  
  // Visual feedback
  showNotification(`Added ${food.name} to cart!`);
}

/**
 * Update cart display
 */
function updateCartDisplay() {
  const items = cartState.getItems();
  const total = cartState.getTotalCost();
  const itemCount = cartState.getItemCount();
  const servings = cartState.getTotalServings();
  const perServing = cartState.getCostPerServing();
  
  // Update badge and counts
  cartBadge.textContent = `(${itemCount})`;
  cartItemsCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
  cartServingsCount.textContent = `${servings} serving${servings !== 1 ? 's' : ''}`;
  
  // Update totals
  cartSubtotal.textContent = `$${total.toFixed(2)}`;
  cartPerServing.textContent = `$${perServing.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;
  
  // Render cart items
  if (items.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <div class="empty-state-text">Your cart is empty</div>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = '';
    items.forEach(item => {
      const cartItemEl = createCartItem(item);
      cartItemsContainer.appendChild(cartItemEl);
    });
  }
}

/**
 * Create cart item element
 */
function createCartItem(item) {
  const el = document.createElement('div');
  el.className = 'cart-item';
  el.setAttribute('data-testid', `cart-item-${item.id}`);
  
  const itemTotal = item.price * item.quantity;
  
  el.innerHTML = `
    <div class="cart-item-header">
      <div class="cart-item-name">${item.name}</div>
      <button class="remove-btn" data-item-id="${item.id}" data-store="${item.store}" data-testid="remove-${item.id}">✕</button>
    </div>
    <div class="cart-item-details">
      ${item.store} • ${item.quantity} • ${item.servings} servings
    </div>
    <div class="cart-item-controls">
      <div class="quantity-controls">
        <button class="qty-btn" data-action="decrease" data-item-id="${item.id}" data-store="${item.store}" data-testid="qty-decrease-${item.id}">-</button>
        <span data-testid="qty-${item.id}">${item.quantity}</span>
        <button class="qty-btn" data-action="increase" data-item-id="${item.id}" data-store="${item.store}" data-testid="qty-increase-${item.id}">+</button>
      </div>
      <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
    </div>
  `;
  
  // Remove button
  el.querySelector('.remove-btn').addEventListener('click', () => {
    cartState.removeItem(item.id, item.store);
  });
  
  // Quantity buttons
  el.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
      if (newQty > 0) {
        cartState.updateQuantity(item.id, item.store, newQty);
      }
    });
  });
  
  return el;
}

/**
 * Handle clear cart
 */
function handleClearCart() {
  if (confirm('Clear all items from cart?')) {
    cartState.clearCart();
    showNotification('Cart cleared!');
  }
}

/**
 * Open templates modal
 */
function openTemplatesModal() {
  const modal = document.getElementById('templates-modal');
  const grid = document.getElementById('templates-grid');
  
  grid.innerHTML = '';
  
  if (typeof SHOPPING_LIST_TEMPLATES !== 'undefined') {
    SHOPPING_LIST_TEMPLATES.forEach(template => {
      const card = createTemplateCard(template);
      grid.appendChild(card);
    });
  }
  
  modal.classList.add('active');
}

/**
 * Create template card
 */
function createTemplateCard(template) {
  const card = document.createElement('div');
  card.className = 'template-card';
  card.setAttribute('data-testid', `template-${template.id}`);
  
  const itemsList = template.items.map(item => 
    `<li>• ${item.name} (${item.quantity})</li>`
  ).join('');
  
  card.innerHTML = `
    <div class="template-header">
      <div class="template-name">${template.name}</div>
      <div class="template-cost">$${template.estimatedCost.min}-${template.estimatedCost.max}</div>
    </div>
    <ul class="template-items">
      ${itemsList}
    </ul>
  `;
  
  card.addEventListener('click', () => {
    loadTemplate(template);
    closeModal('templates-modal');
  });
  
  return card;
}

/**
 * Load template into cart
 */
function loadTemplate(template) {
  template.items.forEach(templateItem => {
    // Find matching food in database
    const food = foodSearch.search(templateItem.name)[0];
    if (food) {
      const cheapest = pricingEngine.getCheapestStore(food.id);
      if (cheapest) {
        handleAddToCart(food.id, cheapest.store);
      }
    }
  });
  
  showNotification(`Loaded ${template.name}!`);
}

/**
 * Open stores modal
 */
function openStoresModal() {
  const modal = document.getElementById('stores-modal');
  renderStoresList();
  modal.classList.add('active');
}

/**
 * Handle store search
 */
function handleStoreSearch() {
  const query = document.getElementById('store-search').value;
  renderStoresList(query);
}

/**
 * Render stores list
 */
function renderStoresList(query = '') {
  const list = document.getElementById('stores-list');
  const stores = locationFinder.search(query);
  
  list.innerHTML = '';
  
  stores.forEach(store => {
    const storeCard = document.createElement('div');
    storeCard.className = 'template-card';
    storeCard.setAttribute('data-testid', `store-${store.id}`);
    
    const distance = store.distance ? locationFinder.formatDistance(store.distance) : 'Unknown';
    const walkTime = store.distance ? locationFinder.getWalkingTime(store.distance) : '';
    
    storeCard.innerHTML = `
      <div class="template-header">
        <div class="template-name">${store.name}</div>
        <div class="template-cost">${distance}</div>
      </div>
      <div class="template-items">
        <li>${store.street}, ${store.suburb}</li>
        ${walkTime ? `<li>${walkTime}</li>` : ''}
      </div>
    `;
    
    storeCard.addEventListener('click', () => {
      locationFinder.openInMap(store);
      closeModal('stores-modal');
    });
    
    list.appendChild(storeCard);
  });
}

/**
 * Toggle meal mode
 */
function toggleMealMode() {
  mealModeActive = !mealModeActive;
  const btn = document.getElementById('meal-mode-btn');
  
  if (mealModeActive) {
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-success');
    btn.textContent = '✅ Meal Mode ON';
    showNotification('Meal Mode activated! Items grouped by meal type.');
  } else {
    btn.classList.remove('btn-success');
    btn.classList.add('btn-secondary');
    btn.textContent = '🍽️ Meal Mode';
  }
  
  // Re-render grid with meal grouping
  renderFoodGrid(searchInput.value);
}

/**
 * Open export modal
 */
function openExportModal() {
  if (cartState.getItemCount() === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  const modal = document.getElementById('export-modal');
  const preview = document.getElementById('export-preview');
  
  preview.value = cartState.exportAsText();
  modal.classList.add('active');
}

/**
 * Copy to clipboard
 */
function copyToClipboard(format) {
  const text = format === 'csv' ? cartState.exportAsCSV() : cartState.exportAsText();
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification(`Copied as ${format.toUpperCase()}!`);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Show notification
 */
function showNotification(message) {
  // Simple alert for now - can be replaced with toast notification
  console.log('📢', message);
  
  // Try to use parent OmniHub notification if available
  if (window.parent && window.parent.OmniHub && window.parent.OmniHub.notify) {
    window.parent.OmniHub.notify(message);
  }
}

// =======================
// EXPOSE GLOBAL API
// =======================
window.SnackScout = {
  search: (query) => foodSearch.search(query),
  addToCart: handleAddToCart,
  getCart: () => cartState.getItems(),
  clearCart: () => cartState.clearCart()
};

// Module lifecycle hooks for OmniHub navigation
window.snackScoutModule = {
  onActivate: () => {
    console.log('📍 SnackScout activated');
    // Refresh display when module becomes active
    updateCartDisplay();
  },
  onDeactivate: () => {
    console.log('📤 SnackScout deactivated');
    // Save cart state when leaving module
  },
  getState: () => ({
    currentFilters,
    mealModeActive,
    searchQuery: searchInput?.value || '',
    cartItems: cartState ? cartState.getItems() : []
  }),
  restoreState: (state) => {
    if (state.currentFilters) currentFilters = state.currentFilters;
    if (state.mealModeActive !== undefined) {
      mealModeActive = state.mealModeActive;
      const btn = document.getElementById('meal-mode-btn');
      if (btn) {
        btn.classList.toggle('btn-success', mealModeActive);
        btn.classList.toggle('btn-secondary', !mealModeActive);
        btn.textContent = mealModeActive ? '✅ Meal Mode ON' : '🍽️ Meal Mode';
      }
    }
    if (state.searchQuery && searchInput) {
      searchInput.value = state.searchQuery;
    }
    if (state.cartItems && cartState) {
      // Restore cart items
      state.cartItems.forEach(item => {
        cartState.addItem(item);
      });
    }
  }
};

console.log('✅ SnackScout ready!');
