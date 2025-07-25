# Backend - Raspa.ai MVP

API backend para a plataforma Whitelabel de raspadinhas online.

## 🚀 Deploy Railway

### Configuração Automática

O projeto está configurado para deploy automático no Railway:

1. **Conectar repositório GitHub** ao Railway
2. **Selecionar pasta backend** como root do projeto
3. **Variáveis de ambiente** serão configuradas automaticamente

### Variáveis de Ambiente Necessárias

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/database.sqlite
SESSION_SECRET=sua-chave-secreta-muito-segura
BASE_URL=https://seu-dominio.railway.app
```

### Comandos de Deploy

```bash
# Build automático
npm install && npm run migrate

# Start automático
npm start
```

## 🏗️ Arquitetura

### Stack Tecnológico
- **Node.js 18+** com Express.js
- **SQLite** para persistência
- **Sequelize** como ORM
- **bcrypt** para hash de senhas
- **express-session** para autenticação

### Estrutura de Pastas
```
src/
├── models/          # Modelos Sequelize
├── routes/          # Rotas da API
├── middleware/      # Middlewares (auth, tenant)
├── services/        # Lógica de negócio
└── utils/           # Utilitários
```

## 🎮 Funcionalidades

### Sistema Multi-Tenant
- **Detecção automática** por subdomínio
- **Isolamento completo** de dados
- **Personalização visual** por tenant

### Autenticação
- **Sessões seguras** com express-session
- **Hash de senhas** com bcrypt
- **Middleware de proteção** de rotas

### Jogo de Raspadinha
- **11 valores de aposta** (R$ 0,50 a R$ 1.000)
- **15 multiplicadores** (0x a 5000x)
- **RTP de 95%** matematicamente garantido

### APIs Disponíveis

#### Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Fazer login
- `POST /logout` - Fazer logout
- `GET /me` - Dados do usuário logado

#### Tenant (`/api/tenant`)
- `GET /info` - Informações do tenant
- `GET /css` - CSS personalizado
- `PUT /settings` - Atualizar configurações (admin)

#### Jogo (`/api/game`)
- `GET /config` - Configuração do jogo
- `GET /history` - Histórico de jogadas
- `POST /play` - Jogar (em desenvolvimento)

#### Admin (`/api/admin`)
- `GET /dashboard` - Dashboard administrativo
- `GET /users` - Listar usuários
- `POST /users/:id/credit` - Creditar saldo
- `GET /games` - Listar jogadas

## 🔧 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- NPM

### Setup
```bash
# Instalar dependências
npm install

# Executar migração
npm run migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

### Testes
```bash
# Executar testes
npm test
```

## 📊 Banco de Dados

### Modelos
- **Tenant** - Configurações de cada instância
- **User** - Usuários por tenant
- **Game** - Histórico de jogadas
- **Transaction** - Movimentações financeiras
- **MultiplierConfig** - Configuração dos multiplicadores

### Migração
```bash
# Executar migração
npm run migrate
```

## 🔒 Segurança

### Middlewares de Segurança
- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Limite de requisições
- **Session Security** - Sessões seguras

### Validações
- **Sequelize Validation** - Validação de dados
- **Input Sanitization** - Sanitização de entrada
- **SQL Injection Protection** - Proteção contra SQL injection

## 📈 Monitoramento

### Health Check
- **Endpoint:** `/health`
- **Status:** Verifica conexão com banco

### Logs
- **Console logs** em desenvolvimento
- **Structured logging** em produção

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se SQLite está instalado
   - Verificar permissões de escrita

2. **Erro de sessão**
   - Verificar SESSION_SECRET
   - Verificar configuração de cookies

3. **Erro de tenant**
   - Verificar configuração de subdomínio
   - Verificar dados do tenant no banco

### Logs Úteis
```bash
# Ver logs do Railway
railway logs

# Ver logs locais
npm run dev
```

---

**Status:** ✅ Funcionando | 🔄 Em desenvolvimento | ❌ Com problemas

