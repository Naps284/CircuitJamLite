import { BaseComp, NodeId, ID, SimulationResult, BuildResult } from '@/types/Circuit';
import { listNodes } from '@/utils/CircuitUtils';

// Dense Gaussian elimination for small systems
function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  // augment
  for (let i = 0; i < n; i++) A[i] = A[i].concat(b[i]);
  // elimination
  for (let i = 0; i < n; i++) {
    // pivot
    let piv = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
    }
    if (Math.abs(A[piv][i]) < 1e-12) throw new Error('Singular matrix');
    if (piv !== i) [A[i], A[piv]] = [A[piv], A[i]];
    // normalize
    const div = A[i][i];
    for (let c = i; c < n + 1; c++) A[i][c] /= div;
    // eliminate
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = A[r][i];
      if (f === 0) continue;
      for (let c = i; c < n + 1; c++) A[r][c] -= f * A[i][c];
    }
  }
  return A.map((row) => row[n]);
}

function stampG(A: number[][], i: number | null, j: number | null, g: number) {
  if (i !== null) A[i][i] += g;
  if (j !== null) A[j][j] += g;
  if (i !== null && j !== null) {
    A[i][j] -= g;
    A[j][i] -= g;
  }
}

function addTo(b: number[], i: number | null, v: number) {
  if (i !== null) b[i] += v;
}

function idxOf(nodeIndex: Map<NodeId, number>, n: NodeId | undefined): number | null {
  if (!n || n === 'GND') return null;
  return nodeIndex.get(n) ?? null;
}

function buildMNA(comps: BaseComp[], dt: number): BuildResult {
  const nodes = listNodes(comps);
  const N = nodes.length;
  const vSources = comps.filter((c) => c.kind === 'vsource');
  const M = vSources.length;

  const size = N + M;
  const A: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const z: number[] = Array(size).fill(0);

  const nodeIndex = new Map<NodeId, number>();
  nodes.forEach((n, i) => nodeIndex.set(n, i));
  const vsIndex = new Map<ID, number>();
  vSources.forEach((vs, k) => vsIndex.set(vs.id, N + k));

  // Stamp elements
  for (const c of comps) {
    if (c.kind === 'resistor' || c.kind === 'lamp') {
      const R = Number(c.params?.R ?? 1000);
      const g = 1 / (R || 1e-9);
      const i = idxOf(nodeIndex, c.ports[0].node);
      const j = idxOf(nodeIndex, c.ports[1].node);
      stampG(A, i, j, g);
    } else if (c.kind === 'isource') {
      const I = Number(c.params?.I ?? 0);
      const i = idxOf(nodeIndex, c.ports[0].node);
      const j = idxOf(nodeIndex, c.ports[1].node);
      addTo(z, i, +I);
      addTo(z, j, -I);
    } else if (c.kind === 'capacitor') {
      const C = Number(c.params?.C ?? 1e-3);
      const i = idxOf(nodeIndex, c.ports[0].node);
      const j = idxOf(nodeIndex, c.ports[1].node);
      const Geq = C / dt;
      const vprev = Number(c.state?.vprev ?? 0);
      const Ieq = Geq * vprev;
      stampG(A, i, j, Geq);
      addTo(z, i, +Ieq);
      addTo(z, j, -Ieq);
    }
  }

  // Voltage sources
  let k = 0;
  for (const vs of vSources) {
    const row = N + k;
    const V = Number(vs.params?.V ?? 0);
    const i = idxOf(nodeIndex, vs.ports[0].node);
    const j = idxOf(nodeIndex, vs.ports[1].node);
    if (i !== null) A[i][row] += 1;
    if (j !== null) A[j][row] -= 1;
    if (i !== null) A[row][i] += 1;
    if (j !== null) A[row][j] -= 1;
    z[row] = V;
    k++;
  }

  return { nodeIndex, vsIndex, A, z };
}

export function simulateStep(comps: BaseComp[], dt: number): SimulationResult {
  const { nodeIndex, vsIndex, A, z } = buildMNA(comps, dt);
  let x: number[] = [];
  let singular = false;
  
  try {
    x = solveLinear(A, z);
  } catch (e) {
    singular = true;
  }

  const volt = new Map<NodeId, number>();
  Array.from(nodeIndex.entries()).forEach(([n, i]) => {
    volt.set(n, singular ? 0 : x[i]);
  });

  const currents = new Map<ID, number>();
  Array.from(vsIndex.entries()).forEach(([id, idx]) => {
    currents.set(id, singular ? 0 : x[idx]);
  });

  // Update component states
  if (!singular) {
    for (const c of comps) {
      if (c.kind === 'capacitor') {
        const vp = volt.get(c.ports[0].node) ?? 0;
        const vn = volt.get(c.ports[1].node) ?? 0;
        const v = vp - vn;
        c.state = { ...(c.state || {}), vprev: v };
      } else if (c.kind === 'lamp') {
        const R = Number(c.params?.R ?? 100);
        const vp = volt.get(c.ports[0].node) ?? 0;
        const vn = volt.get(c.ports[1].node) ?? 0;
        const v = vp - vn;
        const p = (v * v) / (R || 1e-9);
        c.state = { ...(c.state || {}), power: p };
      }
      if (c.kind === 'probeA' || c.kind === 'probeB') {
        const vp = volt.get(c.ports[0].node) ?? 0;
        const vn = volt.get(c.ports[1].node) ?? 0;
        const v = vp - vn;
        c.state = { ...(c.state || {}), value: v };
      }
    }
  }

  return { volt, currents };
}
