// =======================
// FACTLENS - MAIN CONTROLLER
// Research & Insight Module
// =======================

console.log('🔬 FactLens Module Loading...');

// =======================
// INITIALIZE CORE SYSTEMS
// =======================
let sourceResolver;
let topicParser;
let summaryEngine;
let notesBridge;
let globeBridge;
let omniSearchBridge;

let currentTopic = null;
let currentArticle = null;
let visualModeActive = false;

// =======================
// DOM ELEMENTS
// =======================
let topicSearchInput, searchBtn, difficultyLevel, visualModeBtn;
let contentArea, emptyState, loadingState, researchResults;
let topicTitle, sourceInfo, confidenceLevel, lastUpdated;
let definitionContent, conceptsContent, timelineContent, visualContent, relatedContent;
let exportModal, exportPreview;

// =======================
// INITIALIZATION
// =======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Initializing FactLens...');
  
  try {
    // Initialize core systems
    sourceResolver = new SourceResolver();
    topicParser = new TopicParser();
    summaryEngine = new SummaryEngine();
    notesBridge = new NotesBridge();
    globeBridge = new GlobeBridge();
    omniSearchBridge = new OmniSearchBridge();
    
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ FactLens initialized successfully!');
  } catch (error) {
    console.error('❌ FactLens initialization failed:', error);
  }
});

/**
 * Cache DOM elements
 */
function cacheElements() {
  // Search elements
  topicSearchInput = document.getElementById('topic-search');
  searchBtn = document.getElementById('search-btn');
  difficultyLevel = document.getElementById('difficulty-level');
  visualModeBtn = document.getElementById('visual-mode-btn');
  
  // Content areas
  contentArea = document.getElementById('content-area');
  emptyState = document.getElementById('empty-state');
  loadingState = document.getElementById('loading-state');
  researchResults = document.getElementById('research-results');
  
  // Result elements
  topicTitle = document.getElementById('topic-title');
  sourceInfo = document.getElementById('source-info');
  confidenceLevel = document.getElementById('confidence-level');
  lastUpdated = document.getElementById('last-updated');
  
  // Content sections
  definitionContent = document.getElementById('definition-content');
  conceptsContent = document.getElementById('concepts-content');
  timelineContent = document.getElementById('timeline-content');
  visualContent = document.getElementById('visual-content');
  relatedContent = document.getElementById('related-content');
  
  // Modal
  exportModal = document.getElementById('export-modal');
  exportPreview = document.getElementById('export-preview');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search
  searchBtn.addEventListener('click', handleSearch);
  topicSearchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Quick topics
  document.querySelectorAll('.quick-topic').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.topic;
      topicSearchInput.value = topic;
      handleSearch();
    });
  });
  
  // Difficulty change
  difficultyLevel.addEventListener('change', (e) => {
    topicParser.setDifficulty(e.target.value);
    if (currentTopic) {
      // Re-render with new difficulty
      renderResearchResults(currentArticle);
    }
  });
  
  // Visual mode toggle
  visualModeBtn.addEventListener('click', toggleVisualMode);
  
  // Export and save buttons
  document.getElementById('export-btn').addEventListener('click', openExportModal);
  document.getElementById('save-all-btn').addEventListener('click', saveAllToNotes);
  
  // Section save buttons
  document.querySelectorAll('.save-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.target.dataset.section;
      saveSectionToNotes(section);
    });
  });
  
  // Modal controls
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.dataset.modal;
      closeModal(modalId);
    });
  });
  
  // Export format buttons
  document.querySelectorAll('.export-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const format = e.target.dataset.format;
      generateExport(format);
    });
  });
  
  // Copy export
  document.getElementById('copy-export').addEventListener('click', copyExport);
  
  // Close modal on outside click
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) closeModal('export-modal');
  });
}

/**
 * Handle search
 */
