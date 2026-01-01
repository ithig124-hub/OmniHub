# 🌍 OmniHub Globe Module

**Advanced 3D Globe for Global Research & Data Visualization**

---

## 📋 Overview

The Globe module is a powerful spatial intelligence tool that transforms OmniHub into a comprehensive geographic analysis platform. Built with Three.js and globe.gl, it provides interactive 3D Earth visualization with multiple data layers, research capabilities, and intelligence features.

---

## ✨ Features

### 🌐 Interactive 3D Globe
- **Fully Interactive**: Smooth zoom, rotate, and tilt controls
- **High-Quality Textures**: Blue Marble imagery with topographic bump mapping
- **Atmosphere Effect**: Realistic atmospheric halo
- **Day/Night Cycle**: Visual representation of Earth's lighting (coming soon)
- **Performance Optimized**: Runs at 60fps on desktop

### 📍 Pin System
- **Drop Pins Anywhere**: Click anywhere on Earth to place markers
- **Location Information**: Automatic country/region detection
- **Save & Manage**: Persistent pin storage with LocalStorage
- **Quick Navigation**: Jump to saved pins instantly
- **Delete Management**: Easy pin removal

### 🧭 Live Coordinate Tracking
- **Real-time Display**: Latitude and longitude under cursor
- **Location Intelligence**: Automatic location name resolution
- **Ocean Detection**: Identifies ocean regions with detailed info
- **Population Data**: Shows population for major cities/countries

### 🔎 Research Panel
- **Smart Search**: Search by country, city, coordinates, or region
- **Instant Results**: Fast lookup in comprehensive database
- **Fly-to Feature**: Smooth camera animation to search results
- **Result Cards**: Quick summary information

### ✈️ Data Layers (Toggleable)

#### Live Flight Tracking
- Real-time flight data from AviationStack API
- Accurate aircraft positions worldwide
- Flight details including altitude, speed, heading
- Departure and arrival information
- Airline and aircraft details
- Click on any aircraft for detailed information

#### Ocean Data Layer
- 5 major ocean regions
- Temperature ranges
- Depth information
- Biodiversity summaries
- Major ocean currents

#### Coordinate Grid
- Latitude/longitude grid overlay
- Adjustable opacity
- Reference system

### 💾 State Persistence
- Camera position saved automatically
- Layer preferences remembered
- Pins stored across sessions
- Search history maintained

---

## 🎯 Use Cases

### Academic Research
- Geographic studies
- Climate analysis
- Population distribution
- Historical trade routes

### Business Intelligence
- Supply chain visualization
- Market analysis
- Trade route planning
- Global operations mapping

### Travel Planning
- Route exploration
- Destination research
- Geographic context
- Distance calculations

### Education
- Geography learning
- Cultural exploration
- Environmental awareness
- Global connectivity understanding

---

## 🛠️ Technical Stack

### Core Libraries
- **Three.js** (v0.182.0): 3D rendering engine
- **globe.gl** (v2.45.0): Globe visualization library
- **D3.js** (v7.9.0): Data visualization utilities
- **Zustand** (via globeState.js): State management

### Data Sources
- **Natural Earth**: Country boundaries and geography
- **OpenFlights**: Flight route data
- **Custom Datasets**: Ocean data, shipping routes

---

## 📁 File Structure

```
globe/
├── globe.html              # Main HTML structure
├── globe.css               # Glassmorphism styling
├── globe.js                # Main module logic
├── globeState.js           # State management
├── README.md               # This file
├── data/
│   └── staticDatasets.js   # Geographic data & search
├── layers/
│   ├── flights.js          # Flight routes layer
│   ├── shipping.js         # Shipping lanes layer
│   └── oceans.js           # Ocean data layer
└── components/             # Future: React components
```

---

## 🎮 Controls

### Mouse Controls
- **Left Click + Drag**: Rotate globe
- **Scroll Wheel**: Zoom in/out
- **Click Location**: Open location details
- **Hover**: See coordinates and info

### Search
- Type location name in search box
- Press Enter or click Search
- Click result to fly to location

### Layers
- Toggle checkboxes to show/hide layers
- Adjust opacity sliders for each layer
- Changes saved automatically

### Pins
- Click anywhere on globe to add pin
- Click "Save Pin" in modal
- Click saved pin to navigate
- Click "Delete" to remove

---

## 🔧 Integration with OmniHub

### Navigation System
The Globe module integrates with OmniHub's core navigation:

```javascript
window.globeModule = {
  onActivate: () => {
    // Resize renderer when module becomes active
  },
  onDeactivate: () => {
    // Save state when leaving module
  },
  getState: () => {
    // Return current state for preservation
  },
  restoreState: (state) => {
    // Restore saved state
  }
};
```

### State Management
Uses `globeState.js` for centralized state:
- Camera position (lat, lng, altitude)
- Layer visibility & opacity
- Saved pins
- Search results
- Current location info

### Module Registration
Register in OmniHub's module list:
```javascript
{
  id: 'globe',
  name: '🌍 Globe',
  url: 'modules/globe/globe.html',
  icon: '🌍'
}
```

---

## 📊 Data Coverage

### Geographic Data
- **Countries**: 20 major countries with full info
- **Cities**: 15 global metropolitan areas
- **Oceans**: 5 major ocean regions
- **Coordinates**: Full lat/lng coverage

### Route Data
- **Flight Routes**: 40+ international connections
- **Shipping Lanes**: 20+ major maritime routes
- **Historical Routes**: Silk Road, Spice Route (display only)

---

## 🎨 Design System

### Glassmorphism Theme
- Frosted glass panels: `rgba(255, 255, 255, 0.1)` + `backdrop-filter: blur(10px)`
- Gradient backgrounds: `#667eea` → `#764ba2`
- Smooth transitions: 300ms ease
- Hover effects: Lift and brighten

### Color Palette
- **Flight Routes**: Orange/Red gradients
- **Shipping Lanes**: Blue gradients
- **Ocean Labels**: Light blue
- **Pins**: Red markers
- **Text**: White with varying opacity

---

## 🚀 Performance

### Optimization
- Hardware-accelerated rendering
- Efficient state management
- Throttled camera updates (2s intervals)
- Lazy loading of data layers
- Minimal DOM manipulation

### Metrics
- **FPS**: 60 fps target
- **Load Time**: < 2 seconds
- **Memory**: ~100MB typical usage
- **Bundle Size**: ~500KB (with libraries via CDN)

---

## 🔮 Roadmap (V2)

### Enhanced Features
- [ ] Real-time weather overlay
- [ ] Earthquake & natural disaster data
- [ ] Satellite tracking
- [ ] Night lights overlay
- [ ] Population density heatmap
- [ ] Historical timeline slider
- [ ] 3D terrain elevation
- [ ] Custom data layer import

### Advanced Research
- [ ] Export research data
- [ ] Collaboration features
- [ ] Annotation tools
- [ ] Measurement tools (distance, area)
- [ ] Data comparison mode
- [ ] Time-series visualization

### Integration
- [ ] Connect to Notes module
- [ ] Feed data to Dashboard
- [ ] Cross-module search
- [ ] API for external data sources

---

## 🐛 Troubleshooting

### Globe Not Loading
1. Check browser console (F12)
2. Verify CDN connectivity (Three.js, globe.gl, D3)
3. Check WebGL support: `chrome://gpu`
4. Clear browser cache

### Performance Issues
1. Disable unused layers
2. Reduce layer opacity
3. Close other applications
4. Update graphics drivers
5. Use hardware acceleration

### Pins Not Saving
1. Check LocalStorage quota
2. Clear old data: `localStorage.clear()`
3. Check browser privacy settings
4. Verify pin data in DevTools

---

## 📝 API Reference

### GlobeState
```javascript
// Get state
globeState.get('camera.lat')

// Set state
globeState.set('camera.lat', 40.7128)

// Add pin
globeState.addPin({ lat, lng, name })

// Remove pin
globeState.removePin(pinId)

// Toggle layer
globeState.toggleLayer('flights')

// Set opacity
globeState.setLayerOpacity('flights', 0.7)
```

### GlobeData
```javascript
// Search locations
GlobeData.search('london')

// Get country info
GlobeData.getCountryInfo('United States')

// Get location by coords
GlobeData.getLocationByCoords(40.7128, -74.0060)
```

### Layers
```javascript
// Apply layer
FlightLayer.applyToGlobe(globe, opacity)

// Remove layer
FlightLayer.removeFromGlobe(globe)

// Update opacity
FlightLayer.setOpacity(globe, 0.5)
```

---

## 👥 Credits

### Libraries
- **Three.js** - 3D graphics library
- **globe.gl** - Globe visualization
- **D3.js** - Data utilities

### Data Sources
- **Natural Earth** - Geographic data
- **OpenFlights** - Route data
- **Blue Marble** - Earth imagery

---

## 📄 License

Part of OmniHub - MIT License

---

**Built with ❤️ for exploration and intelligence**

🌍 **OmniHub Globe** - Your window to the world.
