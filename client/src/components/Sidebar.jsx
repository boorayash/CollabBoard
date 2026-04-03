import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, Avatar, IconButton } from '@mui/material';
import { LogOut, LayoutDashboard, Plus, Check, X, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../store/slices/authSlice';
import { fetchMyTeams, fetchInvitations, respondToInvite, setCurrentTeam } from '../store/slices/teamSlice';
import CreateTeamModal from './CreateTeamModal';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTeams, invitations } = useSelector((state) => state.team);

  const [createModalOpen, setCreateModalOpen] = useState(false);

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
    <Box
      sx={{
        width: 250,
        height: '100vh',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1.5 }}>
        <LayoutDashboard color="var(--color-primary)" size={28} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          CollabBoard
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mr: -1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '1px' }}>
            My Teams
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setCreateModalOpen(true)}
            sx={{ color: 'var(--color-primary)', bgcolor: 'rgba(124, 58, 237, 0.1)', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.2)' } }}
          >
            <Plus size={16} />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {myTeams.map((team) => (
            <Button
              key={team.id}
              variant="text"
              startIcon={<Users size={16} />}
              onClick={() => dispatch(setCurrentTeam(team))}
              sx={{
                justifyContent: 'flex-start',
                color: 'rgba(255,255,255,0.8)',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff'
                }
              }}
            >
              {team.name}
            </Button>
          ))}
          {myTeams.length === 0 && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', px: 1 }}>
              No teams yet.
            </Typography>
          )}
        </Box>

        {invitations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ color: 'var(--color-secondary)', fontWeight: 600, letterSpacing: '1px', display: 'block', mb: 1 }}>
              Invitations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {invitations.map((inv) => (
                <Box key={inv.teamId} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
                    {inv.team.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => handleRespond(inv.teamId, 'ACCEPT')}
                      sx={{ flex: 1, minWidth: 0, p: 0.5, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' } }}
                    >
                      <Check size={16} />
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleRespond(inv.teamId, 'REJECT')}
                      sx={{ flex: 1, minWidth: 0, p: 0.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                    >
                      <X size={16} />
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <CreateTeamModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      <Divider sx={{ borderColor: 'var(--glass-border)', mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'var(--color-secondary)', width: 36, height: 36 }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogOut size={18} />}
          onClick={onLogout}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            borderColor: 'var(--glass-border)',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
              background: 'rgba(255,255,255,0.05)',
            },
            '&:active': {
              transform: 'scale(0.98)'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
