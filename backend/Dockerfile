# Use Node.js 18 LTS
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache sqlite

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p /app/data

# Executar migração
RUN npm run migrate

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

