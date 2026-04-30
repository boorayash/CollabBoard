import React, { useState, useEffect, useRef } from 'react';
import { Drawer, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { X, Send, Bookmark, BookmarkCheck } from 'lucide-react';
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d1d1f]/10 shrink-0 bg-white/40">
        <h2 className="font-display font-bold text-lg text-[#1d1d1f]">Team Chat</h2>
        <IconButton onClick={onClose} size="small" sx={{ color: '#1d1d1f' }}>
          <X size={20} />
        </IconButton>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 kanban-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress size={30} sx={{ color: '#007AFF' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 text-sm font-medium">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.userId === user?.id;
            const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && <span className="text-[11px] font-bold text-[#1d1d1f]/60 mb-1 ml-1">{msg.user?.name || 'User'}</span>}
                <div className={`relative max-w-[85%] group flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div 
                    className={`px-4 py-2.5 rounded-2xl text-[14px] shadow-sm ${
                      isMine 
                        ? 'bg-[#007AFF] text-white rounded-tr-sm' 
                        : 'bg-white text-[#1d1d1f] rounded-tl-sm border border-[#1d1d1f]/5'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/70' : 'text-[#1d1d1f]/40'} text-[10px]`}>
                      <span>{msgTime}</span>
                      {msg.isSaved && <BookmarkCheck size={10} className={isMine ? 'text-yellow-300' : 'text-amber-500'} />}
                    </div>
                  </div>
                  
                  <Tooltip title={msg.isSaved ? "Saved permanently" : "Save to prevent auto-delete"}>
                    <button 
                      onClick={() => handleToggleSave(msg.id)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/5 ${msg.isSaved ? 'text-amber-500 opacity-100' : 'text-gray-400'}`}
                    >
                      {msg.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#1d1d1f]/10 bg-white/40 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white border border-[#1d1d1f]/10 rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-[42px] h-[42px] shrink-0 rounded-full bg-[#007AFF] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#0062cc] shadow-md"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
