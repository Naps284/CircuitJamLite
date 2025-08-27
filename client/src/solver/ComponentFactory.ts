import { BaseComp } from '@/types/Circuit';
import { uid, mkPort } from '@/utils/CircuitUtils';

export function Resistor(x: number, y: number, R = 1000, rot: 0 | 90 | 180 | 270 = 0): BaseComp {
  const id = uid('R');
  return {
    id,
    kind: 'resistor',
    x,
    y,
    rot,
    params: { R },
    ports: [mkPort(id, 'p', -1, 0, uid('N')), mkPort(id, 'n', 1, 0, uid('N'))],
  };
}

export function Capacitor(x: number, y: number, C = 1e-3, rot: 0 | 90 | 180 | 270 = 0): BaseComp {
  const id = uid('C');
  return {
    id,
    kind: 'capacitor',
    x,
    y,
    rot,
    params: { C },
    state: { vprev: 0 },
    ports: [mkPort(id, 'p', -1, 0, uid('N')), mkPort(id, 'n', 1, 0, uid('N'))],
  };
}

export function VSource(x: number, y: number, V = 5, rot: 0 | 90 | 180 | 270 = 0): BaseComp {
  const id = uid('VS');
  return {
    id,
    kind: 'vsource',
    x,
    y,
    rot,
    params: { V },
    ports: [mkPort(id, '+', -1, 0, uid('N')), mkPort(id, '-', 1, 0, uid('N'))],
  };
}

export function ISource(x: number, y: number, I = 0.01, rot: 0 | 90 | 180 | 270 = 0): BaseComp {
  const id = uid('IS');
  return {
    id,
    kind: 'isource',
    x,
    y,
    rot,
    params: { I },
    ports: [mkPort(id, 'p', -1, 0, uid('N')), mkPort(id, 'n', 1, 0, uid('N'))],
  };
}

export function Ground(x: number, y: number): BaseComp {
  const id = uid('G');
  return {
    id,
    kind: 'ground',
    x,
    y,
    rot: 0,
    ports: [mkPort(id, 'g', 0, 0, 'GND')],
  };
}

export function Lamp(x: number, y: number, R = 100, rot: 0 | 90 | 180 | 270 = 0): BaseComp {
  const id = uid('L');
  return {
    id,
    kind: 'lamp',
    x,
    y,
    rot,
    params: { R },
    state: { power: 0 },
    ports: [mkPort(id, 'p', -1, 0, uid('N')), mkPort(id, 'n', 1, 0, uid('N'))],
  };
}

export function Voltmeter(kind: 'probeA' | 'probeB', x: number, y: number): BaseComp {
  const id = uid(kind.toUpperCase());
  return {
    id,
    kind,
    x,
    y,
    rot: 0,
    params: {},
    ports: [mkPort(id, '+', -0.7, 0, uid('N')), mkPort(id, '-', 0.7, 0, uid('N'))],
    state: { value: 0 },
  };
}

export function Wire(x: number, y: number): BaseComp {
  const id = uid('W');
  return {
    id,
    kind: 'wire',
    x,
    y,
    rot: 0,
    ports: [mkPort(id, 'a', -1, 0, uid('N')), mkPort(id, 'b', 1, 0, uid('N'))],
  };
}
