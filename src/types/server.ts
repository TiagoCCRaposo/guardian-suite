export interface Server {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline";
  vulnerabilities: number;
  critical?: number;
  ports?: Port[];
  patches?: Patch[];
  logs?: LogEntry[];
}

export interface Port {
  port: number;
  state: "open" | "closed" | "filtered";
  service: string;
  version?: string;
}

export interface Patch {
  id: string;
  name: string;
  severity: "critical" | "important" | "moderate" | "low";
  releaseDate: string;
  status: "pending" | "scheduled" | "testing" | "applied";
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
}

export interface Stats {
  online: number;
  vulnerabilities: number;
  critical: number;
  patches: number;
}
