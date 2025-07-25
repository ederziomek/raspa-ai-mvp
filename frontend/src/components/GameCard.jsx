import { useState, useRef, useEffect, useCallback } from 'react';

const GameCard = ({ 
  balance,
  betAmount,
  setBetAmount,
  gameResult, 
  isPlaying, 
  onPlay,
  onBalanceUpdate, // Callback para atualizar saldo no componente pai
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
  const canvasRef = useRef(null);
  const gameAreaRef = useRef(null);
  const isMouseDown = useRef(false);
  const lastScratchTime = useRef(0);

  // Apenas 4 ícones conforme solicitado (removido o saquinho de dinheiro)
  const gameIcons = ['⭐️', '💎', '☘️', '🔥'];
  const winningIcon = '💰';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Gera símbolos para o jogo baseado no resultado - LÓGICA MELHORADA
  const generateSymbols = useCallback(() => {
    if (!gameResult) {
      return Array(9).fill('?');
    }

    const symbols = [];
    
    if (gameResult.isWinner) {
      // Se ganhou, coloca EXATAMENTE 3 saquinhos de dinheiro em posições ALEATÓRIAS
      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const shuffledPositions = positions.sort(() => Math.random() - 0.5);
      const winPositions = shuffledPositions.slice(0, 3); // Pega 3 posições aleatórias
      
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
      // Se perdeu, pode ter 0, 1 ou 2 saquinhos de dinheiro (NUNCA 3)
      const numWinningIcons = Math.random() < 0.6 ? (Math.random() < 0.7 ? 1 : 2) : 0; // 60% chance de ter 1-2, 40% de ter 0
      
      if (numWinningIcons > 0) {
        const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const shuffledPositions = positions.sort(() => Math.random() - 0.5);
        const winPositions = shuffledPositions.slice(0, numWinningIcons);
        
        for (let i = 0; i < 9; i++) {
          if (winPositions.includes(i)) {
            symbols[i] = winningIcon;
          }
        }
      }
      
      // Preenche o resto com ícones normais, garantindo que não há 3 iguais
      for (let i = 0; i < 9; i++) {
        if (!symbols[i]) {
          let selectedIcon;
          let attempts = 0;
          
          do {
            selectedIcon = gameIcons[Math.floor(Math.random() * gameIcons.length)];
            attempts++;
            
            // Conta quantos deste ícone já existem
            const currentCount = symbols.filter(s => s === selectedIcon).length;
            
            // Se já tem 2 deste ícone, tenta outro
            if (currentCount >= 2) {
              continue;
            }
            
            // Verifica se colocar este ícone criaria 3 iguais
            const tempSymbols = [...symbols];
            tempSymbols[i] = selectedIcon;
            const finalCount = tempSymbols.filter(s => s === selectedIcon).length;
            
            if (finalCount <= 2) {
              break;
            }
          } while (attempts < 50);
          
          symbols[i] = selectedIcon;
        }
      }
    }
    
    return symbols;
  }, [gameResult]);

  const [symbols, setSymbols] = useState(() => generateSymbols());

  // Atualiza símbolos quando o resultado do jogo muda
  useEffect(() => {
    if (gameResult) {
      setSymbols(generateSymbols());
      setGameStarted(true);
      setGameCompleted(false);
      setBalanceUpdated(false);
      setRevealedArea(0);
    }
  }, [gameResult, generateSymbols]);

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
      
      // Limpa o canvas único
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        initializeCanvas();
      }
    }
  }, [isPlaying]);

  // Inicializa o canvas com a camada de cobertura - COBERTURA 100% PERFEITA
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !gameAreaRef.current) return;
    
    const canvas = canvasRef.current;
    const gameArea = gameAreaRef.current;
    const ctx = canvas.getContext('2d');
    
    // Canvas cobre TODA a área interna do game-area
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
    
    // Desenha a camada de cobertura única com gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.5, '#5a6578');
    gradient.addColorStop(1, '#4a5568');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adiciona textura de raspadinha
    ctx.fillStyle = '#6b7280';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Adiciona padrão de linhas
    ctx.strokeStyle = '#5a6578';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Bordas dos quadradinhos
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    const cellWidth = canvas.width / 3;
    const cellHeight = canvas.height / 3;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    }
    
    // Borda externa
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Modo turbo - revela tudo automaticamente
  useEffect(() => {
    if (turboActive && gameResult && !isRevealing && gameStarted && !gameCompleted) {
      setIsRevealing(true);
      
      const revealInstantly = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Remove toda a cobertura instantaneamente
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

  // Função para "raspar" o canvas único
  const scratch = useCallback((canvas, x, y) => {
    if (!canvas || !gameStarted || gameCompleted || isRevealing || turboActive) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    ctx.globalCompositeOperation = 'destination-out';
    
    // Círculo principal
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Círculos menores para efeito mais natural
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;
      ctx.beginPath();
      ctx.arc(canvasX + offsetX, canvasY + offsetY, 12, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Throttle para performance
    const now = Date.now();
    if (now - lastScratchTime.current > 50) {
      calculateScratchProgress();
      lastScratchTime.current = now;
    }
  }, [gameStarted, gameCompleted, isRevealing, turboActive]);

  // Calcula o progresso da raspagem - MUDADO PARA 85%
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
    
    // MUDANÇA: Libera automaticamente aos 85% (era 70%)
    if (progress >= 85 && !gameCompleted) {
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
      ctx.fillStyle = `rgba(74, 85, 104, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      opacity -= 0.08;
      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setScratchProgress(100);
        setRevealedArea(100);
      }
    };
    
    fadeOut();
  }, [gameCompleted]);

  // Atualiza saldo apenas quando o jogo é completado
  useEffect(() => {
    if (gameCompleted && !balanceUpdated && gameResult && onBalanceUpdate) {
      setBalanceUpdated(true);
      
      setTimeout(() => {
        const balanceChange = gameResult.isWinner ? gameResult.prizeAmount : -betAmount;
        onBalanceUpdate(balanceChange);
        
        // Se modo auto está ativo, continua jogando
        if (autoActive && autoRounds > 1) {
          setAutoRounds(prev => prev - 1);
          setTimeout(() => {
            onPlay(turboActive);
          }, 1500);
        } else if (autoActive && autoRounds <= 1) {
          setAutoActive(false);
          setAutoRounds(0);
        }
      }, 800);
    }
  }, [gameCompleted, balanceUpdated, gameResult, betAmount, onBalanceUpdate, autoActive, autoRounds, turboActive, onPlay]);

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

  // Funções dos botões
  const handleTurboClick = () => {
    setTurboActive(!turboActive);
  };

  const handleAutoClick = () => {
    if (autoActive) {
      setAutoActive(false);
      setAutoRounds(0);
    } else {
      setShowAutoOptions(!showAutoOptions);
    }
  };

  const selectAutoRounds = (rounds) => {
    setAutoRounds(rounds);
    setAutoActive(true);
    setShowAutoOptions(false);
  };

  const handlePlay = () => {
    if (autoActive && autoRounds > 0) {
      onPlay(turboActive);
    } else {
      onPlay(turboActive);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6 rounded-lg border-2 border-green-500 shadow-2xl max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-green-400 mb-2">RaspaAI</h2>
        <p className="text-gray-300 text-sm">
          {turboActive && gameStarted ? 'Modo Turbo Ativado!' : 
           autoActive ? `Modo Auto: ${autoRounds} rodadas restantes` : 
           'Raspe e ganhe prêmios incríveis!'}
        </p>
      </div>

      {/* Barra de progresso - APENAS VERDE */}
      {scratchProgress > 0 && gameStarted && (
        <div className="mb-4">
          <div className="bg-gray-700 rounded-full h-3 overflow-hidden border border-green-500/30">
            <div 
              className="h-full transition-all duration-300 ease-out bg-green-500"
              style={{ width: `${scratchProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-400">
              {Math.round(scratchProgress)}% revelado
            </span>
            {scratchProgress >= 85 && scratchProgress < 100 && (
              <span className="text-yellow-400 animate-pulse">
                🎯 Liberando automaticamente...
              </span>
            )}
            {scratchProgress === 100 && (
              <span className="text-green-400">
                ✅ Completo!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid da raspadinha */}
      <div 
        ref={gameAreaRef}
        className="bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-green-400 mb-4 relative"
      >
        {/* Grid de símbolos */}
        <div className="grid grid-cols-3 gap-2 relative">
          {symbols.map((symbol, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800"
            >
              <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-bold">
                {gameStarted ? (
                  <span 
                    className={`transition-all duration-500 ${
                      symbol === winningIcon ? 'text-green-400 animate-pulse' : 'text-white'
                    }`}
                  >
                    {symbol}
                  </span>
                ) : (
                  <span className="text-gray-500 text-lg">?</span>
                )}
              </div>

              {gameCompleted && symbol === winningIcon && (
                <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse rounded-lg" />
              )}
            </div>
          ))}
        </div>

        {/* Canvas único sobreposto */}
        {gameStarted && !gameCompleted && !turboActive && (
          <canvas
            ref={canvasRef}
            className="absolute cursor-crosshair touch-none rounded-lg"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            style={{ 
              pointerEvents: isPlaying ? 'none' : 'auto',
              zIndex: 10
            }}
          />
        )}

        {/* Indicador de área liberada - MUDADO PARA 85% */}
        {gameStarted && scratchProgress >= 85 && scratchProgress < 100 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold animate-bounce z-20">
            85%+ Liberado!
          </div>
        )}
      </div>

      {/* Resultado após revelação */}
      {gameResult && !isPlaying && gameCompleted && (
        <div className={`mb-4 text-center p-4 rounded-lg border-2 transition-all duration-500 ${
          gameResult.isWinner 
            ? 'bg-green-500/20 border-green-500 shadow-green-500/20 shadow-lg' 
            : 'bg-red-500/20 border-red-500 shadow-red-500/20 shadow-lg'
        }`}>
          {gameResult.isWinner ? (
            <div>
              <div className="text-green-400 font-bold text-xl mb-2 animate-pulse">
                🎉 PARABÉNS! 🎉
              </div>
              <div className="text-white text-base mb-1">
                Você ganhou <span className="font-bold text-green-400 text-lg">
                  {formatCurrency(gameResult.prizeAmount)}
                </span>
              </div>
              <div className="text-green-300 text-sm mb-2">
                Multiplicador: {gameResult.multiplier}x
              </div>
              {balanceUpdated ? (
                <div className="text-green-400 text-sm font-medium">
                  ✅ Saldo atualizado com sucesso!
                </div>
              ) : (
                <div className="text-yellow-400 text-sm">
                  ⏳ Atualizando saldo...
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-red-400 font-bold text-lg mb-2">
                😔 Não foi dessa vez...
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Tente novamente!
              </div>
              {balanceUpdated ? (
                <div className="text-red-400 text-sm font-medium">
                  ✅ Saldo atualizado
                </div>
              ) : (
                <div className="text-yellow-400 text-sm">
                  ⏳ Atualizando saldo...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Informações do jogo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-3 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium mb-1">SALDO</div>
          <div className="text-white text-sm font-bold">{formatCurrency(balance)}</div>
        </div>
        <div className="bg-gray-700/50 p-3 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium mb-1">APOSTA</div>
          <div className="text-white text-sm font-bold">{formatCurrency(betAmount)}</div>
        </div>
        <div className="bg-gray-700/50 p-3 rounded border border-green-500/30 text-center">
          <div className="text-green-400 text-xs font-medium mb-1">GANHO</div>
          <div className="text-white text-sm font-bold">
            {formatCurrency(gameResult?.prizeAmount || 0)}
          </div>
        </div>
      </div>

      {/* Botão principal de jogar */}
      <button 
        onClick={handlePlay}
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

      {/* Controles em linha - BOTÕES MELHORADOS */}
      <div className="grid grid-cols-4 gap-2 relative">
        {/* Botão Turbo */}
        <button 
          onClick={handleTurboClick}
          disabled={isPlaying}
          className={`h-12 ${
            turboActive 
              ? 'bg-gradient-to-b from-green-600 to-green-700 border-green-400' 
              : 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500'
          } hover:opacity-80 disabled:opacity-50 text-white font-bold border-2 shadow-lg transform transition-all duration-150 active:scale-95 rounded relative`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">⚡</span>
            <span className="text-xs">TURBO</span>
            {turboActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Botões de aposta */}
        <button 
          onClick={() => setBetAmount(prev => Math.max(0.5, prev - 0.5))}
          disabled={isPlaying || autoActive}
          className="h-12 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold text-2xl border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          -
        </button>

        <button 
          onClick={() => setBetAmount(prev => Math.min(1000, prev + 0.5))}
          disabled={isPlaying || autoActive}
          className="h-12 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold text-2xl border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          +
        </button>

        {/* Botão Auto */}
        <button 
          onClick={handleAutoClick}
          disabled={isPlaying}
          className={`h-12 ${
            autoActive 
              ? 'bg-gradient-to-b from-green-600 to-green-700 border-green-400' 
              : 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500'
          } hover:opacity-80 disabled:opacity-50 text-white font-bold border-2 shadow-lg transform transition-all duration-150 active:scale-95 rounded relative`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">{autoActive ? '⏹' : '▶'}</span>
            <span className="text-xs">
              {autoActive ? autoRounds : 'AUTO'}
            </span>
            {autoActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Opções do Auto */}
        {showAutoOptions && (
          <div className="absolute bottom-14 right-0 bg-gray-800 border-2 border-green-400 rounded-lg p-2 z-30 shadow-xl">
            <div className="text-green-400 text-xs font-bold mb-2 text-center">Rodadas Auto</div>
            <div className="grid grid-cols-1 gap-1">
              {[10, 20, 30, 50, 100].map(rounds => (
                <button
                  key={rounds}
                  onClick={() => selectAutoRounds(rounds)}
                  className="px-3 py-1 bg-gray-700 hover:bg-green-600 text-white text-xs rounded transition-colors"
                >
                  {rounds}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legenda aprimorada */}
      {gameStarted && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-green-500/30">
          <div className="text-center text-xs space-y-1">
            <p className="text-green-400 font-medium">
              💰 = Símbolo da sorte (precisa de EXATAMENTE 3 iguais para ganhar)
            </p>
            <p className="text-gray-400">
              Outros símbolos: ⭐️💎☘️🔥 (máximo 2 de cada)
            </p>
            <div className="border-t border-green-500/30 pt-2 mt-2">
              <p className="text-yellow-400 font-medium">
                ✨ Melhorias Implementadas!
              </p>
              <p className="text-yellow-300 text-xs">
                🎯 Símbolos aleatórios • Liberação aos 85% • Turbo e Auto funcionais • 💰 Pode ter 0-2 saquinhos sem ganhar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;

