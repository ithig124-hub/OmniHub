// =======================
// DASHBOARD ROUTER
// Extends NavigationController to support category-based dashboards
// =======================

class DashboardRouter {
  constructor(navigationController) {
    this.navController = navigationController;
    this.currentView = 'dashboard'; // 'dashboard' or 'module'
    this.currentDashboard = null;
    this.dashboards = [];
    this.currentDashboardIndex = 0;
    
    console.log('🧭 Dashboard Router initialized');
  }

  // =======================
  // DASHBOARD MANAGEMENT
  // =======================

  setDashboards(dashboards) {
    this.dashboards = dashboards;
    console.log('📋 Dashboards registered:', dashboards.length);
  }

  // Load a dashboard by ID or index
  loadDashboard(dashboardIdOrIndex, direction = 'next') {
    let targetIndex;
    
    if (typeof dashboardIdOrIndex === 'string') {
      targetIndex = this.dashboards.findIndex(d => d.id === dashboardIdOrIndex);
    } else {
      targetIndex = dashboardIdOrIndex;
    }

    if (targetIndex === -1 || targetIndex >= this.dashboards.length) {
      console.warn('Invalid dashboard target:', dashboardIdOrIndex);
      return false;
    }

    const dashboard = this.dashboards[targetIndex];
    this.currentDashboard = dashboard;
    this.currentDashboardIndex = targetIndex;
    this.currentView = 'dashboard';

    console.log(`🧭 Loading dashboard: ${dashboard.name} (${targetIndex})`);

    return {
      success: true,
      dashboard: dashboard,
      index: targetIndex,
      direction: direction
    };
  }

  // Navigate to next dashboard (circular)
  nextDashboard() {
    const nextIndex = (this.currentDashboardIndex + 1) % this.dashboards.length;
    return this.loadDashboard(nextIndex, 'next');
  }

  // Navigate to previous dashboard (circular)
  previousDashboard() {
    const prevIndex = (this.currentDashboardIndex - 1 + this.dashboards.length) % this.dashboards.length;
    return this.loadDashboard(prevIndex, 'prev');
  }

  // =======================
  // MODULE NAVIGATION
  // =======================

  // Navigate from dashboard to a specific module
  navigateToModule(moduleId) {
    this.currentView = 'module';
    
    // Use existing navigation controller
    const result = this.navController.jumpTo(moduleId);
    
    if (result && result.success) {
      console.log(`📦 Navigating from dashboard to module: ${moduleId}`);
      return result;
    }
    
    return { success: false };
  }

  // Navigate back from module to its parent dashboard
  navigateBackToDashboard() {
    const currentModule = this.navController.getCurrentModule();
    
    // Determine which dashboard the current module belongs to
    const dashboard = this.findDashboardForModule(currentModule?.id);
    
    if (dashboard) {
      this.currentView = 'dashboard';
      return this.loadDashboard(dashboard.id, 'back');
    }
    
    // Default to first dashboard (Core)
    return this.loadDashboard(0, 'back');
  }

  // Find which dashboard a module belongs to
  findDashboardForModule(moduleId) {
    for (const dashboard of this.dashboards) {
      if (dashboard.modules && dashboard.modules.includes(moduleId)) {
        return dashboard;
      }
    }
    return null;
  }

  // =======================
  // GETTERS
  // =======================

  getCurrentView() {
    return this.currentView;
  }

  getCurrentDashboard() {
    return this.currentDashboard;
  }

  getCurrentDashboardIndex() {
    return this.currentDashboardIndex;
  }

  getAllDashboards() {
    return this.dashboards;
  }

  isInDashboardView() {
    return this.currentView === 'dashboard';
  }

  isInModuleView() {
    return this.currentView === 'module';
  }
}

// Expose to window for browser use
window.DashboardRouter = DashboardRouter;

// Export for use in other modules (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardRouter;
}
