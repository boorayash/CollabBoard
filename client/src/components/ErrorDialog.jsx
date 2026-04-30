import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Box, 
  Typography 
} from '@mui/material';
import { ShieldAlert, X } from 'lucide-react';

const ErrorDialog = ({ 
  open, 
  onClose, 
  title = 'Action Prohibited', 
  message 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
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
          borderRadius: 4,
          color: '#1d1d1f',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 3, pb: 1 }}>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '14px', 
          bgcolor: 'rgba(255, 59, 48, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShieldAlert size={24} className="text-[#FF3B30]" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, tracking: '-0.02em' }}>
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <DialogContentText sx={{ color: 'rgba(29, 29, 31, 0.6)', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          fullWidth
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            borderRadius: '14px', 
            height: 48,
            bgcolor: '#1d1d1f',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#000000', boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }
          }}
        >
          Understood
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
