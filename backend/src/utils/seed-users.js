const { User, Tenant } = require('../models');
const bcrypt = require('bcrypt');

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seed de usuários...');
    
    // Buscar ou criar tenant padrão
    let tenant = await Tenant.findOne({
      where: { subdomain: 'raspa-ai-mvp-production' }
    });
    
    if (!tenant) {
      tenant = await Tenant.create({
        subdomain: 'raspa-ai-mvp-production',
        name: 'Raspa.ai Demo',
        primary_color: '#FF6B35',
        secondary_color: '#FFD23F',
        logo_url: null,
        custom_css: '',
        is_active: true
      });
      console.log('✅ Tenant criado:', tenant.name);
    }
    
    // Criar usuário admin
    const adminExists = await User.findOne({
      where: { email: 'admin@demo.com', tenant_id: tenant.id }
    });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        tenant_id: tenant.id,
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password_hash: hashedPassword,
        balance: 100.00,
        is_admin: true
      });
      console.log('✅ Usuário admin criado: admin@demo.com / 123456');
    }
    
    // Criar usuário normal
    const userExists = await User.findOne({
      where: { email: 'user@demo.com', tenant_id: tenant.id }
    });
    
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        tenant_id: tenant.id,
        name: 'Usuário Demo',
        email: 'user@demo.com',
        password_hash: hashedPassword,
        balance: 50.00,
        is_admin: false
      });
      console.log('✅ Usuário normal criado: user@demo.com / 123456');
    }
    
    console.log('🎉 Seed de usuários concluído!');
    return {
      success: true,
      message: 'Usuários de teste criados com sucesso',
      users: [
        { email: 'admin@demo.com', password: '123456', role: 'admin', balance: 'R$ 100,00' },
        { email: 'user@demo.com', password: '123456', role: 'user', balance: 'R$ 50,00' }
      ]
    };
    
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { seedUsers };

