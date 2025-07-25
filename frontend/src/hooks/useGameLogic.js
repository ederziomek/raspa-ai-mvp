import { useState, useCallback } from 'react';
import api from '../services/api';

const useGameLogic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    totalWon: 0,
    biggestWin: 0
  });

  // Start a new game
  const startGame = useCallback(async (betAmount) => {
    try {
      setIsPlaying(true);
      setGameResult(null);

      // Call backend API to get game result
      const response = await api.post('/api/game/play', {
        betAmount: betAmount
      });

      const result = response.data;
      
      // Set game result
      setGameResult({
        gameId: result.gameId,
        multiplier: result.multiplier,
        winAmount: result.winAmount,
        netResult: result.netResult,
        betAmount: betAmount,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      
      // Show error to user
      const errorMessage = error.response?.data?.message || 'Erro ao iniciar o jogo';
      throw new Error(errorMessage);
    }
  }, []);

  // Complete the game (called when scratching is done)
  const completeGame = useCallback(async () => {
    if (!gameResult) return;

    try {
      // Update user stats
      setUserStats(prev => ({
        gamesPlayed: prev.gamesPlayed + 1,
        totalWon: prev.totalWon + gameResult.winAmount,
        biggestWin: Math.max(prev.biggestWin, gameResult.winAmount)
      }));

      // Add to game history
      setGameHistory(prev => [gameResult, ...prev.slice(0, 9)]); // Keep last 10 games

      // Backend already processed the game and updated balance
      // No need for additional API calls

    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [gameResult]);

  // Reset game state
  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setGameResult(null);
  }, []);

  // Generate local result for testing/fallback
  const generateLocalResult = (betAmount) => {
    // Multipliers based on MVP specification
    const multipliers = [
      { value: 0, weight: 40 },     // 40% chance of losing
      { value: 1, weight: 25 },     // 25% chance of 1x
      { value: 2, weight: 15 },     // 15% chance of 2x
      { value: 3, weight: 8 },      // 8% chance of 3x
      { value: 5, weight: 5 },      // 5% chance of 5x
      { value: 10, weight: 3 },     // 3% chance of 10x
      { value: 20, weight: 2 },     // 2% chance of 20x
      { value: 50, weight: 1 },     // 1% chance of 50x
      { value: 100, weight: 0.7 },  // 0.7% chance of 100x
      { value: 500, weight: 0.2 },  // 0.2% chance of 500x
      { value: 1000, weight: 0.08 }, // 0.08% chance of 1000x
      { value: 5000, weight: 0.02 }  // 0.02% chance of 5000x
    ];

    // Weighted random selection
    const totalWeight = multipliers.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedMultiplier = 0;
    for (const multiplier of multipliers) {
      random -= multiplier.weight;
      if (random <= 0) {
        selectedMultiplier = multiplier.value;
        break;
      }
    }

    const winAmount = betAmount * selectedMultiplier;

    return {
      multiplier: selectedMultiplier,
      winAmount: winAmount,
      betAmount: betAmount,
      gameId: Date.now(),
      timestamp: new Date()
    };
  };

  return {
    isPlaying,
    gameResult,
    gameHistory,
    userStats,
    startGame,
    completeGame,
    resetGame
  };
};

export default useGameLogic;

