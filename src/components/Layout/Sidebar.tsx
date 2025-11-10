import { Server, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number | string;
  label: string;
  variant: "success" | "warning" | "destructive" | "primary";
}

const StatCard = ({ value, label, variant }: StatCardProps) => {
  const colorClasses = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    primary: "text-primary",
  };

  return (
    <Card className="p-3 text-center hover:shadow-md transition-shadow">
      <div className={cn("text-2xl font-bold mb-1", colorClasses[variant])}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
        {label}
      </div>
    </Card>
  );
};

interface ServerItemProps {
  name: string;
  ip: string;
  status: "online" | "offline";
  vulnerabilities: number;
  onClick?: () => void;
}

const ServerItem = ({ name, ip, status, vulnerabilities, onClick }: ServerItemProps) => {
  return (
    <Card 
      className={cn(
        "p-3 mb-2 cursor-pointer transition-all hover:shadow-md border-l-4",
        status === "online" ? "border-l-success" : "border-l-destructive"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === "online" ? "bg-success animate-pulse-slow" : "bg-destructive"
        )} />
        <span className="font-semibold text-sm">{name}</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{ip}</span>
        <span>{vulnerabilities} vulns</span>
      </div>
    </Card>
  );
};


interface SidebarProps {
  stats: {
    online: number;
    vulnerabilities: number;
    critical: number;
    patches: number;
  };
  servers: Array<{
    id: string;
    name: string;
    ip: string;
    status: "online" | "offline";
    vulnerabilities: number;
  }>;
  onServerClick?: (serverId: string) => void;
  onAddServer?: () => void;
}

export const Sidebar = ({ stats, servers, onServerClick, onAddServer }: SidebarProps) => {
  return (
    <aside className="w-64 border-r border-border bg-muted/30 p-4 space-y-6">
      {/* Statistics Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={stats.online} label="Online" variant="success" />
          <StatCard value={stats.vulnerabilities} label="Vulnerabilities" variant="destructive" />
          <StatCard value={stats.critical} label="Critical" variant="primary" />
          <StatCard value={stats.patches} label="Patches" variant="warning" />
        </div>
      </div>

      {/* Servers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monitored Servers
            </h3>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          {servers.map((server) => (
            <ServerItem
              key={server.id}
              name={server.name}
              ip={server.ip}
              status={server.status}
              vulnerabilities={server.vulnerabilities}
              onClick={() => onServerClick?.(server.id)}
            />
          ))}
        </div>
        {onAddServer && (
          <button
            onClick={onAddServer}
            className="w-full p-2 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Adicionar Servidor
          </button>
        )}
      </div>
    </aside>
  );
};
