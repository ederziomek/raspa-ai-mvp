# 🎮 Raspa.ai Frontend

Interface React para o MVP da plataforma de raspadinhas online.

## 🚀 Deploy no Railway

### Configuração Automática
O frontend está configurado para deploy automático no Railway com:

- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `pnpm run preview --host 0.0.0.0 --port $PORT`
- **Health Check:** `/`

### Variáveis de Ambiente
```bash
VITE_API_URL=https://raspa-ai-mvp-production.up.railway.app
NODE_ENV=production
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- pnpm

### Instalação
```bash
cd frontend
pnpm install
```

### Executar
```bash
# Desenvolvimento
pnpm run dev

# Build
pnpm run build

# Preview (produção local)
pnpm run preview
```

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas principais
│   ├── services/       # Serviços de API
│   ├── contexts/       # Context API
│   └── lib/           # Utilitários
├── public/            # Arquivos estáticos
├── railway.toml       # Configuração Railway
├── Dockerfile         # Container Docker
└── package.json       # Dependências
```

## 🎨 Tecnologias

- **React 19** - Framework frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **Framer Motion** - Animações

## 🔗 Integração

### Backend API
- **URL:** https://raspa-ai-mvp-production.up.railway.app
- **Autenticação:** Sessões com cookies
- **CORS:** Configurado para frontend

### Endpoints Principais
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/status` - Status de autenticação
- `POST /api/game/play` - Jogar raspadinha

## 📱 Funcionalidades

### ✅ Implementado
- Interface de login/registro
- Dashboard responsivo
- Sistema de autenticação
- Integração com backend
- Design moderno

### 🚧 Em Desenvolvimento
- Canvas de raspadinha interativo
- Animações de scratch
- Sistema de multiplicadores
- Histórico de jogadas

## 🎯 Deploy

### Railway (Recomendado)
1. Conectar repositório GitHub
2. Selecionar pasta `frontend/`
3. Configurar variáveis de ambiente
4. Deploy automático

### Outras Plataformas
- Vercel
- Netlify
- Heroku

## 🔧 Configuração

### CORS
O backend está configurado para aceitar requests do frontend:
```javascript
origin: [
  'http://localhost:5173',
  'https://raspa-ai-mvp-frontend.up.railway.app'
]
```

### Sessões
- Cookies compartilhados quando no mesmo domínio
- Desenvolvimento: localStorage como fallback
- Produção: Sessões HTTP-only cookies

---

**Status:** ✅ Pronto para deploy
**Versão:** 1.0.0
**Última atualização:** 25/07/2025

