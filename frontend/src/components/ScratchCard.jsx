import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiAnimation } from './ConfettiAnimation';

export function ScratchCard({ 
  betAmount, 
  onPlay, 
  isPlaying, 
  gameResult, 
  balance
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [symbols, setSymbols] = useState([]);

  // Símbolos possíveis para a raspadinha
  const possibleSymbols = ['💰', '💎', '🏆', '⭐', '🎯', '🔥', '💸', '🎁', '🍀'];

  useEffect(() => {
    if (gameResult) {
      // Gera símbolos baseado no resultado
      const newSymbols = generateSymbols(gameResult);
      setSymbols(newSymbols);
      setIsRevealed(true);
      
      // Se ganhou, mostra confetes
      if (gameResult.isWinner) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setIsRevealed(false);
      setSymbols([]);
    }
  }, [gameResult]);

  const generateSymbols = (result) => {
    const symbols = [];
    
    if (result.isWinner && result.winningSymbol) {
      // Se ganhou, coloca 3 símbolos iguais
      const winSymbol = result.winningSymbol;
      const positions = [0, 4, 8]; // Diagonal ou linha
      
      for (let i = 0; i < 9; i++) {
        if (positions.includes(i)) {
          symbols.push(winSymbol);
        } else {
          // Símbolos aleatórios diferentes
          let randomSymbol;
          do {
            randomSymbol = possibleSymbols[Math.floor(Math.random() * possibleSymbols.length)];
          } while (randomSymbol === winSymbol);
          symbols.push(randomSymbol);
        }
      }
    } else {
      // Se perdeu, símbolos aleatórios sem 3 iguais
      for (let i = 0; i < 9; i++) {
        symbols.push(possibleSymbols[Math.floor(Math.random() * possibleSymbols.length)]);
      }
    }
    
    return symbols;
  };

  const handlePlay = () => {
    if (balance < betAmount) {
      alert('Saldo insuficiente!');
      return;
    }
    
    setIsRevealed(false);
    setSymbols([]);
    onPlay();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-green-500/30">
      <ConfettiAnimation isActive={showConfetti} />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">RaspaAI</h2>
        <p className="text-gray-400">Raspe e ganhe prêmios incríveis!</p>
      </div>

      {/* Cartela 3x3 */}
      <div className="relative mb-6">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 9 }, (_, i) => (
            <motion.div
              key={i}
              className={`
                aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                ${isRevealed 
                  ? 'bg-gray-800 border-green-500/50 text-white' 
                  : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 text-gray-300'
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {isRevealed && symbols[i] ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  {symbols[i]}
                </motion.span>
              ) : (
                <span className="text-gray-500">?</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Overlay de instruções */}
        {!isRevealed && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl font-bold mb-2"
              >
                RASPE AQUI!
              </motion.div>
              <p className="text-sm text-gray-300">
                Encontre 3 símbolos iguais e ganhe!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {gameResult && isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            {gameResult.isWinner ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                <div className="text-green-400 font-bold text-lg mb-1">
                  🎉 PARABÉNS! 🎉
                </div>
                <div className="text-white text-xl font-bold">
                  Você ganhou {formatCurrency(gameResult.prizeAmount)}!
                </div>
                <div className="text-green-300 text-sm mt-1">
                  Multiplicador: {gameResult.multiplier}x
                </div>
              </div>
            ) : (
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <div className="text-gray-400 font-medium">
                  Não foi dessa vez...
                </div>
                <div className="text-white text-sm mt-1">
                  Tente novamente!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div className="space-y-4">
        {/* Botão principal */}
        <Button
          onClick={handlePlay}
          disabled={isPlaying || balance < betAmount}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
        >
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Jogando...
            </div>
          ) : gameResult ? (
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Jogar Novamente {formatCurrency(betAmount)}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Jogar {formatCurrency(betAmount)}
            </div>
          )}
        </Button>

        {/* Revelação rápida */}
        {gameResult && !isRevealed && (
          <Button
            variant="outline"
            onClick={() => setIsRevealed(true)}
            className="w-full border-yellow-500 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
          >
            <Zap className="w-4 h-4 mr-2" />
            Revelar Tudo
          </Button>
        )}
      </div>

      {/* Instruções */}
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>Reúna 3 símbolos iguais e conquiste seu prêmio!</p>
        <p className="mt-1">O valor será creditado automaticamente na sua conta.</p>
      </div>
    </div>
  );
}

