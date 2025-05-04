import { useSimulation } from "@/context/SimulationContext";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

const ProgressIndicator = () => {
  const { currentStep } = useSimulation();
  
  const steps = [
    { id: "start", label: "Start", position: 1 },
    { id: "safety-active", label: "Safety Active", position: 2 },
    { id: "journey", label: "Journey", position: 3 },
    { id: "arrival", label: "Arrival", position: 4 }
  ];
  
  const getCurrentStepPosition = () => {
    const stepObj = steps.find(step => step.id === currentStep);
    return stepObj ? stepObj.position : 1;
  };
  
  const currentStepNumber = getCurrentStepPosition();

  return (
    <header className="z-30 w-full glass-effect">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <Shield className="text-white h-5 w-5" />
            </div>
            <h1 className="ml-2 text-lg font-semibold text-white">SEF Protection</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step.position <= currentStepNumber ? "bg-[#7C3AED]" : "bg-gray-500 opacity-60"
                }`}>
                  {step.position}
                </div>
                <span className={`ml-1 text-xs text-white ${
                  step.position > currentStepNumber ? "opacity-60" : ""
                }`}>
                  {step.label}
                </span>
                
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-700 mx-1">
                    <motion.div 
                      className="bg-[#7C3AED] h-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: step.position < currentStepNumber 
                          ? 1 
                          : step.position === currentStepNumber 
                            ? 0.7 
                            : 0 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="md:hidden">
            <span className="text-sm text-white">Step: {currentStepNumber}/4</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProgressIndicator;
