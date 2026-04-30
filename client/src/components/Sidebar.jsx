import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { LogOut, LayoutDashboard, Plus, Check, X, Users, MoreVertical, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../store/slices/authSlice';
import { fetchMyTeams, fetchInvitations, respondToInvite, setCurrentTeam } from '../store/slices/teamSlice';
import CreateTeamModal from './CreateTeamModal';
import EditProfileModal from './EditProfileModal';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTeams, invitations, currentTeam } = useSelector((state) => state.team);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    dispatch(fetchMyTeams());
    dispatch(fetchInvitations());
  }, [dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const handleRespond = (teamId, action) => {
    dispatch(respondToInvite({ teamId, action })).then(() => {
      if (action === 'ACCEPT') {
        dispatch(fetchMyTeams());
      }
    });
  };

  return (
    <aside className="w-[260px] flex-shrink-0 h-[calc(100vh-48px)] rounded-[32px] flex flex-col p-6 relative overflow-hidden glass-panel z-10 transition-all duration-500">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#34C759] flex items-center justify-center shadow-lg">
          <LayoutDashboard color="#ffffff" size={20} />
        </div>
        <span className="font-display text-[22px] tracking-tight font-extrabold text-[#1d1d1f]">
          CollabBoard
        </span>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 -mr-1 custom-scrollbar">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-40">
            My Teams
          </span>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="w-6 h-6 rounded-full bg-[#1d1d1f]/5 flex items-center justify-center text-[#1d1d1f] transition-all hover:bg-[#1d1d1f]/10"
          >
            <Plus size={14} />
          </button>
        </div>
        
        <div className="flex flex-col gap-1.5 mb-6">
          {myTeams.map((team) => {
            const isActive = currentTeam?.id === team.id;
            return (
              <button
                key={team.id}
                onClick={() => dispatch(setCurrentTeam(team))}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#007AFF]/10 text-[#007AFF] shadow-[inset_0_0_0_1px_rgba(0,122,255,0.2)]' 
                    : 'text-[#1d1d1f]/70 bg-transparent hover:bg-white hover:text-[#1d1d1f] hover:shadow-sm'
                }`}
              >
                <Users size={18} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                {team.name}
              </button>
            );
          })}
          {myTeams.length === 0 && (
            <span className="text-xs opacity-40 px-3 font-medium">No teams yet.</span>
          )}
        </div>

        {invitations.length > 0 && (
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#007AFF] mb-3 px-2 block">
              Invitations
            </span>
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div key={inv.teamId} className="p-3 rounded-[20px] bg-white/40 border border-white/60 shadow-sm backdrop-blur-md">
                  <span className="text-[13px] font-semibold text-[#1d1d1f] mb-2 block">
                    {inv.team.name}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRespond(inv.teamId, 'ACCEPT')}
                      className="flex-1 py-1.5 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center transition-all hover:bg-[#34C759]/20"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleRespond(inv.teamId, 'REJECT')}
                      className="flex-1 py-1.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center transition-all hover:bg-[#FF3B30]/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateTeamModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      <div className="h-px w-full bg-[#1d1d1f]/5 my-5" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#1d1d1f] to-[#3a3a3c] flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[14px] font-bold text-[#1d1d1f] leading-tight truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[12px] font-medium opacity-50 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          
          <IconButton 
            onClick={handleMenuOpen} 
            size="small" 
            sx={{ color: '#1d1d1f', opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <MoreVertical size={16} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                minWidth: '150px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
              }
            }}
          >
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                setEditProfileOpen(true);
              }}
              sx={{ fontSize: '14px', gap: 1.5, py: 1.5 }}
            >
              <Edit2 size={16} className="text-[#007AFF]" />
              <span className="font-semibold text-[#1d1d1f]">Edit Profile</span>
            </MenuItem>
          </Menu>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-3 rounded-2xl border-2 border-[#1d1d1f]/5 text-[#1d1d1f] font-semibold flex items-center justify-center gap-2 transition-all hover:border-[#1d1d1f]/10 hover:bg-[#1d1d1f] hover:text-white group"
        >
          <LogOut size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
          Logout
        </button>
      </div>
      
      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </aside>
  );
};

export default Sidebar;
