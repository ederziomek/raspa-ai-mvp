const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
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
    type: {
      type: DataTypes.ENUM('debit', 'credit', 'manual_credit', 'manual_debit'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Valor da transação deve ser maior que zero'
        }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    reference_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID de referência externa (ex: ID do pagamento)'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Dados adicionais da transação em formato JSON'
    },
    processed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    processed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que processou a transação (para transações manuais)'
    }
  }, {
    tableName: 'transactions',
    indexes: [
      {
        fields: ['tenant_id', 'processed_at']
      },
      {
        fields: ['user_id', 'processed_at']
      },
      {
        fields: ['type', 'processed_at']
      },
      {
        fields: ['game_id']
      },
      {
        fields: ['reference_id']
      }
    ]
  });

  // Métodos de instância
  Transaction.prototype.toPublicJSON = function() {
    return {
      id: this.id,
      type: this.type,
      amount: parseFloat(this.amount),
      description: this.description,
      game_id: this.game_id,
      reference_id: this.reference_id,
      processed_at: this.processed_at,
      metadata: this.metadata
    };
  };

  // Métodos estáticos
  Transaction.createDebit = async function(userId, tenantId, amount, description, gameId = null, metadata = {}) {
    return await this.create({
      tenant_id: tenantId,
      user_id: userId,
      type: 'debit',
      amount,
      description,
      game_id: gameId,
      metadata
    });
  };

  Transaction.createCredit = async function(userId, tenantId, amount, description, gameId = null, metadata = {}) {
    return await this.create({
      tenant_id: tenantId,
      user_id: userId,
      type: 'credit',
      amount,
      description,
      game_id: gameId,
      metadata
    });
  };

  Transaction.createManualCredit = async function(userId, tenantId, amount, description, processedBy, metadata = {}) {
    return await this.create({
      tenant_id: tenantId,
      user_id: userId,
      type: 'manual_credit',
      amount,
      description,
      processed_by: processedBy,
      metadata
    });
  };

  Transaction.getBalanceByUser = async function(userId, tenantId) {
    const result = await this.findAll({
      where: {
        user_id: userId,
        tenant_id: tenantId
      },
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['type'],
      raw: true
    });

    let balance = 0;
    result.forEach(row => {
      if (row.type === 'credit' || row.type === 'manual_credit') {
        balance += parseFloat(row.total);
      } else if (row.type === 'debit' || row.type === 'manual_debit') {
        balance -= parseFloat(row.total);
      }
    });

    return Math.max(0, balance); // Garantir que o saldo não seja negativo
  };

  Transaction.getStatsByTenant = async function(tenantId, startDate, endDate) {
    const where = { tenant_id: tenantId };
    
    if (startDate && endDate) {
      where.processed_at = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const transactions = await this.findAll({ where });
    
    const stats = {
      total_transactions: transactions.length,
      total_credits: 0,
      total_debits: 0,
      net_flow: 0,
      by_type: {
        debit: { count: 0, amount: 0 },
        credit: { count: 0, amount: 0 },
        manual_credit: { count: 0, amount: 0 },
        manual_debit: { count: 0, amount: 0 }
      }
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const type = transaction.type;

      stats.by_type[type].count++;
      stats.by_type[type].amount += amount;

      if (type === 'credit' || type === 'manual_credit') {
        stats.total_credits += amount;
      } else if (type === 'debit' || type === 'manual_debit') {
        stats.total_debits += amount;
      }
    });

    stats.net_flow = stats.total_credits - stats.total_debits;

    return stats;
  };

  Transaction.getRecentByUser = function(userId, limit = 20) {
    return this.findAll({
      where: { user_id: userId },
      order: [['processed_at', 'DESC']],
      limit,
      include: [
        {
          model: sequelize.models.Game,
          as: 'game',
          required: false
        }
      ]
    });
  };

  return Transaction;
};

