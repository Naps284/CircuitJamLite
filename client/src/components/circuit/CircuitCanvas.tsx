import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCircuitStore } from '@/store/CircuitStore';
import { CompSVG } from './CompSVG';
import { GRID, rotate, portWorldPos } from '@/utils/CircuitUtils';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { BaseComp, NodeId } from '@/types/Circuit';

function ConnectionLines({ comps }: { comps: BaseComp[] }) {
  const byNode = new Map<NodeId, { x: number; y: number }[]>();
  
  // Collect port positions by node
  for (const c of comps) {
    for (const p of c.ports) {
      const pos = portWorldPos(c, p);
      if (!byNode.has(p.node)) byNode.set(p.node, []);
      byNode.get(p.node)!.push(pos);
    }
  }
  
  const elements: JSX.Element[] = [];
  
  // Manhattan routing for each net
  for (const [node, pts] of byNode.entries()) {
    if (node === 'GND' || pts.length < 2) continue;
    
    // Calculate hub position (center of ports)
    const hx = Math.round(pts.reduce((s, p) => s + p.x, 0) / pts.length / GRID) * GRID;
    const hy = Math.round(pts.reduce((s, p) => s + p.y, 0) / pts.length / GRID) * GRID;
    
    // Draw hub
    elements.push(
      <circle 
        key={`${node}:hub`} 
        cx={hx} 
        cy={hy} 
        r={3} 
        fill="var(--connection-line)" 
      />
    );
    
    // Connect each port to hub with L-shaped path
    pts.forEach((pt, idx) => {
      const path = `M ${pt.x} ${pt.y} L ${hx} ${pt.y} L ${hx} ${hy}`;
      elements.push(
        <path
          key={`${node}:seg:${idx}`}
          d={path}
          className="connection-line"
          data-net={node}
        />
      );
    });
  }
  
  return <g id="connections">{elements}</g>;
}

export function CircuitCanvas() {
  const canvasRef = useRef<SVGSVGElement>(null);
  const { 
    comps, 
    selectedComp, 
    pendingPort, 
    tool,
    setSelectedComp,
    setPendingPort,
    addComponent,
    connectPorts
  } = useCircuitStore();

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const gx = (e.clientX - rect.left) / GRID;
    const gy = (e.clientY - rect.top) / GRID;
    
    if (tool === 'select') {
      setSelectedComp(null);
      return;
    }
    
    addComponent(tool, gx, gy);
  };

  const handlePortClick = (pid: string) => {
    if (pendingPort === null) {
      setPendingPort(pid);
    } else if (pendingPort === pid) {
      setPendingPort(null);
    } else {
      connectPorts(pendingPort, pid);
    }
  };

  const handleComponentClick = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation();
    setSelectedComp(compId);
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4 mr-2" />
          Zoom In
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4 mr-2" />
          Zoom Out
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          data-testid="button-fit-view"
        >
          <Maximize className="w-4 h-4 mr-2" />
          Fit to View
        </Button>
      </div>
      
      <div className="circuit-canvas grid-pattern w-full h-full rounded-lg relative">
        <svg 
          ref={canvasRef}
          className="w-full h-full" 
          onClick={handleCanvasClick}
          data-testid="svg-circuit-canvas"
        >
          {/* Grid pattern background */}
          <defs>
            <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path 
                d={`M ${GRID} 0 L 0 0 0 ${GRID}`} 
                fill="none" 
                stroke="var(--grid-line)" 
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Connection wires */}
          <ConnectionLines comps={comps} />
          
          {/* Components */}
          <g id="components">
            {comps.map((comp) => (
              <g 
                key={comp.id} 
                onClick={(e) => handleComponentClick(e, comp.id)}
                style={{ cursor: 'pointer' }}
                data-testid={`component-${comp.id}`}
              >
                <CompSVG 
                  c={comp} 
                  onPortClick={handlePortClick} 
                  selected={selectedComp === comp.id} 
                />
              </g>
            ))}
          </g>
          
          {/* Ghost wire for pending connection */}
          {pendingPort && (
            <line
              x1="0" y1="0" x2="100" y2="100"
              className="ghost-wire"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>
    </Card>
  );
}
