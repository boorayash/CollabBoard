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
import { AlertCircle, Trash2, LogOut, Info } from 'lucide-react';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'danger' // 'danger' | 'info' | 'warning'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 size={24} className="text-[#FF3B30]" />;
      case 'warning': return <AlertCircle size={24} className="text-[#FFCC00]" />;
      case 'info': return <Info size={24} className="text-[#007AFF]" />;
      default: return <LogOut size={24} className="text-[#007AFF]" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'danger': return '#FF3B30';
      case 'warning': return '#FFCC00';
      case 'info': return '#007AFF';
      default: return '#007AFF';
    }
  };

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
          bgcolor: `${getColor()}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {getIcon()}
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
      
      <DialogActions sx={{ p: 3, gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            color: 'rgba(29, 29, 31, 0.4)',
            fontSize: '0.9rem',
            px: 3,
            '&:hover': { color: '#1d1d1f', bgcolor: 'transparent' }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            borderRadius: '14px', 
            px: 4,
            height: 44,
            bgcolor: getColor(),
            boxShadow: `0 4px 12px ${getColor()}25`,
            '&:hover': { bgcolor: getColor(), opacity: 0.9, boxShadow: `0 6px 16px ${getColor()}35` }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
