import { useState, useEffect } from 'react';
import { mockWinners } from '../data/mockData';

export function WinnersFeedHorizontal() {
  const [winners, setWinners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Inicializa com alguns ganhadores
    setWinners(mockWinners.slice(0, 10));

    // Adiciona novos ganhadores periodicamente
    const interval = setInterval(() => {
      const randomWinner = mockWinners[Math.floor(Math.random() * mockWinners.length)];
      setWinners(prev => [randomWinner, ...prev.slice(0, 9)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto scroll horizontal
    const scrollInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, winners.length - 2));
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [winners.length]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTimeAgo = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min atrás`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h atrás`;
    }
  };

  if (winners.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-900/50 via-green-800/50 to-green-900/50 border border-green-500/30 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-400 font-semibold text-sm">🏆 AO VIVO - Últimos Ganhadores</span>
      </div>

      {/* Feed horizontal com scroll automático */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * 280}px)`,
            width: `${winners.length * 280}px`
          }}
        >
          {winners.map((winner, index) => (
            <div
              key={`${winner.name}-${winner.time}-${index}`}
              className="flex-shrink-0 w-64 bg-black/40 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {winner.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm truncate">
                      {winner.name}
                    </span>
                    <span className="text-gray-400 text-xs flex-shrink-0">
                      {formatTimeAgo(winner.time)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">
                      {winner.game}
                    </span>
                    <span className="text-green-400 font-bold text-sm">
                      {formatCurrency(winner.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicador de multiplicador */}
              {winner.multiplier && winner.multiplier > 10 && (
                <div className="mt-2 text-center">
                  <span className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {winner.multiplier}x MULTIPLICADOR!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Indicadores de navegação */}
        <div className="flex justify-center mt-3 gap-1">
          {Array.from({ length: Math.max(1, winners.length - 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="mt-3 pt-3 border-t border-green-500/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg">
              {winners.length}
            </div>
            <div className="text-gray-400 text-xs">Ganhadores Hoje</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">
              {formatCurrency(winners.reduce((sum, w) => sum + w.amount, 0))}
            </div>
            <div className="text-gray-400 text-xs">Total Pago</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold text-lg">
              {Math.max(...winners.map(w => w.multiplier || 1))}x
            </div>
            <div className="text-gray-400 text-xs">Maior Mult.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

