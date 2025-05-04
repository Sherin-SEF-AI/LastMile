import { motion } from "framer-motion";

const ResponderCard = () => {
  return (
    <motion.div 
      className="glass-effect rounded-xl p-3 max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <div className="flex items-start mb-1">
        <div 
          className="h-10 w-10 rounded-full bg-cover bg-center mr-2" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80')"}}
        />
        <div>
          <h4 className="text-white text-sm font-medium">Rahul Mehta</h4>
          <p className="text-xs text-gray-300">Nearby Responder (120m)</p>
          <div className="flex items-center mt-1">
            <span className="text-xs bg-[#6025C0] bg-opacity-60 rounded-full px-2 py-0.5 mr-1">First Aid</span>
            <span className="text-xs bg-[#6025C0] bg-opacity-60 rounded-full px-2 py-0.5">Security</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResponderCard;
