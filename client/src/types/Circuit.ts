export type ID = string;
export type NodeId = string;

export interface Port {
  id: ID;
  compId: ID;
  name: string;
  node: NodeId;
  xOff: number;
  yOff: number;
}

export type CompType =
  | 'resistor'
  | 'capacitor'
  | 'vsource'
  | 'isource'
  | 'ground'
  | 'wire'
  | 'lamp'
  | 'voltmeter'
  | 'probeA'
  | 'probeB';

export interface BaseComp {
  id: ID;
  kind: CompType;
  x: number;
  y: number;
  rot: 0 | 90 | 180 | 270;
  ports: Port[];
  params?: Record<string, number | string>;
  state?: Record<string, number>;
}

export interface CircuitState {
  comps: BaseComp[];
  selectedComp: ID | null;
  pendingPort: ID | null;
  running: boolean;
  dt: number;
}

export interface Goal {
  id: string;
  desc: string;
  check: (comps: BaseComp[]) => { ok: boolean; val?: number; target?: string };
}

export interface LevelDef {
  id: string;
  title: string;
  description?: string;
  make: () => BaseComp[];
  goals: Goal[];
}

export type Tool =
  | 'select'
  | 'wire'
  | 'resistor'
  | 'capacitor'
  | 'vsource'
  | 'isource'
  | 'lamp'
  | 'voltmeterA'
  | 'voltmeterB'
  | 'ground';

export interface SimulationResult {
  volt: Map<NodeId, number>;
  currents: Map<ID, number>;
}

export interface BuildResult {
  nodeIndex: Map<NodeId, number>;
  vsIndex: Map<ID, number>;
  A: number[][];
  z: number[];
}
