import { useState, useMemo } from 'react';
import GameCard from './components/GameCard';
import { 
  BET_VALUES, 
  selectMultiplier, 
  formatCurrency, 
  generateScratchSymbols,
  generatePrizeTable,
  GAME_CONFIG 
} from './config/gameConfig';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(GAME_CONFIG.DEFAULT_BALANCE);
  const [betAmount, setBetAmount] = useState(GAME_CONFIG.DEFAULT_BET);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [turboMode, setTurboMode] = useState(false);

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

    // Gera símbolos da raspadinha baseado no resultado
    const symbols = generateScratchSymbols(betAmount, isWinner ? multiplier : null);

    // REMOVIDO: Não credita prêmio aqui mais - será creditado após revelação
    // if (isWinner) {
    //   setBalance(prev => prev + prizeAmount);
    // }

    const result = {
      isWinner,
      prizeAmount,
      multiplier,
      symbols, // NOVO: Inclui símbolos gerados
      winningSymbol: isWinner ? symbols.find(s => s.isWinning)?.icon : null,
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

  // Gera tabela de prêmios baseada na aposta atual
  const prizeTable = useMemo(() => {
    return generatePrizeTable(betAmount);
  }, [betAmount]);

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
            {prizeTable.slice(0, 14).map((prize, index) => (
              <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30 text-center">
                <div className="flex justify-center mb-2">
                  <img 
                    src={prize.icon} 
                    alt={prize.iconName}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-green-400 font-bold text-lg">{prize.multiplier}x</div>
                <div className="text-white text-sm">{prize.formattedValue}</div>
                <div className="text-gray-400 text-xs">{prize.probability.toFixed(3)}%</div>
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

