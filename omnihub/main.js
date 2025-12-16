// =======================
// OMNIHUB ELECTRON MAIN PROCESS
// =======================

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

console.log('🚀 OmniHub Electron Starting...');

let mainWindow;

// =======================
// CREATE MAIN WINDOW
// =======================
function createWindow() {
  console.log('🔧 Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: '#1e3c72',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: Add app icon
    show: false // Don't show until ready
  });
  
  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Main window shown');
  });
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
    console.log('🚪 Window closed');
  });
  
  // Handle navigation (security)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Prevent navigation to external URLs
    if (!url.startsWith('file://')) {
      event.preventDefault();
      console.warn('⚠️ Blocked navigation to:', url);
    }
  });
  
  console.log('✅ Main window created');
}

// =======================
// APP LIFECYCLE
// =======================

// When Electron is ready
app.whenReady().then(() => {
  console.log('✅ Electron app ready');
  createWindow();
  
  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', () => {
  console.log('👋 OmniHub shutting down...');
});

// =======================
// IPC HANDLERS
// =======================

// Example: Handle module data requests
ipcMain.handle('get-module-data', async (event, moduleId) => {
  console.log(`📦 Getting data for module: ${moduleId}`);
  // Implement data retrieval logic here
  return { success: true, data: null };
});

ipcMain.handle('set-module-data', async (event, moduleId, data) => {
  console.log(`💾 Saving data for module: ${moduleId}`);
  // Implement data saving logic here
  return { success: true };
});

// Example: Handle external API calls (if needed)
ipcMain.handle('fetch-external', async (event, url, options) => {
  console.log(`🌍 Fetching external resource: ${url}`);
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { success: false, error: error.message };
  }
});

// =======================
// ERROR HANDLING
// =======================

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🎉 OmniHub Electron Main Process Ready!');
