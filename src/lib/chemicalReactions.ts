// Realistic chemical reactions with pH changes, color indicators, and reaction dynamics

export interface ChemicalSubstance {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'salt' | 'indicator' | 'metal' | 'oxide' | 'organic' | 'water';
  concentration?: number; // Molarity
  pH?: number;
  color: string;
  properties: {
    molarMass: number;
    density?: number;
    boilingPoint?: number;
    solubility?: 'soluble' | 'insoluble' | 'slightly_soluble';
  };
  hazards: string[];
}

export interface ReactionResult {
  products: ChemicalProduct[];
  type: ReactionType;
  isExothermic: boolean;
  enthalpyChange: number; // kJ/mol (negative = exothermic)
  temperatureChange: number; // °C
  observableChanges: {
    colorChange?: { from: string; to: string };
    gasEvolution?: { gas: string; description: string };
    precipitate?: { compound: string; color: string };
    heatChange?: 'warming' | 'cooling';
  };
  equation: string;
  explanation: string;
  safetyNotes: string[];
}

export interface ChemicalProduct {
  substance: ChemicalSubstance;
  state: 'aqueous' | 'solid' | 'gas' | 'liquid';
  amount: number; // relative moles
}

export type ReactionType = 
  | 'neutralization'
  | 'precipitation'
  | 'decomposition'
  | 'single_displacement'
  | 'double_displacement'
  | 'combustion'
  | 'synthesis'
  | 'redox'
  | 'acid_base'
  | 'no_reaction';

// pH Indicators with color ranges
export interface pHIndicator {
  id: string;
  name: string;
  colorRanges: { minPH: number; maxPH: number; color: string }[];
  transitionPH: number;
}

export const PH_INDICATORS: Record<string, pHIndicator> = {
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    transitionPH: 8.2,
    colorRanges: [
      { minPH: 0, maxPH: 8.2, color: 'colorless' },
      { minPH: 8.2, maxPH: 10, color: '#FF69B4' }, // Pink
      { minPH: 10, maxPH: 14, color: '#FF1493' }, // Deep pink
    ],
  },
  methyl_orange: {
    id: 'methyl_orange',
    name: 'Methyl Orange',
    transitionPH: 4.0,
    colorRanges: [
      { minPH: 0, maxPH: 3.1, color: '#FF0000' }, // Red
      { minPH: 3.1, maxPH: 4.4, color: '#FFA500' }, // Orange
      { minPH: 4.4, maxPH: 14, color: '#FFFF00' }, // Yellow
    ],
  },
  litmus: {
    id: 'litmus',
    name: 'Litmus',
    transitionPH: 7.0,
    colorRanges: [
      { minPH: 0, maxPH: 4.5, color: '#FF0000' }, // Red
      { minPH: 4.5, maxPH: 8.3, color: '#800080' }, // Purple (neutral)
      { minPH: 8.3, maxPH: 14, color: '#0000FF' }, // Blue
    ],
  },
  bromothymol_blue: {
    id: 'bromothymol_blue',
    name: 'Bromothymol Blue',
    transitionPH: 7.0,
    colorRanges: [
      { minPH: 0, maxPH: 6.0, color: '#FFFF00' }, // Yellow
      { minPH: 6.0, maxPH: 7.6, color: '#008000' }, // Green
      { minPH: 7.6, maxPH: 14, color: '#0000FF' }, // Blue
    ],
  },
  universal_indicator: {
    id: 'universal_indicator',
    name: 'Universal Indicator',
    transitionPH: 7.0,
    colorRanges: [
      { minPH: 0, maxPH: 2, color: '#FF0000' }, // Deep red
      { minPH: 2, maxPH: 4, color: '#FF4500' }, // Red-orange
      { minPH: 4, maxPH: 5, color: '#FFA500' }, // Orange
      { minPH: 5, maxPH: 6, color: '#FFFF00' }, // Yellow
      { minPH: 6, maxPH: 7, color: '#ADFF2F' }, // Yellow-green
      { minPH: 7, maxPH: 8, color: '#008000' }, // Green
      { minPH: 8, maxPH: 9, color: '#00CED1' }, // Cyan
      { minPH: 9, maxPH: 10, color: '#0000FF' }, // Blue
      { minPH: 10, maxPH: 11, color: '#4B0082' }, // Indigo
      { minPH: 11, maxPH: 14, color: '#8B008B' }, // Violet
    ],
  },
};

// Chemical substances catalog
export const CHEMICAL_CATALOG: Record<string, ChemicalSubstance> = {
  // ACIDS
  hcl: {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    type: 'acid',
    concentration: 1.0,
    pH: 0,
    color: 'colorless',
    properties: { molarMass: 36.46, boilingPoint: -85, solubility: 'soluble' },
    hazards: ['Corrosive', 'Causes burns', 'Irritating fumes'],
  },
  h2so4: {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    type: 'acid',
    concentration: 1.0,
    pH: 0,
    color: 'colorless',
    properties: { molarMass: 98.08, boilingPoint: 337, density: 1.84, solubility: 'soluble' },
    hazards: ['Highly corrosive', 'Causes severe burns', 'Exothermic with water'],
  },
  hno3: {
    id: 'hno3',
    name: 'Nitric Acid',
    formula: 'HNO₃',
    type: 'acid',
    concentration: 1.0,
    pH: 0,
    color: 'colorless',
    properties: { molarMass: 63.01, boilingPoint: 83, solubility: 'soluble' },
    hazards: ['Corrosive', 'Strong oxidizer', 'Stains skin yellow'],
  },
  ch3cooh: {
    id: 'ch3cooh',
    name: 'Acetic Acid (Vinegar)',
    formula: 'CH₃COOH',
    type: 'acid',
    concentration: 0.8,
    pH: 2.4,
    color: 'colorless',
    properties: { molarMass: 60.05, boilingPoint: 118, solubility: 'soluble' },
    hazards: ['Irritant', 'Flammable'],
  },

  // BASES
  naoh: {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    type: 'base',
    concentration: 1.0,
    pH: 14,
    color: 'colorless',
    properties: { molarMass: 40.00, boilingPoint: 1388, solubility: 'soluble' },
    hazards: ['Caustic', 'Causes burns', 'Exothermic when dissolving'],
  },
  koh: {
    id: 'koh',
    name: 'Potassium Hydroxide',
    formula: 'KOH',
    type: 'base',
    concentration: 1.0,
    pH: 14,
    color: 'colorless',
    properties: { molarMass: 56.11, boilingPoint: 1327, solubility: 'soluble' },
    hazards: ['Caustic', 'Causes burns'],
  },
  nh3: {
    id: 'nh3',
    name: 'Ammonia Solution',
    formula: 'NH₃',
    type: 'base',
    concentration: 1.0,
    pH: 11,
    color: 'colorless',
    properties: { molarMass: 17.03, boilingPoint: -33, solubility: 'soluble' },
    hazards: ['Irritating fumes', 'Corrosive'],
  },
  nahco3: {
    id: 'nahco3',
    name: 'Sodium Bicarbonate',
    formula: 'NaHCO₃',
    type: 'base',
    concentration: 0.5,
    pH: 8.3,
    color: 'white',
    properties: { molarMass: 84.01, solubility: 'soluble' },
    hazards: [],
  },

  // SALTS
  nacl: {
    id: 'nacl',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    type: 'salt',
    pH: 7,
    color: 'white',
    properties: { molarMass: 58.44, boilingPoint: 1465, solubility: 'soluble' },
    hazards: [],
  },
  agno3: {
    id: 'agno3',
    name: 'Silver Nitrate',
    formula: 'AgNO₃',
    type: 'salt',
    pH: 5,
    color: 'colorless',
    properties: { molarMass: 169.87, solubility: 'soluble' },
    hazards: ['Corrosive', 'Stains skin black', 'Oxidizer'],
  },
  cuso4: {
    id: 'cuso4',
    name: 'Copper Sulfate',
    formula: 'CuSO₄',
    type: 'salt',
    pH: 4,
    color: '#1E90FF', // Dodger blue
    properties: { molarMass: 159.61, solubility: 'soluble' },
    hazards: ['Harmful if swallowed', 'Irritant'],
  },
  pbno3_2: {
    id: 'pbno3_2',
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO₃)₂',
    type: 'salt',
    pH: 4,
    color: 'colorless',
    properties: { molarMass: 331.2, solubility: 'soluble' },
    hazards: ['Toxic', 'Environmental hazard'],
  },
  ki: {
    id: 'ki',
    name: 'Potassium Iodide',
    formula: 'KI',
    type: 'salt',
    pH: 7,
    color: 'colorless',
    properties: { molarMass: 166.00, solubility: 'soluble' },
    hazards: [],
  },

  // WATER
  water: {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H₂O',
    type: 'water',
    pH: 7,
    color: 'colorless',
    properties: { molarMass: 18.02, boilingPoint: 100, density: 1.0, solubility: 'soluble' },
    hazards: [],
  },
};

// Precipitation reactions (products that are insoluble)
const PRECIPITATES: Record<string, { formula: string; color: string; name: string }> = {
  'agcl': { formula: 'AgCl', color: '#FFFFFF', name: 'Silver Chloride' },
  'agbr': { formula: 'AgBr', color: '#FFFACD', name: 'Silver Bromide' },
  'agi': { formula: 'AgI', color: '#FFFF00', name: 'Silver Iodide' },
  'pbi2': { formula: 'PbI₂', color: '#FFD700', name: 'Lead(II) Iodide' },
  'pbcl2': { formula: 'PbCl₂', color: '#FFFFFF', name: 'Lead(II) Chloride' },
  'baso4': { formula: 'BaSO₄', color: '#FFFFFF', name: 'Barium Sulfate' },
  'cu(oh)2': { formula: 'Cu(OH)₂', color: '#87CEEB', name: 'Copper(II) Hydroxide' },
  'fe(oh)3': { formula: 'Fe(OH)₃', color: '#8B4513', name: 'Iron(III) Hydroxide' },
  'mg(oh)2': { formula: 'Mg(OH)₂', color: '#FFFFFF', name: 'Magnesium Hydroxide' },
};

// Main reaction simulation function
export function simulateReaction(
  reactant1Id: string,
  reactant2Id: string,
  currentPH: number = 7,
  currentTemp: number = 25,
  currentIndicator?: string
): ReactionResult {
  const r1 = CHEMICAL_CATALOG[reactant1Id];
  const r2 = CHEMICAL_CATALOG[reactant2Id];

  if (!r1 || !r2) {
    return createNoReactionResult();
  }

  // Sort to ensure consistent lookup
  const [acid, base] = r1.type === 'acid' ? [r1, r2] : [r2, r1];
  
  // ACID-BASE NEUTRALIZATION
  if ((r1.type === 'acid' && r2.type === 'base') || (r1.type === 'base' && r2.type === 'acid')) {
    return simulateNeutralization(acid, base, currentPH, currentTemp, currentIndicator);
  }

  // PRECIPITATION REACTIONS
  const precipitate = checkForPrecipitate(r1, r2);
  if (precipitate) {
    return simulatePrecipitation(r1, r2, precipitate, currentTemp);
  }

  // ACID + CARBONATE (gas evolution)
  if (r1.type === 'acid' && r2.id === 'nahco3') {
    return simulateAcidCarbonate(r1, r2, currentTemp);
  }
  if (r2.type === 'acid' && r1.id === 'nahco3') {
    return simulateAcidCarbonate(r2, r1, currentTemp);
  }

  return createNoReactionResult();
}

// Acid-Base Neutralization
function simulateNeutralization(
  acid: ChemicalSubstance,
  base: ChemicalSubstance,
  currentPH: number,
  currentTemp: number,
  indicator?: string
): ReactionResult {
  const acidConc = acid.concentration || 1;
  const baseConc = base.concentration || 1;
  
  // Calculate new pH based on relative concentrations
  let newPH: number;
  if (acidConc > baseConc) {
    const excess = acidConc - baseConc;
    newPH = -Math.log10(excess);
  } else if (baseConc > acidConc) {
    const excess = baseConc - acidConc;
    newPH = 14 + Math.log10(excess);
  } else {
    newPH = 7; // Complete neutralization
  }
  newPH = Math.max(0, Math.min(14, newPH));

  // Neutralization is exothermic
  const enthalpyChange = -57.3; // kJ/mol for strong acid + strong base
  const tempChange = Math.min(15, Math.abs(acid.pH! - 7) + Math.abs(base.pH! - 7));

  // Determine salt produced
  let saltFormula = 'Salt';
  if (acid.id === 'hcl' && base.id === 'naoh') {
    saltFormula = 'NaCl (table salt)';
  } else if (acid.id === 'h2so4' && base.id === 'naoh') {
    saltFormula = 'Na₂SO₄';
  } else if (acid.id === 'hno3' && base.id === 'naoh') {
    saltFormula = 'NaNO₃';
  }

  // Indicator color change
  let colorChange: { from: string; to: string } | undefined;
  if (indicator && PH_INDICATORS[indicator]) {
    const indicatorData = PH_INDICATORS[indicator];
    const fromColor = getIndicatorColor(indicatorData, currentPH);
    const toColor = getIndicatorColor(indicatorData, newPH);
    if (fromColor !== toColor) {
      colorChange = { from: fromColor, to: toColor };
    }
  }

  return {
    products: [
      { 
        substance: { ...CHEMICAL_CATALOG.water, name: 'Water' }, 
        state: 'liquid', 
        amount: 1 
      },
      {
        substance: {
          id: 'salt',
          name: saltFormula,
          formula: saltFormula,
          type: 'salt',
          pH: 7,
          color: 'colorless',
          properties: { molarMass: 58.44, solubility: 'soluble' },
          hazards: [],
        },
        state: 'aqueous',
        amount: 1,
      },
    ],
    type: 'neutralization',
    isExothermic: true,
    enthalpyChange,
    temperatureChange: tempChange,
    observableChanges: {
      heatChange: 'warming',
      colorChange,
    },
    equation: `${acid.formula} + ${base.formula} → ${saltFormula} + H₂O`,
    explanation: `Acid-base neutralization reaction. The H⁺ ions from ${acid.name} combine with OH⁻ ions from ${base.name} to form water. The reaction releases ${Math.abs(enthalpyChange)} kJ/mol of energy (exothermic). Final pH: ${newPH.toFixed(1)}`,
    safetyNotes: [
      'Always add acid to base, never the reverse',
      'The reaction releases heat - handle carefully',
      'Wear goggles and gloves',
    ],
  };
}

// Precipitation reaction
function simulatePrecipitation(
  r1: ChemicalSubstance,
  r2: ChemicalSubstance,
  precipitate: { formula: string; color: string; name: string },
  currentTemp: number
): ReactionResult {
  return {
    products: [
      {
        substance: {
          id: precipitate.formula.toLowerCase(),
          name: precipitate.name,
          formula: precipitate.formula,
          type: 'salt',
          pH: 7,
          color: precipitate.color,
          properties: { molarMass: 100, solubility: 'insoluble' },
          hazards: [],
        },
        state: 'solid',
        amount: 1,
      },
    ],
    type: 'precipitation',
    isExothermic: true,
    enthalpyChange: -15,
    temperatureChange: 2,
    observableChanges: {
      precipitate: { compound: precipitate.formula, color: precipitate.color },
    },
    equation: `${r1.formula} + ${r2.formula} → ${precipitate.formula}↓ + soluble products`,
    explanation: `Double displacement reaction forming insoluble ${precipitate.name}. The precipitate (↓) falls out of solution as a solid. The ${precipitate.color === '#FFFFFF' ? 'white' : 'colored'} precipitate can be seen forming immediately upon mixing.`,
    safetyNotes: [
      'Handle precipitate carefully',
      'Dispose of according to waste protocols',
    ],
  };
}

// Acid + Carbonate reaction
function simulateAcidCarbonate(
  acid: ChemicalSubstance,
  carbonate: ChemicalSubstance,
  currentTemp: number
): ReactionResult {
  return {
    products: [
      { substance: CHEMICAL_CATALOG.water, state: 'liquid', amount: 1 },
      {
        substance: {
          id: 'co2',
          name: 'Carbon Dioxide',
          formula: 'CO₂',
          type: 'oxide',
          pH: 7,
          color: 'colorless',
          properties: { molarMass: 44.01, boilingPoint: -78, solubility: 'slightly_soluble' },
          hazards: ['Asphyxiant in high concentrations'],
        },
        state: 'gas',
        amount: 1,
      },
    ],
    type: 'decomposition',
    isExothermic: true,
    enthalpyChange: -12,
    temperatureChange: 3,
    observableChanges: {
      gasEvolution: { 
        gas: 'CO₂', 
        description: 'Bubbles of carbon dioxide gas vigorously evolve from the solution. The fizzing sound is characteristic of this reaction.' 
      },
    },
    equation: `${acid.formula} + ${carbonate.formula} → Salt + H₂O + CO₂↑`,
    explanation: `The acid reacts with the carbonate, releasing carbon dioxide gas (bubbles). This is why vinegar and baking soda foam! The carbonic acid (H₂CO₃) formed is unstable and immediately decomposes to water and CO₂.`,
    safetyNotes: [
      'Reaction produces gas - ensure ventilation',
      'May foam over the container - work in a larger vessel',
    ],
  };
}

// Check if two reactants form a precipitate
function checkForPrecipitate(
  r1: ChemicalSubstance, 
  r2: ChemicalSubstance
): { formula: string; color: string; name: string } | null {
  // Silver + Halide
  if ((r1.id === 'agno3' && r2.id === 'nacl') || (r2.id === 'agno3' && r1.id === 'nacl')) {
    return PRECIPITATES['agcl'];
  }
  if ((r1.id === 'agno3' && r2.id === 'ki') || (r2.id === 'agno3' && r1.id === 'ki')) {
    return PRECIPITATES['agi'];
  }
  
  // Lead + Iodide (beautiful yellow precipitate)
  if ((r1.id === 'pbno3_2' && r2.id === 'ki') || (r2.id === 'pbno3_2' && r1.id === 'ki')) {
    return PRECIPITATES['pbi2'];
  }
  
  // Copper + Hydroxide
  if ((r1.id === 'cuso4' && (r2.id === 'naoh' || r2.id === 'koh')) ||
      (r2.id === 'cuso4' && (r1.id === 'naoh' || r1.id === 'koh'))) {
    return PRECIPITATES['cu(oh)2'];
  }

  return null;
}

// Get indicator color for given pH
export function getIndicatorColor(indicator: pHIndicator, pH: number): string {
  for (const range of indicator.colorRanges) {
    if (pH >= range.minPH && pH < range.maxPH) {
      return range.color;
    }
  }
  return indicator.colorRanges[indicator.colorRanges.length - 1].color;
}

// Calculate pH when mixing solutions
export function calculateMixedPH(
  solution1: { pH: number; volume: number },
  solution2: { pH: number; volume: number }
): number {
  // Convert pH to H+ concentration
  const h1 = Math.pow(10, -solution1.pH);
  const h2 = Math.pow(10, -solution2.pH);
  
  // Weighted average of H+ concentrations
  const totalVolume = solution1.volume + solution2.volume;
  const mixedH = (h1 * solution1.volume + h2 * solution2.volume) / totalVolume;
  
  // Convert back to pH
  return -Math.log10(mixedH);
}

// Titration calculation
export function calculateTitrationEndpoint(
  acidConcentration: number,
  acidVolume: number,
  baseConcentration: number
): number {
  // At equivalence point: nAcid = nBase
  // M_a × V_a = M_b × V_b
  return (acidConcentration * acidVolume) / baseConcentration;
}

function createNoReactionResult(): ReactionResult {
  return {
    products: [],
    type: 'no_reaction',
    isExothermic: false,
    enthalpyChange: 0,
    temperatureChange: 0,
    observableChanges: {},
    equation: 'No reaction',
    explanation: 'These substances do not react under normal laboratory conditions.',
    safetyNotes: [],
  };
}

// Get reaction type description
export function getReactionTypeDescription(type: ReactionType): string {
  const descriptions: Record<ReactionType, string> = {
    neutralization: 'Acid-Base Neutralization: An acid and base react to form water and a salt.',
    precipitation: 'Precipitation: Two solutions mix to form an insoluble solid (precipitate).',
    decomposition: 'Decomposition: A compound breaks down into simpler substances.',
    single_displacement: 'Single Displacement: One element replaces another in a compound.',
    double_displacement: 'Double Displacement: Two compounds exchange ions.',
    combustion: 'Combustion: A substance reacts rapidly with oxygen, producing heat and light.',
    synthesis: 'Synthesis: Two or more simple substances combine to form a complex compound.',
    redox: 'Redox: Oxidation-reduction reaction involving electron transfer.',
    acid_base: 'Acid-Base: Proton transfer between an acid and base.',
    no_reaction: 'No Reaction: The substances do not react under these conditions.',
  };
  return descriptions[type];
}
