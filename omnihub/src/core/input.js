// =======================
// OMNIHUB INPUT HANDLER
// Centralized input management for navigation
// Handles: Arrow + Space, Swipe, Dropdown Selector
// =======================

class InputHandler {
  constructor(navigationController) {
    this.nav = navigationController;
    this.lastKeyPressed = null;
    this.keyPressTimeout = null;
    this.keyComboWindow = 500; // ms window for Arrow followed by Space
    
    // Swipe tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.isMouseDown = false;
    this.swipeThreshold = 100; // pixels
    
    // Visual feedback
    this.arrowKeyPressed = false;
    
    console.log('🎮 Input Handler initialized');
  }

  // =======================
  // INITIALIZATION
  // =======================

  init(moduleContainer) {
    this.moduleContainer = moduleContainer;
    this.setupKeyboardInput();
    this.setupSwipeInput();
    this.setupDropdownSelector();
    console.log('✅ All input handlers ready');
  }

  // =======================
  // KEYBOARD INPUT
  // Arrow followed by Space (sequential)
  // =======================

  setupKeyboardInput() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
    
    console.log('⌨️ Keyboard input enabled: Arrow → Space');
  }

  handleKeyDown(e) {
    const key = e.key;
    
    // Direct module access with number keys (1-6)
    if (!isNaN(key) && key >= '1' && key <= '6') {
      const moduleIndex = parseInt(key) - 1;
      if (moduleIndex < this.nav.modules.length) {
        const module = this.nav.modules[moduleIndex];
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.navigateToModule) {
          window.OmniHub.navigateToModule(module.id);
        } else {
          this.nav.jumpTo(moduleIndex);
        }
        this.showNavigationFeedback('jump');
      }
      return;
    }

    // Arrow followed by Space navigation
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Store arrow key press
      this.lastKeyPressed = key;
      this.arrowKeyPressed = true;
      
      // Show visual feedback
      this.showArrowFeedback(key);
      
      // Clear after timeout
      clearTimeout(this.keyPressTimeout);
      this.keyPressTimeout = setTimeout(() => {
        this.lastKeyPressed = null;
        this.arrowKeyPressed = false;
        this.hideArrowFeedback();
      }, this.keyComboWindow);
      
      return;
    }

    // Space key - check if arrow was pressed recently
    if (key === ' ' && this.lastKeyPressed) {
      e.preventDefault(); // Prevent page scroll
      
      if (this.lastKeyPressed === 'ArrowRight') {
        console.log('➡️ + Space: Navigate Next');
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.next) {
          window.OmniHub.next();
        } else {
          this.nav.next();
        }
        this.showNavigationFeedback('next');
      } else if (this.lastKeyPressed === 'ArrowLeft') {
        console.log('⬅️ + Space: Navigate Previous');
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.previous) {
          window.OmniHub.previous();
        } else {
          this.nav.previous();
        }
        this.showNavigationFeedback('prev');
      }
      
      // Reset
      this.lastKeyPressed = null;
      this.arrowKeyPressed = false;
      this.hideArrowFeedback();
      clearTimeout(this.keyPressTimeout);
    }
  }

  // =======================
  // SWIPE GESTURES
  // Touch and Mouse swipe support
  // =======================

  setupSwipeInput() {
    if (!this.moduleContainer) return;

    // Touch events
    this.moduleContainer.addEventListener('touchstart', (e) => {
      if (this.nav.isNavigating()) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.moduleContainer.addEventListener('touchend', (e) => {
      if (this.nav.isNavigating()) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      this.handleSwipe(
        this.touchStartX,
        this.touchStartY,
        touchEndX,
        touchEndY
      );
    }, { passive: true });

    // Mouse events (for desktop testing)
    this.moduleContainer.addEventListener('mousedown', (e) => {
      if (this.nav.isNavigating()) return;
      this.isMouseDown = true;
      this.mouseStartX = e.clientX;
      this.mouseStartY = e.clientY;
    });

    this.moduleContainer.addEventListener('mouseup', (e) => {
      if (!this.isMouseDown || this.nav.isNavigating()) return;
      this.isMouseDown = false;
      
      this.handleSwipe(
        this.mouseStartX,
        this.mouseStartY,
        e.clientX,
        e.clientY
      );
    });

    console.log('👆 Swipe gestures enabled');
  }

  handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right - previous module
        console.log('👉 Swipe Right: Previous');
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.previous) {
          window.OmniHub.previous();
        } else {
          this.nav.previous();
        }
        this.showNavigationFeedback('prev');
      } else {
        // Swipe left - next module
        console.log('👈 Swipe Left: Next');
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.next) {
          window.OmniHub.next();
        } else {
          this.nav.next();
        }
        this.showNavigationFeedback('next');
      }
    }
  }

  // =======================
  // DROPDOWN SELECTOR
  // Top-right module selector
  // =======================

  setupDropdownSelector() {
    const selector = document.getElementById('module-selector');
    if (!selector) {
      console.warn('⚠️ Module selector not found');
      return;
    }

    selector.addEventListener('change', (e) => {
      const moduleId = e.target.value;
      if (moduleId) {
        console.log('📍 Selector jump to:', moduleId);
        // Use OmniHub API to navigate (which triggers loadModule)
        if (window.OmniHub && window.OmniHub.navigateToModule) {
          window.OmniHub.navigateToModule(moduleId);
        } else {
          // Fallback to direct navigation
          this.nav.jumpTo(moduleId);
        }
        this.showNavigationFeedback('jump');
      }
    });

    // Update selector when navigation changes
    this.nav.on('afterNavigate', (data) => {
      if (data.module) {
        selector.value = data.module.id;
      }
    });

    console.log('📍 Dropdown selector enabled');
  }

  // =======================
  // VISUAL FEEDBACK
  // =======================

  showArrowFeedback(arrowKey) {
    const indicator = document.getElementById('navigation-indicator');
    if (!indicator) return;

    indicator.className = 'navigation-indicator active';
    indicator.textContent = arrowKey === 'ArrowRight' ? '→ (Press Space)' : '← (Press Space)';
    indicator.style.display = 'block';
  }

  hideArrowFeedback() {
    const indicator = document.getElementById('navigation-indicator');
    if (!indicator) return;
    
    indicator.classList.remove('active');
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 200);
  }

  showNavigationFeedback(direction) {
    const indicator = document.getElementById('navigation-indicator');
    if (!indicator) return;

    let text = '';
    if (direction === 'next') text = '→ Next';
    else if (direction === 'prev') text = '← Previous';
    else if (direction === 'jump') text = '✓ Jumped';

    indicator.className = 'navigation-indicator success';
    indicator.textContent = text;
    indicator.style.display = 'block';

    setTimeout(() => {
      this.hideArrowFeedback();
    }, 1000);
  }

  // =======================
  // CLEANUP
  // =======================

  destroy() {
    clearTimeout(this.keyPressTimeout);
    this.lastKeyPressed = null;
    this.arrowKeyPressed = false;
    console.log('🧹 Input handler cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}
