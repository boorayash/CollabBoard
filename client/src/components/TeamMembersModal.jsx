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
  updateMemberRole,
  revokeInvitation
} from '../store/slices/teamSlice';
import { UserPlus, Users, Search, Trash2, Shield, ShieldAlert, UserCheck, UserMinus, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import ErrorDialog from './ErrorDialog';

const TeamMembersModal = ({ open, onClose, teamId, initialTab = 0 }) => {
  const dispatch = useDispatch();
  const { searchResults, teamMembers, isLoading } = useSelector((state) => state.team);
  const { role, message: boardMessage } = useSelector((state) => state.board);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });
  const [invitedUserIds, setInvitedUserIds] = useState([]);

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
    dispatch(inviteMember({ teamId, targetUserId: userId })).then((result) => {
      if (inviteMember.fulfilled.match(result)) {
        setInvitedUserIds(prev => [...prev, userId]);
      }
    });
  };

  const handleRevoke = (userId) => {
    dispatch(revokeInvitation({ teamId, userId })).then((result) => {
      if (revokeInvitation.fulfilled.match(result)) {
        setInvitedUserIds(prev => prev.filter(id => id !== userId));
      }
    });
  };

  const handleRemoveMember = (userId, name) => {
    setConfirmConfig({
      title: 'Remove Member?',
      message: `Are you sure you want to remove ${name} from the team? They will lose all access to boards and tasks.`,
      onConfirm: async () => {
        const result = await dispatch(removeMember({ teamId, userId }));
        if (removeMember.fulfilled.match(result)) {
          setConfirmOpen(false);
        } else {
          setErrorMessage(result.payload || 'Failed to remove member.');
          setErrorOpen(true);
          setConfirmOpen(false);
        }
      }
    });
    setConfirmOpen(true);
  };

  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote' : 'demote';
    
    setConfirmConfig({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Member?`,
      message: `Are you sure you want to ${action} this member to ${newRole}?`,
      onConfirm: async () => {
        const result = await dispatch(updateMemberRole({ teamId, userId, role: newRole }));
        if (updateMemberRole.fulfilled.match(result)) {
          setConfirmOpen(false);
        } else {
          setErrorMessage(result.payload || 'Failed to update role.');
          setErrorOpen(true);
          setConfirmOpen(false);
        }
      }
    });
    setConfirmOpen(true);
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
                    <Avatar sx={{ 
                      bgcolor: 'var(--color-primary)', 
                      width: 40, height: 40, 
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,122,255,0.2)'
                    }}>
                      {(user.name || '?').charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name || 'Anonymous User'} 
                    secondary={user.email} 
                    primaryTypographyProps={{ fontWeight: 600, color: '#1d1d1f', fontSize: '0.85rem' }}
                    secondaryTypographyProps={{ color: 'rgba(29, 29, 31, 0.5)', fontSize: '0.75rem' }}
                  />
                  {(() => {
                    const isInvited = invitedUserIds.includes(user.id);
                    const isMember = teamMembers.some(m => m.userId === user.id);
                    
                    if (isMember) {
                      return <Chip label="Member" size="small" variant="outlined" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.1)' }} />;
                    }

                    return (
                      <Button 
                        variant={isInvited ? "text" : "outlined"} 
                        size="small"
                        onClick={() => isInvited ? handleRevoke(user.id) : handleInvite(user.id)}
                        startIcon={isInvited ? <Check size={14} className="check-icon" /> : null}
                        sx={{ 
                          textTransform: 'none', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          color: isInvited ? 'var(--color-secondary)' : 'var(--color-secondary)',
                          borderColor: isInvited ? 'transparent' : 'rgba(16, 185, 129, 0.4)',
                          borderRadius: 1.5,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { 
                            bgcolor: isInvited ? 'rgba(255, 59, 48, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            borderColor: isInvited ? 'rgba(255, 59, 48, 0.4)' : 'var(--color-secondary)',
                            color: isInvited ? '#FF3B30' : 'var(--color-secondary)',
                            '& .check-icon': { display: 'none' },
                            '&::after': { content: isInvited ? '"Revoke"' : '"Invite"' }
                          },
                          '&::after': { content: isInvited ? '"Requested"' : '"Invite"' }
                        }}
                      >
                        {/* Empty because we use ::after for dynamic text */}
                      </Button>
                    );
                  })()}
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

      <ConfirmDialog 
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Confirm"
        type={confirmConfig.title.includes('Remove') ? 'danger' : 'info'}
      />

      <ErrorDialog 
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Dialog>
  );
};

export default TeamMembersModal;
