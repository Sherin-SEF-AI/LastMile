import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';

interface Compass3DProps {
  size?: number;
  heading?: number; // 0-360 degrees
}

const Compass3D: React.FC<Compass3DProps> = ({ 
  size = 150,
  heading: externalHeading
}) => {
  const { isEmergency } = useSimulation();
  const [auto, setAuto] = useState(externalHeading === undefined);
  const [internalHeading, setInternalHeading] = useState(externalHeading || 0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  
  // Calculate perspective transform values
  const perspective = size * 1.5;
  const scale = useTransform(rotateX, [-30, 0, 30], [0.9, 1, 0.9]);
  
  // Auto-rotate when in auto mode
  useEffect(() => {
    if (!auto) return;
    
    const interval = setInterval(() => {
      setInternalHeading(prev => {
        const next = prev + 1;
        return next >= 360 ? next - 360 : next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [auto]);
  
  // Update internal heading when external heading changes
  useEffect(() => {
    if (externalHeading !== undefined) {
      setAuto(false);
      setInternalHeading(externalHeading);
    }
  }, [externalHeading]);
  
  // Handle 3D tilt effect on mouse move
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position from -1 to 1
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);
      
      rotateY.set(normalizedX * 20);
      rotateX.set(normalizedY * -20);
    };
    
    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [rotateX, rotateY]);
  
  // Update Z rotation based on heading
  useEffect(() => {
    rotateZ.set(internalHeading);
  }, [internalHeading, rotateZ]);
  
  // Get cardinal direction
  const getDirection = () => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((internalHeading % 360) / 45) % 8;
    return directions[index];
  };
  
  // Format heading as degrees
  const formatHeading = () => {
    return `${Math.round(internalHeading)}°`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ 
        width: size, 
        height: size,
        perspective: `${perspective}px` 
      }}
    >
      {/* Container for 3D transforms */}
      <motion.div
        className="w-full h-full relative"
        style={{
          rotateX,
          rotateY,
          rotateZ,
          scale,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
      >
        {/* Compass Base (Outer ring) */}
        <div 
          className={`absolute inset-0 rounded-full border-2 ${
            isEmergency ? 'border-[#EF4444]' : 'border-[#7C3AED]'
          }`}
          style={{
            boxShadow: isEmergency 
              ? '0 0 10px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(239, 68, 68, 0.5)' 
              : '0 0 10px rgba(124, 58, 237, 0.6), inset 0 0 8px rgba(124, 58, 237, 0.5)'
          }}
        />
        
        {/* Compass Background */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(30, 27, 75, 0.9) 0%, rgba(18, 18, 36, 0.95) 100%)'
          }}
        />
        
        {/* Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-gray-700 opacity-40" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-gray-700 opacity-40" />
        </div>
        
        {/* Azimuth Ring */}
        <div className="absolute inset-2">
          {[...Array(72)].map((_, i) => {
            const angle = (i * 5) * (Math.PI / 180);
            const isMainDirection = i % 18 === 0; // 0, 90, 180, 270 degrees
            const isSubDirection = i % 9 === 0; // 45, 135, 225, 315 degrees
            
            const lineLength = isMainDirection ? 8 : isSubDirection ? 6 : 4;
            const thickness = isMainDirection ? 1.5 : isSubDirection ? 1 : 0.5;
            const color = isMainDirection 
              ? (isEmergency ? '#EF4444' : '#7C3AED') 
              : isSubDirection ? '#94A3B8' : '#4B5563';
            
            const x1 = (size / 2) * 0.9 * Math.sin(angle);
            const y1 = (size / 2) * 0.9 * -Math.cos(angle);
            const x2 = (size / 2 - lineLength) * 0.9 * Math.sin(angle);
            const y2 = (size / 2 - lineLength) * 0.9 * -Math.cos(angle);
            
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  height: '1px',
                  width: `${lineLength}px`,
                  backgroundColor: color,
                  left: `calc(50% + ${x2}px)`,
                  top: `calc(50% + ${y2}px)`,
                  transform: `rotate(${angle * (180 / Math.PI)}deg)`,
                  transformOrigin: '0 0'
                }}
              />
            );
          })}
        </div>
        
        {/* Compass Rose */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-1/2 h-1/2">
            {/* North */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ color: isEmergency ? '#EF4444' : '#7C3AED' }}
            >
              <div className="text-xs font-bold">N</div>
            </div>
            
            {/* East */}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-gray-400">
              <div className="text-xs font-bold">E</div>
            </div>
            
            {/* South */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-gray-400">
              <div className="text-xs font-bold">S</div>
            </div>
            
            {/* West */}
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400">
              <div className="text-xs font-bold">W</div>
            </div>
            
            {/* Directional Arrow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className={`w-[1px] h-3/4 ${isEmergency ? 'bg-[#EF4444]' : 'bg-[#7C3AED]'}`}
                style={{ 
                  clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
                  transformOrigin: 'bottom center',
                  transform: 'translateY(-40%) rotateZ(180deg)'
                }}
              />
              <div 
                className="w-[1px] h-3/4 bg-gray-500"
                style={{ 
                  clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
                  transformOrigin: 'top center',
                  transform: 'translateY(40%)'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Center Point */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`w-3 h-3 rounded-full ${isEmergency ? 'bg-[#EF4444]' : 'bg-[#7C3AED]'}`}
            style={{
              boxShadow: isEmergency 
                ? '0 0 5px rgba(239, 68, 68, 0.8)' 
                : '0 0 5px rgba(124, 58, 237, 0.8)'
            }}
          />
        </div>
        
        {/* Digital Readout (locked at bottom) */}
        <div 
          className="absolute left-0 right-0 bottom-3 flex flex-col items-center justify-center"
          style={{ transform: 'translateZ(1px)' }}
        >
          <div 
            className={`text-xs font-bold ${isEmergency ? 'text-[#EF4444]' : 'text-[#7C3AED]'}`}
          >
            {getDirection()}
          </div>
          <div className="text-[10px] text-gray-400">
            {formatHeading()}
          </div>
        </div>
        
        {/* Sensor Data Toggle Button */}
        <button
          className="absolute top-3 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-400 bg-gray-800 rounded px-1 py-0.5 hover:bg-gray-700"
          onClick={() => setAuto(!auto)}
          style={{ transform: 'translateZ(1px)' }}
        >
          {auto ? 'AUTO' : 'MANU'}
        </button>
      </motion.div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <motion.div
          className="absolute left-0 right-0 h-[2px] opacity-30"
          style={{
            background: isEmergency 
              ? 'linear-gradient(90deg, transparent, #EF4444, transparent)' 
              : 'linear-gradient(90deg, transparent, #7C3AED, transparent)'
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    </div>
  );
};

export default Compass3D;