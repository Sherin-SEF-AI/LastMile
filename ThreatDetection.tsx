import { useState, useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Eye } from "lucide-react";

interface Threat {
  id: number;
  type: "suspicious" | "caution" | "danger";
  location: { x: number; y: number };
  description: string;
  distance: number;
}

const ThreatDetection = () => {
  const { environmentMode, safetyStatus, isEmergency } = useSimulation();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [showThreatPanel, setShowThreatPanel] = useState(false);
  
  // Generate random threats based on the environment mode and safety status
  useEffect(() => {
    // Clear existing threats
    setThreats([]);
    
    // Only generate threats when safety is not "safe" or during night mode
    if (safetyStatus !== "safe" || environmentMode === "night") {
      const threatCount = environmentMode === "night" ? 3 : 1;
      
      const newThreats: Threat[] = [];
      for (let i = 0; i < threatCount; i++) {
        newThreats.push({
          id: i,
          type: i === 0 
            ? "danger" 
            : i === 1 
              ? "caution" 
              : "suspicious",
          location: { 
            x: Math.floor(Math.random() * 80) + 10, 
            y: Math.floor(Math.random() * 80) + 10 
          },
          description: [
            "Unknown person following",
            "Poorly lit area ahead",
            "Recent incident reported",
            "Traffic congestion",
            "Construction zone"
          ][Math.floor(Math.random() * 5)],
          distance: Math.floor(Math.random() * 300) + 50
        });
      }
      
      setThreats(newThreats);
    }
  }, [environmentMode, safetyStatus]);
  
  // Additional threats during emergency
  useEffect(() => {
    if (isEmergency) {
      const emergencyThreat: Threat = {
        id: 999,
        type: "danger",
        location: { x: 45, y: 50 },
        description: "Emergency alert triggered",
        distance: 20
      };
      
      setThreats(prevThreats => [...prevThreats, emergencyThreat]);
    } else {
      setThreats(prevThreats => prevThreats.filter(t => t.id !== 999));
    }
  }, [isEmergency]);
  
  const getThreatColor = (type: Threat["type"]) => {
    switch (type) {
      case "suspicious": return "bg-amber-500";
      case "caution": return "bg-orange-500";
      case "danger": return "bg-red-500";
      default: return "bg-amber-500";
    }
  };
  
  const getThreatIcon = (type: Threat["type"]) => {
    switch (type) {
      case "suspicious": return <Eye className="h-3 w-3 text-white" />;
      case "caution": return <AlertTriangle className="h-3 w-3 text-white" />;
      case "danger": return <Shield className="h-3 w-3 text-white" />;
      default: return <AlertTriangle className="h-3 w-3 text-white" />;
    }
  };
  
  if (threats.length === 0) return null;
  
  return (
    <>
      {/* Threat markers on the map */}
      {threats.map((threat) => (
        <motion.div
          key={threat.id}
          className="absolute z-30"
          style={{ 
            left: `${threat.location.x}%`, 
            top: `${threat.location.y}%` 
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className={`${getThreatColor(threat.type)} h-4 w-4 rounded-full flex items-center justify-center relative`}
            animate={{ 
              boxShadow: [
                `0 0 0 0 ${threat.type === "danger" ? "rgba(239, 68, 68, 0.7)" : "rgba(245, 158, 11, 0.7)"}`,
                `0 0 0 10px ${threat.type === "danger" ? "rgba(239, 68, 68, 0)" : "rgba(245, 158, 11, 0)"}`
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {getThreatIcon(threat.type)}
          </motion.div>
        </motion.div>
      ))}
      
      {/* Threat info button */}
      <div className="absolute top-16 right-4 z-30">
        <button 
          className={`h-10 w-10 rounded-full glass-effect flex items-center justify-center relative ${threats.length > 0 ? "animate-pulse" : ""}`}
          onClick={() => setShowThreatPanel(!showThreatPanel)}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {threats.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {threats.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Threat information panel */}
      <AnimatePresence>
        {showThreatPanel && (
          <motion.div 
            className="absolute top-28 right-4 z-30 glass-effect rounded-xl p-3 w-64"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-sm font-semibold">Safety Alerts</h3>
              <button 
                className="h-5 w-5 rounded-full bg-[#2D2A5A] flex items-center justify-center"
                onClick={() => setShowThreatPanel(false)}
              >
                <span className="text-xs text-gray-400">×</span>
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {threats.map((threat) => (
                <motion.div 
                  key={threat.id}
                  className="bg-[#2D2A5A] bg-opacity-60 rounded-lg p-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-1">
                    <div className={`${getThreatColor(threat.type)} h-5 w-5 rounded-full flex items-center justify-center mr-2`}>
                      {getThreatIcon(threat.type)}
                    </div>
                    <span className="text-white text-xs font-medium">{threat.description}</span>
                  </div>
                  <div className="text-gray-400 text-xs flex justify-between">
                    <span>Distance: {threat.distance}m</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#1E1B4B] text-gray-300">
                      {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThreatDetection;