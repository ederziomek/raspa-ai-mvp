import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ScratchCard from '../components/ScratchCard';
import useGameLogic from '../hooks/useGameLogic';

const betValues = [
  { value: 0.5, label: 'R$ 0,50' },
  { value: 1, label: 'R$ 1,00' },
  { value: 2, label: 'R$ 2,00' },
  { value: 5, label: 'R$ 5,00' },
  { value: 10, label: 'R$ 10,00' },
  { value: 20, label: 'R$ 20,00' },
  { value: 50, label: 'R$ 50,00' },
  { value: 100, label: 'R$ 100,00' },
  { value: 200, label: 'R$ 200,00' },
  { value: 500, label: 'R$ 500,00' },
  { value: 1000, label: 'R$ 1.000,00' }
];

export default function Dashboard() {
  const { user, logout, updateUserBalance } = useAuth();
  const [selectedBet, setSelectedBet] = useState(1);
  const { 
    isPlaying, 
    gameResult, 
    gameHistory, 
    userStats, 
    startGame, 
    completeGame, 
    resetGame 
  } = useGameLogic();

  const handlePlay = async () => {
    // Check if user has enough balance
    if (user.balance < selectedBet) {
      alert('Saldo insuficiente para esta aposta!');
      return;
    }

    try {
      // Start the game
      const result = await startGame(selectedBet);
      
      // Update user balance with the new balance from backend
      updateUserBalance(result.newBalance);
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      alert(error.message || 'Erro ao iniciar o jogo. Tente novamente.');
    }
  };

  const handleGameComplete = async () => {
    await completeGame();
    // Balance is already updated from the backend response
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-xl font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Raspa.ai</h1>
                <p className="text-white/80 text-sm">Bem-vindo, {user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-right">
                <p className="text-sm opacity-80">Saldo</p>
                <p className="text-lg font-bold">R$ {user?.balance?.toFixed(2) || '0,00'}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Área de Jogo</h2>
              
              {/* Bet Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Escolha sua aposta:</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {betValues.map((bet) => (
                    <button
                      key={bet.value}
                      onClick={() => setSelectedBet(bet.value)}
                      disabled={isPlaying}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedBet === bet.value
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-100'
                          : 'border-white/30 hover:border-white/50 text-white/80 hover:text-white'
                      } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-sm font-medium">{bet.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scratch Card Game */}
              <div className="mb-6">
                <ScratchCard
                  betAmount={selectedBet}
                  onGameComplete={handleGameComplete}
                  isPlaying={isPlaying}
                  gameResult={gameResult}
                />
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={isPlaying || user.balance < selectedBet}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-lg text-xl font-bold hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isPlaying 
                  ? 'Jogando...' 
                  : user.balance < selectedBet 
                    ? 'Saldo Insuficiente'
                    : `Jogar por R$ ${selectedBet.toFixed(2)}`
                }
              </button>

              {/* Game Result */}
              {gameResult && !isPlaying && (
                <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <div className="text-center text-white">
                    <h4 className="text-lg font-bold mb-2">Resultado do Jogo</h4>
                    <div className="flex justify-center items-center space-x-4">
                      <div>
                        <span className="text-sm opacity-80">Multiplicador:</span>
                        <div className="text-2xl font-bold">{gameResult.multiplier}x</div>
                      </div>
                      <div>
                        <span className="text-sm opacity-80">Prêmio:</span>
                        <div className={`text-2xl font-bold ${gameResult.winAmount > 0 ? 'text-green-300' : 'text-red-300'}`}>
                          R$ {gameResult.winAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetGame}
                      className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                    >
                      Jogar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Suas Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Saldo atual:</span>
                  <span className="font-bold text-green-300">R$ {user?.balance?.toFixed(2) || '0,00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Jogos hoje:</span>
                  <span className="font-bold text-white">{userStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Total ganho:</span>
                  <span className="font-bold text-green-300">R$ {userStats.totalWon.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Maior prêmio:</span>
                  <span className="font-bold text-yellow-300">R$ {userStats.biggestWin.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Como Jogar</h3>
              <div className="space-y-2 text-sm text-white/80">
                <p>• Escolha o valor da sua aposta</p>
                <p>• Clique em "Jogar" para começar</p>
                <p>• Raspe a cartela para revelar os prêmios</p>
                <p>• Ganhe até 5000x o valor apostado!</p>
              </div>
            </div>

            {/* Multipliers Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Multiplicadores</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white/10 rounded text-white">0x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">1x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">2x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">3x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">5x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">10x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">20x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">50x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">100x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">500x</div>
                <div className="text-center p-2 bg-white/10 rounded text-white">1000x</div>
                <div className="text-center p-2 bg-yellow-400/30 rounded font-bold text-yellow-200">5000x</div>
              </div>
              <p className="text-xs text-white/60 mt-2 text-center">
                RTP: 95% | 60% das jogadas retornam
              </p>
            </div>

            {/* Recent Games */}
            {gameHistory.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Jogos Recentes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gameHistory.slice(0, 5).map((game, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-white/70">
                        R$ {game.betAmount.toFixed(2)} × {game.multiplier}x
                      </span>
                      <span className={`font-bold ${game.winAmount > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {game.winAmount > 0 ? '+' : ''}R$ {game.winAmount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

