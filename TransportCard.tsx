import { motion } from "framer-motion";
import { useSimulation } from "@/context/SimulationContext";

const TransportCard = () => {
  const { transportMode } = useSimulation();
  
  const getTransportIcon = () => {
    switch (transportMode) {
      case "walking": return "ri-walk-line";
      case "auto": return "ri-car-line";
      case "cab": return "ri-taxi-line";
      default: return "ri-car-line";
    }
  };
  
  const getTransportName = () => {
    switch (transportMode) {
      case "walking": return "Walking";
      case "auto": return "Auto Rickshaw";
      case "cab": return "Cab Service";
      default: return "Auto Rickshaw";
    }
  };
  
  const getDriverInfo = () => {
    switch (transportMode) {
      case "walking": return null;
      case "auto": return "Vijay K.";
      case "cab": return "Akash M.";
      default: return "Vijay K.";
    }
  };
  
  const getArrivalTime = () => {
    switch (transportMode) {
      case "walking": return "N/A";
      case "auto": return "4 min";
      case "cab": return "6 min";
      default: return "4 min";
    }
  };

  return (
    <motion.div 
      className="glass-effect rounded-xl p-3 max-w-xs"
      key={transportMode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="h-10 w-10 bg-[#2D2A5A] rounded-lg flex items-center justify-center mr-2">
          <i className={`${getTransportIcon()} text-[#7C3AED] text-lg`}></i>
        </div>
        <div>
          <h4 className="text-white text-sm font-medium">{getTransportName()}</h4>
          {transportMode !== "walking" && (
            <div className="flex items-center">
              <i className="ri-time-line text-xs text-gray-300 mr-1"></i>
              <span className="text-xs text-gray-300">Arriving in {getArrivalTime()}</span>
            </div>
          )}
        </div>
      </div>
      {getDriverInfo() && (
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-300">Driver: {getDriverInfo()}</span>
          <span className="text-xs text-green-400">Verified ✓</span>
        </div>
      )}
    </motion.div>
  );
};

export default TransportCard;
