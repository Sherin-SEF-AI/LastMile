import { createContext, useState, useContext, ReactNode, useCallback } from "react";

export type TransportMode = "walking" | "auto" | "cab";
export type SimulationStep = "start" | "safety-active" | "journey" | "arrival";
export type SafetyStatus = "safe" | "monitoring" | "alert";
export type EnvironmentMode = "day" | "night";

interface SimulationContextType {
  currentStep: SimulationStep;
  safetyStatus: SafetyStatus;
  transportMode: TransportMode;
  environmentMode: EnvironmentMode;
  progress: number;
  isEmergency: boolean;
  journeyStartTime: string;
  estimatedTime: string;
  distance: string;
  safetyScore: number;
  responderCount: number;
  safeHavenCount: number;
  bubbleStrength: number;
  
  // Actions
  setCurrentStep: (step: SimulationStep) => void;
  setSafetyStatus: (status: SafetyStatus) => void;
  setTransportMode: (mode: TransportMode) => void;
  toggleEnvironmentMode: () => void;
  setProgress: (progress: number) => void;
  triggerEmergency: () => void;
  resetEmergency: () => void;
  startJourney: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<SimulationStep>("start");
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>("safe");
  const [transportMode, setTransportMode] = useState<TransportMode>("auto");
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>("day");
  const [progress, setProgress] = useState(0);
  const [isEmergency, setIsEmergency] = useState(false);
  const [journeyStartTime, setJourneyStartTime] = useState("5:45 PM");
  const [estimatedTime, setEstimatedTime] = useState("23 min");
  const [distance, setDistance] = useState("3.8 km");
  const [safetyScore, setSafetyScore] = useState(87);
  const [responderCount, setResponderCount] = useState(12);
  const [safeHavenCount, setSafeHavenCount] = useState(5);
  const [bubbleStrength, setBubbleStrength] = useState(85);

  const toggleEnvironmentMode = useCallback(() => {
    setEnvironmentMode(prev => prev === "day" ? "night" : "day");
  }, []);

  const triggerEmergency = useCallback(() => {
    setIsEmergency(true);
    setSafetyStatus("alert");
  }, []);

  const resetEmergency = useCallback(() => {
    setIsEmergency(false);
    setSafetyStatus("safe");
  }, []);

  const startJourney = useCallback(() => {
    setCurrentStep("safety-active");
    
    // Simulate journey progression
    setTimeout(() => {
      setCurrentStep("journey");
      
      // Simulate arrival after some time
      const journeyInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(journeyInterval);
            setCurrentStep("arrival");
            return 100;
          }
          return newProgress;
        });
      }, 3000);
    }, 3000);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        currentStep,
        safetyStatus,
        transportMode,
        environmentMode,
        progress,
        isEmergency,
        journeyStartTime,
        estimatedTime,
        distance,
        safetyScore,
        responderCount,
        safeHavenCount,
        bubbleStrength,
        
        setCurrentStep,
        setSafetyStatus,
        setTransportMode,
        toggleEnvironmentMode,
        setProgress,
        triggerEmergency,
        resetEmergency,
        startJourney,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
