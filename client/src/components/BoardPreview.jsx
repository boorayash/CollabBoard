import React from 'react';
import Icons from './Icons';

// STATIC UI PREVIEW: Treats it exactly like a demo, removing Redux/Sockets/DND.
const BoardPreview = ({ tilt, mousePos }) => {
  const getColumnTint = (name) => {
    const n = name.toLowerCase();
    if (n.includes('backlog')) return 'rgba(0, 122, 255, 0.04)';
    if (n.includes('progress')) return 'rgba(255, 255, 255, 0.06)';
    if (n.includes('review')) return 'rgba(255, 153, 0, 0.04)';
    return 'rgba(255, 255, 255, 0.04)';
  };

  return (
    <div className="relative w-full h-[540px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-200/20 blur-3xl rounded-full" />
      
      <div 
        className="absolute inset-0 glass-card rounded-[2rem] p-4 shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-white flex flex-col transition-transform duration-200 ease-out perspective-1000"
        style={{ 
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Gloss Reflection Layer */}
        <div 
          className="absolute inset-0 rounded-[2rem] gloss-reflection z-30" 
          style={{ 
            opacity: 0.4,
            transform: `translateX(${tilt.y * 2}px) translateY(${tilt.x * 2}px)`
          }}
        />

        {/* Live Status Chips (Floating) */}
        <div 
          className="absolute -top-6 -left-6 z-40 transition-transform duration-500 ease-out"
          style={{ transform: `translateZ(60px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)` }}
        >
          <div className="glass px-4 py-2 rounded-full border border-white/80 shadow-lg flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-700 tracking-tight">4 ONLINE</span>
          </div>
        </div>

        <div 
          className="absolute -bottom-6 -right-6 z-40 transition-transform duration-500 ease-out"
          style={{ transform: `translateZ(40px) translate(${tilt.y * 1.2}px, ${tilt.x * 1.2}px)` }}
        >
          <div className="glass px-4 py-2 rounded-full border border-white/80 shadow-lg flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">CLOUD SYNCED</span>
            <Icons.Check />
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 px-2 border-b border-slate-200/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <Icons.Board />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-lg leading-none mb-1">Product Roadmap Q3</h3>
              <p className="text-xs text-slate-500 font-medium">Updated just now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
              <img src="https://i.pravatar.cc/100?img=2" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
              <img src="https://i.pravatar.cc/100?img=3" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">+2</div>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
              <Icons.More />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden hide-scrollbar px-2 relative" style={{ transform: 'translateZ(20px)' }}>
          {/* Backlog Column */}
          <div 
            className="w-[260px] flex-shrink-0 flex flex-col reveal glass-column rounded-2xl px-3.5 pb-3.5 pt-4 h-full"
            style={{ '--column-tint': getColumnTint('backlog') }}
          >
            <div className="flex items-center justify-between mb-4 px-1 border-b border-white/10 pb-3">
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                Backlog
              </h4>
              <span className="text-xs font-medium bg-slate-200/40 text-slate-600 px-2.5 py-0.5 rounded-full border border-white/10">3</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-brand-200 transition-colors group cursor-grab">
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700">Research</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">Competitor analysis for AI features</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Icons.Comments />
                    <span>2</span>
                  </div>
                  <img src="https://i.pravatar.cc/100?img=4" className="w-5 h-5 rounded-full" alt="Assignee" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-brand-200 transition-colors group cursor-grab">
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Design</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">Design system update (Tokens & Components)</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Icons.Paperclip />
                    <span>1</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-slate-200 border border-dashed border-slate-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-brand-200 transition-colors group cursor-grab">
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">User interviews round 2</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400">Sep 15</span>
                  <img src="https://i.pravatar.cc/100?img=5" className="w-5 h-5 rounded-full" alt="Assignee" />
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div 
            className="w-[260px] flex-shrink-0 flex flex-col reveal glass-column rounded-2xl px-3.5 pb-3.5 pt-4 h-full" 
            style={{ 
              transitionDelay: '100ms',
              '--column-tint': getColumnTint('progress')
            }}
          >
            <div className="flex items-center justify-between mb-4 px-1 border-b border-white/10 pb-3">
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                In Progress
              </h4>
              <span className="text-xs font-medium bg-brand-100/40 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200/20">2</span>
            </div>
            <div className="flex flex-col gap-3 relative">
              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100">
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">Engineering</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">Implement Socket.IO for live cursors</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-5 h-5 rounded-full" alt="Assignee" />
                </div>
              </div>

              {/* Dragging Card */}
              <div className="absolute top-[130px] left-[-10px] w-full bg-white rounded-xl p-3.5 shadow-2xl border-2 border-brand-400 rotate-3 z-10 scale-105 transition-transform cursor-grabbing">
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">Marketing</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">Draft launch day email sequence</p>
                <div className="flex items-center justify-between mt-auto">
                  <img src="https://i.pravatar.cc/100?img=2" className="w-5 h-5 rounded-full" alt="Assignee" />
                </div>
              </div>

              {/* Drop Zone */}
              <div className="mt-[110px] border-2 border-dashed border-slate-200 rounded-xl h-[100px] bg-slate-50/50" />
            </div>
          </div>

          {/* Review Column */}
          <div 
            className="w-[260px] flex-shrink-0 flex flex-col reveal glass-column rounded-2xl px-3.5 pb-3.5 pt-4 h-full" 
            style={{ 
              transitionDelay: '200ms',
              '--column-tint': getColumnTint('review')
            }}
          >
            <div className="flex items-center justify-between mb-4 px-1 border-b border-white/10 pb-3">
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                Review
              </h4>
              <span className="text-xs font-medium bg-slate-200/40 text-slate-600 px-2.5 py-0.5 rounded-full border border-white/10">1</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Design</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">Landing page v1 mockups</p>
                <div className="flex items-center gap-2 mt-auto">
                  <img src="https://i.pravatar.cc/100?img=3" className="w-5 h-5 rounded-full" alt="Assignee" />
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Ready for review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* David's Cursor (with Magnetism) */}
        <div 
          className="absolute top-[40%] left-[20%] z-20 pointer-events-none transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translateZ(50px) translate(${(mousePos.x - 0.2) * 40}px, ${(mousePos.y - 0.4) * 40}px)`,
          }}
        >
          <div className="animate-cursor-float">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <path d="M5.65376 21.2587L4.54922 2.66207C4.46011 1.15939 6.09675 0.285854 7.27985 1.19934L21.328 12.0463C22.4217 12.8906 22.1287 14.6548 20.7818 15.0886L14.7702 17.0253C14.4764 17.1199 14.223 17.3061 14.0456 17.5562L10.3703 22.7388C9.57143 23.8649 7.82869 23.7513 7.18525 22.5358L5.65376 21.2587Z" fill="#3B82F6" stroke="white" strokeWidth="2" />
            </svg>
            <div className="absolute top-5 left-4 bg-[#3B82F6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">David</div>
          </div>
        </div>

        {/* Sarah's Cursor (with Magnetism) */}
        <div 
          className="absolute top-[60%] left-[45%] z-20 pointer-events-none transition-transform duration-700 ease-out"
          style={{ 
            transform: `translateZ(70px) translate(${(mousePos.x - 0.45) * 60}px, ${(mousePos.y - 0.6) * 60}px)`,
          }}
        >
          <div className="animate-cursor-float" style={{ animationDelay: '1s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <path d="M5.65376 21.2587L4.54922 2.66207C4.46011 1.15939 6.09675 0.285854 7.27985 1.19934L21.328 12.0463C22.4217 12.8906 22.1287 14.6548 20.7818 15.0886L14.7702 17.0253C14.4764 17.1199 14.223 17.3061 14.0456 17.5562L10.3703 22.7388C9.57143 23.8649 7.82869 23.7513 7.18525 22.5358L5.65376 21.2587Z" fill="#F43F5E" stroke="white" strokeWidth="2" />
            </svg>
            <div className="absolute top-5 left-4 bg-[#F43F5E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">Sarah</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPreview;
