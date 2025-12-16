// =======================
// OMNIHUB NAVIGATION CONTROLLER
// Centralized navigation engine for cyclical module management
// =======================

class NavigationController {
  constructor(modules) {
    this.modules = modules || [];
    this.currentIndex = 0;
    this.currentModule = null;
    this.isTransitioning = false;
    this.navigationHistory = [];
    this.moduleStates = new Map(); // Store module states
    this.eventListeners = {
      beforeNavigate: [],
      afterNavigate: [],
      moduleActivate: [],
      moduleDeactivate: []
    };
    
    console.log('🎯 Navigation Controller initialized with', modules.length, 'modules');
  }

  // =======================
  // LIFECYCLE MANAGEMENT
  // =======================

  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // =======================
  // NAVIGATION API
  // =======================

  next() {
    if (this.isTransitioning) return false;
    const nextIndex = (this.currentIndex + 1) % this.modules.length;
    return this.navigateTo(nextIndex, 'next');
  }

  previous() {
    if (this.isTransitioning) return false;
    const prevIndex = (this.currentIndex - 1 + this.modules.length) % this.modules.length;
    return this.navigateTo(prevIndex, 'prev');
  }

  jumpTo(moduleIdOrIndex) {
    if (this.isTransitioning) return false;
    
    let targetIndex;
    if (typeof moduleIdOrIndex === 'string') {
      targetIndex = this.modules.findIndex(m => m.id === moduleIdOrIndex);
    } else {
      targetIndex = moduleIdOrIndex;
    }

    if (targetIndex === -1 || targetIndex >= this.modules.length) {
      console.warn('Invalid module target:', moduleIdOrIndex);
      return false;
    }

    return this.navigateTo(targetIndex, 'jump');
  }

  navigateTo(index, direction = 'next') {
    if (this.isTransitioning || index < 0 || index >= this.modules.length) {
      return false;
    }

    const targetModule = this.modules[index];
    const currentModule = this.currentModule;

    console.log(`🔄 Navigating from [${currentModule?.name}] to [${targetModule.name}] (${direction})`);

    // Emit beforeNavigate event
    this.emit('beforeNavigate', {
      from: currentModule,
      to: targetModule,
      direction
    });

    // Call current module's deactivate hook
    if (currentModule) {
      this.deactivateModule(currentModule);
    }

    // Update state
    this.currentIndex = index;
    this.currentModule = targetModule;
    this.isTransitioning = true;

    // Add to navigation history
    this.navigationHistory.push({
      module: targetModule,
      timestamp: Date.now(),
      direction
    });

    // Limit history to last 50 entries
    if (this.navigationHistory.length > 50) {
      this.navigationHistory.shift();
    }

    return {
      success: true,
      module: targetModule,
      direction,
      index
    };
  }

  // Called after transition animation completes
  completeTransition() {
    this.isTransitioning = false;
    
    // Call new module's activate hook
    if (this.currentModule) {
      this.activateModule(this.currentModule);
    }

    // Emit afterNavigate event
    this.emit('afterNavigate', {
      module: this.currentModule,
      index: this.currentIndex
    });

    console.log(`✅ Navigation complete: ${this.currentModule.name}`);
  }

  // =======================
  // MODULE LIFECYCLE HOOKS
  // =======================

  activateModule(module) {
    console.log(`📍 Activating module: ${module.name}`);
    
    // Call module's onActivate hook if it exists
    if (window[`${module.id}Module`]?.onActivate) {
      try {
        window[`${module.id}Module`].onActivate();
      } catch (error) {
        console.error(`Error activating ${module.id} module:`, error);
      }
    }

    // Restore module state if exists
    const savedState = this.moduleStates.get(module.id);
    if (savedState) {
      console.log(`💾 Restoring state for ${module.name}`);
      // State restoration logic can be handled by the module itself
      if (window[`${module.id}Module`]?.restoreState) {
        window[`${module.id}Module`].restoreState(savedState);
      }
    }

    this.emit('moduleActivate', module);
  }

  deactivateModule(module) {
    console.log(`📤 Deactivating module: ${module.name}`);
    
    // Save module state
    if (window[`${module.id}Module`]?.getState) {
      try {
        const state = window[`${module.id}Module`].getState();
        this.moduleStates.set(module.id, state);
        console.log(`💾 State saved for ${module.name}`);
      } catch (error) {
        console.error(`Error saving state for ${module.id}:`, error);
      }
    }

    // Call module's onDeactivate hook if it exists
    if (window[`${module.id}Module`]?.onDeactivate) {
      try {
        window[`${module.id}Module`].onDeactivate();
      } catch (error) {
        console.error(`Error deactivating ${module.id} module:`, error);
      }
    }

    this.emit('moduleDeactivate', module);
  }

  // =======================
  // GETTERS
  // =======================

  getCurrent() {
    return {
      module: this.currentModule,
      index: this.currentIndex,
      total: this.modules.length
    };
  }

  getCurrentModule() {
    return this.currentModule;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getAllModules() {
    return this.modules;
  }

  getHistory() {
    return this.navigationHistory;
  }

  isNavigating() {
    return this.isTransitioning;
  }

  // =======================
  // MODULE MANAGEMENT
  // =======================

  setModules(modules) {
    this.modules = modules;
    console.log('📦 Modules updated:', modules.length);
  }

  getModuleById(id) {
    return this.modules.find(m => m.id === id);
  }

  getModuleByIndex(index) {
    return this.modules[index];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationController;
}
