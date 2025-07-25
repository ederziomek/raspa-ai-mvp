import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BetControls({ betAmount, onBetChange, minBet = 0.5, maxBet = 1000 }) {
  const betOptions = [0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000];

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const canDecrease = betAmount > minBet;
  const canIncrease = betAmount < maxBet;

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold mb-1">Valor da Aposta</h3>
        <p className="text-gray-400 text-sm">Ajuste o valor usando os botões abaixo</p>
      </div>

      {/* Controle principal */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={decreaseBet}
          disabled={!canDecrease}
          className="w-12 h-12 border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-5 h-5" />
        </Button>

        <div className="bg-black/50 px-6 py-3 rounded-lg border border-green-500/50 min-w-[120px]">
          <div className="text-center">
            <div className="text-green-400 text-2xl font-bold">
              {formatCurrency(betAmount)}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={increaseBet}
          disabled={!canIncrease}
          className="w-12 h-12 border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Botões de valores rápidos */}
      <div className="grid grid-cols-4 gap-2">
        {betOptions.slice(0, 8).map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => onBetChange(value)}
            className={`
              text-xs transition-colors
              ${betAmount === value 
                ? 'border-green-500 bg-green-500/30 text-green-300' 
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'
              }
            `}
          >
            {formatCurrency(value)}
          </Button>
        ))}
      </div>

      {/* Informações */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>Mín: {formatCurrency(minBet)} • Máx: {formatCurrency(maxBet)}</p>
      </div>
    </div>
  );
}

