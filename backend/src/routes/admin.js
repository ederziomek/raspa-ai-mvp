const express = require('express');
const { User, Game, Transaction } = require('../models');
const { requireTenant } = require('../middleware/tenant');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de admin em todas as rotas
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Obter dados do dashboard administrativo
 */
router.get('/dashboard', requireTenant, async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const { period = '7d' } = req.query;
    
    // Calcular data de início baseada no período
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Estatísticas básicas
    const totalUsers = await User.count({
      where: { tenant_id: tenantId, active: true }
    });
    
    const totalGames = await Game.count({
      where: { tenant_id: tenantId }
    });
    
    const gamesInPeriod = await Game.count({
      where: {
        tenant_id: tenantId,
        played_at: { [require('sequelize').Op.gte]: startDate }
      }
    });
    
    // Estatísticas financeiras do período
    const gameStats = await Game.getStatsByTenant(tenantId, startDate, now);
    
    res.json({
      period,
      stats: {
        total_users: totalUsers,
        total_games: totalGames,
        games_in_period: gamesInPeriod,
        total_bet: gameStats.total_bet,
        total_prize: gameStats.total_prize,
        total_profit: gameStats.total_profit,
        rtp: gameStats.rtp,
        multiplier_distribution: gameStats.multiplier_distribution
      },
      tenant: req.tenant.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar dashboard'
    });
  }
});

/**
 * GET /api/admin/users
 * Listar usuários do tenant
 */
router.get('/users', requireTenant, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { tenant_id: req.tenant.id };
    
    if (search) {
      where[require('sequelize').Op.or] = [
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { name: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users: users.map(u => u.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar usuários'
    });
  }
});

/**
 * POST /api/admin/users/:userId/credit
 * Creditar saldo para usuário
 */
router.post('/users/:userId/credit', requireTenant, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'Valor deve ser maior que zero'
      });
    }
    
    // Buscar usuário
    const user = await User.findOne({
      where: {
        id: userId,
        tenant_id: req.tenant.id,
        active: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe ou não pertence a este tenant'
      });
    }
    
    // Creditar saldo
    await user.increment('balance', { by: amount });
    
    // Registrar transação
    await Transaction.createManualCredit(
      user.id,
      req.tenant.id,
      amount,
      description || `Crédito manual de R$ ${amount.toFixed(2)}`,
      req.user.id
    );
    
    // Recarregar usuário com novo saldo
    await user.reload();
    
    res.json({
      message: 'Saldo creditado com sucesso',
      user: user.toPublicJSON(),
      amount: parseFloat(amount)
    });
    
  } catch (error) {
    console.error('Erro ao creditar saldo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao creditar saldo'
    });
  }
});

/**
 * GET /api/admin/games
 * Listar jogadas do tenant
 */
router.get('/games', requireTenant, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { tenant_id: req.tenant.id };
    
    if (user_id) {
      where.user_id = user_id;
    }
    
    const { count, rows: games } = await Game.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['played_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name']
        }
      ]
    });
    
    res.json({
      games: games.map(g => ({
        ...g.toPublicJSON(),
        user: g.user ? {
          id: g.user.id,
          email: g.user.email,
          name: g.user.name
        } : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar jogadas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar jogadas'
    });
  }
});

module.exports = router;

