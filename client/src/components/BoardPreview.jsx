import React from 'react';
import Icons from './Icons';

// STATIC UI PREVIEW: Treats it exactly like a demo, removing Redux/Sockets/DND.
const BoardPreview = ({ tilt, mousePos }) => {
  const getColumnTint = (name) => {
    const n = name.toLowerCase();
    if (n.includes('backlog')) return 'rgba(0, 122, 255, 0.04)';
    if (n.includes('progress')) return 'rgba(52, 199, 89, 0.04)';
    if (n.includes('review')) return 'rgba(255, 215, 0, 0.04)';
    return 'rgba(255, 255, 255, 0.04)';
  };

  return (
    <div className="relative w-full h-[540px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#007AFF]/10 blur-3xl rounded-full" />
      
      <div 
        className="absolute inset-0 glass-card rounded-[2.5rem] p-5 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/80 flex flex-col transition-transform duration-200 ease-out perspective-1000"
        style={{ 
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Gloss Reflection Layer */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] gloss-reflection z-30" 
          style={{ 
            opacity: 0.3,
            transform: `translateX(${tilt.y * 3}px) translateY(${tilt.x * 3}px)`
          }}
        />

        {/* Live Status Chips (Floating) */}
        <div 
          className="absolute -top-6 -left-6 z-40 transition-transform duration-500 ease-out"
          style={{ transform: `translateZ(80px) translate(${tilt.y * 2}px, ${tilt.x * 2}px)` }}
        >
          <div className="glass px-5 py-2.5 rounded-2xl border border-white/80 shadow-2xl flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
            </span>
            <span className="text-[12px] font-black text-[#1d1d1f] tracking-tight uppercase">Live Session</span>
          </div>
        </div>

        <div 
          className="absolute -bottom-6 -right-6 z-40 transition-transform duration-500 ease-out"
          style={{ transform: `translateZ(60px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)` }}
        >
          <div className="glass px-5 py-2.5 rounded-2xl border border-white/80 shadow-2xl flex items-center gap-2.5">
            <span className="text-[12px] font-black text-[#1d1d1f]/40 uppercase tracking-widest">Enterprise Sync</span>
            <div className="w-5 h-5 rounded-lg bg-[#007AFF] flex items-center justify-center shadow-lg">
              <Icons.Check className="text-white" size={12} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-3 border-b border-black/5 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#00c6ff] flex items-center justify-center shadow-lg">
              <Icons.Board className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-display font-black text-[#1d1d1f] text-xl leading-none mb-1 tracking-tight">Core Infrastructure</h3>
              <p className="text-[11px] text-[#1d1d1f]/30 font-bold uppercase tracking-wider">Board Alpha-9</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              <div className="w-9 h-9 rounded-xl border-2 border-white bg-blue-100 flex items-center justify-center text-[#007AFF] font-black text-xs shadow-sm">YB</div>
              <div className="w-9 h-9 rounded-xl border-2 border-white bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs shadow-sm">AK</div>
              <div className="w-9 h-9 rounded-xl border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs shadow-sm">SP</div>
            </div>
            <button className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1d1d1f]/40 transition-colors">
              <Icons.More size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-5 overflow-hidden hide-scrollbar px-3 relative" style={{ transform: 'translateZ(30px)' }}>
          {/* Backlog Column */}
          <div 
            className="w-[280px] flex-shrink-0 flex flex-col reveal glass-column rounded-[28px] px-4 pb-4 pt-5 h-full border border-white/40"
            style={{ '--column-tint': getColumnTint('backlog') }}
          >
            <div className="flex items-center justify-between mb-5 px-1 border-b border-white/10 pb-4">
              <h4 className="font-black text-[#1d1d1f] text-[13px] uppercase tracking-widest flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-black/10" />
                Backlog
              </h4>
              <span className="text-[11px] font-black bg-white/60 text-[#1d1d1f]/40 px-3 py-1 rounded-full border border-white/80">3</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4.5 shadow-sm border border-white/90 hover:border-[#007AFF]/30 transition-all group cursor-grab">
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">Priority</span>
                </div>
                <p className="text-[14.5px] font-bold text-[#1d1d1f] mb-4 leading-tight">Database migration strategy</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1d1d1f]/20 font-black text-[10px]">
                    <Icons.Comments size={14} />
                    <span>12</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-blue-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-[#007AFF]">YB</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4.5 shadow-sm border border-white/90 hover:border-[#007AFF]/30 transition-all group cursor-grab">
                <p className="text-[14.5px] font-bold text-[#1d1d1f] mb-4 leading-tight">Implement global design tokens</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1d1d1f]/20 font-black text-[10px]">
                    <Icons.Paperclip size={14} />
                    <span>2</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-emerald-700">AK</div>
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div 
            className="w-[280px] flex-shrink-0 flex flex-col reveal glass-column rounded-[28px] px-4 pb-4 pt-5 h-full border border-white/40" 
            style={{ 
              transitionDelay: '100ms',
              '--column-tint': getColumnTint('progress')
            }}
          >
            <div className="flex items-center justify-between mb-5 px-1 border-b border-white/10 pb-4">
              <h4 className="font-black text-[#1d1d1f] text-[13px] uppercase tracking-widest flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.5)]" />
                Active
              </h4>
              <span className="text-[11px] font-black bg-[#34C759]/10 text-[#34C759] px-3 py-1 rounded-full border border-[#34C759]/20">2</span>
            </div>
            <div className="flex flex-col gap-4 relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4.5 shadow-sm border border-white/90">
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[#007AFF]/10 text-[#007AFF]">Engineering</span>
                </div>
                <p className="text-[14.5px] font-bold text-[#1d1d1f] mb-4 leading-tight">WebSocket load balancing</p>
                <div className="w-full bg-black/5 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div className="bg-[#007AFF] h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="w-6 h-6 rounded-lg bg-blue-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-[#007AFF]">YB</div>
              </div>

              {/* Dragging Card */}
              <div className="absolute top-[140px] left-[-15px] w-full bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-[#007AFF] rotate-2 z-10 scale-105 transition-transform cursor-grabbing">
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">Design</span>
                </div>
                <p className="text-[15px] font-black text-[#1d1d1f] mb-4 leading-tight">User flow optimization v2</p>
                <div className="w-6 h-6 rounded-lg bg-amber-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-amber-700">SP</div>
              </div>

              {/* Drop Zone */}
              <div className="mt-[120px] border-2 border-dashed border-black/5 rounded-2xl h-[110px] bg-black/[0.02]" />
            </div>
          </div>
        </div>

        {/* David's Cursor (with Magnetism) */}
        <div 
          className="absolute top-[35%] left-[18%] z-20 pointer-events-none transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translateZ(100px) translate(${(mousePos.x - 0.2) * 50}px, ${(mousePos.y - 0.4) * 50}px)`,
          }}
        >
          <div className="animate-cursor-float">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              <path d="M5.65376 21.2587L4.54922 2.66207C4.46011 1.15939 6.09675 0.285854 7.27985 1.19934L21.328 12.0463C22.4217 12.8906 22.1287 14.6548 20.7818 15.0886L14.7702 17.0253C14.4764 17.1199 14.223 17.3061 14.0456 17.5562L10.3703 22.7388C9.57143 23.8649 7.82869 23.7513 7.18525 22.5358L5.65376 21.2587Z" fill="#007AFF" stroke="white" strokeWidth="2.5" />
            </svg>
            <div className="absolute top-6 left-5 bg-[#007AFF] text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-wider">YASH</div>
          </div>
        </div>

        {/* Sarah's Cursor (with Magnetism) */}
        <div 
          className="absolute top-[65%] left-[48%] z-20 pointer-events-none transition-transform duration-700 ease-out"
          style={{ 
            transform: `translateZ(120px) translate(${(mousePos.x - 0.45) * 80}px, ${(mousePos.y - 0.6) * 80}px)`,
          }}
        >
          <div className="animate-cursor-float" style={{ animationDelay: '1s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              <path d="M5.65376 21.2587L4.54922 2.66207C4.46011 1.15939 6.09675 0.285854 7.27985 1.19934L21.328 12.0463C22.4217 12.8906 22.1287 14.6548 20.7818 15.0886L14.7702 17.0253C14.4764 17.1199 14.223 17.3061 14.0456 17.5562L10.3703 22.7388C9.57143 23.8649 7.82869 23.7513 7.18525 22.5358L5.65376 21.2587Z" fill="#34C759" stroke="white" strokeWidth="2.5" />
            </svg>
            <div className="absolute top-6 left-5 bg-[#34C759] text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-wider">SARAH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPreview;
