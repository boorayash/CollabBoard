import React, { useState, useEffect } from 'react';
import { Dialog, CircularProgress } from '@mui/material';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';

const EditProfileModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return setError('Name is required');
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const payload = { name: formData.name };
      if (formData.password) {
        payload.password = formData.password;
      }
      
      await dispatch(updateProfile(payload)).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to update profile');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-display text-[#1d1d1f]">Edit Profile</h2>
          <button onClick={onClose} className="text-[#1d1d1f]/50 hover:text-[#1d1d1f] transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f]/70 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-[#1d1d1f]/10 bg-white/50 focus:bg-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[15px]"
              placeholder="Your name"
            />
          </div>

          <div className="pt-2 border-t border-[#1d1d1f]/10">
            <p className="text-xs text-[#1d1d1f]/50 mb-3 uppercase tracking-wider font-semibold">Change Password (Optional)</p>
            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1d1d1f]/10 bg-white/50 focus:bg-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[15px]"
                  placeholder="New password"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1d1d1f]/10 bg-white/50 focus:bg-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none transition-all text-[15px]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-semibold shadow-md transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </Dialog>
  );
};

export default EditProfileModal;
