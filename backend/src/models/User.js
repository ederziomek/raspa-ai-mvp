const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Email deve ter formato válido'
        },
        len: {
          args: [5, 100],
          msg: 'Email deve ter entre 5 e 100 caracteres'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres'
        }
      }
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Saldo não pode ser negativo'
        }
      }
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'email']
      },
      {
        fields: ['tenant_id', 'active']
      },
      {
        fields: ['tenant_id', 'is_admin']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && !user.password_hash.startsWith('$2b$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeValidate: (user) => {
        // Converter email para lowercase
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
      }
    }
  });

  // Métodos de instância
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toPublicJSON = function() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      balance: parseFloat(this.balance),
      is_admin: this.is_admin,
      last_login: this.last_login,
      created_at: this.createdAt
    };
  };

  User.prototype.updateLastLogin = function() {
    this.last_login = new Date();
    return this.save();
  };

  // Métodos estáticos
  User.findByEmailAndTenant = function(email, tenantId) {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
        tenant_id: tenantId,
        active: true
      }
    });
  };

  User.createWithPassword = async function(userData, tenantId) {
    return await this.create({
      ...userData,
      tenant_id: tenantId,
      email: userData.email.toLowerCase()
    });
  };

  return User;
};

