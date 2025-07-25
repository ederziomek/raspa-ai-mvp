const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração de proxy para Railway
app.set('trust proxy', 1);

// Helmet para segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS - permitir todas as origens para desenvolvimento
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting com configuração para Railway
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: 'Muitas tentativas, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting para rotas de setup e health
    return req.path === '/setup-production' || req.path === '/health';
  }
});

app.use(limiter);

// Parsing de JSON e URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração de sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspa-ai-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rota especial de setup (ANTES do middleware de tenant)
app.get('/setup-production', async (req, res) => {
  try {
    const setupProduction = require('./src/utils/setup-production');
    await setupProduction();
    res.json({
      message: 'Setup de produção executado com sucesso!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({
      error: 'Erro no setup de produção',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de detecção de tenant (corrigido)
const tenantMiddleware = require('./src/middleware/tenant-fixed');
app.use(tenantMiddleware);

// Rotas públicas (sem autenticação)
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

module.exports = app;

