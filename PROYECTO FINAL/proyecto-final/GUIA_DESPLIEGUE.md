# 🚀 Guía de Despliegue en la Nube

## Opciones de Hosting

### 1. Heroku (Más fácil para principiantes)
### 2. Render (Alternativa moderna gratuita)
### 3. AWS (Más potente y escalable)
### 4. DigitalOcean (Buena relación precio-rendimiento)

---

## 🟣 Opción 1: Despliegue en Heroku

### Paso 1: Preparar el proyecto

```bash
# Crear archivo Procfile en la raíz
echo "web: node server.js" > Procfile

# Crear .gitignore con node_modules
echo "node_modules/" >> .gitignore
```

### Paso 2: Instalar Heroku CLI

```bash
# Windows
choco install heroku-cli

# Mac
brew install heroku/brew/heroku

# Linux
sudo snap install --classic heroku
```

### Paso 3: Login y crear app

```bash
# Iniciar sesión
heroku login

# Crear aplicación
heroku create tu-app-nombre

# Agregar MongoDB
heroku addons:create mongolab:sandbox
```

### Paso 4: Configurar variables de entorno

```bash
heroku config:set JWT_SECRET=tu-clave-secreta-super-segura
heroku config:set OPENWEATHER_API_KEY=tu-clave-api
heroku config:set NODE_ENV=production
```

### Paso 5: Deploy

```bash
# Inicializar git (si no está ya)
git init
git add .
git commit -m "Initial commit"

# Deploy a Heroku
git push heroku main

# Ver logs
heroku logs --tail
```

### Paso 6: Verificar estatus

```bash
heroku open
```

---

## 🎯 Opción 2: Despliegue en Render

### Ventajas:
- ✅ Hosting gratuito
- ✅ Actualizaciones automáticas
- ✅ SSL incluido
- ✅ Base de datos PostgreSQL

### Paso 1: Preparar código

```bash
# Asegurar que package.json tiene todos los scripts
# En package.json
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}
```

### Paso 2: Deploy

