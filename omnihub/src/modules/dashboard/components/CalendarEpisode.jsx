import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

const CalendarEpisode = () => {
  // Mock calendar data - will be replaced with real data later
  const upcomingEvents = [
    { id: 1, title: 'Team Meeting', time: '10:00 AM', date: 'Today', type: 'meeting' },
    { id: 2, title: 'Project Review', time: '2:30 PM', date: 'Today', type: 'meeting' },
    { id: 3, title: 'Design Workshop', time: '11:00 AM', date: 'Tomorrow', type: 'workshop' }
  ];

  const reminders = [
    { id: 1, title: 'Submit quarterly report', completed: false },
    { id: 2, title: 'Review dashboard designs', completed: false },
    { id: 3, title: 'Update project documentation', completed: true }
  ];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="calendar-episode">
      <div className="calendar-header">
        <Calendar size={40} className="calendar-icon" />
        <div>
          <h2 className="episode-title">Calendar & Reminders</h2>
          <div className="current-date">{formattedDate}</div>
        </div>
      </div>

      <div className="calendar-content">
        <div className="section">
          <h3 className="section-title">Upcoming Events</h3>
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-indicator" data-type={event.type}></div>
                <div className="event-content">
                  <div className="event-title">{event.title}</div>
                  <div className="event-meta">
                    <Clock size={14} />
                    <span>{event.time}</span>
                    <span className="event-date">{event.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Reminders</h3>
          <div className="reminders-list">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="reminder-item">
                <CheckCircle2
                  size={20}
                  className={`reminder-check ${reminder.completed ? 'completed' : ''}`}
                />
                <span className={`reminder-text ${reminder.completed ? 'completed' : ''}`}>
                  {reminder.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .calendar-icon {
          opacity: 0.9;
        }

        .episode-title {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .current-date {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }

        .calendar-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-y: auto;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .event-card {
          display: flex;
          gap: 1rem;
          padding: 1.2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .event-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .event-indicator {
          width: 4px;
          border-radius: 2px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4));
        }

        .event-indicator[data-type="meeting"] {
          background: linear-gradient(180deg, #667eea, #764ba2);
        }

        .event-indicator[data-type="workshop"] {
          background: linear-gradient(180deg, #f093fb, #f5576c);
        }

        .event-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-title {
          font-size: 1.1rem;
          font-weight: 500;
        }

        .event-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .event-date {
          margin-left: auto;
          font-weight: 500;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .reminder-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          transition: all 0.3s ease;
        }

        .reminder-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .reminder-check {
          flex-shrink: 0;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .reminder-check.completed {
          opacity: 1;
          color: #4ade80;
        }

        .reminder-text {
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .reminder-text.completed {
          opacity: 0.5;
          text-decoration: line-through;
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarEpisode;