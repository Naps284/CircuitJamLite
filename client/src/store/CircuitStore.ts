import { create } from 'zustand';
import { BaseComp, Tool, ID, CircuitState } from '@/types/Circuit';
import { simulateStep } from '@/solver/MNASolver';
import { connectPorts, snap } from '@/utils/CircuitUtils';
import { 
  Resistor, 
  Capacitor, 
  VSource, 
  ISource, 
  Lamp, 
  Voltmeter, 
  Ground, 
  Wire 
} from '@/solver/ComponentFactory';

interface CircuitStore extends CircuitState {
  tool: Tool;
  levelIdx: number;
  
  // Actions
  setTool: (tool: Tool) => void;
  setSelectedComp: (id: ID | null) => void;
  setPendingPort: (id: ID | null) => void;
  setRunning: (running: boolean) => void;
  setDt: (dt: number) => void;
  setLevelIdx: (idx: number) => void;
  
  addComponent: (tool: Tool, x: number, y: number) => void;
  connectPorts: (pidA: ID, pidB: ID) => void;
  updateComponent: (id: ID, updates: Partial<BaseComp>) => void;
  deleteComponent: (id: ID) => void;
  rotateComponent: (id: ID) => void;
  
  simulateStep: () => void;
  resetCircuit: (comps: BaseComp[]) => void;
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  comps: [],
  selectedComp: null,
  pendingPort: null,
  running: true,
  dt: 0.02,
  tool: 'select',
  levelIdx: 0,

  setTool: (tool) => set({ tool }),
  setSelectedComp: (selectedComp) => set({ selectedComp }),
  setPendingPort: (pendingPort) => set({ pendingPort }),
  setRunning: (running) => set({ running }),
  setDt: (dt) => set({ dt }),
  setLevelIdx: (levelIdx) => set({ levelIdx }),

  addComponent: (tool, gx, gy) => {
    const x = snap(gx);
    const y = snap(gy);
    let component: BaseComp | null = null;

    switch (tool) {
      case 'resistor':
        component = Resistor(x, y);
        break;
      case 'capacitor':
        component = Capacitor(x, y);
        break;
      case 'vsource':
        component = VSource(x, y, 5);
        break;
      case 'isource':
        component = ISource(x, y, 0.01);
        break;
      case 'lamp':
        component = Lamp(x, y);
        break;
      case 'voltmeterA':
        component = Voltmeter('probeA', x, y);
        break;
      case 'voltmeterB':
        component = Voltmeter('probeB', x, y);
        break;
      case 'ground':
        component = Ground(x, y);
        break;
      case 'wire':
        component = Wire(x, y);
        break;
    }

    if (component) {
      set((state) => ({
        comps: [...state.comps, component!]
      }));
    }
  },

  connectPorts: (pidA, pidB) => {
    set((state) => ({
      comps: connectPorts(state.comps, pidA, pidB),
      pendingPort: null
    }));
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      comps: state.comps.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    }));
  },

  deleteComponent: (id) => {
    set((state) => ({
      comps: state.comps.filter((comp) => comp.id !== id),
      selectedComp: state.selectedComp === id ? null : state.selectedComp
    }));
  },

  rotateComponent: (id) => {
    set((state) => ({
      comps: state.comps.map((comp) =>
        comp.id === id
          ? { ...comp, rot: (((comp.rot + 90) as number) % 360) as any }
          : comp
      )
    }));
  },

  simulateStep: () => {
    const { comps, dt } = get();
    const updatedComps = comps.map((c) => ({ 
      ...c, 
      ports: c.ports.map((p) => ({ ...p })),
      state: { ...c.state }
    }));
    
    try {
      simulateStep(updatedComps, dt);
      set({ comps: updatedComps });
    } catch (error) {
      console.error('Simulation error:', error);
    }
  },

  resetCircuit: (comps) => {
    set({
      comps,
      selectedComp: null,
      pendingPort: null,
      running: true
    });
  }
}));
