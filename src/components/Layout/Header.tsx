import { Bell, Settings, User, ChevronDown, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  onUserAction?: (action: string) => void;
  onToolSelect?: (tool: string) => void;
  onStartScan?: () => void;
}

export const Header = ({ onUserAction, onToolSelect, onStartScan }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card">
      {/* Top Bar */}
      <div className="bg-foreground px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Server className="h-3 w-3" />
            4 Servers
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Security Monitoring
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>User Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUserAction?.('info')}>
                <User className="mr-2 h-4 w-4" />
                Information
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUserAction?.('password')}>
                <Settings className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUserAction?.('logout')}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Vanaci Audit</h1>
          <p className="text-xs tracking-[0.2em] text-muted-foreground">VANACIPRIME</p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Dashboard <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Default</DropdownMenuItem>
              <DropdownMenuItem>Create New Dashboard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Tools <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Scan Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToolSelect?.('nmap')}>
                Nmap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToolSelect?.('nessus')}>
                Nessus
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToolSelect?.('zabbix')}>
                Zabbix
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onStartScan} className="bg-primary hover:bg-primary/90">
            Start Scan
          </Button>
        </div>
      </div>
    </header>
  );
};
