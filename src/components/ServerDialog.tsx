import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Server } from "@/types/server";

interface ServerDialogProps {
  onAddServer: (server: Omit<Server, "id">) => void;
}

export const ServerDialog = ({ onAddServer }: ServerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    status: "online" as "online" | "offline",
    vulnerabilities: 0,
    critical: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddServer(formData);
    setFormData({
      name: "",
      ip: "",
      status: "online",
      vulnerabilities: 0,
      critical: 0,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Servidor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Servidor</DialogTitle>
            <DialogDescription>
              Adicione um servidor para monitorização de segurança.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Servidor</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Web Server 01"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ip">Endereço IP</Label>
              <Input
                id="ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="Ex: 192.168.1.10"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "online" | "offline") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vulnerabilities">Vulnerabilidades</Label>
              <Input
                id="vulnerabilities"
                type="number"
                value={formData.vulnerabilities}
                onChange={(e) =>
                  setFormData({ ...formData, vulnerabilities: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="critical">Críticas</Label>
              <Input
                id="critical"
                type="number"
                value={formData.critical}
                onChange={(e) =>
                  setFormData({ ...formData, critical: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
