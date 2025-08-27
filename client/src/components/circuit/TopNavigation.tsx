import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCircuitStore } from '@/store/CircuitStore';
import { Levels } from '@/levels/LevelDefinitions';
import { Play, Pause, RotateCcw, RotateCw, Trash2, Zap } from 'lucide-react';

export function TopNavigation() {
  const { 
    running, 
    dt, 
    levelIdx, 
    selectedComp,
    comps,
    setRunning, 
    setDt, 
    setLevelIdx,
    rotateComponent,
    deleteComponent,
    resetCircuit
  } = useCircuitStore();

  const handleLevelChange = (value: string) => {
    const idx = parseInt(value);
    setLevelIdx(idx);
    resetCircuit(Levels[idx].make());
  };

  const handleRotate = () => {
    if (selectedComp) {
      rotateComponent(selectedComp);
    }
  };

  const handleDelete = () => {
    if (selectedComp) {
      deleteComponent(selectedComp);
    }
  };

  return (
    <header className="col-span-3 bg-card rounded-lg px-6 py-4 border border-border flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Circuit Jam Lite</h1>
          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
            MVP
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setRunning(!running)}
            className={`flex items-center gap-2 ${running ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'}`}
            data-testid="button-simulation-toggle"
          >
            <div className={`w-2 h-2 bg-current rounded-full ${running ? 'animate-pulse' : ''}`} />
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{running ? 'Pause' : 'Run'}</span>
          </Button>
          
          <Button 
            onClick={() => resetCircuit(Levels[levelIdx].make())}
            variant="secondary"
            className="flex items-center gap-2"
            data-testid="button-reset-level"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Level
          </Button>
          
          <div className="h-8 w-px bg-border"></div>
          
          <Button 
            onClick={handleRotate}
            variant="ghost"
            size="icon"
            disabled={!selectedComp}
            className="text-muted-foreground hover:text-foreground"
            title="Rotate Component"
            data-testid="button-rotate"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            disabled={!selectedComp}
            className="text-muted-foreground hover:text-destructive"
            title="Delete Component"
            data-testid="button-delete"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Speed:</label>
          <Slider
            value={[dt * 1000]}
            onValueChange={(value) => setDt(value[0] / 1000)}
            min={5}
            max={100}
            step={5}
            className="w-24"
            data-testid="slider-simulation-speed"
          />
          <span className="text-sm text-muted-foreground font-mono w-12">
            {Math.round(dt * 1000)}ms
          </span>
        </div>
        
        <div className="h-8 w-px bg-border"></div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Level:</label>
          <Select value={levelIdx.toString()} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-48" data-testid="select-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Levels.map((level, i) => (
                <SelectItem key={level.id} value={i.toString()}>
                  {i + 1}. {level.title.split('(')[0].trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
