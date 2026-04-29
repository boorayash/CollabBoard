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
    <div className="h-screen w-full font-sans text-slate-600 bg-[#f8fafc] overflow-y-auto overflow-x-hidden relative selection:bg-brand-100 selection:text-brand-900">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/50 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-200/50 mix-blend-multiply filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-pink-100/50 mix-blend-multiply filter blur-[130px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-10 lg:pt-20 pb-20 overflow-visible">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-brand-200 bg-brand-50/50 text-brand-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                CollabBoard v2.0 is live
              </div>
              <h1 className="font-display text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Collaborate in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500 animate-gradient-x">Real-Time.</span><br />Build Together.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                The ultimate drag-and-drop workspace that brings your team, tasks, and ideas into one fluid, sync-perfect environment.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/signup" className="flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 gap-2">
                  Start for free
                  <Icons.ArrowRight />
                </Link>
                <button className="glass text-slate-700 hover:text-slate-900 text-base font-semibold px-8 py-3.5 rounded-full transition-all hover:bg-white/60">
                  Book a Demo
                </button>
              </div>

              <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">JD</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs">AS</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">MR</div>
                </div>
                <p>Trusted by 10,000+ teams globally</p>
              </div>
            </div>

            <div className="relative w-full h-[540px] reveal" style={{ transitionDelay: '200ms' }}>
              <BoardPreview tilt={tilt} mousePos={mousePos} />
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="max-w-7xl mx-auto px-6 py-12 border-y border-slate-200/50 reveal">
          <p className="text-center text-sm font-semibold tracking-wider text-slate-400 uppercase mb-8">Built for fast-moving teams, modern students, and agile developers</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><div className="w-6 h-6 rounded bg-slate-800" />Acme Corp</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><div className="w-6 h-6 rounded-full bg-slate-800" />GlobalTech</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-slate-800" />Nexus</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><div className="w-6 h-6 rotate-45 bg-slate-800" />Stark Ind</div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to ship faster</h2>
            <p className="text-lg text-slate-600">Ditch the clunky enterprise tools. CollabBoard gives you the exact features you need without the bloat, wrapped in a beautiful interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 reveal group">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                <Icons.Activity />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Real-time collaboration</h3>
              <p className="text-slate-600 leading-relaxed">See cursors fly across the screen, tasks update instantly, and comments appear live. Work together as if you're in the same room.</p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 reveal group" style={{ transitionDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Icons.Mobile />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Drag & drop simplicity</h3>
              <p className="text-slate-600 leading-relaxed">No complicated menus. Grab a task, drop it where it belongs. Reorder columns, priorities, and lists with a fluid, natural motion.</p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 reveal group" style={{ transitionDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <Icons.Layout />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Organized workflows</h3>
              <p className="text-slate-600 leading-relaxed">Create custom boards for sprints, content calendars, or personal to-dos. Tag, assign, and track progress without losing the big picture.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20 reveal">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">From zero to syncing in seconds</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Getting started shouldn't be a project itself. We designed the onboarding to be as frictionless as the app.</p>
            </div>

            <div className="relative max-w-5xl mx-auto group/steps" onMouseLeave={() => setActiveStep(0)}>
              {/* Segmented Connector 1 (Between 1 and 2) */}
              <div className="hidden md:block absolute top-[68px] left-[21%] w-[23%] h-[2px] z-0">
                {/* Background Track */}
                <div className="absolute inset-0 connector-track opacity-30" />
                {/* Active Highlight */}
                <div 
                  className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-500 ease-out pointing-arrow text-brand-500 shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  style={{ width: activeStep === 1 ? '100%' : '0%', opacity: activeStep === 1 ? 1 : 0 }}
                />
              </div>

              {/* Segmented Connector 2 (Between 2 and 3) */}
              <div className="hidden md:block absolute top-[68px] left-[56%] w-[23%] h-[2px] z-0">
                {/* Background Track */}
                <div className="absolute inset-0 connector-track opacity-30" />
                {/* Active Highlight */}
                <div 
                  className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-500 ease-out pointing-arrow text-brand-500 shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  style={{ width: activeStep === 2 ? '100%' : '0%', opacity: activeStep === 2 ? 1 : 0 }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                <StepCard index={1} onHover={setActiveStep} number={1} icon={<Icons.Plus />} title="Create a board" description="Start from scratch or use a template tailored to your specific workflow." />
                <StepCard index={2} onHover={setActiveStep} number={2} icon={<Icons.Users />} title="Invite your team" description="Send a quick link or email invite. They jump straight into the board, no signup required for viewing." delay="100ms" />
                <StepCard index={3} onHover={setActiveStep} number={3} icon={<Icons.Check />} title="Start collaborating" description="See changes instantly. Assign tasks, leave comments, and move work forward together." delay="200ms" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-24 reveal">
          <div className="glass-card rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/80 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-brand-200/50 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Ready to clear the chaos?</h2>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Join thousands of teams who have already switched to a calmer, more visual way of working.</p>

              <Link to="/signup" className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold px-10 py-4 rounded-full shadow-xl shadow-slate-900/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                Start collaborating today
              </Link>
              <p className="mt-6 text-sm text-slate-500 font-medium">Free forever plan available. No credit card required.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-md pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-slate-800">CollabBoard</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">Product</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Company</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Legal</a>
            </div>
          </div>
          <div className="text-center text-sm text-slate-400">
            © 2024 CollabBoard Inc. Designed with clarity.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
