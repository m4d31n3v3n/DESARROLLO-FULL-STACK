FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código del backend
COPY middleware ./middleware
COPY server.js .

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["node", "server.js"]
