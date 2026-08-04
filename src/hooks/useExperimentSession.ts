import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  LabType, 
  PlacedEquipment, 
  ExperimentSession, 
  ExperimentResult, 
  SafetyWarning, 
  EQUIPMENT_CATALOG 
} from '@/types/lab';
import {
  analyzeCircuit,
  calculateBulbBrightness,
  calculateBulbTemperature,
  calculateHeating,
  calculateCooling,
  calculateMicroscopeOptics,
  calculatePH,
  calculateReactionRate,
  COMMON_REACTIONS,
} from '@/lib/labPhysics';

interface SafetyEquipped {
  goggles: boolean;
  gloves: boolean;
  labCoat: boolean;
}

// Extended equipment state with realistic properties
interface ExtendedEquipmentState {
  isActive: boolean;
  // Thermal
  temperature: number;
  volume: number;
  contents: string[];
  isBoiling: boolean;
  evaporationRate: number;
  pH: number;
  color: string;
  // Electrical
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  brightness: number;
  filamentTemp: number;
  // Optical
  zoomLevel: number;
  fieldOfView: number;
  depthOfField: number;
  resolution: number;
  visibleStructures: string[];
  specimenType: string;
  lightIntensity: number;
  focusQuality: number;
}

function getInitialState(equipmentId: string): Partial<ExtendedEquipmentState> {
  const equipment = EQUIPMENT_CATALOG[equipmentId];
  if (!equipment) return { isActive: false };
  
  if (equipment.category === 'glassware') {
    return { 
      isActive: false, 
      temperature: 25, 
      volume: 0, 
      contents: [],
      isBoiling: false,
      evaporationRate: 0,
      pH: 7,
      color: 'transparent',
    };
  }
  if (equipment.category === 'chemicals') {
    const chemProps = equipment.properties;
    return { 
      isActive: false, 
      temperature: 25,
      volume: 50,
      pH: chemProps.pH || 7,
      color: chemProps.color || 'transparent',
      contents: [equipment.name],
    };
  }
  if (equipment.category === 'electrical') {
    return { 
      isActive: false, 
      voltage: 0, 
      current: 0,
      resistance: equipment.properties.resistance || 0,
      power: 0,
      brightness: 0,
      filamentTemp: 25,
    };
  }
  if (equipment.category === 'optical') {
    const optics = calculateMicroscopeOptics(40);
    return { 
      isActive: false, 
      zoomLevel: 40,
      fieldOfView: optics.fieldOfView,
      depthOfField: optics.depthOfField,
      resolution: optics.resolution,
      visibleStructures: [],
      specimenType: 'none',
      lightIntensity: 50,
      focusQuality: 0,
    };
  }
  if (equipment.category === 'heating') {
    return { 
      isActive: false, 
      temperature: 25,
      power: equipment.properties.power || 500,
    };
  }
  return { isActive: false };
}

function createInitialSession(labType: LabType): ExperimentSession {
  return {
    id: crypto.randomUUID(),
    mode: 'free',
    labType,
    placedEquipment: [],
    history: [],
    results: [],
    startTime: new Date(),
    isRunning: false,
    isPaused: false,
    safetyWarnings: [],
  };
}

export function useExperimentSession(labType: LabType) {
  const [session, setSession] = useState<ExperimentSession>(() => createInitialSession(labType));
  const [safetyEquipped, setSafetyEquipped] = useState<SafetyEquipped>({
    goggles: false,
    gloves: false,
    labCoat: false,
  });
  
  // Interval refs for continuous processes
  const heatingIntervals = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const coolingIntervals = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      heatingIntervals.current.forEach(interval => clearInterval(interval));
      coolingIntervals.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  const addEquipment = useCallback((equipmentId: string, position: { x: number; y: number }) => {
    const equipment = EQUIPMENT_CATALOG[equipmentId];
    if (!equipment) return null;

    const placed: PlacedEquipment = {
      id: crypto.randomUUID(),
      equipmentId,
      position,
      state: getInitialState(equipmentId) as PlacedEquipment['state'],
      connections: [],
      data: {},
    };

    setSession(prev => ({
      ...prev,
      placedEquipment: [...prev.placedEquipment, placed],
      history: [...prev.history, {
        id: crypto.randomUUID(),
        type: 'add',
        timestamp: new Date(),
        equipmentId,
        details: { position },
      }],
    }));

    return placed;
  }, []);

  const removeEquipment = useCallback((placedId: string) => {
    // Stop any heating/cooling processes
    if (heatingIntervals.current.has(placedId)) {
      clearInterval(heatingIntervals.current.get(placedId));
      heatingIntervals.current.delete(placedId);
    }
    
    setSession(prev => ({
      ...prev,
      placedEquipment: prev.placedEquipment.filter(e => e.id !== placedId),
      history: [...prev.history, {
        id: crypto.randomUUID(),
        type: 'remove',
        timestamp: new Date(),
        equipmentId: placedId,
        details: {},
      }],
    }));
  }, []);

  const moveEquipment = useCallback((placedId: string, position: { x: number; y: number }) => {
    setSession(prev => ({
      ...prev,
      placedEquipment: prev.placedEquipment.map(e =>
        e.id === placedId ? { ...e, position } : e
      ),
    }));
  }, []);

  const connectEquipment = useCallback((sourceId: string, targetId: string) => {
    setSession(prev => {
      const source = prev.placedEquipment.find(e => e.id === sourceId);
      const target = prev.placedEquipment.find(e => e.id === targetId);
      if (!source || !target) return prev;

      const sourceEquip = EQUIPMENT_CATALOG[source.equipmentId];
      const targetEquip = EQUIPMENT_CATALOG[target.equipmentId];

      const newPlaced = prev.placedEquipment.map(e => {
        if (e.id === sourceId && !e.connections.includes(targetId)) {
          return { ...e, connections: [...e.connections, targetId] };
        }
        if (e.id === targetId && !e.connections.includes(sourceId)) {
          return { ...e, connections: [...e.connections, sourceId] };
        }
        return e;
      });

      toast.success(`Connected ${sourceEquip.name} to ${targetEquip.name}`);

      return {
        ...prev,
        placedEquipment: newPlaced,
        history: [...prev.history, {
          id: crypto.randomUUID(),
          type: 'connect',
          timestamp: new Date(),
          equipmentId: sourceId,
          details: { targetId },
        }],
      };
    });
  }, []);

  const updateEquipmentState = useCallback((placedId: string, stateUpdate: Partial<PlacedEquipment['state']>) => {
    setSession(prev => ({
      ...prev,
      placedEquipment: prev.placedEquipment.map(e =>
        e.id === placedId ? { ...e, state: { ...e.state, ...stateUpdate } } : e
      ),
    }));
  }, []);

  // REALISTIC HEATING with continuous thermal physics
  const heatEquipment = useCallback((placedId: string, heaterId: string) => {
    setSession(prev => {
      const placed = prev.placedEquipment.find(e => e.id === placedId);
      const heater = prev.placedEquipment.find(e => e.id === heaterId);
      if (!placed || !heater) return prev;

      const heaterEquip = EQUIPMENT_CATALOG[heater.equipmentId];
      const targetEquip = EQUIPMENT_CATALOG[placed.equipmentId];
      
      // Get heater power (Watts)
      const power = heaterEquip.properties.power || 
                   (heaterEquip.id === 'bunsen_burner' ? 1500 : 500);
      
      const currentTemp = placed.state.temperature || 25;
      const volume = placed.state.volume || 100;
      const contents = placed.state.contents || ['water'];
      
      // Calculate heating for 5-second increment
      const heating = calculateHeating(currentTemp, volume, power, 5, contents);
      
      const newResults: ExperimentResult[] = [{
        timestamp: new Date(),
        type: 'temperature',
        value: heating.newTemperature,
        unit: '°C',
        description: `${targetEquip.name}: ${heating.newTemperature}°C (heated with ${heaterEquip.name} at ${power}W)`,
      }];

      const newWarnings: SafetyWarning[] = [];
      
      heating.warnings.forEach(warning => {
        newWarnings.push({
          id: crypto.randomUUID(),
          severity: warning.includes('Boiling') ? 'danger' : 'warning',
          message: warning,
          equipmentIds: [placedId],
          timestamp: new Date(),
        });
      });

      if (heating.isBoiling) {
        toast.error(`🔥 Boiling! Volume reduced by ${heating.evaporatedVolume}ml`);
        newResults.push({
          timestamp: new Date(),
          type: 'observation',
          value: 'boiling',
          description: `Vigorous boiling observed. ${heating.evaporatedVolume}ml evaporated.`,
        });
      } else if (heating.newTemperature >= 80) {
        toast.warning(`⚠️ High temperature: ${heating.newTemperature}°C`);
      } else {
        toast.info(`🌡️ Temperature: ${heating.newTemperature}°C`);
      }

      const newVolume = Math.max(0, volume - heating.evaporatedVolume);

      return {
        ...prev,
        placedEquipment: prev.placedEquipment.map(e =>
          e.id === placedId
            ? { 
                ...e, 
                state: { 
                  ...e.state, 
                  temperature: heating.newTemperature, 
                  isActive: true,
                  isBoiling: heating.isBoiling,
                  volume: newVolume,
                  evaporationRate: heating.isBoiling ? heating.evaporatedVolume / 5 * 60 : 0,
                } 
              }
            : e.id === heaterId
              ? { ...e, state: { ...e.state, isActive: true } }
              : e
        ),
        results: [...prev.results, ...newResults],
        safetyWarnings: [...prev.safetyWarnings, ...newWarnings],
      };
    });
  }, []);

  // Add chemical to container with reaction simulation
  const addChemical = useCallback((containerId: string, chemicalId: string) => {
    setSession(prev => {
      const container = prev.placedEquipment.find(e => e.id === containerId);
      const chemical = prev.placedEquipment.find(e => e.id === chemicalId);
      if (!container || !chemical) return prev;

      const chemEquip = EQUIPMENT_CATALOG[chemical.equipmentId];
      const currentContents = container.state.contents || [];
      const newContents = [...currentContents, chemEquip.name];
      
      // Check for reactions
      let newColor = container.state.color || 'transparent';
      let newpH = container.state.pH || 7;
      let tempChange = 0;
      const newResults: ExperimentResult[] = [];
      const newWarnings: SafetyWarning[] = [];
      
      // Check acid-base reactions
      const hasAcid = newContents.some(c => 
        c.includes('Acid') || c.includes('HCl') || c.includes('H₂SO₄')
      );
      const hasBase = newContents.some(c => 
        c.includes('Hydroxide') || c.includes('NaOH') || c.includes('KOH')
      );
      
      if (hasAcid && hasBase) {
        // Neutralization reaction - exothermic!
        tempChange = 15; // Temperature increases
        newpH = 7;
        newColor = 'clear';
        
        newResults.push({
          timestamp: new Date(),
          type: 'observation',
          value: 'neutralization',
          description: 'Neutralization reaction! Acid-base neutralization produces heat and salt + water.',
        });
        
        toast.success('⚗️ Neutralization reaction! Heat released: ΔH = -57.3 kJ/mol');
        
        newWarnings.push({
          id: crypto.randomUUID(),
          severity: 'warning',
          message: 'Exothermic reaction in progress - solution heating up!',
          equipmentIds: [containerId],
          timestamp: new Date(),
        });
      }
      
      // Check for gas-producing reactions
      if (newContents.some(c => c.includes('HCl')) && 
          newContents.some(c => c.includes('Carbonate') || c.includes('NaHCO'))) {
        newResults.push({
          timestamp: new Date(),
          type: 'observation',
          value: 'gas_evolution',
          description: 'CO₂ gas bubbles forming! Reaction: HCl + NaHCO₃ → NaCl + H₂O + CO₂↑',
        });
        toast.info('🫧 Gas bubbles observed - CO₂ being produced!');
      }
      
      // Indicator reactions
      if (newContents.some(c => c.includes('Phenolphthalein'))) {
        if (hasBase && !hasAcid) {
          newColor = 'pink';
          newResults.push({
            timestamp: new Date(),
            type: 'color',
            value: 'pink',
            description: 'Phenolphthalein turns pink in basic solution (pH > 8.2)',
          });
          toast.info('🔬 Color change: Pink (basic solution detected)');
        } else {
          newColor = 'colorless';
        }
      }
      
      // Update pH based on additions
      if (chemEquip.properties.pH !== undefined) {
        const chemPH = chemEquip.properties.pH;
        // Simple mixing approximation
        newpH = (container.state.pH || 7) * 0.5 + chemPH * 0.5;
      }

      const newTemp = (container.state.temperature || 25) + tempChange;

      return {
        ...prev,
        placedEquipment: prev.placedEquipment.map(e =>
          e.id === containerId
            ? { 
                ...e, 
                state: { 
                  ...e.state, 
                  contents: newContents,
                  color: newColor,
                  pH: Math.round(newpH * 10) / 10,
                  temperature: newTemp,
                  volume: (e.state.volume || 0) + 50,
                } 
              }
            : e
        ),
        results: [...prev.results, ...newResults],
        safetyWarnings: [...prev.safetyWarnings, ...newWarnings],
      };
    });
  }, []);

  // REALISTIC CIRCUIT with Ohm's Law and Kirchhoff's laws
  const calculateCircuit = useCallback((batteryId: string) => {
    setSession(prev => {
      const battery = prev.placedEquipment.find(e => e.id === batteryId);
      if (!battery) return prev;

      // Build component map for analysis
      const components = new Map<string, {
        type: string;
        voltage?: number;
        resistance?: number;
        isOpen?: boolean;
        connections: string[];
      }>();
      
      // Find all connected components using BFS
      const connectedIds = new Set<string>();
      const queue = [batteryId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (connectedIds.has(currentId)) continue;
        connectedIds.add(currentId);
        
        const current = prev.placedEquipment.find(e => e.id === currentId);
        if (current) {
          const equip = EQUIPMENT_CATALOG[current.equipmentId];
          components.set(currentId, {
            type: current.equipmentId,
            voltage: equip.properties.voltage,
            resistance: equip.properties.resistance,
            isOpen: current.state.isActive === false && equip.id === 'switch',
            connections: current.connections,
          });
          
          current.connections.forEach(id => {
            if (!connectedIds.has(id)) queue.push(id);
          });
        }
      }

      // Analyze circuit using physics engine
      const analysis = analyzeCircuit(components);
      
      const newResults: ExperimentResult[] = [];
      const newWarnings: SafetyWarning[] = [];

      if (!analysis.isComplete) {
        toast.warning('Circuit incomplete - check connections');
        newResults.push({
          timestamp: new Date(),
          type: 'observation',
          value: 'incomplete',
          description: 'Circuit is not complete. No current flows.',
        });
      } else {
        // Update all components with calculated values
        const newPlaced = prev.placedEquipment.map(placed => {
          if (!connectedIds.has(placed.id)) return placed;
          
          const componentData = analysis.components.get(placed.id);
          if (!componentData) return placed;
          
          if (placed.equipmentId === 'light_bulb') {
            const brightness = calculateBulbBrightness(
              componentData.power, 
              40, // rated power
              componentData.temperature
            );
            
            return {
              ...placed,
              state: { 
                ...placed.state, 
                isActive: analysis.totalCurrent > 0.01,
                brightness,
                voltage: componentData.voltage,
                current: analysis.totalCurrent,
                power: componentData.power,
                filamentTemp: componentData.temperature,
                resistance: componentData.resistance,
              },
            };
          } else if (EQUIPMENT_CATALOG[placed.equipmentId].category === 'electrical') {
            return {
              ...placed,
              state: { 
                ...placed.state, 
                voltage: componentData.voltage,
                current: analysis.totalCurrent,
                power: componentData.power,
                temperature: componentData.temperature,
              },
            };
          }
          return placed;
        });

        newResults.push(
          { 
            timestamp: new Date(), 
            type: 'voltage', 
            value: analysis.totalVoltage.toFixed(2), 
            unit: 'V', 
            description: `EMF: ${analysis.totalVoltage.toFixed(2)}V` 
          },
          { 
            timestamp: new Date(), 
            type: 'measurement', 
            value: (analysis.totalCurrent * 1000).toFixed(1), 
            unit: 'mA', 
            description: `Current: ${(analysis.totalCurrent * 1000).toFixed(1)}mA (I = V/R = ${analysis.totalVoltage}V / ${analysis.totalResistance.toFixed(1)}Ω)` 
          },
          { 
            timestamp: new Date(), 
            type: 'measurement', 
            value: analysis.totalPower.toFixed(3), 
            unit: 'W', 
            description: `Power: ${analysis.totalPower.toFixed(3)}W (P = IV = ${(analysis.totalCurrent * 1000).toFixed(1)}mA × ${analysis.totalVoltage}V)` 
          },
        );

        analysis.warnings.forEach(warning => {
          newWarnings.push({
            id: crypto.randomUUID(),
            severity: warning.includes('Risk') ? 'danger' : 'warning',
            message: warning,
            equipmentIds: Array.from(connectedIds),
            timestamp: new Date(),
          });
          toast.warning(warning);
        });

        toast.success(
          `⚡ Circuit: V=${analysis.totalVoltage}V, I=${(analysis.totalCurrent * 1000).toFixed(1)}mA, P=${analysis.totalPower.toFixed(3)}W`
        );

        return {
          ...prev,
          placedEquipment: newPlaced,
          results: [...prev.results, ...newResults],
          safetyWarnings: [...prev.safetyWarnings, ...newWarnings],
        };
      }

      return {
        ...prev,
        results: [...prev.results, ...newResults],
        safetyWarnings: [...prev.safetyWarnings, ...newWarnings],
      };
    });
  }, []);

  // REALISTIC MICROSCOPE with optical physics
  const setMicroscopeZoom = useCallback((placedId: string, zoomLevel: number) => {
    setSession(prev => {
      const placed = prev.placedEquipment.find(e => e.id === placedId);
      if (!placed) return prev;
      
      // Calculate optical properties
      const na = zoomLevel <= 40 ? 0.1 : zoomLevel <= 100 ? 0.25 : zoomLevel <= 400 ? 0.65 : 1.25;
      const optics = calculateMicroscopeOptics(zoomLevel, na);
      
      // Check for connected slide
      const hasSlide = prev.placedEquipment.some(e => 
        e.equipmentId === 'microscope_slide' && 
        placed.connections.includes(e.id)
      );
      
      // Determine specimen type from connected slide
      const slide = prev.placedEquipment.find(e => 
        e.equipmentId === 'microscope_slide' && 
        placed.connections.includes(e.id)
      );
      const specimenType = slide?.state.contents?.[0] || 'onion_cell';

      const newResults: ExperimentResult[] = [{
        timestamp: new Date(),
        type: 'observation',
        value: zoomLevel,
        unit: 'x',
        description: `Magnification: ${zoomLevel}x | Field of view: ${optics.fieldOfView}mm | Resolution: ${optics.resolution}μm`,
      }];

      if (hasSlide && zoomLevel >= 400) {
        newResults.push({
          timestamp: new Date(),
          type: 'observation',
          value: optics.visibleStructures.join(', '),
          description: `Visible at ${zoomLevel}x: ${optics.visibleStructures.slice(0, 3).join(', ')}`,
        });
      }

      toast.info(`🔬 ${zoomLevel}x: FOV ${optics.fieldOfView}mm, DOF ${optics.depthOfField}μm, Resolution ${optics.resolution}μm`);

      return {
        ...prev,
        placedEquipment: prev.placedEquipment.map(e =>
          e.id === placedId 
            ? { 
                ...e, 
                state: { 
                  ...e.state, 
                  zoomLevel, 
                  isActive: true,
                  fieldOfView: optics.fieldOfView,
                  depthOfField: optics.depthOfField,
                  resolution: optics.resolution,
                  visibleStructures: optics.visibleStructures,
                  specimenType,
                  focusQuality: hasSlide ? 85 : 0,
                } 
              } 
            : e
        ),
        results: [...prev.results, ...newResults],
      };
    });
  }, []);

  // Set microscope light intensity
  const setMicroscopeLight = useCallback((placedId: string, intensity: number) => {
    updateEquipmentState(placedId, { lightIntensity: intensity });
    toast.info(`💡 Light intensity: ${intensity}%`);
  }, [updateEquipmentState]);

  // Add specimen to slide
  const addSpecimenToSlide = useCallback((slideId: string, specimenType: string) => {
    setSession(prev => ({
      ...prev,
      placedEquipment: prev.placedEquipment.map(e =>
        e.id === slideId
          ? { 
              ...e, 
              state: { 
                ...e.state, 
                contents: [specimenType],
              } 
            }
          : e
      ),
    }));
    toast.success(`🧫 Added ${specimenType} specimen to slide`);
  }, []);

  const addSafetyWarning = useCallback((severity: SafetyWarning['severity'], message: string, equipmentIds: string[]) => {
    const warning: SafetyWarning = {
      id: crypto.randomUUID(),
      severity,
      message,
      equipmentIds,
      timestamp: new Date(),
    };
    setSession(prev => ({
      ...prev,
      safetyWarnings: [...prev.safetyWarnings, warning],
    }));
    if (severity === 'danger' || severity === 'critical') {
      toast.error(message);
    } else if (severity === 'warning') {
      toast.warning(message);
    }
  }, []);

  const toggleSafetyEquipment = useCallback((item: keyof SafetyEquipped) => {
    setSafetyEquipped(prev => ({ ...prev, [item]: !prev[item] }));
  }, []);

  const startExperiment = useCallback(() => {
    setSession(prev => ({ ...prev, isRunning: true, isPaused: false }));
    toast.success('Experiment started!');
  }, []);

  const pauseExperiment = useCallback(() => {
    setSession(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeExperiment = useCallback(() => {
    setSession(prev => ({ ...prev, isPaused: false }));
  }, []);

  const resetExperiment = useCallback(() => {
    heatingIntervals.current.forEach(interval => clearInterval(interval));
    heatingIntervals.current.clear();
    setSession(createInitialSession(labType));
    toast.info('Experiment reset');
  }, [labType]);

  const undo = useCallback(() => {
    setSession(prev => {
      if (prev.history.length === 0) return prev;
      return {
        ...prev,
        placedEquipment: prev.placedEquipment.slice(0, -1),
        history: prev.history.slice(0, -1),
      };
    });
  }, []);

  const addResult = useCallback((result: ExperimentResult) => {
    setSession(prev => ({ ...prev, results: [...prev.results, result] }));
  }, []);

  const dismissWarning = useCallback((warningId: string) => {
    setSession(prev => ({
      ...prev,
      safetyWarnings: prev.safetyWarnings.filter(w => w.id !== warningId),
    }));
  }, []);

  return {
    session,
    safetyEquipped,
    addEquipment,
    removeEquipment,
    moveEquipment,
    connectEquipment,
    updateEquipmentState,
    heatEquipment,
    addChemical,
    calculateCircuit,
    setMicroscopeZoom,
    setMicroscopeLight,
    addSpecimenToSlide,
    toggleSafetyEquipment,
    startExperiment,
    pauseExperiment,
    resumeExperiment,
    resetExperiment,
    undo,
    addResult,
    dismissWarning,
    addSafetyWarning,
  };
}
