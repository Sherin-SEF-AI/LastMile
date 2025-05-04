import { useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, BarChart3, Shield, Route, Users, MapPin, Clock } from "lucide-react";

const JourneyAnalytics = () => {
  const { 
    environmentMode, 
    transportMode, 
    progress, 
    safetyScore, 
    bubbleStrength, 
    responderCount,
    safeHavenCount,
    distance
  } = useSimulation();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate estimated remaining time based on progress
  const getEstimatedTime = () => {
    const totalMinutes = 23; // Total journey time in minutes
    const remainingMinutes = Math.ceil(totalMinutes * (1 - progress / 100));
    return `${remainingMinutes} min`;
  };
  
  // Calculate safety metrics
  const calculateMetrics = () => {
    // Base safety score
    let calculatedScore = safetyScore;
    
    // Adjust based on environment mode
    if (environmentMode === "night") {
      calculatedScore -= 15;
    }
    
    // Adjust based on transport mode
    if (transportMode === "walking") {
      calculatedScore -= 10;
    } else if (transportMode === "cab") {
      calculatedScore += 5;
    }
    
    // Ensure score is within bounds
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
    
    // Calculate risk level
    let riskLevel;
    if (calculatedScore >= 80) {
      riskLevel = "Low";
    } else if (calculatedScore >= 60) {
      riskLevel = "Moderate";
    } else if (calculatedScore >= 40) {
      riskLevel = "Elevated";
    } else {
      riskLevel = "High";
    }
    
    // Calculate protection strength
    const protectionStrength = Math.min(100, bubbleStrength + responderCount * 5);
    
    return {
      calculatedScore,
      riskLevel,
      protectionStrength,
      safeHavens: safeHavenCount,
      responders: responderCount
    };
  };
  
  const metrics = calculateMetrics();
  
  // Calculate the progress segments
  const getProgressSegments = () => {
    const segments = [];
    for (let i = 0; i < 10; i++) {
      const isActive = progress >= (i + 1) * 10;
      segments.push(
        <div 
          key={i} 
          className={`h-1.5 flex-1 mx-0.5 rounded-full ${isActive ? 'bg-[#7C3AED]' : 'bg-gray-700'}`}
        />
      );
    }
    return segments;
  };
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm">
      <motion.div 
        className="glass-effect rounded-xl mx-4 overflow-hidden"
        animate={{ height: isOpen ? "auto" : "60px" }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <BarChart3 className="text-[#7C3AED] h-5 w-5 mr-2" />
            <h3 className="text-white font-medium">Journey Analytics</h3>
          </div>
          <div className="flex items-center">
            <div className="text-xs text-white mr-2">
              {progress}% Complete
            </div>
            {isOpen ? (
              <ChevronDown className="text-gray-400 h-4 w-4" />
            ) : (
              <ChevronUp className="text-gray-400 h-4 w-4" />
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="px-4 flex -mt-2">
          {getProgressSegments()}
        </div>
        
        {/* Analytics content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="p-4 pt-0 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Safety score meter */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Shield className="text-[#7C3AED] h-4 w-4 mr-1" />
                    <span className="text-white text-sm">Safety Score</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold ${
                      metrics.calculatedScore >= 80 ? 'text-green-400' : 
                      metrics.calculatedScore >= 60 ? 'text-yellow-400' : 
                      metrics.calculatedScore >= 40 ? 'text-orange-400' : 
                      'text-red-400'
                    }`}>
                      {metrics.calculatedScore}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">/ 100</span>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${
                      metrics.calculatedScore >= 80 ? 'bg-green-400' : 
                      metrics.calculatedScore >= 60 ? 'bg-yellow-400' : 
                      metrics.calculatedScore >= 40 ? 'bg-orange-400' : 
                      'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.calculatedScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>Risk Level: {metrics.riskLevel}</span>
                  <span>Mode: {environmentMode === "night" ? "Night" : "Day"}</span>
                </div>
              </div>
              
              {/* Protection metrics */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Shield className="text-[#10B981] h-4 w-4 mr-1" />
                    <span className="text-white text-sm">Protection Strength</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-[#10B981]">
                      {metrics.protectionStrength}%
                    </span>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#10B981] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.protectionStrength}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              {/* Journey metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#2D2A5A] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="text-[#7C3AED] h-4 w-4 mr-1" />
                      <span className="text-white text-xs">Responders</span>
                    </div>
                    <span className="text-lg font-semibold text-[#7C3AED]">{metrics.responders}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#7C3AED] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, metrics.responders * 10)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                
                <div className="bg-[#2D2A5A] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <MapPin className="text-[#10B981] h-4 w-4 mr-1" />
                      <span className="text-white text-xs">Safe Havens</span>
                    </div>
                    <span className="text-lg font-semibold text-[#10B981]">{metrics.safeHavens}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#10B981] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, metrics.safeHavens * 20)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                
                <div className="bg-[#2D2A5A] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Route className="text-[#F59E0B] h-4 w-4 mr-1" />
                      <span className="text-white text-xs">Distance</span>
                    </div>
                    <span className="text-sm font-semibold text-[#F59E0B]">{distance}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#F59E0B] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                
                <div className="bg-[#2D2A5A] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Clock className="text-[#EC4899] h-4 w-4 mr-1" />
                      <span className="text-white text-xs">ETA</span>
                    </div>
                    <span className="text-sm font-semibold text-[#EC4899]">{getEstimatedTime()}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#EC4899] rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${100 - progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default JourneyAnalytics;