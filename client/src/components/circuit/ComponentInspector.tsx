import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCircuitStore } from '@/store/CircuitStore';
import { Settings, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import { BaseComp } from '@/types/Circuit';

function getComponentIcon(kind: string) {
  const iconMap: Record<string, React.ReactNode> = {
    resistor: <div className="w-4 h-2 border border-primary rounded-sm"></div>,
    capacitor: <div className="flex gap-1"><div className="w-0.5 h-4 bg-primary rounded-full"></div><div className="w-0.5 h-4 bg-primary rounded-full"></div></div>,
    vsource: <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-xs text-primary">V</div>,
    isource: <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-xs text-primary">I</div>,
    lamp: <div className="w-4 h-4 bg-amber-400 rounded-full"></div>,
    probeA: <div className="w-4 h-4 bg-probe-a rounded-full"></div>,
    probeB: <div className="w-4 h-4 bg-probe-b rounded-full"></div>,
    ground: <div className="flex flex-col items-center gap-0.5"><div className="w-3 h-0.5 bg-primary rounded-full"></div><div className="w-2 h-0.5 bg-primary rounded-full"></div></div>,
    wire: <div className="w-4 h-0.5 bg-primary rounded-full"></div>
  };
  return iconMap[kind] || <div className="w-4 h-4 bg-muted rounded"></div>;
}

function ParameterEditor({ comp, onUpdate }: { comp: BaseComp; onUpdate: (updates: Partial<BaseComp>) => void }) {
  const handleParamChange = (key: string, value: number) => {
    onUpdate({
      params: { ...comp.params, [key]: value }
    });
  };

  const stepValue = (key: string, direction: 1 | -1) => {
    const current = Number(comp.params?.[key] ?? 0);
    const steps: Record<string, number> = {
      R: 10,
      C: 1e-4,
      V: 0.1,
      I: 0.001
    };
    const step = steps[key] ?? 1;
    handleParamChange(key, current + (direction * step));
  };

  if (comp.kind === 'resistor' || comp.kind === 'lamp') {
    return (
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Resistance (Ω)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={Number(comp.params?.R ?? 0)}
            onChange={(e) => handleParamChange('R', parseFloat(e.target.value) || 0)}
            step="10"
            className="flex-1"
            data-testid="input-resistance"
          />
          <div className="flex flex-col">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('R', 1)}
              data-testid="button-resistance-up"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('R', -1)}
              data-testid="button-resistance-down"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Standard values: 100Ω, 470Ω, 1kΩ, 4.7kΩ, 10kΩ
        </div>
      </div>
    );
  }

  if (comp.kind === 'capacitor') {
    return (
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Capacitance (F)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={Number(comp.params?.C ?? 0)}
            onChange={(e) => handleParamChange('C', parseFloat(e.target.value) || 0)}
            step="0.0001"
            className="flex-1"
            data-testid="input-capacitance"
          />
          <div className="flex flex-col">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('C', 1)}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('C', -1)}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (comp.kind === 'vsource') {
    return (
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Voltage (V)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={Number(comp.params?.V ?? 0)}
            onChange={(e) => handleParamChange('V', parseFloat(e.target.value) || 0)}
            step="0.1"
            className="flex-1"
            data-testid="input-voltage"
          />
          <div className="flex flex-col">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('V', 1)}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('V', -1)}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (comp.kind === 'isource') {
    return (
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Current (A)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={Number(comp.params?.I ?? 0)}
            onChange={(e) => handleParamChange('I', parseFloat(e.target.value) || 0)}
            step="0.001"
            className="flex-1"
            data-testid="input-current"
          />
          <div className="flex flex-col">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('I', 1)}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6"
              onClick={() => stepValue('I', -1)}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function ComponentInspector() {
  const { 
    selectedComp, 
    comps, 
    updateComponent, 
    deleteComponent,
    setSelectedComp 
  } = useCircuitStore();

  const comp = selectedComp ? comps.find(c => c.id === selectedComp) : null;

  if (!comp) {
    return (
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Component Inspector</h2>
        </div>
        <div className="opacity-70 text-sm">
          Select a component to edit parameters. Click two ports to connect nets.
        </div>
      </Card>
    );
  }

  const handleUpdate = (updates: Partial<BaseComp>) => {
    updateComponent(comp.id, updates);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    handleUpdate({ [axis]: Math.round(value) });
  };

  const duplicateComponent = () => {
    // TODO: Implement component duplication
    console.log('Duplicate component:', comp.id);
  };

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Component Inspector</h2>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          {getComponentIcon(comp.kind)}
        </div>
        <div className="flex-1">
          <div className="font-medium text-foreground capitalize">
            {comp.kind === 'probeA' ? 'Probe A' : comp.kind === 'probeB' ? 'Probe B' : comp.kind}
          </div>
          <div className="text-sm text-muted-foreground" data-testid="text-component-id">
            {comp.id}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input
                type="number"
                value={comp.x}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                className="w-full"
                data-testid="input-position-x"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={comp.y}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                className="w-full"
                data-testid="input-position-y"
              />
            </div>
          </div>
        </div>
        
        <ParameterEditor comp={comp} onUpdate={handleUpdate} />
        
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Rotation</Label>
          <div className="flex gap-1">
            {[0, 90, 180, 270].map((angle) => (
              <Button
                key={angle}
                size="sm"
                variant={comp.rot === angle ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleUpdate({ rot: angle as any })}
                data-testid={`button-rotation-${angle}`}
              >
                {angle}°
              </Button>
            ))}
          </div>
        </div>
        
        {(comp.kind === 'probeA' || comp.kind === 'probeB') && (
          <div className="pt-3 border-t border-border">
            <Label className="text-sm font-medium text-foreground mb-2 block">Reading</Label>
            <div className="text-lg font-mono text-foreground" data-testid="text-probe-reading">
              {(comp.state?.value ?? 0).toFixed(3)} V
            </div>
          </div>
        )}
        
        {comp.kind === 'lamp' && (
          <div className="pt-3 border-t border-border">
            <Label className="text-sm font-medium text-foreground mb-2 block">Power</Label>
            <div className="text-lg font-mono text-foreground" data-testid="text-lamp-power">
              {(comp.state?.power ?? 0).toFixed(3)} W
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t border-border">
          <Label className="text-sm font-medium text-foreground mb-2 block">Connections</Label>
          <div className="space-y-2 text-sm">
            {comp.ports.map((port, index) => (
              <div key={port.id} className="flex justify-between items-center">
                <span className="text-muted-foreground">Port {port.name}:</span>
                <span className="font-mono text-xs bg-secondary px-2 py-1 rounded" data-testid={`text-port-${index}`}>
                  {port.node}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteComponent(comp.id)}
            data-testid="button-delete-component"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Component
          </Button>
          <Button
            variant="outline"
            onClick={duplicateComponent}
            data-testid="button-duplicate-component"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
