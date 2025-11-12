import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Upload, FileJson, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImportReportDialogProps {
  onImportSuccess: () => void;
}

export const ImportReportDialog = ({ onImportSuccess }: ImportReportDialogProps) => {
  const [jsonData, setJsonData] = useState('');
  const [reportType, setReportType] = useState<string>('auto');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: 'Formato Inválido',
        description: 'Por favor, selecione um ficheiro JSON',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonData(content);
      toast({
        title: 'Ficheiro Carregado',
        description: `${file.name} carregado com sucesso`,
      });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: 'Dados Vazios',
        description: 'Por favor, insira ou carregue dados JSON',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.importReport(
        jsonData,
        reportType === 'auto' ? undefined : reportType
      );

      toast({
        title: 'Importação Concluída',
        description: `Tipo: ${response.reportType} | Servidores: ${response.results.servers} | Vulnerabilidades: ${response.results.vulnerabilities} | Portas: ${response.results.ports}`,
      });

      if (response.results.errors?.length > 0) {
        toast({
          title: 'Avisos de Importação',
          description: `${response.results.errors.length} aviso(s) durante a importação`,
          variant: 'default',
        });
      }

      setJsonData('');
      onImportSuccess();
    } catch (error) {
      toast({
        title: 'Erro na Importação',
        description: error instanceof Error ? error.message : 'Erro ao processar relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleJson = {
    servers: [
      {
        name: "Web Server 01",
        ip: "192.168.1.10",
        status: "online",
        critical: 2,
        high: 3,
        medium: 1,
        low: 0,
        vulnerabilities: [
          {
            title: "Apache RCE Vulnerability",
            description: "Remote code execution in Apache 2.4.x",
            severity: "critical",
            cve: "CVE-2024-1234",
            cvss: 9.8
          }
        ],
        ports: [
          {
            port: 80,
            protocol: "tcp",
            state: "open",
            service: "http",
            version: "Apache 2.4.54"
          },
          {
            port: 443,
            protocol: "tcp",
            state: "open",
            service: "https",
            version: "Apache 2.4.54"
          }
        ]
      }
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Importar Relatório JSON
        </CardTitle>
        <CardDescription>
          Importe relatórios de servidores Linux em formato JSON (Nmap, Nessus, Genérico)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-type">Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-Detetar</SelectItem>
              <SelectItem value="nmap">Nmap JSON</SelectItem>
              <SelectItem value="nessus">Nessus JSON</SelectItem>
              <SelectItem value="vulnerability">Vulnerability Report</SelectItem>
              <SelectItem value="generic">Genérico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Carregar Ficheiro</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Escolher Ficheiro JSON
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="json-data">Ou Cole o JSON Aqui</Label>
          <Textarea
            id="json-data"
            placeholder={`Exemplo:\n${JSON.stringify(exampleJson, null, 2)}`}
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="font-mono text-xs min-h-[300px]"
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
          <p className="font-semibold">Formatos Suportados:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Nmap:</strong> JSON com nmaprun/scaninfo/hosts</li>
            <li><strong>Nessus:</strong> JSON com Report/ReportHost</li>
            <li><strong>Vulnerability:</strong> JSON com array de vulnerabilities</li>
            <li><strong>Genérico:</strong> JSON com servers/hosts array</li>
          </ul>
        </div>

        <Button
          onClick={handleImport}
          disabled={loading || !jsonData.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A Importar...
            </>
          ) : (
            <>
              <FileJson className="h-4 w-4 mr-2" />
              Importar Relatório
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
