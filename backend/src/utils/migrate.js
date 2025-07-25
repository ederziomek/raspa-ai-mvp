const { sequelize, MultiplierConfig, Tenant, User } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados');
    
    // Criar configuração padrão de multiplicadores
    await MultiplierConfig.seedDefaultConfig();
    
    // Criar tenant de exemplo para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const existingTenant = await Tenant.findBySubdomain('demo');
      
      if (!existingTenant) {
        const demoTenant = await Tenant.create({
          subdomain: 'demo',
          name: 'Demo Raspa.ai',
          primary_color: '#007bff',
          secondary_color: '#6c757d'
        });
        
        console.log('✅ Tenant demo criado');
        
        // Criar usuário admin de exemplo
        const adminUser = await User.createWithPassword({
          email: 'admin@demo.com',
          password_hash: '123456',
          name: 'Administrador Demo',
          is_admin: true,
          balance: 100.00
        }, demoTenant.id);
        
        console.log('✅ Usuário admin demo criado (admin@demo.com / 123456)');
        
        // Criar usuário comum de exemplo
        const normalUser = await User.createWithPassword({
          email: 'user@demo.com',
          password_hash: '123456',
          name: 'Usuário Demo',
          balance: 50.00
        }, demoTenant.id);
        
        console.log('✅ Usuário comum demo criado (user@demo.com / 123456)');
      }
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrate();
}

module.exports = migrate;

