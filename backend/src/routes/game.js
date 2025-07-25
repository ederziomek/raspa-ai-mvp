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
 * Jogar uma partida (implementação básica)
 */
router.post('/play', requireTenant, async (req, res) => {
  try {
    const { bet_amount } = req.body;
    
    // Validar valor da aposta
    const validAmounts = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00, 1000.00];
    if (!validAmounts.includes(parseFloat(bet_amount))) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'Valor da aposta não é permitido'
      });
    }
    
    // Verificar saldo
    if (req.user.balance < bet_amount) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        message: 'Você não tem saldo suficiente para esta aposta'
      });
    }
    
    // Por enquanto, retornar resposta básica
    // A lógica completa do jogo será implementada posteriormente
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      bet_amount: parseFloat(bet_amount),
      user_balance: parseFloat(req.user.balance)
    });
    
  } catch (error) {
    console.error('Erro ao jogar:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar jogada'
    });
  }
});

module.exports = router;

