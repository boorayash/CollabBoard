import React from 'react';

// Step Card Component
const StepCard = ({ number, icon, title, description, delay = '0ms', onHover, index }) => (
  <div 
    className="relative text-center reveal pt-4" 
    style={{ transitionDelay: delay }}
    onMouseEnter={() => onHover(index)}
  >
    <div className="w-24 h-24 mx-auto glass-card rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg border-2 border-white group cursor-default">
      <span className="absolute font-display text-4xl font-extrabold text-slate-200 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-14 group-hover:scale-75 group-hover:text-brand-600 z-20 group-hover:bg-white group-hover:shadow-md group-hover:px-4 group-hover:py-1 group-hover:rounded-xl border border-transparent group-hover:border-slate-200/60">{number}</span>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 z-10">
        <div className="text-slate-700 group-hover:text-brand-500 transition-colors duration-300">{icon}</div>
      </div>
    </div>
    <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm px-4">{description}</p>
  </div>
);

export default StepCard;
