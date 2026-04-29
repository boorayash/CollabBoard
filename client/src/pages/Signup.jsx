import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signup, reset } from '../store/slices/authSlice';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      navigate('/board/default');
    }
    dispatch(reset());
  }, [isSuccess, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password };
    dispatch(signup(userData));
  };

  return (
    <div className="w-full h-screen relative flex items-center justify-center overflow-hidden z-0">
      {/* Background Orbs to match the application aesthetic */}
      <div className="fluid-bg absolute inset-0 z-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative z-10 w-full max-w-md p-10 rounded-[32px] flex flex-col items-center mx-4 my-8"
      >
        <h1 className="font-display font-extrabold text-[32px] tracking-tight text-[#1d1d1f] mb-2 text-center mt-2">
          Join CollabBoard
        </h1>
        <p className="text-[#1d1d1f]/60 font-medium text-[15px] mb-8 text-center">
          Create your account to start collaborating
        </p>

        {isError && (
          <div className="w-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] px-4 py-3 rounded-2xl mb-6 text-sm font-semibold flex items-center justify-center">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold uppercase tracking-[1px] text-[#1d1d1f]/70 ml-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autoComplete="name"
              autoFocus
              value={name}
              onChange={onChange}
              className="w-full bg-[#1d1d1f]/5 border border-[#1d1d1f]/10 rounded-2xl px-5 py-3.5 text-[15px] text-[#1d1d1f] font-medium transition-all placeholder-[#1d1d1f]/30 focus:bg-white/60 focus:border-[#007AFF]/50 focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 focus:shadow-sm"
              placeholder="Your Name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold uppercase tracking-[1px] text-[#1d1d1f]/70 ml-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={onChange}
              className="w-full bg-[#1d1d1f]/5 border border-[#1d1d1f]/10 rounded-2xl px-5 py-3.5 text-[15px] text-[#1d1d1f] font-medium transition-all placeholder-[#1d1d1f]/30 focus:bg-white/60 focus:border-[#007AFF]/50 focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 focus:shadow-sm"
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold uppercase tracking-[1px] text-[#1d1d1f]/70 ml-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={onChange}
              className="w-full bg-[#1d1d1f]/5 border border-[#1d1d1f]/10 rounded-2xl px-5 py-3.5 text-[15px] text-[#1d1d1f] font-medium transition-all placeholder-[#1d1d1f]/30 focus:bg-white/60 focus:border-[#007AFF]/50 focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 focus:shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-br from-[#007AFF] to-[#0056b3] text-white rounded-2xl py-3.5 font-bold text-[16px] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(0,122,255,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(0,122,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center mt-4 text-[14px] font-medium text-[#1d1d1f]/60">
            Already have an account?{' '}
            <Link to="/login" className="text-[#007AFF] font-bold hover:underline underline-offset-4 transition-all">
              Log In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
