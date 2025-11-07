import { Clock, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface StatusBarProps {
  status?: string;
  onAboutClick?: () => void;
}

export const StatusBar = ({ status = "Ready", onAboutClick }: StatusBarProps) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-foreground text-muted-foreground border-t border-border px-6 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse-slow" />
          <span>System Active</span>
        </div>
        <span>{status}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
        <button 
          onClick={onAboutClick}
          className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
        >
          <Info className="h-3 w-3" />
          <span>Version 1.0.0</span>
        </button>
      </div>
    </div>
  );
};
