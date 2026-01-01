const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false, // Changed to false to allow local file access
      webSecurity: true
    },
    icon: path.join(__dirname, 'src/assets/icons/icon.png'),
    backgroundColor: '#1a1a1a',
    show: false
  });

  // Use path.join to ensure correct file path
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for dataStore
ipcMain.handle('dataStore:get', async (event, key) => {
  // Implement persistent storage if needed
  return null;
});

ipcMain.handle('dataStore:set', async (event, key, value) => {
  // Implement persistent storage if needed
  return true;
});

ipcMain.handle('dataStore:remove', async (event, key) => {
  // Implement persistent storage if needed
  return true;
});
