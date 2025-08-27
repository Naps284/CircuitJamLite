import { BaseComp, Port, ID } from '@/types/Circuit';
import { rotate } from '@/utils/CircuitUtils';

interface CompSVGProps {
  c: BaseComp;
  onPortClick: (pid: ID) => void;
  selected: boolean;
}

export function CompSVG({ c, onPortClick, selected }: CompSVGProps) {
  const stroke = selected ? 'var(--selected-component)' : 'var(--port-connector)';
  const fill = selected ? 'hsla(200 98% 48% / 0.1)' : 'transparent';
  
  const body = (() => {
    switch (c.kind) {
      case 'resistor':
      case 'lamp':
        return (
          <rect 
            x={-12} 
            y={-6} 
            width={24} 
            height={12} 
            rx={3} 
            stroke={stroke} 
            fill={c.kind === 'lamp' && c.state?.power && c.state.power > 0.05 ? '#fde68a' : fill} 
            strokeWidth="2"
          />
        );
      case 'capacitor':
        return (
          <g stroke={stroke} strokeWidth="2">
            <line x1={-8} y1={-8} x2={-8} y2={8} />
            <line x1={8} y1={-8} x2={8} y2={8} />
          </g>
        );
      case 'vsource':
        return <circle r={10} stroke={stroke} fill={fill} strokeWidth="2" />;
      case 'isource':
        return <circle r={10} stroke={stroke} fill={fill} strokeWidth="2" />;
      case 'ground':
        return (
          <g stroke={stroke} strokeWidth="2">
            <line x1={-10} y1={0} x2={10} y2={0} />
            <line x1={-6} y1={4} x2={6} y2={4} />
            <line x1={-2} y1={8} x2={2} y2={8} />
          </g>
        );
      case 'probeA':
      case 'probeB':
        return (
          <rect 
            x={-12} 
            y={-10} 
            width={24} 
            height={20} 
            rx={3} 
            stroke={stroke} 
            fill={c.kind === 'probeA' ? 'var(--probe-a)' : 'var(--probe-b)'} 
            strokeWidth="2"
          />
        );
      case 'wire':
        return <line x1={-12} y1={0} x2={12} y2={0} stroke={stroke} strokeWidth="2" />;
      default:
        return null;
    }
  })();

  const rot = `rotate(${c.rot})`;
  
  return (
    <g transform={`translate(${c.x * 24}, ${c.y * 24}) ${rot}`}>
      {body}
      {/* Component label */}
      {(c.kind === 'resistor' || c.kind === 'capacitor' || c.kind === 'vsource' || c.kind === 'isource') && (
        <text 
          x="0" 
          y="4" 
          textAnchor="middle" 
          fontSize="8" 
          fill="var(--foreground)"
        >
          {c.kind === 'resistor' && `${c.params?.R}Ω`}
          {c.kind === 'capacitor' && `${c.params?.C}F`}
          {c.kind === 'vsource' && `${c.params?.V}V`}
          {c.kind === 'isource' && `${c.params?.I}A`}
        </text>
      )}
      {/* Probe labels */}
      {(c.kind === 'probeA' || c.kind === 'probeB') && (
        <text 
          x="0" 
          y="4" 
          textAnchor="middle" 
          fontSize="10" 
          fill="white" 
          fontWeight="600"
        >
          {c.kind === 'probeA' ? 'A' : 'B'}
        </text>
      )}
      {/* Port connectors */}
      {c.ports.map((p) => {
        const portPos = rotate(p.xOff * 24, p.yOff * 24, c.rot);
        return (
          <circle
            key={p.id}
            cx={portPos.x}
            cy={portPos.y}
            r={6}
            className="port-connector"
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(p.id);
            }}
            data-testid={`port-${p.id}`}
          />
        );
      })}
    </g>
  );
}
