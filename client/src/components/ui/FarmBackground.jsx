import React from 'react';

const FarmBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#F5F3EA] text-[#17201B] overflow-x-hidden selection:bg-[#2F7D4A]/20 selection:text-[#123C2A]">
      {/* ── SUBTLE AGRICULTURAL DIGITAL NETWORK CANVAS LAYER ───────────────── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#F5F3EA] overflow-hidden">
        {/* Subtle Topographic / Soil Grid Accents */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#123C2A 1px, transparent 1px), radial-gradient(#2F7D4A 1px, #F5F3EA 1px)`,
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px'
          }}
        />

        {/* Soft Organic Atmospheric Glow (Non-distracting, warm daylight) */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-gradient-to-b from-[#E8EFE4] to-transparent blur-[100px] pointer-events-none opacity-60" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-[#D9A441]/5 blur-[120px] pointer-events-none" />
      </div>

      {/* ── FOREGROUND CONTENT LAYER ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default FarmBackground;
