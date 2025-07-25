const { sequelize, Tenant, User, MultiplierConfig } = require('../models');

async function setupProduction() {
  try {
    console.log('🚀 Iniciando setup de produção Railway...');
    
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar se já existe configuração de multiplicadores
    const multiplierCount = await MultiplierConfig.count();
    if (multiplierCount === 0) {
      await MultiplierConfig.seedDefaultConfig();
    }
    
    // Criar tenant para Railway
    const railwaySubdomain = 'raspa-ai-mvp-production';
    let railwayTenant = await Tenant.findBySubdomain(railwaySubdomain);
    
    if (!railwayTenant) {
      railwayTenant = await Tenant.create({
        subdomain: railwaySubdomain,
        name: 'Raspa.ai MVP - Railway Demo',
        primary_color: '#007bff',
        secondary_color: '#6c757d',
        settings: {
          description: 'Instância de demonstração no Railway',
          environment: 'production'
        }
      });
      
      console.log(`✅ Tenant Railway criado: ${railwaySubdomain}`);
    } else {
      console.log(`ℹ️  Tenant Railway já existe: ${railwaySubdomain}`);
    }
    
    // Criar usuário admin para Railway
    const adminEmail = 'admin@railway.demo';
    let adminUser = await User.findByEmailAndTenant(adminEmail, railwayTenant.id);
    
    if (!adminUser) {
      adminUser = await User.createWithPassword({
        email: adminEmail,
        password_hash: 'railway123',
        name: 'Admin Railway Demo',
        is_admin: true,
        balance: 500.00
      }, railwayTenant.id);
      
      console.log(`✅ Admin criado: ${adminEmail} / railway123 (saldo: R$ 500)`);
    } else {
      console.log(`ℹ️  Admin já existe: ${adminEmail}`);
    }
    
    // Criar usuário comum para Railway
    const userEmail = 'user@railway.demo';
    let normalUser = await User.findByEmailAndTenant(userEmail, railwayTenant.id);
    
    if (!normalUser) {
      normalUser = await User.createWithPassword({
        email: userEmail,
        password_hash: 'railway123',
        name: 'Usuário Railway Demo',
        balance: 100.00
      }, railwayTenant.id);
      
      console.log(`✅ Usuário criado: ${userEmail} / railway123 (saldo: R$ 100)`);
    } else {
      console.log(`ℹ️  Usuário já existe: ${userEmail}`);
    }
    
    // Verificar RTP
    const totalRTP = await MultiplierConfig.calculateRTP();
    console.log(`📊 RTP configurado: ${totalRTP}%`);
    
    // Estatísticas finais
    const totalTenants = await Tenant.count();
    const totalUsers = await User.count();
    
    console.log('\n🎉 Setup de produção concluído!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Tenants: ${totalTenants}`);
    console.log(`   - Usuários: ${totalUsers}`);
    console.log(`   - RTP: ${totalRTP}%`);
    
    console.log('\n🔗 URLs de teste:');
    console.log(`   - API Principal: https://raspa-ai-mvp-production.up.railway.app/`);
    console.log(`   - Health Check: https://raspa-ai-mvp-production.up.railway.app/health`);
    console.log(`   - Tenant Info: https://raspa-ai-mvp-production.up.railway.app/api/tenant/info`);
    
    console.log('\n👤 Credenciais de teste:');
    console.log(`   - Admin: ${adminEmail} / railway123`);
    console.log(`   - User:  ${userEmail} / railway123`);
    
  } catch (error) {
    console.error('❌ Erro no setup de produção:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar setup se chamado diretamente
if (require.main === module) {
  setupProduction();
}

module.exports = setupProduction;

