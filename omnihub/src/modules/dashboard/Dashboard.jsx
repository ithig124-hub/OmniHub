import React, { useState, useEffect } from 'react';
import './dashboard.css';
import TimeEpisode from './components/TimeEpisode';
import WeatherEpisode from './components/WeatherEpisode';
import CalendarEpisode from './components/CalendarEpisode';
import KnowledgeEpisode from './components/KnowledgeEpisode';
import MovementEpisode from './components/MovementEpisode';
import ReadingEpisode from './components/ReadingEpisode';
import AmbientScene from './components/AmbientScene';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('day');

  const episodes = [
    { id: 0, name: 'Time & Context', component: TimeEpisode },
    { id: 1, name: 'Weather & Location', component: WeatherEpisode },
    { id: 2, name: 'Calendar & Reminders', component: CalendarEpisode },
    { id: 3, name: 'Knowledge Snapshot', component: KnowledgeEpisode },
    { id: 4, name: 'Movement & Context', component: MovementEpisode },
    { id: 5, name: 'Reading & Research', component: ReadingEpisode },
    { id: 6, name: 'Ambient Scene', component: AmbientScene }
  ];

  useEffect(() => {
    // Fetch weather data
    fetchWeatherData();
    
    // Update time of day
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/weather`);
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  const nextEpisode = () => {
    setCurrentEpisode((prev) => (prev + 1) % episodes.length);
  };

  const prevEpisode = () => {
    setCurrentEpisode((prev) => (prev - 1 + episodes.length) % episodes.length);
  };

  const CurrentComponent = episodes[currentEpisode].component;

  return (
    <div className={`dashboard-container ${timeOfDay}`}>
      <AmbientScene timeOfDay={timeOfDay} weather={weatherData?.weather?.[0]?.main} />
      
      <div className="dashboard-content">
        <div className="episode-container">
          <div className="episode-card glass-effect">
            <CurrentComponent weatherData={weatherData} timeOfDay={timeOfDay} />
          </div>
        </div>

        <div className="navigation-controls">
          <button onClick={prevEpisode} className="nav-button glass-button">
            <ChevronLeft size={24} />
          </button>
          
          <div className="episode-indicators">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                className={`indicator ${idx === currentEpisode ? 'active' : ''}`}
                onClick={() => setCurrentEpisode(idx)}
                title={ep.name}
              />
            ))}
          </div>
          
          <button onClick={nextEpisode} className="nav-button glass-button">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="episode-label glass-effect">
          {episodes[currentEpisode].name}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;