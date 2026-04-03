import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TextField, Stack, Skeleton, 
  IconButton, Tooltip, Menu, MenuItem, ListItemIcon, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { fetchBoards, createList, createBoard } from '../store/slices/boardSlice';
import { leaveTeam, setCurrentTeam } from '../store/slices/teamSlice';
import KanbanBoard from '../components/KanbanBoard';
import Sidebar from '../components/Sidebar';
import TeamMembersModal from '../components/TeamMembersModal';
import { Plus, UserPlus, Users, Settings, LogOut } from 'lucide-react';
import { getInitialRank } from '../utils/ranks';

const Board = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newBoardName, setNewBoardName] = useState('');
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState(0);

  // Settings Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const openSettings = Boolean(anchorEl);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { currentTeam } = useSelector((state) => state.team);
  const { boards, isLoading } = useSelector((state) => state.board);
  
  const board = boards.find((b) => b.id === id) || boards[0];
  const teamId = currentTeam?.id || board?.teamId || user?.teamId;

  useEffect(() => {
    if (teamId) {
      dispatch(fetchBoards(teamId));
    }
  }, [dispatch, teamId]);

  const onCreateBoard = () => {
    if (newBoardName.trim() && teamId) {
      dispatch(createBoard({ name: newBoardName, teamId }));
      setNewBoardName('');
    }
  };

  const onAddList = () => {
    const name = prompt('Enter list name:');
    if (name && board) {
      dispatch(createList({ name, boardId: board.id, rank: getInitialRank(board.lists?.length || 0) }));
    }
  };

  const openMembersModal = (tab) => {
    setInitialModalTab(tab);
    setMembersModalOpen(true);
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleLeaveTeam = async () => {
    if (teamId) {
      const result = await dispatch(leaveTeam(teamId));
      if (leaveTeam.fulfilled.match(result)) {
        setLeaveDialogOpen(false);
        setAnchorEl(null);
        navigate('/board/default');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, px: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
              {currentTeam?.name || 'Project Board'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              {board?.name || 'Loading...'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Button 
              variant="text" 
              startIcon={<Users size={18} />}
              onClick={() => openMembersModal(0)}
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontWeight: 600, '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' } }}
            >
              View Members
            </Button>
            <Button 
              variant="contained" 
              startIcon={<UserPlus size={18} />}
              onClick={() => openMembersModal(1)}
              sx={{ 
                bgcolor: 'rgba(124, 58, 237, 0.1)', 
                color: 'var(--color-primary)', 
                textTransform: 'none', 
                fontWeight: 600,
                border: '1px solid rgba(124, 58, 237, 0.2)',
                '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.2)', border: '1px solid var(--color-primary)' }
              }}
            >
              Add User
            </Button>
            
            <IconButton 
              onClick={handleSettingsClick}
              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' } }}
            >
              <Settings size={20} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openSettings}
              onClose={handleSettingsClose}
              PaperProps={{
                sx: { 
                  mt: 1.5, 
                  bgcolor: '#1e1e1e', 
                  color: '#fff', 
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  '& .MuiMenuItem-root': { py: 1.5, px: 2 }
                }
              }}
            >
              <MenuItem onClick={() => setLeaveDialogOpen(true)} sx={{ color: '#ff4444' }}>
                <ListItemIcon sx={{ color: '#ff4444' }}>
                  <LogOut size={18} />
                </ListItemIcon>
                Leave Team
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Kanban Area */}
        <Box sx={{ flexGrow: 1, p: 4, overflowX: 'auto', overflowY: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: board ? 'flex-start' : 'center', position: 'relative' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', gap: 3, height: '100%', width: '100%' }}>
              <Skeleton variant="rounded" width={320} height={500} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
              <Skeleton variant="rounded" width={320} height={300} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
              <Skeleton variant="rounded" width={320} height={400} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
            </Box>
          ) : board ? (
            <>
              {(!board.lists || board.lists.length === 0) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: 3 }}>
                  <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    Create your first list
                  </Typography>
                  <Button 
                    onClick={onAddList} 
                    variant="contained" 
                    startIcon={<Plus size={20} />}
                    sx={{ 
                      bgcolor: 'var(--color-primary)', height: 48, px: 4, borderRadius: 2,
                      textTransform: 'none', fontSize: '1rem',
                      '&:hover': { bgcolor: '#6d28d9' },
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                  >
                  Add List
                  </Button>
                </Box>
              ) : (
                <>
                  <KanbanBoard initialData={board.lists} />
                  <Button 
                    onClick={onAddList} 
                    variant="outlined" 
                    startIcon={<Plus size={20} />}
                    sx={{ 
                      minWidth: 280, 
                      ml: 2, 
                      height: 56, 
                      borderRadius: 2,
                      border: '1px dashed var(--glass-border)', 
                      color: 'rgba(255,255,255,0.7)',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(var(--glass-blur))',
                      textTransform: 'none',
                      fontSize: '1rem',
                      flexShrink: 0,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'var(--color-secondary)'
                      },
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                  >
                  Add List
                  </Button>
                </>
              )}
            </>
          ) : (
            <Stack spacing={3} alignItems="center" sx={{ 
              mt: 10, p: 5, borderRadius: 3, 
              background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--glass-border)'
             }}>
               <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>Welcome to CollabBoard!</Typography>
               <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>You don't have any boards yet. Create your first one to get started.</Typography>
               <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <TextField 
                    size="small" 
                    fullWidth
                    placeholder="Board Name (e.g. Sprint 1)" 
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.2)', 
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': { 
                        '& fieldset': { borderColor: 'var(--glass-border)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' }
                      },
                      input: { color: '#fff' }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={onCreateBoard} 
                    disabled={!newBoardName.trim()}
                    sx={{ 
                      bgcolor: 'var(--color-primary)', textTransform: 'none',
                      '&:hover': { bgcolor: '#6d28d9' }
                    }}
                  >
                    Create Board
                  </Button>
               </Stack>
            </Stack>
          )}
        </Box>
      </Box>

      <TeamMembersModal 
        open={membersModalOpen} 
        onClose={() => setMembersModalOpen(false)} 
        teamId={teamId}
        initialTab={initialModalTab}
      />

      {/* Leave Team Confirmation Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid var(--glass-border)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Leave Team?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to leave this team? You will lose access to all boards and data associated with it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeaveDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleLeaveTeam} 
            variant="contained" 
            color="error"
            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
          >
            Leave Team
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Board;
