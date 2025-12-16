/**
 * OmniHub Theme & Settings Module
 * Visual control center for OmniHub
 * Standalone, works offline with localStorage persistence
 */

// ============================================
// CONFIGURATION
// ============================================
const THEME_CONFIG = {
  STORAGE_KEY: 'omnihub_theme_settings',
  DEFAULT_SETTINGS: {
    mode: 'auto',
    accentColor: '#667eea',
    gradient: 'ocean',
    blurIntensity: 10,
    glassOpacity: 15,
    glowOpacity: 20,
    motionSpeed: 10,
    grainAmount: 0,
    scenery: 'none',
    ambientSound: false,
    reduceMotion: false,
    smoothTransitions: true,
    customWallpaper: null,
    preset: null,
    videoScenery: 'none',
    videoOpacity: 40,
    videoDim: true
  },
  // Professional, clean, smooth FPV drone footage URLs (royalty-free from Pexels/Pixabay)
  VIDEO_SOURCES: {
    mountains: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    ocean: 'https://videos.pexels.com/video-files/1093662/1093662-uhd_2560_1440_30fps.mp4', 
    forest: 'https://videos.pexels.com/video-files/3571265/3571265-uhd_2560_1440_30fps.mp4',
    city: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4',
    clouds: 'https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4'
  },
  GRADIENTS: {
    ocean: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3d5ca3 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    forest: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    night: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    aurora: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    space: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    professional: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3d566e 100%)',
    hacker: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)'
  },
  PRESETS: {
    professional: {
      mode: 'professional',
      accentColor: '#3498db',
      gradient: 'professional',
      blurIntensity: 8,
      glassOpacity: 10,
      glowOpacity: 10,
      motionSpeed: 8,
      grainAmount: 0,
      scenery: 'none',
      reduceMotion: false,
      smoothTransitions: true
    },
    creative: {
      mode: 'auto',
      accentColor: '#e74c3c',
      gradient: 'sunset',
      blurIntensity: 15,
      glassOpacity: 20,
      glowOpacity: 30,
      motionSpeed: 12,
      grainAmount: 5,
      scenery: 'particles',
      reduceMotion: false,
      smoothTransitions: true
    },
    zen: {
      mode: 'dark',
      accentColor: '#27ae60',
      gradient: 'forest',
      blurIntensity: 20,
      glassOpacity: 12,
      glowOpacity: 15,
      motionSpeed: 5,
      grainAmount: 0,
      scenery: 'waves',
      reduceMotion: false,
      smoothTransitions: true
    },
    hacker: {
      mode: 'dark',
      accentColor: '#00ff00',
      gradient: 'hacker',
      blurIntensity: 5,
      glassOpacity: 8,
      glowOpacity: 25,
      motionSpeed: 15,
      grainAmount: 10,
      scenery: 'rain',
      reduceMotion: false,
      smoothTransitions: true
    }
  }
};

// ============================================
// STATE
// ============================================
let themeSettings = { ...THEME_CONFIG.DEFAULT_SETTINGS };
let sceneryAnimationId = null;
let particles = [];

// ============================================
// STORAGE
// ============================================
function loadSettings() {
  try {
    const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    if (stored) {
      themeSettings = { ...THEME_CONFIG.DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load theme settings:', e);
  }
  return themeSettings;
}

function saveSettings() {
  try {
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, JSON.stringify(themeSettings));
    console.log('✅ Theme settings saved');
  } catch (e) {
    console.warn('Failed to save theme settings:', e);
  }
}

// ============================================
// THEME APPLICATION
// ============================================
function applyTheme() {
  const root = document.documentElement;
  const body = document.body;
  
  // Apply accent color
  root.style.setProperty('--theme-primary', themeSettings.accentColor);
  
  // Apply glass effects
  root.style.setProperty('--blur-amount', `${themeSettings.blurIntensity}px`);
  root.style.setProperty('--glass-opacity', (themeSettings.glassOpacity / 100).toString());
  root.style.setProperty('--glow-opacity', (themeSettings.glowOpacity / 100).toString());
  
  // Apply transition speed
  const transitionSpeed = themeSettings.reduceMotion ? '0s' : `${0.1 + (themeSettings.motionSpeed / 50)}s`;
  root.style.setProperty('--transition-speed', transitionSpeed);
  
  // Apply background
  if (themeSettings.customWallpaper) {
    body.style.background = `url(${themeSettings.customWallpaper}) center/cover no-repeat fixed`;
  } else {
    body.style.background = THEME_CONFIG.GRADIENTS[themeSettings.gradient] || THEME_CONFIG.GRADIENTS.ocean;
  }
  
  // Apply grain
  applyGrain(themeSettings.grainAmount);
  
  // Apply scenery
  updateScenery(themeSettings.scenery);
  
  // Update preview
  updatePreview();
}

function applyGrain(amount) {
  const container = document.querySelector('.theme-container');
  if (!container) return;
  
  if (amount > 0) {
    container.style.setProperty('--grain-opacity', (amount / 100).toString());
    if (!document.getElementById('grain-overlay')) {
      const grain = document.createElement('div');
      grain.id = 'grain-overlay';
      grain.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        z-index: 9999;
        opacity: var(--grain-opacity, 0);
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      `;
      container.appendChild(grain);
    }
    document.getElementById('grain-overlay').style.opacity = amount / 100;
  } else {
    const grain = document.getElementById('grain-overlay');
    if (grain) grain.remove();
  }
}

function updatePreview() {
  const previewBox = document.getElementById('preview-box');
  if (!previewBox) return;
  
  const previewCard = previewBox.querySelector('.preview-card');
  if (previewCard) {
    previewCard.style.background = `rgba(255, 255, 255, ${themeSettings.glassOpacity / 100})`;
    previewCard.style.backdropFilter = `blur(${themeSettings.blurIntensity}px)`;
  }
}

// ============================================
// SCENERY EFFECTS
// ============================================
function updateScenery(type) {
  const canvas = document.getElementById('scenery-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Stop existing animation
  if (sceneryAnimationId) {
    cancelAnimationFrame(sceneryAnimationId);
    sceneryAnimationId = null;
  }
  
  // Resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (type === 'none') {
    canvas.style.opacity = '0';
    return;
  }
  
  canvas.style.opacity = '0.5';
  particles = [];
  
  // Initialize particles based on type
  const particleCount = type === 'stars' ? 150 : type === 'rain' ? 200 : 80;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(type, canvas));
  }
  
  // Start animation
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, i) => {
      updateParticle(p, type, canvas);
      drawParticle(ctx, p, type);
    });
    
    sceneryAnimationId = requestAnimationFrame(animate);
  }
  
  animate();
}

function createParticle(type, canvas) {
  const base = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 0.5 + Math.random() * 2
  };
  
  switch (type) {
    case 'particles':
      return { ...base, size: 2 + Math.random() * 3, alpha: 0.3 + Math.random() * 0.5, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5 };
    case 'rain':
      return { ...base, size: 1, length: 15 + Math.random() * 10, speed: 8 + Math.random() * 8 };
    case 'stars':
      return { ...base, size: 1 + Math.random() * 2, alpha: 0.3 + Math.random() * 0.7, twinkleSpeed: 0.01 + Math.random() * 0.03 };
    case 'waves':
      return { ...base, amplitude: 10 + Math.random() * 20, frequency: 0.01 + Math.random() * 0.02, phase: Math.random() * Math.PI * 2 };
    default:
      return base;
  }
}

function updateParticle(p, type, canvas) {
  switch (type) {
    case 'particles':
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      break;
    case 'rain':
      p.y += p.speed;
      if (p.y > canvas.height) {
        p.y = -p.length;
        p.x = Math.random() * canvas.width;
      }
      break;
    case 'stars':
      p.alpha += p.twinkleSpeed;
      if (p.alpha > 1 || p.alpha < 0.2) p.twinkleSpeed *= -1;
      break;
    case 'waves':
      p.phase += 0.02;
      break;
  }
}

function drawParticle(ctx, p, type) {
  ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha || 0.5})`;
  ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha || 0.5})`;
  
  switch (type) {
    case 'particles':
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rain':
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.length);
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
      ctx.lineWidth = p.size;
      ctx.stroke();
      break;
    case 'stars':
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'waves':
      const y = p.y + Math.sin(p.x * p.frequency + p.phase) * p.amplitude;
      ctx.beginPath();
      ctx.arc(p.x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.fill();
      break;
  }
}

// ============================================
// PRESET APPLICATION
// ============================================
function applyPreset(presetName) {
  const preset = THEME_CONFIG.PRESETS[presetName];
  if (!preset) {
    console.warn('Unknown preset:', presetName);
    return;
  }
  
  console.log('🎨 Applying preset:', presetName);
  
  // Merge preset with current settings
  themeSettings = { ...themeSettings, ...preset, preset: presetName };
  
  // Update UI to reflect new settings
  updateUIFromSettings();
  
  // Apply the theme
  applyTheme();
  
  // Show notification
  showNotification(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied!`);
}

// ============================================
// UI HANDLERS
// ============================================
function setupEventListeners() {
  // Theme Mode
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      themeSettings.mode = btn.dataset.mode;
      applyTheme();
    });
  });
  
  // Color Palette
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      themeSettings.accentColor = btn.dataset.color;
      applyTheme();
    });
  });
  
  // Custom Color
  document.getElementById('custom-color')?.addEventListener('input', (e) => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    themeSettings.accentColor = e.target.value;
    applyTheme();
  });
  
  // Gradient Options
  document.querySelectorAll('.gradient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gradient-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      themeSettings.gradient = btn.dataset.gradient;
      themeSettings.customWallpaper = null;
      document.getElementById('clear-wallpaper').style.display = 'none';
      applyTheme();
    });
  });
  
  // Sliders
  setupSlider('blur-slider', 'blur-value', 'px', (v) => { themeSettings.blurIntensity = v; applyTheme(); });
  setupSlider('opacity-slider', 'opacity-value', '%', (v) => { themeSettings.glassOpacity = v; applyTheme(); });
  setupSlider('glow-slider', 'glow-value', '%', (v) => { themeSettings.glowOpacity = v; applyTheme(); });
  setupSlider('motion-slider', 'motion-value', 'x', (v) => { themeSettings.motionSpeed = v; applyTheme(); }, (v) => (v / 10).toFixed(1));
  setupSlider('grain-slider', 'grain-value', '%', (v) => { themeSettings.grainAmount = v; applyTheme(); });
  
  // Scenery Options
  document.querySelectorAll('.scenery-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenery-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      themeSettings.scenery = btn.dataset.scenery;
      applyTheme();
    });
  });
  
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetName = btn.dataset.preset;
      applyPreset(presetName);
      
      // Update UI
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Toggles
  document.getElementById('ambient-sound-toggle')?.addEventListener('change', (e) => {
    themeSettings.ambientSound = e.target.checked;
  });
  
  document.getElementById('reduce-motion-toggle')?.addEventListener('change', (e) => {
    themeSettings.reduceMotion = e.target.checked;
    applyTheme();
  });
  
  document.getElementById('smooth-transitions-toggle')?.addEventListener('change', (e) => {
    themeSettings.smoothTransitions = e.target.checked;
  });
  
  // Wallpaper Upload
  document.getElementById('wallpaper-upload')?.addEventListener('change', handleWallpaperUpload);
  document.getElementById('clear-wallpaper')?.addEventListener('click', clearWallpaper);
  
  // Action Buttons
  document.getElementById('save-theme')?.addEventListener('click', () => {
    saveSettings();
    showNotification('Theme saved!');
  });
  
  document.getElementById('reset-theme')?.addEventListener('click', () => {
    if (confirm('Reset all theme settings to defaults?')) {
      themeSettings = { ...THEME_CONFIG.DEFAULT_SETTINGS };
      updateUIFromSettings();
      applyTheme();
      showNotification('Theme reset to defaults');
    }
  });
  
  document.getElementById('export-theme')?.addEventListener('click', exportTheme);
  document.getElementById('import-theme')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });
  document.getElementById('import-file')?.addEventListener('change', importTheme);
  
  // Window resize
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('scenery-canvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

function setupSlider(sliderId, valueId, suffix, onChange, format = (v) => v) {
  const slider = document.getElementById(sliderId);
  const valueEl = document.getElementById(valueId);
  
  if (!slider || !valueEl) return;
  
  slider.addEventListener('input', () => {
    const value = parseInt(slider.value);
    valueEl.textContent = `${format(value)}${suffix}`;
    onChange(value);
  });
}

function handleWallpaperUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    themeSettings.customWallpaper = event.target.result;
    document.querySelectorAll('.gradient-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('clear-wallpaper').style.display = 'block';
    applyTheme();
  };
  reader.readAsDataURL(file);
}

