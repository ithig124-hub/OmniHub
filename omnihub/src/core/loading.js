// =======================
// OMNIHUB LOADING CONTROLLER
// Centralized loading screen management
// =======================

class LoadingController {
  constructor() {
    this.loadingScreen = null;
    this.loadingText = null;
    this.isVisible = true;
    this.currentModuleName = '';
    this.loadingTimeout = null;
    this.minDisplayTime = 300; // Minimum loading display time (ms)
    this.maxWaitTime = 10000; // Maximum wait time before force-hiding (ms)
    this.fadeOutDuration = 300; // Fade out animation duration (ms)
    this.loadingStartTime = 0;
    this.moduleReadyCallbacks = new Map();
    
    console.log('🔄 Loading Controller initialized');
  }

  // =======================
  // INITIALIZATION
  // =======================

  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingText = this.loadingScreen?.querySelector('.loading-text');
    
    if (!this.loadingScreen) {
      console.error('❌ Loading screen element not found!');
      return false;
    }
    
    // Setup message listener for module readiness signals
    this.setupModuleReadinessListener();
    
    // Set initial state
    this.loadingStartTime = Date.now();
    this.isVisible = true;
    
    console.log('✅ Loading Controller ready');
    return true;
  }

  // =======================
  // MODULE READINESS PROTOCOL
  // =======================

  setupModuleReadinessListener() {
    // Listen for messages from module iframes
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'MODULE_READY') {
        const moduleId = event.data.moduleId;
        console.log(`📨 Received MODULE_READY signal from: ${moduleId}`);
        this.onModuleReady(moduleId);
      }
    });
    
    console.log('📡 Module readiness listener active');
  }

  onModuleReady(moduleId) {
    // Clear any pending timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    
    // Execute any registered callbacks for this module
    const callback = this.moduleReadyCallbacks.get(moduleId);
    if (callback) {
      callback();
      this.moduleReadyCallbacks.delete(moduleId);
    }
    
    // Hide loading with minimum display time guarantee
    this.hideWithMinDisplayTime();
  }

  registerModuleReadyCallback(moduleId, callback) {
    this.moduleReadyCallbacks.set(moduleId, callback);
  }

  // =======================
  // SHOW / HIDE METHODS
  // =======================

  show(moduleName = 'Module') {
    if (!this.loadingScreen) return;
    
    this.currentModuleName = moduleName;
    this.loadingStartTime = Date.now();
    this.isVisible = true;
    
    // Update text
    if (this.loadingText) {
      this.loadingText.textContent = `Loading ${moduleName}...`;
    }
    
    // Reset styles and show
    this.loadingScreen.style.opacity = '1';
    this.loadingScreen.style.display = 'flex';
    this.loadingScreen.style.pointerEvents = 'auto';
    
    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Set fallback timeout to force-hide after maxWaitTime
    this.loadingTimeout = setTimeout(() => {
      console.warn(`⚠️ Loading timeout reached for ${moduleName}, force-hiding`);
      this.forceHide();
    }, this.maxWaitTime);
    
    console.log(`🔄 Loading shown for: ${moduleName}`);
  }

  hide() {
    this.hideWithMinDisplayTime();
  }

  hideWithMinDisplayTime() {
    if (!this.loadingScreen || !this.isVisible) return;
    
    const elapsed = Date.now() - this.loadingStartTime;
    const remaining = Math.max(0, this.minDisplayTime - elapsed);
    
    // Wait for minimum display time before hiding
    setTimeout(() => {
      this.fadeOut();
    }, remaining);
  }

  fadeOut() {
    if (!this.loadingScreen || !this.isVisible) return;
    
    // Clear timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    
    // Apply fade out
    this.loadingScreen.style.transition = `opacity ${this.fadeOutDuration}ms ease-out`;
    this.loadingScreen.style.opacity = '0';
    this.loadingScreen.style.pointerEvents = 'none';
    
    // Hide after animation
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.style.display = 'none';
        this.isVisible = false;
      }
      console.log('✅ Loading screen hidden');
    }, this.fadeOutDuration);
  }

  forceHide() {
    if (!this.loadingScreen) return;
    
    // Clear timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    
    // Immediately hide
    this.loadingScreen.style.opacity = '0';
    this.loadingScreen.style.display = 'none';
    this.loadingScreen.style.pointerEvents = 'none';
    this.isVisible = false;
    
    console.log('⚡ Loading screen force-hidden');
  }

  // =======================
  // STATE GETTERS
  // =======================

  isLoading() {
    return this.isVisible;
  }

  getCurrentModule() {
    return this.currentModuleName;
  }

  // =======================
  // PROGRESS UPDATES (Optional)
  // =======================

  updateProgress(message) {
    if (this.loadingText) {
      this.loadingText.textContent = message;
    }
  }

  // =======================
  // CLEANUP
  // =======================

  destroy() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    this.moduleReadyCallbacks.clear();
    console.log('🧹 Loading Controller destroyed');
  }
}

// Create global instance
window.LoadingController = LoadingController;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingController;
}
