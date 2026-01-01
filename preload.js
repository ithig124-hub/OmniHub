const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // DataStore API
  dataStore: {
    get: (key) => ipcRenderer.invoke('dataStore:get', key),
    set: (key, value) => ipcRenderer.invoke('dataStore:set', key, value),
    remove: (key) => ipcRenderer.invoke('dataStore:remove', key)
  },
  
  // Platform info
  platform: process.platform,
  version: process.versions.electron
});
