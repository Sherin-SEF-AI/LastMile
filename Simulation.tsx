import { useEffect, useState } from "react";
import { SimulationProvider, useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/ProgressIndicator";
import ProfilePanel from "@/components/ProfilePanel";
import MapVisualization from "@/components/MapVisualization";
import MobileControls from "@/components/MobileControls";
import FuturisticLoader from "@/components/FuturisticLoader";
import AdvancedControls from "@/components/AdvancedControls";
import AdvancedDataDashboard from "@/components/AdvancedDataDashboard";
import HolographicAlert from "@/components/HolographicAlert";
import Compass3D from "@/components/Compass3D";
import WeatherEffects from "@/components/WeatherEffects";
import JourneyTimeline from "@/components/JourneyTimeline";

// Inner component that uses the simulation context
const SimulationContent = () => {
  const { currentStep, startJourney } = useSimulation();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  // Start journey when component mounts
  useEffect(() => {
    // Show loading screen for a few seconds
    const loadingTimer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2500);
    
    if (currentStep === "start") {
      const journeyTimer = setTimeout(() => {
        startJourney();
      }, 3500);
      
      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(journeyTimer);
      };
    }
    
    return () => clearTimeout(loadingTimer);
  }, [currentStep, startJourney]);

  return (
    <>
      {/* Advanced Futuristic Loader */}
      <FuturisticLoader 
        isLoading={showLoadingScreen} 
        onLoadingComplete={() => {
          setShowLoadingScreen(false);
          if (currentStep === "start") {
            setTimeout(() => startJourney(), 1000);
          }
        }}
      />
      
      {/* Main Application */}
      <motion.div 
        className="flex flex-col h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoadingScreen ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ProgressIndicator />
        
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <ProfilePanel />
          <MapVisualization />
          
          {/* Advanced UI Components */}
          <AdvancedDataDashboard />
          <AdvancedControls />
          <HolographicAlert />
          <JourneyTimeline />
          <WeatherEffects type="clear" intensity={0.5} />
          
          {/* 3D Compass in bottom right corner */}
          <div className="absolute bottom-8 right-8 z-30 hidden md:block">
            <Compass3D size={120} />
          </div>
        </main>
        
        <MobileControls />
      </motion.div>
    </>
  );
};

// Wrapper component that provides the simulation context
const Simulation = () => {
  return (
    <SimulationProvider>
      <SimulationContent />
    </SimulationProvider>
  );
};

export default Simulation;
