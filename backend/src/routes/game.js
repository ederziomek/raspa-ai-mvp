const express = require('express');
const { Game, Transaction, MultiplierConfig } = require('../models');
const { requireTenant } = require('../middleware/tenant');

const router = express.Router();

/**
 * GET /api/game/config
 * Obter configuração do jogo (valores de aposta e multiplicadores)
 */
router.get('/config', requireTenant, async (req, res) => {
  try {
    const multipliers = await MultiplierConfig.getActiveConfig();
    
    const betAmounts = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00, 1000.00];
    
    res.json({
      bet_amounts: betAmounts,
      multipliers: multipliers.map(m => ({
        multiplier: parseFloat(m.multiplier),
        probability: parseFloat(m.probability),
        weight: m.weight,
        rtp_contribution: parseFloat(m.rtp_contribution)
      })),
      rtp: await MultiplierConfig.calculateRTP()
    });
    
  } catch (error) {
    console.error('Erro ao obter configuração do jogo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar configuração do jogo'
    });
  }
});

/**
 * GET /api/game/history
 * Obter histórico de jogadas do usuário
 */
router.get('/history', requireTenant, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const games = await Game.findAll({
      where: {
        user_id: req.user.id,
        tenant_id: req.tenant.id
      },
      order: [['played_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    const total = await Game.count({
      where: {
        user_id: req.user.id,
        tenant_id: req.tenant.id
      }
    });
    
    res.json({
      games: games.map(g => g.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar histórico'
    });
  }
});

/**
 * POST /api/game/play
 * Jogar uma partida de Fortune Tiger
 */
router.post('/play', requireTenant, async (req, res) => {
  try {
    const { betAmount } = req.body;
    const betValue = parseFloat(betAmount);
    
    // Validar valor da aposta
    const validAmounts = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00, 1000.00];
    if (!validAmounts.includes(betValue)) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'Valor da aposta não é permitido'
      });
    }
    
    // Verificar saldo
    if (req.user.balance < betValue) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        message: 'Você não tem saldo suficiente para esta aposta'
      });
    }
    
    // Importar lógica do Fortune Tiger
    const { generateFortuneTigerGame } = require('../utils/fortuneTiger');
    
    // Gerar jogo Fortune Tiger
    const gameResult = generateFortuneTigerGame(betValue);
    
    const selectedMultiplier = gameResult.multiplier || 0;
    const prizeAmount = gameResult.prizeAmount || 0;
    const netResult = prizeAmount - betValue; // Ganho líquido (pode ser negativo)
    
    // Atualizar saldo do usuário
    const newBalance = req.user.balance - betValue + prizeAmount;
    await req.user.update({ 
      balance: newBalance,
      last_login: new Date()
    });
    
    // Registrar a jogada no banco de dados
    const game = await Game.create({
      user_id: req.user.id,
      tenant_id: req.tenant.id,
      bet_amount: betValue,
      multiplier: selectedMultiplier,
      prize_amount: prizeAmount,
      symbols: gameResult.gameSymbols,
      winning_symbol: gameResult.winningSymbol,
      played_at: new Date(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });
    
    // Registrar transação de aposta
    await Transaction.create({
      user_id: req.user.id,
      tenant_id: req.tenant.id,
      type: 'game_bet',
      amount: -betValue,
      description: `Aposta Fortune Tiger - Jogo #${game.id}`,
      reference_id: game.id,
      reference_type: 'game'
    });
    
    // Registrar transação de prêmio se ganhou
    if (prizeAmount > 0) {
      await Transaction.create({
        user_id: req.user.id,
        tenant_id: req.tenant.id,
        type: 'game_win',
        amount: prizeAmount,
        description: `Prêmio ${selectedMultiplier}x Fortune Tiger - Jogo #${game.id}`,
        reference_id: game.id,
        reference_type: 'game'
      });
    }
    
    res.json({
      gameId: game.id,
      multiplier: selectedMultiplier,
      prizeAmount: prizeAmount,
      netResult: netResult,
      newBalance: newBalance,
      symbols: gameResult.symbols,
      gameSymbols: gameResult.gameSymbols,
      winningSymbol: gameResult.winningSymbol,
      winningLines: gameResult.winningLines,
      fortuneTigerActive: gameResult.fortuneTigerActive,
      isWinner: gameResult.isWinner,
      rtp: gameResult.rtp,
      message: gameResult.isWinner ? 
        (gameResult.fortuneTigerActive ? '🐅 FORTUNE TIGER! Você ganhou!' : 'Parabéns! Você ganhou!') : 
        'Não foi dessa vez! Tente novamente.'
    });
    
  } catch (error) {
    console.error('Erro ao jogar Fortune Tiger:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar jogada'
    });
  }
});

module.exports = router;

