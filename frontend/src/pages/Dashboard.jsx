import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, logout } = useAuth();
  const [selectedBet, setSelectedBet] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Simular jogo
    setTimeout(() => {
      setIsPlaying(false);
      alert('Jogo em desenvolvimento! Canvas será implementado em breve.');
    }, 1000);
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
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Área de Jogo</h2>
              
              {/* Bet Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Escolha sua aposta:</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {betValues.map((bet) => (
                    <button
                      key={bet.value}
                      onClick={() => setSelectedBet(bet.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedBet === bet.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{bet.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Canvas Placeholder */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">?</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Canvas de Raspadinha</h3>
                <p className="text-gray-600 mb-4">
                  Interface interativa será implementada aqui
                </p>
                <p className="text-sm text-gray-500">
                  Aposta selecionada: <strong>R$ {selectedBet.toFixed(2)}</strong>
                </p>
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-6 rounded-lg text-xl font-bold hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isPlaying ? 'Jogando...' : `Jogar por R$ ${selectedBet.toFixed(2)}`}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Suas Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo atual:</span>
                  <span className="font-bold text-green-600">R$ {user?.balance?.toFixed(2) || '0,00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jogos hoje:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total ganho:</span>
                  <span className="font-bold text-green-600">R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Como Jogar</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Escolha o valor da sua aposta</p>
                <p>• Clique em "Jogar" para começar</p>
                <p>• Raspe a cartela para revelar os prêmios</p>
                <p>• Ganhe até 5000x o valor apostado!</p>
              </div>
            </div>

            {/* Multipliers Info */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Multiplicadores</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 rounded">0x</div>
                <div className="text-center p-2 bg-gray-50 rounded">1x</div>
                <div className="text-center p-2 bg-gray-50 rounded">2x</div>
                <div className="text-center p-2 bg-gray-50 rounded">3x</div>
                <div className="text-center p-2 bg-gray-50 rounded">5x</div>
                <div className="text-center p-2 bg-gray-50 rounded">10x</div>
                <div className="text-center p-2 bg-gray-50 rounded">20x</div>
                <div className="text-center p-2 bg-gray-50 rounded">50x</div>
                <div className="text-center p-2 bg-gray-50 rounded">100x</div>
                <div className="text-center p-2 bg-gray-50 rounded">500x</div>
                <div className="text-center p-2 bg-gray-50 rounded">1000x</div>
                <div className="text-center p-2 bg-yellow-100 rounded font-bold">5000x</div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                RTP: 95% | 60% das jogadas retornam
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

