import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const AdvancedDataDashboard = () => {
  const { 
    safetyStatus, 
    isEmergency, 
    progress, 
    safetyScore,
    responderCount,
    safeHavenCount,
    environmentMode,
    transportMode
  } = useSimulation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [riskData, setRiskData] = useState<any[]>([]);
  const [responderData, setResponderData] = useState<any[]>([]);
  const [safetyData, setSafetyData] = useState<any[]>([]);
  const [threatCounters, setThreatCounters] = useState({
    high: 0,
    medium: 0,
    low: 0,
    neutralized: 0
  });
  
  // Generate simulated data based on safety status and journey progress
  useEffect(() => {
    // Generate time-based risk data
    const newRiskData = Array.from({ length: 24 }).map((_, i) => {
      const baseRisk = isEmergency ? 70 + Math.random() * 30 : 
                    safetyStatus === 'alert' ? 50 + Math.random() * 30 : 
                    safetyStatus === 'monitoring' ? 30 + Math.random() * 30 : 
                    10 + Math.random() * 20;
      
      // Create a peak at the current time (simulated by progress)
      const distanceFromCurrent = Math.abs(i - (progress * 24 / 100));
      const currentFactor = Math.max(0, 1 - distanceFromCurrent / 5);
      
      return {
        hour: i,
        risk: Math.min(100, baseRisk + currentFactor * 40),
        average: 30 + Math.sin(i / 3) * 15
      };
    });
    
    setRiskData(newRiskData);
    
    // Generate responder proximity data
    const newResponderData = Array.from({ length: 10 }).map((_, i) => {
      const baseDistance = isEmergency ? 0.5 + Math.random() * 1.5 : 
                        safetyStatus === 'alert' ? 1 + Math.random() * 2 : 
                        safetyStatus === 'monitoring' ? 2 + Math.random() * 3 : 
                        3 + Math.random() * 4;
      
      return {
        id: i + 1,
        distance: baseDistance.toFixed(1),
        response: (baseDistance * 2).toFixed(1)
      };
    });
    
    setResponderData(newResponderData.slice(0, responderCount));
    
    // Generate safety metrics
    const newSafetyData = [
      {
        name: 'Risk',
        value: 100 - safetyScore,
        color: '#EF4444'
      },
      {
        name: 'Route',
        value: safetyScore * 0.4,
        color: '#F59E0B'
      },
      {
        name: 'Response',
        value: safetyScore * 0.3,
        color: '#7C3AED'
      },
      {
        name: 'Environment',
        value: safetyScore * 0.3,
        color: '#10B981'
      }
    ];
    
    setSafetyData(newSafetyData);
    
    // Update threat counters
    if (isEmergency) {
      setThreatCounters({
        high: Math.floor(Math.random() * 3) + 2,
        medium: Math.floor(Math.random() * 5) + 3,
        low: Math.floor(Math.random() * 8) + 5,
        neutralized: Math.floor(Math.random() * 10) + 5
      });
    } else if (safetyStatus === 'alert') {
      setThreatCounters({
        high: Math.floor(Math.random() * 2) + 1,
        medium: Math.floor(Math.random() * 4) + 2,
        low: Math.floor(Math.random() * 6) + 3,
        neutralized: Math.floor(Math.random() * 8) + 2
      });
    } else if (safetyStatus === 'monitoring') {
      setThreatCounters({
        high: Math.floor(Math.random() * 1),
        medium: Math.floor(Math.random() * 3) + 1,
        low: Math.floor(Math.random() * 5) + 2,
        neutralized: Math.floor(Math.random() * 6) + 1
      });
    } else {
      setThreatCounters({
        high: 0,
        medium: Math.floor(Math.random() * 1),
        low: Math.floor(Math.random() * 3) + 1,
        neutralized: Math.floor(Math.random() * 4)
      });
    }
  }, [safetyStatus, isEmergency, progress, safetyScore, responderCount]);
  
  const getStatusColor = () => {
    if (isEmergency) return '#EF4444';
    if (safetyStatus === 'alert') return '#F59E0B';
    if (safetyStatus === 'monitoring') return '#7C3AED';
    return '#10B981';
  };
  
  return (
    <>
      {/* Toggle Button */}
      <button 
        className="fixed left-4 top-4 z-40 glass-effect h-10 w-10 rounded-lg flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" 
                fill={getStatusColor()} />
        </svg>
      </button>
      
      {/* Dashboard Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed left-0 top-0 bottom-0 z-30 glass-effect border-r border-[#2D2A5A] w-80 overflow-auto scanline"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#2D2A5A]">
              <div className="flex justify-between items-center">
                <h2 className="text-white font-bold">SEF ANALYTICS</h2>
                <div 
                  className={`h-3 w-3 rounded-full animate-pulse`}
                  style={{ backgroundColor: getStatusColor() }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-[#94A3B8]">Status: {isEmergency ? 'EMERGENCY' : safetyStatus.toUpperCase()}</div>
                <div className="text-xs text-[#94A3B8]">Journey: {Math.round(progress)}%</div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-[#2D2A5A]">
              {['overview', 'safety', 'threats', 'response'].map((tab) => (
                <button 
                  key={tab}
                  className={`flex-1 text-center py-2 text-xs uppercase ${
                    activeTab === tab ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-[#94A3B8]'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 glass-effect rounded-lg">
                      <div className="text-xs text-[#94A3B8]">Safety Score</div>
                      <div className="text-2xl font-bold" 
                           style={{ color: getStatusColor() }}>
                        {safetyScore}%
                      </div>
                    </div>
                    
                    <div className="p-3 glass-effect rounded-lg">
                      <div className="text-xs text-[#94A3B8]">Journey Status</div>
                      <div className="text-sm font-medium text-white">
                        {progress < 33 ? 'Initial Phase' : 
                         progress < 66 ? 'Mid Journey' : 
                         progress < 99 ? 'Final Approach' : 'Arrived'}
                      </div>
                    </div>
                    
                    <div className="p-3 glass-effect rounded-lg">
                      <div className="text-xs text-[#94A3B8]">Transport</div>
                      <div className="text-sm font-medium text-white">
                        {transportMode === 'walking' ? 'Walking' : 
                         transportMode === 'auto' ? 'Auto' : 'Cab'}
                      </div>
                    </div>
                    
                    <div className="p-3 glass-effect rounded-lg">
                      <div className="text-xs text-[#94A3B8]">Environment</div>
                      <div className="text-sm font-medium text-white">
                        {environmentMode === 'day' ? 'Daytime' : 'Nighttime'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Trend */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white text-sm font-medium">Risk Analysis</h3>
                      <div className="text-xs text-[#94A3B8]">24h Trend</div>
                    </div>
                    <div className="glass-effect p-3 rounded-lg h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={riskData}>
                          <defs>
                            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={getStatusColor()} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={getStatusColor()} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="hour" tick={{fill: '#94A3B8', fontSize: 10}} />
                          <YAxis tick={{fill: '#94A3B8', fontSize: 10}} />
                          <Area 
                            type="monotone" 
                            dataKey="risk" 
                            stroke={getStatusColor()} 
                            fillOpacity={1}
                            fill="url(#riskGradient)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="average" 
                            stroke="#7C3AED" 
                            strokeDasharray="3 3"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Summary Metrics */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Current Metrics</h3>
                    <div className="space-y-2">
                      <div className="glass-effect p-3 rounded-lg flex justify-between">
                        <span className="text-[#94A3B8] text-xs">Safe Havens</span>
                        <span className="text-white text-xs">{safeHavenCount} Available</span>
                      </div>
                      <div className="glass-effect p-3 rounded-lg flex justify-between">
                        <span className="text-[#94A3B8] text-xs">Responders</span>
                        <span className="text-white text-xs">{responderCount} Active</span>
                      </div>
                      <div className="glass-effect p-3 rounded-lg flex justify-between">
                        <span className="text-[#94A3B8] text-xs">Threat Level</span>
                        <span className="text-xs" style={{ color: getStatusColor() }}>
                          {isEmergency ? 'Critical' : 
                           safetyStatus === 'alert' ? 'Elevated' :
                           safetyStatus === 'monitoring' ? 'Guarded' : 'Low'}
                        </span>
                      </div>
                      <div className="glass-effect p-3 rounded-lg flex justify-between">
                        <span className="text-[#94A3B8] text-xs">System Status</span>
                        <span className="text-[#10B981] text-xs">Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Safety Tab */}
              {activeTab === 'safety' && (
                <div className="space-y-6">
                  {/* Safety Score Visualization */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Safety Composition</h3>
                    <div className="glass-effect p-4 rounded-lg h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={safetyData} layout="vertical">
                          <XAxis type="number" tick={{fill: '#94A3B8', fontSize: 10}} />
                          <YAxis dataKey="name" type="category" tick={{fill: '#94A3B8', fontSize: 10}} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {safetyData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Risk Distribution */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Risk Distribution</h3>
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-[#94A3B8]">Personal Safety</div>
                        <div className="h-2 bg-[#121225] rounded-full w-32 overflow-hidden">
                          <div 
                            className="h-full" 
                            style={{ 
                              width: `${safetyScore}%`,
                              backgroundColor: safetyScore > 70 ? '#10B981' : safetyScore > 40 ? '#F59E0B' : '#EF4444' 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-white">{safetyScore}%</div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-[#94A3B8]">Route Safety</div>
                        <div className="h-2 bg-[#121225] rounded-full w-32 overflow-hidden">
                          <div 
                            className="h-full bg-[#7C3AED]" 
                            style={{ width: `${Math.min(100, safetyScore + 10)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-white">{Math.min(100, safetyScore + 10)}%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#94A3B8]">Response Ready</div>
                        <div className="h-2 bg-[#121225] rounded-full w-32 overflow-hidden">
                          <div 
                            className="h-full bg-[#10B981]" 
                            style={{ width: `${responderCount * 10 + 30}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-white">{responderCount * 10 + 30}%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Environment Factors */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Environment Factors</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8] mb-1">Time of Day</div>
                        <div className="text-sm text-white">
                          {environmentMode === 'day' ? 'Daytime (Lower Risk)' : 'Nighttime (Higher Risk)'}
                        </div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8] mb-1">Transport</div>
                        <div className="text-sm text-white">
                          {transportMode === 'walking' ? 'Walking (Higher Risk)' : 
                           transportMode === 'auto' ? 'Auto (Medium Risk)' : 'Cab (Lower Risk)'}
                        </div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8] mb-1">Area Profile</div>
                        <div className="text-sm text-white">
                          {safetyScore > 80 ? 'Safe Zone' : 
                           safetyScore > 60 ? 'Moderate Zone' : 
                           safetyScore > 40 ? 'Caution Area' : 'High Alert Area'}
                        </div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8] mb-1">Safe Havens</div>
                        <div className="text-sm text-white">
                          {safeHavenCount} Within Range
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Threats Tab */}
              {activeTab === 'threats' && (
                <div className="space-y-6">
                  {/* Threat Summary */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Threat Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8]">High Threats</div>
                        <div className="text-2xl font-bold text-[#EF4444]">{threatCounters.high}</div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8]">Medium Threats</div>
                        <div className="text-2xl font-bold text-[#F59E0B]">{threatCounters.medium}</div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8]">Low Threats</div>
                        <div className="text-2xl font-bold text-[#7C3AED]">{threatCounters.low}</div>
                      </div>
                      
                      <div className="glass-effect p-3 rounded-lg">
                        <div className="text-xs text-[#94A3B8]">Neutralized</div>
                        <div className="text-2xl font-bold text-[#10B981]">{threatCounters.neutralized}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Threat List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white text-sm font-medium">Recent Threats</h3>
                      <div className="text-xs text-[#94A3B8]">Priority Order</div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                      {isEmergency && (
                        <div className="glass-effect p-3 rounded-lg border-l-2 border-[#EF4444] animate-pulse">
                          <div className="flex justify-between">
                            <div className="text-[#EF4444] text-xs font-medium">ACTIVE EMERGENCY</div>
                            <div className="text-[#94A3B8] text-xs">Now</div>
                          </div>
                          <div className="text-white text-sm mt-1">Emergency response activated by user</div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-[#94A3B8]">Location: Current position</div>
                            <div className="text-xs text-[#EF4444]">Critical</div>
                          </div>
                        </div>
                      )}
                      
                      {Array.from({ length: threatCounters.high }).map((_, i) => (
                        <div key={`high-${i}`} className="glass-effect p-3 rounded-lg border-l-2 border-[#EF4444]">
                          <div className="flex justify-between">
                            <div className="text-[#EF4444] text-xs font-medium">SUSPICIOUS ACTIVITY</div>
                            <div className="text-[#94A3B8] text-xs">{Math.floor(Math.random() * 10) + 1}m ago</div>
                          </div>
                          <div className="text-white text-sm mt-1">
                            {["Group following target", "Hostile approach detected", "Potential ambush point"][Math.floor(Math.random() * 3)]}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-[#94A3B8]">Distance: {(Math.random() * 150 + 50).toFixed(0)}m</div>
                            <div className="text-xs text-[#EF4444]">High Risk</div>
                          </div>
                        </div>
                      ))}
                      
                      {Array.from({ length: threatCounters.medium }).map((_, i) => (
                        <div key={`med-${i}`} className="glass-effect p-3 rounded-lg border-l-2 border-[#F59E0B]">
                          <div className="flex justify-between">
                            <div className="text-[#F59E0B] text-xs font-medium">CAUTION ZONE</div>
                            <div className="text-[#94A3B8] text-xs">{Math.floor(Math.random() * 20) + 5}m ago</div>
                          </div>
                          <div className="text-white text-sm mt-1">
                            {["Low visibility area", "Recent incident report", "Isolated pathway"][Math.floor(Math.random() * 3)]}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-[#94A3B8]">Distance: {(Math.random() * 200 + 100).toFixed(0)}m</div>
                            <div className="text-xs text-[#F59E0B]">Medium Risk</div>
                          </div>
                        </div>
                      ))}
                      
                      {Array.from({ length: threatCounters.low }).map((_, i) => (
                        <div key={`low-${i}`} className="glass-effect p-3 rounded-lg border-l-2 border-[#7C3AED]">
                          <div className="flex justify-between">
                            <div className="text-[#7C3AED] text-xs font-medium">MONITORING</div>
                            <div className="text-[#94A3B8] text-xs">{Math.floor(Math.random() * 30) + 10}m ago</div>
                          </div>
                          <div className="text-white text-sm mt-1">
                            {["Unusual activity pattern", "Potential surveillance", "Crowded area"][Math.floor(Math.random() * 3)]}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-[#94A3B8]">Distance: {(Math.random() * 300 + 150).toFixed(0)}m</div>
                            <div className="text-xs text-[#7C3AED]">Low Risk</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Response Tab */}
              {activeTab === 'response' && (
                <div className="space-y-6">
                  {/* Response Status */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white text-sm font-medium">Response Readiness</h3>
                      <div className={`text-xs font-medium`} style={{ color: getStatusColor() }}>
                        {isEmergency ? 'ACTIVE' : 'STANDBY'}
                      </div>
                    </div>
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-[#94A3B8]">Overall Readiness</div>
                        <div className="h-2 bg-[#121225] rounded-full w-32 overflow-hidden">
                          <div 
                            className="h-full" 
                            style={{ 
                              width: `${isEmergency ? 100 : 85}%`,
                              backgroundColor: isEmergency ? '#EF4444' : '#10B981'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-white">{isEmergency ? 100 : 85}%</div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-[#94A3B8]">Time to Respond</div>
                        <div className="text-xs text-white">
                          {isEmergency ? 'Immediate' : `${Math.floor(Math.random() * 2) + 1} min`}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#94A3B8]">Active Responders</div>
                        <div className="text-xs text-white">{responderCount} Available</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Responder List */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Nearest Responders</h3>
                    <div className="max-h-64 overflow-y-auto no-scrollbar space-y-2">
                      {responderData.map((responder, index) => (
                        <div key={responder.id} className="glass-effect p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                                  index === 0 ? 'bg-[#7C3AED]' : 'bg-[#2D2A5A]'
                                }`}
                              >
                                R{responder.id}
                              </div>
                              <div className="ml-2">
                                <div className="text-white text-sm">Responder #{responder.id}</div>
                                <div className="text-[#94A3B8] text-xs">
                                  {index === 0 ? 'Primary' : 'Backup'} • {responder.distance}km away
                                </div>
                              </div>
                            </div>
                            <div 
                              className={`h-2 w-2 rounded-full ${
                                isEmergency && index < 3 ? 'bg-[#EF4444] animate-pulse' : 'bg-[#10B981]'
                              }`}
                            ></div>
                          </div>
                          <div className="mt-2 text-xs text-[#94A3B8] flex justify-between">
                            <span>Est. Response: {responder.response} min</span>
                            <span className="text-[#10B981]">
                              {isEmergency && index < 2 ? 'En Route' : 'Standing By'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Emergency Controls */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">Emergency Controls</h3>
                    <div className="space-y-2">
                      <button 
                        className={`w-full py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center space-x-2 ${
                          isEmergency ? 'bg-[#2D2A5A]' : 'bg-[#EF4444] hover:bg-[#DC2626]'
                        } transition-colors`}
                        // Removed triggerEmergency reference
                        disabled={isEmergency}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{isEmergency ? 'Emergency Active' : 'Activate Emergency'}</span>
                      </button>
                      
                      {isEmergency && (
                        <button 
                          className="w-full py-2 bg-[#7C3AED] hover:bg-[#6022BB] rounded-lg text-white text-sm font-medium transition-colors"
                          // Removed resetEmergency reference
                        >
                          Cancel Emergency
                        </button>
                      )}
                      
                      <button className="w-full py-2 bg-[#2D2A5A] hover:bg-[#3D3A6A] rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 2V6M8 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Schedule Safety Check</span>
                      </button>
                      
                      <button className="w-full py-2 bg-[#2D2A5A] hover:bg-[#3D3A6A] rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 5H21M3 12H21M3 19H21" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>More Options</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedDataDashboard;