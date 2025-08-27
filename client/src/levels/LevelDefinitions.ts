import { LevelDef, BaseComp, Goal } from '@/types/Circuit';
import { VSource, Resistor, Capacitor, Voltmeter, Ground, ISource, Lamp } from '@/solver/ComponentFactory';

function withGnd(...cs: BaseComp[]): BaseComp[] {
  return [...cs, Ground(4, 8)];
}

export const Levels: LevelDef[] = [
  {
    id: 'ohms-01',
    title: 'Voltage Divider (target: probe A ≈ 2 V, probe B ≈ 8 V)',
    description: 'Learn how voltage divides across resistors in series. Adjust resistor values to achieve the target voltages.',
    make: () => {
      const vs = VSource(2, 6, 10);
      const r1 = Resistor(6, 6, 1000);
      const r2 = Resistor(8, 6, 4000);
      const a = Voltmeter('probeA', 10, 4);
      const b = Voltmeter('probeB', 10, 8);
      const g = Ground(2, 8);
      
      // Connect the circuit
      vs.ports[0].node = r1.ports[0].node;
      r1.ports[1].node = r2.ports[0].node;
      r2.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      
      // Connect probes
      a.ports[0].node = r1.ports[1].node;
      a.ports[1].node = 'GND';
      b.ports[0].node = vs.ports[0].node;
      b.ports[1].node = 'GND';
      
      return [vs, r1, r2, a, b, g];
    },
    goals: [
      {
        id: 'A2',
        desc: 'Blue probe (A) ≈ 2.0 V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? NaN);
          return { ok: Math.abs(val - 2.0) < 0.15, val, target: '2.0 V ±0.15' };
        },
      },
      {
        id: 'B8',
        desc: 'Green probe (B) ≈ 8.0 V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeB');
          const val = Number(p?.state?.value ?? NaN);
          return { ok: Math.abs(val - 8.0) < 0.15, val, target: '8.0 V ±0.15' };
        },
      },
    ],
  },
  {
    id: 'cap-01',
    title: 'RC Charge (watch A climb toward 5 V)',
    description: 'Observe how a capacitor charges through a resistor over time.',
    make: () => {
      const vs = VSource(2, 6, 5);
      const r = Resistor(6, 6, 10000);
      const c = Capacitor(8, 6, 1e-3);
      const a = Voltmeter('probeA', 10, 6);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r.ports[0].node;
      r.ports[1].node = c.ports[0].node;
      c.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = c.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r, c, a, g];
    },
    goals: [
      {
        id: 'A_at_least_3V',
        desc: 'After a few seconds, A ≥ 3 V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: val >= 3, val, target: '≥ 3 V' };
        },
      },
    ],
  },
  {
    id: 'caps-series-01',
    title: 'Capacitors in Series (observe voltage split)',
    description: 'Learn how capacitors in series split voltage inversely proportional to their capacitance.',
    make: () => {
      const vs = VSource(2, 6, 10);
      const c1 = Capacitor(6, 6, 8e-3);
      const c2 = Capacitor(8, 6, 40e-3);
      const a = Voltmeter('probeA', 10, 5);
      const b = Voltmeter('probeB', 10, 7);
      const g = Ground(2, 8);
      
      vs.ports[0].node = c1.ports[0].node;
      c1.ports[1].node = c2.ports[0].node;
      c2.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = c1.ports[1].node;
      a.ports[1].node = 'GND';
      b.ports[0].node = c1.ports[0].node;
      b.ports[1].node = 'GND';
      
      return [vs, c1, c2, a, b, g];
    },
    goals: [
      {
        id: 'smaller_cap_higher_V',
        desc: 'At steady state, smaller C gets higher V (B > A)',
        check: (cs) => {
          const A = Number(cs.find((c) => c.kind === 'probeA')?.state?.value ?? 0);
          const B = Number(cs.find((c) => c.kind === 'probeB')?.state?.value ?? 0);
          return { ok: B > A + 0.5, val: B - A, target: 'B − A > 0.5 V' };
        },
      },
    ],
  },
  {
    id: 'current-div-01',
    title: 'Current Division with Parallel Resistors',
    description: 'Learn how current divides in parallel resistors.',
    make: () => {
      const is = ISource(2, 6, 0.01);
      const r1 = Resistor(6, 6, 1000);
      const r2 = Resistor(8, 6, 2000);
      const a = Voltmeter('probeA', 10, 6);
      const g = Ground(2, 8);
      
      is.ports[0].node = r1.ports[0].node;
      is.ports[0].node = r2.ports[0].node;
      r1.ports[1].node = 'GND';
      r2.ports[1].node = 'GND';
      is.ports[1].node = 'GND';
      a.ports[0].node = r1.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [is, r1, r2, a, g];
    },
    goals: [
      {
        id: 'parallel_voltage',
        desc: 'Measure voltage across parallel resistors',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 6.67) < 0.5, val, target: '~6.67 V' };
        },
      },
    ],
  },
  {
    id: 'led-01',
    title: 'LED Circuit with Current Limiting',
    description: 'Design a circuit to safely light an LED.',
    make: () => {
      const vs = VSource(2, 6, 9);
      const r = Resistor(6, 6, 330);
      const led = Lamp(8, 6, 20); // LED represented as lamp with low resistance
      const a = Voltmeter('probeA', 10, 6);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r.ports[0].node;
      r.ports[1].node = led.ports[0].node;
      led.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = led.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r, led, a, g];
    },
    goals: [
      {
        id: 'led_lit',
        desc: 'LED is lit (power > 0.1 W)',
        check: (cs) => {
          const led = cs.find((c) => c.kind === 'lamp');
          const power = Number(led?.state?.power ?? 0);
          return { ok: power > 0.1, val: power, target: '> 0.1 W' };
        },
      },
    ],
  },
  // Additional levels to reach 12+
  {
    id: 'ohms-law-01',
    title: 'Ohms Law Verification',
    description: 'Verify Ohms law: V = I × R',
    make: () => {
      const vs = VSource(3, 6, 12);
      const r = Resistor(7, 6, 2000);
      const a = Voltmeter('probeA', 11, 6);
      const g = Ground(3, 8);
      
      vs.ports[0].node = r.ports[0].node;
      r.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = r.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r, a, g];
    },
    goals: [
      {
        id: 'verify_ohms',
        desc: 'Voltage across 2kΩ should be 12V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 12) < 0.5, val, target: '12 V ±0.5' };
        },
      },
    ],
  },
  {
    id: 'series-resistors',
    title: 'Series Resistor Addition',
    description: 'Learn how resistances add in series circuits.',
    make: () => {
      const vs = VSource(2, 6, 15);
      const r1 = Resistor(6, 6, 1000);
      const r2 = Resistor(8, 6, 2000);
      const r3 = Resistor(10, 6, 1500);
      const a = Voltmeter('probeA', 12, 6);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r1.ports[0].node;
      r1.ports[1].node = r2.ports[0].node;
      r2.ports[1].node = r3.ports[0].node;
      r3.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = r2.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r1, r2, r3, a, g];
    },
    goals: [
      {
        id: 'series_voltage',
        desc: 'Measure voltage at junction between R1 and R2',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 11.67) < 0.5, val, target: '~11.67 V' };
        },
      },
    ],
  },
  {
    id: 'rc-discharge',
    title: 'RC Discharge Circuit',
    description: 'Observe capacitor discharge through a resistor.',
    make: () => {
      const c = Capacitor(4, 6, 2e-3);
      const r = Resistor(6, 6, 5000);
      const a = Voltmeter('probeA', 8, 6);
      const g = Ground(4, 8);
      
      // Pre-charge capacitor
      c.state = { vprev: 10 };
      c.ports[0].node = r.ports[0].node;
      r.ports[1].node = 'GND';
      c.ports[1].node = 'GND';
      a.ports[0].node = c.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [c, r, a, g];
    },
    goals: [
      {
        id: 'discharge_target',
        desc: 'Voltage should decay below 5V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: val < 5 && val > 0, val, target: '< 5 V' };
        },
      },
    ],
  },
  {
    id: 'parallel-resistors',
    title: 'Parallel Resistance Calculation',
    description: 'Calculate equivalent resistance of parallel resistors.',
    make: () => {
      const vs = VSource(2, 6, 10);
      const r1 = Resistor(6, 5, 1000);
      const r2 = Resistor(6, 7, 1000);
      const a = Voltmeter('probeA', 8, 6);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r1.ports[0].node;
      vs.ports[0].node = r2.ports[0].node;
      r1.ports[1].node = 'GND';
      r2.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = r1.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r1, r2, a, g];
    },
    goals: [
      {
        id: 'parallel_equiv',
        desc: 'Voltage should equal source voltage',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 10) < 0.2, val, target: '10 V ±0.2' };
        },
      },
    ],
  },
  {
    id: 'kvl-verification',
    title: 'Kirchhoffs Voltage Law',
    description: 'Verify that voltages around a loop sum to zero.',
    make: () => {
      const vs = VSource(2, 6, 12);
      const r1 = Resistor(6, 6, 2000);
      const r2 = Resistor(8, 6, 1000);
      const a = Voltmeter('probeA', 10, 5);
      const b = Voltmeter('probeB', 10, 7);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r1.ports[0].node;
      r1.ports[1].node = r2.ports[0].node;
      r2.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = r1.ports[1].node;
      a.ports[1].node = 'GND';
      b.ports[0].node = r1.ports[0].node;
      b.ports[1].node = 'GND';
      
      return [vs, r1, r2, a, b, g];
    },
    goals: [
      {
        id: 'kvl_check',
        desc: 'Sum of voltage drops equals source voltage',
        check: (cs) => {
          const pA = cs.find((c) => c.kind === 'probeA');
          const pB = cs.find((c) => c.kind === 'probeB');
          const vA = Number(pA?.state?.value ?? 0);
          const vB = Number(pB?.state?.value ?? 0);
          const vR1 = vB - vA; // Voltage across R1
          return { ok: Math.abs(vR1 - 8) < 0.5, val: vR1, target: '8 V ±0.5' };
        },
      },
    ],
  },
  {
    id: 'power-calc',
    title: 'Power Calculation in Circuits',
    description: 'Calculate power dissipation in circuit elements.',
    make: () => {
      const vs = VSource(3, 6, 20);
      const r = Resistor(7, 6, 400);
      const lamp = Lamp(9, 6, 100);
      const a = Voltmeter('probeA', 11, 6);
      const g = Ground(3, 8);
      
      vs.ports[0].node = r.ports[0].node;
      r.ports[1].node = lamp.ports[0].node;
      lamp.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      a.ports[0].node = lamp.ports[0].node;
      a.ports[1].node = 'GND';
      
      return [vs, r, lamp, a, g];
    },
    goals: [
      {
        id: 'lamp_power',
        desc: 'Lamp should dissipate significant power',
        check: (cs) => {
          const lamp = cs.find((c) => c.kind === 'lamp');
          const power = Number(lamp?.state?.power ?? 0);
          return { ok: power > 0.5, val: power, target: '> 0.5 W' };
        },
      },
    ],
  },
  {
    id: 'complex-divider',
    title: 'Complex Voltage Divider',
    description: 'Master voltage division with multiple taps.',
    make: () => {
      const vs = VSource(2, 6, 24);
      const r1 = Resistor(6, 6, 1000);
      const r2 = Resistor(8, 6, 2000);
      const r3 = Resistor(10, 6, 1000);
      const a = Voltmeter('probeA', 12, 5);
      const b = Voltmeter('probeB', 12, 7);
      const g = Ground(2, 8);
      
      vs.ports[0].node = r1.ports[0].node;
      r1.ports[1].node = r2.ports[0].node;
      r2.ports[1].node = r3.ports[0].node;
      r3.ports[1].node = 'GND';
      vs.ports[1].node = 'GND';
      
      a.ports[0].node = r1.ports[1].node;
      a.ports[1].node = 'GND';
      b.ports[0].node = r2.ports[1].node;
      b.ports[1].node = 'GND';
      
      return [vs, r1, r2, r3, a, b, g];
    },
    goals: [
      {
        id: 'first_tap',
        desc: 'First tap (A) should be 18V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeA');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 18) < 1, val, target: '18 V ±1' };
        },
      },
      {
        id: 'second_tap',
        desc: 'Second tap (B) should be 6V',
        check: (cs) => {
          const p = cs.find((c) => c.kind === 'probeB');
          const val = Number(p?.state?.value ?? 0);
          return { ok: Math.abs(val - 6) < 1, val, target: '6 V ±1' };
        },
      },
    ],
  },
];
