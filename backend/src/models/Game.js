const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bet_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Valor da aposta deve ser maior que zero'
        },
        isIn: {
          args: [[0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00, 1000.00]],
          msg: 'Valor da aposta deve ser um dos valores permitidos'
        }
      }
    },
    multiplier: {
      type: DataTypes.DECIMAL(8, 6),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Multiplicador não pode ser negativo'
        },
        isIn: {
          args: [[0, 0.7, 1.4, 2, 3, 4, 5, 12, 25, 70, 140, 320, 650, 1360, 5000]],
          msg: 'Multiplicador deve ser um dos valores permitidos'
        }
      }
    },
    prize_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Valor do prêmio não pode ser negativo'
        }
      }
    },
    symbols: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array com os 9 símbolos gerados para a raspadinha'
    },
    winning_symbol: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Símbolo vencedor (se houver)'
    },
    played_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP do jogador para auditoria'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent do navegador para auditoria'
    }
  }, {
    tableName: 'games',
    indexes: [
      {
        fields: ['tenant_id', 'played_at']
      },
      {
        fields: ['user_id', 'played_at']
      },
      {
        fields: ['tenant_id', 'bet_amount']
      },
      {
        fields: ['tenant_id', 'multiplier']
      },
      {
        fields: ['played_at']
      }
    ],
    hooks: {
      beforeValidate: (game) => {
        // Calcular prize_amount baseado no bet_amount e multiplier
        if (game.bet_amount && game.multiplier !== undefined) {
          game.prize_amount = (parseFloat(game.bet_amount) * parseFloat(game.multiplier)).toFixed(2);
        }
      }
    }
  });

  // Métodos de instância
  Game.prototype.toPublicJSON = function() {
    return {
      id: this.id,
      bet_amount: parseFloat(this.bet_amount),
      multiplier: parseFloat(this.multiplier),
      prize_amount: parseFloat(this.prize_amount),
      symbols: this.symbols,
      winning_symbol: this.winning_symbol,
      played_at: this.played_at,
      is_winner: parseFloat(this.multiplier) > 0
    };
  };

  // Métodos estáticos
  Game.getStatsByTenant = async function(tenantId, startDate, endDate) {
    const where = { tenant_id: tenantId };
    
    if (startDate && endDate) {
      where.played_at = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const games = await this.findAll({ where });
    
    const stats = {
      total_games: games.length,
      total_bet: 0,
      total_prize: 0,
      total_profit: 0,
      rtp: 0,
      multiplier_distribution: {}
    };

    games.forEach(game => {
      const betAmount = parseFloat(game.bet_amount);
      const prizeAmount = parseFloat(game.prize_amount);
      const multiplier = parseFloat(game.multiplier);

      stats.total_bet += betAmount;
      stats.total_prize += prizeAmount;

      // Distribuição de multiplicadores
      if (!stats.multiplier_distribution[multiplier]) {
        stats.multiplier_distribution[multiplier] = {
          count: 0,
          percentage: 0,
          total_bet: 0,
          total_prize: 0
        };
      }
      
      stats.multiplier_distribution[multiplier].count++;
      stats.multiplier_distribution[multiplier].total_bet += betAmount;
      stats.multiplier_distribution[multiplier].total_prize += prizeAmount;
    });

    // Calcular percentuais
    Object.keys(stats.multiplier_distribution).forEach(mult => {
      const data = stats.multiplier_distribution[mult];
      data.percentage = ((data.count / stats.total_games) * 100).toFixed(4);
    });

    stats.total_profit = stats.total_bet - stats.total_prize;
    stats.rtp = stats.total_bet > 0 ? ((stats.total_prize / stats.total_bet) * 100).toFixed(2) : 0;

    return stats;
  };

  Game.getRecentByUser = function(userId, limit = 10) {
    return this.findAll({
      where: { user_id: userId },
      order: [['played_at', 'DESC']],
      limit
    });
  };

  return Game;
};

