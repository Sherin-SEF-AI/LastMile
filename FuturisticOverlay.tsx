import { useEffect, useState, useRef } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoPoint {
  x: number;
  y: number;
  label: string;
  pulse: boolean;
  type: 'info' | 'warning' | 'danger' | 'safe';
}

const FuturisticOverlay = () => {
  const { safetyStatus, isEmergency, progress, transportMode } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [infoPoints, setInfoPoints] = useState<InfoPoint[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showAugmentedUI, setShowAugmentedUI] = useState(true);
  const [scanActive, setScanActive] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const scanRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize dimensions and info points
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Run initial scan
    activateScan();
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (scanRef.current) clearTimeout(scanRef.current);
    };
  }, []);
  
  // Update info points based on dimensions and safety status
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      generateInfoPoints();
    }
  }, [dimensions, safetyStatus, isEmergency, scanComplete, progress]);
  
  // Simulate a scanning animation
  const activateScan = () => {
    setScanActive(true);
    setScanComplete(false);
    setScanProgress(0);
    
    // Reset points during scan
    setInfoPoints([]);
    
    // Animate scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setScanActive(false);
          setScanComplete(true);
          return 100;
        }
        return newProgress;
      });
    }, 50);
    
    return () => clearInterval(interval);
  };
  
  // Generate new info points
  const generateInfoPoints = () => {
    if (!scanComplete) return;
    
    const { width, height } = dimensions;
    const newPoints: InfoPoint[] = [];
    
    // Route start point
    newPoints.push({
      x: width * 0.25,
      y: height * 0.25,
      label: 'Start: ITPL Tech Park',
      pulse: false,
      type: 'info'
    });
    
    // Route end point
    newPoints.push({
      x: width * 0.75,
      y: height * 0.75,
      label: 'Destination: Brigade Gateway',
      pulse: false,
      type: 'info'
    });
    
    // Current location point
    const userPosX = width * (0.25 + (progress / 100) * 0.5);
    const userPosY = height * (0.25 + (progress / 100) * 0.5);
    
    newPoints.push({
      x: userPosX,
      y: userPosY - 60, // Position label above user
      label: `Current Location: ${Math.round(progress)}% Complete`,
      pulse: true,
      type: 'safe'
    });
    
    // Add transport info
    newPoints.push({
      x: userPosX + 70,
      y: userPosY + 20,
      label: `Transport: ${transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}`,
      pulse: false,
      type: 'info'
    });
    
    // Risk points based on safety status
    if (safetyStatus === 'alert' || isEmergency) {
      newPoints.push({
        x: width * 0.2,
        y: height * 0.7,
        label: 'High Risk Zone',
        pulse: true,
        type: 'danger'
      });
      
      newPoints.push({
        x: width * 0.4,
        y: height * 0.6,
        label: 'Caution: Recent Incident',
        pulse: true,
        type: 'warning'
      });
    } else if (safetyStatus === 'monitoring') {
      newPoints.push({
        x: width * 0.2,
        y: height * 0.7,
        label: 'Monitoring: Low Visibility',
        pulse: true,
        type: 'warning'
      });
    }
    
    // Add safe haven points
    newPoints.push({
      x: width * 0.6,
      y: height * 0.3,
      label: 'Safe Haven: Sapphire Mall',
      pulse: false,
      type: 'safe'
    });
    
    newPoints.push({
      x: width * 0.65,
      y: height * 0.6,
      label: 'Safe Haven: Medical Center',
      pulse: false,
      type: 'safe'
    });
    
    // Add emergency-specific points
    if (isEmergency) {
      newPoints.push({
        x: userPosX - 80,
        y: userPosY - 20,
        label: 'EMERGENCY ACTIVE',
        pulse: true,
        type: 'danger'
      });
      
      newPoints.push({
        x: width * 0.5,
        y: height * 0.4,
        label: 'Responder ETA: 2 min',
        pulse: true,
        type: 'info'
      });
    }
    
    setInfoPoints(newPoints);
  };
  
  const getPointColor = (type: InfoPoint['type']) => {
    switch (type) {
      case 'info': return '#7C3AED'; // Purple
      case 'warning': return '#F59E0B'; // Orange
      case 'danger': return '#EF4444'; // Red
      case 'safe': return '#10B981'; // Green
      default: return '#7C3AED';
    }
  };
  
  return (
    <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
      {/* Toggle Button (this part is clickable) */}
      <div className="absolute bottom-20 left-4 z-30 pointer-events-auto">
        <motion.button 
          className={`h-12 w-12 rounded-full ${showAugmentedUI ? 'bg-[#7C3AED]' : 'glass-effect'} flex items-center justify-center`}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAugmentedUI(!showAugmentedUI)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12.5V6.5C2 5.4 2.4 4.5 3.2 3.7C4 2.9 5 2.5 6 2.5H18C19 2.5 20 2.9 20.8 3.7C21.6 4.5 22 5.4 22 6.5V12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12.5C2 13.6 2.4 14.5 3.2 15.3C4 16.1 5 16.5 6 16.5H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 20.5L18 17.5L15 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17.5H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
      
      {/* Scan Button */}
      <AnimatePresence>
        {showAugmentedUI && (
          <motion.div 
            className="absolute bottom-20 left-20 z-30 pointer-events-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button 
              className={`h-12 px-4 rounded-full ${scanActive ? 'bg-[#F59E0B]' : 'glass-effect'} flex items-center`}
              onClick={activateScan}
              disabled={scanActive}
            >
              <svg className={`h-5 w-5 mr-2 ${scanActive ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="60"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDashoffset="120" strokeDasharray="60"/>
              </svg>
              <span className="text-white text-sm font-medium">
                {scanActive ? 'Scanning...' : 'Scan Area'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scanning overlay */}
      <AnimatePresence>
        {scanActive && (
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Scanning line */}
            <motion.div 
              className="absolute left-0 right-0 h-1 bg-[#7C3AED]"
              style={{ 
                top: `${scanProgress}%`,
                boxShadow: '0 0 10px rgba(124, 58, 237, 0.7)'
              }}
            />
            
            {/* Scan percentage */}
            <div 
              className="absolute right-10 text-white text-sm"
              style={{ top: `${scanProgress}%` }}
            >
              {scanProgress}%
            </div>
            
            {/* Scan details */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 glass-effect px-4 py-2 rounded-lg">
              <div className="text-xs text-white">Area Scan in Progress</div>
              <div className="text-xs text-gray-300">Detecting Risk Patterns and Safe Zones</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info points and connectors */}
      <AnimatePresence>
        {showAugmentedUI && infoPoints.map((point, index) => (
          <motion.div 
            key={`${point.label}-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: point.x,
              top: point.y,
              zIndex: 25
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Connector line */}
            <div 
              className="absolute h-10 w-px"
              style={{ 
                backgroundColor: getPointColor(point.type),
                left: 5,
                bottom: 10
              }}
            />
            
            {/* Point marker */}
            <div 
              className={`relative h-3 w-3 rounded-full`}
              style={{ backgroundColor: getPointColor(point.type) }}
            >
              {point.pulse && (
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      `0 0 0 0 ${getPointColor(point.type)}80`,
                      `0 0 0 8px ${getPointColor(point.type)}00`
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            
            {/* Label */}
            <div 
              className="absolute top-4 left-0 glass-effect px-2 py-1 rounded-md whitespace-nowrap text-xs"
              style={{ borderLeft: `2px solid ${getPointColor(point.type)}` }}
            >
              {point.label}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Futuristic HUD elements */}
      <AnimatePresence>
        {showAugmentedUI && (
          <>
            {/* Top left corner decoration */}
            <motion.div 
              className="absolute top-10 left-10 w-20 h-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute top-0 left-0 w-10 h-1 bg-[#7C3AED]"></div>
              <div className="absolute top-0 left-0 w-1 h-10 bg-[#7C3AED]"></div>
            </motion.div>
            
            {/* Bottom right corner decoration */}
            <motion.div 
              className="absolute bottom-10 right-10 w-20 h-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute bottom-0 right-0 w-10 h-1 bg-[#7C3AED]"></div>
              <div className="absolute bottom-0 right-0 w-1 h-10 bg-[#7C3AED]"></div>
            </motion.div>
            
            {/* Grid overlay */}
            <svg className="absolute inset-0 z-10 pointer-events-none opacity-10" width="100%" height="100%">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7C3AED" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
            
            {/* Circular reticle around user position */}
            {progress > 0 && (
              <motion.div 
                className="absolute pointer-events-none"
                style={{
                  left: dimensions.width * (0.25 + (progress / 100) * 0.5),
                  top: dimensions.height * (0.25 + (progress / 100) * 0.5),
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="h-16 w-16 rounded-full border-2 border-dashed border-[#7C3AED]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-[#7C3AED]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuturisticOverlay;