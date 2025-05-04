import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const JourneyTimeline = () => {
  const { 
    progress, 
    safetyStatus, 
    isEmergency, 
    journeyStartTime,
    estimatedTime
  } = useSimulation();
  
  const [expanded, setExpanded] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  
  // Generate timeline events based on journey progress
  useEffect(() => {
    const baseEvents: TimelineEvent[] = [
      {
        id: 1,
        title: 'Journey Started',
        description: 'SEF protection activated',
        time: journeyStartTime,
        status: progress > 0 ? 'completed' : 'current',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3H5ZM5 5H19V19H5V5ZM11 7V9H13V7H11ZM11 11V17H13V11H11Z" fill="currentColor"/>
          </svg>
        )
      },
      {
        id: 2,
        title: 'Route Analysis',
        description: 'Safety scan completed',
        time: getTimeFromProgress(10),
        status: progress >= 10 ? 'completed' : progress < 10 ? 'upcoming' : 'current',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      {
        id: 3,
        title: 'Mid-Journey',
        description: 'Approaching destination',
        time: getTimeFromProgress(50),
        status: progress >= 50 ? 'completed' : progress < 50 ? 'upcoming' : 'current',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 20L3 17V7L9 4M9 20L15 17M9 20V14M15 17L21 20V10L15 7M15 17V11M9 14L3 11M9 14L15 11M15 7L9 4M15 7V11M9 4V8L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      {
        id: 4,
        title: 'Final Approach',
        description: 'Nearing safe zone',
        time: getTimeFromProgress(80),
        status: progress >= 80 ? 'completed' : progress < 80 ? 'upcoming' : 'current',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      {
        id: 5,
        title: 'Arrival',
        description: 'Destination reached',
        time: estimatedTime,
        status: progress >= 100 ? 'completed' : 'upcoming',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12H4M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      }
    ];
    
    // Add conditional events
    const dynamicEvents: TimelineEvent[] = [];
    
    // Add alert event if there's an emergency
    if (isEmergency) {
      dynamicEvents.push({
        id: 100,
        title: 'Emergency Triggered',
        description: 'Response team alerted',
        time: getCurrentTime(),
        status: 'danger',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      });
    } 
    // Add warning if in alert mode
    else if (safetyStatus === 'alert' && progress > 25 && progress < 80) {
      dynamicEvents.push({
        id: 101,
        title: 'Safety Alert',
        description: 'Potential risk detected',
        time: getCurrentTime(),
        status: 'warning',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      });
    }
    
    // Merge base and dynamic events, sort by progress point
    const allEvents = [...baseEvents, ...dynamicEvents].sort((a, b) => {
      // Emergency and warning events should appear at current progress
      if (a.id >= 100) return progress - getProgressFromId(a.id);
      if (b.id >= 100) return getProgressFromId(b.id) - progress;
      
      return a.id - b.id;
    });
    
    setEvents(allEvents);
  }, [progress, safetyStatus, isEmergency, journeyStartTime, estimatedTime]);
  
  // Helper to convert progress percentage to event ID
  const getProgressFromId = (id: number) => {
    switch (id) {
      case 1: return 0;
      case 2: return 10;
      case 3: return 50;
      case 4: return 80;
      case 5: return 100;
      case 100: // Emergency
      case 101: // Alert
        return progress;
      default:
        return 0;
    }
  };
  
  // Generate time based on progress
  const getTimeFromProgress = (targetProgress: number) => {
    const startTime = new Date(journeyStartTime);
    const estimatedEndTime = new Date(estimatedTime);
    const totalJourneyTime = estimatedEndTime.getTime() - startTime.getTime();
    
    const targetTime = new Date(startTime.getTime() + (totalJourneyTime * targetProgress / 100));
    
    return targetTime.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get status color
  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'current': return '#7C3AED';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <div className="fixed left-4 bottom-20 z-30">
      <div className="relative">
        {/* Collapsed state */}
        <button 
          className="glass-effect h-12 px-4 rounded-lg flex items-center space-x-2"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="h-8 w-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5H20M4 12H12M4 19H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="text-white text-sm">Journey Progress</div>
            <div className="text-gray-300 text-xs">{Math.round(progress)}% Complete</div>
          </div>
        </button>
        
        {/* Expanded timeline */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              className="absolute bottom-14 glass-effect rounded-lg p-4 w-80"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-sm font-medium">Journey Timeline</h3>
                <div className="text-xs text-gray-300">{Math.round(progress)}% Complete</div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 bg-[#2D2A5A] rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-[#7C3AED]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-[#2D2A5A]"></div>
                
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div 
                      key={event.id} 
                      className={`relative flex items-start ${
                        event.status === 'upcoming' ? 'opacity-60' : 'opacity-100'
                      }`}
                    >
                      {/* Timeline node */}
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ 
                          backgroundColor: event.status === 'upcoming' 
                            ? '#2D2A5A' 
                            : getStatusColor(event.status),
                          boxShadow: event.status === 'current' 
                            ? `0 0 0 4px rgba(124, 58, 237, 0.2)` 
                            : 'none'
                        }}
                      >
                        <div className="text-white">
                          {event.icon ? event.icon : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        
                        {/* Pulse effect for current step */}
                        {event.status === 'current' && (
                          <motion.div 
                            className="absolute inset-0 rounded-full"
                            animate={{
                              boxShadow: [
                                `0 0 0 0 ${getStatusColor(event.status)}80`,
                                `0 0 0 10px ${getStatusColor(event.status)}00`
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      
                      {/* Event content */}
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <div 
                            className="text-sm font-medium"
                            style={{ color: getStatusColor(event.status) }}
                          >
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.time}
                          </div>
                        </div>
                        <div className="text-xs text-gray-300 mt-0.5">
                          {event.description}
                        </div>
                        
                        {/* Add more details for current or alert status */}
                        {(event.status === 'current' || event.status === 'warning' || event.status === 'danger') && (
                          <motion.div 
                            className="mt-1 text-xs text-gray-400 flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div 
                              className="h-1.5 w-1.5 rounded-full mr-1 animate-pulse"
                              style={{ backgroundColor: getStatusColor(event.status) }}
                            ></div>
                            {event.status === 'current' ? 'In progress' : 
                             event.status === 'warning' ? 'Attention required' : 
                             'Emergency active'}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Estimated arrival */}
              <div className="mt-4 bg-[#2D2A5A] bg-opacity-50 rounded-lg p-3 flex justify-between">
                <div className="text-xs text-gray-300">Estimated arrival</div>
                <div className="text-xs text-white">{estimatedTime}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JourneyTimeline;