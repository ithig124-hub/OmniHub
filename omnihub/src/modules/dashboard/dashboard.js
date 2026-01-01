// =======================
// OMNIHUB DASHBOARD V3 - COMPREHENSIVE SCROLLABLE LAYOUT
// All cards visible, enhanced navigation, real-time updates, THEME SUPPORT
// =======================

console.log('🏠 Dashboard V3 Enhanced Loading...');

// =======================
// STATE MANAGEMENT
// =======================
let sessionStartTime = Date.now();
let weatherData = null;
let statsData = {
  notesCreated: 0,
  searchesToday: 2,
  sessionTime: 0,
  currentSession: 'Guide Research'
};
let assignments = {
  current: 'Guide: Research Essay',
  due: 'History Essay'
};
let currentTheme = 'purple'; // Default theme

// =======================
// THEME SYSTEM
// =======================
const THEMES = {
  purple: {
    name: 'Purple',
    primary: '#667eea',
    secondary: '#764ba2',
    tertiary: '#f093fb'
  },
  green: {
    name: 'Green',
    primary: '#00CED1',
    secondary: '#20B2AA',
    tertiary: '#48D1CC'
  },
  blue: {
    name: 'Blue',
    primary: '#4A90E2',
    secondary: '#357ABD',
    tertiary: '#7CB9E8'
  },
  orange: {
    name: 'Orange',
    primary: '#FF8C42',
    secondary: '#FFA500',
    tertiary: '#FFB84D'
  }
};

