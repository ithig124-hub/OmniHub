// =======================
// OMNIHUB PRELOAD SCRIPT
// Exposes safe APIs to renderer process
// =======================

const { contextBridge, ipcRenderer } = require('electron');

console.log('🔒 OmniHub Preload Script Loading...');

// =======================
// EXPOSE SAFE APIs
// =======================

contextBridge.exposeInMainWorld('electronAPI', {
  // Module data management
  getModuleData: (moduleId) => ipcRenderer.invoke('get-module-data', moduleId),
  setModuleData: (moduleId, data) => ipcRenderer.invoke('set-module-data', moduleId, data),
  
  // External API calls (optional, for secure external requests)
  fetchExternal: (url, options) => ipcRenderer.invoke('fetch-external', url, options),
  
  // System info
  platform: process.platform,
  version: process.versions.electron,
  
  // Utility functions
  log: (message) => console.log('📡 Renderer:', message)
});

console.log('✅ OmniHub APIs exposed to renderer');
console.log('🎉 Preload script ready!');
