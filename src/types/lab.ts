// Core lab types for the interactive virtual laboratory

export interface LabEquipmentItem {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  labType: LabType | 'common';
  icon: string;
  safetyLevel: 'safe' | 'caution' | 'danger';
  properties: Record<string, any>;
  interactions: EquipmentInteraction[];
  usageInstructions: string;
}

export type EquipmentCategory = 
  | 'glassware' 
  | 'heating' 
  | 'measurement' 
  | 'electrical' 
  | 'optical' 
  | 'safety' 
  | 'chemicals'
  | 'biological'
  | 'tools';

export type LabType = 'chemistry' | 'physics' | 'biology';

export interface EquipmentInteraction {
  targetCategory: EquipmentCategory;
  action: string;
  result: string;
  safetyWarning?: string;
}

export interface PlacedEquipment {
  id: string;
  equipmentId: string;
  position: { x: number; y: number };
  state: EquipmentState;
  connections: string[];
  data: Record<string, any>;
}

export interface EquipmentState {
  isActive: boolean;
  // Thermal properties
  temperature?: number;
  volume?: number;
  contents?: string[];
  isBoiling?: boolean;
  evaporationRate?: number;
  pH?: number;
  color?: string;
  // Electrical properties
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
  brightness?: number;
  filamentTemp?: number;
  // Optical properties
  zoomLevel?: number;
  fieldOfView?: number;
  depthOfField?: number;
  resolution?: number;
  visibleStructures?: string[];
  specimenType?: string;
  lightIntensity?: number;
  focusQuality?: number;
}

export interface ExperimentSession {
  id: string;
  mode: 'guided' | 'free';
  labType: LabType;
  placedEquipment: PlacedEquipment[];
  history: ExperimentAction[];
  results: ExperimentResult[];
  startTime: Date;
  isRunning: boolean;
  isPaused: boolean;
  safetyWarnings: SafetyWarning[];
}

export interface ExperimentAction {
  id: string;
  type: 'add' | 'remove' | 'move' | 'connect' | 'activate' | 'deactivate' | 'combine';
  timestamp: Date;
  equipmentId: string;
  details: Record<string, any>;
}

export interface ExperimentResult {
  timestamp: Date;
  type: 'temperature' | 'color' | 'voltage' | 'motion' | 'observation' | 'measurement';
  value: any;
  unit?: string;
  description: string;
}

export interface SafetyWarning {
  id: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  message: string;
  equipmentIds: string[];
  timestamp: Date;
}

export interface GuidedExperiment {
  id: string;
  title: string;
  description: string;
  labType: LabType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: ExperimentStep[];
  requiredEquipment: string[];
  learningObjectives: string[];
  estimatedTime: number;
}

export interface ExperimentStep {
  id: string;
  instruction: string;
  hint?: string;
  expectedAction: {
    type: string;
    equipmentId?: string;
    targetId?: string;
  };
  validationCriteria: string;
  voiceGuidance?: string;
}

