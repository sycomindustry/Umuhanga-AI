// Realistic physics simulation for virtual lab equipment

// Physical constants
export const CONSTANTS = {
  // Electrical
  BOLTZMANN: 1.380649e-23, // J/K
  ELECTRON_CHARGE: 1.602176634e-19, // C
  ROOM_TEMPERATURE: 298.15, // K (25°C)
  
  // Thermal
  WATER_SPECIFIC_HEAT: 4.186, // J/(g·°C)
  GLASS_SPECIFIC_HEAT: 0.84, // J/(g·°C)
  COPPER_RESISTIVITY: 1.68e-8, // Ω·m
  TUNGSTEN_TEMP_COEFFICIENT: 0.0045, // per °C
  
  // Optical
  LIGHT_SPEED: 299792458, // m/s
  PLANCK: 6.62607015e-34, // J·s
};

// ============= ELECTRICAL PHYSICS =============

export interface CircuitComponent {
  id: string;
  type: 'battery' | 'resistor' | 'bulb' | 'wire' | 'switch' | 'capacitor' | 'ammeter' | 'voltmeter';
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  temperature: number;
  isOpen?: boolean; // for switches
  capacitance?: number;
  charge?: number;
}

export interface CircuitAnalysis {
  totalVoltage: number;
  totalCurrent: number;
  totalResistance: number;
  totalPower: number;
  components: Map<string, CircuitComponent>;
  isComplete: boolean;
  warnings: string[];
  efficiency: number;
}

// Calculate wire resistance based on length and gauge
export function calculateWireResistance(lengthMeters: number, gaugeAWG: number): number {
  // AWG to diameter conversion
  const diameter = 0.127 * Math.pow(92, (36 - gaugeAWG) / 39) / 1000; // meters
  const area = Math.PI * Math.pow(diameter / 2, 2);
  return (CONSTANTS.COPPER_RESISTIVITY * lengthMeters) / area;
}

// Temperature-dependent resistance for tungsten filament
export function calculateTungstenResistance(baseResistance: number, temperature: number): number {
  const deltaT = temperature - 25; // relative to room temp
  return baseResistance * (1 + CONSTANTS.TUNGSTEN_TEMP_COEFFICIENT * deltaT);
}

// Calculate bulb temperature from power dissipation
export function calculateBulbTemperature(power: number, surfaceArea: number = 0.001): number {
  // Stefan-Boltzmann law approximation for equilibrium temperature
  const emissivity = 0.9;
  const stefanBoltzmann = 5.67e-8;
  const ambientK = 298.15;
  
  // Simplified: T^4 = T_ambient^4 + P/(ε·σ·A)
  const tempK = Math.pow(Math.pow(ambientK, 4) + power / (emissivity * stefanBoltzmann * surfaceArea), 0.25);
  return tempK - 273.15; // Convert to Celsius
}

// Calculate light intensity from bulb (visible light approximation)
export function calculateBulbBrightness(power: number, ratedPower: number, temperature: number): number {
  if (power <= 0) return 0;
  
  // Incandescent efficiency increases with temperature (Wien's law approximation)
  const minVisibleTemp = 400; // °C - starts glowing red
  const optimalTemp = 2700; // °C - tungsten operating temperature
  
  if (temperature < minVisibleTemp) return 0;
  
  // Luminous efficacy curve (simplified)
  const efficacy = Math.min(1, (temperature - minVisibleTemp) / (optimalTemp - minVisibleTemp));
  const powerRatio = Math.min(power / ratedPower, 1.5);
  
  return Math.min(100, powerRatio * efficacy * 100);
}

// Analyze complete circuit using Kirchhoff's laws
export function analyzeCircuit(
  components: Map<string, { 
    type: string; 
    voltage?: number; 
    resistance?: number;
    isOpen?: boolean;
    connections: string[];
  }>
): CircuitAnalysis {
  const warnings: string[] = [];
  const analyzedComponents = new Map<string, CircuitComponent>();
  
  // Find all batteries (voltage sources)
  let totalVoltage = 0;
  let batteryCount = 0;
  
  // Find all resistances in series (simplified for educational purposes)
  let totalResistance = 0;
  let hasOpenSwitch = false;
  
  components.forEach((comp, id) => {
    if (comp.type === 'battery' || comp.type === 'battery_9v' || comp.type === 'battery_12v') {
      totalVoltage += comp.voltage || 0;
      batteryCount++;
    }
    
    if (comp.type === 'resistor') {
      totalResistance += comp.resistance || 100;
    }
    
    if (comp.type === 'light_bulb') {
      // Light bulb has base resistance of ~12Ω cold, increases when hot
      totalResistance += 12;
    }
    
    if (comp.type === 'wire') {
      // 22 AWG wire, ~1m typical
      totalResistance += calculateWireResistance(1, 22);
    }
    
    if (comp.type === 'switch' && comp.isOpen) {
      hasOpenSwitch = true;
    }
  });
  
  // Check if circuit is complete
  const isComplete = batteryCount > 0 && !hasOpenSwitch && components.size >= 2;
  
  if (!isComplete || totalResistance === 0) {
    return {
      totalVoltage,
      totalCurrent: 0,
      totalResistance: totalResistance || Infinity,
      totalPower: 0,
      components: analyzedComponents,
      isComplete: false,
      warnings: hasOpenSwitch ? ['Switch is open - circuit incomplete'] : ['Circuit not complete'],
      efficiency: 0,
    };
  }
  
  // Ohm's Law: I = V/R
  const totalCurrent = totalVoltage / totalResistance;
  const totalPower = totalVoltage * totalCurrent;
  
  // Analyze each component
  components.forEach((comp, id) => {
    const analyzed: CircuitComponent = {
      id,
      type: comp.type as CircuitComponent['type'],
      voltage: 0,
      current: totalCurrent,
      resistance: 0,
      power: 0,
      temperature: 25,
    };
    
    if (comp.type === 'battery' || comp.type === 'battery_9v' || comp.type === 'battery_12v') {
      analyzed.voltage = comp.voltage || 0;
      analyzed.resistance = 0.1; // Internal resistance
      analyzed.power = -analyzed.voltage * totalCurrent; // Negative = power source
    } else if (comp.type === 'resistor') {
      analyzed.resistance = comp.resistance || 100;
      analyzed.voltage = totalCurrent * analyzed.resistance; // V = IR
      analyzed.power = Math.pow(totalCurrent, 2) * analyzed.resistance; // P = I²R
      analyzed.temperature = 25 + (analyzed.power * 50); // Simplified thermal model
    } else if (comp.type === 'light_bulb') {
      const baseResistance = 12;
      analyzed.power = Math.pow(totalCurrent, 2) * baseResistance;
      analyzed.temperature = calculateBulbTemperature(analyzed.power);
      analyzed.resistance = calculateTungstenResistance(baseResistance, analyzed.temperature);
      analyzed.voltage = totalCurrent * analyzed.resistance;
    } else if (comp.type === 'wire') {
      analyzed.resistance = calculateWireResistance(1, 22);
      analyzed.voltage = totalCurrent * analyzed.resistance;
      analyzed.power = Math.pow(totalCurrent, 2) * analyzed.resistance;
    }
    
    analyzedComponents.set(id, analyzed);
  });
  
  // Safety warnings
  if (totalCurrent > 2) {
    warnings.push(`High current (${totalCurrent.toFixed(2)}A) - Risk of overheating!`);
  }
  if (totalPower > 20) {
    warnings.push(`High power dissipation (${totalPower.toFixed(1)}W) - Components may burn out!`);
  }
  
  // Calculate efficiency (power to light vs total)
  let usefulPower = 0;
  analyzedComponents.forEach((comp) => {
    if (comp.type === 'bulb') {
      usefulPower += comp.power * 0.05; // ~5% efficiency for incandescent
    }
  });
  const efficiency = totalPower > 0 ? (usefulPower / totalPower) * 100 : 0;
  
  return {
    totalVoltage,
    totalCurrent,
    totalResistance,
    totalPower,
    components: analyzedComponents,
    isComplete,
    warnings,
    efficiency,
  };
}

// ============= THERMAL PHYSICS =============

export interface ThermalState {
  temperature: number; // °C
  mass: number; // grams
  specificHeat: number; // J/(g·°C)
  isBoiling: boolean;
  evaporationRate: number; // ml/min
  thermalEnergy: number; // Joules
}

export interface HeatingResult {
  newTemperature: number;
  isBoiling: boolean;
  evaporatedVolume: number;
  timeToBoil: number; // seconds
  warnings: string[];
}

// Calculate heating with realistic thermal physics
export function calculateHeating(
  currentTemp: number,
  volume: number, // ml
  heatPower: number, // Watts
  duration: number, // seconds
  contents: string[] = ['water']
): HeatingResult {
  const warnings: string[] = [];
  
  // Determine specific heat based on contents
  let specificHeat = CONSTANTS.WATER_SPECIFIC_HEAT;
  let boilingPoint = 100;
  
  if (contents.includes('ethanol') || contents.includes('alcohol')) {
    specificHeat = 2.44;
    boilingPoint = 78.37;
  } else if (contents.includes('oil')) {
    specificHeat = 2.0;
    boilingPoint = 300;
  }
  
  // Q = mcΔT, solve for ΔT
  const mass = volume * 1; // Assume density ~1 g/ml
  const energyAdded = heatPower * duration;
  const deltaTemp = energyAdded / (mass * specificHeat);
  
  let newTemp = currentTemp + deltaTemp;
  let evaporatedVolume = 0;
  let isBoiling = false;
  
  // Handle phase transition at boiling point
  if (newTemp >= boilingPoint) {
    isBoiling = true;
    newTemp = boilingPoint;
    
    // Latent heat of vaporization
    const latentHeat = 2260; // J/g for water
    const excessEnergy = (currentTemp + deltaTemp - boilingPoint) * mass * specificHeat;
    evaporatedVolume = excessEnergy / latentHeat;
    
    warnings.push(`Boiling at ${boilingPoint}°C! ${evaporatedVolume.toFixed(1)}ml evaporated.`);
  }
  
  // Calculate time to boil
  const energyToBoil = mass * specificHeat * (boilingPoint - currentTemp);
  const timeToBoil = energyToBoil / heatPower;
  
  if (newTemp > 80 && !isBoiling) {
    warnings.push('High temperature! Handle with heat-resistant gloves.');
  }
  
  return {
    newTemperature: Math.round(newTemp * 10) / 10,
    isBoiling,
    evaporatedVolume: Math.round(evaporatedVolume * 10) / 10,
    timeToBoil: Math.round(timeToBoil),
    warnings,
  };
}

// Newton's Law of Cooling
export function calculateCooling(
  currentTemp: number,
  ambientTemp: number = 25,
  coolingConstant: number = 0.01, // depends on container/surface area
  duration: number = 60 // seconds
): number {
  // T(t) = T_ambient + (T_0 - T_ambient) * e^(-kt)
  return ambientTemp + (currentTemp - ambientTemp) * Math.exp(-coolingConstant * duration);
}

// ============= OPTICAL PHYSICS =============

export interface MicroscopeView {
  magnification: number;
  fieldOfView: number; // mm
  depthOfField: number; // μm
  resolution: number; // μm (minimum resolvable distance)
  workingDistance: number; // mm
  visibleStructures: string[];
  optimalLighting: number; // 0-100
}

export function calculateMicroscopeOptics(
  magnification: number,
  numericalAperture: number = 0.25
): MicroscopeView {
  // Field of view decreases with magnification
  const eyepieceFov = 20; // mm for standard eyepiece
  const fieldOfView = eyepieceFov / (magnification / 10);
  
  // Rayleigh criterion: d = 0.61λ/NA (using 550nm green light)
  const wavelength = 0.55; // μm
  const resolution = (0.61 * wavelength) / numericalAperture;
  
  // Depth of field decreases with magnification
  const depthOfField = 1000 / (magnification * 0.5);
  
  // Working distance (distance from objective to specimen)
  const workingDistance = magnification <= 40 ? 4 : magnification <= 100 ? 1.5 : 0.2;
  
  // Visible structures based on magnification
  const visibleStructures = getVisibleStructures(magnification, resolution);
  
  // Optimal lighting (higher magnification needs more light)
  const optimalLighting = Math.min(100, 30 + magnification * 0.07);
  
  return {
    magnification,
    fieldOfView: Math.round(fieldOfView * 100) / 100,
    depthOfField: Math.round(depthOfField * 10) / 10,
    resolution: Math.round(resolution * 100) / 100,
    workingDistance,
    visibleStructures,
    optimalLighting,
  };
}

function getVisibleStructures(magnification: number, resolution: number): string[] {
  const structures: string[] = [];
  
  if (magnification >= 40) {
    structures.push('Cell clusters', 'Tissue organization', 'Large organisms (paramecium, amoeba)');
  }
  if (magnification >= 100) {
    structures.push('Individual cells', 'Cell walls', 'Chloroplasts', 'Large nuclei');
  }
  if (magnification >= 400) {
    structures.push('Cell membranes', 'Organelles', 'Chromosomes during division', 'Bacteria');
  }
  if (magnification >= 1000) {
    structures.push('Detailed organelle structure', 'Mitochondria', 'Endoplasmic reticulum', 'Nuclear envelope');
  }
  
  return structures;
}

// ============= CHEMISTRY PHYSICS =============

export interface ChemicalReaction {
  reactants: string[];
  products: string[];
  energyChange: number; // kJ/mol (negative = exothermic)
  activationEnergy: number; // kJ/mol
  rateConstant: number;
  isExothermic: boolean;
  colorChange?: { from: string; to: string };
  gasProduced?: string;
  precipitate?: string;
}

export const COMMON_REACTIONS: Record<string, ChemicalReaction> = {
  'HCl+NaOH': {
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H₂O'],
    energyChange: -57.3,
    activationEnergy: 5,
    rateConstant: 1e11,
    isExothermic: true,
  },
  'HCl+NaHCO3': {
    reactants: ['HCl', 'NaHCO₃'],
    products: ['NaCl', 'H₂O', 'CO₂'],
    energyChange: -12,
    activationEnergy: 10,
    rateConstant: 1e6,
    isExothermic: true,
    gasProduced: 'CO₂ (bubbles)',
  },
  'CuSO4+NaOH': {
    reactants: ['CuSO₄', 'NaOH'],
    products: ['Cu(OH)₂', 'Na₂SO₄'],
    energyChange: -15,
    activationEnergy: 8,
    rateConstant: 1e8,
    isExothermic: true,
    colorChange: { from: 'blue', to: 'light blue precipitate' },
    precipitate: 'Cu(OH)₂',
  },
  'AgNO3+NaCl': {
    reactants: ['AgNO₃', 'NaCl'],
    products: ['AgCl', 'NaNO₃'],
    energyChange: -5,
    activationEnergy: 5,
    rateConstant: 1e9,
    isExothermic: true,
    precipitate: 'AgCl (white)',
  },
  'phenolphthalein_acid': {
    reactants: ['phenolphthalein', 'acid'],
    products: ['phenolphthalein (protonated)'],
    energyChange: 0,
    activationEnergy: 0,
    rateConstant: 1e10,
    isExothermic: false,
    colorChange: { from: 'pink', to: 'colorless' },
  },
  'phenolphthalein_base': {
    reactants: ['phenolphthalein', 'base'],
    products: ['phenolphthalein (deprotonated)'],
    energyChange: 0,
    activationEnergy: 0,
    rateConstant: 1e10,
    isExothermic: false,
    colorChange: { from: 'colorless', to: 'pink' },
  },
};

// pH calculation
export function calculatePH(acidConcentration: number, baseConcentration: number): number {
  if (acidConcentration > baseConcentration) {
    const excessH = acidConcentration - baseConcentration;
    return -Math.log10(excessH);
  } else if (baseConcentration > acidConcentration) {
    const excessOH = baseConcentration - acidConcentration;
    const pOH = -Math.log10(excessOH);
    return 14 - pOH;
  }
  return 7; // Neutral
}

// Arrhenius equation for reaction rate
export function calculateReactionRate(
  activationEnergy: number, // kJ/mol
  temperature: number, // °C
  preExponentialFactor: number = 1e10
): number {
  const tempK = temperature + 273.15;
  const R = 8.314; // J/(mol·K)
  const Ea = activationEnergy * 1000; // Convert to J/mol
  
  return preExponentialFactor * Math.exp(-Ea / (R * tempK));
}
