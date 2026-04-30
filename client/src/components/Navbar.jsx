import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icons from './Icons';

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 20) {
          navRef.current.classList.add('bg-white/80', 'shadow-lg', 'shadow-black/5', 'backdrop-blur-xl');
        } else {
          navRef.current.classList.remove('bg-white/80', 'shadow-lg', 'shadow-black/5', 'backdrop-blur-xl');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-[#1d1d1f] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
            <Icons.Board className="text-white" size={20} />
          </div>
          <span className="font-display font-black text-2xl text-[#1d1d1f] tracking-tighter uppercase">CollabBoard</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[13px] font-black uppercase tracking-widest text-[#1d1d1f]/40">
          <a href="#features" className="hover:text-[#007AFF] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#007AFF] transition-colors">Workflow</a>
          <a href="#pricing" className="hover:text-[#007AFF] transition-colors">Solutions</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-[13px] font-black uppercase tracking-widest text-[#1d1d1f]/40 hover:text-[#1d1d1f] transition-colors hidden sm:block">Log In</Link>
          <Link to="/signup" className="flex items-center justify-center bg-[#1d1d1f] hover:bg-black text-white text-[13px] font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-2xl shadow-black/10 transition-all hover:shadow-black/30 hover:-translate-y-1">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
