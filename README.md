# 🎮 Raspa.ai MVP - Plataforma Whitelabel de Raspadinhas

**Versão:** 1.0.0  
**Status:** Em Desenvolvimento  
**Tecnologias:** Node.js + Express + React + SQLite + Railway

## 📋 Sobre o Projeto

MVP de uma plataforma Whitelabel para jogos de raspadinha online, permitindo que clientes criem suas próprias instâncias personalizadas com:

- **Jogo único** com seleção flexível de valores (R$ 0,50 a R$ 1.000)
- **Nova lógica de multiplicadores** (RTP 95% otimizado)
- **Sistema multi-tenant** com isolamento completo
- **Personalização visual** (cores + logo)
- **Backoffice administrativo** completo

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- **API REST** para todas as operações
- **SQLite** para persistência de dados
- **Sequelize** como ORM
- **Sistema multi-tenant** por subdomínio
- **Autenticação** com sessões

### Frontend (React)
- **Interface de jogo** responsiva
- **Backoffice administrativo** 
- **Sistema de personalização** visual
- **Bootstrap** para componentes

### Infraestrutura (Railway)
- **Deploy automático** do GitHub
- **Domínios temporários** gratuitos
- **SSL automático**
- **Scaling automático**

## 🎯 Nova Lógica de Multiplicadores

### Distribuição Otimizada (RTP 95%):
- **40%** das jogadas: 0x (perda total)
- **25%** das jogadas: 0,7x (retorno parcial)
- **20%** das jogadas: 1,4x (lucro pequeno)
- **15%** das jogadas: 2x ou mais (prêmios maiores)

### Benefícios:
- **60% das jogadas** retornam algum valor
- **Experiência mais positiva** para jogadores
- **Prêmio máximo:** 5000x (vs 1000x anterior)
- **Maior engajamento** esperado

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/[usuario]/raspa-ai-mvp.git
cd raspa-ai-mvp

# Backend
cd backend
npm install
npm run dev

# Frontend (novo terminal)
cd frontend
npm install
npm start
```

### Deploy Railway

```bash
# Login no Railway
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

## 📊 Estrutura do Projeto

```
raspa-ai-mvp/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Auth + tenant detection
│   │   ├── services/       # Lógica de negócio
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── server.js
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas principais
│   │   ├── services/       # Comunicação com API
│   │   └── utils/          # Utilitários frontend
│   └── package.json
├── docs/                   # Documentação
├── scripts/                # Scripts de deploy
└── README.md
```

## 🎮 Funcionalidades Principais

### Jogo de Raspadinha
- [x] Seleção de valores de aposta (R$ 0,50 a R$ 1.000)
- [x] 15 multiplicadores (0x a 5000x)
- [x] Sistema weighted random para RTP 95%
- [x] Interface Canvas responsiva

### Sistema Multi-Tenant
- [x] Detecção automática por subdomínio
- [x] Isolamento completo de dados
- [x] Personalização visual por tenant
- [x] Configurações independentes

### Backoffice Administrativo
- [x] Dashboard com métricas em tempo real
- [x] Análise de RTP por período
- [x] Gestão de usuários e transações
- [x] Relatórios financeiros

### Sistema Financeiro
- [x] Gerenciamento de saldos com precisão decimal
- [x] Transações ACID
- [x] Histórico completo de movimentações
- [x] Validações de integridade

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:./database.sqlite
SESSION_SECRET=your-secret-key

# Frontend
REACT_APP_API_URL=https://your-backend.railway.app
```

### Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:
- `tenants` - Configurações de cada instância
- `users` - Usuários por tenant
- `games` - Histórico de jogadas
- `transactions` - Movimentações financeiras
- `multiplier_config` - Configuração dos multiplicadores

## 📈 Métricas de Sucesso

### Técnicas
- **RTP:** 95% ± 2%
- **Performance:** < 500ms resposta
- **Uptime:** > 99%
- **Zero bugs críticos**

### Negócio
- **10+ solicitações** no primeiro mês
- **5+ instâncias ativas** no primeiro mês
- **R$ 1.000+** em apostas totais
- **80%+ satisfação** dos clientes

## 🛠️ Desenvolvimento

### Cronograma (6 semanas)
- **Semana 1-2:** Backend + Autenticação + Multi-tenant
- **Semana 3:** Lógica de jogo + Sistema financeiro
- **Semana 4:** Frontend + Interface de jogo
- **Semana 5:** Backoffice + Administração
- **Semana 6:** Testes + Deploy + Site principal

### Responsabilidades
- **Backend:** Lógica de negócio, APIs, banco de dados
- **Frontend:** Interfaces, UX, personalização visual

## 📞 Contato

- **Email:** ederziomek@upbet.com
- **Projeto:** MVP Raspa.ai
- **Prazo:** 6 semanas

---

**Status atual:** ✅ Estrutura inicial criada | 🔄 Backend em desenvolvimento

