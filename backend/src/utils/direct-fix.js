const bcrypt = require('bcrypt');
const { sequelize } = require('../models');

async function directFix() {
  try {
    console.log('🔧 Iniciando correção direta via SQL...');
    
    // Criar hash correto
    const correctHash = await bcrypt.hash('123456', 12);
    console.log('🔐 Hash criado:', correctHash.substring(0, 20) + '...');
    
    // Buscar tenant ID
    const [tenantResult] = await sequelize.query(
      "SELECT id FROM tenants WHERE subdomain = 'raspa-ai-mvp-production' LIMIT 1"
    );
    
    if (!tenantResult || tenantResult.length === 0) {
      // Criar tenant se não existir
      await sequelize.query(`
        INSERT INTO tenants (subdomain, name, primary_color, secondary_color, is_active, createdAt, updatedAt)
        VALUES ('raspa-ai-mvp-production', 'Raspa.ai Demo', '#FF6B35', '#FFD23F', 1, NOW(), NOW())
      `);
      
      const [newTenantResult] = await sequelize.query(
        "SELECT id FROM tenants WHERE subdomain = 'raspa-ai-mvp-production' LIMIT 1"
      );
      var tenantId = newTenantResult[0].id;
      console.log('✅ Tenant criado com ID:', tenantId);
    } else {
      var tenantId = tenantResult[0].id;
      console.log('✅ Tenant encontrado com ID:', tenantId);
    }
    
    // Deletar usuários existentes
    await sequelize.query(`DELETE FROM users WHERE tenant_id = ${tenantId}`);
    console.log('🗑️ Usuários existentes removidos');
    
    // Criar usuário admin
    await sequelize.query(`
      INSERT INTO users (tenant_id, name, email, password_hash, balance, is_admin, active, createdAt, updatedAt)
      VALUES (${tenantId}, 'Admin Demo', 'admin@demo.com', '${correctHash}', 100.00, 1, 1, NOW(), NOW())
    `);
    console.log('✅ Admin criado: admin@demo.com');
    
    // Criar usuário normal
    await sequelize.query(`
      INSERT INTO users (tenant_id, name, email, password_hash, balance, is_admin, active, createdAt, updatedAt)
      VALUES (${tenantId}, 'Usuário Demo', 'user@demo.com', '${correctHash}', 50.00, 0, 1, NOW(), NOW())
    `);
    console.log('✅ Usuário criado: user@demo.com');
    
    // Verificar criação
    const [adminResult] = await sequelize.query(
      `SELECT email, password_hash FROM users WHERE email = 'admin@demo.com' AND tenant_id = ${tenantId}`
    );
    
    const [userResult] = await sequelize.query(
      `SELECT email, password_hash FROM users WHERE email = 'user@demo.com' AND tenant_id = ${tenantId}`
    );
    
    // Testar hash
    const adminHashTest = await bcrypt.compare('123456', adminResult[0].password_hash);
    const userHashTest = await bcrypt.compare('123456', userResult[0].password_hash);
    
    console.log('🧪 Teste hash admin:', adminHashTest ? '✅ SUCESSO' : '❌ FALHOU');
    console.log('🧪 Teste hash user:', userHashTest ? '✅ SUCESSO' : '❌ FALHOU');
    
    console.log('🎉 Correção direta concluída!');
    return {
      success: true,
      message: 'Usuários corrigidos via SQL direto',
      tenant_id: tenantId,
      tests: {
        admin: adminHashTest,
        user: userHashTest
      },
      users: [
        { email: 'admin@demo.com', password: '123456', role: 'admin', balance: 'R$ 100,00' },
        { email: 'user@demo.com', password: '123456', role: 'user', balance: 'R$ 50,00' }
      ]
    };
    
  } catch (error) {
    console.error('❌ Erro na correção direta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { directFix };

