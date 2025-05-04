import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';
import { 
  AlertTriangle, 
  MessageSquare, 
  Settings, 
  Shield, 
  X, 
  PhoneCall,
  MapPin,
  AlertCircle,
  UserCheck,
  Signal,
  ZapOff,
  Radio
} from 'lucide-react';

interface MenuOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action?: () => void;
  submenu?: MenuOption[];
}

const AdvancedControls = () => {
  const { 
    transportMode, 
    setTransportMode, 
    triggerEmergency,
    isEmergency,
    resetEmergency,
    safetyStatus
  } = useSimulation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'limited' | 'offline'>('connected');
  const [batteryLevel, setBatteryLevel] = useState(72);

  // Simulate random connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.8) {
        setConnectionStatus('connected');
      } else if (random < 0.95) {
        setConnectionStatus('limited');
      } else {
        setConnectionStatus('offline');
      }
      
      // Simulate battery drain
      setBatteryLevel(prev => {
        const newLevel = prev - 0.2;
        return newLevel < 5 ? 100 : newLevel;
      });
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Position the menu based on main button position
  useEffect(() => {
    if (mainButtonRef.current) {
      const rect = mainButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        x: window.innerWidth - rect.right,
        y: rect.top
      });
    }
  }, [isMenuOpen]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen && 
        mainButtonRef.current && 
        !mainButtonRef.current.contains(e.target as Node)
      ) {
        const menuElement = document.getElementById('floating-menu');
        if (menuElement && !menuElement.contains(e.target as Node)) {
          setIsMenuOpen(false);
          setActiveMenu(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);
  
  const menuOptions: MenuOption[] = [
    {
      id: 'emergency',
      icon: <AlertTriangle className="h-5 w-5" />,
      label: isEmergency ? 'Cancel Emergency' : 'Emergency',
      color: isEmergency ? '#7C3AED' : '#EF4444',
      action: isEmergency ? resetEmergency : triggerEmergency
    },
    {
      id: 'communication',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Communication',
      color: '#7C3AED',
      submenu: [
        {
          id: 'message',
          icon: <MessageSquare className="h-4 w-4" />,
          label: 'Send Message',
          color: '#7C3AED'
        },
        {
          id: 'call',
          icon: <PhoneCall className="h-4 w-4" />,
          label: 'Emergency Call',
          color: '#EF4444'
        },
        {
          id: 'radio',
          icon: <Radio className="h-4 w-4" />,
          label: 'Radio Channel',
          color: '#10B981'
        }
      ]
    },
    {
      id: 'transport',
      icon: <MapPin className="h-5 w-5" />,
      label: 'Transport Mode',
      color: '#10B981',
      submenu: [
        {
          id: 'walking',
          icon: <i className="ri-walk-line h-4 w-4 text-white"></i>,
          label: 'Walking',
          color: transportMode === 'walking' ? '#7C3AED' : '#64748B',
          action: () => setTransportMode('walking')
        },
        {
          id: 'auto',
          icon: <i className="ri-car-line h-4 w-4 text-white"></i>,
          label: 'Auto',
          color: transportMode === 'auto' ? '#7C3AED' : '#64748B',
          action: () => setTransportMode('auto')
        },
        {
          id: 'cab',
          icon: <i className="ri-taxi-line h-4 w-4 text-white"></i>,
          label: 'Cab',
          color: transportMode === 'cab' ? '#7C3AED' : '#64748B',
          action: () => setTransportMode('cab')
        }
      ]
    },
    {
      id: 'settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      color: '#64748B',
      submenu: [
        {
          id: 'security',
          icon: <Shield className="h-4 w-4" />,
          label: 'Security Level',
          color: '#7C3AED'
        },
        {
          id: 'verify',
          icon: <UserCheck className="h-4 w-4" />,
          label: 'Identity Verify',
          color: '#10B981'
        },
        {
          id: 'signal',
          icon: <Signal className="h-4 w-4" />,
          label: 'Signal Boost',
          color: '#F59E0B'
        },
        {
          id: 'power',
          icon: <ZapOff className="h-4 w-4" />,
          label: 'Power Save',
          color: '#64748B'
        }
      ]
    }
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setActiveMenu(null);
    }
  };
  
  const handleMenuItemClick = (option: MenuOption) => {
    if (option.submenu) {
      setActiveMenu(activeMenu === option.id ? null : option.id);
    } else if (option.action) {
      option.action();
      setIsMenuOpen(false);
      setActiveMenu(null);
    }
  };
  
  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Main Action Button */}
      <motion.button
        ref={mainButtonRef}
        className={`h-14 w-14 rounded-full relative ${
          isEmergency 
            ? 'bg-[#EF4444]' 
            : safetyStatus === 'alert'
              ? 'bg-[#F59E0B]'
              : 'bg-[#7C3AED]'
        } flex items-center justify-center shadow-lg cyber-button`}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isEmergency 
              ? [
                  '0 0 0 0 rgba(239, 68, 68, 0.7)',
                  '0 0 0 10px rgba(239, 68, 68, 0)',
                ] 
              : safetyStatus === 'alert'
                ? [
                    '0 0 0 0 rgba(245, 158, 11, 0.7)',
                    '0 0 0 10px rgba(245, 158, 11, 0)',
                  ]
                : [
                    '0 0 0 0 rgba(124, 58, 237, 0.7)',
                    '0 0 0 10px rgba(124, 58, 237, 0)',
                  ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {isMenuOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Shield className="h-6 w-6 text-white" />
        )}

        {/* Status Indicator */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white">
          {isEmergency ? (
            <span className="animate-pulse text-[#EF4444] font-semibold">● EMERGENCY</span>
          ) : (
            <span className={`${
              safetyStatus === 'safe' 
                ? 'text-[#10B981]' 
                : safetyStatus === 'monitoring' 
                  ? 'text-[#F59E0B]' 
                  : 'text-[#EF4444]'
            }`}>
              ● {safetyStatus.toUpperCase()}
            </span>
          )}
        </div>
      </motion.button>
      
      {/* System Status Bar - Shows at the bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-[#121225] h-6 border-t border-[#2D2A5A] flex items-center px-4 z-30">
        <div className="flex justify-between w-full text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {connectionStatus === 'connected' && (
                <Signal className="h-3 w-3 text-[#10B981] mr-1" />
              )}
              {connectionStatus === 'limited' && (
                <Signal className="h-3 w-3 text-[#F59E0B] mr-1" />
              )}
              {connectionStatus === 'offline' && (
                <ZapOff className="h-3 w-3 text-[#EF4444] mr-1" />
              )}
              <span className="text-[#94A3B8]">
                {connectionStatus === 'connected' && 'NETWORK: SEF-SECURE'}
                {connectionStatus === 'limited' && 'NETWORK: LIMITED'}
                {connectionStatus === 'offline' && 'NETWORK: OFFLINE'}
              </span>
            </div>
            
            <div className="hidden sm:flex items-center">
              <Radio className="h-3 w-3 text-[#7C3AED] mr-1" />
              <span className="text-[#94A3B8]">RESPONDERS: 5 ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center animate-dataflow px-2 rounded">
              <AlertCircle className="h-3 w-3 text-[#7C3AED] mr-1" />
              <span className="text-[#94A3B8]">DATA STREAM ACTIVE</span>
            </div>
            
            <div className="hidden sm:flex items-center">
              <div className="w-6 h-3 border border-[#94A3B8] rounded-sm overflow-hidden flex">
                <div 
                  className={`h-full ${
                    batteryLevel > 50 
                      ? 'bg-[#10B981]' 
                      : batteryLevel > 20 
                        ? 'bg-[#F59E0B]' 
                        : 'bg-[#EF4444]'
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <span className="text-[#94A3B8] ml-1">{Math.round(batteryLevel)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="floating-menu"
            className="absolute right-16 bottom-0 glass-effect rounded-lg overflow-hidden p-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-1 min-w-[200px]">
              {menuOptions.map((option) => (
                <div key={option.id} className="relative">
                  <motion.button
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-[#2D2A5A] transition-colors`}
                    whileHover={{ x: 5 }}
                    onClick={() => handleMenuItemClick(option)}
                  >
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: option.color }}>
                      {option.icon}
                    </div>
                    <span className="text-white">{option.label}</span>
                    
                    {option.submenu && (
                      <motion.span
                        className="ml-auto text-[#94A3B8]"
                        animate={{ rotate: activeMenu === option.id ? 90 : 0 }}
                      >
                        {'>'}
                      </motion.span>
                    )}
                  </motion.button>
                  
                  {/* Submenu */}
                  <AnimatePresence>
                    {option.submenu && activeMenu === option.id && (
                      <motion.div
                        className="absolute top-0 right-full mr-2 bg-[#191930] rounded-lg overflow-hidden p-2 border border-[#2D2A5A] w-48"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="text-xs text-[#94A3B8] uppercase mb-2 px-2">{option.label} Options</div>
                        <div className="flex flex-col space-y-1">
                          {option.submenu.map((subOption) => (
                            <motion.button
                              key={subOption.id}
                              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#2D2A5A]"
                              whileHover={{ x: 5 }}
                              onClick={() => subOption.action && subOption.action()}
                            >
                              <div 
                                className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center`}
                                style={{ backgroundColor: subOption.color }}
                              >
                                {subOption.icon}
                              </div>
                              <span className="text-white text-sm">{subOption.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedControls;