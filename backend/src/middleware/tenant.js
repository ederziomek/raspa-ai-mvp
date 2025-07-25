const { Tenant } = require('../models');

/**
 * Middleware para detecção automática de tenant baseado no subdomínio
 * Extrai o subdomínio da requisição e carrega as informações do tenant
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Extrair hostname da requisição
    const hostname = req.get('host') || req.hostname;
    
    // Para desenvolvimento local, aceitar localhost
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      req.tenant = null; // Site principal em desenvolvimento
      return next();
    }
    
    // Extrair subdomínio
    const parts = hostname.split('.');
    
    // Se não há subdomínio ou é www, tratar como site principal
    if (parts.length < 3 || parts[0] === 'www' || parts[0] === 'raspa') {
      req.tenant = null; // Site principal
      return next();
    }
    
    const subdomain = parts[0].toLowerCase();
    
    // Buscar tenant no banco de dados
    const tenant = await Tenant.findBySubdomain(subdomain);
    
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant não encontrado',
        message: `O subdomínio '${subdomain}' não está configurado`,
        subdomain: subdomain
      });
    }
    
    if (!tenant.active) {
      return res.status(403).json({
        error: 'Tenant inativo',
        message: 'Esta instância está temporariamente desabilitada',
        subdomain: subdomain
      });
    }
    
    // Adicionar tenant à requisição
    req.tenant = tenant;
    
    // Adicionar header para identificação
    res.set('X-Tenant-ID', tenant.id);
    res.set('X-Tenant-Subdomain', tenant.subdomain);
    
    next();
    
  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar tenant'
    });
  }
};

/**
 * Middleware para garantir que a requisição tem um tenant válido
 * Usado em rotas que requerem um tenant específico
 */
const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant requerido',
      message: 'Esta operação requer um tenant válido'
    });
  }
  next();
};

/**
 * Middleware para garantir que a requisição é do site principal
 * Usado em rotas administrativas globais
 */
const requireMainSite = (req, res, next) => {
  if (req.tenant) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Esta operação só pode ser executada no site principal'
    });
  }
  next();
};

/**
 * Função helper para obter informações do tenant atual
 */
const getCurrentTenant = (req) => {
  return req.tenant ? req.tenant.toPublicJSON() : null;
};

/**
 * Função helper para gerar URL do tenant
 */
const getTenantUrl = (subdomain, path = '') => {
  const baseUrl = process.env.BASE_URL || 'https://raspa.ai';
  const protocol = baseUrl.includes('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/https?:\/\//, '');
  
  return `${protocol}://${subdomain}.${domain}${path}`;
};

module.exports = {
  tenantMiddleware,
  requireTenant,
  requireMainSite,
  getCurrentTenant,
  getTenantUrl
};

