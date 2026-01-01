// ===============================
// NOTES EXPORT MODULE
// Export notes in multiple formats
// ===============================

class NotesExporter {
  constructor(notesManager) {
    this.manager = notesManager;
  }

  /**
   * Export current note as Markdown
   */
  exportAsMarkdown(note) {
    if (!note) return '';
    
    let markdown = `# ${note.title}\n\n`;
    
    // Add metadata
    markdown += `> Created: ${new Date(note.created).toLocaleString()}\n`;
    markdown += `> Modified: ${new Date(note.modified).toLocaleString()}\n`;
    
    if (note.tags && note.tags.length > 0) {
      markdown += `> Tags: ${note.tags.map(t => `#${t}`).join(', ')}\n`;
    }
    
    markdown += `\n---\n\n`;
    markdown += note.content;
    
    return markdown;
  }

  /**
   * Export all notes as JSON
   */
  exportAllAsJSON() {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      notes: this.manager.notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        parentId: note.parentId,
        tags: note.tags,
        pinned: note.pinned,
        created: note.created,
        modified: note.modified,
        links: note.links
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export note as plain text
   */
  exportAsText(note) {
    if (!note) return '';
    
    let text = `${note.title}\n`;
    text += '='.repeat(note.title.length) + '\n\n';
    text += `Created: ${new Date(note.created).toLocaleString()}\n`;
    text += `Modified: ${new Date(note.modified).toLocaleString()}\n\n`;
    text += note.content;
    
    return text;
  }

  /**
   * Export note as HTML
   */
  exportAsHTML(note) {
    if (!note) return '';
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(note.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    .meta { color: #666; font-size: 0.9em; margin: 10px 0; }
    .tags { margin: 20px 0; }
    .tag { background: #667eea; color: white; padding: 4px 12px; border-radius: 16px; margin-right: 8px; font-size: 0.85em; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(note.title)}</h1>
  <div class="meta">
    <p>Created: ${new Date(note.created).toLocaleString()}</p>
    <p>Modified: ${new Date(note.modified).toLocaleString()}</p>
  </div>
  ${note.tags && note.tags.length > 0 ? `
  <div class="tags">
    ${note.tags.map(t => `<span class="tag">#${this.escapeHtml(t)}</span>`).join('')}
  </div>` : ''}
  <div class="content">
    ${this.markdownToHTML(note.content)}
  </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Simple markdown to HTML converter
   */
  markdownToHTML(markdown) {
    let html = this.escapeHtml(markdown);
    
    // Convert line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Convert headers
    html = html.replace(/<p>#{3} (.+?)<\/p>/g, '<h3>$1</h3>');
    html = html.replace(/<p>#{2} (.+?)<\/p>/g, '<h2>$1</h2>');
    html = html.replace(/<p># (.+?)<\/p>/g, '<h1>$1</h1>');
    
    // Convert bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/<p>```([\s\S]*?)```<\/p>/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Convert lists
    html = html.replace(/<p>- (.+?)<\/p>/g, '<ul><li>$1</li></ul>');
    
    return html;
  }

  /**
   * Download note as file
   */
  downloadNote(note, format = 'md') {
    let content, filename, mimeType;
    
    switch (format) {
      case 'md':
        content = this.exportAsMarkdown(note);
        filename = `${this.sanitizeFilename(note.title)}.md`;
        mimeType = 'text/markdown';
        break;
      case 'txt':
        content = this.exportAsText(note);
        filename = `${this.sanitizeFilename(note.title)}.txt`;
        mimeType = 'text/plain';
        break;
      case 'html':
        content = this.exportAsHTML(note);
        filename = `${this.sanitizeFilename(note.title)}.html`;
        mimeType = 'text/html';
        break;
      case 'json':
        content = JSON.stringify(note, null, 2);
        filename = `${this.sanitizeFilename(note.title)}.json`;
        mimeType = 'application/json';
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }
    
    this.triggerDownload(content, filename, mimeType);
  }

  /**
   * Download all notes
   */
  downloadAllNotes() {
    const content = this.exportAllAsJSON();
    const filename = `omnihub-notes-${new Date().toISOString().split('T')[0]}.json`;
    this.triggerDownload(content, filename, 'application/json');
  }

  /**
   * Copy note to clipboard
   */
  async copyToClipboard(note, format = 'md') {
    let content;
    
    switch (format) {
      case 'md':
        content = this.exportAsMarkdown(note);
        break;
      case 'txt':
        content = this.exportAsText(note);
        break;
      default:
        content = note.content;
    }
    
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      return false;
    }
  }

  /**
   * Helper: Trigger file download
   */
  triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Helper: Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50);
  }

  /**
   * Helper: Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in notes module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotesExporter;
}
