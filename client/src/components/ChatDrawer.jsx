import React, { useState, useEffect, useRef } from 'react';
import { Drawer, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { X, Send, Bookmark, BookmarkCheck, MessageCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, toggleSaveMessage, receiveMessage, resetChat } from '../store/slices/chatSlice';
import { getSocket, joinTeamChat, leaveTeamChat, sendChatMessage } from '../socket/socketClient';

const ChatDrawer = ({ open, onClose, teamId }) => {
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const chatState = useSelector((state) => state.chat) || { messages: [], isLoading: false };
  const { isLoading = false } = chatState;
  const messages = Array.isArray(chatState.messages) ? chatState.messages : [];
  const { user } = useSelector((state) => state.auth) || {};

  useEffect(() => {
    if (open && teamId) {
      dispatch(fetchMessages(teamId));
      joinTeamChat(teamId);

      const socket = getSocket();
      if (socket) {
        socket.on('receive_message', (msg) => {
          dispatch(receiveMessage(msg));
        });
      }

      return () => {
        leaveTeamChat(teamId);
        if (socket) {
          socket.off('receive_message');
        }
        dispatch(resetChat());
      };
    } else {
      // When drawer is closed, reset chat
      dispatch(resetChat());
    }
  }, [open, teamId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !teamId) return;

    sendChatMessage(teamId, newMessage.trim());
    setNewMessage('');
  };

  const handleToggleSave = (messageId) => {
    dispatch(toggleSaveMessage(messageId));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-7 h-[80px] border-b border-white/20 shrink-0 bg-white/10 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle decorative orb in header */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#007AFF]/10 blur-3xl rounded-full" />
        
        <div className="flex flex-col relative z-10">
          <h2 className="font-display font-extrabold text-2xl text-[#1d1d1f] tracking-tight">Team Chat</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse shadow-[0_0_8px_#34C759]" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-black text-[#1d1d1f]/40">Active Session</span>
          </div>
        </div>
        
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ 
            color: '#1d1d1f', 
            bgcolor: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.7)', transform: 'rotate(90deg)' },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <X size={18} />
        </IconButton>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-7 py-8 flex flex-col gap-6 kanban-scroll relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} thickness={5} />
            <span className="text-[11px] font-bold text-[#1d1d1f]/30 uppercase tracking-widest">Syncing Messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-12 gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm">
              <MessageCircle size={32} className="text-[#007AFF]/60" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-extrabold text-[#1d1d1f]">No messages yet</p>
              <p className="text-xs font-medium leading-relaxed">Start a conversation with your team to coordinate tasks in real-time.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Date Divider (Placeholder for now, could be dynamic) */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-[1px] bg-black/5" />
              <span className="text-[10px] font-black text-[#1d1d1f]/20 uppercase tracking-[0.2em]">Today</span>
              <div className="flex-1 h-[1px] bg-black/5" />
            </div>

            {messages.map((msg, idx) => {
              const isMine = msg.userId === user?.id;
              const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const isFirstInGroup = !prevMsg || prevMsg.userId !== msg.userId;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end animate-message-in`}
                  style={{ animationDelay: isMine ? '0s' : `${idx * 0.02}s` }}
                >
                  {!isMine && (
                    <div className="relative shrink-0">
                      {isFirstInGroup ? (
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white to-[#f0f4f8] backdrop-blur-md border border-white/80 flex items-center justify-center text-[12px] font-black text-[#007AFF] shadow-sm">
                          {msg.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      ) : (
                        <div className="w-9 shrink-0" />
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[82%]`}>
                    {isFirstInGroup && !isMine && (
                      <span className="text-[11px] font-black text-[#1d1d1f]/40 mb-1.5 ml-1 tracking-tight">
                        {msg.user?.name || 'Team Member'}
                      </span>
                    )}
                    
                    <div className={`group relative flex items-center gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div 
                        className={`px-4.5 py-3 rounded-[20px] text-[14.5px] leading-relaxed transition-all duration-300 ${
                          isMine 
                            ? 'bg-gradient-to-br from-[#007AFF] to-[#0062ff] text-white rounded-tr-[4px] shadow-lg shadow-[#007AFF]/15' 
                            : 'bg-white/90 backdrop-blur-md text-[#1d1d1f] rounded-tl-[4px] border border-white/60 shadow-sm'
                        } hover:scale-[1.01]`}
                      >
                        <p className="whitespace-pre-wrap break-words font-medium">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1.5 mt-2 ${isMine ? 'text-white/60' : 'text-[#1d1d1f]/30'} text-[10px] font-black`}>
                          <span>{msgTime}</span>
                          {msg.isSaved && <BookmarkCheck size={11} className={isMine ? 'text-yellow-300' : 'text-amber-500'} />}
                        </div>
                      </div>
                      
                      <Tooltip title={msg.isSaved ? "Saved" : "Save Message"}>
                        <IconButton 
                          onClick={() => handleToggleSave(msg.id)}
                          size="small"
                          sx={{ 
                            opacity: msg.isSaved ? 1 : 0, 
                            visibility: msg.isSaved ? 'visible' : 'hidden',
                            '.group:hover &': { opacity: 1, visibility: 'visible' },
                            transition: 'all 0.2s',
                            color: msg.isSaved ? '#F59E0B' : 'rgba(0,0,0,0.2)',
                            bgcolor: 'rgba(0,0,0,0.03)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#F59E0B' }
                          }}
                        >
                          {msg.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/20 bg-white/20 backdrop-blur-2xl shrink-0">
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <div className="flex gap-3 bg-white/60 p-2 rounded-[24px] border border-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:shadow-[inset_0_2px_8px_rgba(0,0,0,0.03),0_0_0_2px_rgba(0,122,255,0.1)] transition-all">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message team..."
              className="flex-1 bg-transparent px-4 py-2 text-[15px] font-semibold outline-none text-[#1d1d1f] placeholder-[#1d1d1f]/25"
            />
            <IconButton 
              type="submit"
              disabled={!newMessage.trim()}
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#007AFF',
                color: 'white',
                borderRadius: '18px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 4px 15px rgba(0,122,255,0.3)',
                '&:hover': { bgcolor: '#0062cc', transform: 'scale(1.08) rotate(-5deg)' },
                '&:active': { transform: 'scale(0.95)' },
                '&:disabled': { opacity: 0.3, bgcolor: '#007AFF', boxShadow: 'none' }
              }}
            >
              <Send size={18} />
            </IconButton>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] flex-1 bg-black/5" />
            <div className="px-3 py-1.5 rounded-full bg-black/5 border border-black/5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[10px] font-black text-[#1d1d1f]/40 uppercase tracking-[0.12em]">
                Messages disappear after 24 hours unless saved
              </p>
            </div>
            <div className="h-[1px] flex-1 bg-black/5" />
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
