import { useEffect, useState, useRef } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, AlertCircle } from "lucide-react";

const VoiceAlertSystem = () => {
  const { safetyStatus, isEmergency, progress, currentStep } = useSimulation();
  const [isMuted, setIsMuted] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertQueueRef = useRef<string[]>([]);
  
  // Handle alerts based on safety status changes
  useEffect(() => {
    if (safetyStatus === "monitoring") {
      addAlert("Entering monitoring mode. Safe travel protocols activated.");
    } else if (safetyStatus === "alert") {
      addAlert("Warning! Safety alert detected. Increasing monitoring level.");
    }
  }, [safetyStatus]);
  
  // Handle emergency alerts
  useEffect(() => {
    if (isEmergency) {
      addAlert("Emergency activated! Alerting nearby responders and authorities.");
      // Add delayed follow-up message
      setTimeout(() => {
        addAlert("Responders are en route to your location. Stay calm and remain in place if possible.");
      }, 5000);
    }
  }, [isEmergency]);
  
  // Progress and journey stage alerts
  useEffect(() => {
    if (progress === 25) {
      addAlert("Journey 25% complete. All safety metrics normal.");
    } else if (progress === 50) {
      addAlert("Journey 50% complete. Monitoring nearby environment.");
    } else if (progress === 75) {
      addAlert("Journey 75% complete. Approaching destination area.");
    }
  }, [progress]);
  
  // Journey step changes
  useEffect(() => {
    if (currentStep === "safety-active") {
      addAlert("Safety protection is now active. Monitoring your journey.");
    } else if (currentStep === "journey") {
      addAlert("Journey in progress. Real-time safety monitoring engaged.");
    } else if (currentStep === "arrival") {
      addAlert("You have arrived at your destination. Safety monitoring will remain active for 2 minutes.");
    }
  }, [currentStep]);
  
  // Process the alert queue
  useEffect(() => {
    const processNextAlert = () => {
      if (alertQueueRef.current.length > 0 && !currentAlert) {
        const nextAlert = alertQueueRef.current.shift();
        setCurrentAlert(nextAlert || null);
        setShowVoiceIndicator(true);
        
        // Show the alert for a duration based on its length
        const duration = nextAlert ? Math.max(3000, nextAlert.length * 80) : 3000;
        alertTimeoutRef.current = setTimeout(() => {
          setCurrentAlert(null);
          setShowVoiceIndicator(false);
          
          // Process next alert after a brief pause
          setTimeout(processNextAlert, 1000);
        }, duration);
      }
    };
    
    if (!currentAlert && alertQueueRef.current.length > 0) {
      processNextAlert();
    }
    
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [currentAlert]);
  
  // Add an alert to the queue
  const addAlert = (message: string) => {
    if (isMuted) return;
    alertQueueRef.current.push(message);
    
    // If no alert is currently showing, process the queue
    if (!currentAlert) {
      const nextAlert = alertQueueRef.current.shift();
      setCurrentAlert(nextAlert || null);
      setShowVoiceIndicator(true);
      
      // Show the alert for a duration based on its length
      const duration = nextAlert ? Math.max(3000, nextAlert.length * 80) : 3000;
      alertTimeoutRef.current = setTimeout(() => {
        setCurrentAlert(null);
        setShowVoiceIndicator(false);
      }, duration);
    }
  };
  
  // Toggle muted state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Clear current and queued alerts when muting
      setCurrentAlert(null);
      setShowVoiceIndicator(false);
      alertQueueRef.current = [];
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    } else {
      // When unmuting, add a confirmation message
      setTimeout(() => {
        addAlert("Voice alerts enabled.");
      }, 500);
    }
  };
  
  return (
    <>
      {/* Voice control button */}
      <div className="absolute top-16 left-4 z-30">
        <button 
          className="h-10 w-10 rounded-full glass-effect flex items-center justify-center"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-gray-400" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
      
      {/* Voice indicator and alert message */}
      <AnimatePresence>
        {showVoiceIndicator && currentAlert && !isMuted && (
          <motion.div 
            className="absolute top-28 left-4 z-30 glass-effect rounded-xl overflow-hidden max-w-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-start p-3">
              <div className="mr-3 mt-0.5">
                <div className="relative">
                  <AlertCircle className="h-5 w-5 text-[#7C3AED]" />
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(124, 58, 237, 0.7)",
                        "0 0 0 10px rgba(124, 58, 237, 0)"
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <h4 className="text-white text-sm font-medium">SEF Voice Assistant</h4>
                  <div className="flex space-x-1 ml-2">
                    <motion.div 
                      className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div 
                      className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div 
                      className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, delay: 0.4, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-300">{currentAlert}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAlertSystem;