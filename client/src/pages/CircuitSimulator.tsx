import { useEffect } from 'react';
import { useCircuitStore } from '@/store/CircuitStore';
import { Levels } from '@/levels/LevelDefinitions';
import { TopNavigation } from '@/components/circuit/TopNavigation';
import { ComponentToolbox } from '@/components/circuit/ComponentToolbox';
import { CircuitCanvas } from '@/components/circuit/CircuitCanvas';
import { ComponentInspector } from '@/components/circuit/ComponentInspector';
import { GoalsPanel } from '@/components/circuit/GoalsPanel';

export default function CircuitSimulator() {
  const { 
    running, 
    comps,
    levelIdx,
    simulateStep,
    resetCircuit
  } = useCircuitStore();

  // Initialize with first level
  useEffect(() => {
    if (comps.length === 0) {
      resetCircuit(Levels[0].make());
    }
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!running) return;
    
    const interval = setInterval(() => {
      simulateStep();
    }, 50);
    
    return () => clearInterval(interval);
  }, [running, simulateStep]);

  // Simulate once when paused to keep values fresh
  useEffect(() => {
    if (!running) {
      simulateStep();
    }
  }, [running, simulateStep]);

  return (
    <div className="w-full h-screen grid grid-cols-[280px_1fr_320px] grid-rows-[64px_1fr_180px] gap-3 p-4">
      <TopNavigation />
      <ComponentToolbox />
      <CircuitCanvas />
      <ComponentInspector />
      <GoalsPanel />
    </div>
  );
}
