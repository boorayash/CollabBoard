import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchUsers,
  clearSearchResults,
  inviteMember,
  fetchTeamMembers,
  removeMember,
  updateMemberRole
} from '../store/slices/teamSlice';
import { UserPlus, Users, Search, Trash2, Shield, ShieldAlert, UserCheck, UserMinus } from 'lucide-react';

const TeamMembersModal = ({ open, onClose, teamId, initialTab = 0 }) => {
  const dispatch = useDispatch();
  const { searchResults, teamMembers, isLoading } = useSelector((state) => state.team);
  const { role, message: boardMessage } = useSelector((state) => state.board);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (open && teamId) {
      dispatch(fetchTeamMembers(teamId));
    }
  }, [open, teamId, dispatch]);

  useEffect(() => {
    // Force to tab 0 if non-admin tries to open Add User (tab 1)
    if (!isAdmin && initialTab === 1) {
      setTabValue(0);
    } else {
      setTabValue(initialTab);
    }
  }, [initialTab, isAdmin]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0 && teamId) {
       dispatch(fetchTeamMembers(teamId));
    }
    setSearchPerformed(false);
    dispatch(clearSearchResults());
    setSearchTerm('');
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchUsers({ query: searchTerm, exact: true }));
      setSearchPerformed(true);
    }
  };

  const handleInvite = (userId) => {
    dispatch(inviteMember({ teamId, targetUserId: userId }));
  };

  const handleRemoveMember = (userId, name) => {
    if (window.confirm(`Remove ${name} from the team?`)) {
      dispatch(removeMember({ teamId, userId }));
    }
  };

  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote' : 'demote';
    if (window.confirm(`Are you sure you want to ${action} this member?`)) {
      dispatch(updateMemberRole({ teamId, userId, role: newRole }));
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchPerformed(false);
    dispatch(clearSearchResults());
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)'
        }
      }}
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 3,
          color: '#1d1d1f',
          minHeight: '450px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            '& .MuiTab-root': { color: 'rgba(29, 29, 31, 0.6)', textTransform: 'none', fontWeight: 600, minHeight: 64 },
            '& .Mui-selected': { color: 'var(--color-primary) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
          }}
        >
          <Tab icon={<Users size={18} />} iconPosition="start" label="Members" />
          {isAdmin && <Tab icon={<UserPlus size={18} />} iconPosition="start" label="Add User" />}
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, p: 2 }}>
        {tabValue === 0 && (
          <List sx={{ pt: 0 }}>
            {teamMembers && teamMembers.length > 0 ? teamMembers.map((member) => (
              <ListItem 
                key={member.userId} 
                sx={{ 
                  px: 1, mb: 1, 
                  borderRadius: 2, 
                  '&:hover': { bgcolor: 'rgba(29, 29, 31, 0.05)' }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: member.role === 'ADMIN' ? 'var(--color-primary)' : 'rgba(29, 29, 31, 0.1)',
                    color: member.role === 'ADMIN' ? '#fff' : '#1d1d1f',
                    width: 40, height: 40
                  }}>
                    {member.user?.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {member.user?.name || 'Unknown'}
                      {member.role === 'ADMIN' && (
                        <Tooltip title="Team Admin">
                          <Shield size={14} color="var(--color-primary)" />
                        </Tooltip>
                      )}
                    </Box>
                  } 
                  secondary={member.userId === currentUser?.id ? 'You' : member.user?.email} 
                  primaryTypographyProps={{ fontWeight: 600, color: '#1d1d1f' }}
                  secondaryTypographyProps={{ color: 'rgba(29, 29, 31, 0.5)', fontSize: '0.75rem' }}
                />
                
                {isAdmin && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={member.role === 'ADMIN' ? "Demote to Member" : "Promote to Admin"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleRole(member.userId, member.role)}
                        sx={{ color: 'rgba(29, 29, 31, 0.4)', '&:hover': { color: 'var(--color-secondary)' } }}
                      >
                        {member.role === 'ADMIN' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                      </IconButton>
                    </Tooltip>
                    
                    {member.userId !== currentUser?.id && (
                      <Tooltip title="Remove from Team">
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveMember(member.userId, member.user?.name)}
                          sx={{ color: 'rgba(29, 29, 31, 0.4)', '&:hover': { color: '#ff4444', background: 'rgba(255,68,68,0.1)' } }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </ListItem>
            )) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
                {isLoading ? <CircularProgress size={24} /> : (
                  <Typography variant="body2" sx={{ color: 'rgba(29, 29, 31, 0.5)' }}>
                    No members found.
                  </Typography>
                )}
              </Box>
            )}
          </List>
        )}

        {tabValue === 1 && isAdmin && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                autoFocus
                placeholder="Enter exact name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                sx={{ 
                  input: { color: '#1d1d1f' }, 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' }, 
                    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
                    '&.Mui-focused fieldset': { 
                      borderColor: 'var(--color-primary)',
                      borderWidth: '1px'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 4px rgba(59,130,246,0.15)'
                    }
                  } 
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
                sx={{ minWidth: 48, bgcolor: 'var(--color-primary)', borderRadius: 1.5 }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : <Search size={20} />}
              </Button>
            </Box>

            <List>
              {searchResults.map((user) => (
                <ListItem 
                  key={user.id} 
                  sx={{ 
                    px: 1, 
                    bgcolor: 'rgba(29, 29, 31, 0.03)', 
                    borderRadius: 2, 
                    mb: 1,
                    border: '1px solid rgba(29, 29, 31, 0.05)'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 32, height: 32, fontSize: '0.9rem' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name} 
                    secondary={user.email} 
                    primaryTypographyProps={{ fontWeight: 600, color: '#1d1d1f', fontSize: '0.85rem' }}
                    secondaryTypographyProps={{ color: 'rgba(29, 29, 31, 0.5)', fontSize: '0.75rem' }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleInvite(user.id)}
                    sx={{ 
                      textTransform: 'none', 
                      fontSize: '0.75rem', 
                      color: 'var(--color-secondary)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--color-secondary)' }
                    }}
                  >
                    Invite
                  </Button>
                </ListItem>
              ))}
              {searchPerformed && searchResults.length === 0 && !isLoading && (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(29, 29, 31, 0.5)', mt: 2 }}>
                  No user found with that exact name or email.
                </Typography>
              )}
              {!searchPerformed && (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(29, 29, 31, 0.4)', mt: 4 }}>
                  Invite a partner to collaborate.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button onClick={handleClose} sx={{ color: 'rgba(29, 29, 31, 0.6)', textTransform: 'none', fontWeight: 500, px: 3 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersModal;
