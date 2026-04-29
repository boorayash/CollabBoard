import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icons from './Icons';

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 20) {
          navRef.current.classList.add('bg-white/70', 'shadow-sm');
        } else {
          navRef.current.classList.remove('bg-white/70', 'shadow-sm');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 transition-all duration-300 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0284c7] to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Icons.Logo />
          </div>
          <span className="font-display font-bold text-xl text-slate-800 tracking-tight">CollabBoard</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="text-slate-600 hover:text-brand-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
          <a href="#pricing" className="text-slate-600 hover:text-brand-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors hidden sm:block">Log In</Link>
          <Link to="/signup" className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg shadow-slate-900/10 transition-all hover:shadow-xl hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
