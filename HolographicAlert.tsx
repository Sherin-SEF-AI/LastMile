import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';

interface HolographicAlertProps {
  show?: boolean;
  message?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  duration?: number;
  onClose?: () => void;
}

const HolographicAlert: React.FC<HolographicAlertProps> = ({
  show: externalShow,
  message: externalMessage,
  type: externalType = 'info',
  duration = 5000,
  onClose
}) => {
  const { isEmergency, safetyStatus } = useSimulation();
  const [internalShow, setInternalShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'danger' | 'success'>('info');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const alertRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle externally controlled alerts
  useEffect(() => {
    if (externalShow !== undefined) {
      setInternalShow(externalShow);
    }
    
    if (externalMessage) {
      setMessage(externalMessage);
    }
    
    if (externalType) {
      setType(externalType);
    }
  }, [externalShow, externalMessage, externalType]);
  
  // Automatically generate alerts based on safety status changes
  useEffect(() => {
    if (isEmergency) {
      showAlert('EMERGENCY PROTOCOL ACTIVATED', 'danger');
    } else if (safetyStatus === 'alert') {
      showAlert('SAFETY ALERT: Potential threat detected', 'warning');
    } else if (safetyStatus === 'monitoring') {
      showAlert('MONITORING: Unusual activity detected', 'info');
    }
  }, [isEmergency, safetyStatus]);
  
  // Automatically hide alert after duration
  useEffect(() => {
    if (internalShow && duration > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setInternalShow(false);
        if (onClose) onClose();
      }, duration);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalShow, duration, onClose]);
  
  // Handle 3D hover effect
  useEffect(() => {
    if (!alertRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!alertRef.current) return;
      
      const box = alertRef.current.getBoundingClientRect();
      const boxCenterX = box.left + box.width / 2;
      const boxCenterY = box.top + box.height / 2;
      
      const angleX = (e.clientY - boxCenterY) / 20;
      const angleY = (boxCenterX - e.clientX) / 20;
      
      setRotation({ x: angleX, y: angleY });
    };
    
    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // Public method to show alert
  const showAlert = (alertMessage: string, alertType: 'info' | 'warning' | 'danger' | 'success' = 'info') => {
    setMessage(alertMessage);
    setType(alertType);
    setInternalShow(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setInternalShow(false);
        if (onClose) onClose();
      }, duration);
    }
  };
  
  // Close the alert
  const handleClose = () => {
    setInternalShow(false);
    if (onClose) onClose();
  };
  
  const getAlertColor = () => {
    switch (type) {
      case 'danger': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'success': return '#10B981';
      default: return '#7C3AED';
    }
  };
  
  const getIconPath = () => {
    switch (type) {
      case 'danger':
        return (
          <path 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        );
      case 'warning':
        return (
          <path 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        );
      case 'success':
        return (
          <path 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        );
      default:
        return (
          <path 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        );
    }
  };
  
  return (
    <AnimatePresence>
      {internalShow && (
        <motion.div
          ref={alertRef}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 perspective"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <motion.div
            className="holographic-effect rounded-lg overflow-hidden min-w-[300px] max-w-md"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            {/* Alert Core */}
            <div className="p-4 relative">
              {/* Border Accent */}
              <div 
                className="absolute inset-0 border-2 rounded-lg opacity-50"
                style={{ borderColor: getAlertColor() }}
              ></div>
              
              {/* Holographic Elements - Lines */}
              <div className="absolute -top-1 left-0 right-0 h-8 flex justify-between space-x-1 opacity-30 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: getAlertColor(), height: `${Math.random() * 100}%` }}
                    animate={{ 
                      height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1 + Math.random() * 2,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  />
                ))}
              </div>
              
              {/* Scanline */}
              <motion.div 
                className="absolute inset-0 z-30 overflow-hidden"
                style={{ opacity: 0.1 }}
              >
                <motion.div
                  className="h-px w-full"
                  style={{ backgroundColor: getAlertColor() }}
                  animate={{ 
                    y: [-10, 100],
                    opacity: [0.8, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </motion.div>
              
              {/* Alert Content */}
              <div className="flex items-start space-x-3">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getAlertColor(), opacity: 0.9 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    {getIconPath()}
                  </svg>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div 
                      className="text-xs font-bold tracking-wider uppercase"
                      style={{ color: getAlertColor() }}
                    >
                      {type === 'danger' ? 'Alert' : 
                       type === 'warning' ? 'Warning' : 
                       type === 'success' ? 'Success' : 'Information'}
                    </div>
                    
                    <motion.button 
                      className="text-gray-400 hover:text-white"
                      whileHover={{ scale: 1.2 }}
                      onClick={handleClose}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  </div>
                  
                  {/* Message with typing effect */}
                  <div className="mt-1 text-white relative">
                    <span className="animate-glitch" data-text={message}>
                      {message}
                    </span>
                    <span className="absolute right-0 bottom-0 inline-block w-1 h-4 bg-white">
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-full h-full"
                      />
                    </span>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="mt-2 flex justify-between items-center">
                    {/* Timestamp */}
                    <div className="text-xs text-gray-300">
                      {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {type === 'danger' && (
                        <button 
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          onClick={handleClose}
                        >
                          Acknowledge
                        </button>
                      )}
                      
                      {(type === 'warning' || type === 'info') && (
                        <button 
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          onClick={handleClose}
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar for auto-closing */}
            {duration > 0 && (
              <motion.div 
                className="h-1"
                style={{ backgroundColor: getAlertColor() }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HolographicAlert;