import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icons from '../components/Icons';
import Navbar from '../components/Navbar';
import BoardPreview from '../components/BoardPreview';
import StepCard from '../components/StepCard';
import useMouseTilt from '../hooks/useMouseTilt';
import useReveal from '../hooks/useReveal';

const Landing = () => {
  useReveal();
  const [activeStep, setActiveStep] = useState(0);
  const heroRef = useRef(null);
  const { tilt, mousePos } = useMouseTilt(heroRef);

  return (
    <div className="h-screen w-full font-sans text-[#1d1d1f] overflow-y-auto overflow-x-hidden relative selection:bg-[#007AFF]/10 selection:text-[#007AFF]">
      {/* Fluid Background Orbs - Matching Board UI */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#f0f4f8]">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
      </div>

      <Navbar />

      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-10 lg:pt-20 pb-20 overflow-visible">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/60 bg-white/40 text-[#007AFF] text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]" />
                </span>
                Now with Real-time Multi-User assignment
              </div>
              <h1 className="font-display text-6xl lg:text-7xl xl:text-[84px] font-extrabold text-[#1d1d1f] leading-[0.95] tracking-tight mb-8">
                The Board Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00c6ff]">Teams Sync.</span>
              </h1>
              <p className="text-lg lg:text-xl text-[#1d1d1f]/60 mb-10 leading-relaxed max-w-lg font-medium">
                Ditch the lag. Experience the most fluid, real-time Kanban workspace designed for high-velocity teams who need to stay perfectly in sync.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link to="/signup" className="flex items-center justify-center bg-[#007AFF] hover:bg-[#0062cc] text-white text-[17px] font-bold px-10 py-4.5 rounded-2xl shadow-xl shadow-[#007AFF]/25 transition-all hover:shadow-2xl hover:-translate-y-1 gap-3">
                  Start Building
                  <Icons.ArrowRight />
                </Link>
                <button className="glass bg-white/50 text-[#1d1d1f] hover:text-black text-[17px] font-bold px-10 py-4.5 rounded-2xl transition-all hover:bg-white/80 border border-white/80">
                  Live Preview
                </button>
              </div>

              <div className="mt-12 flex items-center gap-5 text-sm text-[#1d1d1f]/40 font-bold uppercase tracking-wider">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-xl border-2 border-white bg-blue-100 flex items-center justify-center text-[#007AFF] font-black text-xs shadow-sm">YB</div>
                  <div className="w-10 h-10 rounded-xl border-2 border-white bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs shadow-sm">AK</div>
                  <div className="w-10 h-10 rounded-xl border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs shadow-sm">SP</div>
                </div>
                <p>Loved by 500+ Agile Teams</p>
              </div>
            </div>

            <div className="relative w-full h-[580px] reveal" style={{ transitionDelay: '200ms' }}>
              <BoardPreview tilt={tilt} mousePos={mousePos} />
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="max-w-7xl mx-auto px-6 py-14 border-y border-white/20 reveal">
          <p className="text-center text-[10px] font-black tracking-[0.3em] text-[#1d1d1f]/20 uppercase mb-10">Optimized for high-performance workflows</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-3 font-display font-black text-2xl text-[#1d1d1f]"><Icons.Activity /> VELOCITY</div>
            <div className="flex items-center gap-3 font-display font-black text-2xl text-[#1d1d1f]"><Icons.Layout /> GRID SYSTEM</div>
            <div className="flex items-center gap-3 font-display font-black text-2xl text-[#1d1d1f]"><Icons.Users /> CORE TEAM</div>
            <div className="flex items-center gap-3 font-display font-black text-2xl text-[#1d1d1f]"><Icons.Check /> SYNCED</div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-6 tracking-tight">Built for the future of work</h2>
            <p className="text-lg text-[#1d1d1f]/50 font-medium leading-relaxed">CollabBoard strips away the noise, leaving you with a powerful, crystal-clear interface that actually helps you ship faster.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="glass-card rounded-[32px] p-10 hover:-translate-y-3 transition-all duration-500 reveal group">
              <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] mb-8 group-hover:scale-110 group-hover:bg-[#007AFF] group-hover:text-white transition-all duration-500 shadow-sm">
                <Icons.Activity size={28} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#1d1d1f] mb-4">Zero-Latency Sync</h3>
              <p className="text-[#1d1d1f]/50 leading-relaxed font-medium">Powered by ultra-fast WebSockets. See changes, comments, and task movements the exact millisecond they happen.</p>
            </div>

            <div className="glass-card rounded-[32px] p-10 hover:-translate-y-3 transition-all duration-500 reveal group" style={{ transitionDelay: '100ms' }}>
              <div className="w-16 h-16 rounded-2xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mb-8 group-hover:scale-110 group-hover:bg-[#34C759] group-hover:text-white transition-all duration-500 shadow-sm">
                <Icons.Users size={28} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#1d1d1f] mb-4">Multi-User Focus</h3>
              <p className="text-[#1d1d1f]/50 leading-relaxed font-medium">Assign tasks to multiple teammates simultaneously. No more confusion about who owns what part of the workflow.</p>
            </div>

            <div className="glass-card rounded-[32px] p-10 hover:-translate-y-3 transition-all duration-500 reveal group" style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm">
                <Icons.Layout size={28} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#1d1d1f] mb-4">Fluid Kanban</h3>
              <p className="text-[#1d1d1f]/50 leading-relaxed font-medium">A drag-and-drop experience that feels like butter. Infinite columns, custom categories, and automated task priorities.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-24 reveal">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-6 tracking-tight">Your workflow, evolved</h2>
              <p className="text-lg text-[#1d1d1f]/50 max-w-2xl mx-auto font-medium">CollabBoard is built to be intuitive. No training required, just raw productivity from day one.</p>
            </div>

            <div className="relative max-w-5xl mx-auto group/steps" onMouseLeave={() => setActiveStep(0)}>
              {/* Segmented Connector 1 */}
              <div className="hidden md:block absolute top-[68px] left-[21%] w-[23%] h-[2px] z-0">
                <div className="absolute inset-0 connector-track opacity-20" />
                <div 
                  className="absolute inset-y-0 left-0 bg-[#007AFF] transition-all duration-700 ease-out pointing-arrow text-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]"
                  style={{ width: activeStep === 1 ? '100%' : '0%', opacity: activeStep === 1 ? 1 : 0 }}
                />
              </div>

              {/* Segmented Connector 2 */}
              <div className="hidden md:block absolute top-[68px] left-[56%] w-[23%] h-[2px] z-0">
                <div className="absolute inset-0 connector-track opacity-20" />
                <div 
                  className="absolute inset-y-0 left-0 bg-[#007AFF] transition-all duration-700 ease-out pointing-arrow text-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]"
                  style={{ width: activeStep === 2 ? '100%' : '0%', opacity: activeStep === 2 ? 1 : 0 }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-16 relative">
                <StepCard index={1} onHover={setActiveStep} number={1} icon={<Icons.Plus size={24} />} title="Define Logic" description="Set up your protected workflow columns and custom task categories." />
                <StepCard index={2} onHover={setActiveStep} number={2} icon={<Icons.Users size={24} />} title="Sync Team" description="Invite collaborators via unique board links. Real-time presence active instantly." delay="100ms" />
                <StepCard index={3} onHover={setActiveStep} number={3} icon={<Icons.Check size={24} />} title="Ship Together" description="Move tasks, assign owners, and watch your board evolve in real-time." delay="200ms" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-32 reveal">
          <div className="glass-card rounded-[3rem] p-16 text-center relative overflow-hidden border border-white/80 shadow-[0_40px_100px_rgba(0,0,0,0.06)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-64 bg-[#007AFF]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-display text-5xl md:text-6xl font-extrabold text-[#1d1d1f] mb-8 tracking-tighter">Ready to clear the chaos?</h2>
              <p className="text-xl text-[#1d1d1f]/50 mb-12 max-w-2xl mx-auto font-medium">Join thousands of teams who have already switched to a calmer, more visual way of working.</p>

              <Link to="/signup" className="inline-block bg-[#1d1d1f] hover:bg-black text-white text-[19px] font-bold px-12 py-5 rounded-2xl shadow-2xl shadow-black/20 transition-all hover:shadow-black/40 hover:-translate-y-1.5">
                Get Started for Free
              </Link>
              <p className="mt-8 text-xs text-[#1d1d1f]/30 font-black uppercase tracking-[0.2em]">Unlimited boards during early access</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/40 backdrop-blur-xl pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1d1d1f] flex items-center justify-center shadow-lg">
                  <Icons.Board className="text-white" size={20} />
                </div>
                <span className="font-display font-black text-2xl text-[#1d1d1f] tracking-tighter uppercase">CollabBoard</span>
              </div>
              <p className="text-sm text-[#1d1d1f]/40 font-medium max-w-[240px]">
                The world's fastest real-time collaboration engine for modern teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-12 text-[13px] font-black text-[#1d1d1f]/40 uppercase tracking-widest">
              <a href="#" className="hover:text-[#007AFF] transition-colors">Platform</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors">Resources</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors">Company</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors">Security</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/5 pt-8">
            <div className="text-[11px] font-bold text-[#1d1d1f]/20 uppercase tracking-[0.2em]">
              © 2026 CollabBoard Inc. Built for the high-velocity era.
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center"><Icons.Activity size={16} className="opacity-40" /></div>
              <div className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center"><Icons.Users size={16} className="opacity-40" /></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
