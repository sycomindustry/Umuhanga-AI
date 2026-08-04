// Guided experiments with step-by-step instructions and progress validation

import { GuidedExperiment, ExperimentStep, LabType, ExperimentResult } from '@/types/lab';

export interface StepValidation {
  isValid: boolean;
  feedback: string;
  score: number;
  hints: string[];
}

export interface ExperimentProgress {
  experimentId: string;
  currentStepIndex: number;
  completedSteps: number[];
  scores: number[];
  totalScore: number;
  startTime: Date;
  completionTime?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
}

// Step validation criteria types
export type ValidationCriterion = 
  | { type: 'equipment_placed'; equipmentId: string }
  | { type: 'equipment_connected'; sourceId: string; targetId: string }
  | { type: 'temperature_reached'; targetId: string; minTemp: number; maxTemp?: number }
  | { type: 'chemical_added'; containerId: string; chemicalId: string }
  | { type: 'ph_range'; containerId: string; minPH: number; maxPH: number }
  | { type: 'color_observed'; containerId: string; color: string }
  | { type: 'zoom_set'; microscopeId: string; zoom: number }
  | { type: 'specimen_added'; slideId: string; specimenType: string }
  | { type: 'circuit_complete'; batteryId: string }
  | { type: 'measurement_taken'; measurementType: string; minValue: number; maxValue: number }
  | { type: 'safety_equipped'; items: ('goggles' | 'gloves' | 'labCoat')[] }
  | { type: 'observation_recorded'; keyword: string };

// Complete guided experiments catalog
export const GUIDED_EXPERIMENTS: GuidedExperiment[] = [
  // CHEMISTRY EXPERIMENTS
  {
    id: 'acid_base_neutralization',
    title: 'Acid-Base Neutralization',
    description: 'Learn how acids and bases neutralize each other through a hands-on titration experiment. Observe pH changes and indicator color transitions.',
    labType: 'chemistry',
    difficulty: 'beginner',
    requiredEquipment: ['beaker_250ml', 'hydrochloric_acid', 'sodium_hydroxide', 'ph_meter', 'safety_goggles', 'gloves'],
    learningObjectives: [
      'Understand acid-base reactions produce water and salt',
      'Learn to use pH indicators',
      'Observe exothermic neutralization reactions',
      'Practice proper safety procedures with corrosive chemicals',
    ],
    estimatedTime: 20,
    steps: [
      {
        id: 'safety_first',
        instruction: 'Put on safety goggles and gloves before handling any chemicals. This is mandatory for working with acids and bases.',
        hint: 'Click on the safety goggles and gloves icons in the safety panel.',
        expectedAction: { type: 'safety_equipped' },
        validationCriteria: 'safety_equipped:goggles,gloves',
        voiceGuidance: 'First, let\'s ensure your safety. Please put on your goggles and gloves.',
      },
      {
        id: 'place_beaker',
        instruction: 'Drag a 250ml beaker onto the lab bench. This will be our reaction vessel.',
        hint: 'Find the beaker in the Glassware section of the equipment panel.',
        expectedAction: { type: 'add', equipmentId: 'beaker_250ml' },
        validationCriteria: 'equipment_placed:beaker_250ml',
        voiceGuidance: 'Now place a beaker on the lab bench to hold our solutions.',
      },
      {
        id: 'add_acid',
        instruction: 'Add hydrochloric acid (HCl) to the beaker. Notice the pH meter shows a very low pH value.',
        hint: 'Drag the HCl bottle to the beaker to add it.',
        expectedAction: { type: 'combine', equipmentId: 'hydrochloric_acid' },
        validationCriteria: 'chemical_added:beaker_250ml:hydrochloric_acid',
        voiceGuidance: 'Carefully add hydrochloric acid to the beaker. Watch the pH indicator.',
      },
      {
        id: 'check_acid_ph',
        instruction: 'Connect the pH meter to the beaker and observe the reading. Acids have pH below 7.',
        hint: 'The pH should be around 0-1 for 1M HCl.',
        expectedAction: { type: 'connect', equipmentId: 'ph_meter' },
        validationCriteria: 'ph_range:beaker_250ml:0:2',
        voiceGuidance: 'Connect the pH meter. The reading should show a very low pH, indicating a strong acid.',
      },
      {
        id: 'add_base',
        instruction: 'Slowly add sodium hydroxide (NaOH) to neutralize the acid. Watch the pH rise!',
        hint: 'Add the NaOH solution gradually and observe the reaction.',
        expectedAction: { type: 'combine', equipmentId: 'sodium_hydroxide' },
        validationCriteria: 'chemical_added:beaker_250ml:sodium_hydroxide',
        voiceGuidance: 'Now slowly add sodium hydroxide. You should feel heat being released - this is an exothermic reaction!',
      },
      {
        id: 'observe_neutralization',
        instruction: 'Observe the final pH. When equal amounts of strong acid and base are mixed, pH should be approximately 7 (neutral).',
        hint: 'The reaction: HCl + NaOH → NaCl + H₂O',
        expectedAction: { type: 'observe' },
        validationCriteria: 'ph_range:beaker_250ml:6:8',
        voiceGuidance: 'Excellent! The pH is now neutral. You have successfully completed an acid-base neutralization reaction.',
      },
    ],
  },

  {
    id: 'precipitation_reaction',
    title: 'Precipitation Reactions',
    description: 'Mix two clear solutions to produce a visible solid precipitate. Learn about double displacement reactions and solubility.',
    labType: 'chemistry',
    difficulty: 'beginner',
    requiredEquipment: ['beaker_250ml', 'test_tube', 'safety_goggles', 'gloves'],
    learningObjectives: [
      'Understand double displacement reactions',
      'Learn about solubility rules',
      'Observe precipitate formation',
      'Identify ionic compounds',
    ],
    estimatedTime: 15,
    steps: [
      {
        id: 'safety_check',
        instruction: 'Wear safety goggles and gloves before starting.',
        expectedAction: { type: 'safety_equipped' },
        validationCriteria: 'safety_equipped:goggles,gloves',
        voiceGuidance: 'Safety first! Put on your protective equipment.',
      },
      {
        id: 'setup_beakers',
        instruction: 'Place a beaker on the lab bench.',
        expectedAction: { type: 'add', equipmentId: 'beaker_250ml' },
        validationCriteria: 'equipment_placed:beaker_250ml',
        voiceGuidance: 'Place a beaker on the lab bench.',
      },
      {
        id: 'add_silver_nitrate',
        instruction: 'In a real lab, you would add silver nitrate (AgNO₃) solution. For this simulation, add water and imagine it contains AgNO₃.',
        expectedAction: { type: 'combine', equipmentId: 'water' },
        validationCriteria: 'chemical_added:beaker_250ml:water',
        voiceGuidance: 'Add the first reactant solution.',
      },
      {
        id: 'add_sodium_chloride',
        instruction: 'Add sodium chloride (table salt) solution. A white precipitate of AgCl forms! AgNO₃ + NaCl → AgCl↓ + NaNO₃',
        expectedAction: { type: 'observe' },
        validationCriteria: 'observation_recorded:precipitate',
        voiceGuidance: 'When these solutions mix, silver chloride precipitates out as a white solid.',
      },
    ],
  },

  // PHYSICS EXPERIMENTS
  {
    id: 'ohms_law',
    title: 'Ohm\'s Law Investigation',
    description: 'Build circuits to verify Ohm\'s Law (V = IR). Measure voltage, current, and resistance relationships.',
    labType: 'physics',
    difficulty: 'intermediate',
    requiredEquipment: ['battery_9v', 'resistor', 'light_bulb', 'wire', 'ammeter', 'voltmeter'],
    learningObjectives: [
      'Understand Ohm\'s Law: V = I × R',
      'Build series and parallel circuits',
      'Use ammeter and voltmeter correctly',
      'Calculate power dissipation: P = I × V',
    ],
    estimatedTime: 25,
    steps: [
      {
        id: 'place_battery',
        instruction: 'Place a 9V battery on the lab bench. This provides the electromotive force (EMF) for our circuit.',
        expectedAction: { type: 'add', equipmentId: 'battery_9v' },
        validationCriteria: 'equipment_placed:battery_9v',
        voiceGuidance: 'Place a 9-volt battery on the lab bench.',
      },
      {
        id: 'add_light_bulb',
        instruction: 'Add a light bulb to the circuit. This is our load - it converts electrical energy to light and heat.',
        expectedAction: { type: 'add', equipmentId: 'light_bulb' },
        validationCriteria: 'equipment_placed:light_bulb',
        voiceGuidance: 'Now add a light bulb. This will be our circuit load.',
      },
      {
        id: 'add_wire',
        instruction: 'Add connecting wires to complete the circuit.',
        expectedAction: { type: 'add', equipmentId: 'wire' },
        validationCriteria: 'equipment_placed:wire',
        voiceGuidance: 'Add wires to connect the components.',
      },
      {
        id: 'connect_circuit',
        instruction: 'Connect the battery to the wire, then wire to light bulb, and light bulb back to battery.',
        hint: 'Click on one component, then click "Connect" and select another component.',
        expectedAction: { type: 'connect' },
        validationCriteria: 'equipment_connected:battery_9v:light_bulb',
        voiceGuidance: 'Connect all components in a complete loop.',
      },
      {
        id: 'power_circuit',
        instruction: 'Power on the circuit by clicking the battery and selecting "Power Circuit". Observe the light bulb!',
        hint: 'The bulb should glow if the circuit is complete.',
        expectedAction: { type: 'activate', equipmentId: 'battery_9v' },
        validationCriteria: 'circuit_complete:battery_9v',
        voiceGuidance: 'Power the circuit. The light bulb should glow.',
      },
      {
        id: 'observe_measurements',
        instruction: 'Note the voltage, current, and calculated power. Verify V = I × R.',
        hint: 'Check the results panel for measurements.',
        expectedAction: { type: 'observe' },
        validationCriteria: 'measurement_taken:voltage:8:10',
        voiceGuidance: 'Observe the measurements. According to Ohm\'s Law, current equals voltage divided by resistance.',
      },
    ],
  },

  // BIOLOGY EXPERIMENTS
  {
    id: 'cell_observation',
    title: 'Observing Plant & Animal Cells',
    description: 'Use a microscope to compare plant and animal cell structures. Identify key differences in cell walls and organelles.',
    labType: 'biology',
    difficulty: 'beginner',
    requiredEquipment: ['microscope', 'microscope_slide', 'cover_slip'],
    learningObjectives: [
      'Properly use a compound microscope',
      'Identify plant cell structures (cell wall, chloroplasts, central vacuole)',
      'Identify animal cell structures (cell membrane, nucleus)',
      'Compare and contrast plant vs animal cells',
    ],
    estimatedTime: 20,
    steps: [
      {
        id: 'setup_microscope',
        instruction: 'Place the compound microscope on the lab bench. Always start with the lowest magnification (4x objective = 40x total).',
        expectedAction: { type: 'add', equipmentId: 'microscope' },
        validationCriteria: 'equipment_placed:microscope',
        voiceGuidance: 'Set up your compound microscope on the lab bench.',
      },
      {
        id: 'prepare_slide',
        instruction: 'Prepare a microscope slide. In a real lab, you would add a drop of water and the specimen.',
        expectedAction: { type: 'add', equipmentId: 'microscope_slide' },
        validationCriteria: 'equipment_placed:microscope_slide',
        voiceGuidance: 'Prepare your microscope slide.',
      },
      {
        id: 'add_specimen',
        instruction: 'Add an onion epidermis specimen to the slide. Select "Onion Epidermis" from the specimen options.',
        hint: 'Click on the slide and choose a specimen type.',
        expectedAction: { type: 'combine', equipmentId: 'onion_epidermis' },
        validationCriteria: 'specimen_added:microscope_slide:onion_epidermis',
        voiceGuidance: 'Add the onion epidermis specimen to your slide.',
      },
      {
        id: 'connect_slide',
        instruction: 'Connect the prepared slide to the microscope stage.',
        expectedAction: { type: 'connect' },
        validationCriteria: 'equipment_connected:microscope:microscope_slide',
        voiceGuidance: 'Place the slide on the microscope stage.',
      },
      {
        id: 'low_magnification',
        instruction: 'View at 40x magnification. You should see the regular brick-like pattern of onion cells.',
        expectedAction: { type: 'activate', equipmentId: 'microscope' },
        validationCriteria: 'zoom_set:microscope:40',
        voiceGuidance: 'Start at low magnification to locate your specimen.',
      },
      {
        id: 'medium_magnification',
        instruction: 'Increase to 100x. Individual cells with nuclei and cell walls should be visible.',
        hint: 'Use the magnification buttons to zoom in.',
        expectedAction: { type: 'zoom' },
        validationCriteria: 'zoom_set:microscope:100',
        voiceGuidance: 'Switch to 100x magnification. You should now see individual cells.',
      },
      {
        id: 'high_magnification',
        instruction: 'View at 400x for detailed cell structures. Identify the nucleus, cell wall, and vacuole.',
        expectedAction: { type: 'zoom' },
        validationCriteria: 'zoom_set:microscope:400',
        voiceGuidance: 'At 400x, observe the nucleus as a dark circular structure, surrounded by the large central vacuole.',
      },
      {
        id: 'observe_structures',
        instruction: 'Record your observations. What structures can you identify? How do these differ from animal cells?',
        hint: 'Plant cells have cell walls and often chloroplasts; animal cells do not.',
        expectedAction: { type: 'observe' },
        validationCriteria: 'observation_recorded:cell_wall',
        voiceGuidance: 'Record your observations. Note that plant cells have rigid cell walls, while animal cells only have flexible membranes.',
      },
    ],
  },

  {
    id: 'blood_cell_observation',
    title: 'Blood Cell Identification',
    description: 'Examine a blood smear to identify different blood cell types and understand their functions.',
    labType: 'biology',
    difficulty: 'intermediate',
    requiredEquipment: ['microscope', 'microscope_slide', 'gloves'],
    learningObjectives: [
      'Identify red blood cells, white blood cells, and platelets',
      'Understand the function of each blood cell type',
      'Recognize the unique shape of red blood cells',
      'Count and compare cell ratios',
    ],
    estimatedTime: 25,
    steps: [
      {
        id: 'safety_gloves',
        instruction: 'Always wear gloves when handling blood samples, even prepared slides.',
        expectedAction: { type: 'safety_equipped' },
        validationCriteria: 'safety_equipped:gloves',
        voiceGuidance: 'Put on gloves before handling blood samples.',
      },
      {
        id: 'setup_microscope',
        instruction: 'Set up your microscope on the lab bench.',
        expectedAction: { type: 'add', equipmentId: 'microscope' },
        validationCriteria: 'equipment_placed:microscope',
        voiceGuidance: 'Prepare your microscope.',
      },
      {
        id: 'prepare_blood_slide',
        instruction: 'Prepare a slide with a blood smear sample.',
        expectedAction: { type: 'add', equipmentId: 'microscope_slide' },
        validationCriteria: 'equipment_placed:microscope_slide',
        voiceGuidance: 'Get your blood smear slide ready.',
      },
      {
        id: 'add_blood_specimen',
        instruction: 'Select "Human Blood Smear" as your specimen.',
        expectedAction: { type: 'combine' },
        validationCriteria: 'specimen_added:microscope_slide:human_blood',
        voiceGuidance: 'Add the human blood smear specimen.',
      },
      {
        id: 'mount_slide',
        instruction: 'Mount the slide on the microscope.',
        expectedAction: { type: 'connect' },
        validationCriteria: 'equipment_connected:microscope:microscope_slide',
        voiceGuidance: 'Place the slide on the microscope stage.',
      },
      {
        id: 'view_100x',
        instruction: 'At 100x, red blood cells appear as pink discs. White blood cells are larger and stained purple.',
        expectedAction: { type: 'zoom' },
        validationCriteria: 'zoom_set:microscope:100',
        voiceGuidance: 'At 100x, you should see numerous small pink discs - these are red blood cells.',
      },
      {
        id: 'view_400x',
        instruction: 'At 400x, observe the central pallor of RBCs (lighter center) due to their biconcave shape.',
        expectedAction: { type: 'zoom' },
        validationCriteria: 'zoom_set:microscope:400',
        voiceGuidance: 'Notice how red blood cells are lighter in the center - this is because they are biconcave discs.',
      },
      {
        id: 'view_1000x',
        instruction: 'At 1000x (oil immersion), identify different white blood cell types by their nuclei shapes.',
        hint: 'Neutrophils have multi-lobed nuclei; lymphocytes have large round nuclei.',
        expectedAction: { type: 'zoom' },
        validationCriteria: 'zoom_set:microscope:1000',
        voiceGuidance: 'With oil immersion, identify neutrophils by their segmented nuclei, and lymphocytes by their large round nuclei.',
      },
    ],
  },
];

// Validate a step based on current lab state
export function validateStep(
  step: ExperimentStep,
  labState: {
    placedEquipment: { equipmentId: string; id: string; connections: string[]; state: any }[];
    safetyEquipped: { goggles: boolean; gloves: boolean; labCoat: boolean };
    results: ExperimentResult[];
  }
): StepValidation {
  const criteria = step.validationCriteria;
  const parts = criteria.split(':');
  const validationType = parts[0];
  
  let isValid = false;
  let feedback = '';
  let score = 0;
  const hints: string[] = [];

  switch (validationType) {
    case 'equipment_placed': {
      const equipmentId = parts[1];
      isValid = labState.placedEquipment.some(e => e.equipmentId === equipmentId);
      feedback = isValid 
        ? `Great! You've correctly placed the ${equipmentId.replace(/_/g, ' ')}.` 
        : `Please place the ${equipmentId.replace(/_/g, ' ')} on the lab bench.`;
      score = isValid ? 100 : 0;
      if (!isValid) hints.push(step.hint || 'Find the equipment in the equipment panel and drag it onto the lab bench.');
      break;
    }

    case 'safety_equipped': {
      const items = parts[1].split(',') as ('goggles' | 'gloves' | 'labCoat')[];
      isValid = items.every(item => labState.safetyEquipped[item]);
      const missing = items.filter(item => !labState.safetyEquipped[item]);
      feedback = isValid 
        ? 'Excellent! You\'re properly equipped for safe lab work.' 
        : `Please put on: ${missing.join(', ')}`;
      score = isValid ? 100 : (items.length - missing.length) / items.length * 50;
      if (!isValid) hints.push('Click on the safety equipment icons in the safety panel at the top.');
      break;
    }

    case 'equipment_connected': {
      const sourceId = parts[1];
      const targetId = parts[2];
      isValid = labState.placedEquipment.some(e => 
        e.equipmentId === sourceId && 
        e.connections.some(connId => {
          const connected = labState.placedEquipment.find(eq => eq.id === connId);
          return connected?.equipmentId === targetId;
        })
      );
      feedback = isValid 
        ? 'Connection established successfully!' 
        : 'These components need to be connected. Click on one, then use the Connect button.';
      score = isValid ? 100 : 0;
      if (!isValid) hints.push('Select a component and click "Connect", then select the target component.');
      break;
    }

    case 'chemical_added': {
      const containerId = parts[1];
      const chemicalId = parts[2];
      const container = labState.placedEquipment.find(e => e.equipmentId === containerId);
      isValid = container?.state.contents?.some((c: string) => 
        c.toLowerCase().includes(chemicalId.replace(/_/g, ' ').toLowerCase()) ||
        chemicalId.toLowerCase().includes('water')
      ) || false;
      feedback = isValid 
        ? 'Chemical successfully added to the container.' 
        : 'Add the chemical to the container.';
      score = isValid ? 100 : 0;
      break;
    }

    case 'ph_range': {
      const containerId = parts[1];
      const minPH = parseFloat(parts[2]);
      const maxPH = parseFloat(parts[3]);
      const container = labState.placedEquipment.find(e => e.equipmentId === containerId);
      const currentPH = container?.state.pH || 7;
      isValid = currentPH >= minPH && currentPH <= maxPH;
      feedback = isValid 
        ? `pH ${currentPH} is within the expected range (${minPH}-${maxPH}).` 
        : `Current pH is ${currentPH}. Target range: ${minPH}-${maxPH}`;
      score = isValid ? 100 : Math.max(0, 50 - Math.abs(currentPH - (minPH + maxPH) / 2) * 10);
      break;
    }

    case 'zoom_set': {
      const zoom = parseInt(parts[2]);
      const microscope = labState.placedEquipment.find(e => e.equipmentId === 'microscope');
      isValid = microscope?.state.zoomLevel === zoom;
      feedback = isValid 
        ? `Magnification set to ${zoom}x.` 
        : `Please set magnification to ${zoom}x.`;
      score = isValid ? 100 : 0;
      break;
    }

    case 'specimen_added': {
      const specimenType = parts[2];
      const slide = labState.placedEquipment.find(e => e.equipmentId === 'microscope_slide');
      isValid = slide?.state.contents?.some((c: string) => 
        c.toLowerCase().includes(specimenType.replace(/_/g, ' ').toLowerCase())
      ) || false;
      feedback = isValid 
        ? 'Specimen prepared on slide.' 
        : 'Add the specimen to the slide.';
      score = isValid ? 100 : 0;
      break;
    }

    case 'circuit_complete': {
      const battery = labState.placedEquipment.find(e => 
        e.equipmentId === 'battery_9v' || e.equipmentId === 'battery_12v'
      );
      const hasConnections = battery && battery.connections.length > 0;
      const hasLoad = labState.placedEquipment.some(e => 
        e.equipmentId === 'light_bulb' || e.equipmentId === 'resistor'
      );
      isValid = hasConnections && hasLoad;
      feedback = isValid 
        ? 'Circuit is complete! Current is flowing.' 
        : 'Circuit incomplete. Ensure all components are connected.';
      score = isValid ? 100 : (hasConnections ? 50 : 0) + (hasLoad ? 30 : 0);
      break;
    }

    case 'measurement_taken': {
      const measurementType = parts[1];
      const minValue = parseFloat(parts[2]);
      const maxValue = parseFloat(parts[3]);
      const measurement = labState.results.find(r => r.type === measurementType);
      const value = parseFloat(measurement?.value || '0');
      isValid = value >= minValue && value <= maxValue;
      feedback = isValid 
        ? `Measurement recorded: ${value} (expected ${minValue}-${maxValue})` 
        : 'Take a measurement by activating the measuring equipment.';
      score = isValid ? 100 : 0;
      break;
    }

    case 'observation_recorded': {
      const keyword = parts[1];
      isValid = labState.results.some(r => 
        r.description.toLowerCase().includes(keyword.toLowerCase())
      );
      feedback = isValid 
        ? 'Observation recorded successfully.' 
        : 'Record your observations in the results.';
      score = isValid ? 100 : 0;
      // For observations, we're more lenient
      if (!isValid) {
        isValid = true;
        score = 80;
        feedback = 'Observation step - continue to record what you see.';
      }
      break;
    }

    default:
      isValid = true;
      score = 100;
      feedback = 'Step completed.';
  }

  return { isValid, feedback, score, hints };
}

// Get overall experiment progress
export function calculateExperimentProgress(progress: ExperimentProgress, experiment: GuidedExperiment): number {
  return Math.round((progress.completedSteps.length / experiment.steps.length) * 100);
}

// Get feedback based on overall score
export function getExperimentFeedback(totalScore: number, maxScore: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  message: string;
  suggestions: string[];
} {
  const percentage = (totalScore / maxScore) * 100;
  
  if (percentage >= 90) {
    return {
      grade: 'A',
      message: 'Excellent work! You demonstrated thorough understanding of the experiment.',
      suggestions: ['Try the experiment with different variables', 'Help a classmate understand the concepts'],
    };
  } else if (percentage >= 80) {
    return {
      grade: 'B',
      message: 'Good job! You completed most steps correctly.',
      suggestions: ['Review the steps you missed', 'Try the experiment again for better understanding'],
    };
  } else if (percentage >= 70) {
    return {
      grade: 'C',
      message: 'Satisfactory. You understand the basics but could improve.',
      suggestions: ['Review the learning objectives', 'Practice the safety procedures', 'Ask for help with difficult steps'],
    };
  } else if (percentage >= 60) {
    return {
      grade: 'D',
      message: 'You\'re getting there, but need more practice.',
      suggestions: ['Review the experiment instructions carefully', 'Start with simpler experiments first'],
    };
  } else {
    return {
      grade: 'F',
      message: 'This experiment needs to be repeated. Don\'t give up!',
      suggestions: ['Read all instructions before starting', 'Make sure you understand each step', 'Ask your teacher for guidance'],
    };
  }
}
