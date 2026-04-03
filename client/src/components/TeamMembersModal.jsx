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
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchUsers,
  clearSearchResults,
  inviteMember,
  fetchTeamMembers
} from '../store/slices/teamSlice';
import { UserPlus, Users, Search } from 'lucide-react';

const TeamMembersModal = ({ open, onClose, teamId, initialTab = 0 }) => {
  const dispatch = useDispatch();
  const { searchResults, teamMembers, isLoading } = useSelector((state) => state.team);
  
  const [tabValue, setTabValue] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    if (open && teamId) {
      dispatch(fetchTeamMembers(teamId));
    }
  }, [open, teamId, dispatch]);

  useEffect(() => {
    setTabValue(initialTab);
  }, [initialTab]);

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
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
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
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: 'var(--color-primary) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
          }}
        >
          <Tab icon={<Users size={18} />} iconPosition="start" label="Members" />
          <Tab icon={<UserPlus size={18} />} iconPosition="start" label="Add User" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, p: 2 }}>
        {tabValue === 0 && (
          <List sx={{ pt: 0 }}>
            {teamMembers && teamMembers.length > 0 ? teamMembers.map((member) => (
              <ListItem key={member.id} sx={{ px: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'var(--color-secondary)' }}>
                    {member.user?.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={member.user?.name || 'Unknown User'} 
                  secondary={member.user?.email || 'No email'} 
                  primaryTypographyProps={{ fontWeight: 600, color: '#fff' }}
                  secondaryTypographyProps={{ color: 'rgba(255,255,255,0.5)' }}
                />
              </ListItem>
            )) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
                {isLoading ? <CircularProgress size={24} /> : (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    No members found or loading...
                  </Typography>
                )}
              </Box>
            )}
          </List>
        )}

        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter exact name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ 
                  input: { color: '#fff' }, 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                  } 
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
                sx={{ minWidth: 'auto', bgcolor: 'var(--color-primary)' }}
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
                    bgcolor: 'rgba(255,255,255,0.03)', 
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
                    primaryTypographyProps={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleInvite(user.id)}
                    sx={{ 
                      textTransform: 'none', 
                      fontSize: '0.75rem', 
                      color: 'var(--color-secondary)',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--color-secondary)' }
                    }}
                  >
                    Send Invite
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
                  Search for a user to invite them.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersModal;
