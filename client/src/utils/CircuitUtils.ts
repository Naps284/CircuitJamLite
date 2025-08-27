import { BaseComp, Port, NodeId, ID } from '@/types/Circuit';

export const GRID = 24;

export const snap = (v: number) => Math.round(v);

export const uid = (() => {
  let n = 0;
  return (p = 'id') => `${p}_${++n}`;
})();

export function rotate(x: number, y: number, rot: 0 | 90 | 180 | 270) {
  switch (rot) {
    case 0:
      return { x, y };
    case 90:
      return { x: -y, y: x };
    case 180:
      return { x: -x, y: -y };
    case 270:
      return { x: y, y: -x };
  }
}

export function portWorldPos(c: BaseComp, p: Port) {
  const rr = rotate(p.xOff, p.yOff, c.rot);
  return { x: (c.x + rr.x) * GRID, y: (c.y + rr.y) * GRID };
}

export function listNodes(comps: BaseComp[]): string[] {
  const set = new Set<NodeId>();
  for (const c of comps) {
    for (const p of c.ports) {
      if (p.node !== 'GND') set.add(p.node);
    }
  }
  return Array.from(set);
}

export function mkPort(compId: ID, name: string, xOff: number, yOff: number, node: NodeId): Port {
  return { id: uid('port'), compId, name, xOff, yOff, node };
}

export function connectPorts(comps: BaseComp[], pidA: ID, pidB: ID): BaseComp[] {
  const cp = comps.map((c) => ({ 
    ...c, 
    ports: c.ports.map((p) => ({ ...p })),
    state: { ...c.state }
  }));
  
  let pa: Port | undefined, pb: Port | undefined;
  for (const c of cp) {
    for (const p of c.ports) {
      if (p.id === pidA) pa = p;
      if (p.id === pidB) pb = p;
    }
  }
  
  if (!pa || !pb) return cp;
  
  const name = pa.node !== 'GND' ? pa.node : pb.node;
  const oldA = pa.node;
  const oldB = pb.node;
  
  for (const c of cp) {
    for (const p of c.ports) {
      if (p.node === oldA || p.node === oldB) p.node = name;
    }
  }
  
  // If either was GND, prefer 'GND'
  if (oldA === 'GND' || oldB === 'GND') {
    const gname = 'GND';
    for (const c of cp) {
      for (const p of c.ports) {
        if (p.node === name) p.node = gname;
      }
    }
  }
  
  return cp;
}

export function saveCircuitToLocalStorage(key: string, comps: BaseComp[]) {
  try {
    localStorage.setItem(key, JSON.stringify(comps));
  } catch (error) {
    console.error('Failed to save circuit:', error);
  }
}

export function loadCircuitFromLocalStorage(key: string): BaseComp[] | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load circuit:', error);
    return null;
  }
}
