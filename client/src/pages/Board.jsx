import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Stack, Skeleton,
  Menu, MenuItem, ListItemIcon, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { fetchBoards, createList, resetBoardDeleted, updateBoard } from '../store/slices/boardSlice';
import { leaveTeam, fetchTeamMembers } from '../store/slices/teamSlice';
import KanbanBoard from '../components/KanbanBoard';
import Sidebar from '../components/Sidebar';
import TeamMembersModal from '../components/TeamMembersModal';
import ChatDrawer from '../components/ChatDrawer';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorDialog from '../components/ErrorDialog';
import { Plus, UserPlus, Users, Settings, LogOut, Pencil, Check, X, MessageCircle, LayoutList } from 'lucide-react';
import { getInitialRank } from '../utils/ranks';
import { connectSocket, disconnectSocket, joinBoard, leaveBoard } from '../socket/socketClient';
import { setupBoardListeners, cleanupBoardListeners } from '../socket/boardEvents';

const Board = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [myTasksFilter, setMyTasksFilter] = useState(false);

  // Board rename state
  const [isRenamingBoard, setIsRenamingBoard] = useState(false);
  const [boardNameDraft, setBoardNameDraft] = useState('');
  const renameInputRef = useRef(null);

  // New List State
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const openSettings = Boolean(anchorEl);

  const { user } = useSelector((state) => state.auth);
  const { currentTeam } = useSelector((state) => state.team);
  const { boards, role, isLoading, boardDeleted } = useSelector((state) => state.board);

  const board = boards.find((b) => b.id === id) || boards[0];
  const teamId = currentTeam?.id || board?.teamId || user?.teamId;
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (teamId) dispatch(fetchBoards(teamId));
  }, [dispatch, teamId]);

  useEffect(() => {
    if (teamId) dispatch(fetchTeamMembers(teamId));
  }, [dispatch, teamId]);

  useEffect(() => {
    if (boardDeleted === id) {
      setErrorMessage('This board has been deleted by an admin.');
      setErrorDialogOpen(true);
      dispatch(resetBoardDeleted());
      navigate('/board/default');
    }
  }, [boardDeleted, id, navigate, dispatch]);

  useEffect(() => {
    if (user?.token) connectSocket(user.token);
    if (board?.id) { joinBoard(board.id); setupBoardListeners(); }
    return () => {
      if (board?.id) leaveBoard(board.id);
      cleanupBoardListeners();
      disconnectSocket();
    };
  }, [user, board?.id]);

  // Auto-focus rename input when opened
  useEffect(() => {
    if (isRenamingBoard) {
      setTimeout(() => renameInputRef.current?.focus(), 50);
    }
  }, [isRenamingBoard]);

  const onAddList = () => {
    setNewListName('');
    setNewListDialogOpen(true);
  };

  const handleCreateList = () => {
    if (newListName.trim() && board) {
      dispatch(createList({
        name: newListName.trim(),
        boardId: board.id,
        rank: getInitialRank(board.lists?.length || 0)
      }));
      setNewListDialogOpen(false);
    }
  };

  const openMembersModal = (tab) => { setInitialModalTab(tab); setMembersModalOpen(true); };
  const handleSettingsClick = (e) => setAnchorEl(e.currentTarget);
  const handleSettingsClose = () => setAnchorEl(null);

  const handleLeaveTeam = async () => {
    if (teamId) {
      const result = await dispatch(leaveTeam(teamId));
      if (leaveTeam.fulfilled.match(result)) {
        setLeaveDialogOpen(false);
        setAnchorEl(null);
        navigate('/board/default');
      } else {
        setErrorMessage(result.payload || 'Failed to leave the team.');
        setErrorDialogOpen(true);
        setLeaveDialogOpen(false);
      }
    }
  };

  const startRename = () => {
    setBoardNameDraft(board?.name || '');
    setIsRenamingBoard(true);
    handleSettingsClose();
  };

  const commitRename = async () => {
    if (boardNameDraft.trim() && board && boardNameDraft.trim() !== board.name) {
      await dispatch(updateBoard({ boardId: board.id, name: boardNameDraft.trim() }));
    }
    setIsRenamingBoard(false);
  };

  const cancelRename = () => setIsRenamingBoard(false);

  const headerSubtitle = isLoading ? 'Loading…' : board?.name ?? 'No board';

  const filteredLists = board?.lists?.map(list => ({
    ...list,
    cards: myTasksFilter
      ? list.cards?.filter(c => c.assignees?.some(a => a.id === user?.id))
      : list.cards
  }));

  return (
    <div className="w-full h-screen flex p-6 gap-6 relative z-0">
      <div className="fluid-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden items-center">
        <div className="flex-1 flex flex-col gap-8 w-full max-w-[1600px] h-full py-4 min-h-0">
          <header className="flex justify-between items-center px-6 h-16 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl tracking-tight font-extrabold text-[#1d1d1f]">
                {currentTeam?.name || 'Project Board'}
              </div>

              {isRenamingBoard ? (
                <div className="flex items-center bg-white/50 backdrop-blur-md rounded-xl border border-white/40 px-3 py-1 animate-scale-in">
                  <input
                    ref={renameInputRef}
                    value={boardNameDraft}
                    onChange={(e) => setBoardNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') cancelRename(); }}
                    className="bg-transparent border-none outline-none font-semibold text-sm text-[#1d1d1f] w-48"
                  />
                  <div className="flex items-center gap-1 ml-2 border-l border-black/10 pl-2">
                    <button onClick={commitRename} className="text-green-600 hover:bg-green-50 p-1 rounded-lg transition-colors"><Check size={16} /></button>
                    <button onClick={cancelRename} className="text-gray-400 hover:bg-gray-50 p-1 rounded-lg transition-colors"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                  <LayoutList size={14} className="text-[#1d1d1f]/40" />
                  <span className="text-sm font-bold text-[#1d1d1f]/60 uppercase tracking-wider">{headerSubtitle}</span>
                </div>
              )}
            </div>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant={myTasksFilter ? "contained" : "text"}
                onClick={() => setMyTasksFilter(!myTasksFilter)}
                startIcon={<Users size={18} />}
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  height: 42,
                  bgcolor: myTasksFilter ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                  color: myTasksFilter ? 'white' : '#1d1d1f',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: myTasksFilter ? '#0062cc' : 'rgba(255,255,255,0.6)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                My Tasks
              </Button>

              <Button
                variant="text"
                onClick={() => openMembersModal(0)}
                startIcon={<Users size={18} />}
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  height: 42,
                  bgcolor: 'rgba(255,255,255,0.4)',
                  color: '#1d1d1f',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.6)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                Team
              </Button>

              <IconButton
                onClick={() => setChatDrawerOpen(true)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255,255,255,0.4)',
                  color: '#1d1d1f',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.6)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                <MessageCircle size={20} />
              </IconButton>

              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255,255,255,0.4)',
                  color: '#1d1d1f',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.6)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                <Settings size={20} />
              </IconButton>

              <Menu anchorEl={anchorEl} open={openSettings} onClose={handleSettingsClose} PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}>
                {isAdmin && (
                  <MenuItem onClick={startRename}>
                    <ListItemIcon><Pencil size={16} /></ListItemIcon>
                    Rename Board
                  </MenuItem>
                )}
                <MenuItem onClick={() => { setLeaveDialogOpen(true); handleSettingsClose(); }} sx={{ color: '#ff4444' }}>
                  <ListItemIcon sx={{ color: '#ff4444' }}><LogOut size={18} /></ListItemIcon>
                  Leave Team
                </MenuItem>
              </Menu>
            </Stack>
          </header>

          <div className="flex-1 overflow-hidden pb-4 flex flex-col min-h-0">
            {isLoading ? (
              <Box sx={{ display: 'flex', gap: 3, height: '100%', width: '100%', justifyContent: 'center', py: 4 }}>
                <Skeleton variant="rounded" width={320} height={500} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
                <Skeleton variant="rounded" width={320} height={300} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
                <Skeleton variant="rounded" width={320} height={400} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
              </Box>
            ) : board ? (
              <div className="flex flex-1 min-w-full h-full pb-4 min-h-0">
                {(!board.lists || board.lists.length === 0) ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: 3 }}>
                    <Typography variant="h5" sx={{ color: 'rgba(29,29,31,0.5)', fontWeight: 600 }}>
                      {isAdmin ? 'Create your first list' : 'No lists yet'}
                    </Typography>
                    {isAdmin && (
                      <Button onClick={onAddList} variant="contained" startIcon={<Plus size={20} />} sx={{ bgcolor: 'var(--color-primary)', height: 48, px: 4, borderRadius: 2, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#0062cc' } }}>
                        Add List
                      </Button>
                    )}
                  </Box>
                ) : (
                  <KanbanBoard
                    initialData={filteredLists}
                    isAdmin={isAdmin}
                    onAddList={onAddList}
                    myTasksFilter={myTasksFilter}
                  />
                )}
              </div>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Typography sx={{ color: 'rgba(29,29,31,0.4)', fontWeight: 500 }}>No board available.</Typography>
              </Box>
            )}
          </div>
        </div>
      </main>

      {/* New List Dialog */}
      <Dialog
        open={newListDialogOpen}
        onClose={() => setNewListDialogOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', px: 3, pt: 3, pb: 1 }}>
          Add New List
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <DialogContentText sx={{ mb: 3, fontSize: '0.9rem', color: 'rgba(29, 29, 31, 0.6)', fontWeight: 500 }}>
            Give your new column a name to organize your tasks.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            placeholder="e.g., Marketing, QA, Research"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            sx={{
              input: { color: '#1d1d1f', fontWeight: 600 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0,0,0,0.03)',
                borderRadius: 3,
                height: 52,
                '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--color-primary)',
                  borderWidth: '1.5px'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={() => setNewListDialogOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: 'rgba(29, 29, 31, 0.4)',
              fontSize: '0.9rem',
              '&:hover': { color: '#1d1d1f', bgcolor: 'transparent' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            variant="contained"
            disabled={!newListName.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '14px',
              px: 4,
              height: 44,
              bgcolor: 'var(--color-primary)',
              boxShadow: '0 4px 12px rgba(0,122,255,0.25)',
              '&:hover': { bgcolor: '#0062cc' }
            }}
          >
            Create List
          </Button>
        </DialogActions>
      </Dialog>

      <TeamMembersModal open={membersModalOpen} onClose={() => setMembersModalOpen(false)} teamId={teamId} initialTab={initialModalTab} />
      <ChatDrawer open={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} teamId={teamId} />

      <ConfirmDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={handleLeaveTeam}
        title="Leave Team?"
        message="Are you sure you want to leave this team? You will lose access to all boards and tasks unless invited back."
        confirmText="Leave Team"
        type="danger"
      />

      <ErrorDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default Board;
