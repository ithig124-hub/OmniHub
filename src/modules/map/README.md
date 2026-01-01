# 🗺️ OmniHub Map Module

Advanced open-source map module with glassmorphism design for the OmniHub Electron app.

## ✨ Features

### Core Mapping
- ✅ **Interactive World Map** - Smooth zooming and panning with OpenLayers
- ✅ **Street View** - OpenStreetMap tiles (free, no API key)
- ✅ **Satellite View** - ESRI World Imagery (free, no API key)
- ✅ **Real-time Coordinates** - Live latitude/longitude display with 6-decimal precision
- ✅ **Reverse Geocoding** - Converts coordinates to human-readable addresses (Nominatim API)

### Pin Management
- ✅ **Drop Pins** - Click to add pins at any location
- ✅ **Name & Describe** - Add custom names and descriptions to pins
- ✅ **Save Pins** - Persistent storage using LocalStorage
- ✅ **View All Pins** - Browse saved pins in a beautiful list
- ✅ **Navigate to Pin** - Smooth fly-to animation
- ✅ **Delete Pins** - Remove unwanted pins

### Routing
- ✅ **Point-to-Point Routing** - Calculate routes between two locations
- ✅ **Distance & Duration** - Display route length and estimated time
- ✅ **Visual Route** - Animated route display on map
- ✅ **OSRM Integration** - Free, open-source routing (no API key required)

### Overlays
- ✅ **Weather Layer** - Toggle weather overlay (requires free OpenWeatherMap API key)
- 🚧 **Traffic Layer** - Structure ready (requires paid API integration)

### UI/UX
- ✅ **Glassmorphism Design** - Frosted-glass panels with backdrop blur
- ✅ **Smooth Animations** - Transitions, hover effects, and fly-to animations
- ✅ **Responsive Layout** - Works on different screen sizes
- ✅ **Custom Pin Markers** - Beautiful gradient pin design
- ✅ **Modern Controls** - Intuitive button layout with icons

## 🛠️ Technology Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Map Library | OpenLayers 8.2 | Free |
| Street Tiles | OpenStreetMap | Free |
| Satellite Tiles | ESRI World Imagery | Free |
| Geocoding | Nominatim (OSM) | Free |
| Routing | OSRM | Free |
| Weather | OpenWeatherMap | Free tier available |
| Storage | LocalStorage | Free |

## 📦 Installation

No installation required! The module uses CDN links for OpenLayers:

```html
<!-- Already included in map.html -->
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css\">
<script src=\"https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js\"></script>
```

## 🚀 Usage

### Standalone Mode
Simply open `map.html` in a browser or Electron app:

```javascript
// Auto-initializes when loaded
```

### Module Integration
```javascript
// Import the module
const mapModule = require('./modules/map/map.js');

// Initialize with a container
mapModule.initModule(document.getElementById('container'));

// Get saved pins data
const pins = mapModule.getPinsData();
```

## 🔑 API Keys (Optional)

### Weather Overlay
To enable weather overlay:
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Open `map.js`
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your key:

```javascript
const WEATHER_API_KEY = 'your_actual_api_key_here';
```

### Traffic Overlay (Future)
Traffic requires a paid API from:
- Google Maps Platform
- Mapbox
- TomTom

Structure is ready for integration when needed.

## 📖 API Reference

### `initModule(container)`
Initializes the map module in the specified container.

**Parameters:**
- `container` (HTMLElement) - DOM element to mount the map

**Returns:** void

### `getPinsData()`
Returns all saved pins as an array.

**Returns:** Array of pin objects
```javascript
[
  {
    id: "1234567890",
    name: "My Location",
    description: "Important place",
    lat: 40.7128,
    lon: -74.0060,
    createdAt: "2025-01-15T10:30:00.000Z"
  }
]
```

## 🎨 Customization

### Styling
Edit `map.css` to customize:
- Glass panel opacity and blur
- Color gradients
- Button styles
- Animation timings

### Map View
Edit `map.js` to change:
- Initial map center and zoom
- Pin marker style
- Route line color
- Layer URLs

## 🔧 Features Breakdown

### Live Coordinates
- Updates in real-time as you move the cursor
- 6-decimal precision (accurate to ~10cm)
- Debounced reverse geocoding (500ms delay)

### Pin System
- Saved to LocalStorage
- Survives page reloads
- UUID-based IDs
- Timestamp tracking
- Custom markers with gradient fill

### Routing
- Two-click route creation
- Green marker for start, red for end
- Auto-fit map to route bounds
- Distance in kilometers
- Duration in minutes

### Glassmorphism
- `backdrop-filter: blur(10px)`
- `rgba()` colors with transparency
- Smooth hover transitions
- Gradient overlays

## 🌐 Free APIs Used

### Nominatim (Reverse Geocoding)
```
https://nominatim.openstreetmap.org/reverse
```
- No API key required
- Rate limit: 1 request/second
- Usage policy: Include User-Agent header

### OSRM (Routing)
```
https://router.project-osrm.org/route/v1/driving
```
- No API key required
- Public demo server
- For production: host your own OSRM instance

### ESRI World Imagery
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery
```
- Free for non-commercial use
- High-quality satellite imagery
- No authentication required

## 🎯 Future Enhancements

### Ready for Implementation
- [ ] GPS tracking integration
- [ ] Live device location
- [ ] Drone path overlay
- [ ] Wearable data visualization
- [ ] Multi-waypoint routing
- [ ] Custom map markers
- [ ] Drawing tools
- [ ] Measurement tools
- [ ] Export routes to GPX

### Structure Prepared
- Route waypoints
- Custom layer management
- External data import
- Real-time updates

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Best performance)
- ✅ Firefox
- ✅ Safari (Limited backdrop-filter support)
- ✅ Electron (Recommended)

## 📝 License

Built with 100% open-source technologies:
- OpenLayers (BSD 2-Clause)
- OpenStreetMap (ODbL)
- OSRM (BSD 2-Clause)

## 🤝 Integration Notes

### For Search Module
```javascript
// Get searchable pins
const pins = getPinsData();

// Search by name or description
const results = pins.filter(pin => 
  pin.name.toLowerCase().includes(query) ||
  pin.description.toLowerCase().includes(query)
);
```

### For Tracking Module
```javascript
// Add live tracking overlay (future feature)
// Structure ready in map.js
```

## 🐛 Known Limitations

1. **Nominatim Rate Limit** - 1 request/second (suitable for mouse-over use)
2. **OSRM Demo Server** - Public server may have occasional downtime
3. **Weather Layer** - Requires free API key signup
4. **Traffic Layer** - Not yet implemented (requires paid API)

## 💡 Tips

1. **Performance**: Keep pin count under 1000 for optimal performance
2. **Storage**: LocalStorage has ~5-10MB limit per domain
3. **Offline**: Works offline after first load (except geocoding/routing)
4. **Accuracy**: Coordinates are accurate to ~10cm with 6-decimal precision

---

**Built for OmniHub** 🚀 | **Powered by Open Source** 💙
