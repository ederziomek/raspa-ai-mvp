const express = require('express');
const { Tenant } = require('../models');
const { requireTenant, requireMainSite } = require('../middleware/tenant');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/tenant/info
 * Obter informações do tenant atual
 */
router.get('/info', requireTenant, (req, res) => {
  res.json({
    tenant: req.tenant.toPublicJSON()
  });
});

/**
 * GET /api/tenant/css
 * Gerar CSS personalizado para o tenant
 */
router.get('/css', requireTenant, (req, res) => {
  const tenant = req.tenant;
  
  const css = `
    :root {
      --primary-color: ${tenant.primary_color};
      --secondary-color: ${tenant.secondary_color};
      --primary-rgb: ${hexToRgb(tenant.primary_color)};
      --secondary-rgb: ${hexToRgb(tenant.secondary_color)};
    }
    
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .btn-primary:hover {
      background-color: ${darkenColor(tenant.primary_color, 10)};
      border-color: ${darkenColor(tenant.primary_color, 10)};
    }
    
    .btn-outline-primary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .btn-outline-primary:hover {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .text-primary {
      color: var(--primary-color) !important;
    }
    
    .bg-primary {
      background-color: var(--primary-color) !important;
    }
    
    .navbar-brand {
      color: var(--primary-color) !important;
    }
    
    .navbar-brand:hover {
      color: ${darkenColor(tenant.primary_color, 15)} !important;
    }
    
    .game-card {
      border: 2px solid var(--primary-color);
    }
    
    .game-card:hover {
      box-shadow: 0 4px 8px rgba(var(--primary-rgb), 0.3);
    }
    
    .scratch-card {
      border: 3px solid var(--primary-color);
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    .prize-table .table-warning {
      background-color: rgba(var(--primary-rgb), 0.1) !important;
    }
    
    .balance-display {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
    }
    
    .logo-container img {
      max-height: 40px;
      width: auto;
    }
  `;
  
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
  res.send(css);
});

/**
 * PUT /api/tenant/settings
 * Atualizar configurações do tenant (apenas admin)
 */
router.put('/settings', requireTenant, authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, primary_color, secondary_color, logo_url, settings } = req.body;
    const tenant = req.tenant;
    
    // Validar cores se fornecidas
    if (primary_color && !/^#[0-9A-Fa-f]{6}$/.test(primary_color)) {
      return res.status(400).json({
        error: 'Cor inválida',
        message: 'Cor primária deve estar no formato hexadecimal (#RRGGBB)'
      });
    }
    
    if (secondary_color && !/^#[0-9A-Fa-f]{6}$/.test(secondary_color)) {
      return res.status(400).json({
        error: 'Cor inválida',
        message: 'Cor secundária deve estar no formato hexadecimal (#RRGGBB)'
      });
    }
    
    // Atualizar campos fornecidos
    if (name) tenant.name = name;
    if (primary_color) tenant.primary_color = primary_color;
    if (secondary_color) tenant.secondary_color = secondary_color;
    if (logo_url !== undefined) tenant.logo_url = logo_url;
    if (settings) tenant.settings = { ...tenant.settings, ...settings };
    
    await tenant.save();
    
    res.json({
      message: 'Configurações atualizadas com sucesso',
      tenant: tenant.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar configurações'
    });
  }
});

/**
 * POST /api/tenant/create
 * Criar novo tenant (apenas no site principal)
 */
router.post('/create', requireMainSite, async (req, res) => {
  try {
    const { subdomain, name, primary_color, secondary_color, logo_url } = req.body;
    
    // Validações básicas
    if (!subdomain || !name) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Subdomínio e nome são obrigatórios'
      });
    }
    
    // Verificar se subdomínio já existe
    const existingTenant = await Tenant.findBySubdomain(subdomain);
    if (existingTenant) {
      return res.status(409).json({
        error: 'Subdomínio já existe',
        message: 'Este subdomínio já está em uso'
      });
    }
    
    // Criar tenant
    const tenant = await Tenant.create({
      subdomain,
      name,
      primary_color: primary_color || '#007bff',
      secondary_color: secondary_color || '#6c757d',
      logo_url: logo_url || null
    });
    
    res.status(201).json({
      message: 'Tenant criado com sucesso',
      tenant: tenant.toPublicJSON(),
      url: `https://${subdomain}.raspa.ai`
    });
    
  } catch (error) {
    console.error('Erro ao criar tenant:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar tenant'
    });
  }
});

/**
 * GET /api/tenant/list
 * Listar todos os tenants (apenas no site principal)
 */
router.get('/list', requireMainSite, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    
    const where = {};
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: tenants } = await Tenant.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      tenants: tenants.map(t => t.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar tenants:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar tenants'
    });
  }
});

// Funções auxiliares para manipulação de cores
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 123, 255';
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

module.exports = router;