function setTheme(themeName) {
  console.log(`🎨 Switching to ${themeName} theme`);
  
  // Update data attribute on dashboard root
  const dashboard = document.getElementById('dashboard-root');
  if (dashboard) {
    dashboard.setAttribute('data-theme', themeName);
  }
  
  // Save to localStorage
  localStorage.setItem('omnihub_theme', themeName);
  currentTheme = themeName;
  
  // Update active state on theme buttons
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`[data-theme="${themeName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Try to notify parent window/theme module
  try {
    if (window.parent && window.parent !== window) {
      if (window.parent.OmniHubTheme) {
        window.parent.OmniHubTheme.setTheme(themeName, THEMES[themeName]);
        console.log('✅ Theme updated in parent context');
      }
    }
  } catch (e) {
    console.log('ℹ️ Theme change local to dashboard');
  }
  
  // Show notification
  showThemeNotification(themeName);
}

function loadSavedTheme() {
  const saved = localStorage.getItem('omnihub_theme');
  if (saved && THEMES[saved]) {
    setTheme(saved);
  } else {
    setTheme('purple');
  }
}

function showThemeNotification(themeName) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 1.5rem 2.5rem;
    border-radius: 16px;
    font-size: 1.1rem;
    z-index: 10000;
    text-align: center;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;
  notification.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎨</div>
    <div><strong>${THEMES[themeName].name}</strong> theme activated!</div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s ease';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 1500);
}

// =======================
// PARTICLE ANIMATION SYSTEM
// =======================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.init();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.fill();

      // Draw connecting lines
      this.particles.forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      });
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// =======================
// CLOCK & TIME UPDATES
// =======================
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Top bar clock
  const topClockEl = document.getElementById('top-clock');
  if (topClockEl) {
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    topClockEl.textContent = timeStr;
  }

  // Top bar date
  const topDateEl = document.getElementById('top-date');
  if (topDateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options).toUpperCase();
    topDateEl.textContent = dateStr;
  }

  // Greeting
  const greetingEl = document.getElementById('top-greeting');
  if (greetingEl) {
    let greeting = 'Good Evening';
    if (hours < 12) greeting = 'Good Morning';
    else if (hours < 18) greeting = 'Good Afternoon';
    
    // Add context-aware subtext
    const notesOpen = statsData.notesCreated;
    const contextText = notesOpen > 0 ? ` · ${notesOpen} notes open` : ' · Ready to start';
    greetingEl.textContent = greeting + contextText;
  }

  // System time (12-hour format)
  const systemTimeEl = document.getElementById('system-time');
  if (systemTimeEl) {
    const hours12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    systemTimeEl.textContent = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}

// =======================
// WEATHER SIMULATION
// =======================
function initWeather() {
  const conditions = [
    { name: 'Sunny', icon: '☀️', temp: [25, 32] },
    { name: 'Partly Cloudy', icon: '⛅', temp: [20, 28] },
    { name: 'Cloudy', icon: '☁️', temp: [18, 24] },
    { name: 'Clear', icon: '🌙', temp: [15, 22] }
  ];

  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  weatherData = {
    icon: condition.icon,
    condition: condition.name,
    temperature: Math.floor(Math.random() * (condition.temp[1] - condition.temp[0])) + condition.temp[0],
    humidity: Math.floor(Math.random() * 20) + 25,
    sunset: Math.floor(Math.random() * 20) + 25,
    tomorrowTemp: Math.floor(Math.random() * (condition.temp[1] - condition.temp[0])) + condition.temp[0]
  };

  updateWeatherDisplay();
}

function updateWeatherDisplay() {
  if (!weatherData) return;

  const iconEl = document.getElementById('weather-icon');
  const tempEl = document.getElementById('temperature');
  const humidityEl = document.getElementById('humidity');
  const sunsetEl = document.getElementById('sunset');
  const tomorrowEl = document.getElementById('tomorrow-temp');

  if (iconEl) iconEl.textContent = weatherData.icon;
  if (tempEl) tempEl.textContent = `${weatherData.temperature}°`;
  if (humidityEl) humidityEl.textContent = `${weatherData.humidity}%`;
  if (sunsetEl) sunsetEl.textContent = `${weatherData.sunset}%`;
  if (tomorrowEl) tomorrowEl.textContent = `5 PM ${weatherData.icon}`;
}

// =======================
// STATS & ACTIVITY TRACKING
// =======================
function updateStats() {
  const elapsed = Date.now() - sessionStartTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  statsData.sessionTime = `${hours}h ${minutes}m`;

  // Try to get real data from data store
  try {
    const dataStore = window.parent?.OmniHubDataStore || window.OmniHubDataStore;
    if (dataStore) {
      const notesData = dataStore.getModuleData('notes');
      if (notesData && notesData.items) {
        statsData.notesCreated = notesData.items.length;
      }
      
      const searchData = dataStore.getModuleData('search');
      if (searchData && searchData.searchHistory) {
        const today = new Date().toDateString();
        statsData.searchesToday = searchData.searchHistory.filter(s => 
          new Date(s.timestamp).toDateString() === today
        ).length;
      }
    }
  } catch (e) {
    // Use simulated data if real data not available
    console.log('Using simulated stats data');
  }

  // Update UI
  const notesEl = document.getElementById('notes-created');
  const searchesEl = document.getElementById('searches-today');
  const sessionEl = document.getElementById('session-name');

  if (notesEl) notesEl.textContent = statsData.notesCreated;
  if (searchesEl) searchesEl.textContent = statsData.searchesToday;
  if (sessionEl) sessionEl.textContent = statsData.currentSession;
}

// =======================
// ASSIGNMENTS MANAGEMENT
// =======================
function updateAssignments() {
  const currentAssignmentEl = document.getElementById('current-assignment');
  const dueAssignmentEl = document.getElementById('due-assignment');

  if (currentAssignmentEl) currentAssignmentEl.textContent = assignments.current;
  if (dueAssignmentEl) dueAssignmentEl.textContent = assignments.due;
}

function setupAssignmentDismiss() {
  const dismissBtn = document.querySelector('[data-testid=\"dismiss-assignment\"]');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const assignmentItem = dismissBtn.closest('.assignment-item');
      if (assignmentItem) {
        assignmentItem.style.transition = 'all 0.3s ease';
        assignmentItem.style.opacity = '0';
        assignmentItem.style.transform = 'translateX(-20px)';
        setTimeout(() => {
          assignmentItem.style.display = 'none';
        }, 300);
      }
    });
  }
}

// =======================
// NAVIGATION SYSTEM
// =======================
function navigateToModule(moduleId) {
  console.log(`🚀 Navigating to: ${moduleId}`);
  
  try {
    // Method 1: Try parent OmniHub renderer
    if (window.parent && window.parent !== window) {
      if (window.parent.showModule) {
        window.parent.showModule(moduleId);
        console.log('✅ Navigation via parent.showModule()');
        return;
      }
      
      // Method 2: Try OmniHub navigation system
      if (window.parent.OmniHubNavigation) {
        window.parent.OmniHubNavigation.navigateTo(moduleId);
        console.log('✅ Navigation via OmniHubNavigation');
        return;
      }
      
      // Method 3: Try triggering module dropdown
      const moduleDropdown = window.parent.document.getElementById('module-dropdown');
      if (moduleDropdown) {
        moduleDropdown.value = moduleId;
        moduleDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Navigation via dropdown trigger');
        return;
      }
      
      // Method 4: Try direct iframe switching
      const targetIframe = window.parent.document.getElementById(`${moduleId}-module`);
      if (targetIframe) {
        const allIframes = window.parent.document.querySelectorAll('.module-view');
        allIframes.forEach(iframe => iframe.style.display = 'none');
        targetIframe.style.display = 'block';
        console.log('✅ Navigation via direct iframe switch');
        return;
      }
    }
    
    // Fallback: Show message
    console.warn('⚠️ Could not navigate, showing message');
    showNavigationMessage(moduleId);
  } catch (e) {
    console.error('Navigation error:', e);
    showNavigationMessage(moduleId);
  }
}

function showNavigationMessage(moduleId) {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 2rem 3rem;
    border-radius: 20px;
    font-size: 1.2rem;
    z-index: 10000;
    text-align: center;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;
  message.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
    <div style="margin-bottom: 0.5rem;">Opening <strong>${moduleId}</strong> module...</div>
    <div style="font-size: 0.9rem; opacity: 0.7;">Use the dropdown at the top to switch modules</div>
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.transition = 'opacity 0.3s ease';
    message.style.opacity = '0';
    setTimeout(() => message.remove(), 300);
  }, 2000);
}

// =======================
// SETUP ALL NAVIGATION BUTTONS
// =======================
function setupNavigation() {
  // App Dock buttons
  const dockApps = document.querySelectorAll('.dock-app[data-module]');
  dockApps.forEach(app => {
    const moduleId = app.getAttribute('data-module');
    app.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`🎯 Dock app clicked: ${moduleId}`);
      
      // Add visual feedback
      app.style.transform = 'scale(0.95)';
      setTimeout(() => {
        app.style.transform = '';
        navigateToModule(moduleId);
      }, 100);
    });
  });

  // Shortcut buttons
  const shortcuts = document.querySelectorAll('.shortcut-app[data-module]');
  shortcuts.forEach(shortcut => {
    const moduleId = shortcut.getAttribute('data-module');
    shortcut.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`🎯 Shortcut clicked: ${moduleId}`);
      navigateToModule(moduleId);
    });
  });

  // Knowledge Dashboard buttons
  const knowledgeItems = document.querySelectorAll('.knowledge-item[data-module]');
  knowledgeItems.forEach(item => {
    const moduleId = item.getAttribute('data-module');
    item.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`🎯 Knowledge item clicked: ${moduleId}`);
      navigateToModule(moduleId);
    });
  });

  // Continue Search buttons
  const continueButtons = document.querySelectorAll('[data-testid=\"continue-search-btn\"], [data-testid=\"continue-focus-btn\"]');
  continueButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToModule('search');
    });
  });

  // Folder buttons
  const folderButtons = document.querySelectorAll('[data-testid=\"open-folder-btn\"], .folder-item');
  folderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToModule('studyVault');
    });
  });

  // Vault thumbnails
  const vaultThumbs = document.querySelectorAll('.vault-thumbnail, .mini-thumbnail');
  vaultThumbs.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToModule('studyVault');
    });
  });

  console.log('✅ Navigation setup complete');
}

// =======================
// DROPDOWN FUNCTIONALITY
// =======================
function setupDropdown() {
  // Removed - no more dropdown in simplified nav
}

// =======================
// THEME SWITCHER SETUP
// =======================
function setupThemeSwitcher() {
  // Theme option buttons
  const themeButtons = document.querySelectorAll('.theme-option[data-theme]');
  themeButtons.forEach(btn => {
    const themeName = btn.getAttribute('data-theme');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setTheme(themeName);
    });
  });
  
  // Theme module button (opens full theme module)
  const themeModuleBtn = document.querySelector('[data-testid="theme-module-btn"]');
  if (themeModuleBtn) {
    themeModuleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToModule('theme');
    });
  }
  
  console.log('✅ Theme switcher setup complete');
}

// =======================
// INITIALIZATION
// =======================
function init() {
  console.log('🎨 Initializing Dashboard V3...');

  try {
    // Initialize particle system
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      const particles = new ParticleSystem(canvas);
      particles.animate();
      window.addEventListener('resize', () => particles.resize());
    }

    // Initialize all components
    updateClock();
    initWeather();
    updateStats();
    updateAssignments();
    setupNavigation();
    setupAssignmentDismiss();
    setupDropdown();

    // Set up intervals for updates
    setInterval(updateClock, 1000);
    setInterval(updateStats, 30000); // Every 30 seconds
    setInterval(initWeather, 300000); // Every 5 minutes

    console.log('✅ Dashboard V3 ready!');
    console.log('📊 Features: Scrollable layout, Real-time updates, Enhanced navigation');
  } catch (error) {
    console.error('❌ Dashboard initialization failed:', error);
  }
}

// =======================
// MODULE LIFECYCLE
// =======================
window.dashboardModule = {
  onActivate: () => {
    console.log('🏠 Dashboard V3 activated');
    updateClock();
    updateStats();
    updateWeatherDisplay();
  },

  onDeactivate: () => {
    console.log('🏠 Dashboard V3 deactivated');
  },

  refresh: () => {
    console.log('🔄 Dashboard V3 refresh');
    updateClock();
    initWeather();
    updateStats();
    updateAssignments();
  },
  
  navigateTo: (moduleId) => {
    navigateToModule(moduleId);
  }
};

// =======================
// START THE DASHBOARD
// =======================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('✅ Dashboard V3 Enhanced loaded!');
