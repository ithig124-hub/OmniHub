import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Cpu } from 'lucide-react';

const TimeEpisode = () => {
  const [time, setTime] = useState(new Date());
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="time-episode">
      <div className="time-header">
        <Clock size={40} className="time-icon" />
        <h2 className="episode-title">Time & System Context</h2>
      </div>

      <div className="time-display">
        <div className="main-time">{formatTime(time)}</div>
        <div className="main-date">{formatDate(time)}</div>
      </div>

      <div className="system-info">
        <div className="info-card">
          <Calendar size={24} className="info-icon" />
          <div className="info-content">
            <div className="info-label">Timezone</div>
            <div className="info-value">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>

        <div className="info-card">
          <Cpu size={24} className="info-icon" />
          <div className="info-content">
            <div className="info-label">Session Uptime</div>
            <div className="info-value">{formatUptime(uptime)}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .time-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .time-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .time-icon {
          opacity: 0.9;
        }

        .episode-title {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .time-display {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .main-time {
          font-size: 6rem;
          font-weight: 200;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .main-date {
          font-size: 1.5rem;
          font-weight: 300;
          opacity: 0.9;
          letter-spacing: 0.5px;
        }

        .system-info {
          display: flex;
          gap: 1.5rem;
          margin-top: auto;
        }

        .info-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .info-icon {
          opacity: 0.8;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .main-time {
            font-size: 4rem;
          }
          
          .main-date {
            font-size: 1.2rem;
          }
          
          .system-info {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TimeEpisode;