function clearWallpaper() {
  themeSettings.customWallpaper = null;
  document.getElementById('clear-wallpaper').style.display = 'none';
  // Re-select first gradient
  const firstGradient = document.querySelector('.gradient-btn');
  if (firstGradient) {
    firstGradient.classList.add('active');
    themeSettings.gradient = firstGradient.dataset.gradient;
  }
  applyTheme();
}

function exportTheme() {
  const data = JSON.stringify(themeSettings, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'omnihub-theme.json';
  a.click();
  
  URL.revokeObjectURL(url);
  showNotification('Theme exported!');
}

function importTheme(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      themeSettings = { ...THEME_CONFIG.DEFAULT_SETTINGS, ...imported };
      updateUIFromSettings();
      applyTheme();
      saveSettings();
      showNotification('Theme imported!');
    } catch (err) {
      alert('Invalid theme file');
    }
  };
  reader.readAsText(file);
}

function updateUIFromSettings() {
  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === themeSettings.mode);
  });
  
  // Update color buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === themeSettings.accentColor);
  });
  document.getElementById('custom-color').value = themeSettings.accentColor;
  
  // Update gradient buttons
  document.querySelectorAll('.gradient-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.gradient === themeSettings.gradient && !themeSettings.customWallpaper);
  });
  
  // Update sliders
  updateSlider('blur-slider', 'blur-value', themeSettings.blurIntensity, 'px');
  updateSlider('opacity-slider', 'opacity-value', themeSettings.glassOpacity, '%');
  updateSlider('glow-slider', 'glow-value', themeSettings.glowOpacity, '%');
  updateSlider('motion-slider', 'motion-value', themeSettings.motionSpeed, 'x', (v) => (v / 10).toFixed(1));
  updateSlider('grain-slider', 'grain-value', themeSettings.grainAmount, '%');
  
  // Update scenery buttons
  document.querySelectorAll('.scenery-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scenery === themeSettings.scenery);
  });
  
  // Update toggles
  const ambientToggle = document.getElementById('ambient-sound-toggle');
  if (ambientToggle) ambientToggle.checked = themeSettings.ambientSound;
  
  const reduceToggle = document.getElementById('reduce-motion-toggle');
  if (reduceToggle) reduceToggle.checked = themeSettings.reduceMotion;
  
  const smoothToggle = document.getElementById('smooth-transitions-toggle');
  if (smoothToggle) smoothToggle.checked = themeSettings.smoothTransitions;
  
  // Update wallpaper clear button
  document.getElementById('clear-wallpaper').style.display = themeSettings.customWallpaper ? 'block' : 'none';
}

function updateSlider(sliderId, valueId, value, suffix, format = (v) => v) {
  const slider = document.getElementById(sliderId);
  const valueEl = document.getElementById(valueId);
  if (slider) slider.value = value;
  if (valueEl) valueEl.textContent = `${format(value)}${suffix}`;
}

function showNotification(message) {
  // Simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============================================
// MODULE LIFECYCLE
// ============================================
window.themeModule = {
  onActivate: () => {
    console.log('🎨 Theme module activated');
  },
  
  onDeactivate: () => {
    console.log('🎨 Theme module deactivated');
    // Stop scenery animation
    if (sceneryAnimationId) {
      cancelAnimationFrame(sceneryAnimationId);
    }
  },
  
  exportData: () => themeSettings,
  
  importData: (data) => {
    themeSettings = { ...THEME_CONFIG.DEFAULT_SETTINGS, ...data };
    updateUIFromSettings();
    applyTheme();
  },
  
  // Public API for cross-module theming (placeholder)
  getTheme: () => themeSettings,
  setAccentColor: (color) => {
    themeSettings.accentColor = color;
    applyTheme();
  }
};

// ============================================
// INITIALIZATION
// ============================================
function initThemeModule() {
  console.log('🎨 Initializing Theme Module...');
  
  loadSettings();
  setupEventListeners();
  updateUIFromSettings();
  applyTheme();
  
  console.log('✅ Theme Module ready');
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeModule);
} else {
  initThemeModule();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initThemeModule };
}