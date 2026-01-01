// =======================
// OMNIHUB RENDERER - V3
// Uses core navigation system + category dashboards
// =======================

console.log('🚀 OmniHub Renderer Starting (V3)...');

// =======================
// MODULE CONFIGURATION
// =======================
const MODULES = [
  { id: 'map', name: 'Map', icon: '🗺️', path: './modules/map/map.html' },
  { id: 'globe', name: 'Globe', icon: '🌍', path: './modules/globe/globe.html' },
  { id: 'notes', name: 'Notes', icon: '📝', path: './modules/notes/notes.html' },
  { id: 'library', name: 'Library', icon: '📚', path: './modules/library/library.html' },
  { id: 'search', name: 'Search', icon: '🔍', path: './modules/search/search.html' },
  { id: 'studyVault', name: 'Study Vault', icon: '🎓', path: './modules/studyVault/studyVault.html' },
  { id: 'factLens', name: 'FactLens', icon: '🔬', path: './modules/factLens/factLens.html' },
  { id: 'snackScout', name: 'SnackScout', icon: '🍿', path: './modules/snackScout/snackScout.html' },
  { id: 'dashboard', name: 'Dashboard', icon: '📊', path: './modules/dashboard/dashboard.html' },
  { id: 'tracking', name: 'Tracking', icon: '📍', path: './modules/tracking/tracking.html' },
  { id: 'theme', name: 'Theme', icon: '🎨', path: './modules/theme/theme.html' }
];

// =======================
// CORE INSTANCES
// =======================
let navigationController;
let inputHandler;
let loadingController;
let dashboardRouter; // V3: Dashboard routing system

// =======================
// DOM ELEMENTS
// =======================
let moduleContainer;
let navBar;
let moduleTitle;
let moduleSelector;
let moduleDropdown;

// =======================
// INITIALIZATION
// =======================
function init() {
  console.log('🎨 Initializing OmniHub with Navigation Engine...');
  
  try {
    // Cache DOM elements
    moduleContainer = document.getElementById('module-container');
    navBar = document.getElementById('nav-bar');
    moduleTitle = document.getElementById('module-title');
    moduleSelector = document.getElementById('module-selector');
    moduleDropdown = document.getElementById('module-dropdown');
    
    console.log('📍 DOM Elements found:', {
      moduleContainer: !!moduleContainer,
      navBar: !!navBar,
      moduleTitle: !!moduleTitle,
      moduleSelector: !!moduleSelector,
      moduleDropdown: !!moduleDropdown
    });
    
    // Initialize loading controller FIRST (it's already showing)
    try {
      if (typeof window.LoadingController !== 'undefined') {
        loadingController = new window.LoadingController();
        loadingController.init();
        loadingController.updateProgress('Initializing OmniHub...');
      }
    } catch (loadErr) {
      console.warn('⚠️ LoadingController init failed:', loadErr);
    }
    
    // Initialize navigation controller
    console.log('🔧 Attempting to initialize NavigationController...');
    console.log('🔧 window.NavigationController exists?', typeof window.NavigationController !== 'undefined');
    
    try {
      if (typeof window.NavigationController !== 'undefined') {
        navigationController = new window.NavigationController(MODULES);
        console.log('✅ NavigationController initialized with modules:', MODULES.map(m => m.id));
      } else {
        console.error('❌ window.NavigationController is undefined!');
        // Fallback: Create simple navigation object
        navigationController = createFallbackNavigation();
        console.log('⚠️ Using fallback navigation');
      }
    } catch (navErr) {
      console.error('❌ NavigationController init failed with error:', navErr);
      console.warn('⚠️ NavigationController init failed, using fallback:', navErr);
      navigationController = createFallbackNavigation();
    }
    
    // V3: Initialize Dashboard Router
    try {
      if (typeof window.DashboardRouter !== 'undefined' && typeof window.CATEGORY_DASHBOARDS !== 'undefined') {
        dashboardRouter = new window.DashboardRouter(navigationController);
        dashboardRouter.setDashboards(window.CATEGORY_DASHBOARDS);
        console.log('🧭 Dashboard Router initialized with V3 categories');
      }
    } catch (dashErr) {
      console.warn('⚠️ Dashboard Router init failed (continuing without dashboards):', dashErr);
    }
    
    // Setup event listeners
    setupNavigationEvents();
    
    // Create navigation UI (dropdown + hidden nav bar for compatibility)
    createNavigationBar();
    createModuleDropdown();
    createModuleSelector();
    setupHeaderTime();
    
    // Setup direct keyboard navigation (fallback)
    setupDirectKeyboardNavigation();
    
    // Initialize input handler
    try {
      if (typeof window.InputHandler !== 'undefined') {
        inputHandler = new window.InputHandler(navigationController);
        inputHandler.init(moduleContainer);
      }
    } catch (inputErr) {
      console.warn('⚠️ InputHandler init failed:', inputErr);
    }
    
    // V3: Load Search module (OmniSearch) as entry point
    console.log('🔍 V3 Mode: Loading Search module as entry point');
    loadModule(4, 'init'); // Search is at index 4
    
    console.log('✅ OmniHub Navigation Engine initialized successfully!');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    if (loadingController) loadingController.forceHide();
    showError('Failed to initialize OmniHub', error.message);
  }
}

