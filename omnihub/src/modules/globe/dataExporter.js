// =======================
// DATA EXPORTER
// Export research data in multiple formats
// =======================

class DataExporter {
  constructor() {
    this.exportFormats = ['json', 'csv', 'geojson', 'kml', 'gpx'];
  }
  
  // Export complete research data
  exportAllData(format = 'json') {
    const data = this.gatherAllData();
    
    switch (format) {
      case 'json':
        return this.exportAsJSON(data);
      case 'csv':
        return this.exportAsCSV(data);
      case 'geojson':
        return this.exportAsGeoJSON(data);
      case 'kml':
        return this.exportAsKML(data);
      case 'gpx':
        return this.exportAsGPX(data);
      default:
        return this.exportAsJSON(data);
    }
  }
  
  // Gather all research data
  gatherAllData() {
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        source: 'OmniHub Globe Module'
      },
      pins: window.SmartPinsManager?.getAllPins().map(p => p.export()) || [],
      annotations: window.AnnotationSystem?.getAllAnnotations().map(a => a.export()) || [],
      measurements: window.ResearchMode?.measurements || [],
      lockedCoordinates: window.ResearchMode?.lockedCoordinates || [],
      cameraPosition: window.globeState?.get('camera') || {},
      activeOverlays: Array.from(window.ZoomIntelligence?.activeOverlays || [])
    };
  }
  
  // Export as JSON
  exportAsJSON(data) {
    return {
      content: JSON.stringify(data, null, 2),
      filename: `omnihub-research-${Date.now()}.json`,
      mimeType: 'application/json'
    };
  }
  
  // Export as CSV (pins and annotations)
  exportAsCSV(data) {
    const rows = [];
    
    // Headers
    rows.push(['Type', 'ID', 'Name/Title', 'Latitude', 'Longitude', 'Category', 'Notes', 'Timestamp'].join(','));
    
    // Pins
    data.pins.forEach(pin => {
      rows.push([
        'Pin',
        pin.id,
        this.escapeCSV(pin.name),
        pin.lat,
        pin.lng,
        pin.category || '',
        this.escapeCSV(pin.notes || ''),
        pin.timestamp
      ].join(','));
    });
    
    // Annotations
    data.annotations.forEach(ann => {
      rows.push([
        'Annotation',
        ann.id,
        this.escapeCSV(ann.title),
        ann.lat,
        ann.lng,
        ann.category,
        this.escapeCSV(ann.text),
        ann.timestamp
      ].join(','));
    });
    
    return {
      content: rows.join('\n'),
      filename: `omnihub-research-${Date.now()}.csv`,
      mimeType: 'text/csv'
    };
  }
  
  // Export as GeoJSON
  exportAsGeoJSON(data) {
    const features = [];
    
    // Add pins as features
    data.pins.forEach(pin => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pin.lng, pin.lat]
        },
        properties: {
          type: 'pin',
          id: pin.id,
          name: pin.name,
          category: pin.category,
          notes: pin.notes,
          timestamp: pin.timestamp
        }
      });
    });
    
    // Add annotations as features
    data.annotations.forEach(ann => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ann.lng, ann.lat]
        },
        properties: {
          type: 'annotation',
          id: ann.id,
          title: ann.title,
          text: ann.text,
          category: ann.category,
          timestamp: ann.timestamp
        }
      });
    });
    
    // Add measurements as LineStrings
    data.measurements.forEach(m => {
      if (m.type === 'distance' && m.points.length === 2) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: m.points.map(p => [p.lng, p.lat])
          },
          properties: {
            type: 'measurement',
            measurementType: 'distance',
            value: m.value,
            unit: m.unit,
            timestamp: m.timestamp
          }
        });
      }
    });
    
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };
    
    return {
      content: JSON.stringify(geojson, null, 2),
      filename: `omnihub-research-${Date.now()}.geojson`,
      mimeType: 'application/geo+json'
    };
  }
  
  // Export as KML (Google Earth format)
  exportAsKML(data) {
    const kml = [];
    
    kml.push('<?xml version="1.0" encoding="UTF-8"?>');
    kml.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
    kml.push('  <Document>');
    kml.push('    <name>OmniHub Research Data</name>');
    kml.push('    <description>Exported from OmniHub Globe Module</description>');
    
    // Add pins
    data.pins.forEach(pin => {
      kml.push('    <Placemark>');
      kml.push(`      <name>${this.escapeXML(pin.name)}</name>`);
      kml.push(`      <description>${this.escapeXML(pin.notes || '')}</description>`);
      kml.push('      <Point>');
      kml.push(`        <coordinates>${pin.lng},${pin.lat},0</coordinates>`);
      kml.push('      </Point>');
      kml.push('    </Placemark>');
    });
    
    // Add annotations
    data.annotations.forEach(ann => {
      kml.push('    <Placemark>');
      kml.push(`      <name>${this.escapeXML(ann.title)}</name>`);
      kml.push(`      <description>${this.escapeXML(ann.text)}</description>`);
      kml.push('      <Point>');
      kml.push(`        <coordinates>${ann.lng},${ann.lat},0</coordinates>`);
      kml.push('      </Point>');
      kml.push('    </Placemark>');
    });
    
    kml.push('  </Document>');
    kml.push('</kml>');
    
    return {
      content: kml.join('\n'),
      filename: `omnihub-research-${Date.now()}.kml`,
      mimeType: 'application/vnd.google-earth.kml+xml'
    };
  }
  
  // Export as GPX (GPS Exchange Format)
  exportAsGPX(data) {
    const gpx = [];
    
    gpx.push('<?xml version="1.0" encoding="UTF-8"?>');
    gpx.push('<gpx version="1.1" creator="OmniHub">');
    gpx.push('  <metadata>');
    gpx.push('    <name>OmniHub Research Data</name>');
    gpx.push(`    <time>${new Date().toISOString()}</time>`);
    gpx.push('  </metadata>');
    
    // Add pins as waypoints
    data.pins.forEach(pin => {
      gpx.push(`  <wpt lat="${pin.lat}" lon="${pin.lng}">`);
      gpx.push(`    <name>${this.escapeXML(pin.name)}</name>`);
      gpx.push(`    <desc>${this.escapeXML(pin.notes || '')}</desc>`);
      gpx.push(`    <time>${pin.timestamp}</time>`);
      gpx.push('  </wpt>');
    });
    
    // Add annotations as waypoints
    data.annotations.forEach(ann => {
      gpx.push(`  <wpt lat="${ann.lat}" lon="${ann.lng}">`);
      gpx.push(`    <name>${this.escapeXML(ann.title)}</name>`);
      gpx.push(`    <desc>${this.escapeXML(ann.text)}</desc>`);
      gpx.push(`    <time>${ann.timestamp}</time>`);
      gpx.push('  </wpt>');
    });
    
    gpx.push('</gpx>');
    
    return {
      content: gpx.join('\n'),
      filename: `omnihub-research-${Date.now()}.gpx`,
      mimeType: 'application/gpx+xml'
    };
  }
  
  // Download exported data
  downloadData(format = 'json') {
    const exported = this.exportAllData(format);
    
    const blob = new Blob([exported.content], { type: exported.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exported.filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log(`💾 Exported data as ${format}: ${exported.filename}`);
    this.showNotification(`Data exported as ${format.toUpperCase()}`);
  }
  
  // Utility: Escape CSV values
  escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  
  // Utility: Escape XML values
  escapeXML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  // Show notification
  showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'export-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #11998e, #38ef7d);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Create global instance
window.DataExporter = new DataExporter();
console.log('💾 Data Exporter initialized');