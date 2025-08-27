import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Levels } from '@/levels/LevelDefinitions';
import { useCircuitStore } from '@/store/CircuitStore';
import { useLocation } from 'wouter';
import { CheckCircle, Circle, Play, Zap } from 'lucide-react';

export default function LevelSelect() {
  const [, setLocation] = useLocation();
  const { setLevelIdx, resetCircuit } = useCircuitStore();

  const handleLevelSelect = (index: number) => {
    setLevelIdx(index);
    resetCircuit(Levels[index].make());
    setLocation('/simulator');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Circuit Jam Lite</h1>
            <p className="text-muted-foreground">Learn electronics through interactive circuit simulation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Levels.map((level, index) => (
            <Card 
              key={level.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleLevelSelect(index)}
              data-testid={`level-card-${index}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                      <Circle className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <Button size="sm" className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Start
                  </Button>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {level.title.split('(')[0].trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {level.description || 'Complete the circuit to achieve the target measurements.'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Goals:</span>
                    <span>{level.goals.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {level.goals.map((goal, i) => (
                      <div key={goal.id}>• {goal.desc}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Learning Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Fundamentals (Levels 1-4)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ohm's Law and basic calculations</li>
                  <li>• Voltage division in series circuits</li>
                  <li>• Current division in parallel circuits</li>
                  <li>• Capacitor charging and discharging</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Advanced Topics (Levels 5-12)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complex impedance calculations</li>
                  <li>• Kirchhoff's voltage and current laws</li>
                  <li>• Power calculations and efficiency</li>
                  <li>• Multi-component circuit analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
