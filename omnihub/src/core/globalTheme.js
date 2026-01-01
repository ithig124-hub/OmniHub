// =======================
// GLOBAL THEME SYSTEM
// Enforces theme consistency across ALL OmniHub modules
// =======================

class GlobalThemeManager {
  constructor() {
    this.currentTheme = null;
    this.subscribers = [];
    this.STORAGE_KEY = 'omnihub_global_theme';
    
    // Default theme configuration
    this.defaultTheme = {
      mode: 'dark',
      accentColor: '#667eea',
      gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3d5ca3 100%)',
      glassOpacity: 0.15,
      glassBlur: 10,
      glowOpacity: 0.2,
      borderRadius: 12,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      transitionSpeed: 0.3,
      shadows: true,
      animations: true
    };
    
    // CSS variable mappings
    this.cssVars = {
      '--theme-mode': 'mode',
      '--theme-primary': 'accentColor',
      '--theme-gradient': 'gradient',
      '--glass-opacity': 'glassOpacity',
      '--glass-blur': 'glassBlur',
      '--glow-opacity': 'glowOpacity',
      '--border-radius': 'borderRadius',
      '--font-family': 'fontFamily',
      '--transition-speed': 'transitionSpeed'
    };
  }
  
  // Initialize global theme
  init() {
    console.log('🎨 Initializing Global Theme System...');
    
    // Load saved theme or use default
    this.loadTheme();
    
    // Apply theme to document
    this.applyGlobalTheme();
    
    // Listen for theme changes from any module
    window.addEventListener('omnihub:theme:update', (e) => {
      this.updateTheme(e.detail);
    });
    
    // Listen for module switches to ensure theme persists
    window.addEventListener('omnihub:module:change', () => {
      this.applyGlobalTheme();
    });
    
    console.log('✅ Global Theme System initialized');
  }
  
  // Load theme from storage
  loadTheme() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentTheme = { ...this.defaultTheme, ...JSON.parse(stored) };
      } else {
        this.currentTheme = { ...this.defaultTheme };
      }
    } catch (e) {
      console.warn('Failed to load theme, using default:', e);
      this.currentTheme = { ...this.defaultTheme };
    }
  }
  
  // Save theme to storage
  saveTheme() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentTheme));
      console.log('✅ Global theme saved');
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }
  
  // Apply theme to entire document
  applyGlobalTheme() {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply CSS variables
    Object.entries(this.cssVars).forEach(([cssVar, themeKey]) => {
      let value = this.currentTheme[themeKey];
      
      // Format values appropriately
      if (cssVar === '--glass-blur' && typeof value === 'number') {
        value = `${value}px`;
      } else if (cssVar === '--border-radius' && typeof value === 'number') {
        value = `${value}px`;
      } else if (cssVar === '--transition-speed' && typeof value === 'number') {
        value = `${value}s`;
      }
      
      root.style.setProperty(cssVar, value);
    });
    
    // Apply background gradient
    if (this.currentTheme.gradient) {
      body.style.background = this.currentTheme.gradient;
    }
    
    // Apply mode-specific styles
    root.setAttribute('data-theme', this.currentTheme.mode);
    
    // Apply glassmorphism to all glass panels
    this.applyGlassmorphism();
    
    // Notify subscribers
    this.notifySubscribers();
    
    console.log('🎨 Global theme applied:', this.currentTheme.mode);
  }
  
  // Apply glassmorphism effect to all modules
  applyGlassmorphism() {
    const glassPanels = document.querySelectorAll('.glass-panel, .glass-modal, .glass-card');
    
    glassPanels.forEach(panel => {
      panel.style.background = `rgba(255, 255, 255, ${this.currentTheme.glassOpacity})`;
      panel.style.backdropFilter = `blur(${this.currentTheme.glassBlur}px)`;
      panel.style.borderRadius = `${this.currentTheme.borderRadius}px`;
      panel.style.transition = `all ${this.currentTheme.transitionSpeed}s ease`;
    });
  }
  
  // Update theme
  updateTheme(updates) {
    this.currentTheme = { ...this.currentTheme, ...updates };
    this.saveTheme();
    this.applyGlobalTheme();
    
    // Apply to ALL open iframes
    this.applyToAllIframes();
    
    // Broadcast theme change to all modules
    window.dispatchEvent(new CustomEvent('omnihub:theme:changed', {
      detail: this.currentTheme
    }));
    
    console.log('✅ Theme updated and applied globally');
  }
  
  // Apply theme to all module iframes
  applyToAllIframes() {
    // Find all possible iframe selectors
    const iframeSelectors = [
      'iframe.module-iframe',
      'iframe[id$="-module"]',
      '#module-container iframe',
      '.module-view',
      'iframe'
    ];
    
    let iframes = [];
    iframeSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      found.forEach(iframe => {
        if (iframe.tagName === 'IFRAME' && !iframes.includes(iframe)) {
          iframes.push(iframe);
        }
      });
    });
    
    console.log(`🎨 Found ${iframes.length} iframe(s) to theme`);
    
    iframes.forEach((iframe, index) => {
      try {
        // Wait a bit for iframe to load
        setTimeout(() => {
          this.applyToIframe(iframe);
          console.log(`✅ Theme applied to iframe ${index + 1}: ${iframe.id || 'unnamed'}`);
        }, 50 * index); // Stagger applications
      } catch (e) {
        console.warn(`⚠️ Could not apply theme to iframe ${index + 1}:`, e.message);
      }
    });
    
    // Force a second pass after a delay to catch late-loading iframes
    setTimeout(() => {
      iframes.forEach(iframe => {
        try {
          this.applyToIframe(iframe);
        } catch (e) {
          // Silent fail on second pass
        }
      });
      console.log('🔄 Second theme pass complete');
    }, 500);
  }
  
  // Get current theme
  getTheme() {
    return { ...this.currentTheme };
  }
  
  // Set theme preset
  setPreset(presetName) {
    const presets = {
      professional: {
        mode: 'dark',
        accentColor: '#3498db',
        gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3d566e 100%)',
        glassOpacity: 0.1,
        glassBlur: 8,
        glowOpacity: 0.1,
        borderRadius: 8,
        transitionSpeed: 0.25
      },
      creative: {
        mode: 'light',
        accentColor: '#e74c3c',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        glassOpacity: 0.2,
        glassBlur: 15,
        glowOpacity: 0.3,
        borderRadius: 16,
        transitionSpeed: 0.4
      },
      zen: {
        mode: 'dark',
        accentColor: '#27ae60',
        gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
        glassOpacity: 0.12,
        glassBlur: 20,
        glowOpacity: 0.15,
        borderRadius: 12,
        transitionSpeed: 0.5
      },
      space: {
        mode: 'dark',
        accentColor: '#9b59b6',
        gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
        glassOpacity: 0.08,
        glassBlur: 12,
        glowOpacity: 0.25,
        borderRadius: 10,
        transitionSpeed: 0.3
      }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.updateTheme(preset);
      console.log(`🎨 Applied preset: ${presetName}`);
      return true;
    }
    
    console.warn(`Unknown preset: ${presetName}`);
    return false;
  }
  
  // Toggle dark/light mode
  toggleMode() {
    const newMode = this.currentTheme.mode === 'dark' ? 'light' : 'dark';
    
    // Adjust colors for mode
    const modeAdjustments = {
      light: {
        glassOpacity: 0.3,
        gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)'
      },
      dark: {
        glassOpacity: 0.15,
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3d5ca3 100%)'
      }
    };
    
    this.updateTheme({
      mode: newMode,
      ...modeAdjustments[newMode]
    });
    
    console.log(`🌙 Toggled to ${newMode} mode`);
  }
  
  // Subscribe to theme changes
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  // Notify all subscribers
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (e) {
        console.error('Theme subscriber error:', e);
      }
    });
  }
  
  // Apply theme to specific iframe module
  applyToIframe(iframeElement) {
    try {
      // Check if iframe is loaded
      if (!iframeElement.contentDocument && !iframeElement.contentWindow) {
        console.warn('Iframe not ready yet, scheduling retry...');
        setTimeout(() => this.applyToIframe(iframeElement), 100);
        return;
      }
      
      const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
      if (!iframeDoc) {
        console.warn('Cannot access iframe document');
        return;
      }
      
      const iframeRoot = iframeDoc.documentElement;
      const iframeBody = iframeDoc.body;
      
      if (!iframeRoot || !iframeBody) {
        console.warn('Iframe DOM not ready');
        return;
      }
      
      // Apply CSS variables to root
      Object.entries(this.cssVars).forEach(([cssVar, themeKey]) => {
        let value = this.currentTheme[themeKey];
        
        if (cssVar === '--glass-blur' && typeof value === 'number') {
          value = `${value}px`;
        } else if (cssVar === '--border-radius' && typeof value === 'number') {
          value = `${value}px`;
        } else if (cssVar === '--transition-speed' && typeof value === 'number') {
          value = `${value}s`;
        }
        
        iframeRoot.style.setProperty(cssVar, value);
      });
      
      // Also apply to body for immediate effect
      if (this.currentTheme.gradient) {
        iframeBody.style.background = this.currentTheme.gradient;
        iframeBody.style.backgroundAttachment = 'fixed';
      }
      
      // Apply mode attribute
      iframeRoot.setAttribute('data-theme', this.currentTheme.mode);
      iframeBody.setAttribute('data-theme', this.currentTheme.mode);
      
      // Apply accent color
      iframeRoot.style.setProperty('--accent-color', this.currentTheme.accentColor);
      iframeRoot.style.setProperty('--theme-primary', this.currentTheme.accentColor);
      
      // Trigger any module-specific theme listeners
      if (iframeElement.contentWindow) {
        iframeElement.contentWindow.dispatchEvent(new CustomEvent('theme:changed', {
          detail: this.currentTheme
        }));
      }
      
      console.log('🖼️ Theme fully applied to iframe');
    } catch (e) {
      console.warn('Could not apply theme to iframe:', e.message);
    }
  }
  
  // Export theme
  exportTheme() {
    const json = JSON.stringify(this.currentTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnihub-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('💾 Theme exported');
  }
  
  // Import theme
  importTheme(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.updateTheme(imported);
      console.log('✅ Theme imported successfully');
      return true;
    } catch (e) {
      console.error('Failed to import theme:', e);
      return false;
    }
  }
}

// Create global instance
window.GlobalTheme = new GlobalThemeManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.GlobalTheme.init();
  });
} else {
  window.GlobalTheme.init();
}

console.log('🎨 Global Theme Manager loaded');