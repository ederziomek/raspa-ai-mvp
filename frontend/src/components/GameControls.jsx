import { useState } from 'react';
import { Minus, Plus, Zap, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GameControls({ 
  betAmount, 
  onBetChange, 
  onPlay, 
  onTurboPlay,
  isPlaying,
  autoPlay,
  onAutoPlayToggle,
  onAutoPlayConfig,
  balance 
}) {
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState(10);

  const betOptions = [0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000];
  const roundOptions = [10, 25, 50, 100];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const increaseBet = () => {
    const currentIndex = betOptions.findIndex(bet => bet === betAmount);
    if (currentIndex < betOptions.length - 1) {
      onBetChange(betOptions[currentIndex + 1]);
    }
  };

  const decreaseBet = () => {
    const currentIndex = betOptions.findIndex(bet => bet === betAmount);
    if (currentIndex > 0) {
      onBetChange(betOptions[currentIndex - 1]);
    }
  };

  const handleAutoPlay = () => {
    if (autoPlay.isActive) {
      onAutoPlayToggle();
    } else {
      setShowAutoModal(true);
    }
  };

  const startAutoPlay = () => {
    onAutoPlayConfig(selectedRounds);
    onAutoPlayToggle();
    setShowAutoModal(false);
  };

  const canDecrease = betAmount > betOptions[0];
  const canIncrease = betAmount < betOptions[betOptions.length - 1];
  const canPlay = balance >= betAmount && !isPlaying;

  return (
    <>
      <div className="bg-gradient-to-b from-red-800 to-red-900 p-4 rounded-lg border-2 border-yellow-500 shadow-2xl">
        {/* Informações do saldo e aposta */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-black/50 p-2 rounded border border-yellow-500/50">
            <div className="text-yellow-400 text-xs font-medium">SALDO</div>
            <div className="text-white font-bold text-sm">
              {formatCurrency(balance)}
            </div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-yellow-500/50">
            <div className="text-yellow-400 text-xs font-medium">APOSTA</div>
            <div className="text-white font-bold text-sm">
              {formatCurrency(betAmount)}
            </div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-yellow-500/50">
            <div className="text-yellow-400 text-xs font-medium">GANHO</div>
            <div className="text-green-400 font-bold text-sm">
              {formatCurrency(0)}
            </div>
          </div>
        </div>

        {/* Botão principal de jogar */}
        <div className="mb-4">
          <Button
            onClick={onPlay}
            disabled={!canPlay}
            className="w-full h-16 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-lg border-2 border-yellow-500 shadow-lg transform transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Jogando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-6 h-6" />
                Jogar {formatCurrency(betAmount)}
              </div>
            )}
          </Button>
        </div>

        {/* Controles em linha - estilo Fortune Tiger */}
        <div className="grid grid-cols-4 gap-2">
          {/* Botão TURBO */}
          <Button
            onClick={onTurboPlay}
            disabled={!canPlay}
            className="h-14 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold border-2 border-yellow-500 shadow-lg transform transition-all duration-150 active:scale-95 disabled:opacity-50"
          >
            <div className="flex flex-col items-center">
              <Zap className="w-5 h-5 mb-1" />
              <span className="text-xs">TURBO</span>
            </div>
          </Button>

          {/* Botão Diminuir */}
          <Button
            onClick={decreaseBet}
            disabled={!canDecrease || isPlaying}
            className="h-14 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold border-2 border-yellow-500 shadow-lg transform transition-all duration-150 active:scale-95 disabled:opacity-50"
          >
            <Minus className="w-6 h-6" />
          </Button>

          {/* Botão Aumentar */}
          <Button
            onClick={increaseBet}
            disabled={!canIncrease || isPlaying}
            className="h-14 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold border-2 border-yellow-500 shadow-lg transform transition-all duration-150 active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Botão AUTO */}
          <Button
            onClick={handleAutoPlay}
            className={`h-14 font-bold border-2 border-yellow-500 shadow-lg transform transition-all duration-150 active:scale-95 ${
              autoPlay.isActive 
                ? 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white' 
                : 'bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white'
            }`}
          >
            <div className="flex flex-col items-center">
              {autoPlay.isActive ? (
                <>
                  <Pause className="w-5 h-5 mb-1" />
                  <span className="text-xs">PARAR</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mb-1" />
                  <span className="text-xs">AUTO</span>
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Status do Auto Play */}
        {autoPlay.isActive && (
          <div className="mt-3 bg-red-500/20 border border-red-500 rounded p-2">
            <div className="text-center text-red-300 text-sm font-medium">
              Auto Play: {autoPlay.remaining} de {autoPlay.total} rodadas
            </div>
            <div className="w-full bg-red-900/50 rounded-full h-2 mt-1">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((autoPlay.total - autoPlay.remaining) / autoPlay.total) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal de configuração do Auto Play */}
      {showAutoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6 w-full max-w-md border-2 border-yellow-500 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">🤖 Auto Play</h2>
              <p className="text-gray-300">Selecione quantas rodadas jogar automaticamente</p>
            </div>

            {/* Opções de rodadas */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roundOptions.map((rounds) => (
                <Button
                  key={rounds}
                  onClick={() => setSelectedRounds(rounds)}
                  className={`h-12 font-bold border-2 transition-all ${
                    selectedRounds === rounds 
                      ? 'border-yellow-500 bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                      : 'border-gray-600 bg-gradient-to-b from-gray-700 to-gray-800 text-white hover:border-yellow-500/50'
                  }`}
                >
                  {rounds} rodadas
                </Button>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAutoModal(false)}
                className="flex-1 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white border-2 border-gray-500"
              >
                Cancelar
              </Button>
              <Button
                onClick={startAutoPlay}
                className="flex-1 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white border-2 border-yellow-500"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

