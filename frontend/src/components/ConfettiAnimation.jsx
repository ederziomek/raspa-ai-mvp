import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ConfettiAnimation({ isActive, duration = 3000 }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setConfetti([]);
      return;
    }

    // Gera confetes
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5
    }));

    setConfetti(newConfetti);

    // Remove confetes após a duração
    const timeout = setTimeout(() => {
      setConfetti([]);
    }, duration);

    return () => clearTimeout(timeout);
  }, [isActive, duration]);

  if (!isActive || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            borderRadius: '2px'
          }}
          initial={{
            y: piece.y,
            rotation: piece.rotation,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 50,
            rotation: piece.rotation + 720,
            opacity: 0
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

