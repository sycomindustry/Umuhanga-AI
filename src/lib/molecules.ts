// Molecular structures for the Umuhanga AI molecular visualisation bench.
// Coordinates are in Angstrom-like units, scaled for display.

export interface MolAtom {
  el: string;
  pos: [number, number, number];
}

export interface MolBond {
  a: number;
  b: number;
  order: 1 | 2 | 3;
}

export interface Molecule {
  id: string;
  name: string;
  formula: string;
  shape: string;
  bonding: string;
  explanation: string;
  atoms: MolAtom[];
  bonds: MolBond[];
}

export const ATOM_STYLE: Record<string, { color: string; radius: number }> = {
  H: { color: "#f8fafc", radius: 0.3 },
  C: { color: "#334155", radius: 0.5 },
  N: { color: "#3b82f6", radius: 0.48 },
  O: { color: "#ef4444", radius: 0.46 },
  Na: { color: "#a855f7", radius: 0.6 },
  Cl: { color: "#22c55e", radius: 0.55 },
  S: { color: "#eab308", radius: 0.55 },
};

export const MOLECULES: Molecule[] = [
  {
    id: "water",
    name: "Water",
    formula: "H₂O",
    shape: "Bent (104.5°)",
    bonding: "Polar covalent",
    explanation:
      "Two lone pairs on oxygen push the O–H bonds together, giving a bent shape. The uneven sharing of electrons makes water polar, which is why it dissolves salts and acids so well.",
    atoms: [
      { el: "O", pos: [0, 0, 0] },
      { el: "H", pos: [0.76, 0.59, 0] },
      { el: "H", pos: [-0.76, 0.59, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  {
    id: "co2",
    name: "Carbon dioxide",
    formula: "CO₂",
    shape: "Linear (180°)",
    bonding: "Two double bonds",
    explanation:
      "Carbon shares two pairs of electrons with each oxygen. The two double bonds repel equally, so the molecule is linear and non-polar overall.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "O", pos: [1.16, 0, 0] },
      { el: "O", pos: [-1.16, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  {
    id: "methane",
    name: "Methane",
    formula: "CH₄",
    shape: "Tetrahedral (109.5°)",
    bonding: "Four single covalent bonds",
    explanation:
      "Carbon forms four equal bonds that spread as far apart as possible in 3D, producing a tetrahedron. Methane is the simplest hydrocarbon and burns to give CO₂ and H₂O.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "H", pos: [0.63, 0.63, 0.63] },
      { el: "H", pos: [-0.63, -0.63, 0.63] },
      { el: "H", pos: [-0.63, 0.63, -0.63] },
      { el: "H", pos: [0.63, -0.63, -0.63] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
  },
  {
    id: "ammonia",
    name: "Ammonia",
    formula: "NH₃",
    shape: "Trigonal pyramidal (107°)",
    bonding: "Polar covalent + lone pair",
    explanation:
      "Nitrogen keeps one lone pair, which squeezes the three N–H bonds into a pyramid. That lone pair also lets ammonia act as a base by accepting a proton.",
    atoms: [
      { el: "N", pos: [0, 0.25, 0] },
      { el: "H", pos: [0.94, -0.2, 0] },
      { el: "H", pos: [-0.47, -0.2, 0.81] },
      { el: "H", pos: [-0.47, -0.2, -0.81] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
    ],
  },
  {
    id: "hcl",
    name: "Hydrogen chloride",
    formula: "HCl",
    shape: "Linear diatomic",
    bonding: "Very polar covalent",
    explanation:
      "Chlorine pulls the shared pair strongly. In water the bond breaks completely, releasing H⁺ — this is why hydrochloric acid is a strong acid.",
    atoms: [
      { el: "H", pos: [-0.64, 0, 0] },
      { el: "Cl", pos: [0.64, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: "nacl",
    name: "Sodium chloride",
    formula: "NaCl",
    shape: "Ionic pair (lattice unit)",
    bonding: "Ionic",
    explanation:
      "Sodium loses its single outer electron to chlorine. The resulting Na⁺ and Cl⁻ ions attract each other electrostatically and stack into a giant cubic lattice.",
    atoms: [
      { el: "Na", pos: [-0.9, 0, 0] },
      { el: "Cl", pos: [0.9, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  {
    id: "o2",
    name: "Oxygen",
    formula: "O₂",
    shape: "Linear diatomic",
    bonding: "Double covalent",
    explanation:
      "Two oxygen atoms share two pairs of electrons. Breaking this strong double bond is what makes combustion reactions release so much energy.",
    atoms: [
      { el: "O", pos: [-0.6, 0, 0] },
      { el: "O", pos: [0.6, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 2 }],
  },
  {
    id: "ethanol",
    name: "Ethanol",
    formula: "C₂H₅OH",
    shape: "Chain with –OH group",
    bonding: "Covalent, hydrogen bonding",
    explanation:
      "The –OH group can hydrogen-bond with water, so ethanol mixes with water in all proportions while still dissolving many non-polar substances.",
    atoms: [
      { el: "C", pos: [-1.2, 0, 0] },
      { el: "C", pos: [0.1, 0.5, 0] },
      { el: "O", pos: [1.15, -0.45, 0] },
      { el: "H", pos: [1.98, 0.05, 0] },
      { el: "H", pos: [-1.9, 0.85, 0] },
      { el: "H", pos: [-1.35, -0.6, 0.9] },
      { el: "H", pos: [-1.35, -0.6, -0.9] },
      { el: "H", pos: [0.25, 1.15, 0.88] },
      { el: "H", pos: [0.25, 1.15, -0.88] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 2, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
      { a: 0, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 1, b: 8, order: 1 },
    ],
  },
];
