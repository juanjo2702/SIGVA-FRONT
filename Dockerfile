# ==========================================
# Etapa 1: Compilación (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Argumentos de entorno para Vite
ARG VITE_API_BASE=http://localhost:8002/api
ARG VITE_SIGVA_BACK_URL=http://localhost:8002
ARG VITE_SSO_FRONT_URL=http://localhost:9000
ARG VITE_SISPO_FRONT_URL=http://localhost:9001
ARG VITE_SHARED_ASSET_URL=http://localhost:8000

ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_SIGVA_BACK_URL=$VITE_SIGVA_BACK_URL \
    VITE_SSO_FRONT_URL=$VITE_SSO_FRONT_URL \
    VITE_SISPO_FRONT_URL=$VITE_SISPO_FRONT_URL \
    VITE_SHARED_ASSET_URL=$VITE_SHARED_ASSET_URL

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Sobrescribir .env.production con las variables de Docker
RUN rm -f .env.production .env.production.local && \
    printf "VITE_API_BASE=%s\nVITE_SIGVA_BACK_URL=%s\nVITE_SSO_FRONT_URL=%s\nVITE_SISPO_FRONT_URL=%s\nVITE_SHARED_ASSET_URL=%s\n" \
    "$VITE_API_BASE" "$VITE_SIGVA_BACK_URL" "$VITE_SSO_FRONT_URL" "$VITE_SISPO_FRONT_URL" "$VITE_SHARED_ASSET_URL" > .env.production

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
