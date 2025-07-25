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
 * Jogar uma partida de raspadinha
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
    
    // Sistema de multiplicadores baseado no MVP (RTP 95%)
    const multipliers = [
      { value: 0, weight: 40 },     // 40% chance de perder
      { value: 1, weight: 25 },     // 25% chance de 1x
      { value: 2, weight: 15 },     // 15% chance de 2x
      { value: 3, weight: 8 },      // 8% chance de 3x
      { value: 5, weight: 5 },      // 5% chance de 5x
      { value: 12, weight: 3 },     // 3% chance de 12x
      { value: 25, weight: 2 },     // 2% chance de 25x
      { value: 70, weight: 1 },     // 1% chance de 70x
      { value: 140, weight: 0.7 },  // 0.7% chance de 140x
      { value: 320, weight: 0.2 },  // 0.2% chance de 320x
      { value: 650, weight: 0.08 }, // 0.08% chance de 650x
      { value: 1360, weight: 0.02 } // 0.02% chance de 1360x
    ];
    
    // Seleção ponderada do multiplicador
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
    
    const prizeAmount = betValue * selectedMultiplier;
    const netResult = prizeAmount - betValue; // Ganho líquido (pode ser negativo)
    
    // Gerar símbolos para a raspadinha (9 símbolos)
    const symbols = ['🍒', '🍋', '⭐', '💎', '🔔', '🍀', '🎯', '💰'];
    const gameSymbols = [];
    let winningSymbol = null;
    
    // Se ganhou, garantir que há símbolos iguais
    if (selectedMultiplier > 0) {
      winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      // Adicionar 3 símbolos iguais (vencedores)
      for (let i = 0; i < 3; i++) {
        gameSymbols.push(winningSymbol);
      }
      // Completar com símbolos aleatórios
      for (let i = 3; i < 9; i++) {
        gameSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
    } else {
      // Se perdeu, garantir que não há 3 símbolos iguais
      for (let i = 0; i < 9; i++) {
        gameSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
    }
    
    // Embaralhar símbolos
    for (let i = gameSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameSymbols[i], gameSymbols[j]] = [gameSymbols[j], gameSymbols[i]];
    }
    
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
      symbols: gameSymbols,
      winning_symbol: winningSymbol,
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
      description: `Aposta - Jogo #${game.id}`,
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
        description: `Prêmio ${selectedMultiplier}x - Jogo #${game.id}`,
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
      symbols: gameSymbols,
      winningSymbol: winningSymbol,
      message: selectedMultiplier > 0 ? 'Parabéns! Você ganhou!' : 'Que pena! Tente novamente.'
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

