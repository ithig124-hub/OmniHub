# 🌐 OmniHub - Modular Super App

**A next-generation desktop application that merges productivity, creativity, and exploration into a single, cohesive experience.**

---

## 🎯 **Features**

### ✅ **Fully Implemented:**
- 🗺️ **Map Module** - OpenLayers integration with street/satellite views, pins, routing, weather overlay
- 🔄 **Module Switching** - Swipe gestures and smooth transitions between modules
- ⌨️ **Keyboard Shortcuts** - Arrow keys for navigation, number keys (1-6) for direct module access
- 📱 **Touch Support** - Swipe left/right to switch modules
- 💾 **Data Persistence** - LocalStorage integration for saving module data
- 🎨 **Glassmorphism UI** - Beautiful frosted glass panels and gradients

### 📍 **Modules:**
1. **Map** ✅ - Fully functional with OpenLayers
2. **Notes** 🚧 - Skeleton ready
3. **Library** 🚧 - Skeleton ready  
4. **Search** 🚧 - Skeleton ready
5. **Dashboard** 🚧 - Skeleton ready
6. **Tracking** 🚧 - Skeleton ready

---

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd /app/omnihub
npm install
# or
yarn install
```

### **2. Run OmniHub**
```bash
npm start
# or for development with DevTools
npm run dev
```

### **3. Navigate Between Modules**
- **Swipe**: Left/Right gestures
- **Keyboard**: Arrow keys (← →)
- **Direct Access**: Number keys (1-6)
- **Mouse**: Click navigation buttons

---

## 📁 **Project Structure**

```
omnihub/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── package.json         # Dependencies & scripts
└── src/
    ├── index.html       # Main entry point
    ├── renderer.js      # Module switcher & swipe handler
    ├── modules/
    │   ├── map/         ✅ Complete
    │   │   ├── map.html
    │   │   ├── map.js
    │   │   ├── map.css
    │   │   ├── config.js
    │   │   └── README.md
    │   ├── notes/       🚧 Skeleton
    │   ├── library/     🚧 Skeleton
    │   ├── search/      🚧 Skeleton
    │   ├── dashboard/   🚧 Skeleton
    │   └── tracking/    🚧 Skeleton
    └── styles/
        └── global.css   # Global styles
```

---

## 🗺️ **Map Module Features**

✅ **Interactive Map**
- OpenLayers integration
- Street view (OpenStreetMap)
- Satellite view (ESRI World Imagery)
- Smooth zoom & pan

✅ **Live Coordinates**
- Real-time latitude/longitude display
- Reverse geocoding (address lookup)
- Nominatim API integration

✅ **Pin Management**
- Add, save, and delete pins
- Pin descriptions
- Navigate to saved pins
- LocalStorage persistence

✅ **Routing**
- Two-point routing (OSRM)
- Distance & duration display
- Visual route overlay

✅ **Weather Overlay** (API key required)
- OpenWeatherMap integration
- Precipitation overlay
- Easy configuration

---

## ⌨️ **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| `←` | Previous module |
| `→` | Next module |
| `1` | Map module |
| `2` | Notes module |
| `3` | Library module |
| `4` | Search module |
| `5` | Dashboard module |
| `6` | Tracking module |

---

## 🔧 **Configuration**

### **Map Module Config**
Edit `/src/modules/map/config.js`:

```javascript
// Weather API Key (get free key from openweathermap.org)
WEATHER_API_KEY = 'your_api_key_here';

// Map Settings
MAP_CONFIG = {
  initialCenter: [-74.006, 40.7128],  // [lon, lat]
  initialZoom: 12,
  // ... more settings
};
```

---

## 🛠️ **Module Communication**

Modules can communicate through the global `OmniHub` API:

```javascript
// In any module:

// Get current module info
const current = window.parent.OmniHub.getCurrentModule();

// Navigate to another module
window.parent.OmniHub.navigateToModule('notes');

// Store/retrieve data
window.parent.OmniHub.setModuleData('myModule', { key: 'value' });
const data = window.parent.OmniHub.getModuleData('myModule');
```

---

## 📦 **Building for Production**

### **Windows**
```bash
npm run build:win
```

### **macOS**
```bash
npm run build:mac
```

### **Linux**
```bash
npm run build:linux
```

### **All Platforms**
```bash
npm run build:all
```

Built apps will be in the `dist/` folder.

---

## 🎨 **Design System**

### **Glassmorphism**
- Frosted glass panels: `rgba(255, 255, 255, 0.1)` + `backdrop-filter: blur(10px)`
- Gradient overlays
- Smooth transitions
- Shadow effects

### **Color Palette**
- Primary: `#667eea` → `#764ba2` (gradient)
- Background: `#1e3c72` → `#2a5298` → `#3d5ca3`
- Text: White with varying opacity

### **Animations**
- Swipe transitions: 400ms ease
- Hover effects: 300ms ease
- Loading spinners

---

## 🔮 **Roadmap**

### **Phase 1: Core Modules** (In Progress)
- [x] Map module - Complete
- [ ] Notes module - Hierarchical note-taking
- [ ] Library module - PDF management with Internet Archive
- [ ] Search module - Cross-module search
- [ ] Dashboard module - Smart home controls (Nest Hub style)
- [ ] Tracking module - GPS tracking & visualization

### **Phase 2: Advanced Features**
- [ ] IoT/Bluetooth integration (ESP32)
- [ ] Wearable device tracking (Apple Watch, etc.)
- [ ] AI Assistant (ChatGPT integration)
- [ ] Voice commands
- [ ] Gesture navigation

### **Phase 3: Customization**
- [ ] Theme maker
- [ ] Custom wallpapers
- [ ] Particle effects
- [ ] Scenery modules (nature, space, urban)
- [ ] Plugin system

---

## 🐛 **Troubleshooting**

### **Map not loading?**
1. Check browser console (F12)
2. Verify OpenLayers CDN is accessible
3. Check network connection

### **Weather overlay not working?**
1. Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add key to `/src/modules/map/config.js`
3. Reload the app

### **Module switching broken?**
1. Check if all module HTML files exist
2. Verify file paths in `renderer.js`
3. Check browser console for errors

---

## 📝 **License**

MIT License - Feel free to use, modify, and distribute!

---

## 🙏 **Credits**

- **OpenLayers** - Map rendering
- **OpenStreetMap** - Street tiles
- **ESRI** - Satellite imagery
- **Nominatim** - Geocoding
- **OSRM** - Routing
- **Electron** - Desktop framework

---

## 📧 **Support**

Need help? Found a bug? Want to contribute?
- Open an issue on GitHub
- Check the documentation in each module's README

---

**Built with ❤️ for productivity and creativity**

🌐 **OmniHub** - Your digital workspace, reimagined.