// Fallback navigation if NavigationController fails to load
function createFallbackNavigation() {
  return {
    modules: MODULES,
    currentIndex: 1,
    currentModule: MODULES[1],
    isTransitioning: false,
    eventListeners: { beforeNavigate: [], afterNavigate: [], moduleActivate: [], moduleDeactivate: [] },
    on: function(event, cb) { this.eventListeners[event]?.push(cb); },
    emit: function(event, data) { this.eventListeners[event]?.forEach(cb => cb(data)); },
    isNavigating: function() { return this.isTransitioning; },
    getCurrentIndex: function() { return this.currentIndex; },
    getCurrentModule: function() { return this.currentModule; },
    getAllModules: function() { return this.modules; },
    next: function() {
      if (this.isTransitioning) return { success: false };
      this.currentIndex = (this.currentIndex + 1) % this.modules.length;
      this.currentModule = this.modules[this.currentIndex];
      this.isTransitioning = true;
      return { success: true, index: this.currentIndex, module: this.currentModule, direction: 'next' };
    },
    previous: function() {
      if (this.isTransitioning) return { success: false };
      this.currentIndex = (this.currentIndex - 1 + this.modules.length) % this.modules.length;
      this.currentModule = this.modules[this.currentIndex];
      this.isTransitioning = true;
      return { success: true, index: this.currentIndex, module: this.currentModule, direction: 'prev' };
    },
    jumpTo: function(target) {
      if (this.isTransitioning) return { success: false };
      let idx = typeof target === 'string' ? this.modules.findIndex(m => m.id === target) : target;
      if (idx < 0 || idx >= this.modules.length) return { success: false };
      this.currentIndex = idx;
      this.currentModule = this.modules[idx];
      this.isTransitioning = true;
      return { success: true, index: idx, module: this.currentModule, direction: 'jump' };
    },
    completeTransition: function() {
      this.isTransitioning = false;
      this.emit('afterNavigate', { module: this.currentModule, index: this.currentIndex });
    }
  };
}

// Direct keyboard navigation fallback
function setupDirectKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Arrow keys with immediate navigation (no space needed)
    if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      const result = navigationController.next();
      if (result.success) loadModule(result.index, 'next');
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      const result = navigationController.previous();
      if (result.success) loadModule(result.index, 'prev');
    }
    
    // Number keys 1-9 for direct module access
    if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey) {
      const idx = parseInt(e.key) - 1;
      if (idx < MODULES.length && idx !== navigationController.getCurrentIndex()) {
        const result = navigationController.jumpTo(idx);
        if (result.success) loadModule(result.index, 'jump');
      }
    }
  });
  console.log('⌨️ Direct keyboard navigation enabled (Ctrl+Arrow, 1-9 keys)');
}

// =======================
// NAVIGATION EVENTS
// =======================
function setupNavigationEvents() {
  // Before navigation
  navigationController.on('beforeNavigate', (data) => {
    console.log('🔄 Preparing to navigate:', data);
  });

  // After navigation
  navigationController.on('afterNavigate', (data) => {
    console.log('✅ Navigation completed:', data);
    updateUI(data.module, data.index);
  });

  // Module activation
  navigationController.on('moduleActivate', (module) => {
    console.log('📍 Module activated:', module.name);
  });

  // Module deactivation
  navigationController.on('moduleDeactivate', (module) => {
    console.log('📤 Module deactivated:', module.name);
  });
}

// =======================
// NAVIGATION BAR
// =======================
function createNavigationBar() {
  navBar.innerHTML = '';
  
  MODULES.forEach((module, index) => {
    const navBtn = document.createElement('button');
    navBtn.className = 'nav-btn';
    navBtn.setAttribute('data-module', index);
    navBtn.setAttribute('data-testid', `nav-${module.id}-btn`);
    navBtn.innerHTML = `
      <span class="nav-icon">${module.icon}</span>
      <span class="nav-label">${module.name}</span>
    `;
    
    // Active state for Notes module (index 1)
    if (index === 1) {
      navBtn.classList.add('active');
    }
    
    // Click handler - uses navigation controller
    navBtn.addEventListener('click', () => {
      if (!navigationController.isNavigating() && index !== navigationController.getCurrentIndex()) {
        const result = navigationController.jumpTo(index);
        if (result.success) {
          loadModule(result.index, 'jump');
        }
      }
    });
    
    navBar.appendChild(navBtn);
  });
  
  console.log('📍 Navigation bar created');
}

// =======================
// CATEGORY DROPDOWN (V3 - Shows standalone modules + categories)
// =======================
let dropdownEventListenersAttached = false;

