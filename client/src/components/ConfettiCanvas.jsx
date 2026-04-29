import { useEffect, useRef } from 'react';

const ConfettiCanvas = ({ trigger }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // We make the canvas full screen dynamically
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#007AFF', '#34C759', '#FFCC00', '#FF3B30', '#a855f7'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 100, // spawn slightly spread out
            y: canvas.height - 100, // spawn near bottom
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 1) * 30 - 10,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1
        });
    }

    let animationId;
    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.8; // gravity
            p.alpha -= 0.015;

            if (p.alpha > 0) {
                active = true;
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        if (active) {
            animationId = requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [trigger]);

  return (
    <canvas 
        ref={canvasRef}
        style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: 9999 }} 
    />
  );
};
export default ConfettiCanvas;
