export function PrizeTable({ betAmount }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const prizes = [
    { mult: '2000x', valor: betAmount * 2000, cor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { mult: '1000x', valor: betAmount * 1000, cor: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { mult: '400x', valor: betAmount * 400, cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { mult: '200x', valor: betAmount * 200, cor: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { mult: '100x', valor: betAmount * 100, cor: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { mult: '40x', valor: betAmount * 40, cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    { mult: '20x', valor: betAmount * 20, cor: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { mult: '10x', valor: betAmount * 10, cor: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    { mult: '4x', valor: betAmount * 4, cor: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
    { mult: '2x', valor: betAmount * 2, cor: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
    { mult: '1x', valor: betAmount * 1, cor: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  ];

  return (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🏆 Tabela de Prêmios</h2>
        <p className="text-gray-400">Encontre 3 símbolos iguais e ganhe o prêmio correspondente</p>
      </div>

      {/* Versão Desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-4">
          {prizes.map((premio, i) => (
            <div 
              key={i} 
              className={`${premio.bg} ${premio.border} border rounded-lg p-4 text-center transition-all hover:scale-105 hover:shadow-lg`}
            >
              <div className={`${premio.cor} font-bold text-xl mb-2`}>
                {premio.mult}
              </div>
              <div className="text-white font-semibold">
                {formatCurrency(premio.valor)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Versão Mobile */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {prizes.map((premio, i) => (
            <div 
              key={i} 
              className={`${premio.bg} ${premio.border} border rounded-lg p-3 text-center`}
            >
              <div className={`${premio.cor} font-bold text-lg mb-1`}>
                {premio.mult}
              </div>
              <div className="text-white font-medium text-sm">
                {formatCurrency(premio.valor)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">95%</div>
            <div className="text-gray-400 text-sm">RTP (Retorno ao Jogador)</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">2000x</div>
            <div className="text-gray-400 text-sm">Multiplicador Máximo</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 font-bold text-lg">Instantâneo</div>
            <div className="text-gray-400 text-sm">Pagamento via PIX</div>
          </div>
        </div>
      </div>

      {/* Aviso legal */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>* Os prêmios são baseados na aposta atual de {formatCurrency(betAmount)}</p>
        <p>* Jogue com responsabilidade. Proibido para menores de 18 anos.</p>
      </div>
    </div>
  );
}

