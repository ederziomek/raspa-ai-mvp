const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// Importar modelos
const Tenant = require('./Tenant')(sequelize);
const User = require('./User')(sequelize);
const Game = require('./Game')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const MultiplierConfig = require('./MultiplierConfig')(sequelize);

// Definir associações
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Game, { foreignKey: 'tenant_id', as: 'games' });
Game.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

User.hasMany(Game, { foreignKey: 'user_id', as: 'games' });
Game.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Tenant.hasMany(Transaction, { foreignKey: 'tenant_id', as: 'transactions' });
Transaction.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Game.hasMany(Transaction, { foreignKey: 'game_id', as: 'transactions' });
Transaction.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Game,
  Transaction,
  MultiplierConfig
};

