# ==========================================
# Etapa 1: Compilación (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Argumentos de entorno para Vite
ARG VITE_SIGVA_BACK_URL
ARG VITE_SSO_FRONT_URL
ARG VITE_SISPO_FRONT_URL
ARG VITE_SHARED_ASSET_URL

ENV VITE_SIGVA_BACK_URL=$VITE_SIGVA_BACK_URL \
    VITE_SSO_FRONT_URL=$VITE_SSO_FRONT_URL \
    VITE_SISPO_FRONT_URL=$VITE_SISPO_FRONT_URL \
    VITE_SHARED_ASSET_URL=$VITE_SHARED_ASSET_URL

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Compilar proyecto Vite SPA (genera dist/)
RUN npm run build

# ==========================================
# Etapa 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiar configuración Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build generado en la etapa anterior (Vite genera dist)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9002

CMD ["nginx", "-g", "daemon off;"]
