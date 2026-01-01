// =======================
// SOURCE RESOLVER
// Wikipedia API Integration
// =======================

class SourceResolver {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Search Wikipedia for a topic
   */
  async searchTopic(query) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      // Format: [query, [titles], [descriptions], [urls]]
      const results = [];
      for (let i = 0; i < data[1].length; i++) {
        results.push({
          title: data[1][i],
          description: data[2][i],
          url: data[3][i]
        });
      }
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search Wikipedia');
    }
  }

  /**
   * Get full article content
   */
  async getArticle(title) {
    try {
      // Check cache
      const cacheKey = `article_${title}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📦 Using cached article:', title);
          return cached.data;
        }
      }

      // Fetch from Wikipedia
      const url = `${this.baseUrl}/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Article not found');
      
      const data = await response.json();
      
      const article = {
        title: data.title,
        extract: data.extract,
        extractHtml: data.extract_html,
        description: data.description,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page,
        timestamp: data.timestamp,
        coordinates: data.coordinates
      };

      // Cache it
      this.cache.set(cacheKey, {
        data: article,
        timestamp: Date.now()
      });

      return article;
    } catch (error) {
      console.error('Article fetch error:', error);
      throw new Error('Failed to fetch article');
    }
  }

  /**
   * Get article sections for detailed content
   */
  async getArticleSections(title) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=sections&format=json&origin=*`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch sections');
      
      const data = await response.json();
      return data.parse?.sections || [];
    } catch (error) {
      console.error('Sections fetch error:', error);
      return [];
    }
  }

  /**
   * Get specific section content
   */
  async getSectionContent(title, sectionIndex) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&section=${sectionIndex}&prop=text&format=json&origin=*`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch section');
      
      const data = await response.json();
      return data.parse?.text?.['*'] || '';
    } catch (error) {
      console.error('Section content error:', error);
      return '';
    }
  }

  /**
   * Get related topics/links
   */
  async getRelatedTopics(title, limit = 10) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=links&pllimit=${limit}&format=json&origin=*`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch related topics');
      
      const data = await response.json();
      const pages = data.query?.pages;
      
      if (!pages) return [];
      
      const pageId = Object.keys(pages)[0];
      const links = pages[pageId]?.links || [];
      
      return links.map(link => link.title).slice(0, limit);
    } catch (error) {
      console.error('Related topics error:', error);
      return [];
    }
  }

  /**
   * Verify source and get confidence level
   */
  getConfidenceLevel(article) {
    // Simple confidence scoring based on article completeness
    let score = 0;
    
    if (article.extract && article.extract.length > 100) score += 30;
    if (article.description) score += 20;
    if (article.thumbnail) score += 20;
    if (article.timestamp) score += 15;
    if (article.coordinates) score += 15;
    
    if (score >= 80) return { level: 'High', color: 'success', icon: '✓✓' };
    if (score >= 60) return { level: 'Medium', color: 'warning', icon: '✓' };
    return { level: 'Low', color: 'danger', icon: '⚠' };
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Clean HTML content
   */
  cleanHtml(html) {
    // Remove unwanted elements
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove scripts, styles, and references
    const unwanted = temp.querySelectorAll('script, style, .reference, .reflist');
    unwanted.forEach(el => el.remove());
    
    return temp.innerHTML;
  }

  /**
   * Extract plain text from HTML
   */
  extractText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = this.cleanHtml(html);
    return temp.textContent || temp.innerText || '';
  }
}

// Expose globally
window.SourceResolver = SourceResolver;
