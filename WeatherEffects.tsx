import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';

interface WeatherParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

type WeatherType = 'clear' | 'rain' | 'fog' | 'snow';

interface WeatherEffectsProps {
  type?: WeatherType;
  intensity?: number; // 0-1
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ 
  type: initialType = 'clear',
  intensity: initialIntensity = 0.5
}) => {
  const { environmentMode } = useSimulation();
  const [weatherType, setWeatherType] = useState<WeatherType>(initialType);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [particles, setParticles] = useState<WeatherParticle[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [showControls, setShowControls] = useState(false);
  
  // Initialize container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Generate particles based on weather type and intensity
  useEffect(() => {
    if (width === 0 || height === 0) return;
    
    const count = Math.floor(width * height * 0.0002 * intensity);
    const newParticles: WeatherParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(width, height, weatherType));
    }
    
    setParticles(newParticles);
  }, [width, height, weatherType, intensity]);
  
  // Rain/snow animation
  useEffect(() => {
    if (!canvasRef.current || weatherType === 'clear') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const updatedParticles = particles.map(particle => {
        // Move particle down
        particle.y += particle.speed;
        
        // Rain effect adds horizontal movement
        if (weatherType === 'rain') {
          particle.x += Math.sin(particle.y * 0.01) * 0.5;
        }
        
        // Snow effect adds wobble
        if (weatherType === 'snow') {
          particle.x += Math.sin(particle.y * 0.01 + particle.id) * 0.5;
        }
        
        // Fog effect adds slow upward drift
        if (weatherType === 'fog') {
          particle.y -= 0.1;
          particle.x += Math.sin(particle.y * 0.005) * 0.2;
        }
        
        // Reset particles that go offscreen
        if (particle.y > height) {
          if (weatherType === 'rain' || weatherType === 'snow') {
            particle.y = -20;
            particle.x = Math.random() * width;
          }
        }
        
        if (particle.y < -20) {
          if (weatherType === 'fog') {
            particle.y = height + 20;
            particle.x = Math.random() * width;
          }
        }
        
        if (particle.x < -20) {
          particle.x = width + 20;
        } else if (particle.x > width + 20) {
          particle.x = -20;
        }
        
        // Draw particle
        if (weatherType === 'rain') {
          ctx.strokeStyle = `rgba(120, 181, 255, ${particle.opacity})`;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + 1, particle.y + particle.size);
          ctx.stroke();
        } else if (weatherType === 'snow') {
          ctx.fillStyle = `rgba(220, 240, 255, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (weatherType === 'fog') {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, `rgba(200, 200, 210, ${particle.opacity})`);
          gradient.addColorStop(1, 'rgba(200, 200, 210, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        return particle;
      });
      
      setParticles(updatedParticles);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, weatherType, width, height]);
  
  // Create a single particle
  const createParticle = (width: number, height: number, type: WeatherType): WeatherParticle => {
    const id = Math.random();
    let size, opacity, speed, x, y;
    
    switch (type) {
      case 'rain':
        size = Math.random() * 5 + 5; // Rain drop length
        opacity = Math.random() * 0.3 + 0.2;
        speed = Math.random() * 10 + 10;
        x = Math.random() * width;
        y = Math.random() * height - height;
        break;
        
      case 'snow':
        size = Math.random() * 3 + 2;
        opacity = Math.random() * 0.5 + 0.2;
        speed = Math.random() * 2 + 1;
        x = Math.random() * width;
        y = Math.random() * height - height;
        break;
        
      case 'fog':
        size = Math.random() * 50 + 20;
        opacity = Math.random() * 0.2 + 0.01;
        speed = Math.random() * 0.5 + 0.1;
        x = Math.random() * width;
        y = Math.random() * height;
        break;
        
      default:
        size = 0;
        opacity = 0;
        speed = 0;
        x = 0;
        y = 0;
    }
    
    return { id, x, y, size, opacity, speed };
  };
  
  // Weather background effects
  const getBackgroundEffect = () => {
    switch (weatherType) {
      case 'rain':
        return {
          background: environmentMode === 'night'
            ? 'linear-gradient(0deg, rgba(18, 24, 38, 0.7) 0%, rgba(30, 36, 50, 0.4) 100%)'
            : 'linear-gradient(0deg, rgba(100, 130, 160, 0.4) 0%, rgba(140, 160, 185, 0.2) 100%)'
        };
        
      case 'fog':
        return {
          background: environmentMode === 'night'
            ? 'linear-gradient(0deg, rgba(30, 30, 42, 0.7) 0%, rgba(50, 50, 65, 0.3) 100%)'
            : 'linear-gradient(0deg, rgba(190, 190, 200, 0.4) 0%, rgba(210, 210, 225, 0.2) 100%)'
        };
        
      case 'snow':
        return {
          background: environmentMode === 'night'
            ? 'linear-gradient(0deg, rgba(20, 28, 45, 0.6) 0%, rgba(35, 40, 60, 0.3) 100%)'
            : 'linear-gradient(0deg, rgba(200, 210, 225, 0.3) 0%, rgba(220, 225, 235, 0.15) 100%)'
        };
        
      default:
        return {};
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
    >
      {/* Weather background overlay */}
      <AnimatePresence>
        {weatherType !== 'clear' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={getBackgroundEffect()}
          />
        )}
      </AnimatePresence>
      
      {/* Weather particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* Weather controls */}
      <div className="absolute top-20 right-4 z-30 pointer-events-auto">
        <button 
          className="h-8 w-8 rounded-full glass-effect flex items-center justify-center text-white mb-2"
          onClick={() => setShowControls(!showControls)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V6M12 18V20M6 12H4M20 12H18M18.7 5.3L17.3 6.7M6.7 17.3L5.3 18.7M17.3 17.3L18.7 18.7M6.7 6.7L5.3 5.3M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="glass-effect rounded-lg p-3 w-48"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-white font-medium text-xs mb-3">Weather Effects</h3>
              
              <div className="space-y-2">
                <div className="flex space-x-2">
                  {(['clear', 'rain', 'fog', 'snow'] as WeatherType[]).map(type => (
                    <button 
                      key={type}
                      className={`flex-1 py-1 text-xs rounded ${weatherType === type ? 'bg-[#7C3AED] text-white' : 'bg-[#2D2A5A] text-gray-300'}`}
                      onClick={() => setWeatherType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-300">Intensity</label>
                    <span className="text-xs text-gray-300">{Math.round(intensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    disabled={weatherType === 'clear'}
                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none"
                    style={{
                      backgroundImage: `linear-gradient(90deg, #7C3AED ${intensity * 100}%, #4B5563 ${intensity * 100}%)`,
                      accentColor: '#7C3AED'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeatherEffects;