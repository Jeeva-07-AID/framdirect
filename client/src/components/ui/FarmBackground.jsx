import React from 'react';
import { motion } from 'framer-motion';

const FarmBackground = ({ children }) => {
  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden">
      {/* ── BACKGROUND DECORATIVE LAYER ──────────────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#020617] overflow-hidden">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#052e16] via-[#020617] to-[#020617]" />
        
        {/* Soft Glowing Sun */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-20 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"
        />

        {/* Floating Clouds */}
        {[1, 2, 3].map((cloud) => (
          <motion.div
            key={cloud}
            initial={{ x: '-20%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.5, 0] }}
            transition={{ 
              duration: 60 + (cloud * 20), 
              repeat: Infinity, 
              delay: cloud * 10, 
              ease: "linear" 
            }}
            className="absolute top-[10%] left-0 w-[400px] h-[100px] bg-white/5 blur-[60px] rounded-full pointer-events-none"
            style={{ top: `${15 * cloud}%` }}
          />
        ))}

        {/* Ambient Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{ 
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.4, 0] 
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "easeInOut"
            }}
            style={{ 
              width: p.size, 
              height: p.size, 
              left: `${p.x}%`, 
              top: `${p.y}%` 
            }}
            className="absolute bg-emerald-400/30 rounded-full blur-[2px] pointer-events-none"
          />
        ))}

        {/* Parallax Ground Layers */}
        <div className="absolute bottom-0 left-0 w-full h-[30%] pointer-events-none">
          {/* Grass Layer 1 (Back) */}
          <div className="absolute bottom-[-10%] w-full flex justify-around opacity-30">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ 
                  duration: 4 + Math.random() * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
                style={{ height: 100 + Math.random() * 50 }}
                className="w-1 bg-gradient-to-t from-emerald-900 to-transparent rounded-full origin-bottom"
              />
            ))}
          </div>

          {/* Grass Layer 2 (Front) */}
          <div className="absolute bottom-[-5%] w-full flex justify-around">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: Math.random() * 1
                }}
                style={{ height: 150 + Math.random() * 80 }}
                className="w-1.5 bg-gradient-to-t from-emerald-800/40 to-transparent rounded-full origin-bottom blur-[1px]"
              />
            ))}
          </div>
        </div>

        {/* Overlay Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      </div>

      {/* ── FOREGROUND CONTENT LAYER ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default FarmBackground;
