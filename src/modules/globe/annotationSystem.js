// =======================
// ANNOTATION SYSTEM
// Add text annotations, labels, and research notes to specific coordinates
// =======================

class Annotation {
  constructor(data) {
    this.id = data.id || `ann_${Date.now()}`;
    this.lat = data.lat;
    this.lng = data.lng;
    this.title = data.title || 'Annotation';
    this.text = data.text || '';
    this.category = data.category || 'note'; // note, observation, hypothesis, conclusion
    this.color = data.color || '#FFD700';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.author = data.author || 'User';
    this.attachments = data.attachments || [];
    this.relatedPins = data.relatedPins || [];
    this.visible = data.visible !== undefined ? data.visible : true;
  }
  
  export() {
    return {
      id: this.id,
      lat: this.lat,
      lng: this.lng,
      title: this.title,
      text: this.text,
      category: this.category,
      color: this.color,
      timestamp: this.timestamp,
      author: this.author,
      attachments: this.attachments,
      relatedPins: this.relatedPins
    };
  }
}

class AnnotationSystem {
  constructor() {
    this.annotations = new Map();
    this.selectedAnnotation = null;
    this.annotationLayer = null;
  }
  
  // Create new annotation
  createAnnotation(lat, lng, title, text, category = 'note') {
    const annotation = new Annotation({ lat, lng, title, text, category });
    this.annotations.set(annotation.id, annotation);
    
    console.log('📝 Annotation created:', annotation.title);
    this.save();
    this.updateGlobeLayer();
    
    return annotation;
  }
  
  // Get annotation by ID
  getAnnotation(id) {
    return this.annotations.get(id);
  }
  
  // Get all annotations
  getAllAnnotations() {
    return Array.from(this.annotations.values());
  }
  
  // Update annotation
  updateAnnotation(id, updates) {
    const annotation = this.annotations.get(id);
    if (!annotation) return false;
    
    Object.assign(annotation, updates);
    this.save();
    this.updateGlobeLayer();
    
    return true;
  }
  
  // Delete annotation
  deleteAnnotation(id) {
    const deleted = this.annotations.delete(id);
    if (deleted) {
      this.save();
      this.updateGlobeLayer();
    }
    return deleted;
  }
  
  // Find annotations near location
  findNearby(lat, lng, radius = 100) {
    const nearby = [];
    
    this.annotations.forEach(annotation => {
      const distance = this.calculateDistance(lat, lng, annotation.lat, annotation.lng);
      if (distance < radius) {
        nearby.push({ annotation, distance });
      }
    });
    
    return nearby.sort((a, b) => a.distance - b.distance);
  }
  
  // Calculate distance
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Filter by category
  filterByCategory(category) {
    return this.getAllAnnotations().filter(a => a.category === category);
  }
  
  // Search annotations
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllAnnotations().filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.text.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Update globe visualization layer
  updateGlobeLayer() {
    if (!window.globeInstance) return;
    
    const visibleAnnotations = this.getAllAnnotations().filter(a => a.visible);
    
    const annotationData = visibleAnnotations.map(a => ({
      lat: a.lat,
      lng: a.lng,
      label: a.title,
      color: a.color,
      size: 20,
      category: a.category,
      id: a.id
    }));
    
    // Use globe.gl labels layer
    window.globeInstance
      .labelsData(annotationData)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.label)
      .labelSize(d => 1)
      .labelDotRadius(d => 0.5)
      .labelColor(d => d.color)
      .labelResolution(2)
      .onLabelClick(label => {
        this.showAnnotationModal(label.id);
      });
  }
  
  // Show annotation modal
  showAnnotationModal(annotationId) {
    const annotation = this.getAnnotation(annotationId);
    if (!annotation) return;
    
    // Create or update modal
    let modal = document.getElementById('annotation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'annotation-modal';
      modal.className = 'glass-modal';
      document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 ${annotation.title}</h3>
          <button class="close-btn" onclick="document.getElementById('annotation-modal').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body">
          <div class="annotation-meta">
            <span class="category-badge ${annotation.category}">${annotation.category}</span>
            <span class="timestamp">${new Date(annotation.timestamp).toLocaleString()}</span>
          </div>
          <div class="annotation-text">${annotation.text}</div>
          <div class="annotation-coords">
            📍 ${annotation.lat.toFixed(4)}°, ${annotation.lng.toFixed(4)}°
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="window.AnnotationSystem.editAnnotation('${annotationId}')">Edit</button>
          <button onclick="window.AnnotationSystem.deleteAnnotation('${annotationId}')" class="btn-danger">Delete</button>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  }
  
  // Edit annotation (open edit form)
  editAnnotation(annotationId) {
    const annotation = this.getAnnotation(annotationId);
    if (!annotation) return;
    
    // Implementation would show an edit form
    console.log('Edit annotation:', annotationId);
  }
  
  // Export all annotations
  exportAnnotations(format = 'json') {
    const annotations = this.getAllAnnotations().map(a => a.export());
    
    switch (format) {
      case 'json':
        return JSON.stringify(annotations, null, 2);
      
      case 'csv':
        return this.exportAsCSV(annotations);
      
      case 'geojson':
        return this.exportAsGeoJSON(annotations);
      
      default:
        return JSON.stringify(annotations);
    }
  }
  
  // Export as CSV
  exportAsCSV(annotations) {
    const headers = ['ID', 'Title', 'Latitude', 'Longitude', 'Category', 'Text', 'Timestamp'];
    const rows = annotations.map(a => [
      a.id,
      a.title,
      a.lat,
      a.lng,
      a.category,
      a.text.replace(/"/g, '""'), // Escape quotes
      a.timestamp
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }
  
  // Export as GeoJSON
  exportAsGeoJSON(annotations) {
    const features = annotations.map(a => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [a.lng, a.lat]
      },
      properties: {
        id: a.id,
        title: a.title,
        text: a.text,
        category: a.category,
        timestamp: a.timestamp,
        author: a.author
      }
    }));
    
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };
    
    return JSON.stringify(geojson, null, 2);
  }
  
  // Import annotations
  importAnnotations(data, format = 'json') {
    try {
      let annotations = [];
      
      switch (format) {
        case 'json':
          annotations = JSON.parse(data);
          break;
        
        case 'geojson':
          const geojson = JSON.parse(data);
          annotations = geojson.features.map(f => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            ...f.properties
          }));
          break;
        
        default:
          throw new Error('Unsupported format');
      }
      
      annotations.forEach(data => {
        const annotation = new Annotation(data);
        this.annotations.set(annotation.id, annotation);
      });
      
      this.save();
      this.updateGlobeLayer();
      
      console.log(`✅ Imported ${annotations.length} annotations`);
      return true;
    } catch (e) {
      console.error('Failed to import annotations:', e);
      return false;
    }
  }
  
  // Save to state
  save() {
    const annotationsArray = this.getAllAnnotations().map(a => a.export());
    window.globeState?.set('annotations', annotationsArray);
  }
  
  // Load from state
  load() {
    const annotationsData = window.globeState?.get('annotations') || [];
    annotationsData.forEach(data => {
      const annotation = new Annotation(data);
      this.annotations.set(annotation.id, annotation);
    });
    
    console.log(`📝 Loaded ${this.annotations.size} annotations`);
  }
}

// Create global instance
window.AnnotationSystem = new AnnotationSystem();
console.log('📝 Annotation System initialized');