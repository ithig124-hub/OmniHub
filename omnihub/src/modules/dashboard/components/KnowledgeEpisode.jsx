import React from 'react';
import { BookOpen, FileText, Link2, TrendingUp } from 'lucide-react';

const KnowledgeEpisode = () => {
  // Mock knowledge data
  const recentNotes = [
    {
      id: 1,
      title: 'Dashboard Design Patterns',
      lastEdited: '2 hours ago',
      isPinned: true,
      linkedItems: 3
    },
    {
      id: 2,
      title: 'Ambient UI Research',
      lastEdited: '5 hours ago',
      isPinned: true,
      linkedItems: 7
    },
    {
      id: 3,
      title: 'Glass Morphism Techniques',
      lastEdited: 'Yesterday',
      isPinned: false,
      linkedItems: 2
    },
    {
      id: 4,
      title: 'Real-time Data Integration',
      lastEdited: '2 days ago',
      isPinned: false,
      linkedItems: 5
    }
  ];

  const insights = {
    totalNotes: 47,
    connections: 128,
    recentActivity: '+12 this week'
  };

  return (
    <div className="knowledge-episode">
      <div className="knowledge-header">
        <BookOpen size={40} className="knowledge-icon" />
        <h2 className="episode-title">Knowledge Snapshot</h2>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <FileText size={24} className="insight-icon" />
          <div className="insight-content">
            <div className="insight-value">{insights.totalNotes}</div>
            <div className="insight-label">Total Notes</div>
          </div>
        </div>

        <div className="insight-card">
          <Link2 size={24} className="insight-icon" />
          <div className="insight-content">
            <div className="insight-value">{insights.connections}</div>
            <div className="insight-label">Connections</div>
          </div>
        </div>

        <div className="insight-card">
          <TrendingUp size={24} className="insight-icon" />
          <div className="insight-content">
            <div className="insight-value">{insights.recentActivity}</div>
            <div className="insight-label">This Week</div>
          </div>
        </div>
      </div>

      <div className="notes-section">
        <h3 className="section-title">Recent & Pinned Notes</h3>
        <div className="notes-list">
          {recentNotes.map((note) => (
            <div key={note.id} className="note-card">
              {note.isPinned && (
                <div className="pin-indicator">📌</div>
              )}
              <div className="note-content">
                <div className="note-title">{note.title}</div>
                <div className="note-meta">
                  <span className="note-time">{note.lastEdited}</span>
                  <span className="note-links">
                    <Link2 size={12} />
                    {note.linkedItems} links
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .knowledge-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .knowledge-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .knowledge-icon {
          opacity: 0.9;
        }

        .episode-title {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .insight-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
        }

        .insight-icon {
          opacity: 0.9;
        }

        .insight-content {
          text-align: center;
        }

        .insight-value {
          font-size: 2rem;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .insight-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notes-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .notes-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .note-card {
          position: relative;
          padding: 1.2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .note-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .pin-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1rem;
          opacity: 0.8;
        }

        .note-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-right: 2rem;
        }

        .note-title {
          font-size: 1.1rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .note-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .note-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        @media (max-width: 768px) {
          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgeEpisode;