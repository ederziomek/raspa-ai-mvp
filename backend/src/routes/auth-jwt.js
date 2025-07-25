const express = require('express');
const bcrypt = require('bcrypt');
const { User, Tenant } = require('../models');
const { generateToken, authenticateJWT } = require('../middleware/jwt');

const router = express.Router();

/**
 * POST /api/auth/login
 * Fazer login com JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário
    const user = await User.findOne({ 
      where: { email, tenant_id: req.tenant.id },
      include: [{ model: Tenant, as: 'tenant' }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas', message: 'Email ou senha incorretos' });
    }
    
    // Verificar senha
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas', message: 'Email ou senha incorretos' });
    }
    
    // Atualizar último login
    await user.update({ last_login: new Date() });
    
    // Gerar token JWT
    const token = generateToken(user, req.tenant);
    
    // Dados do usuário (sem senha)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      is_admin: user.is_admin,
      last_login: user.last_login,
      created_at: user.createdAt
    };
    
    // Dados do tenant
    const tenantData = {
      id: req.tenant.id,
      subdomain: req.tenant.subdomain,
      name: req.tenant.name,
      primary_color: req.tenant.primary_color,
      secondary_color: req.tenant.secondary_color,
      logo_url: req.tenant.logo_url,
      active: req.tenant.active,
      created_at: req.tenant.createdAt
    };
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userData,
      tenant: tenantData
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/auth/register
 * Registrar novo usuário com JWT
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ 
      where: { email, tenant_id: req.tenant.id }
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    
    // Criar usuário
    const user = await User.create({
      email,
      password_hash: password, // Será hasheado pelo hook
      name: name || null,
      tenant_id: req.tenant.id,
      balance: 0,
      is_admin: false,
      active: true
    });
    
    // Gerar token JWT
    const token = generateToken(user, req.tenant);
    
    // Dados do usuário
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      is_admin: user.is_admin,
      created_at: user.createdAt
    };
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: userData,
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain
      }
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/auth/me
 * Obter informações do usuário logado
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Tenant, as: 'tenant' }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        is_admin: user.is_admin,
        last_login: user.last_login,
        created_at: user.createdAt
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        subdomain: user.tenant.subdomain,
        primary_color: user.tenant.primary_color,
        secondary_color: user.tenant.secondary_color
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/auth/status
 * Verificar status de autenticação
 */
router.get('/status', authenticateJWT, async (req, res) => {
  try {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        tenantId: req.user.tenantId,
        isAdmin: req.user.isAdmin
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

