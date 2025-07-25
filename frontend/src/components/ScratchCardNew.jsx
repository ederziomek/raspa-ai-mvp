import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfettiAnimation } from './ConfettiAnimation';

export function ScratchCardNew({ 
  betAmount, 
  isPlaying, 
  gameResult
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [symbols, setSymbols] = useState([]);
  const [cardKey, setCardKey] = useState(0);

  const gameSymbols = ['⭐', '💎', '🔥', '💰', '🍀', '⚡', '🎯', '🏆', '💸'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateSymbols = () => {
    return Array.from({ length: 9 }, () => 
      gameSymbols[Math.floor(Math.random() * gameSymbols.length)]
    );
  };

  // Efeito quando o jogo inicia
  useEffect(() => {
    if (isPlaying) {
      setIsRevealed(false);
      setShowConfetti(false);
      setSymbols(generateSymbols());
      setCardKey(prev => prev + 1);
    }
  }, [isPlaying]);

  // Efeito quando o resultado chega
  useEffect(() => {
    if (gameResult) {
      if (gameResult.isWinner) {
        const winningSymbol = gameResult.winningSymbol || '💰';
        const newSymbols = generateSymbols();
        const positions = [0, 4, 8];
        positions.forEach(pos => {
          newSymbols[pos] = winningSymbol;
        });
        setSymbols(newSymbols);
        
        setTimeout(() => {
          setShowConfetti(true);
        }, 500);
      } else {
        setSymbols(generateSymbols());
      }
      
      setTimeout(() => {
        setIsRevealed(true);
      }, 100);
    }
  }, [gameResult]);

  return (
    <div className="relative">
      {showConfetti && <ConfettiAnimation />}
      
      <div className="bg-gradient-to-b from-red-800 to-red-900 p-6 rounded-lg border-2 border-yellow-500 shadow-2xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">RaspaAI</h2>
          <p className="text-white text-sm">Raspe e ganhe prêmios incríveis!</p>
        </div>

        {/* Grid da raspadinha com animações */}
        <div className="relative mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={cardKey}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="grid grid-cols-3 gap-2 bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-lg border-2 border-yellow-300"
            >
              {Array.from({ length: 9 }).map((_, index) => (
                <motion.div
                  key={`${cardKey}-${index}`}
                  initial={{ scale: 0, rotateZ: -180 }}
                  animate={{ scale: 1, rotateZ: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-300
                    ${isRevealed 
                      ? 'bg-white/90 shadow-inner' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-800 cursor-pointer hover:scale-105'
                    }
                  `}
                  onClick={() => !isPlaying && setIsRevealed(true)}
                >
                  {isRevealed ? (
                    <motion.span
                      initial={{ scale: 0, rotateZ: 180 }}
                      animate={{ scale: 1, rotateZ: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {symbols[index] || '?'}
                    </motion.span>
                  ) : (
                    <span className="text-gray-400 text-xl">?</span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Overlay de loading */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="font-bold">Raspando...</p>
              </div>
            </motion.div>
          )}

          {/* Instruções */}
          <div className="text-center mt-4">
            <p className="text-yellow-200 text-sm">
              {isPlaying 
                ? 'Aguarde o resultado...' 
                : isRevealed 
                  ? 'Encontre 3 símbolos iguais e ganhe!'
                  : 'Clique em "Jogar" para começar'
              }
            </p>
          </div>
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {gameResult && isRevealed && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`text-center p-4 rounded-lg mb-4 ${
                gameResult.isWinner 
                  ? 'bg-green-500/20 border border-green-500' 
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              {gameResult.isWinner ? (
                <div>
                  <div className="text-green-400 font-bold text-2xl mb-2">
                    🎉 PARABÉNS! 🎉
                  </div>
                  <div className="text-white text-lg">
                    Você ganhou <span className="font-bold text-green-400">
                      {formatCurrency(gameResult.prizeAmount)}
                    </span>
                  </div>
                  <div className="text-green-300 text-sm">
                    Multiplicador: {gameResult.multiplier}x
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-red-400 font-bold text-lg mb-2">
                    Não foi dessa vez...
                  </div>
                  <div className="text-white text-sm">
                    Tente novamente!
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

