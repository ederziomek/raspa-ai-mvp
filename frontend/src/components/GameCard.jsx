import { useState, useEffect, useRef, useCallback } from 'react';
import { BET_VALUES, formatCurrency } from '../config/gameConfig';
import { generateFortuneTigerGame, getFortuneTigerSymbols } from '../utils/fortuneTiger';

const GameCard = ({ 
  balance,
  betAmount,
  setBetAmount,
  gameResult, 
  isPlaying, 
  onPlay,
  onBalanceUpdate,
  turboMode = false 
}) => {
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [balanceUpdated, setBalanceUpdated] = useState(false);
  const [revealedArea, setRevealedArea] = useState(0);
  const [turboActive, setTurboActive] = useState(false);
  const [autoActive, setAutoActive] = useState(false);
  const [autoRounds, setAutoRounds] = useState(0);
  const [showAutoOptions, setShowAutoOptions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [messageType, setMessageType] = useState('default');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fortuneTigerActive, setFortuneTigerActive] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const canvasRef = useRef(null);
  const gameAreaRef = useRef(null);
  const isMouseDown = useRef(false);
  const lastScratchTime = useRef(0);
  const autoIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);

  // Símbolos do Fortune Tiger
  const fortuneSymbols = getFortuneTigerSymbols();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Gera símbolos usando a lógica do Fortune Tiger
  const generateSymbols = useCallback(() => {
    if (!gameResult) {
      return Array(9).fill('?');
    }

    if (gameResult.symbols && gameResult.symbols.length === 9) {
      return gameResult.symbols.map(symbol => symbol.icon);
    }
    
    // Fallback - gera novo jogo Fortune Tiger
    const newGame = generateFortuneTigerGame(betAmount);
    setFortuneTigerActive(newGame.fortuneTigerActive);
    setWinningLines(newGame.winningLines || []);
    return newGame.symbols.map(symbol => symbol.icon);
  }, [gameResult, betAmount]);

  const [symbols, setSymbols] = useState(() => generateSymbols());

  // Calcula valor máximo possível - Fortune Tiger style
  const getMaxPossibleWin = useCallback(() => {
    const maxMultiplier = 2500; // Multiplicador máximo do Fortune Tiger
    return betAmount * maxMultiplier;
  }, [betAmount]);

  // Mensagens do Fortune Tiger
  const getMessages = useCallback(() => {
    if (gameCompleted && gameResult) {
      if (gameResult.isWinner) {
        const messages = [`Ganho: ${formatCurrency(gameResult.prizeAmount)} 🐅`];
        if (fortuneTigerActive) {
          messages.push('🎉 FORTUNE TIGER ATIVADO! 🎉');
        }
        return messages;
      } else {
        return ['Não foi dessa vez 😔 Tente Novamente!'];
      }
    } else {
      return [
        `Ganhe até ${formatCurrency(getMaxPossibleWin())}`,
        '🐅 Fortune Tiger - Multiplicadores até 2500x'
      ];
    }
  }, [gameCompleted, gameResult, getMaxPossibleWin, fortuneTigerActive]);

  // Atualiza mensagem baseada no estado do jogo
  const updateMessage = useCallback(() => {
    const messages = getMessages();
    
    if (gameCompleted && gameResult) {
      if (gameResult.isWinner) {
        setMessageType('win');
      } else {
        setMessageType('loss');
      }
      setCurrentMessage(0);
      
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    } else {
      setMessageType('default');
      
      if (!messageIntervalRef.current && messages.length > 1) {
        messageIntervalRef.current = setInterval(() => {
          setCurrentMessage(prev => prev === 0 ? 1 : 0);
        }, 4000);
      }
    }
  }, [gameCompleted, gameResult, getMessages]);

  // Atualiza símbolos quando o resultado do jogo muda
  useEffect(() => {
    if (gameResult) {
      setSymbols(generateSymbols());
      setGameStarted(true);
      setGameCompleted(false);
      setBalanceUpdated(false);
      setRevealedArea(0);
      setShowConfetti(false);
      setFortuneTigerActive(gameResult.fortuneTigerActive || false);
      setWinningLines(gameResult.winningLines || []);
      updateMessage();
    }
  }, [gameResult, generateSymbols, updateMessage]);

  // Atualiza mensagem quando aposta muda
  useEffect(() => {
    updateMessage();
  }, [betAmount, updateMessage]);

  // Cleanup do interval quando componente desmonta
  useEffect(() => {
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, []);

  // Reset quando inicia novo jogo
  useEffect(() => {
    if (isPlaying) {
      setScratchProgress(0);
      setIsRevealing(false);
      setSymbols(Array(9).fill('?'));
      setGameStarted(true);
      setGameCompleted(false);
      setBalanceUpdated(false);
      setRevealedArea(0);
      setShowConfetti(false);
      setMessageType('default');
      setCurrentMessage(0);
      setFortuneTigerActive(false);
      setWinningLines([]);
      updateMessage();
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        initializeCanvas();
      }
    }
  }, [isPlaying, updateMessage]);

  // Inicializa o canvas com tema Fortune Tiger
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !gameAreaRef.current) return;
    
    const canvas = canvasRef.current;
    const gameArea = gameAreaRef.current;
    const ctx = canvas.getContext('2d');
    
    const gameAreaStyle = window.getComputedStyle(gameArea);
    const paddingTop = parseInt(gameAreaStyle.paddingTop) || 0;
    const paddingLeft = parseInt(gameAreaStyle.paddingLeft) || 0;
    const paddingRight = parseInt(gameAreaStyle.paddingRight) || 0;
    const paddingBottom = parseInt(gameAreaStyle.paddingBottom) || 0;
    
    const canvasWidth = gameArea.clientWidth - paddingLeft - paddingRight;
    const canvasHeight = gameArea.clientHeight - paddingTop - paddingBottom;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.top = `${paddingTop}px`;
    canvas.style.left = `${paddingLeft}px`;
    
    // Gradiente dourado do Fortune Tiger
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.3, '#CD853F');
    gradient.addColorStop(0.7, '#DAA520');
    gradient.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Textura oriental
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Grid 3x3 com bordas douradas
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    const cellWidth = canvas.width / 3;
    const cellHeight = canvas.height / 3;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    }
    
    // Borda externa dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Padrão chinês decorativo
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 10 + 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, []);

  // Modo turbo - revela tudo automaticamente
  useEffect(() => {
    if (turboActive && gameResult && !isRevealing && gameStarted && !gameCompleted) {
      setIsRevealing(true);
      
      const revealInstantly = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        setScratchProgress(100);
        setRevealedArea(100);
        
        setTimeout(() => {
          setIsRevealing(false);
          completeGame();
        }, 200);
      };
      
      revealInstantly();
    }
  }, [turboActive, gameResult, isRevealing, gameStarted, gameCompleted]);

  // Inicializa canvas quando o jogo começa
  useEffect(() => {
    if (gameStarted && canvasRef.current && scratchProgress === 0) {
      setTimeout(() => {
        initializeCanvas();
      }, 150);
    }
  }, [gameStarted, scratchProgress, initializeCanvas]);

  // AUTO PLAY
  useEffect(() => {
    if (autoActive && autoRounds > 0 && !isPlaying && gameCompleted && balanceUpdated) {
      autoIntervalRef.current = setTimeout(() => {
        onPlay(turboActive);
      }, 2000);
    }
    
    return () => {
      if (autoIntervalRef.current) {
        clearTimeout(autoIntervalRef.current);
      }
    };
  }, [autoActive, autoRounds, isPlaying, gameCompleted, balanceUpdated, turboActive, onPlay]);

  // Função para "raspar" o canvas
  const scratch = useCallback((canvas, x, y) => {
    if (!canvas || !gameStarted || gameCompleted || isRevealing || turboActive) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    ctx.globalCompositeOperation = 'destination-out';
    
    // Efeito de raspagem mais suave
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    // Efeito adicional
    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      ctx.beginPath();
      ctx.arc(canvasX + offsetX, canvasY + offsetY, 15, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    const now = Date.now();
    if (now - lastScratchTime.current > 50) {
      calculateScratchProgress();
      lastScratchTime.current = now;
    }
  }, [gameStarted, gameCompleted, isRevealing, turboActive]);

  // Calcula o progresso da raspagem
  const calculateScratchProgress = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    let totalPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 16) {
      totalPixels++;
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }
    
    const progress = Math.min((transparentPixels / totalPixels) * 100, 100);
    setScratchProgress(progress);
    setRevealedArea(progress);
    
    if (progress >= 75 && !gameCompleted) {
      completeGame();
    }
  }, [gameCompleted]);

  // Completa o jogo automaticamente
  const completeGame = useCallback(() => {
    if (!canvasRef.current || gameCompleted) return;
    
    setGameCompleted(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Animação de revelação final
    let opacity = 1;
    const fadeOut = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      opacity -= 0.1;
      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setScratchProgress(100);
        setRevealedArea(100);
        
        setTimeout(() => {
          // Destaca linhas vencedoras
          if (gameResult && gameResult.isWinner && winningLines.length > 0) {
            const cells = document.querySelectorAll('.symbol-cell');
            winningLines.forEach(line => {
              line.positions.forEach(pos => {
                if (cells[pos]) {
                  cells[pos].classList.add('winner-cell');
                }
              });
            });
            
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
          }
          
          updateMessage();
          
          setTimeout(() => {
            updateBalance();
          }, 1000);
        }, 100);
      }
    };
    
    fadeOut();
  }, [gameCompleted, gameResult, symbols, updateMessage, winningLines]);

  // Atualiza saldo
  const updateBalance = useCallback(() => {
    if (balanceUpdated) return;
    
    setBalanceUpdated(true);
    
    if (onBalanceUpdate) {
      const prizeAmount = gameResult?.isWinner ? gameResult.prizeAmount : 0;
      onBalanceUpdate(prizeAmount);
    }
    
    if (autoActive && autoRounds > 1) {
      setAutoRounds(prev => prev - 1);
    } else if (autoActive && autoRounds <= 1) {
      setAutoActive(false);
      setAutoRounds(0);
    }
  }, [balanceUpdated, gameResult, betAmount, onBalanceUpdate, autoActive, autoRounds]);

  // Handlers de mouse/touch
  const handleStart = useCallback((e) => {
    if (turboActive || isPlaying || gameCompleted || !gameStarted) return;
    
    isMouseDown.current = true;
    const canvas = canvasRef.current;
    
    if (e.type === 'mousedown') {
      scratch(canvas, e.clientX, e.clientY);
    } else if (e.type === 'touchstart') {
      e.preventDefault();
      const touch = e.touches[0];
      scratch(canvas, touch.clientX, touch.clientY);
    }
  }, [turboActive, isPlaying, gameCompleted, gameStarted, scratch]);

  const handleMove = useCallback((e) => {
    if (!isMouseDown.current || turboActive || isPlaying || gameCompleted || !gameStarted) return;
    
    const canvas = canvasRef.current;
    
    if (e.type === 'mousemove') {
      scratch(canvas, e.clientX, e.clientY);
    } else if (e.type === 'touchmove') {
      e.preventDefault();
      const touch = e.touches[0];
      scratch(canvas, touch.clientX, touch.clientY);
    }
  }, [turboActive, isPlaying, gameCompleted, gameStarted, scratch]);

  const handleEnd = useCallback(() => {
    isMouseDown.current = false;
  }, []);

  // Função para obter o emoji do símbolo
  const getSymbolEmoji = (symbolIcon) => {
    return symbolIcon;
  };

  // Função para obter classe CSS do símbolo
  const getSymbolClass = (symbolIcon, index) => {
    let baseClass = "symbol-cell flex items-center justify-center text-4xl md:text-5xl font-bold transition-all duration-300 rounded-lg";
    
    // Adiciona classe especial para Wild (Tigre)
    if (symbolIcon === '🐅') {
      baseClass += " wild-symbol";
    }
    
    // Adiciona classe para células vencedoras
    const isWinningCell = winningLines.some(line => line.positions.includes(index));
    if (isWinningCell && gameCompleted && gameResult?.isWinner) {
      baseClass += " winner-cell";
    }
    
    return baseClass;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Confetes */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      {/* Card principal com tema Fortune Tiger */}
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-yellow-800 rounded-2xl shadow-2xl border-4 border-yellow-400 overflow-hidden">
        {/* Header com logo Fortune Tiger */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 text-center border-b-4 border-yellow-400">
          <h2 className="text-2xl font-bold text-red-900 mb-2 flex items-center justify-center gap-2">
            🐅 FORTUNE TIGER 🐅
          </h2>
          <div className={`text-lg font-semibold transition-all duration-500 ${
            messageType === 'win' ? 'text-green-800 animate-pulse' : 
            messageType === 'loss' ? 'text-red-800' : 'text-red-900'
          }`}>
            {getMessages()[currentMessage]}
          </div>
          {fortuneTigerActive && gameCompleted && (
            <div className="text-sm text-red-800 font-bold animate-pulse mt-1">
              ⚡ FORTUNE TIGER FEATURE ATIVADO! ⚡
            </div>
          )}
        </div>

        {/* Área do jogo */}
        <div className="p-6">
          <div 
            ref={gameAreaRef}
            className="relative bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-xl border-4 border-yellow-600 p-4 mb-6 aspect-square"
          >
            {/* Canvas de raspagem */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-pointer z-10 rounded-lg"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              style={{ touchAction: 'none' }}
            />

            {/* Grid 3x3 dos símbolos */}
            <div className="grid grid-cols-3 gap-2 h-full relative z-0">
              {symbols.map((symbol, index) => (
                <div
                  key={index}
                  className={getSymbolClass(symbol, index)}
                  style={{
                    background: symbol === '🐅' ? 
                      'linear-gradient(45deg, #FFD700, #FFA500)' : 
                      'linear-gradient(45deg, #FFF8DC, #F0E68C)',
                    border: symbol === '🐅' ? '3px solid #FF4500' : '2px solid #DAA520',
                    boxShadow: symbol === '🐅' ? '0 0 20px rgba(255, 69, 0, 0.5)' : 'none'
                  }}
                >
                  {getSymbolEmoji(symbol)}
                </div>
              ))}
            </div>

            {/* Indicador de progresso */}
            {gameStarted && !gameCompleted && (
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 rounded-full p-1 z-20">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scratchProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Controles de aposta */}
          <div className="flex items-center justify-between mb-4 bg-yellow-100 rounded-lg p-3 border-2 border-yellow-400">
            <button
              onClick={() => setBetAmount(Math.max(BET_VALUES[0], betAmount - 0.5))}
              disabled={isPlaying || betAmount <= BET_VALUES[0]}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              -
            </button>
            
            <div className="text-center">
              <div className="text-sm text-red-800 font-semibold">Aposta</div>
              <div className="text-xl font-bold text-red-900">{formatCurrency(betAmount)}</div>
            </div>
            
            <button
              onClick={() => setBetAmount(Math.min(BET_VALUES[BET_VALUES.length - 1], betAmount + 0.5))}
              disabled={isPlaying || betAmount >= BET_VALUES[BET_VALUES.length - 1]}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              +
            </button>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <button
              onClick={() => onPlay(false)}
              disabled={isPlaying || balance < betAmount}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {isPlaying ? '🎰 JOGANDO...' : '🎰 JOGAR FORTUNE TIGER'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTurboActive(!turboActive);
                  if (!turboActive) onPlay(true);
                }}
                disabled={isPlaying}
                className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all ${
                  turboActive 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-red-900' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                ⚡ TURBO
              </button>

              <button
                onClick={() => setShowAutoOptions(!showAutoOptions)}
                disabled={isPlaying}
                className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all ${
                  autoActive 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                🔄 AUTO {autoActive ? `(${autoRounds})` : ''}
              </button>
            </div>

            {/* Opções de auto play */}
            {showAutoOptions && (
              <div className="bg-yellow-100 rounded-lg p-3 border-2 border-yellow-400">
                <div className="text-sm text-red-800 font-semibold mb-2">Rodadas Automáticas:</div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(rounds => (
                    <button
                      key={rounds}
                      onClick={() => {
                        setAutoRounds(rounds);
                        setAutoActive(true);
                        setShowAutoOptions(false);
                        onPlay(turboActive);
                      }}
                      disabled={isPlaying}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                    >
                      {rounds}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Informações do jogo */}
          <div className="mt-4 text-center text-sm text-yellow-100">
            <div>RTP: 96.81% | Volatilidade: Média</div>
            <div>Ganhe com 3 símbolos iguais em linha</div>
            {gameResult?.fortuneTigerActive && (
              <div className="text-yellow-300 font-bold animate-pulse">
                🐅 Fortune Tiger Feature Ativo! 🐅
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos CSS para animações */}
      <style jsx>{`
        .winner-cell {
          animation: winnerPulse 1s ease-in-out infinite alternate;
          background: linear-gradient(45deg, #32CD32, #90EE90) !important;
          border: 3px solid #228B22 !important;
          box-shadow: 0 0 25px rgba(50, 205, 50, 0.8) !important;
        }
        
        .wild-symbol {
          animation: wildGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes winnerPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes wildGlow {
          0% { box-shadow: 0 0 20px rgba(255, 69, 0, 0.5); }
          100% { box-shadow: 0 0 30px rgba(255, 69, 0, 0.9); }
        }
      `}</style>
    </div>
  );
};

export default GameCard;

