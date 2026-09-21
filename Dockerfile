# ==============================================================================
# Estágio 1: Build da Aplicação Frontend (Node.js)
# ==============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Instalação de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Cópia do código-fonte e build de produção
COPY . .
RUN npm run build

# ==============================================================================
# Estágio 2: Servidor Web de Produção (Nginx Alpine)
# ==============================================================================
FROM nginx:alpine

# Cópia dos arquivos estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx com proxy reverso para a API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
