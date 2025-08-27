import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCircuitStore } from '@/store/CircuitStore';
import { Levels } from '@/levels/LevelDefinitions';
import { CheckCircle, Circle, Info, ChevronRight } from 'lucide-react';

export function GoalsPanel() {
  const { comps, levelIdx, setLevelIdx, resetCircuit } = useCircuitStore();
  
  const level = Levels[levelIdx];
  const goals = level.goals.map((g) => g.check(comps));
  const allComplete = goals.every((g) => g.ok);
  
  const probeA = comps.find((c) => c.kind === 'probeA');
  const probeB = comps.find((c) => c.kind === 'probeB');
  const probeAValue = Number(probeA?.state?.value ?? 0);
  const probeBValue = Number(probeB?.state?.value ?? 0);

  const nextLevel = () => {
    if (levelIdx < Levels.length - 1) {
      const nextIdx = levelIdx + 1;
      setLevelIdx(nextIdx);
      resetCircuit(Levels[nextIdx].make());
    }
  };

  return (
    <Card className="col-span-3 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground" data-testid="text-level-title">
            {level.title}
          </h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            allComplete 
              ? 'bg-primary/20 text-primary' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {allComplete ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span data-testid="text-goals-progress">
              {goals.filter(g => g.ok).length} / {goals.length} Goals Complete
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Real-time probe readings */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <div className="w-3 h-3 bg-probe-a rounded-full"></div>
            <span className="text-sm font-medium text-probe-a">Probe A:</span>
            <span className="font-mono text-lg font-bold text-foreground" data-testid="text-probe-a-value">
              {probeAValue.toFixed(3)} V
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-probe-b/10 rounded-lg">
            <div className="w-3 h-3 bg-probe-b rounded-full"></div>
            <span className="text-sm font-medium text-probe-b">Probe B:</span>
            <span className="font-mono text-lg font-bold text-foreground" data-testid="text-probe-b-value">
              {probeBValue.toFixed(3)} V
            </span>
          </div>
        </div>
      </div>
      
      {/* Level description */}
      {level.description && (
        <p className="text-muted-foreground mb-4" data-testid="text-level-description">
          {level.description}
        </p>
      )}
      
      {/* Level objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {level.goals.map((goal, index) => {
          const result = goals[index];
          return (
            <div 
              key={goal.id} 
              className={`rounded-lg p-4 border transition-colors ${
                result.ok 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-secondary/50 border-border'
              }`}
              data-testid={`goal-${goal.id}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  result.ok ? 'bg-primary' : 'bg-muted'
                }`}>
                  {result.ok ? (
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium text-foreground">Goal {index + 1}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{goal.desc}</p>
              {'val' in result && typeof result.val === 'number' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className={`font-mono font-bold ${
                      result.ok ? 'text-primary' : 'text-foreground'
                    }`} data-testid={`goal-${goal.id}-current`}>
                      {result.val.toFixed(3)} {goal.id.includes('power') ? 'W' : 'V'}
                    </span>
                  </div>
                  {result.target && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-mono text-muted-foreground" data-testid={`goal-${goal.id}-target`}>
                        {result.target}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Level completion and next steps */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>
            {allComplete 
              ? "Great job! All goals completed. Ready for the next challenge?"
              : "Tip: Adjust component values to achieve the target measurements. Remember circuit laws!"
            }
          </span>
        </div>
        
        {allComplete && levelIdx < Levels.length - 1 && (
          <Button 
            onClick={nextLevel}
            className="flex items-center gap-2"
            data-testid="button-next-level"
          >
            <span>Next Level: {Levels[levelIdx + 1].title.split('(')[0].trim()}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        
        {levelIdx === Levels.length - 1 && allComplete && (
          <div className="text-primary font-medium">
            🎉 Congratulations! All levels completed!
          </div>
        )}
      </div>
    </Card>
  );
}
