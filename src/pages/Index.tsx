import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { MainContent } from "@/components/Layout/MainContent";
import { StatusBar } from "@/components/Layout/StatusBar";
import { ServerDialog } from "@/components/ServerDialog";
import { useToast } from "@/hooks/use-toast";
import { Server, Stats } from "@/types/server";
import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data
const mockStats = {
  online: 3,
  vulnerabilities: 12,
  critical: 4,
  patches: 15,
};

const mockServers = [
  { id: "1", name: "Web Server 01", ip: "192.168.1.10", status: "online" as const, vulnerabilities: 3 },
  { id: "2", name: "Database 01", ip: "192.168.1.20", status: "online" as const, vulnerabilities: 5 },
  { id: "3", name: "Mail Server", ip: "192.168.1.30", status: "online" as const, vulnerabilities: 2 },
  { id: "4", name: "Backup Server", ip: "192.168.1.40", status: "offline" as const, vulnerabilities: 2 },
];

const reportTemplates = {
  overview: `VANACI AUDIT - SECURITY OVERVIEW REPORT
=====================================

Scan Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

INFRASTRUCTURE STATUS
--------------------
Total Servers: 4
Online: 3
Offline: 1

SECURITY SUMMARY
---------------
Total Vulnerabilities Found: 12
Critical: 4
High: 5
Medium: 2
Low: 1

COMPLIANCE STATUS
----------------
ISO 27001: COMPLIANT
PCI DSS: REQUIRES ATTENTION
GDPR: COMPLIANT

RECOMMENDATIONS
--------------
1. Immediate patching required for critical vulnerabilities
2. Review firewall rules on Web Server 01
3. Update SSL certificates expiring within 30 days
4. Enable multi-factor authentication on all admin accounts

Next scheduled scan: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,

  vulnerabilities: `VULNERABILITY ASSESSMENT REPORT
==============================

CRITICAL VULNERABILITIES (4)
---------------------------
[CVE-2024-1234] Web Server 01 - Apache 2.4.x Remote Code Execution
  CVSS Score: 9.8
  Status: OPEN
  Recommendation: Update to Apache 2.4.58 immediately

[CVE-2024-5678] Database 01 - SQL Injection in Login Form
  CVSS Score: 9.1
  Status: OPEN
  Recommendation: Apply security patch DB-2024-001

[CVE-2024-9012] Mail Server - Privilege Escalation
  CVSS Score: 8.8
  Status: IN PROGRESS
  Recommendation: Update mail server software

[CVE-2024-3456] Web Server 01 - XSS Vulnerability
  CVSS Score: 8.2
  Status: OPEN
  Recommendation: Input validation implementation required

HIGH SEVERITY (5)
----------------
[Additional vulnerabilities listed...]

REMEDIATION TIMELINE
-------------------
Critical: 24-48 hours
High: 7 days
Medium: 30 days
Low: 90 days`,

  compliance: `COMPLIANCE AUDIT REPORT
======================

ISO 27001:2022
-------------
Status: ✓ COMPLIANT
Last Audit: ${new Date().toLocaleDateString()}
Next Review: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Controls Implemented:
✓ Access Control (A.9)
✓ Cryptography (A.10)
✓ Physical Security (A.11)
✓ Operations Security (A.12)
⚠ Communications Security (A.13) - Partial

PCI DSS 4.0
----------
Status: ⚠ REQUIRES ATTENTION
Last Assessment: ${new Date().toLocaleDateString()}

Requirements:
✓ Install and maintain firewall
✓ Encrypt transmission of cardholder data
✗ Restrict physical access to cardholder data
⚠ Monitor and test networks regularly

GDPR
----
Status: ✓ COMPLIANT
DPO: compliance@vanaciprime.com

Data Protection Measures:
✓ Data encryption at rest and in transit
✓ Access logging and monitoring
✓ Regular security assessments
✓ Incident response procedures`,

  ports: `OPEN PORTS SCAN REPORT
=====================

WEB SERVER 01 (192.168.1.10)
---------------------------
PORT    STATE   SERVICE     VERSION
22/tcp  open    ssh         OpenSSH 8.9
80/tcp  open    http        Apache 2.4.54
443/tcp open    https       Apache 2.4.54
3306/tcp open   mysql       MySQL 8.0.32

DATABASE 01 (192.168.1.20)
-------------------------
PORT     STATE   SERVICE     VERSION
22/tcp   open    ssh         OpenSSH 8.9
3306/tcp open    mysql       MySQL 8.0.32
33060/tcp open   mysqlx      MySQL 8.0.32

MAIL SERVER (192.168.1.30)
-------------------------
PORT    STATE   SERVICE     VERSION
22/tcp  open    ssh         OpenSSH 8.9
25/tcp  open    smtp        Postfix
110/tcp open    pop3        Dovecot
143/tcp open    imap        Dovecot
587/tcp open    smtp        Postfix
993/tcp open    imaps       Dovecot

SECURITY RECOMMENDATIONS
-----------------------
• Close unnecessary ports
• Update SSH to latest version
• Enable fail2ban on all servers
• Implement port knocking for SSH`,

  patches: `PATCH MANAGEMENT REPORT
======================

PENDING PATCHES (15)
-------------------

CRITICAL (4)
-----------
[PATCH-2024-001] Apache Security Update
  Affected: Web Server 01
  Release Date: ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
  Status: PENDING APPROVAL

[PATCH-2024-002] MySQL Security Update
  Affected: Database 01
  Release Date: ${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
  Status: SCHEDULED

[PATCH-2024-003] OpenSSH Update
  Affected: All Servers
  Release Date: ${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
  Status: TESTING

[PATCH-2024-004] Kernel Security Update
  Affected: All Servers
  Release Date: ${new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}
  Status: PENDING APPROVAL

IMPORTANT (6)
------------
[Additional patches...]

MODERATE (5)
-----------
[Additional patches...]

PATCH SCHEDULE
-------------
Tonight (Maintenance Window): 3 patches
This Weekend: 7 patches
Next Month: 5 patches`,

  logs: `SECURITY EVENT LOG
=================

${new Date().toLocaleDateString()} - Recent Events
-------------------------------------------

[${new Date().toLocaleTimeString()}] INFO - System scan completed
[${new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString()}] WARNING - Failed login attempt from 203.0.113.42
[${new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString()}] INFO - Firewall rule updated on Web Server 01
[${new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString()}] CRITICAL - Vulnerability detected: CVE-2024-1234
[${new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString()}] INFO - Backup completed successfully
[${new Date(Date.now() - 1000 * 60 * 60).toLocaleTimeString()}] WARNING - High CPU usage on Database 01
[${new Date(Date.now() - 1000 * 60 * 90).toLocaleTimeString()}] INFO - SSL certificate renewed
[${new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString()}] ERROR - Connection timeout to Backup Server
[${new Date(Date.now() - 1000 * 60 * 150).toLocaleTimeString()}] INFO - Security patch applied to Mail Server

AUTHENTICATION LOG
-----------------
Total login attempts: 847
Successful: 843
Failed: 4
Blocked IPs: 1

INTRUSION DETECTION
------------------
Suspicious activities detected: 2
Blocked: 2
Under investigation: 0

NETWORK ACTIVITY
---------------
Inbound connections: 15,234
Outbound connections: 8,901
Blocked connections: 42`,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("Ready");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  
  // Estado para servidores e stats da API
  const [servers, setServers] = useState<Server[]>([]);
  const [stats, setStats] = useState<Stats>({ online: 0, vulnerabilities: 0, critical: 0, patches: 0 });
  const [loading, setLoading] = useState(true);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [serversData, statsData] = await Promise.all([
        apiClient.getServers(),
        apiClient.getStats()
      ]);
      setServers(serversData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddServer = async (serverData: Omit<Server, "id">) => {
    try {
      await apiClient.createServer({
        name: serverData.name,
        ip: serverData.ip,
        status: serverData.status,
        vulnerabilities: serverData.vulnerabilities,
        critical: serverData.critical || 0,
      });
      
      toast({
        title: "Servidor Adicionado",
        description: `${serverData.name} foi adicionado com sucesso!`,
      });
      
      // Recarregar dados
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao adicionar servidor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = (action: string) => {
    const messages = {
      info: "User Information:\n\nName: Administrator\nEmail: admin@vanaciprime.com\nRole: System Administrator",
      password: "Password change functionality coming soon!",
      logout: "Logging out...",
    };
    toast({
      title: action === "info" ? "User Information" : action === "password" ? "Change Password" : "Logout",
      description: messages[action as keyof typeof messages],
    });
  };

  const handleToolSelect = (tool: string) => {
    const tools = {
      nmap: "Nmap - Network scanning tool initialized",
      nessus: "Nessus - Vulnerability scanner ready",
      zabbix: "Zabbix - Monitoring solution active",
    };
    toast({
      title: "Tool Selected",
      description: tools[tool as keyof typeof tools],
    });
  };

  const handleStartScan = () => {
    setStatus("Scanning...");
    toast({
      title: "Security Scan Started",
      description: "Running comprehensive security audit...",
    });
    setTimeout(() => {
      setStatus("Scan completed");
      toast({
        title: "Scan Complete",
        description: "Security audit finished successfully!",
      });
    }, 3000);
  };

  const handleServerClick = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    toast({
      title: "Servidor Selecionado",
      description: `A visualizar detalhes de ${server?.name}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onUserAction={handleUserAction}
        onToolSelect={handleToolSelect}
        onStartScan={handleStartScan}
      />
      
      <div className="flex-1 flex">
        <Sidebar
          stats={stats}
          servers={servers}
          onServerClick={handleServerClick}
          onAddServer={() => setShowAddDialog(true)}
        />
        
        <MainContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reportContent={reportTemplates[activeTab as keyof typeof reportTemplates]}
          onRefresh={() => {
            toast({ title: "Atualizado", description: "Dados atualizados com sucesso" });
          }}
          onExport={() => {
            toast({ title: "Exportar", description: "Relatório exportado com sucesso" });
          }}
          onPrint={() => {
            toast({ title: "Imprimir", description: "A abrir diálogo de impressão..." });
          }}
        />
      </div>
      
      <StatusBar
        status={status}
        onAboutClick={() => {
          toast({
            title: "Vanaci Audit v1.0.0",
            description: "Plataforma de auditoria de segurança premium by VanaciPrime",
          });
        }}
      />
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Servidor</DialogTitle>
          </DialogHeader>
          <ServerDialog onAddServer={handleAddServer} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
