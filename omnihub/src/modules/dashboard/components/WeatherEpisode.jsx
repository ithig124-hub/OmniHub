import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Eye, Gauge } from 'lucide-react';

const WeatherEpisode = ({ weatherData }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (weatherData) {
      setLocation({
        name: weatherData.name,
        country: weatherData.sys?.country
      });
    }
  }, [weatherData]);

  const getWeatherIcon = (condition, size = 60) => {
    const iconMap = {
      Clear: <Sun size={size} />,
      Clouds: <Cloud size={size} />,
      Rain: <CloudRain size={size} />,
      Snow: <CloudSnow size={size} />,
      Drizzle: <CloudRain size={size} />,
      Thunderstorm: <CloudRain size={size} />
    };
    return iconMap[condition] || <Cloud size={size} />;
  };

  if (!weatherData) {
    return (
      <div className="weather-episode loading">
        <div className="loading-message">Loading weather data...</div>
      </div>
    );
  }

  const temp = Math.round(weatherData.main?.temp);
  const feelsLike = Math.round(weatherData.main?.feels_like);
  const condition = weatherData.weather?.[0]?.main;
  const description = weatherData.weather?.[0]?.description;
  const tempMin = Math.round(weatherData.main?.temp_min);
  const tempMax = Math.round(weatherData.main?.temp_max);

  return (
    <div className="weather-episode">
      <div className="weather-header">
        <div className="location-info">
          <h2 className="location-name">
            {location?.name || 'Unknown Location'}
          </h2>
          <div className="location-country">{location?.country}</div>
        </div>
      </div>

      <div className="weather-main">
        <div className="weather-icon-container">
          {getWeatherIcon(condition, 100)}
        </div>
        <div className="temperature-display">
          <div className="temp-main">{temp}°</div>
          <div className="temp-feels">Feels like {feelsLike}°</div>
        </div>
      </div>

      <div className="weather-condition">
        <div className="condition-text">{condition}</div>
        <div className="condition-description">{description}</div>
      </div>

      <div className="weather-details">
        <div className="detail-card">
          <div className="detail-icon-wrapper">
            <Droplets size={20} />
          </div>
          <div className="detail-content">
            <div className="detail-label">Humidity</div>
            <div className="detail-value">{weatherData.main?.humidity}%</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon-wrapper">
            <Wind size={20} />
          </div>
          <div className="detail-content">
            <div className="detail-label">Wind</div>
            <div className="detail-value">{Math.round(weatherData.wind?.speed)} m/s</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon-wrapper">
            <Gauge size={20} />
          </div>
          <div className="detail-content">
            <div className="detail-label">Pressure</div>
            <div className="detail-value">{weatherData.main?.pressure} hPa</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon-wrapper">
            <Eye size={20} />
          </div>
          <div className="detail-content">
            <div className="detail-label">Visibility</div>
            <div className="detail-value">{(weatherData.visibility / 1000).toFixed(1)} km</div>
          </div>
        </div>
      </div>

      <div className="temp-range">
        <div className="range-item">
          <span className="range-label">Low</span>
          <span className="range-value">{tempMin}°</span>
        </div>
        <div className="range-divider"></div>
        <div className="range-item">
          <span className="range-label">High</span>
          <span className="range-value">{tempMax}°</span>
        </div>
      </div>

      <style jsx>{`
        .weather-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .loading {
          align-items: center;
          justify-content: center;
        }

        .loading-message {
          font-size: 1.5rem;
          opacity: 0.7;
        }

        .weather-header {
          margin-bottom: 2rem;
        }

        .location-info {
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }

        .location-name {
          font-size: 2rem;
          font-weight: 300;
          margin: 0;
        }

        .location-country {
          font-size: 1rem;
          opacity: 0.7;
        }

        .weather-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin: 2rem 0;
        }

        .weather-icon-container {
          opacity: 0.95;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .temperature-display {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .temp-main {
          font-size: 5rem;
          font-weight: 200;
          line-height: 1;
          letter-spacing: -3px;
        }

        .temp-feels {
          font-size: 1.1rem;
          opacity: 0.8;
        }

        .weather-condition {
          text-align: center;
          margin: 2rem 0;
        }

        .condition-text {
          font-size: 1.8rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
        }

        .condition-description {
          font-size: 1rem;
          opacity: 0.8;
          text-transform: capitalize;
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }

        .detail-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .detail-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .detail-icon-wrapper {
          opacity: 0.9;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1.1rem;
          font-weight: 500;
        }

        .temp-range {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: auto;
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .range-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .range-label {
          font-size: 0.85rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .range-value {
          font-size: 1.8rem;
          font-weight: 300;
        }

        .range-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .weather-main {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .temp-main {
            font-size: 4rem;
          }
          
          .weather-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherEpisode;