import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_COLORS = { Low: '#34C759', Medium: '#FFCC00', High: '#FF3B30' };

const InlineAddTaskForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click-outside to cancel
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required.');
      inputRef.current?.focus();
      return;
    }
    try {
      onSubmit(title.trim(), priority);
      setError('');
    } catch {
      setError('Failed to save. Try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { onCancel(); }
  };

  return (
    <div
      ref={containerRef}
      className="rounded-[20px] p-4 flex flex-col gap-3 animate-slide-in"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* Title input */}
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => { setTitle(e.target.value); setError(''); }}
        onKeyDown={handleKeyDown}
        placeholder="Task title…"
        className="w-full bg-transparent text-[14px] font-semibold text-[#1d1d1f] placeholder-[#1d1d1f]/30 outline-none border-b border-[#1d1d1f]/10 pb-2 focus:border-[#007AFF]/50 transition-colors"
      />

      {/* Priority selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#1d1d1f]/40 font-medium mr-1">Priority:</span>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
            style={{
              backgroundColor: priority === p ? `${PRIORITY_COLORS[p]}22` : 'rgba(0,0,0,0.04)',
              color: priority === p ? PRIORITY_COLORS[p] : 'rgba(29,29,31,0.4)',
              border: priority === p ? `1px solid ${PRIORITY_COLORS[p]}55` : '1px solid transparent',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500 font-medium -mt-1">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-2 rounded-[14px] text-[13px] font-semibold text-white transition-all"
          style={{
            background: title.trim() ? 'var(--color-primary)' : 'rgba(29,29,31,0.08)',
            color: title.trim() ? 'white' : 'rgba(29,29,31,0.3)',
            boxShadow: title.trim() ? '0 4px 12px rgba(0,122,255,0.25)' : 'none',
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="w-9 h-9 flex items-center justify-center rounded-[14px] bg-black/5 hover:bg-black/10 text-[#1d1d1f]/50 hover:text-[#1d1d1f] transition-all"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default InlineAddTaskForm;
