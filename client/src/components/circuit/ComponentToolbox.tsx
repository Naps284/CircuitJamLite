import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCircuitStore } from '@/store/CircuitStore';
import { Tool } from '@/types/Circuit';
import { 
  MousePointer2, 
  Minus, 
  Square, 
  Circle, 
  Lightbulb, 
  Zap,
  MoreHorizontal,
  Filter
} from 'lucide-react';

const TOOLBOX: { key: Tool; label: string; icon: React.ReactNode }[] = [
  { key: 'select', label: 'Select', icon: <MousePointer2 className="w-6 h-6" /> },
  { key: 'wire', label: 'Wire', icon: <Minus className="w-6 h-6" /> },
  { key: 'resistor', label: 'Resistor', icon: <Square className="w-6 h-6" /> },
  { key: 'capacitor', label: 'Capacitor', icon: <Filter className="w-6 h-6" /> },
  { key: 'vsource', label: 'Voltage Source', icon: <Circle className="w-6 h-6" /> },
  { key: 'isource', label: 'Current Source', icon: <Circle className="w-6 h-6" /> },
  { key: 'lamp', label: 'Lamp', icon: <Lightbulb className="w-6 h-6" /> },
  { key: 'ground', label: 'Ground', icon: <MoreHorizontal className="w-6 h-6" /> },
];

export function ComponentToolbox() {
  const { tool, setTool } = useCircuitStore();

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Component Toolbox</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {TOOLBOX.map((t) => (
          <Button
            key={t.key}
            onClick={() => setTool(t.key)}
            variant={tool === t.key ? "default" : "outline"}
            className="component-hover flex flex-col items-center gap-2 p-3 h-auto transition-all hover:scale-105"
            data-testid={`tool-${t.key}`}
          >
            <div className="text-primary group-hover:text-primary/80">
              {t.icon}
            </div>
            <span className="text-xs font-medium text-center">{t.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Measurement Probes</h3>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setTool('voltmeterA')}
            variant={tool === 'voltmeterA' ? "default" : "outline"}
            className="component-hover flex items-center gap-3 p-2 h-auto transition-all hover:scale-105 justify-start"
            data-testid="tool-probeA"
          >
            <div className="w-4 h-4 bg-probe-a rounded-full"></div>
            <span className="text-sm font-medium text-probe-a">Probe A (Blue)</span>
          </Button>
          <Button
            onClick={() => setTool('voltmeterB')}
            variant={tool === 'voltmeterB' ? "default" : "outline"}
            className="component-hover flex items-center gap-3 p-2 h-auto transition-all hover:scale-105 justify-start"
            data-testid="tool-probeB"
          >
            <div className="w-4 h-4 bg-probe-b rounded-full"></div>
            <span className="text-sm font-medium text-probe-b">Probe B (Green)</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
        <p><strong>Instructions:</strong></p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Click a tool, then click canvas to place</li>
          <li>Click two ports to connect them</li>
          <li>Select components to edit properties</li>
          <li>Use top controls to rotate/delete</li>
        </ul>
      </div>
    </Card>
  );
}
