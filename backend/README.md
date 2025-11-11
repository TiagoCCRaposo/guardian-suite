# Vanaci Audit Backend

Backend self-hosted para o Vanaci Audit com Node.js, Express e PostgreSQL.

## Requisitos

- Node.js 18+ 
- PostgreSQL 14+
- Ubuntu 24.04 (ou similar)

## Instalação no Servidor Ubuntu

### 1. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Criar Base de Dados

```bash
sudo -u postgres psql

# No psql:
CREATE DATABASE vanaci_audit;
CREATE USER vanaci_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vanaci_audit TO vanaci_user;
\q
```

### 3. Configurar Backend

```bash
cd /home/user/vanaci-audit/backend
npm install

# Copiar e editar .env
cp .env.example .env
nano .env
```

Editar `.env`:
```
PORT=3000
DATABASE_URL=postgresql://vanaci_user:your_secure_password@localhost:5432/vanaci_audit
JWT_SECRET=generate-a-strong-random-secret-here
NODE_ENV=production
```

### 4. Setup da Base de Dados

```bash
npm run db:setup
```

Isto cria:
- Todas as tabelas necessárias
- Um utilizador admin (admin@vanaciprime.com / admin123)
- **IMPORTANTE: Muda a password do admin após primeiro login!**

### 5. Iniciar o Backend

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### 6. Configurar como Serviço (systemd)

Criar `/etc/systemd/system/vanaci-backend.service`:

```ini
[Unit]
Description=Vanaci Audit Backend
After=network.target postgresql.service

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/vanaci-audit/backend
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vanaci-backend
sudo systemctl start vanaci-backend
sudo systemctl status vanaci-backend
```

### 7. Configurar Nginx Reverse Proxy

Adicionar ao teu Nginx config:

```nginx
# Proxy para o backend API
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Reiniciar Nginx:
```bash
sudo systemctl restart nginx
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registar utilizador
- `POST /api/auth/login` - Login

### Servers
- `GET /api/servers` - Listar todos os servidores
- `GET /api/servers/:id` - Obter servidor específico
- `POST /api/servers` - Criar servidor
- `PUT /api/servers/:id` - Atualizar servidor
- `DELETE /api/servers/:id` - Eliminar servidor
- `GET /api/servers/stats/overview` - Estatísticas gerais

### Ports
- `GET /api/ports/server/:serverId` - Portas de um servidor
- `POST /api/ports` - Adicionar porta

### Patches
- `GET /api/patches/server/:serverId` - Patches de um servidor
- `POST /api/patches` - Adicionar patch
- `PATCH /api/patches/:id/status` - Atualizar status de patch

### Logs
- `GET /api/logs/server/:serverId` - Logs de um servidor
- `POST /api/logs` - Adicionar log

### Vulnerabilities
- `GET /api/vulnerabilities/server/:serverId` - Vulnerabilidades de um servidor
- `POST /api/vulnerabilities` - Adicionar vulnerabilidade

## Segurança

- Passwords são hashed com bcrypt
- JWT para autenticação
- Roles separados em tabela user_roles (admin, operator, viewer)
- Prepared statements (proteção SQL injection)
- CORS configurado
- Variáveis de ambiente para secrets

## Logs

Ver logs do serviço:
```bash
sudo journalctl -u vanaci-backend -f
```
