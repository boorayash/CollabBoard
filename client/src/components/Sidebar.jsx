import React from 'react';
import { Box, Typography, Button, Divider, Avatar } from '@mui/material';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
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

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '1px' }}>
          Your Boards
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              color: 'var(--color-primary)',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                background: 'rgba(124, 58, 237, 0.2)',
              }
            }}
          >
            Main Board
          </Button>
          {/* Future dynamic boards outline can go here */}
        </Box>
      </Box>

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
