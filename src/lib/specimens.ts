// Detailed specimen types with accurate biological structures at each magnification level

export interface CellStructure {
  name: string;
  size: string; // in μm
  description: string;
  minMagnification: number;
  color: string;
  shape: 'circle' | 'ellipse' | 'irregular' | 'rod' | 'disc';
}

export interface SpecimenType {
  id: string;
  name: string;
  category: 'plant' | 'animal' | 'bacterial' | 'blood' | 'protist';
  description: string;
  cellSize: { min: number; max: number }; // in μm
  color: string;
  structures: CellStructure[];
  magnificationViews: {
    level: number;
    description: string;
    visibleStructures: string[];
    imagePattern: string; // CSS pattern for rendering
  }[];
  scientificFacts: string[];
  staining?: string;
}

// Comprehensive specimen catalog
export const SPECIMEN_CATALOG: Record<string, SpecimenType> = {
  // PLANT CELLS
  onion_epidermis: {
    id: 'onion_epidermis',
    name: 'Onion Epidermis',
    category: 'plant',
    description: 'Single layer of cells from onion bulb scale',
    cellSize: { min: 40, max: 80 },
    color: 'transparent',
    structures: [
      { name: 'Cell Wall', size: '0.1-1', description: 'Rigid cellulose layer providing structure', minMagnification: 100, color: '#8B7355', shape: 'irregular' },
      { name: 'Cell Membrane', size: '0.01', description: 'Phospholipid bilayer inside cell wall', minMagnification: 400, color: '#FFE4B5', shape: 'irregular' },
      { name: 'Nucleus', size: '5-10', description: 'Contains genetic material (DNA)', minMagnification: 100, color: '#4A4A4A', shape: 'ellipse' },
      { name: 'Nucleolus', size: '1-2', description: 'Dense region for ribosome production', minMagnification: 400, color: '#2A2A2A', shape: 'circle' },
      { name: 'Cytoplasm', size: 'fills cell', description: 'Gel-like substance containing organelles', minMagnification: 100, color: '#E8E8E8', shape: 'irregular' },
      { name: 'Vacuole', size: '30-50', description: 'Large central vacuole storing water and nutrients', minMagnification: 100, color: '#ADD8E6', shape: 'irregular' },
    ],
    magnificationViews: [
      { 
        level: 40, 
        description: 'Tissue overview - regular brick-like pattern of cells visible',
        visibleStructures: ['Cell wall outlines', 'General cell arrangement'],
        imagePattern: 'repeating-linear-gradient(0deg, rgba(139,115,85,0.3) 1px, transparent 1px), repeating-linear-gradient(90deg, rgba(139,115,85,0.3) 1px, transparent 1px)'
      },
      { 
        level: 100, 
        description: 'Individual cells clearly visible - rectangular shapes with prominent nuclei',
        visibleStructures: ['Cell walls', 'Nucleus', 'Vacuole', 'Cytoplasm'],
        imagePattern: 'repeating-linear-gradient(0deg, rgba(139,115,85,0.5) 2px, transparent 2px), repeating-linear-gradient(90deg, rgba(139,115,85,0.5) 2px, transparent 2px)'
      },
      { 
        level: 400, 
        description: 'Detailed view - nuclear membrane and nucleolus visible, cytoplasmic streaming may be observed',
        visibleStructures: ['Nuclear membrane', 'Nucleolus', 'Cytoplasmic granules', 'Cell membrane'],
        imagePattern: 'radial-gradient(circle at 30% 40%, #4A4A4A 3px, transparent 4px), radial-gradient(circle at 70% 60%, #4A4A4A 3px, transparent 4px)'
      },
      { 
        level: 1000, 
        description: 'Oil immersion - fine nuclear details, chromatin visible as granular material',
        visibleStructures: ['Chromatin', 'Nuclear pores', 'Endoplasmic reticulum near nucleus'],
        imagePattern: 'radial-gradient(circle at 30% 40%, #2A2A2A 1px, #4A4A4A 5px, transparent 8px)'
      },
    ],
    scientificFacts: [
      'Onion cells are ideal for microscopy due to their thin, transparent epidermis',
      'The large central vacuole can occupy up to 90% of cell volume',
      'Cell walls contain cellulose microfibrils arranged in layers',
      'No chloroplasts present - onion bulbs store food, not produce it',
    ],
    staining: 'Iodine (yellow-brown) or Methylene blue (blue nuclei)',
  },

  elodea_leaf: {
    id: 'elodea_leaf',
    name: 'Elodea Leaf Cell',
    category: 'plant',
    description: 'Aquatic plant leaf cells with visible chloroplasts',
    cellSize: { min: 50, max: 100 },
    color: '#228B22',
    structures: [
      { name: 'Cell Wall', size: '0.1-1', description: 'Cellulose structure', minMagnification: 100, color: '#8B7355', shape: 'irregular' },
      { name: 'Chloroplasts', size: '4-10', description: 'Green organelles for photosynthesis', minMagnification: 100, color: '#228B22', shape: 'ellipse' },
      { name: 'Central Vacuole', size: '40-80', description: 'Large water-filled vacuole', minMagnification: 100, color: '#E0FFFF', shape: 'irregular' },
      { name: 'Nucleus', size: '5-8', description: 'Often pushed to cell edge by vacuole', minMagnification: 400, color: '#4A4A4A', shape: 'ellipse' },
      { name: 'Cytoplasmic Streaming', size: 'n/a', description: 'Visible movement of cytoplasm carrying chloroplasts', minMagnification: 400, color: '#90EE90', shape: 'irregular' },
    ],
    magnificationViews: [
      { 
        level: 40, 
        description: 'Leaf structure visible - two cell layers, midrib vein',
        visibleStructures: ['Leaf outline', 'Cell arrangement', 'Green coloration'],
        imagePattern: 'linear-gradient(45deg, rgba(34,139,34,0.3) 25%, transparent 25%)'
      },
      { 
        level: 100, 
        description: 'Individual cells with green chloroplasts around cell periphery',
        visibleStructures: ['Cell walls', 'Chloroplasts', 'Central vacuole'],
        imagePattern: 'radial-gradient(ellipse at 20% 30%, #228B22 3px, transparent 4px), radial-gradient(ellipse at 80% 70%, #228B22 3px, transparent 4px)'
      },
      { 
        level: 400, 
        description: 'Chloroplasts clearly disc-shaped, cytoplasmic streaming visible',
        visibleStructures: ['Individual chloroplasts', 'Nucleus', 'Streaming cytoplasm'],
        imagePattern: 'radial-gradient(ellipse, #228B22 40%, #90EE90 60%, transparent 70%)'
      },
      { 
        level: 1000, 
        description: 'Chloroplast internal structure - grana stacks may be visible as darker regions',
        visibleStructures: ['Chloroplast grana', 'Stroma', 'Thylakoid arrangement'],
        imagePattern: 'repeating-linear-gradient(45deg, #1a5c1a 1px, #228B22 2px, #228B22 4px)'
      },
    ],
    scientificFacts: [
      'Cytoplasmic streaming (cyclosis) moves chloroplasts for optimal light exposure',
      'Chloroplasts contain chlorophyll a and b for light absorption',
      'Each cell may contain 40-50 chloroplasts',
      'Streaming rate increases with temperature up to ~35°C',
    ],
  },

  // ANIMAL CELLS
  human_cheek_cell: {
    id: 'human_cheek_cell',
    name: 'Human Cheek Cell',
    category: 'animal',
    description: 'Squamous epithelial cells from oral mucosa',
    cellSize: { min: 50, max: 80 },
    color: '#FFE4E1',
    structures: [
      { name: 'Cell Membrane', size: '0.01', description: 'Phospholipid bilayer (no cell wall)', minMagnification: 400, color: '#DEB887', shape: 'irregular' },
      { name: 'Nucleus', size: '5-8', description: 'Large, centrally located', minMagnification: 100, color: '#8B4513', shape: 'circle' },
      { name: 'Cytoplasm', size: 'fills cell', description: 'Granular appearance with organelles', minMagnification: 100, color: '#FFF0F5', shape: 'irregular' },
      { name: 'Mitochondria', size: '1-4', description: 'Rod-shaped energy producers', minMagnification: 1000, color: '#CD853F', shape: 'rod' },
      { name: 'Golgi Apparatus', size: '1-2', description: 'Stack of flattened membranes', minMagnification: 1000, color: '#DAA520', shape: 'irregular' },
    ],
    magnificationViews: [
      { 
        level: 40, 
        description: 'Cell clumps visible - irregular flat cells scattered across slide',
        visibleStructures: ['Cell clusters', 'General shape'],
        imagePattern: 'radial-gradient(ellipse at 50% 50%, rgba(255,228,225,0.5) 30%, transparent 70%)'
      },
      { 
        level: 100, 
        description: 'Individual cells clearly visible - flat, irregular shape with dark central nucleus',
        visibleStructures: ['Cell outline', 'Nucleus', 'Cytoplasm'],
        imagePattern: 'radial-gradient(circle at 50% 50%, #8B4513 8px, #FFF0F5 10px, rgba(255,228,225,0.3) 40px, transparent 50px)'
      },
      { 
        level: 400, 
        description: 'Nuclear detail visible - chromatin granules, cytoplasmic granules',
        visibleStructures: ['Nuclear membrane', 'Chromatin', 'Cytoplasmic granules'],
        imagePattern: 'radial-gradient(circle at 50% 50%, #5D3A1A 3px, #8B4513 10px, transparent 15px)'
      },
      { 
        level: 1000, 
        description: 'Oil immersion - mitochondria visible as dark rods, possible Golgi near nucleus',
        visibleStructures: ['Mitochondria', 'Golgi apparatus', 'Nuclear pores'],
        imagePattern: 'radial-gradient(ellipse at 30% 40%, #CD853F 2px, transparent 3px), radial-gradient(ellipse at 60% 55%, #CD853F 2px, transparent 3px)'
      },
    ],
    scientificFacts: [
      'Squamous epithelial cells are flat and scale-like (squamous = scaly)',
      'No cell wall - only flexible cell membrane',
      'Cells are continuously shed and replaced every 3-5 days',
      'Methylene blue stains cytoplasm light blue, nucleus dark blue',
    ],
    staining: 'Methylene blue (1% solution)',
  },

  // BLOOD SAMPLES
  human_blood: {
    id: 'human_blood',
    name: 'Human Blood Smear',
    category: 'blood',
    description: 'Peripheral blood showing various blood cell types',
    cellSize: { min: 6, max: 15 },
    color: '#DC143C',
    structures: [
      { name: 'Red Blood Cells (Erythrocytes)', size: '6-8', description: 'Biconcave discs lacking nucleus', minMagnification: 100, color: '#DC143C', shape: 'disc' },
      { name: 'White Blood Cells (Leukocytes)', size: '10-15', description: 'Nucleated immune cells', minMagnification: 100, color: '#E6E6FA', shape: 'circle' },
      { name: 'Platelets (Thrombocytes)', size: '2-4', description: 'Cell fragments for clotting', minMagnification: 400, color: '#DDA0DD', shape: 'irregular' },
      { name: 'Neutrophil', size: '12-15', description: 'Most common WBC, multi-lobed nucleus', minMagnification: 400, color: '#B0C4DE', shape: 'circle' },
      { name: 'Lymphocyte', size: '7-10', description: 'Large round nucleus, little cytoplasm', minMagnification: 400, color: '#6A5ACD', shape: 'circle' },
      { name: 'Monocyte', size: '15-20', description: 'Largest WBC, kidney-shaped nucleus', minMagnification: 400, color: '#778899', shape: 'irregular' },
    ],
    magnificationViews: [
      { 
        level: 40, 
        description: 'Pink field with scattered cells - even distribution indicates good smear',
        visibleStructures: ['Overall cell distribution', 'Smear quality'],
        imagePattern: 'radial-gradient(circle, rgba(220,20,60,0.6) 2px, transparent 3px)'
      },
      { 
        level: 100, 
        description: 'Individual RBCs visible as pink biconcave discs, occasional larger WBCs',
        visibleStructures: ['Red blood cells', 'White blood cells (larger, bluish)'],
        imagePattern: 'radial-gradient(circle at 30% 30%, rgba(220,20,60,0.8) 4px, transparent 5px), radial-gradient(circle at 70% 60%, rgba(220,20,60,0.8) 4px, transparent 5px)'
      },
      { 
        level: 400, 
        description: 'RBC central pallor visible, WBC nuclei stained purple, platelets visible',
        visibleStructures: ['RBC biconcave shape', 'WBC types', 'Platelet clusters'],
        imagePattern: 'radial-gradient(circle, transparent 1px, rgba(220,20,60,0.7) 2px, rgba(220,20,60,0.5) 5px, transparent 6px)'
      },
      { 
        level: 1000, 
        description: 'Detailed WBC morphology - neutrophil lobes, lymphocyte chromatin, platelet granules',
        visibleStructures: ['Neutrophil segmented nucleus', 'Lymphocyte dense nucleus', 'Platelet granules', 'Hemoglobin coloration'],
        imagePattern: 'radial-gradient(circle, #4B0082 3px, #B0C4DE 6px, transparent 8px)'
      },
    ],
    scientificFacts: [
      'RBCs lack nucleus in mammals - more room for hemoglobin',
      'Normal RBC count: 4.5-5.5 million/μL',
      'Normal WBC count: 4,500-11,000/μL',
      'Neutrophils make up 60-70% of WBCs',
      'Wright or Giemsa stain differentiates cell types',
    ],
    staining: 'Wright-Giemsa stain',
  },

  // BACTERIA
  bacillus: {
    id: 'bacillus',
    name: 'Bacillus (Rod Bacteria)',
    category: 'bacterial',
    description: 'Rod-shaped bacteria, often in chains',
    cellSize: { min: 1, max: 5 },
    color: '#9370DB',
    structures: [
      { name: 'Cell Wall', size: '0.02-0.08', description: 'Peptidoglycan layer (thick in Gram+)', minMagnification: 1000, color: '#9370DB', shape: 'rod' },
      { name: 'Cell Membrane', size: '0.01', description: 'Inner phospholipid membrane', minMagnification: 1000, color: '#DDA0DD', shape: 'rod' },
      { name: 'Nucleoid', size: '0.5-1', description: 'Circular DNA region (no true nucleus)', minMagnification: 1000, color: '#483D8B', shape: 'irregular' },
      { name: 'Ribosomes', size: '0.02', description: '70S ribosomes throughout cytoplasm', minMagnification: 1000, color: '#4B0082', shape: 'circle' },
      { name: 'Flagella', size: '10-20', description: 'Whip-like motility structures (if present)', minMagnification: 1000, color: '#8A2BE2', shape: 'irregular' },
      { name: 'Endospore', size: '1-2', description: 'Dormant survival structure (some species)', minMagnification: 1000, color: '#E6E6FA', shape: 'ellipse' },
    ],
    magnificationViews: [
      { 
        level: 40, 
        description: 'Faint coloration may be visible, individual cells too small',
        visibleStructures: ['General staining area'],
        imagePattern: 'linear-gradient(180deg, rgba(147,112,219,0.2) 0%, rgba(147,112,219,0.1) 100%)'
      },
      { 
        level: 100, 
        description: 'Small colored dots visible - cannot distinguish shape',
        visibleStructures: ['Bacterial colonies', 'General distribution'],
        imagePattern: 'radial-gradient(ellipse at 40% 50%, rgba(147,112,219,0.5) 1px, transparent 2px)'
      },
      { 
        level: 400, 
        description: 'Rod shapes becoming visible, chains may be apparent',
        visibleStructures: ['Cell shape', 'Chain arrangement', 'Gram staining result'],
        imagePattern: 'repeating-linear-gradient(45deg, #9370DB 1px, transparent 1px, transparent 3px)'
      },
      { 
        level: 1000, 
        description: 'Clear rod morphology, endospores visible as unstained areas, possible flagella',
        visibleStructures: ['Individual cells', 'Endospores', 'Cell wall thickness'],
        imagePattern: 'repeating-radial-gradient(ellipse at 50% 50%, #9370DB 1px, #DDA0DD 2px, transparent 4px)'
      },
    ],
    scientificFacts: [
      'Bacillus species can form endospores resistant to heat and chemicals',
      'Gram-positive bacteria have thick peptidoglycan walls (stain purple)',
      'Bacillus subtilis is a model organism for bacterial research',
      'Some species are pathogenic (B. anthracis causes anthrax)',
      'Size range: 1-10 μm long, 0.5-2 μm wide',
    ],
    staining: 'Gram stain (Crystal violet + Safranin)',
  },

  coccus: {
    id: 'coccus',
    name: 'Staphylococcus (Spherical Bacteria)',
    category: 'bacterial',
    description: 'Spherical bacteria in grape-like clusters',
    cellSize: { min: 0.5, max: 1.5 },
    color: '#9370DB',
    structures: [
      { name: 'Cell Wall', size: '0.02-0.04', description: 'Thick peptidoglycan (Gram+)', minMagnification: 1000, color: '#9370DB', shape: 'circle' },
      { name: 'Cell Membrane', size: '0.01', description: 'Phospholipid bilayer', minMagnification: 1000, color: '#DDA0DD', shape: 'circle' },
      { name: 'Nucleoid', size: '0.3-0.5', description: 'Bacterial chromosome', minMagnification: 1000, color: '#483D8B', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Stained area visible, no detail', visibleStructures: ['Colony distribution'], imagePattern: 'rgba(147,112,219,0.2)' },
      { level: 100, description: 'Colored dots in clusters', visibleStructures: ['Cluster arrangement'], imagePattern: 'radial-gradient(circle at 50% 50%, rgba(147,112,219,0.6) 2px, transparent 3px)' },
      { level: 400, description: 'Grape-like clusters visible', visibleStructures: ['Individual cocci', 'Cluster morphology'], imagePattern: 'radial-gradient(circle at 30% 40%, #9370DB 2px, transparent 3px), radial-gradient(circle at 50% 50%, #9370DB 2px, transparent 3px), radial-gradient(circle at 70% 60%, #9370DB 2px, transparent 3px)' },
      { level: 1000, description: 'Clear spherical cells in clusters, dividing cells visible', visibleStructures: ['Cell division', 'Cluster structure'], imagePattern: 'radial-gradient(circle, #9370DB 3px, transparent 4px)' },
    ],
    scientificFacts: [
      'Staphylococcus means "grape cluster" in Greek',
      'S. aureus is a common cause of skin infections',
      'MRSA is methicillin-resistant S. aureus',
      'Cocci are approximately 1 μm in diameter',
    ],
    staining: 'Gram stain',
  },

  // PROTISTS
  paramecium: {
    id: 'paramecium',
    name: 'Paramecium',
    category: 'protist',
    description: 'Single-celled ciliated protist',
    cellSize: { min: 100, max: 300 },
    color: '#98FB98',
    structures: [
      { name: 'Cilia', size: '10-12', description: 'Hair-like projections for movement', minMagnification: 100, color: '#90EE90', shape: 'irregular' },
      { name: 'Oral Groove', size: '30-50', description: 'Funnel for food intake', minMagnification: 100, color: '#3CB371', shape: 'irregular' },
      { name: 'Macronucleus', size: '30-40', description: 'Large nucleus for cell functions', minMagnification: 100, color: '#2E8B57', shape: 'ellipse' },
      { name: 'Micronucleus', size: '3-5', description: 'Small nucleus for reproduction', minMagnification: 400, color: '#006400', shape: 'circle' },
      { name: 'Contractile Vacuoles', size: '10-15', description: 'Star-shaped water regulation organelles', minMagnification: 100, color: '#E0FFFF', shape: 'circle' },
      { name: 'Food Vacuoles', size: '5-10', description: 'Contain ingested bacteria/algae', minMagnification: 400, color: '#8B4513', shape: 'circle' },
    ],
    magnificationViews: [
      { level: 40, description: 'Slipper-shaped organisms visible moving across field', visibleStructures: ['Overall shape', 'Movement'], imagePattern: 'radial-gradient(ellipse at 50% 50%, #98FB98 40%, transparent 60%)' },
      { level: 100, description: 'Cilia visible as fringe, oral groove, contractile vacuoles', visibleStructures: ['Cilia', 'Oral groove', 'Macronucleus', 'Contractile vacuoles'], imagePattern: 'radial-gradient(ellipse at 40% 50%, #2E8B57 10px, #98FB98 50px, transparent 80px)' },
      { level: 400, description: 'Internal structures clear - food vacuoles, both nuclei visible', visibleStructures: ['Food vacuoles', 'Micronucleus', 'Cytoplasmic streaming'], imagePattern: 'radial-gradient(circle at 35% 50%, #006400 3px, #2E8B57 15px, transparent 20px)' },
      { level: 1000, description: 'Detailed ciliary base, trichocysts, internal organelle detail', visibleStructures: ['Basal bodies', 'Trichocysts', 'Food being digested'], imagePattern: 'repeating-radial-gradient(circle at 50% 50%, #8B4513 2px, transparent 3px, transparent 8px)' },
    ],
    scientificFacts: [
      'Paramecium can move 1-3 mm per second using coordinated cilia',
      'They have 2 contractile vacuoles that pump out excess water',
      'Feed primarily on bacteria and small algae',
      'Reproduce asexually by binary fission, sexually by conjugation',
      'Lifespan: 24-48 hours if not dividing',
    ],
  },

  amoeba: {
    id: 'amoeba',
    name: 'Amoeba',
    category: 'protist',
    description: 'Single-celled organism with pseudopods',
    cellSize: { min: 200, max: 700 },
    color: '#D3D3D3',
    structures: [
      { name: 'Pseudopods', size: '50-100', description: 'Temporary extensions for movement and feeding', minMagnification: 40, color: '#C0C0C0', shape: 'irregular' },
      { name: 'Nucleus', size: '20-30', description: 'Visible as distinct round structure', minMagnification: 100, color: '#696969', shape: 'circle' },
      { name: 'Contractile Vacuole', size: '15-25', description: 'Clear circular vacuole for water regulation', minMagnification: 100, color: '#E0FFFF', shape: 'circle' },
      { name: 'Food Vacuoles', size: '10-20', description: 'Contain engulfed food particles', minMagnification: 100, color: '#8B4513', shape: 'circle' },
      { name: 'Ectoplasm', size: 'outer layer', description: 'Clear outer cytoplasm layer', minMagnification: 100, color: '#E8E8E8', shape: 'irregular' },
      { name: 'Endoplasm', size: 'inner core', description: 'Granular inner cytoplasm', minMagnification: 100, color: '#A9A9A9', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Irregular blob-like shape, may see pseudopod extension', visibleStructures: ['Overall shape', 'Pseudopods', 'Movement'], imagePattern: 'radial-gradient(ellipse at 40% 50%, #C0C0C0 30%, transparent 60%)' },
      { level: 100, description: 'Clear ecto/endoplasm distinction, nucleus and vacuoles visible', visibleStructures: ['Nucleus', 'Vacuoles', 'Ectoplasm', 'Endoplasm'], imagePattern: 'radial-gradient(circle at 50% 50%, #696969 10px, #A9A9A9 40px, #E8E8E8 60px, transparent 80px)' },
      { level: 400, description: 'Internal granules, food particles being digested visible', visibleStructures: ['Cytoplasmic granules', 'Food vacuole contents', 'Nuclear membrane'], imagePattern: 'radial-gradient(circle at 40% 45%, #8B4513 5px, transparent 8px), radial-gradient(circle at 60% 55%, #696969 8px, transparent 12px)' },
      { level: 1000, description: 'Detailed nuclear structure, mitochondria may be visible', visibleStructures: ['Nuclear detail', 'Mitochondria', 'Endoplasmic reticulum'], imagePattern: 'repeating-radial-gradient(circle, #696969 1px, transparent 2px, transparent 5px)' },
    ],
    scientificFacts: [
      'Amoeba moves by cytoplasmic streaming into pseudopods',
      'Feeds by phagocytosis - engulfing food with pseudopods',
      'No fixed shape - constantly changing',
      'Reproduces by binary fission',
      'Some species are pathogenic (Naegleria fowleri - brain-eating amoeba)',
    ],
  },

  // NEW SPECIMENS - Blood Cells, Plant Cells, and Bacteria
  
  red_blood_cell: {
    id: 'red_blood_cell',
    name: 'Red Blood Cell (Erythrocyte)',
    category: 'blood',
    description: 'Biconcave disc-shaped cells responsible for oxygen transport',
    cellSize: { min: 6, max: 8 },
    color: '#DC143C',
    structures: [
      { name: 'Cell Membrane', size: '0.01', description: 'Flexible phospholipid bilayer', minMagnification: 400, color: '#CD5C5C', shape: 'disc' },
      { name: 'Hemoglobin', size: 'fills cell', description: 'Iron-containing protein for O₂ binding', minMagnification: 100, color: '#DC143C', shape: 'irregular' },
      { name: 'Central Pallor', size: '2-3', description: 'Lighter center due to biconcave shape', minMagnification: 400, color: '#FFA07A', shape: 'circle' },
    ],
    magnificationViews: [
      { level: 40, description: 'Pink-red field with numerous small discs', visibleStructures: ['Overall distribution'], imagePattern: 'radial-gradient(circle, rgba(220,20,60,0.6) 2px, transparent 3px)' },
      { level: 100, description: 'Individual RBCs visible as pink biconcave discs', visibleStructures: ['Cell shape', 'Uniform size'], imagePattern: 'radial-gradient(circle, rgba(220,20,60,0.8) 4px, transparent 5px)' },
      { level: 400, description: 'Central pallor visible - lighter center due to biconcave shape', visibleStructures: ['Central pallor', 'Cell membrane'], imagePattern: 'radial-gradient(circle, transparent 1px, rgba(220,20,60,0.7) 2px, rgba(220,20,60,0.5) 5px, transparent 6px)' },
      { level: 1000, description: 'Detailed membrane structure, hemoglobin distribution visible', visibleStructures: ['Membrane proteins', 'Hemoglobin concentration'], imagePattern: 'radial-gradient(circle, #FFB6C1 2px, #DC143C 4px, transparent 6px)' },
    ],
    scientificFacts: [
      'RBCs lack a nucleus in mammals - allows more hemoglobin',
      'Each RBC contains ~270 million hemoglobin molecules',
      'Lifespan: approximately 120 days',
      'Body produces ~2 million RBCs per second',
      'Total surface area of all RBCs: ~3,500 square meters',
    ],
    staining: 'Wright-Giemsa stain (eosin component)',
  },

  white_blood_cell: {
    id: 'white_blood_cell',
    name: 'White Blood Cell (Leukocyte)',
    category: 'blood',
    description: 'Nucleated immune cells that defend against infection',
    cellSize: { min: 10, max: 20 },
    color: '#E6E6FA',
    structures: [
      { name: 'Nucleus', size: '5-10', description: 'Various shapes depending on cell type', minMagnification: 100, color: '#4B0082', shape: 'irregular' },
      { name: 'Cytoplasm', size: 'fills cell', description: 'Contains granules in some types', minMagnification: 100, color: '#E6E6FA', shape: 'irregular' },
      { name: 'Granules', size: '0.2-0.5', description: 'Enzyme-containing vesicles', minMagnification: 400, color: '#9370DB', shape: 'circle' },
      { name: 'Cell Membrane', size: '0.01', description: 'Flexible for phagocytosis', minMagnification: 400, color: '#B0C4DE', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Larger cells scattered among smaller RBCs', visibleStructures: ['Size difference from RBCs'], imagePattern: 'radial-gradient(circle, rgba(75,0,130,0.5) 6px, transparent 8px)' },
      { level: 100, description: 'Dark purple nuclei visible, larger than RBCs', visibleStructures: ['Nucleus', 'Cell size'], imagePattern: 'radial-gradient(circle, #4B0082 4px, #E6E6FA 8px, transparent 10px)' },
      { level: 400, description: 'Nuclear shape helps identify cell type', visibleStructures: ['Nuclear lobes', 'Cytoplasm', 'Granules'], imagePattern: 'radial-gradient(circle, #4B0082 3px, #9370DB 5px, #E6E6FA 8px, transparent 10px)' },
      { level: 1000, description: 'Detailed nuclear chromatin, specific granule types visible', visibleStructures: ['Chromatin pattern', 'Specific granules', 'Phagocytic vacuoles'], imagePattern: 'radial-gradient(ellipse, #2E0854 2px, #4B0082 4px, transparent 6px)' },
    ],
    scientificFacts: [
      'Five types: neutrophils, lymphocytes, monocytes, eosinophils, basophils',
      'Neutrophils are most common (60-70% of WBCs)',
      'Can leave blood vessels to fight infection in tissues',
      'Lymphocytes are responsible for antibody production',
      'Abnormal WBC counts indicate infection or disease',
    ],
    staining: 'Wright-Giemsa stain',
  },

  plant_leaf_cell: {
    id: 'plant_leaf_cell',
    name: 'Plant Leaf Cell (Mesophyll)',
    category: 'plant',
    description: 'Photosynthetic cells from leaf interior with abundant chloroplasts',
    cellSize: { min: 30, max: 60 },
    color: '#228B22',
    structures: [
      { name: 'Cell Wall', size: '0.1-1', description: 'Cellulose wall providing structure', minMagnification: 100, color: '#8FBC8F', shape: 'irregular' },
      { name: 'Chloroplasts', size: '4-10', description: 'Green organelles for photosynthesis', minMagnification: 100, color: '#228B22', shape: 'ellipse' },
      { name: 'Central Vacuole', size: '20-40', description: 'Large water-filled vacuole', minMagnification: 100, color: '#E0FFFF', shape: 'irregular' },
      { name: 'Nucleus', size: '5-10', description: 'Often pushed to cell edge', minMagnification: 400, color: '#4A4A4A', shape: 'ellipse' },
      { name: 'Air Spaces', size: '10-20', description: 'Intercellular spaces for gas exchange', minMagnification: 100, color: '#FFFFFF', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Green tissue with visible cell arrangement', visibleStructures: ['Cell walls', 'Green coloration'], imagePattern: 'repeating-linear-gradient(0deg, rgba(34,139,34,0.3) 2px, transparent 2px, transparent 20px)' },
      { level: 100, description: 'Individual cells with green chloroplasts visible', visibleStructures: ['Chloroplasts', 'Cell walls', 'Vacuoles'], imagePattern: 'radial-gradient(ellipse at 30% 40%, #228B22 3px, transparent 4px), radial-gradient(ellipse at 70% 60%, #228B22 3px, transparent 4px)' },
      { level: 400, description: 'Chloroplast distribution, nucleus visible at cell edge', visibleStructures: ['Individual chloroplasts', 'Nucleus', 'Vacuole membrane'], imagePattern: 'radial-gradient(ellipse, #228B22 4px, #90EE90 6px, transparent 8px)' },
      { level: 1000, description: 'Chloroplast internal structure - grana visible as darker regions', visibleStructures: ['Chloroplast grana', 'Stroma', 'Thylakoid stacks'], imagePattern: 'repeating-linear-gradient(45deg, #1a5c1a 1px, #228B22 2px, #228B22 4px)' },
    ],
    scientificFacts: [
      'Mesophyll cells are specialized for photosynthesis',
      'Each cell contains 20-50 chloroplasts',
      'Palisade mesophyll (upper layer) is densely packed',
      'Spongy mesophyll (lower layer) has air spaces for CO₂',
      'Chloroplasts can move within the cell to optimize light capture',
    ],
  },

  root_tip_cell: {
    id: 'root_tip_cell',
    name: 'Root Tip Cell (Meristem)',
    category: 'plant',
    description: 'Rapidly dividing cells from root apex showing mitosis stages',
    cellSize: { min: 15, max: 30 },
    color: '#DDA0DD',
    structures: [
      { name: 'Cell Wall', size: '0.1-0.5', description: 'Thin cellulose wall in young cells', minMagnification: 100, color: '#D8BFD8', shape: 'irregular' },
      { name: 'Nucleus', size: '8-15', description: 'Large nucleus with visible chromosomes during division', minMagnification: 100, color: '#4A4A4A', shape: 'ellipse' },
      { name: 'Chromosomes', size: '1-3', description: 'Visible during cell division stages', minMagnification: 400, color: '#2F4F4F', shape: 'rod' },
      { name: 'Cytoplasm', size: 'fills cell', description: 'Dense cytoplasm in dividing cells', minMagnification: 100, color: '#E6E6FA', shape: 'irregular' },
      { name: 'Cell Plate', size: '5-10', description: 'Forming new cell wall during division', minMagnification: 400, color: '#9370DB', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Root cap and meristem region visible', visibleStructures: ['Root structure', 'Cell zones'], imagePattern: 'linear-gradient(180deg, rgba(221,160,221,0.5) 0%, rgba(221,160,221,0.3) 100%)' },
      { level: 100, description: 'Individual cells visible, some in various mitosis stages', visibleStructures: ['Cell walls', 'Large nuclei', 'Dividing cells'], imagePattern: 'radial-gradient(circle at 50% 50%, #4A4A4A 5px, #E6E6FA 10px, transparent 15px)' },
      { level: 400, description: 'Mitotic stages visible - prophase, metaphase, anaphase, telophase', visibleStructures: ['Chromosomes', 'Spindle fibers', 'Cell plate formation'], imagePattern: 'linear-gradient(90deg, #2F4F4F 2px, transparent 2px), linear-gradient(0deg, #2F4F4F 2px, transparent 2px)' },
      { level: 1000, description: 'Detailed chromosome structure and spindle apparatus', visibleStructures: ['Individual chromosomes', 'Centromeres', 'Microtubules'], imagePattern: 'repeating-linear-gradient(90deg, #2F4F4F 1px, transparent 1px, transparent 3px)' },
    ],
    scientificFacts: [
      'Root tip meristem cells divide every 12-24 hours',
      'Best tissue for observing all mitosis stages',
      'Acetocarmine stain highlights chromosomes',
      'Root cap protects the delicate meristem',
      'Cell division occurs in the zone of cell division behind root cap',
    ],
    staining: 'Acetocarmine or Feulgen stain',
  },

  e_coli: {
    id: 'e_coli',
    name: 'Escherichia coli (E. coli)',
    category: 'bacterial',
    description: 'Common rod-shaped bacterium from intestinal flora',
    cellSize: { min: 1, max: 3 },
    color: '#9370DB',
    structures: [
      { name: 'Cell Wall', size: '0.01-0.02', description: 'Thin peptidoglycan layer (Gram-negative)', minMagnification: 1000, color: '#DDA0DD', shape: 'rod' },
      { name: 'Outer Membrane', size: '0.01', description: 'Lipopolysaccharide layer', minMagnification: 1000, color: '#BA55D3', shape: 'rod' },
      { name: 'Nucleoid', size: '0.5', description: 'Circular chromosome region', minMagnification: 1000, color: '#4B0082', shape: 'irregular' },
      { name: 'Flagella', size: '10-20', description: 'Peritrichous flagella for motility', minMagnification: 1000, color: '#E6E6FA', shape: 'irregular' },
      { name: 'Pili', size: '1-2', description: 'Short hair-like appendages', minMagnification: 1000, color: '#D8BFD8', shape: 'irregular' },
    ],
    magnificationViews: [
      { level: 40, description: 'Stained area visible, individual cells too small', visibleStructures: ['General staining'], imagePattern: 'rgba(147,112,219,0.3)' },
      { level: 100, description: 'Small colored dots visible', visibleStructures: ['Bacterial distribution'], imagePattern: 'radial-gradient(ellipse, rgba(147,112,219,0.5) 1px, transparent 2px)' },
      { level: 400, description: 'Rod shape becoming visible', visibleStructures: ['Cell shape', 'Gram staining result'], imagePattern: 'repeating-linear-gradient(60deg, #9370DB 1px, transparent 1px, transparent 4px)' },
      { level: 1000, description: 'Clear rod morphology, flagella may be visible with special staining', visibleStructures: ['Individual cells', 'Division', 'Flagella (if stained)'], imagePattern: 'repeating-linear-gradient(45deg, #BA55D3 1px, #9370DB 2px, transparent 3px, transparent 5px)' },
    ],
    scientificFacts: [
      'Most E. coli strains are harmless and beneficial',
      'Divides every 20 minutes under optimal conditions',
      'Gram-negative: stains pink/red with Gram stain',
      'Model organism for molecular biology research',
      'Some strains (like O157:H7) can cause severe illness',
    ],
    staining: 'Gram stain (pink/red for Gram-negative)',
  },

  streptococcus: {
    id: 'streptococcus',
    name: 'Streptococcus (Chain Cocci)',
    category: 'bacterial',
    description: 'Spherical bacteria forming chains',
    cellSize: { min: 0.5, max: 2 },
    color: '#9370DB',
    structures: [
      { name: 'Cell Wall', size: '0.02-0.04', description: 'Thick peptidoglycan (Gram-positive)', minMagnification: 1000, color: '#9370DB', shape: 'circle' },
      { name: 'Cell Membrane', size: '0.01', description: 'Phospholipid bilayer', minMagnification: 1000, color: '#DDA0DD', shape: 'circle' },
      { name: 'Nucleoid', size: '0.3', description: 'Bacterial DNA', minMagnification: 1000, color: '#4B0082', shape: 'irregular' },
      { name: 'Capsule', size: '0.1-0.3', description: 'Polysaccharide coat (some species)', minMagnification: 1000, color: '#E6E6FA', shape: 'circle' },
    ],
    magnificationViews: [
      { level: 40, description: 'Purple-stained areas visible', visibleStructures: ['Staining areas'], imagePattern: 'rgba(147,112,219,0.3)' },
      { level: 100, description: 'Colored dots in linear arrangements', visibleStructures: ['Chain patterns'], imagePattern: 'linear-gradient(45deg, rgba(147,112,219,0.6) 2px, transparent 2px, transparent 5px)' },
      { level: 400, description: 'Chain-like arrangement clearly visible', visibleStructures: ['Chains of cocci', 'Gram staining'], imagePattern: 'radial-gradient(circle at 30% 40%, #9370DB 2px, transparent 3px), radial-gradient(circle at 35% 45%, #9370DB 2px, transparent 3px), radial-gradient(circle at 40% 50%, #9370DB 2px, transparent 3px)' },
      { level: 1000, description: 'Individual cocci in chains, dividing cells visible', visibleStructures: ['Cell wall', 'Division plane', 'Capsule'], imagePattern: 'radial-gradient(circle, #9370DB 3px, transparent 4px)' },
    ],
    scientificFacts: [
      'Streptococcus means "twisted berry chain" in Greek',
      'S. pyogenes causes strep throat and scarlet fever',
      'S. pneumoniae causes pneumonia and meningitis',
      'Gram-positive: stains purple with Gram stain',
      'Divide in one plane, forming chains',
    ],
    staining: 'Gram stain (purple for Gram-positive)',
  },

  spirogyra: {
    id: 'spirogyra',
    name: 'Spirogyra (Pond Algae)',
    category: 'plant',
    description: 'Filamentous green algae with spiral chloroplasts',
    cellSize: { min: 100, max: 500 },
    color: '#32CD32',
    structures: [
      { name: 'Cell Wall', size: '1-2', description: 'Cellulose wall with mucilage coating', minMagnification: 40, color: '#98FB98', shape: 'irregular' },
      { name: 'Spiral Chloroplast', size: '10-30', description: 'Ribbon-shaped chloroplast spiraling through cell', minMagnification: 40, color: '#228B22', shape: 'irregular' },
      { name: 'Pyrenoids', size: '2-5', description: 'Protein bodies for starch synthesis', minMagnification: 100, color: '#006400', shape: 'circle' },
      { name: 'Central Vacuole', size: '50-100', description: 'Large vacuole with cell sap', minMagnification: 40, color: '#E0FFFF', shape: 'irregular' },
      { name: 'Nucleus', size: '10-20', description: 'Suspended in cytoplasmic strands', minMagnification: 100, color: '#4A4A4A', shape: 'circle' },
    ],
    magnificationViews: [
      { level: 40, description: 'Green filaments with visible spiral bands', visibleStructures: ['Filament structure', 'Spiral chloroplasts'], imagePattern: 'repeating-linear-gradient(30deg, #228B22 3px, transparent 3px, transparent 10px)' },
      { level: 100, description: 'Individual cells with clear spiral pattern', visibleStructures: ['Cell walls', 'Spiral chloroplast bands', 'Pyrenoids'], imagePattern: 'repeating-linear-gradient(45deg, #228B22 4px, #98FB98 6px, transparent 8px, transparent 12px)' },
      { level: 400, description: 'Detailed chloroplast structure with pyrenoids', visibleStructures: ['Pyrenoid detail', 'Nucleus', 'Cytoplasmic strands'], imagePattern: 'radial-gradient(circle at 50% 50%, #006400 3px, #228B22 8px, transparent 12px)' },
      { level: 1000, description: 'Pyrenoid internal structure, starch grains visible', visibleStructures: ['Starch grains', 'Chloroplast detail', 'Nuclear membrane'], imagePattern: 'radial-gradient(circle, #004d00 2px, #006400 4px, transparent 6px)' },
    ],
    scientificFacts: [
      'Spirogyra has 1-16 spiral chloroplasts per cell',
      'Reproduces sexually by conjugation - cells form bridges',
      'Common in freshwater ponds and slow streams',
      'Individual filaments can grow several centimeters long',
      'Named for spiral-shaped chloroplasts',
    ],
  },
};

// Helper function to get visible structures at a given magnification
export function getVisibleStructures(specimen: SpecimenType, magnification: number): CellStructure[] {
  return specimen.structures.filter(s => s.minMagnification <= magnification);
}

// Get the magnification view data
export function getMagnificationView(specimen: SpecimenType, magnification: number) {
  const levels = [40, 100, 400, 1000];
  const closestLevel = levels.reduce((prev, curr) => 
    Math.abs(curr - magnification) < Math.abs(prev - magnification) ? curr : prev
  );
  return specimen.magnificationViews.find(v => v.level === closestLevel);
}

// Calculate focus quality based on specimen and magnification
export function calculateFocusQuality(
  magnification: number, 
  lightIntensity: number,
  specimenType: SpecimenType
): number {
  // Higher magnification needs more light and more precise focus
  const optimalLight = magnification <= 100 ? 40 : magnification <= 400 ? 60 : 80;
  const lightScore = 100 - Math.abs(lightIntensity - optimalLight);
  
  // Smaller specimens are harder to focus at low magnification
  const sizeScore = specimenType.cellSize.max > 50 || magnification >= 400 ? 100 : 70;
  
  return Math.round((lightScore * 0.6 + sizeScore * 0.4));
}
