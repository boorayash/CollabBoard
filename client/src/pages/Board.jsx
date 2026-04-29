import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Stack, Skeleton,
  Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { fetchBoards, createList, resetBoardDeleted, updateBoard } from '../store/slices/boardSlice';
import { leaveTeam } from '../store/slices/teamSlice';
import KanbanBoard from '../components/KanbanBoard';
import Sidebar from '../components/Sidebar';
import TeamMembersModal from '../components/TeamMembersModal';
import { Plus, UserPlus, Users, Settings, LogOut, Pencil, Check, X } from 'lucide-react';
import { getInitialRank } from '../utils/ranks';
import { connectSocket, disconnectSocket, joinBoard, leaveBoard } from '../socket/socketClient';
import { setupBoardListeners, cleanupBoardListeners } from '../socket/boardEvents';

const Board = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Board rename state
  const [isRenamingBoard, setIsRenamingBoard] = useState(false);
  const [boardNameDraft, setBoardNameDraft] = useState('');
  const renameInputRef = useRef(null);

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
    if (boardDeleted === id) {
      alert('This board has been deleted by an admin.');
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
    const name = prompt('Enter list name:');
    if (name && board) {
      dispatch(createList({ name, boardId: board.id, rank: getInitialRank(board.lists?.length || 0) }));
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

  // Header subtitle based on load state (CB-004)
  const headerSubtitle = isLoading
    ? 'Loading…'
    : board?.name ?? 'No board';

  return (
    <div className="w-full h-screen flex p-6 gap-6 relative z-0">
      {/* Background Orbs */}
      <div className="fluid-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden items-center">
        <div className="flex-1 flex flex-col gap-8 w-full max-w-[1600px] h-full py-4">
          {/* Header */}
          <header className="flex justify-between items-center px-6 h-16 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl tracking-tight font-extrabold text-[#1d1d1f]">
                {currentTeam?.name || 'Project Board'}
              </div>

              {/* Board name — editable for admin */}
              {isRenamingBoard ? (
                <div className="flex items-center gap-1 ml-2">
                  <input
                    ref={renameInputRef}
                    value={boardNameDraft}
                    onChange={(e) => setBoardNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    className="text-sm font-medium text-[#1d1d1f] bg-white/60 border border-[#007AFF]/40 rounded-lg px-3 py-1 outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all w-40"
                  />
                  <button onClick={commitRename} className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                    <Check size={15} />
                  </button>
                  <button onClick={cancelRename} className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-2 group">
                  <span className="text-sm font-medium text-[#1d1d1f]/50">{headerSubtitle}</span>
                  {isAdmin && board && !isLoading && (
                    <button
                      onClick={startRename}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#1d1d1f]/40 hover:text-[#007AFF] hover:bg-white/60 rounded-md transition-all"
                      title="Rename board"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <button
                onClick={() => openMembersModal(0)}
                className="bg-white/30 border border-white/40 shadow-sm backdrop-blur-md text-[#1d1d1f] px-6 py-2.5 rounded-full font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"
              >
                <Users size={18} />
                View Members
              </button>

              {isAdmin && (
                <button
                  onClick={() => openMembersModal(1)}
                  className="bg-[#1d1d1f] text-white px-6 py-2.5 rounded-full font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-black hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Add User
                </button>
              )}

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 bg-white/30 border border-white/40 text-[#1d1d1f] hover:bg-white hover:-translate-y-0.5 hover:scale-105 shadow-sm ml-2"
                onClick={handleSettingsClick}
              >
                <Settings size={20} />
              </div>

              <Menu
                anchorEl={anchorEl}
                open={openSettings}
                onClose={handleSettingsClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    color: '#1d1d1f',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
                    borderRadius: 2,
                    '& .MuiMenuItem-root': { py: 1.5, px: 2, '&:hover': { bgcolor: 'rgba(29, 29, 31, 0.05)' } }
                  }
                }}
              >
                {isAdmin && board && (
                  <MenuItem onClick={startRename}>
                    <ListItemIcon sx={{ color: '#1d1d1f' }}>
                      <Pencil size={16} />
                    </ListItemIcon>
                    Rename Board
                  </MenuItem>
                )}
                <MenuItem onClick={() => { setLeaveDialogOpen(true); handleSettingsClose(); }} sx={{ color: '#ff4444' }}>
                  <ListItemIcon sx={{ color: '#ff4444' }}>
                    <LogOut size={18} />
                  </ListItemIcon>
                  Leave Team
                </MenuItem>
              </Menu>
            </Stack>
          </header>

          {/* Kanban Area */}
          <div className="flex-1 overflow-x-auto kanban-scroll pb-8">
            {isLoading ? (
              <Box sx={{ display: 'flex', gap: 3, height: '100%', width: '100%', justifyContent: 'center', py: 4 }}>
                <Skeleton variant="rounded" width={320} height={500} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
                <Skeleton variant="rounded" width={320} height={300} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
                <Skeleton variant="rounded" width={320} height={400} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
              </Box>
            ) : board ? (
              <div className="flex justify-center min-w-full items-start">
                {(!board.lists || board.lists.length === 0) ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: 3 }}>
                    <Typography variant="h5" sx={{ color: 'rgba(29,29,31,0.5)', fontWeight: 600 }}>
                      {isAdmin ? 'Create your first list' : 'No lists yet'}
                    </Typography>
                    {isAdmin && (
                      <Button
                        onClick={onAddList}
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        sx={{
                          bgcolor: 'var(--color-primary)', height: 48, px: 4, borderRadius: 2,
                          textTransform: 'none', fontSize: '1rem',
                          '&:hover': { bgcolor: '#0062cc' },
                          '&:active': { transform: 'scale(0.98)' }
                        }}
                      >
                        Add List
                      </Button>
                    )}
                  </Box>
                ) : (
                  <div className="flex gap-6 items-start px-12 py-4 mx-auto w-max">
                    <KanbanBoard initialData={board.lists} />
                    {isAdmin && (
                      <Button
                        onClick={onAddList}
                        variant="outlined"
                        startIcon={<Plus size={20} />}
                        sx={{
                          minWidth: 280,
                          height: 56,
                          borderRadius: 2,
                          border: '1px dashed var(--glass-border)',
                          color: 'rgba(255,255,255,0.7)',
                          background: 'var(--glass-bg)',
                          backdropFilter: 'blur(var(--glass-blur))',
                          textTransform: 'none',
                          fontSize: '1rem',
                          flexShrink: 0,
                          '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'var(--color-secondary)' },
                          '&:active': { transform: 'scale(0.98)' }
                        }}
                      >
                        Add List
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* No board exists — should not happen with CB-001, but defensive fallback */
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Typography sx={{ color: 'rgba(29,29,31,0.4)', fontWeight: 500 }}>
                  No board available for this team.
                </Typography>
              </Box>
            )}
          </div>
        </div>
      </main>

      <TeamMembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        teamId={teamId}
        initialTab={initialModalTab}
      />

      {/* Leave Team Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' } }}
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.5)', borderRadius: 3, color: '#1d1d1f',
            boxShadow: '0 24px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)', p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Leave Team?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(29,29,31,0.7)' }}>
            Are you sure you want to leave this team? You will lose access to all boards and data associated with it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeaveDialogOpen(false)} sx={{ color: 'rgba(29,29,31,0.6)' }}>Cancel</Button>
          <Button onClick={handleLeaveTeam} variant="contained" color="error" sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2 }}>
            Leave Team
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Board;
