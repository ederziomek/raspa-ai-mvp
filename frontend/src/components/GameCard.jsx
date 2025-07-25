import { useState, useRef, useEffect } from 'react';

const GameCard = ({ 
  balance,
  betAmount,
  setBetAmount,
  gameResult, 
  isPlaying, 
  onPlay,
  turboMode = false 
}) => {
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRefs = useRef([]);
  const isMouseDown = useRef(false);

  // Apenas 5 ícones conforme solicitado
  const gameIcons = ['⭐️', '💎', '☘️', '🔥'];
  const winningIcon = '💰'; // Único ícone que pode aparecer 3x

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

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
          // Preenche com ícones aleatórios diferentes (máx 2 de cada)
          const availableIcons = gameIcons.filter(icon => 
            symbols.filter(s => s === icon).length < 2
          );
          symbols[i] = availableIcons[Math.floor(Math.random() * availableIcons.length)] || gameIcons[0];
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
      setGameStarted(true);
    }
  }, [gameResult]);

  // Reset quando inicia novo jogo
  useEffect(() => {
    if (isPlaying) {
      setRevealedCells(new Set());
      setScratchProgress(0);
      setIsRevealing(false);
      setSymbols(Array(9).fill('?'));
      setGameStarted(true);
      
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

  // Modo turbo - revela tudo automaticamente com efeito deslizante
  useEffect(() => {
    if (turboMode && gameResult && !isRevealing && gameStarted) {
      setIsRevealing(true);
      
      // Animação com efeito deslizante
      const revealWithSlideEffect = async () => {
        for (let i = 0; i < 9; i++) {
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Efeito de deslizar na célula
          const canvas = canvasRefs.current[i];
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Animação de deslizar da esquerda para direita
            for (let x = 0; x <= width; x += 20) {
              ctx.globalCompositeOperation = 'destination-out';
              ctx.fillRect(x - 40, 0, 40, height);
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
          
          setRevealedCells(prev => new Set([...prev, i]));
          setScratchProgress((i + 1) / 9 * 100);
        }
        
        setTimeout(() => {
          setIsRevealing(false);
        }, 500);
      };
      
      revealWithSlideEffect();
    }
  }, [turboMode, gameResult, isRevealing, gameStarted]);

  // Inicializa canvas com camada de cobertura
  useEffect(() => {
    if (gameStarted) {
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
          for (let i = 0; i < 15; i++) {
            ctx.fillRect(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              2, 2
            );
          }
        }
      });
    }
  }, [revealedCells, gameStarted]);

  // Função para "raspar" o canvas
  const scratch = (canvas, x, y) => {
    if (!canvas || !gameStarted) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    // Cria efeito de "raspagem"
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 25, 0, 2 * Math.PI);
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
    
    if (revealPercentage > 0.4) { // 40% revelado
      setRevealedCells(prev => {
        const newSet = new Set([...prev, cellIndex]);
        setScratchProgress(newSet.size / 9 * 100);
        return newSet;
      });
      return true;
    }
    
    return false;
  };

  // Handlers de mouse/touch
  const handleStart = (e, cellIndex) => {
    if (turboMode || isPlaying || revealedCells.has(cellIndex) || !gameStarted) return;
    
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
    if (!isMouseDown.current || turboMode || isPlaying || revealedCells.has(cellIndex) || !gameStarted) return;
    
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
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6 rounded-lg border-2 border-green-500 shadow-2xl max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-green-400 mb-2">RaspaAI</h2>
        <p className="text-gray-300 text-sm">
          {turboMode && gameStarted ? 'Modo Turbo Ativado!' : 'Raspe e ganhe prêmios incríveis!'}
        </p>
      </div>

      {/* Barra de progresso */}
      {scratchProgress > 0 && scratchProgress < 100 && gameStarted && (
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
      <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-green-400 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {symbols.map((symbol, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800"
            >
              {/* Símbolo revelado */}
              <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-bold">
                {revealedCells.has(index) ? (
                  <span 
                    className={`transition-all duration-500 ${
                      symbol === winningIcon ? 'text-green-400 animate-pulse' : 'text-white'
                    }`}
                  >
                    {symbol}
                  </span>
                ) : gameStarted ? (
                  <span className="text-gray-400 text-xl">?</span>
                ) : (
                  <span className="text-gray-500 text-lg">?</span>
                )}
              </div>

              {/* Canvas de cobertura */}
              {!revealedCells.has(index) && gameStarted && (
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
      </div>

      {/* Resultado após revelação */}
      {gameResult && !isPlaying && scratchProgress === 100 && (
        <div className={`mb-4 text-center p-3 rounded-lg border ${
          gameResult.isWinner 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-red-500/20 border-red-500'
        }`}>
          {gameResult.isWinner ? (
            <div>
              <div className="text-green-400 font-bold text-lg mb-1">
                🎉 PARABÉNS! 🎉
              </div>
              <div className="text-white text-sm">
                Você ganhou <span className="font-bold text-green-400">
                  {formatCurrency(gameResult.prizeAmount)}
                </span>
              </div>
              <div className="text-green-300 text-xs">
                Multiplicador: {gameResult.multiplier}x
              </div>
            </div>
          ) : (
            <div>
              <div className="text-red-400 font-bold text-sm mb-1">
                Não foi dessa vez...
              </div>
              <div className="text-gray-300 text-xs">
                Tente novamente!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informações do jogo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium">SALDO</div>
          <div className="text-white text-sm font-bold">{formatCurrency(balance)}</div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium">APOSTA</div>
          <div className="text-white text-sm font-bold">{formatCurrency(betAmount)}</div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium">GANHO</div>
          <div className="text-white text-sm font-bold">
            {formatCurrency(gameResult?.prizeAmount || 0)}
          </div>
        </div>
      </div>

      {/* Botão principal de jogar */}
      <button 
        onClick={() => onPlay(false)}
        disabled={isPlaying || balance < betAmount}
        className="w-full h-12 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 text-white font-bold text-lg border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded mb-4"
      >
        {isPlaying ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Aguarde...
          </div>
        ) : (
          `▶ Jogar ${formatCurrency(betAmount)}`
        )}
      </button>

      {/* Controles em linha */}
      <div className="grid grid-cols-4 gap-2">
        <button 
          onClick={() => onPlay(true)}
          disabled={isPlaying || balance < betAmount}
          className="h-12 bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">⚡</span>
            <span className="text-xs">TURBO</span>
          </div>
        </button>

        <button 
          onClick={() => setBetAmount(prev => Math.max(0.5, prev - 0.5))}
          disabled={isPlaying}
          className="h-12 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold text-2xl border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          -
        </button>

        <button 
          onClick={() => setBetAmount(prev => Math.min(1000, prev + 0.5))}
          disabled={isPlaying}
          className="h-12 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold text-2xl border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          +
        </button>

        <button 
          disabled={isPlaying}
          className="h-12 bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">▶</span>
            <span className="text-xs">AUTO</span>
          </div>
        </button>
      </div>

      {/* Legenda */}
      {gameStarted && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-green-500/30">
          <div className="text-center text-xs">
            <p className="text-green-400 font-medium mb-1">
              💰 = Símbolo da sorte (precisa de 3 iguais para ganhar)
            </p>
            <p className="text-gray-400">
              Outros símbolos: ⭐️💎☘️🔥 (máximo 2 iguais)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;

