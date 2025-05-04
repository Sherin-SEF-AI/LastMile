import { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, X, Send, Phone, Video, MicOff, Mic, ChevronRight } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "responder" | "system";
  text: string;
  timestamp: Date;
}

const CommunicationModule = () => {
  const { isEmergency, safetyStatus } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responderStatus, setResponderStatus] = useState<"offline" | "available" | "responding">("available");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize with system message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "system",
        text: "Welcome to the SEF Communication Module. You can chat with nearby responders or get automated assistance here.",
        timestamp: new Date()
      }
    ]);
    
    setQuickReplies([
      "What's your estimated response time?",
      "I need immediate assistance",
      "Call me please"
    ]);
  }, []);
  
  // Auto-open communication module during emergency
  useEffect(() => {
    if (isEmergency && !isOpen) {
      setIsOpen(true);
      
      // Add emergency message
      const newMessage: Message = {
        id: Date.now(),
        sender: "system",
        text: "Emergency mode activated. Contacting nearest responder.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate responder joining
      setTimeout(() => {
        const responderMessage: Message = {
          id: Date.now(),
          sender: "responder",
          text: "This is Rahul from SEF Response Team. I can see you've triggered an emergency alert. Are you in immediate danger? I'm 2 minutes away from your location.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responderMessage]);
        setResponderStatus("responding");
        
        setQuickReplies([
          "Yes, I need help now",
          "I'm safe but uncomfortable",
          "It was a false alarm"
        ]);
      }, 2000);
    }
  }, [isEmergency, isOpen]);
  
  // Add contextual messages based on safety status
  useEffect(() => {
    if (safetyStatus === "monitoring" && messages.length === 1) {
      // Add monitoring message
      setTimeout(() => {
        const newMessage: Message = {
          id: Date.now(),
          sender: "system",
          text: "Your journey is now being monitored. Responders can be contacted through this channel if needed.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
      }, 1000);
    } else if (safetyStatus === "alert" && responderStatus !== "responding") {
      // Add safety alert message
      const alertMessage: Message = {
        id: Date.now(),
        sender: "system",
        text: "Safety alert detected. A responder has been notified and will contact you shortly.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, alertMessage]);
      
      // Simulate responder message
      setTimeout(() => {
        const responderMessage: Message = {
          id: Date.now(),
          sender: "responder",
          text: "Hello, this is Ananya from SEF. I noticed you're in an area with a recent safety alert. Is everything okay?",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responderMessage]);
        setResponderStatus("responding");
        
        setQuickReplies([
          "I'm fine, thank you",
          "I feel uncomfortable",
          "Call me please"
        ]);
      }, 3000);
    }
  }, [safetyStatus, messages.length, responderStatus]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle call timer
  useEffect(() => {
    if (showVoiceCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        setCallDuration(0);
      }
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [showVoiceCall]);
  
  const formatCallDuration = () => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate response
    setTimeout(() => {
      setIsTyping(false);
      
      let responseText = "";
      
      // Generate contextual responses
      if (text.toLowerCase().includes("help") || text.toLowerCase().includes("emergency")) {
        responseText = "I understand you need assistance. What's your current situation? I'm already tracking your location and moving toward you.";
      } else if (text.toLowerCase().includes("call")) {
        responseText = "I'll call you right away. Stay on this line.";
        // Trigger call after response
        setTimeout(() => {
          setShowVoiceCall(true);
        }, 1500);
      } else if (text.toLowerCase().includes("false alarm")) {
        responseText = "I understand this was a false alarm. I'll cancel the emergency response. Please confirm this is correct.";
      } else if (text.toLowerCase().includes("time") || text.toLowerCase().includes("eta")) {
        responseText = "Based on your current location, I should reach you in approximately 2 minutes. Stay in a well-lit area if possible.";
      } else {
        responseText = "I'm on my way to your location. Please stay where you are if it's safe to do so. Is there anything specific I should know before I arrive?";
      }
      
      const responderMessage: Message = {
        id: Date.now(),
        sender: "responder",
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responderMessage]);
      
      // Update quick replies based on context
      if (text.toLowerCase().includes("false alarm")) {
        setQuickReplies([
          "Yes, please cancel the response",
          "No, I still need help",
          "Thanks for checking"
        ]);
      } else {
        setQuickReplies([
          "Where exactly are you now?",
          "How will I recognize you?",
          "I'm moving to a safer location"
        ]);
      }
    }, 1500);
  };
  
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };
  
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const toggleVoiceCall = () => {
    if (!showVoiceCall) {
      // Initiate call
      setShowVoiceCall(true);
      
      // Add system message about call
      const callMessage: Message = {
        id: Date.now(),
        sender: "system",
        text: "Voice call initiated with responder.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, callMessage]);
    } else {
      // End call
      setShowVoiceCall(false);
      
      // Add system message about call ending
      const callEndMessage: Message = {
        id: Date.now(),
        sender: "system",
        text: `Voice call ended. Duration: ${formatCallDuration()}.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, callEndMessage]);
    }
  };
  
  return (
    <>
      {/* Chat icon button */}
      <div className="absolute bottom-20 right-4 z-30">
        <motion.button 
          className={`h-12 w-12 rounded-full ${isOpen ? 'bg-red-500' : 'glass-effect'} flex items-center justify-center relative`}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <MessageSquare className="h-5 w-5 text-white" />
          )}
          
          {!isOpen && responderStatus === "responding" && (
            <motion.div 
              className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>
      
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute bottom-20 right-4 z-30 glass-effect rounded-xl w-80 md:w-96 overflow-hidden shadow-lg"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-[#1E1B4B] p-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div 
                    className="h-8 w-8 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')" }}
                  />
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#1E1B4B] ${
                    responderStatus === "responding" ? "bg-green-500" : 
                    responderStatus === "available" ? "bg-yellow-400" : 
                    "bg-gray-400"
                  }`}></span>
                </div>
                <div className="ml-2">
                  <h3 className="text-white text-sm font-medium">
                    {responderStatus === "responding" ? "Rahul Mehta" : "SEF Communication"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {responderStatus === "responding" ? "Active now" : 
                     responderStatus === "available" ? "Responders available" : 
                     "No responders online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  className="h-8 w-8 rounded-full bg-[#2D2A5A] flex items-center justify-center mr-2"
                  onClick={toggleVoiceCall}
                >
                  <Phone className="h-4 w-4 text-white" />
                </button>
                <button className="h-8 w-8 rounded-full bg-[#2D2A5A] flex items-center justify-center">
                  <Video className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            {/* Voice call overlay */}
            <AnimatePresence>
              {showVoiceCall && (
                <motion.div 
                  className="absolute inset-0 bg-[#1E1B4B] bg-opacity-95 z-10 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div 
                    className="h-20 w-20 rounded-full bg-cover bg-center mb-4"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')" }}
                  />
                  <h3 className="text-white font-medium mb-1">Rahul Mehta</h3>
                  <p className="text-sm text-gray-400 mb-4">{formatCallDuration()}</p>
                  
                  <div className="flex items-center space-x-4">
                    <button 
                      className="h-10 w-10 rounded-full bg-[#2D2A5A] flex items-center justify-center"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <MicOff className="h-5 w-5 text-red-400" />
                      ) : (
                        <Mic className="h-5 w-5 text-white" />
                      )}
                    </button>
                    <button 
                      className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center"
                      onClick={toggleVoiceCall}
                    >
                      <Phone className="h-6 w-6 text-white transform rotate-135" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "responder" && (
                    <div 
                      className="h-8 w-8 rounded-full bg-cover bg-center mr-2 flex-shrink-0"
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')" }}
                    />
                  )}
                  
                  <div 
                    className={`max-w-[75%] p-3 rounded-lg ${
                      message.sender === "user" 
                        ? "bg-[#7C3AED] text-white" 
                        : message.sender === "responder"
                          ? "bg-[#2D2A5A] text-white"
                          : "bg-[#1E1B4B] text-gray-300 text-xs italic"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.sender === "user" && (
                    <div 
                      className="h-8 w-8 rounded-full bg-[#2D2A5A] ml-2 flex items-center justify-center flex-shrink-0"
                    >
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div 
                    className="h-8 w-8 rounded-full bg-cover bg-center mr-2"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')" }}
                  />
                  <div className="bg-[#2D2A5A] px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <motion.div 
                        className="h-2 w-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
                      />
                      <motion.div 
                        className="h-2 w-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
                      />
                      <motion.div 
                        className="h-2 w-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, repeatType: "loop" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick replies */}
            {quickReplies.length > 0 && (
              <div className="px-3 py-2 flex space-x-2 overflow-x-auto no-scrollbar">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="bg-[#2D2A5A] text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex items-center"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Input */}
            <form onSubmit={handleInputSubmit} className="p-3 border-t border-[#2D2A5A]">
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 bg-[#2D2A5A] text-white text-sm p-2 rounded-l-lg focus:outline-none"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-[#7C3AED] text-white p-2 rounded-r-lg"
                  disabled={!inputText.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommunicationModule;