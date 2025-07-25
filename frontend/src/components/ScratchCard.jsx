import { useState, useRef, useEffect } from 'react';

const ScratchCard = ({ 
  betAmount, 
  onGameComplete, 
  isPlaying, 
  gameResult = null 
}) => {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [revealedAreas, setRevealedAreas] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const cardRef = useRef(null);
  const overlayRef = useRef(null);

  // Reset game when new game starts
  useEffect(() => {
    if (isPlaying && !gameStarted) {
      setGameStarted(true);
      setScratchProgress(0);
      setRevealedAreas([]);
      resetScratchOverlay();
    }
  }, [isPlaying, gameStarted]);

  // Reset when game ends
  useEffect(() => {
    if (!isPlaying && gameStarted) {
      setGameStarted(false);
    }
  }, [isPlaying, gameStarted]);

  const resetScratchOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.style.clipPath = 'circle(0px at 50% 50%)';
    }
  };

  const getCoordinates = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const updateScratchArea = (x, y) => {
    if (!overlayRef.current || !gameStarted) return;

    // Add new revealed area
    const newArea = { x, y, radius: 25 };
    setRevealedAreas(prev => [...prev, newArea]);

    // Calculate total revealed area (simplified)
    const progress = Math.min(revealedAreas.length * 2, 100);
    setScratchProgress(progress);

    // Create clip-path with multiple circles
    const circles = [...revealedAreas, newArea]
      .map(area => `circle(${area.radius}px at ${area.x}px ${area.y}px)`)
      .join(', ');
    
    overlayRef.current.style.clipPath = circles;

    // Check if enough area is revealed (60% threshold)
    if (progress >= 60 && onGameComplete) {
      setTimeout(() => {
        onGameComplete();
      }, 500);
    }
  };

  const handleStart = (e) => {
    if (!gameStarted) return;
    e.preventDefault();
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    updateScratchArea(x, y);
  };

  const handleMove = (e) => {
    if (!isScratching || !gameStarted) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    updateScratchArea(x, y);
  };

  const handleEnd = () => {
    setIsScratching(false);
  };

  // Generate prize display based on game result
  const getPrizeDisplay = () => {
    if (!gameResult) {
      return {
        multiplier: '?',
        amount: '?',
        message: 'Raspe para descobrir!',
        color: 'text-white'
      };
    }

    const { multiplier, winAmount } = gameResult;
    
    if (multiplier === 0) {
      return {
        multiplier: '0x',
        amount: 'R$ 0,00',
        message: 'Tente novamente!',
        color: 'text-red-200'
      };
    }

    return {
      multiplier: `${multiplier}x`,
      amount: `R$ ${winAmount.toFixed(2)}`,
      message: multiplier >= 100 ? '🎉 GRANDE PRÊMIO!' : '🎊 Parabéns!',
      color: multiplier >= 100 ? 'text-yellow-300' : 'text-green-300'
    };
  };

  const prize = getPrizeDisplay();

  return (
    <div className="relative">
      {/* Game Status */}
      {gameStarted && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {scratchProgress < 60 ? 'Raspe a cartela...' : 'Quase lá!'}
            </span>
          </div>
        </div>
      )}

      {/* Scratch Card */}
      <div 
        ref={cardRef}
        className="relative w-full h-64 mx-auto bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-xl overflow-hidden cursor-crosshair select-none shadow-2xl"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Prize Background */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${prize.color} mb-2`}>
              {prize.multiplier}
            </div>
            <div className={`text-2xl font-bold ${prize.color} mb-2`}>
              {prize.amount}
            </div>
            <div className={`text-sm ${prize.color} opacity-90`}>
              {prize.message}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-2 border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white/30 rounded-full"></div>
        </div>

        {/* Scratch Overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 transition-all duration-100 ease-out"
          style={{
            clipPath: 'circle(0px at 50% 50%)',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #999 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #777 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, #888 1.5px, transparent 1.5px)
            `,
            backgroundSize: '20px 20px, 15px 15px, 25px 25px'
          }}
        >
          {/* Scratch texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          
          {/* Instructions */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-bold mb-2">Raspadinha</div>
                <div className="text-sm opacity-80">Clique em "Jogar" para começar</div>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        {gameStarted && scratchProgress > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300 ease-out"
                style={{ width: `${scratchProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mt-4 text-center">
        <div className="text-white/80 text-sm">
          Aposta: <span className="font-bold">R$ {betAmount.toFixed(2)}</span>
          {gameResult && (
            <span className="ml-4">
              Multiplicador: <span className="font-bold">{gameResult.multiplier}x</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchCard;

