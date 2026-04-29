import { useState, useEffect } from 'react';

const useMouseTilt = (containerRef) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Calculate tilt (limit to 10 degrees)
      const tiltX = (y - 0.5) * -15;
      const tiltY = (x - 0.5) * 15;
      
      setTilt({ x: tiltX, y: tiltY });
      setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [containerRef]);

  return { tilt, mousePos };
};

export default useMouseTilt;
