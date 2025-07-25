const { User, Tenant } = require('../models');
const bcrypt = require('bcrypt');

async function fixUsers() {
  try {
    console.log('🔧 Iniciando correção de usuários...');
    
    // Buscar tenant
    const tenant = await Tenant.findOne({
      where: { subdomain: 'raspa-ai-mvp-production' }
    });
    
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }
    
    console.log('✅ Tenant encontrado:', tenant.name);
    
    // Deletar usuários existentes
    await User.destroy({
      where: { tenant_id: tenant.id }
    });
    console.log('🗑️ Usuários existentes removidos');
    
    // Criar hash correto da senha
    const correctHash = await bcrypt.hash('123456', 12);
    console.log('🔐 Hash criado:', correctHash.substring(0, 20) + '...');
    
    // Criar usuário admin diretamente (sem hook)
    const admin = await User.create({
      tenant_id: tenant.id,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password_hash: correctHash,
      balance: 100.00,
      is_admin: true
    }, {
      hooks: false // Pular hooks para evitar hash duplo
    });
    console.log('✅ Admin criado:', admin.email);
    
    // Criar usuário normal diretamente (sem hook)
    const user = await User.create({
      tenant_id: tenant.id,
      name: 'Usuário Demo',
      email: 'user@demo.com',
      password_hash: correctHash,
      balance: 50.00,
      is_admin: false
    }, {
      hooks: false // Pular hooks para evitar hash duplo
    });
    console.log('✅ Usuário criado:', user.email);
    
    // Testar validação de senha
    const testAdmin = await User.findByEmailAndTenant('admin@demo.com', tenant.id);
    const isValidPassword = await testAdmin.validatePassword('123456');
    console.log('🧪 Teste de senha admin:', isValidPassword ? '✅ SUCESSO' : '❌ FALHOU');
    
    const testUser = await User.findByEmailAndTenant('user@demo.com', tenant.id);
    const isValidPassword2 = await testUser.validatePassword('123456');
    console.log('🧪 Teste de senha user:', isValidPassword2 ? '✅ SUCESSO' : '❌ FALHOU');
    
    console.log('🎉 Correção de usuários concluída!');
    return {
      success: true,
      message: 'Usuários corrigidos com sucesso',
      tests: {
        admin: isValidPassword,
        user: isValidPassword2
      },
      users: [
        { email: 'admin@demo.com', password: '123456', role: 'admin', balance: 'R$ 100,00' },
        { email: 'user@demo.com', password: '123456', role: 'user', balance: 'R$ 50,00' }
      ]
    };
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { fixUsers };

