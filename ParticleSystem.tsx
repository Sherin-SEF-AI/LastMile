import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  count?: number;
  intensity?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  count = 50,
  intensity = 1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { safetyStatus, isEmergency, environmentMode, progress } = useSimulation();
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  
  // Initialize particles and start animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to match parent
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create initial particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      initialParticles.push(createParticle(canvas.width, canvas.height));
    }
    setParticles(initialParticles);
    
    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const updatedParticles = particles.map(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update life
        particle.life--;
        
        // Respawn if out of bounds or dead
        if (
          particle.x < -50 || 
          particle.x > canvas.width + 50 || 
          particle.y < -50 || 
          particle.y > canvas.height + 50 ||
          particle.life <= 0
        ) {
          return createParticle(canvas.width, canvas.height);
        }
        
        // Draw particle
        const alpha = (particle.life / particle.maxLife) * 0.6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        // Get color from rgba
        const rgbaMatch = particle.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaMatch) {
          const [, r, g, b] = rgbaMatch.map(Number);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`;
        }
        
        ctx.fill();
        
        // Draw glow for larger particles
        if (particle.radius > 2) {
          const gradient = ctx.createRadialGradient(
            particle.x, 
            particle.y, 
            0,
            particle.x, 
            particle.y, 
            particle.radius * 2
          );
          
          if (rgbaMatch) {
            const [, r, g, b] = rgbaMatch.map(Number);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          } else {
            gradient.addColorStop(0, `rgba(124, 58, 237, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
          }
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        return particle;
      });
      
      setParticles(updatedParticles);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [count]);
  
  // Update particle properties based on simulation state
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Only update colors and behavior, not positions
    setParticles(prev => prev.map(particle => {
      const updatedParticle = { ...particle };
      
      // Particle color based on safety status
      if (isEmergency) {
        updatedParticle.color = 'rgba(239, 68, 68, 0.8)'; // Red for emergency
      } else if (safetyStatus === 'alert') {
        updatedParticle.color = 'rgba(245, 158, 11, 0.8)'; // Yellow/orange for alert
      } else if (safetyStatus === 'monitoring') {
        updatedParticle.color = 'rgba(124, 58, 237, 0.8)'; // Purple for monitoring
      } else {
        updatedParticle.color = 'rgba(16, 185, 129, 0.8)'; // Green for safe
      }
      
      // Adjust velocity for emergency situation
      if (isEmergency) {
        updatedParticle.vx *= 1.5;
        updatedParticle.vy *= 1.5;
      }
      
      // Dimmer particles at night
      if (environmentMode === 'night') {
        const rgbaMatch = updatedParticle.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (rgbaMatch) {
          const [, r, g, b, a] = rgbaMatch.map(Number);
          updatedParticle.color = `rgba(${r}, ${g}, ${b}, ${a * 0.7})`;
        }
      }
      
      return updatedParticle;
    }));
  }, [safetyStatus, isEmergency, environmentMode, progress]);
  
  // Create a particle with random properties
  const createParticle = (width: number, height: number): Particle => {
    const id = Math.random();
    let color = 'rgba(124, 58, 237, 0.8)'; // Default purple
    
    // Adjust color based on safety status
    if (isEmergency) {
      color = 'rgba(239, 68, 68, 0.8)'; // Red for emergency
    } else if (safetyStatus === 'alert') {
      color = 'rgba(245, 158, 11, 0.8)'; // Yellow/orange for alert
    } else if (safetyStatus === 'monitoring') {
      color = 'rgba(124, 58, 237, 0.8)'; // Purple for monitoring
    } else {
      color = 'rgba(16, 185, 129, 0.8)'; // Green for safe
    }
    
    // Randomize particle formation area - concentrate in the center or along the route path
    const formationArea = Math.random();
    
    // Particle size and behavior modified by intensity and simulation state
    const particleIntensity = intensity * (isEmergency ? 1.5 : 1);
    
    let x, y, vx, vy;
    
    if (formationArea < 0.3) {
      // Particles along the route path (curve with bezier approximation)
      const t = Math.random();
      const startX = width * 0.25;
      const startY = height * 0.25;
      const endX = width * 0.75;
      const endY = height * 0.75;
      const cp1x = width * 0.35;
      const cp1y = height * 0.4;
      const cp2x = width * 0.65;
      const cp2y = height * 0.5;
      
      // Bezier formula
      x = Math.pow(1-t, 3) * startX + 
          3 * Math.pow(1-t, 2) * t * cp1x + 
          3 * (1-t) * Math.pow(t, 2) * cp2x + 
          Math.pow(t, 3) * endX;
          
      y = Math.pow(1-t, 3) * startY + 
          3 * Math.pow(1-t, 2) * t * cp1y + 
          3 * (1-t) * Math.pow(t, 2) * cp2y + 
          Math.pow(t, 3) * endY;
      
      // Random offset from path
      x += (Math.random() - 0.5) * 50;
      y += (Math.random() - 0.5) * 50;
      
      // Velocity along path
      const pathDirectionX = 1;
      const pathDirectionY = 1;
      vx = (Math.random() * 0.8 + 0.2) * pathDirectionX * particleIntensity;
      vy = (Math.random() * 0.8 + 0.2) * pathDirectionY * particleIntensity;
    } else if (formationArea < 0.7) {
      // Particles around current user position (approximated based on progress)
      const userPosX = width * (0.25 + (progress / 100) * 0.5);
      const userPosY = height * (0.25 + (progress / 100) * 0.5);
      
      // Random position within a radius of the user
      const radius = 75 + Math.random() * 25;
      const angle = Math.random() * Math.PI * 2;
      x = userPosX + Math.cos(angle) * radius;
      y = userPosY + Math.sin(angle) * radius;
      
      // Velocity toward/around user
      const towardUser = Math.random() > 0.5;
      if (towardUser) {
        const dx = userPosX - x;
        const dy = userPosY - y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        vx = (dx / magnitude) * Math.random() * particleIntensity;
        vy = (dy / magnitude) * Math.random() * particleIntensity;
      } else {
        // Orbital-like motion
        vx = Math.cos(angle + Math.PI/2) * particleIntensity;
        vy = Math.sin(angle + Math.PI/2) * particleIntensity;
      }
    } else {
      // Random particles elsewhere in the scene
      x = Math.random() * width;
      y = Math.random() * height;
      vx = (Math.random() - 0.5) * particleIntensity;
      vy = (Math.random() - 0.5) * particleIntensity;
    }
    
    // Dimmer particles at night
    if (environmentMode === 'night') {
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (rgbaMatch) {
        const [, r, g, b, a] = rgbaMatch.map(Number);
        color = `rgba(${r}, ${g}, ${b}, ${a * 0.7})`;
      }
    }
    
    // Create particle with these properties
    return {
      id,
      x,
      y,
      radius: Math.random() * 2 + 0.5,
      color,
      vx,
      vy,
      life: Math.floor(Math.random() * 200) + 100,
      maxLife: 300
    };
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleSystem;