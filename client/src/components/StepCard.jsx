import React from 'react';

// Step Card Component
const StepCard = ({ number, icon, title, description, delay = '0ms', onHover, index }) => (
  <div 
    className="relative text-center reveal pt-4" 
    style={{ transitionDelay: delay }}
    onMouseEnter={() => onHover(index)}
  >
    <div className="w-28 h-28 mx-auto glass-card rounded-[32px] flex items-center justify-center mb-8 relative z-10 shadow-xl border border-white/80 group cursor-default hover:scale-110 transition-all duration-500">
      <span className="absolute font-display text-5xl font-black text-[#1d1d1f]/5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-0 group-hover:scale-150 z-20">{number}</span>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-50 group-hover:scale-100 z-10">
        <div className="text-[#007AFF] transition-colors duration-300">{icon}</div>
      </div>
      {/* Background Number indicator on hover */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1d1d1f] text-white text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg">
        {number}
      </div>
    </div>
    <h3 className="font-display text-2xl font-black text-[#1d1d1f] mb-3 tracking-tight">{title}</h3>
    <p className="text-[#1d1d1f]/40 text-[15px] font-medium leading-relaxed px-6">{description}</p>
  </div>
);

export default StepCard;
