import React from 'react';
import { BookOpen, FileText, TrendingUp, Clock } from 'lucide-react';

const ReadingEpisode = () => {
  // Mock reading data
  const currentReading = {
    title: 'Designing Ambient Interfaces',
    author: 'Sarah Chen',
    progress: 67,
    currentPage: 134,
    totalPages: 200,
    timeLeft: '45 min left'
  };

  const recentActivity = [
    {
      id: 1,
      title: 'The Future of Human-Computer Interaction',
      type: 'PDF',
      lastOpened: '3 hours ago',
      progress: 100
    },
    {
      id: 2,
      title: 'Glass Morphism in Modern UI Design',
      type: 'Article',
      lastOpened: 'Yesterday',
      progress: 45
    },
    {
      id: 3,
      title: 'Real-time Data Visualization Patterns',
      type: 'PDF',
      lastOpened: '2 days ago',
      progress: 78
    }
  ];

  const stats = {
    totalDocuments: 156,
    completedThisWeek: 8,
    readingTime: '12.5 hrs'
  };

  return (
    <div className="reading-episode">
      <div className="reading-header">
        <BookOpen size={40} className="reading-icon" />
        <h2 className="episode-title">Reading & Research</h2>
      </div>

      <div className="current-reading">
        <div className="reading-label">Currently Reading</div>
        <div className="book-info">
          <div className="book-details">
            <div className="book-title">{currentReading.title}</div>
            <div className="book-author">by {currentReading.author}</div>
          </div>
          <div className="progress-section">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${currentReading.progress}%` }}
              />
            </div>
            <div className="progress-info">
              <span className="progress-text">
                {currentReading.currentPage} of {currentReading.totalPages} pages
              </span>
              <span className="progress-percent">{currentReading.progress}%</span>
            </div>
            <div className="time-left">
              <Clock size={14} />
              {currentReading.timeLeft}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FileText size={24} className="stat-icon" />
          <div className="stat-value">{stats.totalDocuments}</div>
          <div className="stat-label">Documents</div>
        </div>

        <div className="stat-card">
          <TrendingUp size={24} className="stat-icon" />
          <div className="stat-value">{stats.completedThisWeek}</div>
          <div className="stat-label">This Week</div>
        </div>

        <div className="stat-card">
          <Clock size={24} className="stat-icon" />
          <div className="stat-value">{stats.readingTime}</div>
          <div className="stat-label">Reading Time</div>
        </div>
      </div>

      <div className="recent-section">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((item) => (
            <div key={item.id} className="activity-card">
              <div className="activity-content">
                <div className="activity-title">{item.title}</div>
                <div className="activity-meta">
                  <span className="activity-type">{item.type}</span>
                  <span className="activity-time">{item.lastOpened}</span>
                </div>
              </div>
              <div className="mini-progress">
                <div
                  className="mini-progress-fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .reading-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .reading-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .reading-icon {
          opacity: 0.9;
        }

        .episode-title {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .current-reading {
          padding: 2rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .reading-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .book-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .book-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .book-title {
          font-size: 1.5rem;
          font-weight: 400;
          line-height: 1.3;
        }

        .book-author {
          font-size: 1rem;
          opacity: 0.7;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .time-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
        }

        .stat-icon {
          opacity: 0.9;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 300;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .recent-section {
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

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .activity-card {
          padding: 1.2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .activity-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .activity-title {
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .activity-type {
          padding: 0.15rem 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mini-progress {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .mini-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3));
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReadingEpisode;