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
      PaperProps={{
        sx: {
          background: '#1e1e1e',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 3,
          color: '#fff',
          minHeight: '450px'
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid var(--glass-border)',
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 600, minHeight: 64 },
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
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: member.role === 'ADMIN' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
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
                  primaryTypographyProps={{ fontWeight: 600, color: '#fff' }}
                  secondaryTypographyProps={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}
                />
                
                {isAdmin && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={member.role === 'ADMIN' ? "Demote to Member" : "Promote to Admin"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleRole(member.userId, member.role)}
                        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'var(--color-secondary)' } }}
                      >
                        {member.role === 'ADMIN' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                      </IconButton>
                    </Tooltip>
                    
                    {member.userId !== currentUser?.id && (
                      <Tooltip title="Remove from Team">
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveMember(member.userId, member.user?.name)}
                          sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#ff4444', background: 'rgba(255,68,68,0.1)' } }}
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
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ 
                  input: { color: '#fff' }, 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' }
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
                    bgcolor: 'rgba(255,255,255,0.02)', 
                    borderRadius: 2, 
                    mb: 1,
                    border: '1px solid rgba(255,255,255,0.05)'
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
                    primaryTypographyProps={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}
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
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', mt: 2 }}>
                  No user found with that exact name or email.
                </Typography>
              )}
              {!searchPerformed && (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', mt: 4 }}>
                  Invite a partner to collaborate.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersModal;
