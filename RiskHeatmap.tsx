import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
  radius: number;
  type: 'danger' | 'caution' | 'safe';
}

const RiskHeatmap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { safetyStatus, isEmergency, environmentMode, progress } = useSimulation();
  
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [showHeatmapControls, setShowHeatmapControls] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [heatmapActive, setHeatmapActive] = useState(true);
  
  // Generate initial heat points
  useEffect(() => {
    generateHeatPoints();
    
    // Add window resize handler to regenerate points
    const handleResize = () => {
      generateHeatPoints();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Regenerate heat points when safety status changes
  useEffect(() => {
    generateHeatPoints();
  }, [safetyStatus, isEmergency, environmentMode]);
  
  // Draw heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || !heatmapActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match parent element
    const updateCanvasSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    
    updateCanvasSize();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each heat point
    heatPoints.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, 
        point.y, 
        0, 
        point.x, 
        point.y, 
        point.radius
      );
      
      // Set gradient colors based on point type
      let color1, color2;
      
      if (point.type === 'danger') {
        color1 = `rgba(239, 68, 68, ${point.intensity * heatmapOpacity})`; // Red
        color2 = 'rgba(239, 68, 68, 0)';
      } else if (point.type === 'caution') {
        color1 = `rgba(245, 158, 11, ${point.intensity * heatmapOpacity})`; // Yellow
        color2 = 'rgba(245, 158, 11, 0)';
      } else {
        color1 = `rgba(16, 185, 129, ${point.intensity * heatmapOpacity * 0.5})`; // Green (dimmer)
        color2 = 'rgba(16, 185, 129, 0)';
      }
      
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw journey path with lower risk
    const drawJourneyPath = () => {
      // Bezier curve definitions - route path
      const startX = canvas.width * 0.25;
      const startY = canvas.height * 0.25;
      const endX = canvas.width * 0.75;
      const endY = canvas.height * 0.75;
      const cp1x = canvas.width * 0.35;
      const cp1y = canvas.height * 0.4;
      const cp2x = canvas.width * 0.65;
      const cp2y = canvas.height * 0.5;
      
      // Draw several points along the path to create safe zones
      for (let t = 0; t <= 1; t += 0.05) {
        // Bezier formula
        const x = Math.pow(1-t, 3) * startX + 
                 3 * Math.pow(1-t, 2) * t * cp1x + 
                 3 * (1-t) * Math.pow(t, 2) * cp2x + 
                 Math.pow(t, 3) * endX;
                 
        const y = Math.pow(1-t, 3) * startY + 
                 3 * Math.pow(1-t, 2) * t * cp1y + 
                 3 * (1-t) * Math.pow(t, 2) * cp2y + 
                 Math.pow(t, 3) * endY;
        
        // Create safe gradient around path
        const pathGradient = ctx.createRadialGradient(
          x, y, 0, x, y, 40
        );
        
        pathGradient.addColorStop(0, `rgba(124, 58, 237, ${0.1 * heatmapOpacity})`);
        pathGradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
        
        ctx.fillStyle = pathGradient;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    drawJourneyPath();
    
    // Special visualization for emergency
    if (isEmergency) {
      // Get user position based on progress
      const userPosX = canvas.width * (0.25 + (progress / 100) * 0.5);
      const userPosY = canvas.height * (0.25 + (progress / 100) * 0.5);
      
      // Draw emergency radius
      const emergencyGradient = ctx.createRadialGradient(
        userPosX, userPosY, 0, userPosX, userPosY, 150
      );
      
      emergencyGradient.addColorStop(0, `rgba(239, 68, 68, ${0.2 * heatmapOpacity})`);
      emergencyGradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.1 * heatmapOpacity})`);
      emergencyGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = emergencyGradient;
      ctx.beginPath();
      ctx.arc(userPosX, userPosY, 150, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [heatPoints, heatmapOpacity, progress, isEmergency, heatmapActive]);
  
  // Generate heat points based on the safety status
  const generateHeatPoints = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Set canvas size to match parent element
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Define risk hotspots based on current safety status
    const newHeatPoints: HeatPoint[] = [];
    
    // Add a high-risk zone in bottom left
    newHeatPoints.push({
      x: width * 0.2,
      y: height * 0.7,
      intensity: 0.8,
      radius: 100,
      type: 'danger'
    });
    
    // Add caution zones around the map
    newHeatPoints.push({
      x: width * 0.5,
      y: height * 0.2,
      intensity: 0.7,
      radius: 80,
      type: 'caution'
    });
    
    newHeatPoints.push({
      x: width * 0.8,
      y: height * 0.4,
      intensity: 0.6,
      radius: 90,
      type: 'caution'
    });
    
    // Add more risk points based on safety status
    if (safetyStatus === 'alert' || isEmergency) {
      // More danger zones when in alert
      newHeatPoints.push({
        x: width * 0.4,
        y: height * 0.6,
        intensity: 0.7,
        radius: 70,
        type: 'danger'
      });
      
      newHeatPoints.push({
        x: width * 0.7,
        y: height * 0.7,
        intensity: 0.8,
        radius: 90,
        type: 'danger'
      });
    } else if (safetyStatus === 'monitoring') {
      // More caution zones when monitoring
      newHeatPoints.push({
        x: width * 0.4,
        y: height * 0.6,
        intensity: 0.6,
        radius: 70,
        type: 'caution'
      });
      
      newHeatPoints.push({
        x: width * 0.7,
        y: height * 0.7,
        intensity: 0.5,
        radius: 100,
        type: 'caution'
      });
    } else {
      // Safe zones when safe
      newHeatPoints.push({
        x: width * 0.65,
        y: height * 0.6,
        intensity: 0.7,
        radius: 100,
        type: 'safe'
      });
      
      newHeatPoints.push({
        x: width * 0.4,
        y: height * 0.5,
        intensity: 0.6,
        radius: 80,
        type: 'safe'
      });
    }
    
    // Adjust intensity for night mode
    if (environmentMode === 'night') {
      newHeatPoints.forEach(point => {
        // Increase intensity and radius at night
        point.intensity *= 1.2;
        point.radius *= 1.1;
      });
    }
    
    setHeatPoints(newHeatPoints);
  };
  
  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${heatmapActive ? 'opacity-100' : 'opacity-0'}`}
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Heatmap toggle button */}
      <div className="absolute top-4 left-4 z-30">
        <button 
          className={`h-10 w-10 rounded-full ${heatmapActive ? 'bg-[#7C3AED]' : 'bg-[#2D2A5A]'} flex items-center justify-center relative`}
          onClick={() => setShowHeatmapControls(!showHeatmapControls)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7V5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.05 7.05L8.464 8.464" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.536 15.536L16.95 16.95" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.05 16.95L8.464 15.536" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.536 8.464L16.95 7.05" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Heatmap controls panel */}
      <AnimatePresence>
        {showHeatmapControls && (
          <motion.div 
            className="absolute top-16 left-4 z-30 glass-effect rounded-lg p-3 w-64"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white text-sm font-medium">Risk Heatmap</h3>
              <div className="flex items-center">
                <label className="text-xs text-gray-300 mr-2">Active</label>
                <div 
                  className={`relative w-8 h-4 rounded-full transition-colors ${heatmapActive ? 'bg-[#7C3AED]' : 'bg-gray-600'}`}
                  onClick={() => setHeatmapActive(!heatmapActive)}
                >
                  <div 
                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${heatmapActive ? 'left-[18px]' : 'left-0.5'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-300">Opacity</label>
                <span className="text-xs text-gray-300">{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-full appearance-none"
                style={{
                  backgroundImage: `linear-gradient(90deg, #7C3AED ${heatmapOpacity * 100}%, #4B5563 ${heatmapOpacity * 100}%)`,
                  accentColor: '#7C3AED'
                }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#EF4444] mb-1"></div>
                <span className="text-xs text-gray-300">Danger</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#F59E0B] mb-1"></div>
                <span className="text-xs text-gray-300">Caution</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#10B981] mb-1"></div>
                <span className="text-xs text-gray-300">Safe</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RiskHeatmap;