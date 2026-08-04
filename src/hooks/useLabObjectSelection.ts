import { useState, useCallback } from "react";

export interface LabObject {
  id: string;
  name: string;
  description: string;
  category: "equipment" | "component" | "organism" | "chemical";
  properties?: Record<string, string | number>;
}

export const useLabObjectSelection = () => {
  const [selectedObject, setSelectedObject] = useState<LabObject | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  const selectObject = useCallback((object: LabObject | null) => {
    setSelectedObject(object);
  }, []);

  const hoverObject = useCallback((objectId: string | null) => {
    setHoveredObject(objectId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedObject(null);
    setHoveredObject(null);
  }, []);

  return {
    selectedObject,
    hoveredObject,
    selectObject,
    hoverObject,
    clearSelection,
  };
};

// Lab object definitions for each simulation type
export const PHYSICS_OBJECTS: Record<string, LabObject> = {
  battery: {
    id: "battery",
    name: "Battery",
    description: "A power source that provides electrical energy through chemical reactions. The voltage determines the electrical potential difference.",
    category: "component",
    properties: { type: "DC Power Source", "typical voltage": "1.5V - 12V" }
  },
  bulb: {
    id: "bulb",
    name: "Light Bulb",
    description: "Converts electrical energy into light and heat. The brightness depends on the power (P = V × I).",
    category: "component",
    properties: { type: "Incandescent", function: "Energy conversion" }
  },
  resistor: {
    id: "resistor",
    name: "Resistor",
    description: "Limits the flow of electrical current. Resistance is measured in Ohms (Ω). Color bands indicate resistance value.",
    category: "component",
    properties: { unit: "Ohms (Ω)", formula: "V = I × R" }
  },
  wire: {
    id: "wire",
    name: "Conductor Wire",
    description: "Allows electrical current to flow between components. Made of conductive materials like copper.",
    category: "component",
    properties: { material: "Copper", function: "Current carrier" }
  },
  circuitBoard: {
    id: "circuitBoard",
    name: "Circuit Board",
    description: "A platform that holds and connects electronic components. Provides structural support and electrical connections.",
    category: "equipment",
    properties: { material: "Fiberglass/PCB", function: "Component mounting" }
  }
};

export const CHEMISTRY_OBJECTS: Record<string, LabObject> = {
  beaker: {
    id: "beaker",
    name: "Beaker",
    description: "A cylindrical glass container used for mixing, heating, and storing chemicals. Graduated markings show volume.",
    category: "equipment",
    properties: { material: "Borosilicate glass", capacity: "50-1000 mL" }
  },
  bunsenBurner: {
    id: "bunsenBurner",
    name: "Bunsen Burner",
    description: "A gas burner that produces a single open flame for heating. The flame color indicates combustion efficiency.",
    category: "equipment",
    properties: { fuel: "Natural gas", "max temp": "~1500°C" }
  },
  stirrer: {
    id: "stirrer",
    name: "Stirring Rod",
    description: "Used to mix solutions and distribute heat evenly. Made of glass or magnetic material.",
    category: "equipment",
    properties: { material: "Glass/PTFE", function: "Mixing" }
  },
  thermometer: {
    id: "thermometer",
    name: "Thermometer",
    description: "Measures temperature of solutions. Essential for monitoring reaction conditions.",
    category: "equipment",
    properties: { range: "-10°C to 110°C", type: "Mercury/Digital" }
  },
  labBench: {
    id: "labBench",
    name: "Laboratory Bench",
    description: "A sturdy work surface designed for chemical experiments. Usually resistant to heat and chemicals.",
    category: "equipment",
    properties: { material: "Epoxy resin", function: "Work surface" }
  }
};

export const BIOLOGY_OBJECTS: Record<string, LabObject> = {
  microscope: {
    id: "microscope",
    name: "Microscope",
    description: "An optical instrument that magnifies small objects. Uses lenses to focus light and enlarge specimens.",
    category: "equipment",
    properties: { magnification: "4x - 100x", type: "Compound" }
  },
  petriDish: {
    id: "petriDish",
    name: "Petri Dish",
    description: "A shallow cylindrical dish used to culture cells and microorganisms. Contains growth medium.",
    category: "equipment",
    properties: { diameter: "90mm", material: "Glass/Plastic" }
  },
  cell: {
    id: "cell",
    name: "Cell Specimen",
    description: "The basic structural unit of all living organisms. Contains organelles that perform specific functions.",
    category: "organism",
    properties: { type: "Plant/Animal", size: "10-100 μm" }
  },
  nucleus: {
    id: "nucleus",
    name: "Nucleus",
    description: "The control center of the cell. Contains DNA and controls cell activities and reproduction.",
    category: "organism",
    properties: { function: "Genetic control", contains: "DNA/Chromosomes" }
  },
  mitochondria: {
    id: "mitochondria",
    name: "Mitochondria",
    description: "The powerhouse of the cell. Produces ATP through cellular respiration.",
    category: "organism",
    properties: { function: "Energy production", process: "Cellular respiration" }
  },
  chloroplast: {
    id: "chloroplast",
    name: "Chloroplast",
    description: "Found only in plant cells. Contains chlorophyll and performs photosynthesis to produce glucose.",
    category: "organism",
    properties: { function: "Photosynthesis", pigment: "Chlorophyll" }
  },
  vacuole: {
    id: "vacuole",
    name: "Vacuole",
    description: "A storage organelle that holds water, nutrients, and waste. Larger in plant cells.",
    category: "organism",
    properties: { function: "Storage", contents: "Water/Nutrients" }
  },
  slide: {
    id: "slide",
    name: "Glass Slide",
    description: "A thin flat piece of glass used to hold specimens for microscopic examination.",
    category: "equipment",
    properties: { dimensions: "75mm x 25mm", material: "Glass" }
  }
};
