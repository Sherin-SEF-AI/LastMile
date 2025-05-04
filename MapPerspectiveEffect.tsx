import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface MapPerspectiveEffectProps {
  children: React.ReactNode;
  intensity?: number;
  active?: boolean;
}

const MapPerspectiveEffect: React.FC<MapPerspectiveEffectProps> = ({
  children,
  intensity = 10,
  active = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const controls = useAnimation();

  // Track mouse position
  useEffect(() => {
    if (!active) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Get container dimensions and position
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate mouse position relative to the center of the container
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position (-1 to 1)
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);
      
      // Set rotation (with intensity factor and inversion for correct direction)
      setRotateX(-normalizedY * intensity);
      setRotateY(normalizedX * intensity);
      
      // Track mouse position
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      // Reset moving state after delay
      const moveTimeoutId = setTimeout(() => setIsMoving(false), 300);
      
      return () => clearTimeout(moveTimeoutId);
    };
    
    const handleMouseLeave = () => {
      // Animate back to flat position
      controls.start({
        rotateX: 0,
        rotateY: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity, active, controls]);
  
  // Update animations based on mouse movement
  useEffect(() => {
    if (!active) {
      controls.start({
        rotateX: 0,
        rotateY: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
      });
      return;
    }
    
    controls.start({
      rotateX,
      rotateY,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  }, [rotateX, rotateY, active, controls]);
  
  // Calculate light effect based on mouse position
  const getLightEffect = () => {
    if (!containerRef.current) return '';
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate percentage of mouse position across container
    const percentX = (mousePosition.x - rect.left) / rect.width;
    const percentY = (mousePosition.y - rect.top) / rect.height;
    
    // Create gradient that follows mouse
    return `radial-gradient(
      circle at ${percentX * 100}% ${percentY * 100}%, 
      rgba(124, 58, 237, 0.15), 
      rgba(16, 26, 82, 0.0) 40%
    )`;
  };
  
  return (
    <div
      ref={containerRef}
      className="perspective-container relative w-full h-full rounded-lg overflow-hidden"
      style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={controls}
        style={{ 
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {children}
        
        {/* Ambient light effect */}
        {active && isMoving && (
          <div 
            className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
            style={{ 
              background: getLightEffect(),
              opacity: isMoving ? 0.8 : 0
            }}
          />
        )}
        
        {/* Reflection/glass edge effect */}
        {active && (
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)',
              boxShadow: 'inset 0 0 20px rgba(124, 58, 237, 0.1)'
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default MapPerspectiveEffect;