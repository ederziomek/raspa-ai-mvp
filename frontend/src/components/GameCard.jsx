import { useState, useRef, useEffect, useCallback } from 'react';

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
  const [messageType, setMessageType] = useState('default'); // 'default', 'win', 'loss'
  const [currentMessage, setCurrentMessage] = useState(0); // 0 ou 1 para alternar mensagens
  const canvasRef = useRef(null);
  const gameAreaRef = useRef(null);
  const isMouseDown = useRef(false);
  const lastScratchTime = useRef(0);
  const autoIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);

  // Apenas 4 ícones conforme solicitado
  const gameIcons = ['⭐️', '💎', '☘️', '🔥'];
  const winningIcon = '💰';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // LÓGICA CORRIGIDA - NUNCA 3 ÍCONES IGUAIS (EXCETO SAQUINHOS PARA VITÓRIA)
  const generateSymbols = useCallback(() => {
    if (!gameResult) {
      return Array(9).fill('?');
    }

    const symbols = [];
    
    if (gameResult.isWinner) {
      // Se ganhou, coloca EXATAMENTE 3 saquinhos de dinheiro em posições ALEATÓRIAS
      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const shuffledPositions = positions.sort(() => Math.random() - 0.5);
      const winPositions = shuffledPositions.slice(0, 3);
      
      for (let i = 0; i < 9; i++) {
        if (winPositions.includes(i)) {
          symbols[i] = winningIcon;
        }
      }
      
      // Preenche o resto garantindo MÁXIMO 2 de cada ícone normal
      const remainingPositions = positions.filter(pos => !winPositions.includes(pos));
      const iconCounts = { '⭐️': 0, '💎': 0, '☘️': 0, '🔥': 0 };
      
      for (let pos of remainingPositions) {
        let selectedIcon;
        let attempts = 0;
        
        do {
          selectedIcon = gameIcons[Math.floor(Math.random() * gameIcons.length)];
          attempts++;
        } while (iconCounts[selectedIcon] >= 2 && attempts < 50);
        
        symbols[pos] = selectedIcon;
        iconCounts[selectedIcon]++;
      }
    } else {
      // Se perdeu, pode ter 0, 1 ou 2 saquinhos (NUNCA 3)
      const numWinningIcons = Math.random() < 0.6 ? (Math.random() < 0.7 ? 1 : 2) : 0;
      
      if (numWinningIcons > 0) {
        const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const shuffledPositions = positions.sort(() => Math.random() - 0.5);
        const winPositions = shuffledPositions.slice(0, numWinningIcons);
        
        for (let pos of winPositions) {
          symbols[pos] = winningIcon;
        }
      }
      
      // Preenche o resto garantindo MÁXIMO 2 de cada ícone (incluindo saquinhos já colocados)
      const iconCounts = { '⭐️': 0, '💎': 0, '☘️': 0, '🔥': 0, '💰': numWinningIcons };
      
      for (let i = 0; i < 9; i++) {
        if (!symbols[i]) {
          let selectedIcon;
          let attempts = 0;
          
          do {
            selectedIcon = gameIcons[Math.floor(Math.random() * gameIcons.length)];
            attempts++;
          } while (iconCounts[selectedIcon] >= 2 && attempts < 50);
          
          symbols[i] = selectedIcon;
          iconCounts[selectedIcon]++;
        }
      }
    }
    
    return symbols;
  }, [gameResult]);

  const [symbols, setSymbols] = useState(() => generateSymbols());

  // Calcula valor máximo possível para a aposta atual - 5000x
  const getMaxPossibleWin = useCallback(() => {
    const maxMultiplier = 5000; // Multiplicador máximo corrigido para 5000x
    return betAmount * maxMultiplier;
  }, [betAmount]);

  // DUAS MENSAGENS ALTERNADAS
  const getMessages = useCallback(() => {
    if (gameCompleted && gameResult) {
      if (gameResult.isWinner) {
        return [`Ganho: ${formatCurrency(gameResult.prizeAmount)} 🤑`];
      } else {
        return ['Não foi dessa vez 😔 Tente Novamente!'];
      }
    } else {
      return [
        `Ganhe até ${formatCurrency(getMaxPossibleWin())}`,
        'Multiplicadores de Até 5000x'
      ];
    }
  }, [gameCompleted, gameResult, getMaxPossibleWin]);

  // Atualiza mensagem baseada no estado do jogo
  const updateMessage = useCallback(() => {
    const messages = getMessages();
    
    if (gameCompleted && gameResult) {
      if (gameResult.isWinner) {
        setMessageType('win');
      } else {
        setMessageType('loss');
      }
      setCurrentMessage(0); // Só uma mensagem quando completo
      
      // Para a alternância quando o jogo termina
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    } else {
      setMessageType('default');
      
      // Inicia alternância entre as duas mensagens
      if (!messageIntervalRef.current && messages.length > 1) {
        messageIntervalRef.current = setInterval(() => {
          setCurrentMessage(prev => prev === 0 ? 1 : 0);
        }, 4000); // Alterna a cada 4 segundos
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
      updateMessage();
      
      // Limpa o canvas único
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        initializeCanvas();
      }
    }
  }, [isPlaying, updateMessage]);

  // Inicializa o canvas com a camada de cobertura
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

  // AUTO PLAY AUTOMÁTICO
  useEffect(() => {
    if (autoActive && autoRounds > 0 && !isPlaying && gameCompleted && balanceUpdated) {
      autoIntervalRef.current = setTimeout(() => {
        onPlay(turboActive);
      }, 2000); // Aumentado para 2 segundos para ver a mensagem
    }
    
    return () => {
      if (autoIntervalRef.current) {
        clearTimeout(autoIntervalRef.current);
      }
    };
  }, [autoActive, autoRounds, isPlaying, gameCompleted, balanceUpdated, turboActive, onPlay]);

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

  // Calcula o progresso da raspagem - 80%
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
    
    // Libera automaticamente aos 80%
    if (progress >= 80 && !gameCompleted) {
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
        
        setTimeout(() => {
          // CORRIGIDO: Aplica background verde APENAS nos saquinhos vencedores E APENAS quando ganha
          if (gameResult && gameResult.isWinner) {
            const cells = document.querySelectorAll('.symbol-cell');
            cells.forEach((cell, index) => {
              if (symbols[index] === winningIcon) {
                cell.classList.add('winner-cell');
              }
            });
            
            setShowConfetti(true);
            
            // Para confetes depois de 3 segundos
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          }
          
          // Atualiza mensagem
          updateMessage();
          
          // Atualiza saldo após 1 segundo
          setTimeout(() => {
            updateBalance();
          }, 1000);
        }, 100);
      }
    };
    
    fadeOut();
  }, [gameCompleted, gameResult, symbols, updateMessage]);

  // Atualiza saldo
  const updateBalance = useCallback(() => {
    if (balanceUpdated) return;
    
    setBalanceUpdated(true);
    
    if (onBalanceUpdate) {
      // CORRIGIDO: Passa apenas prizeAmount se ganhou (aposta já foi debitada)
      const prizeAmount = gameResult?.isWinner ? gameResult.prizeAmount : 0;
      onBalanceUpdate(prizeAmount);
    }
    
    // Se modo auto está ativo, diminui contador
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

  // Funções dos botões
  const handleTurboClick = () => {
    setTurboActive(!turboActive);
  };

  const handleAutoClick = () => {
    if (autoActive) {
      setAutoActive(false);
      setAutoRounds(0);
      if (autoIntervalRef.current) {
        clearTimeout(autoIntervalRef.current);
      }
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
    onPlay(turboActive);
  };

  // Componente de Confetes
  const ConfettiAnimation = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 opacity-80"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#48bb78', '#f6e05e', '#ed8936', '#9f7aea', '#38b2ac'][Math.floor(Math.random() * 5)],
          animation: `confetti-fall ${2 + Math.random() * 3}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ));
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {confettiPieces}
        <style jsx>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6 rounded-lg border-2 border-green-500 shadow-2xl max-w-md mx-auto w-full relative">
      {/* Confetes */}
      <ConfettiAnimation />
      
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-green-400 mb-2">RaspaAI</h2>
        <p className="text-gray-300 text-sm">Raspe e ganhe prêmios incríveis!</p>
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
            {scratchProgress >= 80 && scratchProgress < 100 && (
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
              className={`symbol-cell relative aspect-square rounded-lg overflow-hidden border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-bold">
                {gameStarted ? (
                  <span className="text-white">
                    {symbol}
                  </span>
                ) : (
                  <span className="text-gray-500 text-lg">?</span>
                )}
              </div>
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

        {/* Indicador de área liberada */}
        {gameStarted && scratchProgress >= 80 && scratchProgress < 100 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold animate-bounce z-20">
            80%+ Liberado!
          </div>
        )}
      </div>

      {/* MENSAGEM ANIMADA ESTILO FORTUNE TIGER - DUAS MENSAGENS ALTERNADAS */}
      <div className="mb-4 h-8 overflow-hidden rounded-lg border border-green-500/30 relative">
        <div 
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold whitespace-nowrap animate-marquee ${
            messageType === 'win' ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' :
            messageType === 'loss' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' :
            'bg-gradient-to-r from-gray-700 to-gray-600 text-green-400'
          }`}
        >
          {getMessages()[currentMessage]}
        </div>
      </div>

      {/* Informações do jogo - LAYOUT ESTILO FORTUNE TIGER */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-3 rounded border-2 border-yellow-400 text-center">
          <div className="text-yellow-100 text-xs font-medium mb-1">💰 SALDO</div>
          <div className="text-white text-sm font-bold">{formatCurrency(balance)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded border-2 border-blue-400 text-center">
          <div className="text-blue-100 text-xs font-medium mb-1">🎯 APOSTA</div>
          <div className="text-white text-sm font-bold">{formatCurrency(betAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded border-2 border-green-400 text-center">
          <div className="text-green-100 text-xs font-medium mb-1">🏆 GANHO</div>
          <div className="text-white text-sm font-bold">
            {formatCurrency(gameCompleted && balanceUpdated && gameResult?.prizeAmount ? gameResult.prizeAmount : 0)}
          </div>
        </div>
      </div>

      {/* Botão principal de jogar - ESTILO FORTUNE TIGER */}
      <button 
        onClick={handlePlay}
        disabled={isPlaying || balance < betAmount}
        className="w-full h-14 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-white font-bold text-xl border-3 border-green-300 shadow-xl transform transition-all duration-150 active:scale-95 rounded-lg mb-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
        {isPlaying ? (
          <div className="flex items-center justify-center gap-2 relative z-10">
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            Aguarde...
          </div>
        ) : (
          <span className="relative z-10">▶ JOGAR {formatCurrency(betAmount)}</span>
        )}
      </button>

      {/* Controles em linha - LAYOUT FORTUNE TIGER */}
      <div className="flex gap-2 relative">
        {/* Botão Turbo */}
        <button 
          onClick={handleTurboClick}
          disabled={isPlaying}
          className={`flex-1 h-12 ${
            turboActive 
              ? 'bg-gradient-to-b from-orange-500 to-orange-600 border-orange-300' 
              : 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500'
          } hover:opacity-80 disabled:opacity-50 text-white font-bold border-2 shadow-lg transform transition-all duration-150 active:scale-95 rounded relative`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">⚡</span>
            <span className="text-xs">TURBO</span>
            {turboActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Botões de aposta */}
        <button 
          onClick={() => setBetAmount(prev => Math.max(0.5, prev - 0.5))}
          disabled={isPlaying || autoActive}
          className="w-12 h-12 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:opacity-50 text-white font-bold text-2xl border-2 border-red-300 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          -
        </button>

        <button 
          onClick={() => setBetAmount(prev => Math.min(1000, prev + 0.5))}
          disabled={isPlaying || autoActive}
          className="w-12 h-12 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-2xl border-2 border-blue-300 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
        >
          +
        </button>

        {/* Botão Auto */}
        <button 
          onClick={handleAutoClick}
          disabled={isPlaying}
          className={`flex-1 h-12 ${
            autoActive 
              ? 'bg-gradient-to-b from-purple-500 to-purple-600 border-purple-300' 
              : 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500'
          } hover:opacity-80 disabled:opacity-50 text-white font-bold border-2 shadow-lg transform transition-all duration-150 active:scale-95 rounded relative`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg">{autoActive ? '⏹' : '▶'}</span>
            <span className="text-xs">
              {autoActive ? autoRounds : 'AUTO'}
            </span>
            {autoActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
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

      {/* CSS para background verde dos vencedores APENAS quando ganha e animação da mensagem */}
      <style jsx>{`
        .winner-cell {
          background: linear-gradient(135deg, #48bb78, #38a169) !important;
          animation: winner-pulse 2s infinite;
        }
        
        @keyframes winner-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GameCard;