async function handleSearch() {
  const query = topicSearchInput.value.trim();
  
  if (!query) {
    showNotification('Please enter a topic to search', 'warning');
    return;
  }
  
  console.log('🔍 Searching for topic:', query);
  
  // Show loading state
  showLoading();
  
  try {
    // Search Wikipedia
    const searchResults = await sourceResolver.searchTopic(query);
    
    if (searchResults.length === 0) {
      throw new Error('No results found');
    }
    
    // Get first result's article
    const topResult = searchResults[0];
    const article = await sourceResolver.getArticle(topResult.title);
    
    // Store current data
    currentTopic = topResult.title;
    currentArticle = article;
    
    // Get related topics
    const relatedTopics = await sourceResolver.getRelatedTopics(topResult.title);
    article.relatedTopics = relatedTopics;
    
    // Render results
    renderResearchResults(article);
    
    // Index for search
    const parsedData = topicParser.parseArticle(article);
    await omniSearchBridge.indexTopic({
      title: parsedData.title,
      definition: parsedData.definition,
      concepts: parsedData.concepts,
      url: article.url
    });
    
    showNotification(`Loaded: ${article.title}`);
  } catch (error) {
    console.error('Search error:', error);
    showError('Failed to load topic. Please try another search term.');
  }
}

/**
 * Render research results
 */
