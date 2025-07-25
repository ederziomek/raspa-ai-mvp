import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  Coins, 
  TrendingUp, 
  History, 
  LogOut, 
  User,
  Sparkles,
  DollarSign,
  Trophy,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { gameService } from '../services/game.js';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalWinnings: 0,
    winRate: 0,
  });
  const [selectedBet, setSelectedBet] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Valores de aposta disponíveis
  const betAmounts = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Carregar saldo
      const balanceResponse = await gameService.getBalance();
      setBalance(balanceResponse.balance || 0);

      // Carregar estatísticas
      const statsResponse = await gameService.getStats();
      setStats(statsResponse || {
        totalGames: 0,
        totalWins: 0,
        totalWinnings: 0,
        winRate: 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handlePlay = async () => {
    if (balance < selectedBet) {
      alert('Saldo insuficiente!');
      return;
    }

    setLoading(true);
    setGameResult(null);

    try {
      const result = await gameService.play(selectedBet);
      setGameResult(result);
      
      // Atualizar saldo
      setBalance(result.newBalance);
      
      // Recarregar estatísticas
      await loadUserData();
    } catch (error) {
      console.error('Erro ao jogar:', error);
      alert('Erro ao jogar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Sparkles className="w-8 h-8 text-orange-500 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Raspa.ai</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-lg">
                  R$ {balance.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Área do Jogo */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-orange-500" />
                  <span>Raspadinha</span>
                </CardTitle>
                <CardDescription>
                  Escolha sua aposta e teste sua sorte!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seleção de Aposta */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Escolha sua aposta:</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {betAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedBet === amount ? "default" : "outline"}
                        className={`${
                          selectedBet === amount 
                            ? "bg-gradient-to-r from-orange-500 to-yellow-500" 
                            : ""
                        }`}
                        onClick={() => setSelectedBet(amount)}
                        disabled={balance < amount}
                      >
                        R$ {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Área da Raspadinha */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center border-4 border-dashed border-orange-300">
                    {gameResult ? (
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {gameResult.multiplier > 0 ? '🎉' : '😔'}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {gameResult.multiplier > 0 ? 'Parabéns!' : 'Que pena!'}
                        </h3>
                        <p className="text-lg mb-2">
                          Multiplicador: <strong>{gameResult.multiplier}x</strong>
                        </p>
                        <p className="text-xl font-bold">
                          {gameResult.multiplier > 0 
                            ? `Você ganhou R$ ${gameResult.winAmount.toFixed(2)}!`
                            : 'Tente novamente!'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          Pronto para jogar?
                        </h3>
                        <p className="text-gray-600">
                          Clique em "Jogar" para revelar seu prêmio!
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handlePlay}
                    disabled={loading || balance < selectedBet}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-8 text-lg"
                    size="lg"
                  >
                    {loading ? 'Jogando...' : `Jogar R$ ${selectedBet}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Estatísticas */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Suas Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jogos:</span>
                  <Badge variant="secondary">{stats.totalGames}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vitórias:</span>
                  <Badge variant="secondary">{stats.totalWins}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Vitória:</span>
                  <Badge variant="secondary">{stats.winRate}%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Ganho:</span>
                  <Badge variant="secondary">R$ {stats.totalWinnings.toFixed(2)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Jogo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Como Jogar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Escolha o valor da sua aposta</p>
                <p>• Clique em "Jogar" para revelar o resultado</p>
                <p>• Multiplicadores variam de 0x a 5000x</p>
                <p>• 60% das jogadas retornam algum valor</p>
                <p>• RTP (Return to Player): 95%</p>
              </CardContent>
            </Card>

            {/* Últimos Resultados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-500" />
                  <span>Último Resultado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameResult ? (
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {gameResult.multiplier > 0 ? '🎉' : '😔'}
                    </div>
                    <p className="font-semibold">
                      {gameResult.multiplier}x
                    </p>
                    <p className="text-sm text-gray-600">
                      {gameResult.multiplier > 0 
                        ? `+R$ ${gameResult.winAmount.toFixed(2)}`
                        : `-R$ ${selectedBet.toFixed(2)}`
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    Nenhum jogo ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

