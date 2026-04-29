const ProgressBar = ({ progress, color = '#007AFF' }) => {
  return (
    <div className="w-full h-[6px] bg-black/10 rounded-full mt-3 overflow-hidden relative">
      <div 
        className="h-full rounded-full transition-all duration-700 ease-out progress-shine relative overflow-hidden"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
};
export default ProgressBar;
