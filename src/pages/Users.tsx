import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Layout/Header';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  created_at: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'viewer' });
  const { isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar utilizadores',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createUser(newUser);
      toast({
        title: 'Utilizador Criado',
        description: `${newUser.name} foi adicionado com sucesso`,
      });
      setShowAddDialog(false);
      setNewUser({ email: '', password: '', name: '', role: 'viewer' });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Erro ao criar utilizador',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador?')) return;
    
    try {
      await apiClient.deleteUser(id);
      toast({
        title: 'Utilizador Eliminado',
        description: 'O utilizador foi removido com sucesso',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Erro ao eliminar utilizador',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'bg-destructive text-destructive-foreground';
    if (roles.includes('operator')) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onUserAction={() => {}}
        onToolSelect={() => {}}
        onStartScan={() => {}}
      />
      
      <div className="flex-1 p-8 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gestão de Utilizadores</h1>
                <p className="text-muted-foreground">Gerir utilizadores da plataforma</p>
              </div>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Utilizador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Utilizador</DialogTitle>
                  <DialogDescription>
                    Criar uma nova conta de utilizador
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Criar Utilizador</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Utilizadores Registados</CardTitle>
              <CardDescription>
                Total de {users.length} utilizador{users.length !== 1 ? 'es' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">A carregar...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>
                            {user.roles[0] === 'admin' ? 'Administrador' : user.roles[0] === 'operator' ? 'Operador' : 'Visualizador'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('pt-PT')}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Users;
