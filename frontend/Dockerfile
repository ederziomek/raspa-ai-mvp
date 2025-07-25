# Dockerfile para Frontend React
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm run build

# Expor porta
EXPOSE $PORT

# Comando para iniciar
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "$PORT"]