// Equipment catalog
export const EQUIPMENT_CATALOG: Record<string, LabEquipmentItem> = {
  // Chemistry Equipment
  beaker_250ml: {
    id: 'beaker_250ml',
    name: 'Beaker (250ml)',
    description: 'Glass beaker for holding and mixing liquids',
    category: 'glassware',
    labType: 'chemistry',
    icon: '🧪',
    safetyLevel: 'safe',
    properties: { capacity: 250, material: 'borosilicate glass' },
    interactions: [
      { targetCategory: 'heating', action: 'heat', result: 'Heats contents' },
      { targetCategory: 'chemicals', action: 'add', result: 'Contains chemical' }
    ],
    usageInstructions: 'Place on stable surface. Add liquids carefully. Can be heated on hot plate or over flame.',
  },
  beaker_500ml: {
    id: 'beaker_500ml',
    name: 'Beaker (500ml)',
    description: 'Large glass beaker for experiments',
    category: 'glassware',
    labType: 'chemistry',
    icon: '🧪',
    safetyLevel: 'safe',
    properties: { capacity: 500, material: 'borosilicate glass' },
    interactions: [
      { targetCategory: 'heating', action: 'heat', result: 'Heats contents' },
      { targetCategory: 'chemicals', action: 'add', result: 'Contains chemical' }
    ],
    usageInstructions: 'Place on stable surface. Add liquids carefully.',
  },
  erlenmeyer_flask: {
    id: 'erlenmeyer_flask',
    name: 'Erlenmeyer Flask',
    description: 'Conical flask for mixing and heating',
    category: 'glassware',
    labType: 'chemistry',
    icon: '⚗️',
    safetyLevel: 'safe',
    properties: { capacity: 250, shape: 'conical' },
    interactions: [
      { targetCategory: 'heating', action: 'heat', result: 'Heats contents safely' }
    ],
    usageInstructions: 'Ideal for swirling liquids. Conical shape prevents splashing.',
  },
  test_tube: {
    id: 'test_tube',
    name: 'Test Tube',
    description: 'Glass tube for small-scale reactions',
    category: 'glassware',
    labType: 'chemistry',
    icon: '🧫',
    safetyLevel: 'safe',
    properties: { capacity: 20, diameter: 15 },
    interactions: [
      { targetCategory: 'heating', action: 'heat', result: 'Heats rapidly', safetyWarning: 'Point away from face when heating' }
    ],
    usageInstructions: 'Hold with test tube holder when heating. Never point at anyone.',
  },
  bunsen_burner: {
    id: 'bunsen_burner',
    name: 'Bunsen Burner',
    description: 'Gas burner for heating substances',
    category: 'heating',
    labType: 'chemistry',
    icon: '🔥',
    safetyLevel: 'caution',
    properties: { maxTemp: 1500, fuelType: 'natural gas' },
    interactions: [
      { targetCategory: 'glassware', action: 'heat', result: 'Heats glassware contents', safetyWarning: 'Flammable materials nearby' }
    ],
    usageInstructions: 'Adjust air intake for flame type. Blue flame is hottest. Keep flammables away.',
  },
  hot_plate: {
    id: 'hot_plate',
    name: 'Hot Plate',
    description: 'Electric heating surface',
    category: 'heating',
    labType: 'common',
    icon: '🔲',
    safetyLevel: 'caution',
    properties: { maxTemp: 400, power: 1000 },
    interactions: [
      { targetCategory: 'glassware', action: 'heat', result: 'Heats evenly' }
    ],
    usageInstructions: 'Place glassware on surface. Adjust temperature dial. Surface remains hot after use.',
  },
  thermometer: {
    id: 'thermometer',
    name: 'Thermometer',
    description: 'Measures temperature accurately',
    category: 'measurement',
    labType: 'common',
    icon: '🌡️',
    safetyLevel: 'safe',
    properties: { range: [-20, 110], unit: '°C' },
    interactions: [
      { targetCategory: 'glassware', action: 'measure', result: 'Shows temperature' }
    ],
    usageInstructions: 'Insert into liquid. Wait for reading to stabilize.',
  },
  ph_meter: {
    id: 'ph_meter',
    name: 'pH Meter',
    description: 'Digital pH measurement device',
    category: 'measurement',
    labType: 'chemistry',
    icon: '📊',
    safetyLevel: 'safe',
    properties: { range: [0, 14], precision: 0.01 },
    interactions: [
      { targetCategory: 'glassware', action: 'measure', result: 'Shows pH value' }
    ],
    usageInstructions: 'Calibrate before use. Insert probe into solution. Read digital display.',
  },
  graduated_cylinder: {
    id: 'graduated_cylinder',
    name: 'Graduated Cylinder',
    description: 'Precise volume measurement',
    category: 'measurement',
    labType: 'chemistry',
    icon: '📏',
    safetyLevel: 'safe',
    properties: { capacity: 100, precision: 1 },
    interactions: [],
    usageInstructions: 'Read meniscus at eye level. Pour slowly for accuracy.',
  },
  
  // Physics Equipment
  battery_9v: {
    id: 'battery_9v',
    name: '9V Battery',
    description: 'DC power source',
    category: 'electrical',
    labType: 'physics',
    icon: '🔋',
    safetyLevel: 'safe',
    properties: { voltage: 9, type: 'DC' },
    interactions: [
      { targetCategory: 'electrical', action: 'power', result: 'Provides current' }
    ],
    usageInstructions: 'Connect positive to positive, negative to negative.',
  },
  battery_12v: {
    id: 'battery_12v',
    name: '12V Battery',
    description: 'High voltage DC power source',
    category: 'electrical',
    labType: 'physics',
    icon: '🔋',
    safetyLevel: 'caution',
    properties: { voltage: 12, type: 'DC' },
    interactions: [
      { targetCategory: 'electrical', action: 'power', result: 'Provides high current', safetyWarning: 'High voltage - risk of shock' }
    ],
    usageInstructions: 'Handle with care. Do not short circuit.',
  },
  resistor: {
    id: 'resistor',
    name: 'Resistor (100Ω)',
    description: 'Limits current flow',
    category: 'electrical',
    labType: 'physics',
    icon: '⚡',
    safetyLevel: 'safe',
    properties: { resistance: 100, tolerance: 5 },
    interactions: [
      { targetCategory: 'electrical', action: 'connect', result: 'Reduces current' }
    ],
    usageInstructions: 'Connect in series to limit current. Color bands indicate value.',
  },
  light_bulb: {
    id: 'light_bulb',
    name: 'Light Bulb',
    description: 'Incandescent light source',
    category: 'electrical',
    labType: 'physics',
    icon: '💡',
    safetyLevel: 'safe',
    properties: { wattage: 40, voltage: 12 },
    interactions: [
      { targetCategory: 'electrical', action: 'illuminate', result: 'Produces light when powered' }
    ],
    usageInstructions: 'Connect to appropriate voltage source. Gets hot when lit.',
  },
  wire: {
    id: 'wire',
    name: 'Connecting Wire',
    description: 'Copper wire for circuits',
    category: 'electrical',
    labType: 'physics',
    icon: '〰️',
    safetyLevel: 'safe',
    properties: { material: 'copper', gauge: 22 },
    interactions: [
      { targetCategory: 'electrical', action: 'connect', result: 'Conducts electricity' }
    ],
    usageInstructions: 'Strip ends if needed. Connect components in circuit.',
  },
  switch: {
    id: 'switch',
    name: 'Toggle Switch',
    description: 'Opens and closes circuit',
    category: 'electrical',
    labType: 'physics',
    icon: '🔘',
    safetyLevel: 'safe',
    properties: { type: 'SPST', maxCurrent: 10 },
    interactions: [
      { targetCategory: 'electrical', action: 'control', result: 'Toggles circuit on/off' }
    ],
    usageInstructions: 'Connect in series with circuit. Flip to open/close.',
  },
  voltmeter: {
    id: 'voltmeter',
    name: 'Voltmeter',
    description: 'Measures voltage',
    category: 'measurement',
    labType: 'physics',
    icon: '⚡',
    safetyLevel: 'safe',
    properties: { range: [0, 50], precision: 0.1 },
    interactions: [
      { targetCategory: 'electrical', action: 'measure', result: 'Shows voltage reading' }
    ],
    usageInstructions: 'Connect in parallel across component to measure.',
  },
  ammeter: {
    id: 'ammeter',
    name: 'Ammeter',
    description: 'Measures current',
    category: 'measurement',
    labType: 'physics',
    icon: '🔌',
    safetyLevel: 'safe',
    properties: { range: [0, 10], precision: 0.01 },
    interactions: [
      { targetCategory: 'electrical', action: 'measure', result: 'Shows current reading' }
    ],
    usageInstructions: 'Connect in series with circuit to measure.',
  },
  
  // Biology Equipment
  microscope: {
    id: 'microscope',
    name: 'Compound Microscope',
    description: 'Magnifies specimens up to 1000x',
    category: 'optical',
    labType: 'biology',
    icon: '🔬',
    safetyLevel: 'safe',
    properties: { magnification: [40, 100, 400, 1000], type: 'compound' },
    interactions: [
      { targetCategory: 'biological', action: 'view', result: 'Magnifies specimen' }
    ],
    usageInstructions: 'Start with lowest magnification. Focus with coarse then fine adjustment.',
  },
  microscope_slide: {
    id: 'microscope_slide',
    name: 'Microscope Slide',
    description: 'Glass slide for specimens',
    category: 'biological',
    labType: 'biology',
    icon: '🔲',
    safetyLevel: 'safe',
    properties: { size: '75x25mm', material: 'glass' },
    interactions: [
      { targetCategory: 'optical', action: 'place', result: 'Ready for viewing' }
    ],
    usageInstructions: 'Place specimen on slide. Add cover slip. Place on microscope stage.',
  },
  cover_slip: {
    id: 'cover_slip',
    name: 'Cover Slip',
    description: 'Thin glass for covering specimens',
    category: 'biological',
    labType: 'biology',
    icon: '◽',
    safetyLevel: 'safe',
    properties: { size: '22x22mm', thickness: 0.17 },
    interactions: [],
    usageInstructions: 'Place at angle on specimen to avoid air bubbles.',
  },
  petri_dish: {
    id: 'petri_dish',
    name: 'Petri Dish',
    description: 'Shallow dish for culturing',
    category: 'biological',
    labType: 'biology',
    icon: '🍽️',
    safetyLevel: 'safe',
    properties: { diameter: 90, depth: 15 },
    interactions: [
      { targetCategory: 'biological', action: 'culture', result: 'Allows organism growth' }
    ],
    usageInstructions: 'Add agar medium. Inoculate with sample. Incubate.',
  },
  dissection_kit: {
    id: 'dissection_kit',
    name: 'Dissection Kit',
    description: 'Tools for biological dissection',
    category: 'tools',
    labType: 'biology',
    icon: '🔪',
    safetyLevel: 'caution',
    properties: { tools: ['scalpel', 'forceps', 'scissors', 'probe'] },
    interactions: [
      { targetCategory: 'biological', action: 'dissect', result: 'Allows specimen examination', safetyWarning: 'Sharp tools - handle carefully' }
    ],
    usageInstructions: 'Use sharp tools carefully. Cut away from body. Pin specimen firmly.',
  },
  
  // Safety Equipment
  safety_goggles: {
    id: 'safety_goggles',
    name: 'Safety Goggles',
    description: 'Eye protection',
    category: 'safety',
    labType: 'common',
    icon: '🥽',
    safetyLevel: 'safe',
    properties: { protection: 'splash, impact' },
    interactions: [],
    usageInstructions: 'Wear at all times in lab. Must be worn before handling chemicals.',
  },
  lab_coat: {
    id: 'lab_coat',
    name: 'Lab Coat',
    description: 'Protective clothing',
    category: 'safety',
    labType: 'common',
    icon: '🥼',
    safetyLevel: 'safe',
    properties: { material: 'cotton' },
    interactions: [],
    usageInstructions: 'Button up completely. Remove if contaminated.',
  },
  gloves: {
    id: 'gloves',
    name: 'Nitrile Gloves',
    description: 'Chemical-resistant gloves',
    category: 'safety',
    labType: 'common',
    icon: '🧤',
    safetyLevel: 'safe',
    properties: { material: 'nitrile', size: 'M' },
    interactions: [],
    usageInstructions: 'Change if torn. Wash hands after removing.',
  },
  fire_extinguisher: {
    id: 'fire_extinguisher',
    name: 'Fire Extinguisher',
    description: 'Emergency fire suppression',
    category: 'safety',
    labType: 'common',
    icon: '🧯',
    safetyLevel: 'safe',
    properties: { type: 'ABC', capacity: 5 },
    interactions: [],
    usageInstructions: 'PASS: Pull pin, Aim at base, Squeeze handle, Sweep side to side.',
  },
  
  // Chemicals
  water: {
    id: 'water',
    name: 'Distilled Water',
    description: 'Pure H₂O',
    category: 'chemicals',
    labType: 'chemistry',
    icon: '💧',
    safetyLevel: 'safe',
    properties: { pH: 7, formula: 'H₂O' },
    interactions: [
      { targetCategory: 'glassware', action: 'add', result: 'Fills container' }
    ],
    usageInstructions: 'Use for dilutions and rinsing.',
  },
  hydrochloric_acid: {
    id: 'hydrochloric_acid',
    name: 'Hydrochloric Acid (1M)',
    description: 'Strong acid - HCl',
    category: 'chemicals',
    labType: 'chemistry',
    icon: '⚠️',
    safetyLevel: 'danger',
    properties: { pH: 0, formula: 'HCl', concentration: 1 },
    interactions: [
      { targetCategory: 'glassware', action: 'add', result: 'Acidifies solution', safetyWarning: 'Corrosive - wear gloves and goggles' }
    ],
    usageInstructions: 'Always add acid to water, never the reverse. Wear full PPE.',
  },
  sodium_hydroxide: {
    id: 'sodium_hydroxide',
    name: 'Sodium Hydroxide (1M)',
    description: 'Strong base - NaOH',
    category: 'chemicals',
    labType: 'chemistry',
    icon: '⚠️',
    safetyLevel: 'danger',
    properties: { pH: 14, formula: 'NaOH', concentration: 1 },
    interactions: [
      { targetCategory: 'glassware', action: 'add', result: 'Makes solution basic', safetyWarning: 'Caustic - causes burns' }
    ],
    usageInstructions: 'Handle with extreme care. Neutralize spills with acid.',
  },
};
