-- Vanaci Audit Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles
CREATE TYPE app_role AS ENUM ('admin', 'operator', 'viewer');

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  vulnerabilities INTEGER DEFAULT 0,
  critical INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ports table
CREATE TABLE IF NOT EXISTS ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
  port INTEGER NOT NULL,
  state VARCHAR(20) DEFAULT 'closed' CHECK (state IN ('open', 'closed', 'filtered')),
  service VARCHAR(255),
  version VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patches table
CREATE TABLE IF NOT EXISTS patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('critical', 'important', 'moderate', 'low')),
  release_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'testing', 'applied')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
  level VARCHAR(20) CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  description TEXT,
  cve_id VARCHAR(50),
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_ports_server ON ports(server_id);
CREATE INDEX IF NOT EXISTS idx_patches_server ON patches(server_id);
CREATE INDEX IF NOT EXISTS idx_logs_server ON logs(server_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_server ON vulnerabilities(server_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for servers table
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
