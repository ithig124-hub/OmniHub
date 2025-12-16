/**
 * OmniHub Notes Module
 * A powerful local-first research and workflow notes system
 * Inspired by Trilium, Joplin, and Zettlr
 */

// ===== Database Manager (IndexedDB) =====
class NotesDatabase {
    constructor() {
        this.dbName = 'OmniHubNotes';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Notes store
                if (!db.objectStoreNames.contains('notes')) {
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
                    notesStore.createIndex('parentId', 'parentId', { unique: false });
                    notesStore.createIndex('pinned', 'pinned', { unique: false });
                    notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    notesStore.createIndex('created', 'created', { unique: false });
                    notesStore.createIndex('modified', 'modified', { unique: false });
                }

                // Links store (for bidirectional linking)
                if (!db.objectStoreNames.contains('links')) {
                    const linksStore = db.createObjectStore('links', { keyPath: 'id', autoIncrement: true });
                    linksStore.createIndex('fromNoteId', 'fromNoteId', { unique: false });
                    linksStore.createIndex('toNoteId', 'toNoteId', { unique: false });
                }
            };
        });
    }

    async saveNote(note) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            const request = store.put(note);

            request.onsuccess = () => resolve(note);
            request.onerror = () => reject(request.error);
        });
    }

    async getNote(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllNotes() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteNote(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async saveLink(link) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['links'], 'readwrite');
            const store = transaction.objectStore('links');
            const request = store.add(link);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getBacklinks(noteId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['links'], 'readonly');
            const store = transaction.objectStore('links');
            const index = store.index('toNoteId');
            const request = index.getAll(noteId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// ===== Notes Manager =====
class NotesManager {
    constructor() {
        this.db = new NotesDatabase();
        this.currentNote = null;
        this.notes = [];
        this.autoSaveTimeout = null;
        this.initialized = false;
    }

    async init() {
        await this.db.init();
        await this.loadAllNotes();
        this.initialized = true;
    }

    async loadAllNotes() {
        this.notes = await this.db.getAllNotes();
        return this.notes;
    }

    async createNote(title = 'Untitled Note', parentId = null) {
        const note = {
            id: this.generateId(),
            title: title,
            content: '',
            parentId: parentId,
            tags: [],
            pinned: false,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            links: [] // Array of linked note IDs
        };

        await this.db.saveNote(note);
        this.notes.push(note);
        return note;
    }

    async createDailyNote(date = null) {
        const targetDate = date || new Date();
        const dateStr = this.formatDateForDaily(targetDate);
        const title = `Daily Note - ${dateStr}`;

        // Check if daily note for this date already exists
        const existing = this.notes.find(n => n.title === title);
        if (existing) {
            return existing;
        }

        // Create the daily note with template
        const note = {
            id: this.generateId(),
            title: title,
            content: this.getDailyNoteTemplate(dateStr),
            parentId: null,
            tags: ['daily'],
            pinned: false,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            links: []
        };

        await this.db.saveNote(note);
        this.notes.push(note);
        return note;
    }

    formatDateForDaily(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Format: YYYY-MM-DD (Day Name)
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];
        
        return `${year}-${month}-${day} (${dayName})`;
    }

    getDailyNoteTemplate(dateStr) {
        return `# Daily Note - ${dateStr}

## 🎯 Goals for Today
- 
- 
- 

## ✅ Tasks
- [ ] 
- [ ] 
- [ ] 

## 📝 Notes & Ideas
Write your thoughts, ideas, and observations here...


## 🔗 Quick Links
- 


## 💭 Reflection
What went well today?


What could be improved?


What am I grateful for?


---
*Created: ${new Date().toLocaleString()}*
`;
    }

    getDailyNotes() {
        return this.notes
            .filter(note => note.tags.includes('daily'))
            .sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    getTodaysDailyNote() {
        const today = this.formatDateForDaily(new Date());
        const title = `Daily Note - ${today}`;
        return this.notes.find(n => n.title === title);
    }

    async updateNote(id, updates) {
        const note = await this.db.getNote(id);
        if (!note) return null;

        const updatedNote = {
            ...note,
            ...updates,
            modified: new Date().toISOString()
        };

        await this.db.saveNote(updatedNote);
        
        // Update in local array
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notes[index] = updatedNote;
        }

        return updatedNote;
    }

    async deleteNote(id) {
        // Delete note and all its children recursively
        const deleteRecursive = async (noteId) => {
            const children = this.notes.filter(n => n.parentId === noteId);
            for (const child of children) {
                await deleteRecursive(child.id);
            }
            await this.db.deleteNote(noteId);
            this.notes = this.notes.filter(n => n.id !== noteId);
        };

        await deleteRecursive(id);
    }

    async togglePin(id) {
        const note = await this.db.getNote(id);
        if (!note) return null;

        return await this.updateNote(id, { pinned: !note.pinned });
    }

    async addTag(id, tag) {
        const note = await this.db.getNote(id);
        if (!note) return null;

        const tags = [...new Set([...note.tags, tag])];
        return await this.updateNote(id, { tags });
    }

    async removeTag(id, tag) {
        const note = await this.db.getNote(id);
        if (!note) return null;

        const tags = note.tags.filter(t => t !== tag);
        return await this.updateNote(id, { tags });
    }

    async createLink(fromNoteId, toNoteId) {
        const link = {
            fromNoteId,
            toNoteId,
            created: new Date().toISOString()
        };
        await this.db.saveLink(link);

        // Update note's links array
        const note = await this.db.getNote(fromNoteId);
        if (note && !note.links.includes(toNoteId)) {
            note.links.push(toNoteId);
            await this.db.saveNote(note);
        }
    }

    async getBacklinks(noteId) {
        return await this.db.getBacklinks(noteId);
    }

    getChildNotes(parentId) {
        return this.notes.filter(note => note.parentId === parentId);
    }

    getRootNotes() {
        return this.notes.filter(note => !note.parentId);
    }

    getPinnedNotes() {
        return this.notes.filter(note => note.pinned);
    }

    getAllTags() {
        const tagsMap = new Map();
        this.notes.forEach(note => {
            note.tags.forEach(tag => {
                tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
            });
        });
        return Array.from(tagsMap.entries()).map(([tag, count]) => ({ tag, count }));
    }

    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    generateId() {
        return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Parse [[wiki-style]] links in content
    parseInternalLinks(content) {
        const linkRegex = /\[\[([^\]]+)\]\]/g;
        const matches = [];
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
            matches.push(match[1]);
        }

        return matches;
    }
}

// ===== UI Controller =====
class NotesUI {
    constructor(notesManager) {
        this.manager = notesManager;
        this.elements = {};
        this.currentTab = 'tree';
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.render();
    }

    cacheElements() {
        // Sidebar
        this.elements.newNoteBtn = document.getElementById('new-note-btn');
        this.elements.dailyNoteBtn = document.getElementById('daily-note-btn');
        this.elements.noteSearch = document.getElementById('note-search');
        this.elements.notesTree = document.getElementById('notes-tree');
        this.elements.tagsList = document.getElementById('tags-list');
        this.elements.pinnedList = document.getElementById('pinned-list');
        this.elements.dailyList = document.getElementById('daily-list');
        
        // Tabs
        this.elements.tabBtns = document.querySelectorAll('.tab-btn');
        this.elements.tabPanes = document.querySelectorAll('.tab-pane');
        
        // Editor
        this.elements.noteTitle = document.getElementById('note-title');
        this.elements.noteEditor = document.getElementById('note-editor');
        this.elements.noteCreated = document.getElementById('note-created');
        this.elements.noteModified = document.getElementById('note-modified');
        this.elements.tagsInput = document.getElementById('tags-input');
        this.elements.tagsDisplay = document.getElementById('tags-display');
        
        // Actions
        this.elements.pinNoteBtn = document.getElementById('pin-note-btn');
        this.elements.linkNoteBtn = document.getElementById('link-note-btn');
        this.elements.deleteNoteBtn = document.getElementById('delete-note-btn');
        
        // Modal
        this.elements.linkModal = document.getElementById('link-modal');
        this.elements.closeLinkModal = document.getElementById('close-link-modal');
        this.elements.linkSearch = document.getElementById('link-search');
        this.elements.linkResults = document.getElementById('link-results');
        
        // Backlinks
        this.elements.backlinksPanel = document.getElementById('backlinks-panel');
        this.elements.toggleBacklinks = document.getElementById('toggle-backlinks');
        this.elements.backlinksContent = document.getElementById('backlinks-content');
    }

    attachEventListeners() {
        // New note button
        this.elements.newNoteBtn.addEventListener('click', () => this.handleNewNote());
        
        // Daily note button
        this.elements.dailyNoteBtn.addEventListener('click', () => this.handleDailyNote());
        
        // Search
        this.elements.noteSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Tabs
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Editor
        this.elements.noteTitle.addEventListener('input', () => this.handleTitleChange());
        this.elements.noteEditor.addEventListener('input', () => this.handleContentChange());
        
        // Tags
        this.elements.tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTag(e.target.value);
                e.target.value = '';
            }
        });
        
        // Actions
        this.elements.pinNoteBtn.addEventListener('click', () => this.handlePinNote());
        this.elements.linkNoteBtn.addEventListener('click', () => this.showLinkModal());
        this.elements.deleteNoteBtn.addEventListener('click', () => this.handleDeleteNote());
        
        // Modal
        this.elements.closeLinkModal.addEventListener('click', () => this.hideLinkModal());
        this.elements.linkModal.addEventListener('click', (e) => {
            if (e.target === this.elements.linkModal) this.hideLinkModal();
        });
        this.elements.linkSearch.addEventListener('input', (e) => this.handleLinkSearch(e.target.value));
        
        // Backlinks toggle
        this.elements.toggleBacklinks.addEventListener('click', () => this.toggleBacklinks());
    }

    async render() {
        this.renderTree();
        this.renderTags();
        this.renderPinned();
        this.renderDaily();
    }

    renderTree() {
        const rootNotes = this.manager.getRootNotes();
        this.elements.notesTree.innerHTML = '';

        if (rootNotes.length === 0) {
            this.elements.notesTree.innerHTML = '<div class="empty-state">No notes yet. Create your first note!</div>';
            return;
        }

        const renderNode = (note, level = 0) => {
            const children = this.manager.getChildNotes(note.id);
            const hasChildren = children.length > 0;

            const isDailyNote = note.tags.includes('daily');
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-item';
            nodeDiv.innerHTML = `
                <div class="tree-node ${this.manager.currentNote?.id === note.id ? 'active' : ''} ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}">
                    ${hasChildren ? '<span class="tree-toggle">▶</span>' : '<span class="tree-toggle"></span>'}
                    <span class="tree-title">${this.escapeHtml(note.title)}</span>
                    ${isDailyNote ? '<span class="daily-note-indicator"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M2 6H14M5 1V3M11 1V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>' : ''}
                </div>
                ${hasChildren ? '<div class="tree-children" style="display: none;"></div>' : ''}
            `;

            const treeNode = nodeDiv.querySelector('.tree-node');
            treeNode.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadNote(note.id);
            });

            if (hasChildren) {
                const toggle = nodeDiv.querySelector('.tree-toggle');
                const childrenContainer = nodeDiv.querySelector('.tree-children');
                
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    toggle.textContent = isExpanded ? '▶' : '▼';
                });

                children.forEach(child => {
                    childrenContainer.appendChild(renderNode(child, level + 1));
                });
            }

            return nodeDiv;
        };

        rootNotes.forEach(note => {
            this.elements.notesTree.appendChild(renderNode(note));
        });
    }

    renderTags() {
        const tags = this.manager.getAllTags();
        this.elements.tagsList.innerHTML = '';

        if (tags.length === 0) {
            this.elements.tagsList.innerHTML = '<div class="empty-state">No tags yet.</div>';
            return;
        }

        tags.forEach(({ tag, count }) => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span class="tag-name">#${this.escapeHtml(tag)}</span>
                <span class="tag-count">${count}</span>
            `;
            tagItem.addEventListener('click', () => this.filterByTag(tag));
            this.elements.tagsList.appendChild(tagItem);
        });
    }

    renderPinned() {
        const pinnedNotes = this.manager.getPinnedNotes();
        this.elements.pinnedList.innerHTML = '';

        if (pinnedNotes.length === 0) {
            this.elements.pinnedList.innerHTML = '<div class="empty-state">No pinned notes.</div>';
            return;
        }

        pinnedNotes.forEach(note => {
            const pinnedItem = document.createElement('div');
            pinnedItem.className = 'pinned-item';
            pinnedItem.innerHTML = `
                <div class="pinned-item-title">${this.escapeHtml(note.title)}</div>
                <div class="pinned-item-preview">${this.escapeHtml(note.content.substring(0, 100))}</div>
            `;
            pinnedItem.addEventListener('click', () => this.loadNote(note.id));
            this.elements.pinnedList.appendChild(pinnedItem);
        });
    }

    renderDaily() {
        const dailyNotes = this.manager.getDailyNotes();
        this.elements.dailyList.innerHTML = '';

        if (dailyNotes.length === 0) {
            this.elements.dailyList.innerHTML = '<div class="empty-state">No daily notes yet. Click "Daily Note" to create today\'s note!</div>';
            return;
        }

        const today = this.manager.formatDateForDaily(new Date());
        const todayTitle = `Daily Note - ${today}`;

        dailyNotes.forEach(note => {
            const isToday = note.title === todayTitle;
            const dailyItem = document.createElement('div');
            dailyItem.className = `daily-item ${isToday ? 'today' : ''}`;
            
            // Extract date from title
            const dateMatch = note.title.match(/Daily Note - (.+)/);
            const dateStr = dateMatch ? dateMatch[1] : note.title;
            
            dailyItem.innerHTML = `
                <div class="daily-item-date">
                    ${this.escapeHtml(dateStr)}
                    ${isToday ? '<span class="daily-item-badge">Today</span>' : ''}
                </div>
                <div class="daily-item-preview">${this.escapeHtml(note.content.substring(0, 80))}</div>
            `;
            dailyItem.addEventListener('click', () => this.loadNote(note.id));
            this.elements.dailyList.appendChild(dailyItem);
        });
    }

    async loadNote(noteId) {
        const note = await this.manager.db.getNote(noteId);
        if (!note) return;

        this.manager.currentNote = note;
        this.elements.noteTitle.value = note.title;
        this.elements.noteEditor.value = note.content;
        this.elements.noteCreated.textContent = `Created: ${this.formatDate(note.created)}`;
        this.elements.noteModified.textContent = `Modified: ${this.formatDate(note.modified)}`;
        
        // Update pin button
        if (note.pinned) {
            this.elements.pinNoteBtn.classList.add('active');
        } else {
            this.elements.pinNoteBtn.classList.remove('active');
        }

        // Render tags
        this.renderNoteTags(note.tags);

        // Load backlinks
        await this.loadBacklinks(noteId);

        // Update tree to highlight current note
        this.renderTree();
    }

    renderNoteTags(tags) {
        this.elements.tagsDisplay.innerHTML = '';
        tags.forEach(tag => {
            const tagChip = document.createElement('div');
            tagChip.className = 'tag-chip';
            tagChip.innerHTML = `
                <span>${this.escapeHtml(tag)}</span>
                <span class="tag-chip-remove" data-tag="${this.escapeHtml(tag)}">&times;</span>
            `;
            tagChip.querySelector('.tag-chip-remove').addEventListener('click', () => {
                this.handleRemoveTag(tag);
            });
            this.elements.tagsDisplay.appendChild(tagChip);
        });
    }

    async loadBacklinks(noteId) {
        const backlinks = await this.manager.getBacklinks(noteId);
        this.elements.backlinksContent.innerHTML = '';

        if (backlinks.length === 0) {
            this.elements.backlinksContent.innerHTML = '<div class="empty-state">No backlinks yet.</div>';
            return;
        }

        for (const link of backlinks) {
            const fromNote = await this.manager.db.getNote(link.fromNoteId);
            if (fromNote) {
                const backlinkItem = document.createElement('div');
                backlinkItem.className = 'backlink-item';
                backlinkItem.textContent = fromNote.title;
                backlinkItem.addEventListener('click', () => this.loadNote(fromNote.id));
                this.elements.backlinksContent.appendChild(backlinkItem);
            }
        }
    }

    async handleNewNote() {
        const note = await this.manager.createNote();
        await this.render();
        await this.loadNote(note.id);
    }

    async handleDailyNote() {
        // Get or create today's daily note
        let dailyNote = this.manager.getTodaysDailyNote();
        
        if (!dailyNote) {
            dailyNote = await this.manager.createDailyNote();
            await this.render();
        }
        
        // Switch to daily tab and load the note
        this.switchTab('daily');
        await this.loadNote(dailyNote.id);
    }

    handleTitleChange() {
        if (!this.manager.currentNote) return;

        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(async () => {
            await this.manager.updateNote(this.manager.currentNote.id, {
                title: this.elements.noteTitle.value
            });
            await this.render();
        }, 500);
    }

    handleContentChange() {
        if (!this.manager.currentNote) return;

        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(async () => {
            const content = this.elements.noteEditor.value;
            await this.manager.updateNote(this.manager.currentNote.id, { content });
            
            // Parse and create internal links
            const linkedTitles = this.manager.parseInternalLinks(content);
            for (const title of linkedTitles) {
                const linkedNote = this.manager.notes.find(n => 
                    n.title.toLowerCase() === title.toLowerCase()
                );
                if (linkedNote) {
                    await this.manager.createLink(this.manager.currentNote.id, linkedNote.id);
                }
            }
        }, 500);
    }

    async handleAddTag(tag) {
        if (!this.manager.currentNote || !tag.trim()) return;

        await this.manager.addTag(this.manager.currentNote.id, tag.trim());
        this.manager.currentNote = await this.manager.db.getNote(this.manager.currentNote.id);
        this.renderNoteTags(this.manager.currentNote.tags);
        this.renderTags();
    }

    async handleRemoveTag(tag) {
        if (!this.manager.currentNote) return;

        await this.manager.removeTag(this.manager.currentNote.id, tag);
        this.manager.currentNote = await this.manager.db.getNote(this.manager.currentNote.id);
        this.renderNoteTags(this.manager.currentNote.tags);
        this.renderTags();
    }

    async handlePinNote() {
        if (!this.manager.currentNote) return;

        await this.manager.togglePin(this.manager.currentNote.id);
        this.manager.currentNote = await this.manager.db.getNote(this.manager.currentNote.id);
        
        if (this.manager.currentNote.pinned) {
            this.elements.pinNoteBtn.classList.add('active');
        } else {
            this.elements.pinNoteBtn.classList.remove('active');
        }

        await this.render();
    }

    async handleDeleteNote() {
        if (!this.manager.currentNote) return;

        if (confirm('Are you sure you want to delete this note and all its children?')) {
            const noteId = this.manager.currentNote.id;
            await this.manager.deleteNote(noteId);
            this.manager.currentNote = null;
            
            // Clear editor
            this.elements.noteTitle.value = '';
            this.elements.noteEditor.value = '';
            this.elements.noteCreated.textContent = 'Created: --';
            this.elements.noteModified.textContent = 'Modified: --';
            this.elements.tagsDisplay.innerHTML = '';
            
            await this.render();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderTree();
            return;
        }

        const results = this.manager.searchNotes(query);
        this.elements.notesTree.innerHTML = '';

        if (results.length === 0) {
            this.elements.notesTree.innerHTML = '<div class="empty-state">No results found.</div>';
            return;
        }

        results.forEach(note => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.innerHTML = `<span class="tree-title">${this.escapeHtml(note.title)}</span>`;
            nodeDiv.addEventListener('click', () => this.loadNote(note.id));
            this.elements.notesTree.appendChild(nodeDiv);
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        this.elements.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab panes
        this.elements.tabPanes.forEach(pane => {
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    showLinkModal() {
        if (!this.manager.currentNote) return;

        this.elements.linkModal.classList.remove('hidden');
        this.elements.linkSearch.value = '';
        this.renderLinkResults(this.manager.notes.filter(n => n.id !== this.manager.currentNote.id));
    }

    hideLinkModal() {
        this.elements.linkModal.classList.add('hidden');
    }

    handleLinkSearch(query) {
        const notes = this.manager.searchNotes(query).filter(n => 
            n.id !== this.manager.currentNote?.id
        );
        this.renderLinkResults(notes);
    }

    renderLinkResults(notes) {
        this.elements.linkResults.innerHTML = '';

        if (notes.length === 0) {
            this.elements.linkResults.innerHTML = '<div class="empty-state">No notes found.</div>';
            return;
        }

        notes.forEach(note => {
            const resultItem = document.createElement('div');
            resultItem.className = 'link-result-item';
            resultItem.textContent = note.title;
            resultItem.addEventListener('click', async () => {
                await this.manager.createLink(this.manager.currentNote.id, note.id);
                
                // Insert link syntax at cursor
                const linkText = `[[${note.title}]]`;
                const textarea = this.elements.noteEditor;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                
                textarea.value = text.substring(0, start) + linkText + text.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + linkText.length;
                
                this.hideLinkModal();
                this.handleContentChange();
            });
            this.elements.linkResults.appendChild(resultItem);
        });
    }

    toggleBacklinks() {
        this.elements.backlinksPanel.classList.toggle('collapsed');
    }

    filterByTag(tag) {
        const notesWithTag = this.manager.notes.filter(note => note.tags.includes(tag));
        this.elements.notesTree.innerHTML = '';

        if (notesWithTag.length === 0) {
            this.elements.notesTree.innerHTML = '<div class="empty-state">No notes with this tag.</div>';
            return;
        }

        notesWithTag.forEach(note => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.innerHTML = `<span class="tree-title">${this.escapeHtml(note.title)}</span>`;
            nodeDiv.addEventListener('click', () => {
                this.loadNote(note.id);
                this.switchTab('tree');
            });
            this.elements.notesTree.appendChild(nodeDiv);
        });

        this.switchTab('tree');
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== DataStore Integration =====
function syncNotesToDataStore() {
    // Check if DataStore is available (from parent window or global)
    const dataStore = window.parent?.OmniHubDataStore || window.OmniHubDataStore;
    
    if (!dataStore || !notesManager) {
        console.log('📦 DataStore not available for sync');
        return;
    }
    
    try {
        // Transform notes for DataStore format
        const notesData = {
            items: notesManager.notes.map(note => ({
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                pinned: note.pinned,
                created: note.created,
                modified: note.modified
            })),
            tags: notesManager.getAllTags().map(t => t.tag),
            lastModified: new Date().toISOString()
        };
        
        dataStore.setModuleData('notes', notesData);
        console.log(`📦 Synced ${notesData.items.length} notes to DataStore`);
    } catch (e) {
        console.warn('⚠️ Failed to sync notes to DataStore:', e);
    }
}

// ===== Module Initialization =====
let notesManager;
let notesUI;

async function initModule(container) {
    if (!notesManager) {
        notesManager = new NotesManager();
        await notesManager.init();
    }

    if (!notesUI) {
        notesUI = new NotesUI(notesManager);
        notesUI.init();
    }
    
    // Initial sync to DataStore
    syncNotesToDataStore();

    return {
        manager: notesManager,
        ui: notesUI
    };
}

// ===== Module Lifecycle Hooks =====
window.notesModule = {
    onActivate: () => {
        console.log('📝 Notes module activated');
        // Refresh the UI when activated
        if (notesUI && notesManager?.initialized) {
            notesUI.render();
        }
    },
    
    onDeactivate: () => {
        console.log('📝 Notes module deactivated');
        // Auto-save current note if editing
        if (notesManager?.currentNote && notesUI) {
            const title = document.getElementById('note-title')?.value;
            const content = document.getElementById('note-editor')?.value;
            if (title || content) {
                notesManager.updateNote(notesManager.currentNote.id, {
                    title: title || 'Untitled',
                    content: content || ''
                });
            }
        }
    },
    
    getState: () => {
        // Return current notes state
        return {
            currentNoteId: notesManager?.currentNote?.id,
            currentTab: notesUI?.currentTab,
            scrollPosition: document.getElementById('notes-tree')?.scrollTop
        };
    },
    
    restoreState: (state) => {
        // Restore notes state
        console.log('🔄 Restoring notes state...');
        if (state && notesUI && notesManager) {
            if (state.currentTab) {
                notesUI.switchTab(state.currentTab);
            }
            if (state.currentNoteId) {
                notesUI.loadNote(state.currentNoteId);
            }
            if (state.scrollPosition) {
                const tree = document.getElementById('notes-tree');
                if (tree) tree.scrollTop = state.scrollPosition;
            }
        }
    }
};

// Auto-initialize if loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initModule(document.getElementById('notes-container'));
    });
} else {
    initModule(document.getElementById('notes-container'));
}

// Export for module integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initModule, NotesManager, NotesUI };
}
