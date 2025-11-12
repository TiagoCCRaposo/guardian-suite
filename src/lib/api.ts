const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('vanaci_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('vanaci_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('vanaci_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      throw new Error('Não autenticado');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<{ email: string; name: string; password: string; role: string }>) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  // Servers
  async getServers() {
    return this.request('/servers');
  }

  async getServer(id: string) {
    return this.request(`/servers/${id}`);
  }

  async createServer(server: {
    name: string;
    ip: string;
    status: string;
    vulnerabilities: number;
    critical: number;
  }) {
    return this.request('/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    });
  }

  async updateServer(id: string, updates: Partial<{
    name: string;
    ip: string;
    status: string;
    vulnerabilities: number;
    critical: number;
  }>) {
    return this.request(`/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteServer(id: string) {
    return this.request(`/servers/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats() {
    return this.request('/servers/stats/overview');
  }

  // Ports
  async getServerPorts(serverId: string) {
    return this.request(`/ports/server/${serverId}`);
  }

  async createPort(port: {
    server_id: string;
    port: number;
    state: string;
    service?: string;
    version?: string;
  }) {
    return this.request('/ports', {
      method: 'POST',
      body: JSON.stringify(port),
    });
  }

  // Patches
  async getServerPatches(serverId: string) {
    return this.request(`/patches/server/${serverId}`);
  }

  async createPatch(patch: {
    server_id: string;
    name: string;
    severity: string;
    release_date?: string;
    status?: string;
  }) {
    return this.request('/patches', {
      method: 'POST',
      body: JSON.stringify(patch),
    });
  }

  async updatePatchStatus(id: string, status: string) {
    return this.request(`/patches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Logs
  async getServerLogs(serverId: string, limit = 100) {
    return this.request(`/logs/server/${serverId}?limit=${limit}`);
  }

  async createLog(log: {
    server_id: string;
    level: string;
    message: string;
  }) {
    return this.request('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Vulnerabilities
  async getServerVulnerabilities(serverId: string) {
    return this.request(`/vulnerabilities/server/${serverId}`);
  }

  async createVulnerability(vuln: {
    server_id: string;
    title: string;
    severity: string;
    description?: string;
    cve_id?: string;
  }) {
    return this.request('/vulnerabilities', {
      method: 'POST',
      body: JSON.stringify(vuln),
    });
  }

  async deleteVulnerability(id: string) {
    return this.request(`/vulnerabilities/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async importReport(reportData: any, reportType?: string) {
    return this.request('/reports/import', {
      method: 'POST',
      body: JSON.stringify({ reportData, reportType }),
    });
  }
}

export const apiClient = new ApiClient();
