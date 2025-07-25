const { Tenant } = require('../models');

// Tenant padrão para Railway
const DEFAULT_TENANT = {
  id: 1,
  subdomain: 'raspa-ai-mvp-production',
  name: 'Raspa.ai Demo',
  primary_color: '#FF6B35',
  secondary_color: '#F7931E',
  accent_color: '#FFD23F',
  logo_url: null,
  custom_css: null,
  is_active: true
};

module.exports = async (req, res, next) => {
  try {
    // Extrair subdomínio do host
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    console.log(`🔍 Host: ${host}, Subdomínio detectado: ${subdomain}`);
    
    let tenant;
    
    // Tentar buscar tenant no banco
    try {
      tenant = await Tenant.findOne({ 
        where: { 
          subdomain: subdomain,
          is_active: true 
        } 
      });
    } catch (dbError) {
      console.log('⚠️ Erro ao buscar tenant no banco:', dbError.message);
    }
    
    // Se não encontrou tenant, usar padrão para Railway
    if (!tenant) {
      console.log(`🔧 Tenant não encontrado, usando padrão para: ${subdomain}`);
      tenant = DEFAULT_TENANT;
      
      // Se for o subdomínio do Railway (backend ou frontend), criar no banco
      if (subdomain === 'raspa-ai-mvp-production' || subdomain === 'web-production-feb0a') {
        try {
          const createdTenant = await Tenant.findOrCreate({
            where: { subdomain: 'raspa-ai-mvp-production' },
            defaults: DEFAULT_TENANT
          });
          tenant = createdTenant[0];
          console.log('✅ Tenant Railway criado no banco');
        } catch (createError) {
          console.log('⚠️ Erro ao criar tenant:', createError.message);
          // Continuar com tenant padrão
        }
      }
    }
    
    // Anexar tenant à requisição
    req.tenant = tenant;
    
    console.log(`✅ Tenant configurado: ${tenant.name} (${tenant.subdomain})`);
    next();
    
  } catch (error) {
    console.error('❌ Erro no middleware de tenant:', error);
    
    // Em caso de erro, usar tenant padrão
    req.tenant = DEFAULT_TENANT;
    console.log('🔧 Usando tenant padrão devido ao erro');
    next();
  }
};

