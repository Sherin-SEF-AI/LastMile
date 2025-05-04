import { useSimulation } from "@/context/SimulationContext";
import { motion } from "framer-motion";

const ProfilePanel = () => {
  const { 
    safetyStatus, 
    transportMode, 
    journeyStartTime, 
    safetyScore, 
    estimatedTime,
    distance,
    responderCount,
    safeHavenCount,
    bubbleStrength,
    setTransportMode,
    triggerEmergency,
    isEmergency
  } = useSimulation();

  const getSafetyStatusText = () => {
    switch (safetyStatus) {
      case "safe": return "Active";
      case "monitoring": return "Monitoring";
      case "alert": return "Alert";
      default: return "Active";
    }
  };

  const getSafetyStatusColor = () => {
    switch (safetyStatus) {
      case "safe": return "bg-[#10B981] text-[#10B981]";
      case "monitoring": return "bg-[#F59E0B] text-[#F59E0B]";
      case "alert": return "bg-[#EF4444] text-[#EF4444]";
      default: return "bg-[#10B981] text-[#10B981]";
    }
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 glass-effect z-20 md:h-auto overflow-y-auto no-scrollbar">
      <div className="p-4">
        {/* User Profile */}
        <motion.div 
          className="mb-5 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="h-12 w-12 rounded-full bg-cover bg-center" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')"}}
          />
          <div className="ml-3">
            <h2 className="text-white font-semibold">Priya Sharma</h2>
            <p className="text-sm text-gray-300">Tech Employee, ITPL</p>
          </div>
        </motion.div>

        {/* Protection Status */}
        <motion.div 
          className="bg-[#2D2A5A] rounded-xl p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium">Protection Status</h3>
            <div className="flex items-center">
              <span className={`inline-block h-2 w-2 rounded-full ${getSafetyStatusColor().split(' ')[0]} mr-1 animate-pulse`}></span>
              <span className={getSafetyStatusColor().split(' ')[1] + " text-sm"}>
                {getSafetyStatusText()}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Journey Mode</span>
            <span className="text-white">Last Mile</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Started</span>
            <span className="text-white">{journeyStartTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Safety Score</span>
            <div className="flex items-center">
              <span className="text-white mr-1">{safetyScore}</span>
              <span className="text-xs text-[#10B981]">(Good)</span>
            </div>
          </div>
        </motion.div>

        {/* Journey Options */}
        <motion.div 
          className="bg-[#2D2A5A] rounded-xl p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-white font-medium mb-3">Journey Options</h3>
          <div className="flex space-x-2 mb-3">
            <button 
              className={`flex-1 ${transportMode === 'walking' ? 'bg-[#7C3AED]' : 'bg-[#7C3AED] bg-opacity-20 hover:bg-opacity-30'} text-white rounded-lg p-2 text-xs flex items-center justify-center transition-all`}
              onClick={() => setTransportMode('walking')}
            >
              <i className="ri-walk-line mr-1"></i> Walking
            </button>
            <button 
              className={`flex-1 ${transportMode === 'auto' ? 'bg-[#7C3AED]' : 'bg-[#7C3AED] bg-opacity-20 hover:bg-opacity-30'} text-white rounded-lg p-2 text-xs flex items-center justify-center transition-all`}
              onClick={() => setTransportMode('auto')}
            >
              <i className="ri-car-line mr-1"></i> Auto
            </button>
            <button 
              className={`flex-1 ${transportMode === 'cab' ? 'bg-[#7C3AED]' : 'bg-[#7C3AED] bg-opacity-20 hover:bg-opacity-30'} text-white rounded-lg p-2 text-xs flex items-center justify-center transition-all`}
              onClick={() => setTransportMode('cab')}
            >
              <i className="ri-taxi-line mr-1"></i> Cab
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Estimated time</span>
            <span className="text-white">{estimatedTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Distance</span>
            <span className="text-white">{distance}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Route Safety</span>
            <div className="flex items-center">
              <i className="ri-star-fill text-yellow-400 text-xs mr-0.5"></i>
              <i className="ri-star-fill text-yellow-400 text-xs mr-0.5"></i>
              <i className="ri-star-fill text-yellow-400 text-xs mr-0.5"></i>
              <i className="ri-star-half-fill text-yellow-400 text-xs mr-0.5"></i>
              <i className="ri-star-line text-yellow-400 text-xs"></i>
            </div>
          </div>
        </motion.div>

        {/* Safety Metrics */}
        <motion.div 
          className="bg-[#2D2A5A] rounded-xl p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-white font-medium mb-3">Safety Network</h3>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div className="bg-[#1E1B4B] rounded-lg p-3 text-center">
              <div className="text-xl font-display font-semibold text-[#10B981]">{responderCount}</div>
              <div className="text-xs text-gray-300">Responders Nearby</div>
            </div>
            <div className="bg-[#1E1B4B] rounded-lg p-3 text-center">
              <div className="text-xl font-display font-semibold text-[#7C3AED]">{safeHavenCount}</div>
              <div className="text-xs text-gray-300">Safe Havens</div>
            </div>
          </div>
          <div className="bg-[#1E1B4B] rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Safety Bubble</span>
              <span className="text-xs text-[#10B981]">Active</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-[#10B981] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${bubbleStrength}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          <button 
            className={`w-full ${isEmergency ? 'bg-[#EF4444] animate-pulse' : 'bg-[#EF4444]'} flex items-center justify-center py-3 rounded-lg text-white font-medium transition-all hover:bg-opacity-90`}
            onClick={triggerEmergency}
          >
            {isEmergency ? (
              <>
                <i className="ri-alarm-warning-line mr-1"></i> Emergency Active
              </>
            ) : (
              <>
                <i className="ri-alarm-warning-line mr-1"></i> Trigger Emergency
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePanel;
