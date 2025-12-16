import React, { useEffect, useState } from 'react';

const AmbientScene = ({ timeOfDay, weather }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate ambient particles based on weather
    const particleCount = weather === 'Rain' ? 50 : weather === 'Snow' ? 30 : 20;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, [weather]);

  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      case 'afternoon':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'evening':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'night':
        return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getWeatherEffect = () => {
    switch (weather) {
      case 'Rain':
        return 'rain';
      case 'Snow':
        return 'snow';
      case 'Clear':
        return 'clear';
      default:
        return 'default';
    }
  };

  return (
    <>
      <div className="ambient-scene" style={{ background: getBackgroundGradient() }}>
        <div className="ambient-overlay"></div>
        
        <div className={`particles ${getWeatherEffect()}`}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>

        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      <style jsx>{`
        .ambient-scene {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
          transition: background 1s ease;
        }

        .ambient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
          pointer-events: none;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: float linear infinite;
        }

        .particles.rain .particle {
          border-radius: 50% 50% 50% 0;
          background: rgba(255, 255, 255, 0.4);
          animation: fall linear infinite;
        }

        .particles.snow .particle {
          background: rgba(255, 255, 255, 0.8);
          animation: snowfall linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(180deg);
            opacity: 0.5;
          }
        }

        @keyframes snowfall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.8;
          }
        }

        .gradient-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: orbFloat 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
          bottom: 10%;
          right: 10%;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent);
          top: 50%;
          left: 50%;
          animation-delay: 14s;
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 30px) scale(1.05);
          }
        }
      `}</style>
    </>
  );
};

export default AmbientScene;