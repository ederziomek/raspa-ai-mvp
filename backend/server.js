const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configurado para permitir frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://raspa-ai-mvp-production.up.railway.app',
    'https://raspa-ai-mvp-frontend.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas',
    message: 'Tente novamente em 15 minutos'
  }
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspa-ai-mvp-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rota de health check (ANTES do middleware de tenant)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de setup de produção
app.get('/setup-production', async (req, res) => {
  try {
    const { seedUsers } = require('./src/utils/seed-users');
    const result = await seedUsers();
    res.json(result);
  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de correção de usuários
app.get('/fix-users', async (req, res) => {
  try {
    const { fixUsers } = require('./src/utils/fix-users');
    const result = await fixUsers();
    res.json(result);
  } catch (error) {
    console.error('Erro na correção:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware de tenant
const tenantMiddleware = require('./src/middleware/tenant-fixed');
app.use(tenantMiddleware);

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Raspa.ai MVP API',
    version: '1.0.0',
    tenant: req.tenant ? req.tenant.subdomain : 'none',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tenant', require('./src/routes/tenant'));
app.use('/api/game', require('./src/routes/game'));
app.use('/api/admin', require('./src/routes/admin'));

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

