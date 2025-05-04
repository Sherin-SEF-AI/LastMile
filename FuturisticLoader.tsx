import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FuturisticLoaderProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({ 
  isLoading, 
  onLoadingComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing systems...');
  
  useEffect(() => {
    if (!isLoading) return;
    
    const loadingSteps = [
      { progress: 10, text: 'Loading security protocols...' },
      { progress: 25, text: 'Calibrating threat assessment module...' },
      { progress: 40, text: 'Establishing network connection...' },
      { progress: 55, text: 'Analyzing environmental variables...' },
      { progress: 70, text: 'Mapping safe route corridors...' },
      { progress: 85, text: 'Connecting to emergency response systems...' },
      { progress: 95, text: 'Initializing SEF protection layer...' },
      { progress: 100, text: 'System ready' }
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setStatusText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onLoadingComplete) onLoadingComplete();
        }, 1000);
      }
    }, 700);
    
    return () => clearInterval(interval);
  }, [isLoading, onLoadingComplete]);
  
  const digits = String(progress).padStart(3, '0');
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="fixed inset-0 bg-[#121225] z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }
          }}
        >
          <div className="w-full max-w-2xl px-8">
            {/* Main loader visual */}
            <div className="relative mb-24">
              {/* Large percentage in background */}
              <motion.div 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[12vw] font-bold text-[#7C3AED] opacity-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {digits}
              </motion.div>
              
              {/* SEF Logo */}
              <div className="flex items-center mb-16">
                <motion.div 
                  className="h-16 w-16 border-2 border-[#7C3AED] rounded-lg flex items-center justify-center relative"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 90 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <motion.div 
                    className="h-10 w-10 bg-[#7C3AED]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                </motion.div>
                <div className="ml-4">
                  <motion.h1 
                    className="text-2xl font-bold text-white tracking-wider"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    SEF PROTECTION
                  </motion.h1>
                  <motion.p 
                    className="text-[#7C3AED] text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    Last Mile Journey Security
                  </motion.p>
                </div>
              </div>
              
              {/* Glitchy loader text */}
              <div className="mb-6 relative">
                <motion.h2 
                  className="text-white text-lg font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {statusText}
                </motion.h2>
                
                {/* Animated scanline */}
                <motion.div 
                  className="absolute h-px w-full bg-[#7C3AED] top-1/2 left-0"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ 
                    scaleX: [0, 1, 0],
                    opacity: [0, 0.7, 0],
                    x: ['-100%', '100%', '100%']
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </div>
              
              {/* Progress bar with segments */}
              <div className="h-1.5 w-full bg-[#2D2A5A] rounded overflow-hidden mb-3">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#DD62ED]"
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%']
                  }}
                  transition={{ 
                    width: { duration: 0.5, ease: "easeOut" },
                    backgroundPosition: { 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "linear" 
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <div>INITIALIZING [{digits}%]</div>
                <div>SEF-LM-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-12 left-0 w-full">
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div 
                      key={i}
                      className="h-1 bg-[#7C3AED]"
                      style={{ width: `${10 + i * 5}px` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.1 * i,
                        repeat: Infinity,
                        repeatType: "reverse",
                        repeatDelay: 1
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Binary data visualization */}
              <div className="absolute -bottom-24 left-0 w-full overflow-hidden h-8">
                <div className="flex font-mono text-[10px] text-[#7C3AED] opacity-40">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ 
                        duration: 0.2, 
                        delay: i * 0.03, 
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      {Math.random() > 0.5 ? '1' : '0'}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Scrolling text at bottom */}
          <div className="fixed bottom-0 w-full overflow-hidden py-2 border-t border-[#2D2A5A]">
            <motion.div 
              className="whitespace-nowrap text-xs text-[#7C3AED]"
              animate={{ x: [0, -1000] }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              SYSTEM: ACTIVE • NETWORK STATUS: SECURE • MONITORING: ENABLED • THREAT LEVEL: LOW • EMERGENCY PROTOCOLS: STANDBY • SAFE CORRIDORS: MAPPED • RESPONSE UNITS: 8 ACTIVE • ENVIRONMENT: NORMAL • SYSTEM: ACTIVE • NETWORK STATUS: SECURE • MONITORING: ENABLED • THREAT LEVEL: LOW • EMERGENCY PROTOCOLS: STANDBY • SAFE CORRIDORS: MAPPED
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FuturisticLoader;