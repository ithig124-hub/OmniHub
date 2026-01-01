// Country Borders Layer
// Display country boundaries for better geographic reference

const CountryBordersLayer = {
  // Apply country borders to globe
  applyToGlobe: function(globe) {
    console.log('🗺️ Loading country borders...');
    
    // Fetch GeoJSON data for country borders
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries);
        
        globe
          .polygonsData(countries.features)
          .polygonCapColor(() => 'rgba(0, 0, 0, 0)')
          .polygonSideColor(() => 'rgba(255, 255, 255, 0.1)')
          .polygonStrokeColor(() => '#4fc3f7')
          .polygonAltitude(0.001);
        
        console.log('✅ Country borders loaded');
      })
      .catch(error => {
        console.warn('⚠️ Could not load country borders:', error);
        // Fallback: just show without borders
      });
  },
  
  // Remove from globe
  removeFromGlobe: function(globe) {
    globe.polygonsData([]);
    console.log('🗺️ Country borders removed');
  }
};

window.CountryBordersLayer = CountryBordersLayer;
console.log('🗺️ Country Borders Layer initialized');
