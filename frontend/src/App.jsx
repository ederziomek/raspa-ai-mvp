import { useState } from 'react';
import { theme } from './styles/theme';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(100.00);
  const [betAmount, setBetAmount] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Multiplicadores conforme documento original
  const multipliers = [
    { mult: 0, prob: 40.000000, weight: 40 },
    { mult: 0.7, prob: 25.000000, weight: 25 },
    { mult: 1.4, prob: 20.000000, weight: 20 },
    { mult: 2, prob: 8.000000, weight: 8 },
    { mult: 3, prob: 4.000000, weight: 4 },
    { mult: 4, prob: 1.800000, weight: 1.8 },
    { mult: 5, prob: 0.800000, weight: 0.8 },
    { mult: 12, prob: 0.250000, weight: 0.25 },
    { mult: 25, prob: 0.100000, weight: 0.1 },
    { mult: 70, prob: 0.040000, weight: 0.04 },
    { mult: 140, prob: 0.008000, weight: 0.008 },
    { mult: 320, prob: 0.001500, weight: 0.0015 },
    { mult: 650, prob: 0.000400, weight: 0.0004 },
    { mult: 1360, prob: 0.000099, weight: 0.000099 },
    { mult: 5000, prob: 0.000001, weight: 0.000001 },
  ];

  // Função para selecionar multiplicador baseado nas probabilidades
  const selectMultiplier = () => {
    const totalWeight = multipliers.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < multipliers.length; i++) {
      random -= multipliers[i].weight;
      if (random <= 0) {
        return multipliers[i].mult;
      }
    }
    return 0; // fallback
  };

  // Simula jogo com lógica correta
  const playGame = async () => {
    if (balance < betAmount || isPlaying) return;

    setIsPlaying(true);
    setGameResult(null);
    
    // Debita aposta
    setBalance(prev => prev - betAmount);

    // Simula delay do jogo
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Seleciona multiplicador baseado na tabela de probabilidades
    const multiplier = selectMultiplier();
    const isWinner = multiplier > 0;
    const prizeAmount = betAmount * multiplier;

    // Credita prêmio se ganhou
    if (isWinner) {
      setBalance(prev => prev + prizeAmount);
    }

    const result = {
      isWinner,
      prizeAmount,
      multiplier,
      winningSymbol: isWinner ? '💰' : null,
      betAmount
    };

    setGameResult(result);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700/50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RaspaAI</h1>
              <p className="text-sm text-gray-400">Raspadinha Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{formatCurrency(balance)}</div>
                  <div className="text-gray-400 text-sm">Saldo</div>
                </div>
                <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                  Sacar
                </button>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                  Depositar
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setUser({ name: 'Admin', balance: 100 })}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Entrar
                </button>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                  Registrar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Feed de Ganhadores */}
        <div className="bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">🏆 AO VIVO - Últimos Ganhadores</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/40 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <div className="text-white font-medium">Bruno T****</div>
                  <div className="text-gray-400 text-sm">Carregador Portátil</div>
                  <div className="text-green-400 font-bold">R$ 150,00</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <div className="text-white font-medium">Cristiano R****</div>
                  <div className="text-gray-400 text-sm">Relógio Casio G-Shock</div>
                  <div className="text-green-400 font-bold">R$ 650,00</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <div>
                  <div className="text-white font-medium">Jefferson D****</div>
                  <div className="text-gray-400 text-sm">Fogão 5 bocas Itax</div>
                  <div className="text-green-400 font-bold">R$ 4.800,00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="max-w-4xl mx-auto">
          {/* Jogo de Raspadinha */}
          <div className="mb-6">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg border-2 border-green-500 shadow-2xl">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-green-400 mb-2">RaspaAI</h2>
                <p className="text-gray-300 text-sm">Raspe e ganhe prêmios incríveis!</p>
              </div>

              {/* Grid da raspadinha */}
              <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-green-400 mb-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-gray-700 to-gray-800 cursor-pointer hover:scale-105 transition-all border border-gray-600"
                  >
                    {gameResult && gameResult.isWinner && [0, 4, 8].includes(index) ? (
                      <span className="text-green-400">💰</span>
                    ) : gameResult ? (
                      <span className="text-gray-400">❌</span>
                    ) : (
                      <span className="text-gray-400 text-xl">?</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Resultado */}
              {gameResult && (
                <div className={`text-center p-4 rounded-lg mb-4 border ${
                  gameResult.isWinner 
                    ? 'bg-green-500/20 border-green-500' 
                    : 'bg-red-500/20 border-red-500'
                }`}>
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
                      <div className="text-gray-300 text-sm">
                        Tente novamente!
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-gray-300 text-sm mb-4">
                {isPlaying 
                  ? 'Aguarde o resultado...' 
                  : 'Clique em "Jogar" para começar'
                }
              </div>
            </div>
          </div>

          {/* Controles do Jogo */}
          <div className="mb-8">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-lg border-2 border-green-500 shadow-2xl">
              {/* Informações */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-gray-900/50 p-2 rounded border border-green-500/50">
                  <div className="text-green-400 text-xs font-medium">SALDO</div>
                  <div className="text-white font-bold text-sm">{formatCurrency(balance)}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-green-500/50">
                  <div className="text-green-400 text-xs font-medium">APOSTA</div>
                  <div className="text-white font-bold text-sm">{formatCurrency(betAmount)}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-green-500/50">
                  <div className="text-green-400 text-xs font-medium">GANHO</div>
                  <div className="text-green-400 font-bold text-sm">
                    {gameResult ? formatCurrency(gameResult.prizeAmount) : formatCurrency(0)}
                  </div>
                </div>
              </div>

              {/* Botão principal */}
              <div className="mb-4">
                <button 
                  onClick={playGame}
                  disabled={isPlaying || balance < betAmount}
                  className="w-full h-16 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-bold text-lg border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
                >
                  {isPlaying ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Jogando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>▶</span>
                      Jogar {formatCurrency(betAmount)}
                    </div>
                  )}
                </button>
              </div>

              {/* Controles em linha */}
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={playGame}
                  disabled={isPlaying || balance < betAmount}
                  className="h-14 bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">⚡</span>
                    <span className="text-xs">TURBO</span>
                  </div>
                </button>

                <button 
                  onClick={() => setBetAmount(prev => Math.max(0.5, prev - 0.5))}
                  disabled={isPlaying}
                  className="h-14 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
                >
                  <span className="text-2xl">-</span>
                </button>

                <button 
                  onClick={() => setBetAmount(prev => Math.min(1000, prev + 0.5))}
                  disabled={isPlaying}
                  className="h-14 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
                >
                  <span className="text-2xl">+</span>
                </button>

                <button 
                  disabled={isPlaying}
                  className="h-14 bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 text-white font-bold border-2 border-green-400 shadow-lg transform transition-all duration-150 active:scale-95 rounded"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">▶</span>
                    <span className="text-xs">AUTO</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Aviso para não logados */}
          {!user && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-8">
              <p className="text-green-300 font-medium text-center">
                🎯 Faça login para jogar com dinheiro real e receber seus prêmios via PIX!
              </p>
            </div>
          )}
        </div>

        {/* Tabela de Prêmios - Multiplicadores do documento */}
        <div className="mt-12">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🏆 Tabela de Prêmios</h2>
              <p className="text-gray-400">Encontre 3 símbolos iguais e ganhe o prêmio correspondente</p>
              <p className="text-green-400 text-sm mt-2">RTP: 95% | Multiplicador máximo: 5000x</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {multipliers.filter(m => m.mult > 0).map((premio, i) => (
                <div key={i} className="bg-gray-700/50 border border-green-500/30 rounded-lg p-3 text-center hover:bg-gray-700/70 transition-colors">
                  <div className="text-green-400 font-bold text-lg mb-1">
                    {premio.mult}x
                  </div>
                  <div className="text-white font-medium text-sm mb-1">
                    {formatCurrency(betAmount * premio.mult)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {premio.prob.toFixed(premio.prob < 1 ? 6 : 2)}%
                  </div>
                </div>
              ))}
            </div>

            {/* Informações adicionais */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg">95%</div>
                  <div className="text-gray-400 text-sm">RTP (Retorno ao Jogador)</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg">5000x</div>
                  <div className="text-gray-400 text-sm">Multiplicador Máximo</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg">60%</div>
                  <div className="text-gray-400 text-sm">Chance de Ganhar</div>
                </div>
              </div>
            </div>

            {/* Aviso legal */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>* Os prêmios são baseados na aposta atual de {formatCurrency(betAmount)}</p>
              <p>* Jogue com responsabilidade. Proibido para menores de 18 anos.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-700/50">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              © 2025 RaspaAI. Todos os direitos reservados.
            </p>
            <p>
              Raspadinhas e outros jogos de azar são regulamentados. Jogue com responsabilidade.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

