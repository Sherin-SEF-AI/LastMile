import { useEffect, useState, useRef } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import ResponderCard from "./ResponderCard";
import TransportCard from "./TransportCard";
import ThreatDetection from "./ThreatDetection";
import VoiceAlertSystem from "./VoiceAlertSystem";
import JourneyAnalytics from "./JourneyAnalytics";
import CommunicationModule from "./CommunicationModule";
import ParticleSystem from "./ParticleSystem";
import RiskHeatmap from "./RiskHeatmap";
import FuturisticOverlay from "./FuturisticOverlay";
import MapPerspectiveEffect from "./MapPerspectiveEffect";
import { Sun, Moon, Map, MapPin, Navigation } from "lucide-react";

const MapVisualization = () => {
  const { 
    environmentMode, 
    isEmergency, 
    progress, 
    toggleEnvironmentMode,
    safetyStatus,
    transportMode
  } = useSimulation();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [userPosition, setUserPosition] = useState({ left: "45%", top: "35%" });
  const [showResponderCard, setShowResponderCard] = useState(false);
  const [showEmergencyResponse, setShowEmergencyResponse] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapViewType, setMapViewType] = useState<'satellite' | 'street'>('satellite');
  const [isMovingMap, setIsMovingMap] = useState(false);
  const [responderPositions, setResponderPositions] = useState<Array<{id: number, x: number, y: number}>>([
    { id: 1, x: 55, y: 45 },
    { id: 2, x: 40, y: 50 },
    { id: 3, x: 60, y: 60 }
  ]);
  
  // Update user position based on journey progress with smoother path
  useEffect(() => {
    if (progress <= 0) {
      setUserPosition({ left: "25%", top: "25%" });
    } else if (progress >= 100) {
      setUserPosition({ left: "75%", top: "75%" });
    } else {
      // Create a more natural curved path using Bezier calculations
      const t = progress / 100;
      
      // Start and end points
      const startX = 25;
      const startY = 25;
      const endX = 75;
      const endY = 75;
      
      // Control points for the curve
      const cp1x = 35;
      const cp1y = 40;
      const cp2x = 65;
      const cp2y = 50;
      
      // Cubic Bezier formula
      const x = Math.pow(1-t, 3) * startX + 
               3 * Math.pow(1-t, 2) * t * cp1x + 
               3 * (1-t) * Math.pow(t, 2) * cp2x + 
               Math.pow(t, 3) * endX;
               
      const y = Math.pow(1-t, 3) * startY + 
               3 * Math.pow(1-t, 2) * t * cp1y + 
               3 * (1-t) * Math.pow(t, 2) * cp2y + 
               Math.pow(t, 3) * endY;
      
      setUserPosition({ left: `${x}%`, top: `${y}%` });
    }
    
    // Show responder card when progress is around 30%
    if (progress >= 30 && progress < 40) {
      setShowResponderCard(true);
    } else if (progress >= 60) {
      setShowResponderCard(false);
    }
    
    // Move responders toward user in emergency or alerts
    if (safetyStatus === "alert" || isEmergency) {
      const userX = 25 + (progress / 100) * 50;
      const userY = 25 + (progress / 100) * 50;
      
      // Make responders move toward user
      setResponderPositions(prev => 
        prev.map(responder => {
          // Calculate direction vector
          const dirX = userX - responder.x;
          const dirY = userY - responder.y;
          const length = Math.sqrt(dirX * dirX + dirY * dirY);
          
          // Normalize and scale (move faster during emergency)
          const speed = isEmergency ? 0.15 : 0.05;
          const normX = length ? dirX / length * speed : 0;
          const normY = length ? dirY / length * speed : 0;
          
          return {
            ...responder,
            x: responder.x + normX,
            y: responder.y + normY
          };
        })
      );
    }
  }, [progress, safetyStatus, isEmergency]);
  
  // Handle emergency state
  useEffect(() => {
    if (isEmergency) {
      // Zoom in on emergency
      setMapZoom(1.2);
      
      setTimeout(() => {
        setShowEmergencyResponse(true);
      }, 1500);
    } else {
      setMapZoom(1);
      setShowEmergencyResponse(false);
    }
  }, [isEmergency]);
  
  // Simulated map movement
  useEffect(() => {
    if (isMovingMap && mapRef.current) {
      const interval = setInterval(() => {
        // Slight random movements to simulate GPS micromovements
        const randomX = (Math.random() - 0.5) * 0.2;
        const randomY = (Math.random() - 0.5) * 0.2;
        
        mapRef.current!.style.transform = `translate(${randomX}px, ${randomY}px)`;
      }, 300);
      
      return () => clearInterval(interval);
    } else if (mapRef.current) {
      mapRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, [isMovingMap]);
  
  // Toggle map view type
  const toggleMapViewType = () => {
    setMapViewType(prev => prev === 'satellite' ? 'street' : 'satellite');
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Apply 3D Perspective Effect */}
      <MapPerspectiveEffect intensity={5} active={!isEmergency}>
        <div className="w-full h-full relative">
          {/* Map Background */}
          <motion.div 
            ref={mapRef}
            className="map-container absolute inset-0 z-0"
            animate={{ 
              filter: environmentMode === "day" 
                ? "saturate(0.8) brightness(0.8)" 
                : "saturate(0.6) brightness(0.4) hue-rotate(30deg)",
              scale: mapZoom
            }}
            transition={{ duration: 0.8 }}
            style={{ 
              backgroundImage: mapViewType === 'satellite' 
                ? "url('https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=2000&auto=format&fit=crop')"
                : "url('https://images.unsplash.com/photo-1591982830278-c6294eb02c7b?q=80&w=2000&auto=format&fit=crop')"
            }}
          />
        </div>
      </MapPerspectiveEffect>
      
      {/* Advanced Visual Effects */}
      <ParticleSystem count={80} intensity={1.2} />
      <RiskHeatmap />
      
      {/* Map Overlay */}
      <motion.div 
        className="map-overlay absolute inset-0 z-10"
        animate={{ 
          backgroundColor: isEmergency 
            ? "rgba(239, 68, 68, 0.15)" 
            : safetyStatus === "alert"
              ? "rgba(245, 158, 11, 0.1)"
              : "rgba(30, 27, 75, 0.5)"
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Map Elements */}
      <div className="absolute inset-0 z-20">
        {/* Starting Point Marker (ITPL) */}
        <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="h-3 w-3 bg-[#7C3AED] rounded-full"></div>
          <motion.div 
            className="absolute top-0 left-0 h-3 w-3 bg-[#7C3AED] rounded-full opacity-75"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-[#2D2A5A] bg-opacity-80 px-2 py-0.5 rounded text-xs whitespace-nowrap">
            ITPL Tech Park
          </div>
        </div>

        {/* Destination Marker (Brigade Gateway) */}
        <div className="absolute right-1/4 bottom-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="h-3 w-3 bg-[#10B981] rounded-full"></div>
          <motion.div 
            className="absolute top-0 left-0 h-3 w-3 bg-[#10B981] rounded-full opacity-75"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-[#2D2A5A] bg-opacity-80 px-2 py-0.5 rounded text-xs whitespace-nowrap">
            Brigade Gateway
          </div>
        </div>

        {/* User Current Position */}
        <motion.div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: userPosition.left, 
            top: userPosition.top 
          }}
          animate={{ 
            x: [0, 2, -2, 0],
            y: [0, -2, 2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          {/* User Direction Arrow */}
          <motion.div 
            className="absolute -top-5 left-1/2 transform -translate-x-1/2 h-4 w-4"
            animate={{ 
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-white"></div>
          </motion.div>
          
          {/* User Position Dot */}
          <motion.div
            className="h-5 w-5 bg-white rounded-full border-2 relative z-30"
            style={{
              borderColor: safetyStatus === "safe" ? "#10B981" : 
                        safetyStatus === "monitoring" ? "#F59E0B" : "#EF4444"
            }}
            animate={{
              borderWidth: [2, 3, 2],
              boxShadow: [
                `0 0 0 0 rgba(124, 58, 237, 0)`,
                `0 0 0 4px rgba(124, 58, 237, 0.3)`,
                `0 0 0 0 rgba(124, 58, 237, 0)`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Transport Mode Indicator */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2D2A5A] rounded-full h-5 w-5 flex items-center justify-center">
            <i className={`${
              transportMode === "walking" ? "ri-walk-line" : 
              transportMode === "auto" ? "ri-car-line" : "ri-taxi-line"
            } text-white text-xs`}></i>
          </div>
          
          {/* Safety Bubble */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 safety-bubble rounded-full -z-10"
            style={{
              background: safetyStatus === "safe" 
                ? "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)" 
                : safetyStatus === "monitoring"
                  ? "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0) 70%)"
                  : "radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0) 70%)"
            }}
            animate={{ 
              height: isEmergency ? [100, 130, 100] : [80, 100, 80],
              width: isEmergency ? [100, 130, 100] : [80, 100, 80],
              opacity: isEmergency ? [0.8, 1, 0.8] : [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: isEmergency ? 1.5 : 4, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          
          {/* Emergency Pulse Effect */}
          {isEmergency && (
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
              style={{
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0) 70%)"
              }}
              initial={{ height: 0, width: 0, opacity: 1 }}
              animate={{ 
                height: [0, 200],
                width: [0, 200],
                opacity: [1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          )}
        </motion.div>

        {/* Safe Zones with Animated Pulses */}
        <motion.div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 safe-zone h-36 w-36 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(16, 185, 129, 0)",
              "0 0 0 10px rgba(16, 185, 129, 0.1)",
              "0 0 0 0 rgba(16, 185, 129, 0)"
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <motion.div 
          className="absolute right-1/3 bottom-1/3 transform -translate-x-1/2 -translate-y-1/2 safe-zone h-32 w-32 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(16, 185, 129, 0)",
              "0 0 0 10px rgba(16, 185, 129, 0.1)",
              "0 0 0 0 rgba(16, 185, 129, 0)"
            ]
          }}
          transition={{ duration: 5, delay: 1, repeat: Infinity }}
        />
        
        {/* Caution Zone with Alert Pulse */}
        <motion.div 
          className="absolute right-2/3 bottom-2/5 transform -translate-x-1/2 -translate-y-1/2 caution-zone h-28 w-28 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(245, 158, 11, 0)",
              "0 0 0 8px rgba(245, 158, 11, 0.1)",
              "0 0 0 0 rgba(245, 158, 11, 0)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Enhanced Route Path */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Main route path */}
          <path 
            d="M25,25 C35,35 40,40 50,35 S70,55 75,75" 
            fill="none" 
            stroke="#7C3AED" 
            strokeWidth="0.5" 
            strokeLinecap="round"
            className="route-path"
            filter="url(#glow)"
          />
          
          {/* Progress indicator along the path */}
          <circle 
            cx="0" 
            cy="0" 
            r="1" 
            fill="#7C3AED" 
            filter="url(#glow)"
          >
            <animateMotion
              path="M25,25 C35,35 40,40 50,35 S70,55 75,75"
              dur="10s"
              rotate="auto"
              repeatCount="indefinite"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </svg>

        {/* Dynamic Responder Dots */}
        {responderPositions.map(responder => (
          <motion.div 
            key={responder.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${responder.x}%`, 
              top: `${responder.y}%` 
            }}
            animate={{ 
              x: [0, 3, -3, 0],
              y: [0, -3, 3, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: responder.id * 0.5
            }}
          >
            <div className="h-2 w-2 bg-[#7C3AED] rounded-full responder-dot relative"></div>
          </motion.div>
        ))}

        {/* Enhanced Safe Havens with Hover Effect */}
        {[
          { id: 1, x: 60, y: 30, name: "Sapphire Mall" },
          { id: 2, x: 65, y: 60, name: "Medical Center" },
          { id: 3, x: 40, y: 70, name: "Police Outpost" }
        ].map(haven => (
          <motion.div 
            key={haven.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${haven.x}%`, top: `${haven.y}%` }}
            whileHover={{ scale: 1.2 }}
          >
            <div className="h-4 w-4 bg-[#10B981] bg-opacity-30 rounded-sm safe-haven"></div>
            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-[#10B981] bg-opacity-80 px-2 py-0.5 rounded text-xs whitespace-nowrap transition-opacity duration-200">
              {haven.name}
            </div>
          </motion.div>
        ))}
        
        {/* Road Intersections */}
        <div className="absolute left-[48%] top-[42%] h-5 w-5 rounded-full border border-gray-400 border-opacity-30 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-gray-400 bg-opacity-50"></div>
        </div>
        
        <div className="absolute left-[60%] top-[55%] h-5 w-5 rounded-full border border-gray-400 border-opacity-30 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-gray-400 bg-opacity-50"></div>
        </div>
      </div>
      
      {/* Compass Rose */}
      <div className="absolute bottom-28 right-4 z-30">
        <motion.div 
          className="h-16 w-16 rounded-full glass-effect flex items-center justify-center"
          animate={{ rotate: isMovingMap ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative h-10 w-10">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-0.5 bg-red-500"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 h-3 w-0.5 bg-white"></div>
              <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-0.5 w-3 bg-white"></div>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 h-0.5 w-3 bg-white"></div>
              
              <div className="h-full w-full rounded-full border border-[#7C3AED] border-opacity-60"></div>
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[#7C3AED]"></div>
            </div>
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] text-red-400 font-bold">N</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-[8px] text-white">S</div>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] text-white">W</div>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-[8px] text-white">E</div>
          </div>
        </motion.div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end space-y-2">
        {/* Environment Toggle Button (Improved) */}
        <motion.div 
          className="glass-effect rounded-full pr-3 flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button 
            className="h-10 w-10 rounded-full bg-[#2D2A5A] flex items-center justify-center mr-2"
            onClick={toggleEnvironmentMode}
          >
            {environmentMode === "day" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-blue-200" />
            )}
          </button>
          <span className="text-sm text-white font-medium">
            {environmentMode === "day" ? "Day Mode" : "Night Mode"}
          </span>
        </motion.div>
        
        {/* Map Type Toggle */}
        <motion.div 
          className="glass-effect rounded-full pr-3 flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button 
            className="h-10 w-10 rounded-full bg-[#2D2A5A] flex items-center justify-center mr-2"
            onClick={toggleMapViewType}
          >
            {mapViewType === 'satellite' ? (
              <Map className="h-5 w-5 text-blue-300" />
            ) : (
              <MapPin className="h-5 w-5 text-green-300" />
            )}
          </button>
          <span className="text-sm text-white font-medium">
            {mapViewType === 'satellite' ? "Satellite" : "Street"}
          </span>
        </motion.div>
        
        {/* Map Movement Toggle */}
        <motion.div 
          className="glass-effect rounded-full pr-3 flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button 
            className={`h-10 w-10 rounded-full ${isMovingMap ? 'bg-[#7C3AED]' : 'bg-[#2D2A5A]'} flex items-center justify-center mr-2`}
            onClick={() => setIsMovingMap(!isMovingMap)}
          >
            <Navigation className="h-5 w-5 text-white" />
          </button>
          <span className="text-sm text-white font-medium">
            {isMovingMap ? "Live GPS" : "Stable View"}
          </span>
        </motion.div>
      </div>

      {/* Transportation Info */}
      <motion.div 
        className="absolute bottom-4 left-4 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TransportCard />
      </motion.div>

      {/* Responder Card */}
      <AnimatePresence>
        {showResponderCard && (
          <motion.div 
            className="absolute bottom-4 right-4 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ResponderCard />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Emergency Response */}
      <AnimatePresence>
        {showEmergencyResponse && (
          <>
            <motion.div 
              className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-[#EF4444] text-white px-4 py-2 rounded-lg z-50 flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <i className="ri-alarm-warning-line mr-2"></i> Emergency Alert Activated
            </motion.div>
            
            <motion.div 
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-effect rounded-xl p-4 z-50 max-w-sm w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-2">
                <span className="bg-[#EF4444] text-white text-xs px-2 py-1 rounded-full">Emergency Response</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div 
                    className="h-10 w-10 rounded-full bg-cover bg-center" 
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')"}}
                  />
                  <div className="ml-2">
                    <h4 className="text-white text-sm font-medium">Rahul Mehta</h4>
                    <p className="text-xs text-gray-300">Responder (2 min ETA)</p>
                  </div>
                </div>
                <motion.div 
                  className="h-8 w-8 rounded-full bg-[#EF4444] flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <i className="ri-phone-line text-white"></i>
                </motion.div>
              </div>
              <p className="text-xs text-gray-300 mb-3">
                Responder has been alerted and is on the way to your location. Police have also been notified.
              </p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-[#2D2A5A] rounded-lg py-2 text-sm transition-colors hover:bg-[#3D3A6A]">Cancel</button>
                <button className="flex-1 bg-[#7C3AED] rounded-lg py-2 text-sm transition-colors hover:bg-[#6022BB]">Chat</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Add the new components */}
      <ThreatDetection />
      <VoiceAlertSystem />
      <JourneyAnalytics />
      <CommunicationModule />
      <FuturisticOverlay />
    </div>
  );
};

export default MapVisualization;
