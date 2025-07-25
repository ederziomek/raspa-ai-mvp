const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MultiplierConfig = sequelize.define('MultiplierConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    multiplier: {
      type: DataTypes.DECIMAL(8, 6),
      allowNull: false,
      unique: true,
      validate: {
        min: {
          args: [0],
          msg: 'Multiplicador não pode ser negativo'
        }
      }
    },
    probability: {
      type: DataTypes.DECIMAL(12, 9),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Probabilidade não pode ser negativa'
        },
        max: {
          args: [1],
          msg: 'Probabilidade não pode ser maior que 1'
        }
      }
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Peso deve ser maior que zero'
        }
      }
    },
    rtp_contribution: {
      type: DataTypes.DECIMAL(8, 5),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Contribuição RTP não pode ser negativa'
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'multiplier_config',
    indexes: [
      {
        unique: true,
        fields: ['multiplier']
      },
      {
        fields: ['active']
      }
    ]
  });

  // Métodos estáticos
  MultiplierConfig.getActiveConfig = function() {
    return this.findAll({
      where: { active: true },
      order: [['weight', 'DESC']]
    });
  };

  MultiplierConfig.getTotalWeight = async function() {
    const result = await this.findOne({
      where: { active: true },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('weight')), 'total_weight']
      ],
      raw: true
    });
    
    return result ? parseInt(result.total_weight) : 0;
  };

  MultiplierConfig.calculateRTP = async function() {
    const result = await this.findOne({
      where: { active: true },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('rtp_contribution')), 'total_rtp']
      ],
      raw: true
    });
    
    return result ? parseFloat(result.total_rtp) : 0;
  };

  MultiplierConfig.seedDefaultConfig = async function() {
    const existingConfig = await this.count();
    
    if (existingConfig === 0) {
      const defaultConfig = [
        { multiplier: 0, probability: 0.400000000, weight: 40000, rtp_contribution: 0.00000 },
        { multiplier: 0.7, probability: 0.250000000, weight: 25000, rtp_contribution: 17.50000 },
        { multiplier: 1.4, probability: 0.200000000, weight: 20000, rtp_contribution: 28.00000 },
        { multiplier: 2, probability: 0.080000000, weight: 8000, rtp_contribution: 16.00000 },
        { multiplier: 3, probability: 0.040000000, weight: 4000, rtp_contribution: 12.00000 },
        { multiplier: 4, probability: 0.018000000, weight: 1800, rtp_contribution: 7.20000 },
        { multiplier: 5, probability: 0.008000000, weight: 800, rtp_contribution: 4.00000 },
        { multiplier: 12, probability: 0.002500000, weight: 250, rtp_contribution: 3.00000 },
        { multiplier: 25, probability: 0.001000000, weight: 100, rtp_contribution: 2.50000 },
        { multiplier: 70, probability: 0.000400000, weight: 40, rtp_contribution: 2.80000 },
        { multiplier: 140, probability: 0.000080000, weight: 8, rtp_contribution: 1.12000 },
        { multiplier: 320, probability: 0.000015000, weight: 15, rtp_contribution: 0.48000 },
        { multiplier: 650, probability: 0.000004000, weight: 4, rtp_contribution: 0.26000 },
        { multiplier: 1360, probability: 0.000000990, weight: 1, rtp_contribution: 0.13500 },
        { multiplier: 5000, probability: 0.000000010, weight: 1, rtp_contribution: 0.00500 }
      ];

      await this.bulkCreate(defaultConfig);
      console.log('✅ Configuração padrão de multiplicadores criada');
      
      // Verificar RTP total
      const totalRTP = await this.calculateRTP();
      console.log(`📊 RTP total configurado: ${totalRTP}%`);
    }
  };

  return MultiplierConfig;
};

