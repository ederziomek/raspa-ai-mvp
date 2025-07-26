import { useState } from 'react';
import GameCard from './components/GameCard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(100.00);
  const [betAmount, setBetAmount] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [turboMode, setTurboMode] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Tabela de multiplicadores com probabilidades exatas (RTP 95%)
  const multiplierTable = [
    { multiplier: 0, probability: 0.40 },      // 40% - Perda
    { multiplier: 0.7, probability: 0.25 },    // 25% - Retorno parcial
    { multiplier: 1.4, probability: 0.20 },    // 20% - Lucro pequeno
    { multiplier: 2, probability: 0.08 },      // 8%
    { multiplier: 3, probability: 0.04 },      // 4%
    { multiplier: 4, probability: 0.018 },     // 1.8%
    { multiplier: 5, probability: 0.008 },     // 0.8%
    { multiplier: 12, probability: 0.0025 },   // 0.25%
    { multiplier: 25, probability: 0.001 },    // 0.1%
    { multiplier: 70, probability: 0.0004 },   // 0.04%
    { multiplier: 140, probability: 0.000080 }, // 0.008%
    { multiplier: 320, probability: 0.000015 }, // 0.0015%
    { multiplier: 650, probability: 0.000004 }, // 0.0004%
    { multiplier: 1360, probability: 0.00000099 }, // 0.000099%
    { multiplier: 5000, probability: 0.00000001 }  // 0.000001%
  ];

  // Seleciona multiplicador baseado nas probabilidades
  const selectMultiplier = () => {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const { multiplier, probability } of multiplierTable) {
      cumulativeProbability += probability;
      if (random <= cumulativeProbability) {
        return multiplier;
      }
    }
    return 0; // fallback
  };

  // CORRIGIDO: Debita saldo imediatamente, credita prêmio após revelação
  const playGame = async (isTurbo = false) => {
    if (balance < betAmount || isPlaying) return;

    setTurboMode(isTurbo);
    setIsPlaying(true);
    setGameResult(null);
    
    // NOVO: Debita aposta imediatamente
    setBalance(prev => prev - betAmount);

    // Simula delay do jogo (menor para turbo)
    const delay = isTurbo ? 800 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Seleciona multiplicador baseado na tabela de probabilidades
    const multiplier = selectMultiplier();
    const isWinner = multiplier > 0;
    const prizeAmount = betAmount * multiplier;

    // REMOVIDO: Não credita prêmio aqui mais - será creditado após revelação
    // if (isWinner) {
    //   setBalance(prev => prev + prizeAmount);
    // }

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

  // NOVO: Função chamada quando raspadinha é 100% revelada - credita apenas prêmio
  const handleBalanceUpdate = (prizeAmount) => {
    if (prizeAmount > 0) {
      setBalance(prev => prev + prizeAmount);
    }
    // Não faz nada se prizeAmount for 0 (derrota) - aposta já foi debitada
  };

  // Callback quando a revelação da raspadinha termina
  const handleRevealComplete = () => {
    setTurboMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-green-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-xl">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-400">RaspaAI</h1>
              <p className="text-gray-400 text-sm">Raspadinha Online</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">{formatCurrency(balance)}</div>
                <div className="text-gray-400 text-sm">Saldo</div>
              </div>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded border border-green-500/30 transition-colors">
                Sacar
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors">
                Depositar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setUser({ name: 'Admin', balance: 100 })}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
              >
                Entrar
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                Registrar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Feed de Ganhadores */}
      <div className="bg-gray-800/30 border-b border-green-500/20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">🏆 AO VIVO - Últimos Ganhadores</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm">
                  B
                </div>
                <div>
                  <div className="text-white font-medium">Bruno T****</div>
                  <div className="text-gray-400 text-sm">Carregador Portátil</div>
                  <div className="text-green-400 font-bold">R$ 150,00</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm">
                  C
                </div>
                <div>
                  <div className="text-white font-medium">Cristiano R****</div>
                  <div className="text-gray-400 text-sm">Relógio Casio G-Shock</div>
                  <div className="text-green-400 font-bold">R$ 650,00</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm">
                  J
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
      </div>

      {/* Layout Principal */}
      <div className="container mx-auto px-4 py-8">
        <GameCard 
          balance={balance}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          gameResult={gameResult}
          isPlaying={isPlaying}
          turboMode={turboMode}
          onPlay={playGame}
          onBalanceUpdate={handleBalanceUpdate}
        />

        {/* Aviso para usuários não logados */}
        {!user && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
              <p className="text-blue-300 text-sm">
                🎯 Faça login para jogar com dinheiro real e receber seus prêmios via PIX!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Prêmios */}
      <div className="bg-gray-800/30 border-t border-green-500/20 p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-green-400 text-center mb-6">🏆 Tabela de Prêmios</h3>
          <p className="text-center text-gray-300 mb-6">
            Encontre 3 símbolos iguais e ganhe o prêmio correspondente
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {multiplierTable.filter(m => m.multiplier > 0).map((item, index) => (
              <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30 text-center">
                <div className="text-green-400 font-bold text-lg">{item.multiplier}x</div>
                <div className="text-white text-sm">{formatCurrency(betAmount * item.multiplier)}</div>
                <div className="text-gray-400 text-xs">{(item.probability * 100).toFixed(6)}%</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-green-500/30">
              <div className="text-green-400 font-bold text-2xl">95%</div>
              <div className="text-gray-300">RTP (Retorno ao Jogador)</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-green-500/30">
              <div className="text-green-400 font-bold text-2xl">5000x</div>
              <div className="text-gray-300">Multiplicador Máximo</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-green-500/30">
              <div className="text-green-400 font-bold text-2xl">60%</div>
              <div className="text-gray-300">Chance de Ganhar</div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mt-6">
            <p>* Os prêmios são baseados na aposta atual de {formatCurrency(betAmount)}</p>
            <p>* Jogue com responsabilidade. Proibido para menores de 18 anos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

