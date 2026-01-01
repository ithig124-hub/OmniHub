// =======================
// SUMMARY ENGINE
// Creates summaries and exports
// =======================

class SummaryEngine {
  constructor() {
    this.currentData = null;
  }

  /**
   * Store current research data
   */
  setData(data) {
    this.currentData = data;
  }

  /**
   * Export as study notes format
   */
  exportAsNotes() {
    if (!this.currentData) return '';

    const { title, definition, concepts, timeline } = this.currentData;
    
    let notes = `# ${title}\n\n`;
    notes += `## Definition\n${definition}\n\n`;
    
    if (concepts && concepts.length > 0) {
      notes += `## Key Concepts\n`;
      concepts.forEach(concept => {
        notes += `- ${concept}\n`;
      });
      notes += '\n';
    }
    
    if (timeline && timeline.length > 0) {
      notes += `## Timeline\n`;
      timeline.forEach(item => {
        notes += `**${item.date}**: ${item.event}\n`;
      });
      notes += '\n';
    }
    
    notes += `\n---\nSource: Wikipedia\nGenerated: ${new Date().toLocaleDateString()}`;
    
    return notes;
  }

  /**
   * Export as summary cards format
   */
  exportAsCards() {
    if (!this.currentData) return '';

    const { title, definition, concepts } = this.currentData;
    
    let cards = `╔═══════════════════════════════════════╗\n`;
    cards += `║  ${title.padEnd(35)}  ║\n`;
    cards += `╚═══════════════════════════════════════╝\n\n`;
    
    cards += `DEFINITION CARD:\n`;
    cards += `${this.wrapText(definition, 40)}\n\n`;
    
    if (concepts && concepts.length > 0) {
      cards += `KEY CONCEPTS CARD:\n`;
      concepts.forEach((concept, i) => {
        cards += `${i + 1}. ${concept}\n`;
      });
    }
    
    return cards;
  }

  /**
   * Export as bullet points format
   */
  exportAsBullets() {
    if (!this.currentData) return '';

    const { title, definition, concepts, timeline } = this.currentData;
    
    let bullets = `${title.toUpperCase()}\n${'='.repeat(title.length)}\n\n`;
    
    bullets += `QUICK FACTS:\n`;
    bullets += `• ${definition.split('.')[0]}\n\n`;
    
    if (concepts && concepts.length > 0) {
      bullets += `KEY POINTS:\n`;
      concepts.forEach(concept => {
        bullets += `• ${concept}\n`;
      });
      bullets += '\n';
    }
    
    if (timeline && timeline.length > 0) {
      bullets += `IMPORTANT DATES:\n`;
      timeline.slice(0, 5).forEach(item => {
        bullets += `• ${item.date} - ${item.event}\n`;
      });
    }
    
    return bullets;
  }

  /**
   * Create section summary
   */
  createSectionSummary(sectionName, content) {
    return {
      section: sectionName,
      content: content,
      timestamp: new Date().toISOString(),
      wordCount: content.split(/\s+/).length
    };
  }

  /**
   * Prepare data for Notes module
   */
  prepareForNotes(sectionName, content) {
    return {
      title: `${this.currentData?.title || 'Research'} - ${sectionName}`,
      content: content,
      tags: ['factlens', 'research', sectionName.toLowerCase()],
      source: 'FactLens Module',
      timestamp: new Date().toISOString(),
      metadata: {
        originalTopic: this.currentData?.title,
        section: sectionName,
        sourceUrl: this.currentData?.metadata?.url
      }
    };
  }

  /**
   * Prepare location data for Globe module
   */
  prepareForGlobe(coordinates, title) {
    if (!coordinates) return null;

    return {
      lat: coordinates.lat,
      lon: coordinates.lon,
      title: title,
      description: this.currentData?.definition || '',
      source: 'FactLens Research',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wrap text to specific width
   */
  wrapText(text, width) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }

  /**
   * Generate citation
   */
  generateCitation() {
    if (!this.currentData) return '';

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Wikipedia contributors. "${this.currentData.title}." Wikipedia, The Free Encyclopedia. Retrieved ${date}, from ${this.currentData.metadata?.url || 'Wikipedia'}.`;
  }
}

// Expose globally
window.SummaryEngine = SummaryEngine;
