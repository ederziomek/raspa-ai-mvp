const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subdomain: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9-]+$/,
          msg: 'Subdomínio deve conter apenas letras, números e hífens'
        },
        len: {
          args: [3, 50],
          msg: 'Subdomínio deve ter entre 3 e 50 caracteres'
        }
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres'
        }
      }
    },
    primary_color: {
      type: DataTypes.STRING(7),
      defaultValue: '#007bff',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Cor primária deve estar no formato hexadecimal (#RRGGBB)'
        }
      }
    },
    secondary_color: {
      type: DataTypes.STRING(7),
      defaultValue: '#6c757d',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Cor secundária deve estar no formato hexadecimal (#RRGGBB)'
        }
      }
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'URL do logo deve ser válida'
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Configurações específicas do tenant em formato JSON'
    }
  }, {
    tableName: 'tenants',
    indexes: [
      {
        unique: true,
        fields: ['subdomain']
      },
      {
        fields: ['active']
      }
    ],
    hooks: {
      beforeValidate: (tenant) => {
        // Converter subdomínio para lowercase
        if (tenant.subdomain) {
          tenant.subdomain = tenant.subdomain.toLowerCase();
        }
      }
    }
  });

  // Métodos de instância
  Tenant.prototype.toPublicJSON = function() {
    return {
      id: this.id,
      subdomain: this.subdomain,
      name: this.name,
      primary_color: this.primary_color,
      secondary_color: this.secondary_color,
      logo_url: this.logo_url,
      active: this.active,
      created_at: this.createdAt
    };
  };

  // Métodos estáticos
  Tenant.findBySubdomain = function(subdomain) {
    return this.findOne({
      where: {
        subdomain: subdomain.toLowerCase(),
        active: true
      }
    });
  };

  return Tenant;
};

