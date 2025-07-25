# Dockerfile para Frontend React
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE $PORT

# Comando para iniciar
CMD ["npm", "start"]

