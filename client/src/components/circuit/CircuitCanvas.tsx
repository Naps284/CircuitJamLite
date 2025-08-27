import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCircuitStore } from '@/store/CircuitStore';
import { CompSVG } from './CompSVG';
import { GRID, rotate, portWorldPos } from '@/utils/CircuitUtils';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { BaseComp, NodeId, Port } from '@/types/Circuit';

function ConnectionLines({ comps, hoveredNet, pendingPort }: { comps: BaseComp[]; hoveredNet: string | null; pendingPort: string | null }) {
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
  for (const [node, pts] of Array.from(byNode.entries())) {
    if (node === 'GND' || pts.length < 2) continue;
    
    // Calculate hub position (center of ports)
    const hx = Math.round(pts.reduce((s: number, p: { x: number; y: number }) => s + p.x, 0) / pts.length / GRID) * GRID;
    const hy = Math.round(pts.reduce((s: number, p: { x: number; y: number }) => s + p.y, 0) / pts.length / GRID) * GRID;
    
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
    pts.forEach((pt: { x: number; y: number }, idx: number) => {
      const path = `M ${pt.x} ${pt.y} L ${hx} ${pt.y} L ${hx} ${hy}`;
      elements.push(
        <path
          key={`${node}:seg:${idx}`}
          d={path}
          className={`connection-line ${hoveredNet === node ? 'net-highlighted' : ''}`}
          data-net={node}
        />
      );
    });
  }
  
  return <g id="connections">{elements}</g>;
}

export function CircuitCanvas() {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const { 
    comps, 
    selectedComp, 
    pendingPort, 
    tool,
    hoveredNet,
    setSelectedComp,
    setPendingPort,
    setHoveredNet,
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
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };
  
  const handleNetHover = (net: string | null) => {
    setHoveredNet(net);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+click
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    handleMouseMove(e);
  };
  
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev * 1.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2));
  const handleFitToView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4 mr-2" />
          Zoom In
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4 mr-2" />
          Zoom Out
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-secondary/80 hover:bg-secondary"
          onClick={handleFitToView}
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
          onMouseMove={handlePanMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}
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
          
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Connection wires */}
            <ConnectionLines comps={comps} hoveredNet={hoveredNet} pendingPort={pendingPort} />
            
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
                  pendingPort={pendingPort}
                  onNetHover={handleNetHover}
                />
              </g>
            ))}
            </g>
            
            {/* Ghost wire for pending connection */}
          {pendingPort && (() => {
            const port = comps.flatMap(c => c.ports).find(p => p.id === pendingPort);
            if (!port) return null;
            const comp = comps.find(c => c.id === port.compId);
            if (!comp) return null;
            const portPos = portWorldPos(comp, port);
            return (
              <line
                x1={portPos.x}
                y1={portPos.y}
                x2={mousePos.x}
                y2={mousePos.y}
                className="ghost-wire"
                pointerEvents="none"
              />
            );
          })()}
          </g>
        </svg>
      </div>
    </Card>
  );
}
