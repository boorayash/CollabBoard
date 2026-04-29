import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTeam } from '../store/slices/teamSlice';

const CreateTeamModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.team);
  const [teamName, setTeamName] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    const resultAction = await dispatch(createTeam({ name: teamName }));
    if (createTeam.fulfilled.match(resultAction)) {
      handleClose();
    }
  };

  const handleClose = () => {
    setTeamName('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          minWidth: '400px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
          p: 2
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
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleCreateTeam(); }
          }}
          sx={{
            input: { color: '#1d1d1f' },
            label: { color: 'rgba(29, 29, 31, 0.7)' },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)', borderWidth: '1px' },
              '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(59,130,246,0.15)' }
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          sx={{ color: 'rgba(29, 29, 31, 0.7)', textTransform: 'none', fontWeight: 500, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateTeam}
          disabled={!teamName.trim() || isLoading}
          sx={{
            background: 'var(--color-primary)',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            '&:hover': { background: '#0062cc', boxShadow: '0 6px 16px rgba(0, 122, 255, 0.4)' },
            '&:disabled': { background: 'rgba(29, 29, 31, 0.05)', color: 'rgba(29, 29, 31, 0.3)', boxShadow: 'none' }
          }}
        >
          {isLoading ? 'Creating…' : 'Create Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTeamModal;
