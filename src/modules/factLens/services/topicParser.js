// =======================
// TOPIC PARSER
// Structures and analyzes topic content
// =======================

class TopicParser {
  constructor() {
    this.difficulty = 'student';
  }

  /**
   * Set difficulty level
   */
  setDifficulty(level) {
    this.difficulty = level;
  }

  /**
   * Parse article into structured sections
   */
  parseArticle(article) {
    const parsed = {
      title: article.title,
      definition: this.extractDefinition(article.extract),
      concepts: this.extractKeyConcepts(article.extract),
      timeline: this.extractTimeline(article.extract),
      visualData: this.generateVisualData(article),
      summary: this.generateSummary(article.extract),
      metadata: {
        source: 'Wikipedia',
        url: article.url,
        lastUpdated: article.timestamp,
        coordinates: article.coordinates
      }
    };

    return parsed;
  }

  /**
   * Extract definition from article
   */
  extractDefinition(text) {
    if (!text) return 'Definition not available.';

    // Get first paragraph(s) as definition
    const sentences = text.split(/[.!?]+/);
    const definitionLength = this.difficulty === 'simple' ? 2 : this.difficulty === 'student' ? 3 : 5;
    
    const definition = sentences.slice(0, definitionLength)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim() + '.')
      .join(' ');

    return this.simplifyText(definition);
  }

  /**
   * Extract key concepts
   */
  extractKeyConcepts(text) {
    if (!text) return [];

    const concepts = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

    // Look for patterns that indicate key concepts
    const patterns = [
      /is (?:a|an|the) ([^,\.]+)/gi,
      /refers to ([^,\.]+)/gi,
      /known (?:as|for) ([^,\.]+)/gi,
      /characterized by ([^,\.]+)/gi,
      /includes? ([^,\.]+)/gi
    ];

    sentences.forEach(sentence => {
      patterns.forEach(pattern => {
        const matches = [...sentence.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > 5 && match[1].length < 100) {
            concepts.push(match[1].trim());
          }
        });
      });
    });

    // Remove duplicates and limit
    const unique = [...new Set(concepts)];
    const limit = this.difficulty === 'simple' ? 3 : this.difficulty === 'student' ? 5 : 8;
    
    return unique.slice(0, limit);
  }

  /**
   * Extract timeline events
   */
  extractTimeline(text) {
    if (!text) return [];

    const timeline = [];
    
    // Look for year patterns
    const yearPattern = /(\d{4}|\d{1,2}th century)[:\s-]([^.!?]+)/gi;
    const matches = [...text.matchAll(yearPattern)];

    matches.forEach(match => {
      if (match[1] && match[2]) {
        timeline.push({
          date: match[1].trim(),
          event: match[2].trim()
        });
      }
    });

    // Limit based on difficulty
    const limit = this.difficulty === 'simple' ? 3 : this.difficulty === 'student' ? 5 : 10;
    return timeline.slice(0, limit);
  }

  /**
   * Generate visual data for diagrams
   */
  generateVisualData(article) {
    const visual = {
      type: 'none',
      data: null
    };

    // Detect if topic is suitable for flow diagram, comparison, etc.
    const text = article.extract?.toLowerCase() || '';

    if (text.includes('process') || text.includes('cycle') || text.includes('steps')) {
      visual.type = 'flow';
      visual.data = this.extractProcessSteps(article.extract);
    } else if (text.includes('compare') || text.includes('versus') || text.includes('difference')) {
      visual.type = 'comparison';
      visual.data = this.extractComparison(article.extract);
    } else if (this.extractTimeline(article.extract).length > 2) {
      visual.type = 'timeline';
      visual.data = this.extractTimeline(article.extract);
    }

    return visual;
  }

  /**
   * Extract process steps for flow diagram
   */
  extractProcessSteps(text) {
    const steps = [];
    
    // Look for numbered steps or sequential indicators
    const patterns = [
      /(?:first|initially|step 1)[:\s]([^.!?]+)/gi,
      /(?:second|then|next|step 2)[:\s]([^.!?]+)/gi,
      /(?:third|after|subsequently|step 3)[:\s]([^.!?]+)/gi,
      /(?:finally|lastly|last)[:\s]([^.!?]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          steps.push(match[1].trim());
        }
      });
    });

    return steps.slice(0, 5);
  }

  /**
   * Extract comparison data
   */
  extractComparison(text) {
    // Simplified comparison extraction
    return {
      items: [],
      note: 'Comparison data requires detailed analysis'
    };
  }

  /**
   * Generate summary based on difficulty
   */
  generateSummary(text) {
    if (!text) return '';

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summaryLength = this.difficulty === 'simple' ? 2 : this.difficulty === 'student' ? 3 : 5;

    return sentences.slice(0, summaryLength)
      .map(s => this.simplifyText(s.trim()))
      .filter(s => s.length > 0)
      .join('. ') + '.';
  }

  /**
   * Simplify text based on difficulty level
   */
  simplifyText(text) {
    if (this.difficulty !== 'simple') return text;

    // Simple text simplification
    const replacements = {
      'approximately': 'about',
      'utilize': 'use',
      'numerous': 'many',
      'endeavor': 'try',
      'commence': 'start',
      'terminate': 'end',
      'demonstrate': 'show',
      'facilitate': 'help'
    };

    let simplified = text;
    Object.entries(replacements).forEach(([complex, simple]) => {
      simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
    });

    return simplified;
  }

  /**
   * Detect topic category
   */
  detectCategory(text) {
    const categories = {
      science: ['science', 'biology', 'chemistry', 'physics', 'cell', 'molecule', 'atom', 'energy'],
      history: ['history', 'war', 'empire', 'century', 'ancient', 'medieval', 'revolution'],
      geography: ['geography', 'country', 'continent', 'ocean', 'mountain', 'river', 'climate'],
      technology: ['technology', 'computer', 'software', 'internet', 'digital', 'algorithm']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }
}

// Expose globally
window.TopicParser = TopicParser;
