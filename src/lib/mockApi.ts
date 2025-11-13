// Mock API for Demo Mode - Simulates all backend functionality

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
const mockServers = [
  {
    id: '1',
    name: 'web-server-01.vanaci.local',
    ip: '192.168.1.10',
    status: 'online',
    vulnerabilities: 8,
    critical: 2,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'db-server-01.vanaci.local',
    ip: '192.168.1.20',
    status: 'online',
    vulnerabilities: 12,
    critical: 4,
    created_at: '2024-01-20T14:20:00Z',
  },
  {
    id: '3',
    name: 'app-server-01.vanaci.local',
    ip: '192.168.1.30',
    status: 'warning',
    vulnerabilities: 5,
    critical: 1,
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    name: 'mail-server-01.vanaci.local',
    ip: '192.168.1.40',
    status: 'critical',
    vulnerabilities: 15,
    critical: 6,
    created_at: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    name: 'backup-server-01.vanaci.local',
    ip: '192.168.1.50',
    status: 'online',
    vulnerabilities: 3,
    critical: 0,
    created_at: '2024-02-15T11:00:00Z',
  },
];

const mockStats = {
  totalServers: 5,
  onlineServers: 3,
  totalVulnerabilities: 43,
  criticalVulnerabilities: 13,
};

const mockUsers = [
  {
    id: '1',
    email: 'admin@vanaciprime.com',
    name: 'Administrator',
    roles: ['admin'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'auditor@vanaciprime.com',
    name: 'Security Auditor',
    roles: ['auditor'],
    created_at: '2024-01-05T10:30:00Z',
  },
  {
    id: '3',
    email: 'viewer@vanaciprime.com',
    name: 'Viewer User',
    roles: ['viewer'],
    created_at: '2024-01-10T14:20:00Z',
  },
];

const mockPorts = [
  { id: '1', server_id: '1', port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
  { id: '2', server_id: '1', port: 80, state: 'open', service: 'http', version: 'Apache 2.4.41' },
  { id: '3', server_id: '1', port: 443, state: 'open', service: 'https', version: 'Apache 2.4.41' },
  { id: '4', server_id: '2', port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
  { id: '5', server_id: '2', port: 3306, state: 'open', service: 'mysql', version: 'MySQL 8.0.25' },
];

const mockPatches = [
  {
    id: '1',
    server_id: '1',
    name: 'CVE-2024-1234 - Apache Security Update',
    severity: 'critical',
    release_date: '2024-03-01',
    status: 'pending',
  },
  {
    id: '2',
    server_id: '1',
    name: 'CVE-2024-5678 - OpenSSL Update',
    severity: 'high',
    release_date: '2024-03-05',
    status: 'pending',
  },
  {
    id: '3',
    server_id: '2',
    name: 'CVE-2024-9012 - MySQL Critical Patch',
    severity: 'critical',
    release_date: '2024-02-28',
    status: 'installed',
  },
];

const mockLogs = [
  {
    id: '1',
    server_id: '1',
    level: 'error',
    message: 'Failed login attempt from 203.0.113.42',
    timestamp: '2024-03-10T15:30:00Z',
  },
  {
    id: '2',
    server_id: '1',
    level: 'warning',
    message: 'High CPU usage detected: 85%',
    timestamp: '2024-03-10T14:20:00Z',
  },
  {
    id: '3',
    server_id: '1',
    level: 'info',
    message: 'Backup completed successfully',
    timestamp: '2024-03-10T13:00:00Z',
  },
  {
    id: '4',
    server_id: '2',
    level: 'error',
    message: 'Database connection timeout',
    timestamp: '2024-03-10T12:45:00Z',
  },
];

const mockVulnerabilities = [
  {
    id: '1',
    server_id: '1',
    title: 'Apache HTTP Server Remote Code Execution',
    severity: 'critical',
    description: 'Remote attackers can execute arbitrary code via crafted HTTP requests',
    cve_id: 'CVE-2024-1234',
    discovered_at: '2024-03-01T10:00:00Z',
  },
  {
    id: '2',
    server_id: '1',
    title: 'OpenSSL Denial of Service',
    severity: 'high',
    description: 'DoS vulnerability in SSL/TLS implementation',
    cve_id: 'CVE-2024-5678',
    discovered_at: '2024-03-05T11:30:00Z',
  },
  {
    id: '3',
    server_id: '2',
    title: 'MySQL Authentication Bypass',
    severity: 'critical',
    description: 'Authentication can be bypassed under certain conditions',
    cve_id: 'CVE-2024-9012',
    discovered_at: '2024-02-28T09:15:00Z',
  },
  {
    id: '4',
    server_id: '4',
    title: 'Postfix Mail Server Vulnerability',
    severity: 'critical',
    description: 'Remote code execution in mail processing',
    cve_id: 'CVE-2024-3456',
    discovered_at: '2024-03-08T16:20:00Z',
  },
];

class MockApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('vanaci_demo_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('vanaci_demo_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('vanaci_demo_token');
  }

  // Auth
  async login(email: string, password: string) {
    await delay(500);
    const mockToken = 'demo_token_' + Date.now();
    this.setToken(mockToken);
    return {
      token: mockToken,
      user: mockUsers[0],
    };
  }

  async register(email: string, password: string, name: string) {
    await delay(500);
    return { message: 'User registered successfully (demo mode)' };
  }

  // Users
  async getUsers() {
    await delay(300);
    return mockUsers;
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }) {
    await delay(500);
    const newUser = {
      id: String(mockUsers.length + 1),
      email: userData.email,
      name: userData.name,
      roles: [userData.role],
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: any) {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return mockUsers[index];
    }
    throw new Error('User not found');
  }

  async deleteUser(id: string) {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return { message: 'User deleted successfully' };
    }
    throw new Error('User not found');
  }

  async getCurrentUser() {
    await delay(200);
    return mockUsers[0];
  }

  // Servers
  async getServers() {
    await delay(300);
    return mockServers;
  }

  async getServer(id: string) {
    await delay(300);
    const server = mockServers.find(s => s.id === id);
    if (!server) throw new Error('Server not found');
    return server;
  }

  async createServer(server: any) {
    await delay(500);
    const newServer = {
      id: String(mockServers.length + 1),
      ...server,
      created_at: new Date().toISOString(),
    };
    mockServers.push(newServer);
    return newServer;
  }

  async updateServer(id: string, updates: any) {
    await delay(500);
    const index = mockServers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockServers[index] = { ...mockServers[index], ...updates };
      return mockServers[index];
    }
    throw new Error('Server not found');
  }

  async deleteServer(id: string) {
    await delay(500);
    const index = mockServers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockServers.splice(index, 1);
      return { message: 'Server deleted successfully' };
    }
    throw new Error('Server not found');
  }

  async getStats() {
    await delay(300);
    return mockStats;
  }

  // Ports
  async getServerPorts(serverId: string) {
    await delay(300);
    return mockPorts.filter(p => p.server_id === serverId);
  }

  async createPort(port: any) {
    await delay(500);
    const newPort = {
      id: String(mockPorts.length + 1),
      ...port,
    };
    mockPorts.push(newPort);
    return newPort;
  }

  // Patches
  async getServerPatches(serverId: string) {
    await delay(300);
    return mockPatches.filter(p => p.server_id === serverId);
  }

  async createPatch(patch: any) {
    await delay(500);
    const newPatch = {
      id: String(mockPatches.length + 1),
      ...patch,
    };
    mockPatches.push(newPatch);
    return newPatch;
  }

  async updatePatchStatus(id: string, status: string) {
    await delay(500);
    const index = mockPatches.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPatches[index].status = status;
      return mockPatches[index];
    }
    throw new Error('Patch not found');
  }

  // Logs
  async getServerLogs(serverId: string, limit = 100) {
    await delay(300);
    return mockLogs.filter(l => l.server_id === serverId).slice(0, limit);
  }

  async createLog(log: any) {
    await delay(500);
    const newLog = {
      id: String(mockLogs.length + 1),
      ...log,
      timestamp: new Date().toISOString(),
    };
    mockLogs.push(newLog);
    return newLog;
  }

  // Vulnerabilities
  async getServerVulnerabilities(serverId: string) {
    await delay(300);
    return mockVulnerabilities.filter(v => v.server_id === serverId);
  }

  async createVulnerability(vuln: any) {
    await delay(500);
    const newVuln = {
      id: String(mockVulnerabilities.length + 1),
      ...vuln,
      discovered_at: new Date().toISOString(),
    };
    mockVulnerabilities.push(newVuln);
    return newVuln;
  }

  async deleteVulnerability(id: string) {
    await delay(500);
    const index = mockVulnerabilities.findIndex(v => v.id === id);
    if (index !== -1) {
      mockVulnerabilities.splice(index, 1);
      return { message: 'Vulnerability deleted successfully' };
    }
    throw new Error('Vulnerability not found');
  }

  // Reports
  async importReport(reportData: any, reportType?: string) {
    await delay(1000);
    return {
      message: 'Report imported successfully (demo mode)',
      serversCreated: 1,
      vulnerabilitiesFound: 3,
    };
  }
}

export const mockApiClient = new MockApiClient();
