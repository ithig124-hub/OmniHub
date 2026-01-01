/**
 * OmniHub Study Vault Module
 * Central knowledge dashboard for students
 */

console.log('📘 Study Vault Module Loading...');

// ============================================
// STATE MANAGEMENT
// ============================================
const StudyVaultState = {
  knowledgeCards: [],
  excerpts: [],
  currentFilter: 'all',
  focusSession: {
    subject: 'Physics: Quantum Mechanics',
    progress: 45,
    totalTime: 90,
    elapsedTime: 45
  },
  stats: {
    focusTime: '4h 15m',
    cardsReviewed: 8,
    topicsStudied: 3
  }
};

// ============================================
// SAMPLE DATA
// ============================================
const SAMPLE_CARDS = [
  {
    id: 'card_1',
    title: 'The Doppler Effect',
    subject: 'physics',
    content: 'The Doppler Effect describes the change in frequency of a wave in relation to an observer...',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400',
    badge: '✓ Physics',
    created: Date.now()
  },
  {
    id: 'card_2',
    title: 'French Revolution',
    subject: 'history',
    content: 'The French Revolution was a period of radical political and societal change in France...',
    image: 'https://images.unsplash.com/photo-1513807016779-d51c0c026263?w=400',
    badge: '✗ History',
    created: Date.now()
  },
  {
    id: 'card_3',
    title: 'DNA Structure',
    subject: 'biology',
    content: 'DNA is a molecule composed of two polynucleotide chains that coil around each other...',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    badge: '📘 Biology',
    created: Date.now()
  },
  {
    id: 'card_4',
    title: 'Pythagorean Theorem',
    subject: 'math',
    content: 'In mathematics, the Pythagorean theorem states that in a right triangle...',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    badge: '✓ Math',
    created: Date.now()
  }
];

const SAMPLE_EXCERPTS = [
  {
    id: 'excerpt_1',
    title: '📝 Thermodynamics Laws',
    source: 'Notes',
    text: '"Energy cannot be created or destroyed..."',
    date: '2 days ago'
  },
  {
    id: 'excerpt_2',
    title: '📜 Napoleon\'s Rise to Power',
    source: 'History',
    text: '"Napoleon crowned himself Emperor in 1804..."',
    date: '5 hours ago'
  }
];

// ============================================
// INITIALIZATION
// ============================================
function init() {
  console.log('🎨 Initializing Study Vault...');
  
  try {
    // Load data from localStorage or use sample data
    loadKnowledgeCards();
    loadExcerpts();
    loadStats();
    
    // Render content
    renderKnowledgeCards();
    renderExcerpts();
    renderStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set active filter
    setActiveFilter('all');
    
    console.log('✅ Study Vault initialized successfully!');
  } catch (error) {
    console.error('❌ Study Vault initialization failed:', error);
  }
}

// ============================================
// DATA LOADING
// ============================================
function loadKnowledgeCards() {
  try {
    const stored = localStorage.getItem('omnihub_study_vault_cards');
    if (stored) {
      StudyVaultState.knowledgeCards = JSON.parse(stored);
    } else {
      StudyVaultState.knowledgeCards = SAMPLE_CARDS;
      saveKnowledgeCards();
    }
  } catch (e) {
    console.error('Failed to load knowledge cards:', e);
    StudyVaultState.knowledgeCards = SAMPLE_CARDS;
  }
}

function saveKnowledgeCards() {
  try {
    localStorage.setItem('omnihub_study_vault_cards', JSON.stringify(StudyVaultState.knowledgeCards));
  } catch (e) {
    console.error('Failed to save knowledge cards:', e);
  }
}

function loadExcerpts() {
  try {
    const stored = localStorage.getItem('omnihub_study_vault_excerpts');
    if (stored) {
      StudyVaultState.excerpts = JSON.parse(stored);
    } else {
      StudyVaultState.excerpts = SAMPLE_EXCERPTS;
    }
  } catch (e) {
    StudyVaultState.excerpts = SAMPLE_EXCERPTS;
  }
}

function loadStats() {
  try {
    const stored = localStorage.getItem('omnihub_study_vault_stats');
    if (stored) {
      StudyVaultState.stats = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

// ============================================
// RENDERING
// ============================================
function renderKnowledgeCards() {
  const container = document.getElementById('knowledge-cards-grid');
  if (!container) return;
  
  const filteredCards = StudyVaultState.currentFilter === 'all' 
    ? StudyVaultState.knowledgeCards
    : StudyVaultState.knowledgeCards.filter(card => card.subject === StudyVaultState.currentFilter);
  
  if (filteredCards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
        <p>No knowledge cards found. Create your first card!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredCards.map(card => `
    <div class="knowledge-card" onclick="viewCard('${card.id}')" data-testid="knowledge-card-${card.id}">
      <div class="card-image" style="background-image: url('${card.image}');">
        <div class="card-badge">${card.badge}</div>
      </div>
      <div class="card-content">
        <h4 class="card-title">${escapeHtml(card.title)}</h4>
      </div>
    </div>
  `).join('');
}

function renderExcerpts() {
  const container = document.getElementById('excerpts-list');
  if (!container) return;
  
  if (StudyVaultState.excerpts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
        <p>No recent excerpts. Start importing content from OmniSearch!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = StudyVaultState.excerpts.map(excerpt => `
    <div class="excerpt-item" data-testid="excerpt-${excerpt.id}">
      <div class="excerpt-header">
        <div class="excerpt-title">${excerpt.title}</div>
        <div class="excerpt-date">${excerpt.date}</div>
      </div>
      <div class="excerpt-text">${escapeHtml(excerpt.text)}</div>
    </div>
  `).join('');
}

function renderStats() {
  const focusTimeStat = document.getElementById('focus-time-stat');
  const cardsReviewedStat = document.getElementById('cards-reviewed-stat');
  const topicsStudiedStat = document.getElementById('topics-studied-stat');
  
  if (focusTimeStat) focusTimeStat.textContent = StudyVaultState.stats.focusTime;
  if (cardsReviewedStat) cardsReviewedStat.textContent = StudyVaultState.stats.cardsReviewed;
  if (topicsStudiedStat) topicsStudiedStat.textContent = StudyVaultState.stats.topicsStudied;
}

// ============================================
// EVENT HANDLERS
// ============================================
function setupEventListeners() {
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-tabs-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setActiveFilter(filter);
    });
  });
  
  // New Card button
  const newCardBtn = document.getElementById('new-card-btn');
  if (newCardBtn) {
    newCardBtn.addEventListener('click', openNewCardModal);
  }
  
  // Quick access buttons
  setupQuickAccessButtons();
  
  // View cards button
  const viewCardsBtn = document.getElementById('view-cards-btn');
  if (viewCardsBtn) {
    viewCardsBtn.addEventListener('click', () => {
      alert('View all cards feature coming soon!');
    });
  }
  
  // Resume study button
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      navigateToModule('notes');
    });
  }
}

function setupQuickAccessButtons() {
  const buttons = [
    { id: 'recent-notes', module: 'notes' },
    { id: 'saved-searches', module: 'search' },
    { id: 'flashcards', action: 'showFlashcards' },
    { id: 'review-quiz', action: 'startQuiz' }
  ];
  
  buttons.forEach(config => {
    const btn = document.getElementById(config.id);
    if (btn) {
      btn.addEventListener('click', () => {
        if (config.module) {
          navigateToModule(config.module);
        } else if (config.action === 'showFlashcards') {
          alert('Flashcards feature coming soon!');
        } else if (config.action === 'startQuiz') {
          alert('Review Quiz feature coming soon!');
        }
      });
    }
  });
}

function setActiveFilter(filter) {
  StudyVaultState.currentFilter = filter;
  
  // Update UI
  const filterButtons = document.querySelectorAll('.filter-tabs-btn');
  filterButtons.forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Re-render cards
  renderKnowledgeCards();
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openNewCardModal() {
  const modal = document.getElementById('new-card-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeNewCardModal() {
  const modal = document.getElementById('new-card-modal');
  if (modal) {
    modal.classList.add('hidden');
    // Clear form
    document.getElementById('card-title').value = '';
    document.getElementById('card-content').value = '';
  }
}

function saveNewCard() {
  const title = document.getElementById('card-title').value.trim();
  const subject = document.getElementById('card-subject').value;
  const content = document.getElementById('card-content').value.trim();
  
  if (!title || !content) {
    alert('Please fill in title and content');
    return;
  }
  
  // Create new card
  const newCard = {
    id: `card_${Date.now()}`,
    title: title,
    subject: subject,
    content: content,
    image: getRandomImage(subject),
    badge: getSubjectBadge(subject),
    created: Date.now()
  };
  
  // Add to state
  StudyVaultState.knowledgeCards.unshift(newCard);
  
  // Save to localStorage
  saveKnowledgeCards();
  
  // Re-render
  renderKnowledgeCards();
  
  // Update stats
  StudyVaultState.stats.cardsReviewed++;
  renderStats();
  
  // Close modal
  closeNewCardModal();
  
  // Show success message
  showSuccessMessage('Knowledge card created successfully!');
}

function viewCard(cardId) {
  const card = StudyVaultState.knowledgeCards.find(c => c.id === cardId);
  if (card) {
    alert(`Viewing: ${card.title}\n\n${card.content}\n\n(Full card viewer coming soon!)`);
  }
}

// ============================================
// NAVIGATION
// ============================================
function navigateToModule(moduleId) {
  console.log(`🚀 Navigating to: ${moduleId}`);
  
  try {
    // Method 1: Try parent OmniHub API
    if (window.parent && window.parent.OmniHub) {
      window.parent.OmniHub.navigateToModule(moduleId);
      console.log('✅ Navigation via parent.OmniHub');
      return;
    }
    
    // Method 2: Try parent showModule
    if (window.parent && window.parent.showModule) {
      window.parent.showModule(moduleId);
      console.log('✅ Navigation via parent.showModule()');
      return;
    }
    
    // Fallback: Show message
    console.warn('⚠️ Navigation not available');
    showSuccessMessage(`Opening ${moduleId} module...`);
  } catch (e) {
    console.error('Navigation error:', e);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getRandomImage(subject) {
  const images = {
    physics: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400',
    math: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    biology: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    history: 'https://images.unsplash.com/photo-1513807016779-d51c0c026263?w=400',
    other: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'
  };
  return images[subject] || images.other;
}

function getSubjectBadge(subject) {
  const badges = {
    physics: '✓ Physics',
    math: '✓ Math',
    biology: '📘 Biology',
    history: '✗ History',
    other: '📚 General'
  };
  return badges[subject] || badges.other;
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95));
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
    z-index: 10000;
    animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  toast.textContent = '✓ ' + message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 400);
  }, 3000);
}

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================
window.openNewCardModal = openNewCardModal;
window.closeNewCardModal = closeNewCardModal;
window.saveNewCard = saveNewCard;
window.viewCard = viewCard;

// ============================================
// MODULE LIFECYCLE
// ============================================
window.studyVaultModule = {
  onActivate: () => {
    console.log('📘 Study Vault activated');
    renderKnowledgeCards();
    renderExcerpts();
    renderStats();
  },
  
  onDeactivate: () => {
    console.log('📘 Study Vault deactivated');
  },
  
  refresh: () => {
    loadKnowledgeCards();
    loadExcerpts();
    loadStats();
    renderKnowledgeCards();
    renderExcerpts();
    renderStats();
  },
  
  // API for other modules to add content
  addExcerpt: (title, text, source) => {
    const newExcerpt = {
      id: `excerpt_${Date.now()}`,
      title: title,
      source: source || 'OmniSearch',
      text: text,
      date: 'Just now'
    };
    StudyVaultState.excerpts.unshift(newExcerpt);
    localStorage.setItem('omnihub_study_vault_excerpts', JSON.stringify(StudyVaultState.excerpts));
    renderExcerpts();
  },
  
  addKnowledgeCard: (title, subject, content) => {
    const newCard = {
      id: `card_${Date.now()}`,
      title: title,
      subject: subject,
      content: content,
      image: getRandomImage(subject),
      badge: getSubjectBadge(subject),
      created: Date.now()
    };
    StudyVaultState.knowledgeCards.unshift(newCard);
    saveKnowledgeCards();
    renderKnowledgeCards();
  }
};

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('✅ Study Vault Module Ready!');
