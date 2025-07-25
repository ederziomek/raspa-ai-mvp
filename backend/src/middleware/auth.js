const { User } = require('../models');

/**
 * Middleware de autenticação
 * Verifica se o usuário está logado e carrega suas informações
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se há sessão ativa
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: 'Você precisa fazer login para acessar este recurso'
      });
    }
    
    // Verificar se há tenant (para rotas que requerem tenant)
    const tenantId = req.tenant ? req.tenant.id : null;
    
    // Buscar usuário no banco
    const user = await User.findOne({
      where: {
        id: req.session.userId,
        active: true,
        ...(tenantId && { tenant_id: tenantId })
      }
    });
    
    if (!user) {
      // Limpar sessão inválida
      req.session.destroy();
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Sessão inválida, faça login novamente'
      });
    }
    
    // Verificar se o usuário pertence ao tenant correto
    if (tenantId && user.tenant_id !== tenantId) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Usuário não pertence a este tenant'
      });
    }
    
    // Adicionar usuário à requisição
    req.user = user;
    
    // Adicionar headers para identificação
    res.set('X-User-ID', user.id);
    res.set('X-User-Email', user.email);
    
    next();
    
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você precisa ser administrador para acessar este recurso'
    });
  }
  next();
};

/**
 * Middleware opcional de autenticação
 * Carrega o usuário se estiver logado, mas não bloqueia se não estiver
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const tenantId = req.tenant ? req.tenant.id : null;
      
      const user = await User.findOne({
        where: {
          id: req.session.userId,
          active: true,
          ...(tenantId && { tenant_id: tenantId })
        }
      });
      
      if (user && (!tenantId || user.tenant_id === tenantId)) {
        req.user = user;
        res.set('X-User-ID', user.id);
        res.set('X-User-Email', user.email);
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    // Não bloquear em caso de erro, apenas continuar sem usuário
    next();
  }
};

/**
 * Função helper para verificar se o usuário está logado
 */
const isAuthenticated = (req) => {
  return !!(req.user && req.user.id);
};

/**
 * Função helper para verificar se o usuário é admin
 */
const isAdmin = (req) => {
  return !!(req.user && req.user.is_admin);
};

/**
 * Função helper para obter o usuário atual
 */
const getCurrentUser = (req) => {
  return req.user ? req.user.toPublicJSON() : null;
};

/**
 * Função para criar sessão de usuário
 */
const createUserSession = (req, user) => {
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.tenantId = user.tenant_id;
  req.session.isAdmin = user.is_admin;
  
  // Atualizar último login
  user.updateLastLogin();
};

/**
 * Função para destruir sessão de usuário
 */
const destroyUserSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  authMiddleware,
  requireAdmin,
  optionalAuth,
  isAuthenticated,
  isAdmin,
  getCurrentUser,
  createUserSession,
  destroyUserSession
};

