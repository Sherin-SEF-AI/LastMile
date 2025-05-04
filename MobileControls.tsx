import { useSimulation } from "@/context/SimulationContext";

const MobileControls = () => {
  const { safetyStatus, triggerEmergency, isEmergency } = useSimulation();
  
  const getSafetyButtonColor = () => {
    switch (safetyStatus) {
      case "safe": return "bg-[#10B981]";
      case "monitoring": return "bg-[#F59E0B]";
      case "alert": return "bg-[#EF4444]";
      default: return "bg-[#10B981]";
    }
  };
  
  const getSafetyButtonText = () => {
    switch (safetyStatus) {
      case "safe": return "Protected";
      case "monitoring": return "Monitoring";
      case "alert": return "Alert Active";
      default: return "Protected";
    }
  };

  return (
    <div className="md:hidden glass-effect p-3 z-30">
      <div className="flex items-center justify-between">
        <button className="flex items-center bg-[#2D2A5A] px-3 py-2 rounded-lg text-xs">
          <i className="ri-information-line mr-1"></i> Details
        </button>
        <button className={`flex items-center ${getSafetyButtonColor()} px-4 py-2 rounded-lg text-xs`}>
          <i className="ri-shield-check-line mr-1"></i> {getSafetyButtonText()}
        </button>
        <button 
          className={`flex items-center ${isEmergency ? 'bg-[#EF4444] animate-pulse' : 'bg-[#EF4444]'} px-3 py-2 rounded-lg text-xs`}
          onClick={triggerEmergency}
        >
          <i className="ri-alarm-warning-line mr-1"></i> Alert
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
