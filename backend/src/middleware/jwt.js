const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'raspa-ai-mvp-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Gerar token JWT
const generateToken = (user, tenant) => {
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: tenant.id,
    isAdmin: user.is_admin || false
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware de autenticação JWT
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Adicionar dados do usuário à requisição
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      isAdmin: decoded.isAdmin
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação JWT:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware opcional (não bloqueia se não tiver token)
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          tenantId: decoded.tenantId,
          isAdmin: decoded.isAdmin
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro no JWT opcional:', error);
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT,
  optionalJWT,
  JWT_SECRET
};

