const express = require('express');
const { User } = require('../models');
const { requireTenant } = require('../middleware/tenant');
const { 
  authMiddleware, 
  createUserSession, 
  destroyUserSession,
  getCurrentUser 
} = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post('/register', requireTenant, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Email e senha são obrigatórios'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha inválida',
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // Verificar se email já existe neste tenant
    const existingUser = await User.findByEmailAndTenant(email, req.tenant.id);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Este email já está em uso nesta plataforma'
      });
    }
    
    // Criar usuário
    const user = await User.createWithPassword({
      email,
      password_hash: password, // Será hasheado automaticamente pelo hook
      name: name || null
    }, req.tenant.id);
    
    // Criar sessão
    createUserSession(req, user);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.toPublicJSON(),
      tenant: req.tenant.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar usuário'
    });
  }
});

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post('/login', requireTenant, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Email e senha são obrigatórios'
      });
    }
    
    // Buscar usuário
    const user = await User.findByEmailAndTenant(email, req.tenant.id);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }
    
    // Verificar senha
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }
    
    // Criar sessão
    createUserSession(req, user);
    
    res.json({
      message: 'Login realizado com sucesso',
      user: user.toPublicJSON(),
      tenant: req.tenant.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer login'
    });
  }
});

/**
 * POST /api/auth/logout
 * Fazer logout
 */
router.post('/logout', async (req, res) => {
  try {
    await destroyUserSession(req);
    
    res.json({
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer logout'
    });
  }
});

/**
 * GET /api/auth/me
 * Obter informações do usuário logado
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: getCurrentUser(req),
    tenant: req.tenant ? req.tenant.toPublicJSON() : null
  });
});

/**
 * PUT /api/auth/profile
 * Atualizar perfil do usuário
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;
    
    // Validar email se fornecido
    if (email && email !== user.email) {
      const existingUser = await User.findByEmailAndTenant(email, user.tenant_id);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({
          error: 'Email já cadastrado',
          message: 'Este email já está em uso'
        });
      }
      user.email = email;
    }
    
    // Atualizar nome se fornecido
    if (name !== undefined) {
      user.name = name;
    }
    
    await user.save();
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar perfil'
    });
  }
});

/**
 * PUT /api/auth/password
 * Alterar senha
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Validações básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Senha inválida',
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // Verificar senha atual
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Senha incorreta',
        message: 'Senha atual está incorreta'
      });
    }
    
    // Atualizar senha
    user.password_hash = newPassword; // Será hasheado automaticamente pelo hook
    await user.save();
    
    res.json({
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao alterar senha'
    });
  }
});

/**
 * GET /api/auth/status
 * Verificar status de autenticação
 */
router.get('/status', async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    
    if (user) {
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          is_admin: user.is_admin
        }
      });
    } else {
      res.json({
        authenticated: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao verificar status de autenticação'
    });
  }
});

module.exports = router;