1. Ir a [render.com](https://render.com)
2. Conectar conta de GitHub
3. Hacer clic en "New +" → "Web Service"
4. Seleccionar el repositorio
5. Configurar:
   - **Name:** tu-app-nombre
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Paso 3: Variables de entorno

En Render, ir a "Environment":
```
MONGODB_URI=tu-uri
JWT_SECRET=tu-clave
OPENWEATHER_API_KEY=tu-clave
NODE_ENV=production
```

### Paso 4: Deploy

El deploy es automático cuando haces push a main.

---

## ☁️ Opción 3: AWS EC2

### Paso 1: Crear instancia EC2

1. Ir a AWS Console
2. EC2 → Launch Instance
3. Seleccionar: Ubuntu Server LTS
4. Instancia type: t2.micro (gratuita)
5. Configurar grupo de seguridad:
   - Inbound: Puerto 3000, SSH (22), HTTP (80), HTTPS (443)

### Paso 2: Conectarse a la instancia

```bash
# Conectar por SSH
ssh -i tu-clave.pem ec2-user@tu-ip-publica

# O usar Instance Connect
# Click derecho → Connect
```

### Paso 3: Instalar dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
sudo apt install -y mongodb

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

### Paso 4: Deploy de la aplicación

```bash
# Clonar repositorio
git clone tu-repositorio.git
cd proyecto-final

# Instalar dependencias
npm install

# Crear archivo .env
nano .env
# (Agregar variables de entorno)

# Iniciar con PM2
pm2 start server.js --name "app-tareas"

# Hacer que PM2 inicie al reiniciar
pm2 startup
pm2 save
```

### Paso 5: Configurar Nginx como proxy

```bash
# Instalar Nginx
sudo apt install -y nginx

# Editar configuración
sudo nano /etc/nginx/sites-available/default

# Agregar este bloque dentro de server { }
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 6: SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renew
sudo systemctl enable certbot.timer
```

---

## 💧 Opción 4: DigitalOcean Droplet

### Paso 1: Crear Droplet

1. Ir a DigitalOcean
2. Create → Droplet
3. OS: Ubuntu 22.04 LTS
4. Plan: Basic ($4-6/mes)
5. Región: Cercana a usuarios
6. SSH key: Agregar tu clave pública

### Paso 2: Conexión SSH

```bash
ssh root@tu-ip-droplet
```

### Paso 3: Setup inicial

```bash
# Crear usuario no-root
adduser deployer
usermod -aG sudo deployer
su - deployer

# Instalar Node.js y npm
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar MongoDB
sudo apt install -y mongodb

# Instalar Nginx
sudo apt install -y nginx
```

### Paso 4: Deploy con Git

```bash
# Crear directorio para la app
mkdir -p ~/apps/proyecto-tareas
cd ~/apps/proyecto-tareas

# Inicializar repo git bare
git init --bare repo.git
cd repo.git/hooks

# Crear script de deploy (post-receive)
cat > post-receive << 'EOF'
#!/bin/bash
GIT_WORK_TREE=/home/deployer/apps/proyecto-tareas/app git checkout -f
cd /home/deployer/apps/proyecto-tareas/app
npm install --production
pm2 restart app-tareas
EOF

chmod +x post-receive

# Agregar remote en tu máquina local
git remote add production deployer@tu-ip:/home/deployer/apps/proyecto-tareas/repo.git

# Deploy
git push production main
```

### Paso 5: Configurare Nginx

```bash
sudo nano /etc/nginx/sites-available/default

# Agregar configuración similar a AWS
sudo systemctl restart nginx
```

---

## 🐳 Despliegue con Docker

### Paso 1: Crear imagen Docker

```bash
# El Dockerfile ya existe, construir imagen
docker build -t tu-app:1.0 .

# Ejecutar localmente
docker run -p 3000:3000 -e MONGODB_URI=... tu-app:1.0
```

### Paso 2: Push a Docker Hub

```bash
# Login
docker login

# Tag imagen
docker tag tu-app:1.0 tu-usuario/tu-app:1.0

# Push
docker push tu-usuario/tu-app:1.0
```

### Paso 3: Deploy en servidor

```bash
# En el servidor
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  tu-usuario/tu-app:1.0
```

---

## ✅ Checklist pre-Despliegue

- ✓ Archivo .env creado con todas las variables
- ✓ Base de datos configurada en la nube
- ✓ node_modules está en .gitignore
- ✓ Script "start" configurado en package.json
- ✓ Middleware de errores activo
- ✓ CORS configurado para dominio correcto
- ✓ SSL/HTTPS habilitado
- ✓ Variables de entorno sensibles NO en código
- ✓ Pruebas ejecutadas localmente
- ✓ Database backups configurados

---

## 🔍 Monitoreo post-Despliegue

### Monitoreo de Logs

```bash
# Heroku
heroku logs --tail

# AWS/DigitalOcean
sudo tail -f /var/log/nginx/access.log
pm2 logs

# Docker
docker logs container-id
```

### Verificar Salud de la API

```bash
# Test de conectividad
curl https://tu-app.com/api/auth/login

# Verificar SSL
curl -vI https://tu-app.com

# Monitorear uptime
# Usar Uptime Robot (monitoreo gratuito)
```

### Configurar Alertas

1. CloudWatch (AWS)
2. New Relic
3. Sentry (para errores)
4. LogRocket (frontend)

---

## 🚨 Troubleshooting

### Problema: App se bloquea después de deploy
```bash
# Revisar logs
pm2 logs

# Reiniciar proceso
pm2 restart all
pm2 stop all && pm2 start server.js
```

### Problema: Base de datos no conecta
```bash
# Verificar URI
echo $MONGODB_URI

# Verificar acceso
mongo --uri $MONGODB_URI

# Whitelist IPs en MongoDB Atlas
# Dashboard → Network Access
```

### Problema: 502 Bad Gateway
- ✓ Verificar que la app está escuchando correctamente
- ✓ Revisar que puerto no está bloqueado
- ✓ Reiniciar Nginx/Apache
- ✓ Ver logs de la aplicación

### Problema: CORS errors
```bash
# Verificar origen en dotenv
# .env
FRONTEND_URL=https://tu-frontend.com

# Backend
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
```

---

## 📊 Comparativa de Plataformas

| Plataforma | Costo | Facilidad | Escalabilidad | SSL Gratis |
|-----------|-------|----------|---------------|-----------|
| Heroku | $7+/mes | Muy fácil | Buena | ✅ |
| Render | Gratis | Fácil | Buena | ✅ |
| AWS EC2 | €0.008/hora | Media | Excelente | ⚠️ |
| DigitalOcean | $4+/mes | Media | Buena | ✅ |

---

## 🎓 Recomendaciones

**Para desarrollo:** Render (gratuito)
**Para producción pequeña:** DigitalOcean ($4-6/mes)
**Para producción grande:** AWS (escalable)
**Para simpleza:** Heroku (pero más caro)
