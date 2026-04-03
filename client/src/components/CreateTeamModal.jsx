import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTeam
} from '../store/slices/teamSlice';

const CreateTeamModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.team);

  const [teamName, setTeamName] = useState('');
  const [projectName, setProjectName] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !projectName.trim()) return;

    // Create Team and Board
    const resultAction = await dispatch(createTeam({ name: teamName, projectName }));

    if (createTeam.fulfilled.match(resultAction)) {
      handleClose();
    }
  };

  const handleClose = () => {
    setTeamName('');
    setProjectName('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)',
          borderRadius: 3,
          color: '#fff',
          minWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Create a New Team</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Team Name"
          variant="outlined"
          fullWidth
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.7)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } } }}
        />
        <TextField
          label="Project Title (Initial Board)"
          variant="outlined"
          fullWidth
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          sx={{ input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.7)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleCreateTeam}
          disabled={!teamName.trim() || !projectName.trim() || isLoading}
          sx={{
            background: 'var(--color-primary)',
            '&:hover': { background: 'var(--color-primary-hover)' },
            '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
          }}
        >
          Create Team
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTeamModal;
