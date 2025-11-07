import { FileText, RefreshCw, Download, Printer, Home, Bug, CheckCircle, Network, Wrench, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface MainContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  reportContent: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
}

const tabConfig = [
  { value: "overview", label: "Overview", icon: Home },
  { value: "vulnerabilities", label: "Vulnerabilities", icon: Bug },
  { value: "compliance", label: "Compliance", icon: CheckCircle },
  { value: "ports", label: "Ports", icon: Network },
  { value: "patches", label: "Patches", icon: Wrench },
  { value: "logs", label: "Logs", icon: List },
];

export const MainContent = ({
  activeTab,
  onTabChange,
  reportContent,
  onRefresh,
  onExport,
  onPrint,
}: MainContentProps) => {
  return (
    <main className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="bg-muted/30 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Audit Reports</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content */}
        <div className="flex-1 p-6">
          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 h-full">
              <Card className="p-6 h-full">
                <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto h-full">
                  {reportContent}
                </pre>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </main>
  );
};
