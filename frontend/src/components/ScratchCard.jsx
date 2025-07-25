import { useState, useRef, useEffect } from 'react';

const ScratchCard = ({ 
  gameResult, 
  isPlaying, 
  onRevealComplete,
  turboMode = false 
}) => {
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRefs = useRef([]);
  const isMouseDown = useRef(false);

  // Ícones disponíveis (exceto o saco de dinheiro que é especial)
  const gameIcons = [
    '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', 
    '🔔', '⭐', '💎', '🎯', '🎲', '🎪',
    '🌟', '💫', '⚡', '🔥', '❤️', '💜'
  ];

  const winningIcon = '💰'; // Único ícone que pode aparecer 3x

  // Gera símbolos para o jogo baseado no resultado
  const generateSymbols = () => {
    if (!gameResult) {
      return Array(9).fill('?');
    }

    const symbols = [];
    
    if (gameResult.isWinner) {
      // Se ganhou, coloca 3 sacos de dinheiro em posições aleatórias
      const winPositions = [0, 4, 8]; // Diagonal principal
      for (let i = 0; i < 9; i++) {
        if (winPositions.includes(i)) {
          symbols[i] = winningIcon;
        } else {
          // Preenche com ícones aleatórios diferentes
          const availableIcons = gameIcons.filter(icon => 
            !symbols.includes(icon) || symbols.filter(s => s === icon).length < 2
          );
          symbols[i] = availableIcons[Math.floor(Math.random() * availableIcons.length)];
        }
      }
    } else {
      // Se perdeu, garante que não há 3 iguais
      const usedIcons = new Map();
      
      for (let i = 0; i < 9; i++) {
        let selectedIcon;
        let attempts = 0;
        
        do {
          selectedIcon = gameIcons[Math.floor(Math.random() * gameIcons.length)];
          attempts++;
        } while (
          (usedIcons.get(selectedIcon) || 0) >= 2 && 
          attempts < 50
        );
        
        symbols[i] = selectedIcon;
        usedIcons.set(selectedIcon, (usedIcons.get(selectedIcon) || 0) + 1);
      }
    }
    
    return symbols;
  };

  const [symbols, setSymbols] = useState(() => generateSymbols());

  // Atualiza símbolos quando o resultado do jogo muda
  useEffect(() => {
    if (gameResult) {
      setSymbols(generateSymbols());
    }
  }, [gameResult]);

  // Reset quando inicia novo jogo
  useEffect(() => {
    if (isPlaying) {
      setRevealedCells(new Set());
      setScratchProgress(0);
      setIsRevealing(false);
      setSymbols(Array(9).fill('?'));
      
      // Limpa todos os canvas
      canvasRefs.current.forEach(canvas => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Desenha a camada de cobertura
          ctx.fillStyle = '#4a5568';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });
    }
  }, [isPlaying]);

  // Modo turbo - revela tudo automaticamente
  useEffect(() => {
    if (turboMode && gameResult && !isRevealing) {
      setIsRevealing(true);
      
      // Animação rápida revelando todas as células
      const revealAll = async () => {
        for (let i = 0; i < 9; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setRevealedCells(prev => new Set([...prev, i]));
          setScratchProgress((i + 1) / 9 * 100);
          
          // Limpa o canvas da célula
          const canvas = canvasRefs.current[i];
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        
        setTimeout(() => {
          setIsRevealing(false);
          onRevealComplete?.();
        }, 500);
      };
      
      revealAll();
    }
  }, [turboMode, gameResult, isRevealing, onRevealComplete]);

  // Inicializa canvas com camada de cobertura
  useEffect(() => {
    canvasRefs.current.forEach((canvas, index) => {
      if (canvas && !revealedCells.has(index)) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Desenha a camada de cobertura
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Adiciona textura de raspadinha
        ctx.fillStyle = '#5a6578';
        for (let i = 0; i < 20; i++) {
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            2, 2
          );
        }
      }
    });
  }, [revealedCells]);

  // Função para "raspar" o canvas
  const scratch = (canvas, x, y) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    // Cria efeito de "raspagem"
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 20, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Verifica se a célula foi suficientemente raspada
  const checkIfRevealed = (canvas, cellIndex) => {
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparentPixels++;
    }
    
    const revealPercentage = transparentPixels / (pixels.length / 4);
    
    if (revealPercentage > 0.3) { // 30% revelado
      setRevealedCells(prev => {
        const newSet = new Set([...prev, cellIndex]);
        setScratchProgress(newSet.size / 9 * 100);
        
        if (newSet.size === 9) {
          setTimeout(() => onRevealComplete?.(), 500);
        }
        
        return newSet;
      });
      return true;
    }
    
    return false;
  };

  // Handlers de mouse/touch
  const handleStart = (e, cellIndex) => {
    if (turboMode || isPlaying || revealedCells.has(cellIndex)) return;
    
    isMouseDown.current = true;
    const canvas = canvasRefs.current[cellIndex];
    
    if (e.type === 'mousedown') {
      scratch(canvas, e.clientX, e.clientY);
    } else if (e.type === 'touchstart') {
      e.preventDefault();
      const touch = e.touches[0];
      scratch(canvas, touch.clientX, touch.clientY);
    }
  };

  const handleMove = (e, cellIndex) => {
    if (!isMouseDown.current || turboMode || isPlaying || revealedCells.has(cellIndex)) return;
    
    const canvas = canvasRefs.current[cellIndex];
    
    if (e.type === 'mousemove') {
      scratch(canvas, e.clientX, e.clientY);
    } else if (e.type === 'touchmove') {
      e.preventDefault();
      const touch = e.touches[0];
      scratch(canvas, touch.clientX, touch.clientY);
    }
    
    checkIfRevealed(canvas, cellIndex);
  };

  const handleEnd = () => {
    isMouseDown.current = false;
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg border-2 border-green-500 shadow-2xl">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-green-400 mb-2">RaspaAI</h2>
        <p className="text-gray-300 text-sm">
          {turboMode ? 'Modo Turbo Ativado!' : 'Raspe e ganhe prêmios incríveis!'}
        </p>
      </div>

      {/* Barra de progresso */}
      {scratchProgress > 0 && scratchProgress < 100 && (
        <div className="mb-4">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${scratchProgress}%` }}
            />
          </div>
          <p className="text-center text-green-400 text-sm mt-1">
            {Math.round(scratchProgress)}% revelado
          </p>
        </div>
      )}

      {/* Grid da raspadinha */}
      <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-green-400 mb-6">
        {symbols.map((symbol, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800"
          >
            {/* Símbolo revelado */}
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
              {revealedCells.has(index) ? (
                <span 
                  className={`transition-all duration-500 ${
                    symbol === winningIcon ? 'text-green-400 animate-pulse' : 'text-white'
                  }`}
                >
                  {symbol}
                </span>
              ) : (
                <span className="text-gray-400 text-2xl">?</span>
              )}
            </div>

            {/* Canvas de cobertura */}
            {!revealedCells.has(index) && (
              <canvas
                ref={el => canvasRefs.current[index] = el}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                onMouseDown={(e) => handleStart(e, index)}
                onMouseMove={(e) => handleMove(e, index)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e, index)}
                onTouchMove={(e) => handleMove(e, index)}
                onTouchEnd={handleEnd}
                style={{ 
                  background: turboMode ? 'transparent' : 'linear-gradient(45deg, #4a5568, #5a6578)',
                  pointerEvents: turboMode || isPlaying ? 'none' : 'auto'
                }}
              />
            )}

            {/* Efeito de brilho para células ganhadoras */}
            {revealedCells.has(index) && symbol === winningIcon && (
              <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse rounded-lg" />
            )}
          </div>
        ))}
      </div>

      {/* Instruções */}
      <div className="text-center text-gray-300 text-sm">
        {isPlaying ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            Aguarde o resultado...
          </div>
        ) : turboMode ? (
          'Revelação automática em andamento...'
        ) : scratchProgress === 100 ? (
          gameResult?.isWinner ? (
            <span className="text-green-400 font-bold">
              🎉 Parabéns! Você encontrou 3 sacos de dinheiro! 🎉
            </span>
          ) : (
            'Não foi dessa vez... Tente novamente!'
          )
        ) : gameResult ? (
          'Raspe as células para revelar os símbolos!'
        ) : (
          'Clique em "Jogar" para começar'
        )}
      </div>

      {/* Legenda */}
      {gameResult && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-green-500/30">
          <div className="text-center text-sm">
            <p className="text-green-400 font-medium mb-1">
              💰 = Símbolo da sorte (precisa de 3 iguais para ganhar)
            </p>
            <p className="text-gray-400">
              Outros símbolos aparecem no máximo 2 vezes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;

