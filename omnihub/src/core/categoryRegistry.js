// =======================
// CATEGORY REGISTRY
// Defines dashboard categories and their module mappings
// =======================

const CATEGORY_DASHBOARDS = [
  {
    id: 'core',
    name: 'Core',
    icon: '🧭',
    path: './dashboards/coreDashboard.html',
    description: 'Search, Notes & Essential Tools',
    modules: ['search', 'notes', 'dashboard', 'theme']
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: '🗺️',
    path: './dashboards/navigationDashboard.html',
    description: 'Explore the world with interactive maps',
    modules: ['map', 'globe', 'tracking']
  },
  {
    id: 'research',
    name: 'Research & Knowledge',
    icon: '🔬',
    path: './dashboards/researchDashboard.html',
    description: 'Explore, learn, and discover',
    modules: ['factLens', 'library']
  },
  {
    id: 'food',
    name: 'Food & Student Life',
    icon: '🍿',
    path: './dashboards/foodDashboard.html',
    description: 'Find deals and plan meals',
    modules: ['snackScout']
  }
];

// Expose to window
window.CATEGORY_DASHBOARDS = CATEGORY_DASHBOARDS;

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORY_DASHBOARDS };
}

console.log('📋 Category Registry loaded:', CATEGORY_DASHBOARDS.length, 'dashboards');
