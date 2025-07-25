import api from './api.js';

export const gameService = {
  // Jogar uma raspadinha
  async play(betAmount) {
    try {
      const response = await api.post('/api/game/play', {
        bet_amount: betAmount,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter histórico de jogadas
  async getHistory(page = 1, limit = 20) {
    try {
      const response = await api.get('/api/game/history', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter estatísticas do jogador
  async getStats() {
    try {
      const response = await api.get('/api/game/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter configurações de multiplicadores
  async getMultipliers() {
    try {
      const response = await api.get('/api/game/multipliers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter saldo atual
  async getBalance() {
    try {
      const response = await api.get('/api/game/balance');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter valores de aposta disponíveis
  async getBetAmounts() {
    try {
      const response = await api.get('/api/game/bet-amounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

