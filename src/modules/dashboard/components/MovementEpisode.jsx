import React from 'react';
import { MapPin, Navigation, Globe, Crosshair } from 'lucide-react';

const MovementEpisode = () => {
  // Mock location data
  const currentLocation = {
    name: 'San Francisco',
    region: 'California, USA',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    lastUpdated: '5 minutes ago'
  };

  const recentLocations = [
    { id: 1, name: 'Golden Gate Park', time: '2 hours ago', type: 'park' },
    { id: 2, name: 'Ferry Building', time: '5 hours ago', type: 'landmark' },
    { id: 3, name: 'Mission District', time: 'Yesterday', type: 'neighborhood' }
  ];

  const formatCoordinate = (value, isLat) => {
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  return (
    <div className="movement-episode">
      <div className="movement-header">
        <MapPin size={40} className="movement-icon" />
        <h2 className="episode-title">Movement & Context</h2>
      </div>

      <div className="current-location">
        <div className="location-main">
          <Globe size={60} className="location-globe" />
          <div className="location-details">
            <div className="location-name">{currentLocation.name}</div>
            <div className="location-region">{currentLocation.region}</div>
          </div>
        </div>

        <div className="coordinates-grid">
          <div className="coordinate-card">
            <Crosshair size={20} className="coord-icon" />
            <div className="coord-content">
              <div className="coord-label">Latitude</div>
              <div className="coord-value">
                {formatCoordinate(currentLocation.coordinates.latitude, true)}
              </div>
            </div>
          </div>

          <div className="coordinate-card">
            <Crosshair size={20} className="coord-icon" />
            <div className="coord-content">
              <div className="coord-label">Longitude</div>
              <div className="coord-value">
                {formatCoordinate(currentLocation.coordinates.longitude, false)}
              </div>
            </div>
          </div>
        </div>

        <div className="last-updated">
          <Navigation size={14} />
          Last updated {currentLocation.lastUpdated}
        </div>
      </div>

      <div className="recent-section">
        <h3 className="section-title">Recent Locations</h3>
        <div className="locations-list">
          {recentLocations.map((location) => (
            <div key={location.id} className="location-card">
              <div className="location-marker">📍</div>
              <div className="location-info">
                <div className="location-name-small">{location.name}</div>
                <div className="location-time">{location.time}</div>
              </div>
              <div className="location-type">{location.type}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .movement-episode {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .movement-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .movement-icon {
          opacity: 0.9;
        }

        .episode-title {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .current-location {
          padding: 2rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .location-main {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .location-globe {
          opacity: 0.9;
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .location-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .location-name {
          font-size: 2rem;
          font-weight: 300;
          line-height: 1;
        }

        .location-region {
          font-size: 1.1rem;
          opacity: 0.7;
        }

        .coordinates-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .coordinate-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .coord-icon {
          opacity: 0.8;
        }

        .coord-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .coord-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .coord-value {
          font-size: 1rem;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .last-updated {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          opacity: 0.6;
          justify-content: center;
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

        .locations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .location-card {
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

        .location-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .location-marker {
          font-size: 1.5rem;
        }

        .location-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .location-name-small {
          font-size: 1rem;
          font-weight: 500;
        }

        .location-time {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .location-type {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .location-main {
            flex-direction: column;
          }
          
          .coordinates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MovementEpisode;