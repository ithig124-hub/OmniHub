// =======================
// OMNIHUB RENDERER - REFACTORED
// Uses core navigation system for cyclical module management
// =======================

console.log('🚀 OmniHub Renderer Starting (Enhanced)...');

// Load core systems
let NavigationController;
let InputHandler;
let LoadingController;

// Check if we're in a module system environment
if (typeof require !== 'undefined') {
  try {
    NavigationController = require('./core/navigation.js');
    InputHandler = require('./core/input.js');
    LoadingController = require('./core/loading.js');
  } catch (e) {
    console.log('Loading core systems via script tags...');
  }
}

// =======================
// MODULE CONFIGURATION
// =======================
const MODULES = [
  { id: 'map', name: 'Map', icon: '🗺️', path: 'modules/map/map.html' },
  { id: 'notes', name: 'Notes', icon: '📝', path: 'modules/notes/notes.html' },
  { id: 'library', name: 'Library', icon: '📚', path: 'modules/library/library.html' },
  { id: 'search', name: 'Search', icon: '🔍', path: 'modules/search/search.html' },
  { id: 'dashboard', name: 'Dashboard', icon: '📊', path: 'modules/dashboard/dashboard.html' },
  { id: 'tracking', name: 'Tracking', icon: '📍', path: 'modules/tracking/tracking.html' }
];

// =======================
// CORE INSTANCES
// =======================
let navigationController;
let inputHandler;
let loadingController;

// =======================
// DOM ELEMENTS
// =======================
let moduleContainer;
let navBar;
let moduleTitle;
let moduleSelector;

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
    
    // Initialize loading controller FIRST (it's already showing)
    if (typeof LoadingController !== 'undefined') {
      loadingController = new LoadingController();
    } else {
      loadingController = new window.LoadingController();
    }
    loadingController.init();
    loadingController.updateProgress('Initializing OmniHub...');
    
    // Initialize navigation controller
    if (typeof NavigationController !== 'undefined') {
      navigationController = new NavigationController(MODULES);
    } else {
      // Fallback: NavigationController loaded via script tag
      navigationController = new window.NavigationController(MODULES);
    }
    
    // Setup event listeners
    setupNavigationEvents();
    
    // Create navigation UI
    createNavigationBar();
    createModuleSelector();
    
    // Initialize input handler
    if (typeof InputHandler !== 'undefined') {
      inputHandler = new InputHandler(navigationController);
    } else {
      inputHandler = new window.InputHandler(navigationController);
    }
    inputHandler.init(moduleContainer);
    
    // Load initial module (Notes - lighter module for faster startup)
    loadModule(1, 'init');
    
    console.log('✅ OmniHub Navigation Engine initialized successfully!');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    loadingController?.forceHide();
    showError('Failed to initialize OmniHub', error.message);
  }
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
// MODULE SELECTOR (Top-Right)
// =======================
function createModuleSelector() {
  if (!moduleSelector) return;
  
  moduleSelector.innerHTML = '';
  
  MODULES.forEach((module, index) => {
    const option = document.createElement('option');
    option.value = module.id;
    option.textContent = `${module.icon} ${module.name}`;
    // Select Notes module (index 1) by default
    if (index === 1) {
      option.selected = true;
    }
    moduleSelector.appendChild(option);
  });
  
  console.log('🎯 Module selector created');
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
// UI UPDATES
// =======================
function updateUI(module, index) {
  // Update title
  if (moduleTitle) {
    moduleTitle.textContent = `${module.icon} ${module.name}`;
  }
  
  // Update navigation buttons
  const navButtons = navBar.querySelectorAll('.nav-btn');
  navButtons.forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update selector
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
    const result = navigationController.jumpTo(moduleId);
    if (result.success) {
      loadModule(result.index, 'jump');
    }
  },
  next: () => {
    const result = navigationController.next();
    if (result.success) {
      loadModule(result.index, 'next');
    }
  },
  previous: () => {
    const result = navigationController.previous();
    if (result.success) {
      loadModule(result.index, 'prev');
    }
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