function createModuleDropdown() {
  if (!moduleDropdown || !moduleTitle) return;
  
  moduleDropdown.innerHTML = '';
  
  // Add standalone modules first (Advanced Search and Dashboard)
  const standaloneModules = [
    { id: 'search', name: 'Advanced Search', icon: '🔍', index: 4 },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', index: 8 }
  ];
  
  standaloneModules.forEach(module => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.setAttribute('data-module-id', module.id);
    item.setAttribute('data-index', module.index);
    item.innerHTML = `
      <span class="dropdown-item-icon">${module.icon}</span>
      <span>${module.name}</span>
    `;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 Dropdown: Navigating to ${module.name}`);
      const result = navigationController.jumpTo(module.index);
      if (result.success) {
        loadModule(result.index, 'jump');
      }
      toggleDropdown(false);
    });
    
    moduleDropdown.appendChild(item);
  });
  
  // Add separator
  const separator = document.createElement('div');
  separator.style.cssText = 'height: 1px; background: rgba(255,255,255,0.2); margin: 8px 0;';
  moduleDropdown.appendChild(separator);
  
  // Add category dashboards
  if (typeof window.CATEGORY_DASHBOARDS !== 'undefined') {
    window.CATEGORY_DASHBOARDS.forEach((dashboard, index) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.setAttribute('data-dashboard-id', dashboard.id);
      item.setAttribute('data-index', index);
      item.innerHTML = `
        <span class="dropdown-item-icon">${dashboard.icon}</span>
        <span>${dashboard.name}</span>
      `;
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        loadDashboard(index, 'jump');
        toggleDropdown(false);
      });
      
      moduleDropdown.appendChild(item);
    });
    console.log('📍 Dropdown created: 2 standalone modules + category dashboards');
  }
  
  // Attach event listeners only once
  if (!dropdownEventListenersAttached) {
    // Click on title to toggle dropdown
    moduleTitle.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('🖱️ Module title clicked, toggling dropdown');
      toggleDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#module-title-container')) {
        toggleDropdown(false);
      }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleDropdown(false);
      }
    });
    
    dropdownEventListenersAttached = true;
    console.log('📍 Dropdown event listeners attached');
  }
}

function toggleDropdown(show) {
  if (!moduleDropdown || !moduleTitle) {
    console.warn('⚠️ Dropdown elements not found');
    return;
  }
  
  const isHidden = moduleDropdown.classList.contains('hidden');
  if (show === undefined) show = isHidden;
  
  if (show) {
    console.log('📂 Opening dropdown');
    moduleDropdown.classList.remove('hidden');
    moduleTitle.classList.add('open');
  } else {
    console.log('📁 Closing dropdown');
    moduleDropdown.classList.add('hidden');
    moduleTitle.classList.remove('open');
  }
}

// =======================
// HEADER TIME DISPLAY
// =======================
function setupHeaderTime() {
  const headerTime = document.getElementById('header-time');
  if (!headerTime) return;
  
  function updateTime() {
    const now = new Date();
    headerTime.textContent = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  updateTime();
  setInterval(updateTime, 1000);
  console.log('⏰ Header time display active');
}

// =======================
// MODULE SELECTOR (Hidden, for compatibility)
// =======================
function createModuleSelector() {
  if (!moduleSelector) return;
  
  moduleSelector.innerHTML = '';
  
  MODULES.forEach((module, index) => {
    const option = document.createElement('option');
    option.value = module.id;
    option.textContent = `${module.icon} ${module.name}`;
    if (index === 1) {
      option.selected = true;
    }
    moduleSelector.appendChild(option);
  });
  
  console.log('🎯 Module selector created (hidden)');
}

// =======================
// MODULE LOADING
// =======================
function loadModule(index, direction = 'next') {
  if (navigationController.isNavigating() || index < 0 || index >= MODULES.length) {
    return;
  }
  
  const module = MODULES[index];
  
  console.log(`🔄 Loading module: ${module.name} (${index}) [${direction}]`);
  
  // Show loading using centralized controller
  if (loadingController) {
    loadingController.show(module.name);
  }
  
  // Create iframe and load module directly via src
  createModuleIframe(module, direction, index);
}

function createModuleIframe(module, direction, index) {
  // Remove old module
  const oldIframe = moduleContainer.querySelector('.module-iframe');
  if (oldIframe) {
    oldIframe.remove();
  }
  
  // Create iframe for module isolation
  const iframe = document.createElement('iframe');
  iframe.className = 'module-iframe hw-accelerated';
  iframe.setAttribute('data-module-id', module.id);
  iframe.setAttribute('data-testid', `module-${module.id}`);
  
  // Apply transition
  applyTransition(iframe, direction);
  
  // Handle iframe load
  iframe.onload = () => {
    console.log(`✅ Module ${module.name} iframe loaded`);
    
    // Apply global theme to iframe module
    if (window.GlobalTheme) {
      setTimeout(() => {
        try {
          window.GlobalTheme.applyToIframe(iframe);
          console.log('🎨 Global theme applied to iframe module');
        } catch (e) {
          console.warn('Could not apply theme to iframe:', e);
        }
      }, 100);
    }
    
    // Hide loading after a short delay to ensure content is rendered
    setTimeout(() => {
      if (loadingController) {
        loadingController.hide();
      }
      navigationController.completeTransition();
      updateUI(module, index);
    }, 200);
  };
  
  // Handle iframe error
  iframe.onerror = (error) => {
    console.error('❌ Module iframe error:', error);
    if (loadingController) {
      loadingController.forceHide();
    }
    showError(`Failed to load ${module.name}`, 'Module failed to load');
    navigationController.isTransitioning = false;
  };
  
  // Add to container
  moduleContainer.appendChild(iframe);
  
  // Set src to load module (this works better with file:// protocol in Electron)
  iframe.src = module.path;
  
  // Fallback timeout - force hide loading after 5 seconds
  setTimeout(() => {
    if (loadingController && loadingController.isLoading()) {
      console.log(`⚡ Fallback timeout: force hiding loading for ${module.name}`);
      loadingController.forceHide();
      navigationController.completeTransition();
      updateUI(module, index);
    }
  }, 5000);
  
  return iframe;
}


function applyTransition(element, direction) {
  // Remove any existing transition classes
  element.classList.remove(
    'transition-slide-in-right',
    'transition-slide-in-left',
    'transition-fade-in'
  );
  
  // Apply appropriate transition
  if (direction === 'next') {
    element.classList.add('transition-slide-in-right');
  } else if (direction === 'prev') {
    element.classList.add('transition-slide-in-left');
  } else if (direction === 'jump' || direction === 'init') {
    element.classList.add('transition-fade-in');
  }
}

// =======================
// DASHBOARD LOADING (V3)
// =======================
function loadDashboard(index, direction = 'jump') {
  if (!window.CATEGORY_DASHBOARDS || index < 0 || index >= window.CATEGORY_DASHBOARDS.length) {
    console.warn('⚠️ Category dashboards not available or invalid index');
    return;
  }
  
  const dashboard = window.CATEGORY_DASHBOARDS[index];
  
  console.log(`🧭 Loading dashboard: ${dashboard.name} (${index}) [${direction}]`);
  
  // Show loading
  if (loadingController) {
    loadingController.show(dashboard.name);
  }
  
  // Create iframe for dashboard
  createDashboardIframe(dashboard, direction, index);
}

function createDashboardIframe(dashboard, direction, index) {
  // Remove old content
  const oldIframe = moduleContainer.querySelector('.module-iframe');
  if (oldIframe) {
    oldIframe.remove();
  }
  
  // Create iframe for dashboard
  const iframe = document.createElement('iframe');
  iframe.className = 'module-iframe hw-accelerated';
  iframe.setAttribute('data-dashboard-id', dashboard.id);
  iframe.setAttribute('data-testid', `dashboard-${dashboard.id}`);
  
  // Apply transition
  applyTransition(iframe, direction);
  
  // Handle iframe load
  iframe.onload = () => {
    console.log(`✅ Dashboard ${dashboard.name} iframe loaded`);
    
    // Apply global theme to iframe
    if (window.GlobalTheme) {
      setTimeout(() => {
        try {
          window.GlobalTheme.applyToIframe(iframe);
          console.log('🎨 Global theme applied to dashboard iframe');
        } catch (e) {
          console.warn('Could not apply theme to iframe:', e);
        }
      }, 100);
    }
    
    // Hide loading after a short delay
    setTimeout(() => {
      if (loadingController) {
        loadingController.hide();
      }
      updateDashboardUI(dashboard, index);
    }, 200);
  };
  
  // Handle iframe error
  iframe.onerror = (error) => {
    console.error('❌ Dashboard iframe error:', error);
    if (loadingController) {
      loadingController.forceHide();
    }
    showError(`Failed to load ${dashboard.name}`, 'Dashboard failed to load');
  };
  
  // Add to container
  moduleContainer.appendChild(iframe);
  
  // Set src to load dashboard
  iframe.src = dashboard.path;
  
  // Fallback timeout
  setTimeout(() => {
    if (loadingController && loadingController.isLoading()) {
      console.log(`⚡ Fallback timeout: force hiding loading for ${dashboard.name}`);
      loadingController.forceHide();
      updateDashboardUI(dashboard, index);
    }
  }, 5000);
  
  return iframe;
}

function updateDashboardUI(dashboard, index) {
  // Update title with dropdown arrow
  if (moduleTitle) {
    moduleTitle.innerHTML = `${dashboard.icon} ${dashboard.name} <span class="dropdown-arrow">▼</span>`;
  }
  
  // Recreate dropdown to include standalone modules
  createModuleDropdown();
  
  console.log(`🧭 Dashboard UI updated: ${dashboard.name}`);
}


// =======================
// UI UPDATES
// =======================
function updateUI(module, index) {
  // Get module from MODULES array if null
  if (!module && typeof index === 'number') {
    module = MODULES[index];
  }
  
  // Safety check
  if (!module) {
    console.warn('⚠️ updateUI: No valid module provided');
    return;
  }
  
  // Update title with dropdown arrow
  if (moduleTitle) {
    moduleTitle.innerHTML = `${module.icon} ${module.name} <span class="dropdown-arrow">▼</span>`;
  }
  
  // Recreate dropdown to ensure standalone modules are always available
  createModuleDropdown();
  
  // Update navigation buttons (hidden but kept for compatibility)
  if (navBar) {
    const navButtons = navBar.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Update selector (hidden)
  if (moduleSelector) {
    moduleSelector.value = module.id;
  }
}

// =======================
// ERROR SCREEN
// =======================
function showError(title, message) {
  // Ensure loading is hidden
  if (loadingController) {
    loadingController.forceHide();
  }
  
  const errorHtml = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>${title}</h2>
      <p>${message}</p>
      <button onclick="location.reload()" class="retry-btn">Retry</button>
    </div>
  `;
  
  if (moduleContainer) {
    moduleContainer.innerHTML = errorHtml;
  }
}

// =======================
// MODULE COMMUNICATION API
// Expose OmniHub API for modules
// =======================
window.OmniHub = {
  // Navigation methods
  getCurrentModule: () => navigationController.getCurrentModule(),
  getAllModules: () => navigationController.getAllModules(),
  navigateToModule: (moduleId) => {
    console.log('🎯 Navigating to:', moduleId);
    
    // Simple: just find the module index and load it
    const moduleIndex = MODULES.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      console.error('❌ Module not found:', moduleId);
      return;
    }
    
    console.log('✅ Found module at index:', moduleIndex);
    
    // Force reset transition state
    navigationController.isTransitioning = false;
    
    // Update navigation controller state
    navigationController.currentIndex = moduleIndex;
    navigationController.currentModule = MODULES[moduleIndex];
    
    // Load the module directly
    loadModule(moduleIndex, 'jump');
  },
  next: () => {
    const nextIndex = (navigationController.currentIndex + 1) % MODULES.length;
    navigationController.isTransitioning = false;
    navigationController.currentIndex = nextIndex;
    navigationController.currentModule = MODULES[nextIndex];
    loadModule(nextIndex, 'next');
  },
  previous: () => {
    const prevIndex = (navigationController.currentIndex - 1 + MODULES.length) % MODULES.length;
    navigationController.isTransitioning = false;
    navigationController.currentIndex = prevIndex;
    navigationController.currentModule = MODULES[prevIndex];
    loadModule(prevIndex, 'prev');
  },
  
  // Data persistence methods
  getModuleData: (moduleId) => {
    const key = `omnihub_${moduleId}_data`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  setModuleData: (moduleId, data) => {
    const key = `omnihub_${moduleId}_data`;
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  // Navigation controller access
  getNavigationController: () => navigationController,
  
  // Loading controller access
  getLoadingController: () => loadingController,
  
  // Signal module ready (for modules to call)
  signalModuleReady: (moduleId) => {
    if (loadingController) {
      loadingController.onModuleReady(moduleId);
    }
  }
};

console.log('🌐 OmniHub global API exposed');

// =======================
// START APPLICATION
// =======================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// CRITICAL: Absolute fallback - hide loading screen after 8 seconds no matter what
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && loadingScreen.style.display !== 'none') {
    console.warn('⚠️ CRITICAL FALLBACK: Force hiding loading screen after 8s');
    loadingScreen.style.transition = 'opacity 0.3s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
}, 8000);

console.log('🎉 OmniHub Renderer Ready!');