function renderResearchResults(article) {
  // Parse article
  const parsed = topicParser.parseArticle(article);
  
  // Store in summary engine
  summaryEngine.setData(parsed);
  
  // Update title
  topicTitle.textContent = parsed.title;
  
  // Update source info
  const confidence = sourceResolver.getConfidenceLevel(article);
  confidenceLevel.textContent = `${confidence.icon} ${confidence.level} Confidence`;
  confidenceLevel.className = `confidence-badge confidence-${confidence.color}`;
  
  if (article.timestamp) {
    lastUpdated.textContent = `📅 Updated: ${sourceResolver.formatTimestamp(article.timestamp)}`;
  }
  
  // Render definition
  definitionContent.innerHTML = `<p>${parsed.definition}</p>`;
  
  // Render key concepts
  if (parsed.concepts && parsed.concepts.length > 0) {
    conceptsContent.innerHTML = `
      <ul>
        ${parsed.concepts.map(concept => `<li>${concept}</li>`).join('')}
      </ul>
    `;
  } else {
    conceptsContent.innerHTML = `<p>No key concepts identified.</p>`;
  }
  
  // Render timeline if available
  const timelineSection = document.getElementById('timeline-section');
  if (parsed.timeline && parsed.timeline.length > 0) {
    timelineSection.style.display = 'block';
    timelineContent.innerHTML = parsed.timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-event">${item.event}</div>
      </div>
    `).join('');
  } else {
    timelineSection.style.display = 'none';
  }
  
  // Render visual explanation if available
  const visualSection = document.getElementById('visual-section');
  if (visualModeActive && parsed.visualData && parsed.visualData.type !== 'none') {
    visualSection.style.display = 'block';
    renderVisualExplanation(parsed.visualData);
  } else {
    visualSection.style.display = 'none';
  }
  
  // Render related topics
  if (article.relatedTopics && article.relatedTopics.length > 0) {
    relatedContent.innerHTML = `
      <div class="related-topics">
        ${article.relatedTopics.map(topic => `
          <button class="related-topic" data-topic="${topic}">
            🔗 ${topic}
          </button>
        `).join('')}
      </div>
    `;
    
    // Add click handlers for related topics
    relatedContent.querySelectorAll('.related-topic').forEach(btn => {
      btn.addEventListener('click', () => {
        topicSearchInput.value = btn.dataset.topic;
        handleSearch();
      });
    });
  } else {
    relatedContent.innerHTML = `<p>No related topics available.</p>`;
  }
  
  // Show results
  showResults();
}

/**
 * Render visual explanation
 */
function renderVisualExplanation(visualData) {
  if (visualData.type === 'flow' && visualData.data && visualData.data.length > 0) {
    visualContent.innerHTML = `
      <div class="diagram-container">
        <div class="diagram-title">Process Flow</div>
        <div class="flow-diagram">
          ${visualData.data.map((step, i) => `
            <div class="flow-step">${step}</div>
            ${i < visualData.data.length - 1 ? '<div class="flow-arrow">→</div>' : ''}
          `).join('')}
        </div>
      </div>
    `;
  } else if (visualData.type === 'timeline' && visualData.data && visualData.data.length > 0) {
    visualContent.innerHTML = `
      <div class="diagram-container">
        <div class="diagram-title">Timeline View</div>
        ${visualData.data.map(item => `
          <div class="timeline-item">
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-event">${item.event}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    visualContent.innerHTML = `<p>Visual explanation not available for this topic.</p>`;
  }
}

/**
 * Toggle visual mode
 */
function toggleVisualMode() {
  visualModeActive = !visualModeActive;
  
  if (visualModeActive) {
    visualModeBtn.classList.add('active');
    visualModeBtn.textContent = '📊 Visual Mode ON';
  } else {
    visualModeBtn.classList.remove('active');
    visualModeBtn.textContent = '📊 Visual Mode';
  }
  
  // Re-render if we have data
  if (currentArticle) {
    renderResearchResults(currentArticle);
  }
}

/**
 * Save section to notes
 */
async function saveSectionToNotes(sectionName) {
  if (!currentArticle) return;
  
  let content = '';
  
  switch (sectionName) {
    case 'definition':
      content = definitionContent.textContent;
      break;
    case 'concepts':
      content = conceptsContent.textContent;
      break;
    case 'timeline':
      content = timelineContent.textContent;
      break;
    case 'visual':
      content = visualContent.textContent;
      break;
  }
  
  const noteData = summaryEngine.prepareForNotes(sectionName, content);
  const result = await notesBridge.saveToNotes(noteData);
  
  if (result.success) {
    showNotification(`${sectionName} saved to Notes!`);
  }
}

/**
 * Save all sections to notes
 */
async function saveAllToNotes() {
  if (!currentArticle) return;
  
  const sections = [
    { name: 'Definition', content: definitionContent.textContent },
    { name: 'Key Concepts', content: conceptsContent.textContent }
  ];
  
  // Add timeline if visible
  if (document.getElementById('timeline-section').style.display !== 'none') {
    sections.push({ name: 'Timeline', content: timelineContent.textContent });
  }
  
  const notesData = sections.map(section => 
    summaryEngine.prepareForNotes(section.name, section.content)
  );
  
  const results = await notesBridge.saveAllSections(notesData);
  const successCount = results.filter(r => r.success).length;
  
  showNotification(`Saved ${successCount}/${sections.length} sections to Notes!`);
}

/**
 * Open export modal
 */
function openExportModal() {
  if (!currentArticle) return;
  
  exportModal.classList.remove('hidden');
  exportPreview.value = summaryEngine.exportAsNotes();
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

/**
 * Generate export in specified format
 */
function generateExport(format) {
  let exportText = '';
  
  switch (format) {
    case 'notes':
      exportText = summaryEngine.exportAsNotes();
      break;
    case 'cards':
      exportText = summaryEngine.exportAsCards();
      break;
    case 'bullets':
      exportText = summaryEngine.exportAsBullets();
      break;
  }
  
  exportPreview.value = exportText;
}

/**
 * Copy export to clipboard
 */
function copyExport() {
  exportPreview.select();
  document.execCommand('copy');
  showNotification('Copied to clipboard!');
}

/**
 * Show loading state
 */
function showLoading() {
  emptyState.classList.add('hidden');
  researchResults.classList.add('hidden');
  loadingState.classList.remove('hidden');
}

/**
 * Show results
 */
function showResults() {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  researchResults.classList.remove('hidden');
}

/**
 * Show error
 */
function showError(message) {
  loadingState.classList.add('hidden');
  emptyState.classList.remove('hidden');
  showNotification(message, 'error');
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  
  // Try to use parent OmniHub notification if available
  if (window.parent && window.parent.OmniHub && window.parent.OmniHub.notify) {
    window.parent.OmniHub.notify(message, type);
  }
}

// =======================
// EXPOSE GLOBAL API
// =======================
window.FactLens = {
  search: handleSearch,
  getCurrentTopic: () => currentTopic,
  getCurrentArticle: () => currentArticle,
  saveToNotes: saveSectionToNotes,
  exportData: () => summaryEngine.exportAsNotes()
};

// Module lifecycle hooks for OmniHub navigation
window.factLensModule = {
  onActivate: () => {
    console.log('📍 FactLens activated');
  },
  onDeactivate: () => {
    console.log('📤 FactLens deactivated');
  },
  getState: () => ({
    currentTopic,
    currentArticle,
    visualModeActive
  }),
  restoreState: (state) => {
    if (state.currentTopic) currentTopic = state.currentTopic;
    if (state.currentArticle) {
      currentArticle = state.currentArticle;
      renderResearchResults(currentArticle);
    }
    if (state.visualModeActive) {
      visualModeActive = state.visualModeActive;
      visualModeBtn.classList.toggle('active', visualModeActive);
    }
  }
};

console.log('✅ FactLens ready!');
