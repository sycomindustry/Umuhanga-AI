-- Create lab equipment table for admin management
CREATE TABLE public.lab_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'component', 'organism', 'chemical', 'measurement', 'safety', 'container', 'tool')),
  lab_type TEXT NOT NULL CHECK (lab_type IN ('physics', 'chemistry', 'biology', 'all')),
  properties JSONB DEFAULT '{}'::jsonb,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  safety_level TEXT DEFAULT 'safe' CHECK (safety_level IN ('safe', 'caution', 'danger')),
  usage_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;

-- Everyone can view active equipment
CREATE POLICY "Everyone can view active equipment"
ON public.lab_equipment
FOR SELECT
USING (is_active = true);

-- Admins and lab techs can manage equipment
CREATE POLICY "Admins can manage equipment"
ON public.lab_equipment
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lab_tech'::app_role));

-- Create experiment_equipment junction table for linking equipment to experiments
CREATE TABLE public.experiment_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES public.lab_equipment(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(experiment_id, equipment_id)
);

-- Enable RLS
ALTER TABLE public.experiment_equipment ENABLE ROW LEVEL SECURITY;

-- Everyone can view experiment equipment
CREATE POLICY "Everyone can view experiment equipment"
ON public.experiment_equipment
FOR SELECT
USING (true);

-- Admins can manage experiment equipment
CREATE POLICY "Admins can manage experiment equipment"
ON public.experiment_equipment
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_lab_sessions to track user lab activity
CREATE TABLE public.user_lab_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  selected_equipment JSONB DEFAULT '[]'::jsonb,
  session_data JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Enable RLS
ALTER TABLE public.user_lab_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sessions
CREATE POLICY "Users can manage own lab sessions"
ON public.user_lab_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Teachers can view student sessions
CREATE POLICY "Teachers can view student sessions"
ON public.user_lab_sessions
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Insert comprehensive lab equipment data
INSERT INTO public.lab_equipment (name, description, category, lab_type, properties, safety_level, usage_instructions) VALUES
-- PHYSICS EQUIPMENT
('Battery (1.5V)', 'Standard AA/AAA battery providing 1.5V DC power for simple circuits.', 'component', 'physics', '{"voltage": "1.5V", "type": "Alkaline"}', 'safe', 'Connect positive terminal to positive lead and negative to negative.'),
('Battery (9V)', 'Nine-volt battery for higher voltage circuit experiments.', 'component', 'physics', '{"voltage": "9V", "type": "Alkaline"}', 'safe', 'Use battery clips for connection. Do not short circuit.'),
('Battery (12V)', 'Rechargeable 12V battery for advanced experiments.', 'component', 'physics', '{"voltage": "12V", "type": "Lead-acid"}', 'caution', 'Handle with care. Ensure proper ventilation.'),
('Light Bulb (LED)', 'Energy-efficient LED bulb for circuit demonstrations.', 'component', 'physics', '{"power": "3W", "voltage": "3-12V"}', 'safe', 'Observe polarity. Long leg is positive.'),
('Light Bulb (Incandescent)', 'Traditional incandescent bulb showing energy conversion.', 'component', 'physics', '{"power": "25W", "voltage": "12V"}', 'caution', 'Gets hot during operation. Allow cooling before handling.'),
('Resistor Set', 'Assorted resistors from 10Ω to 10MΩ with color codes.', 'component', 'physics', '{"range": "10Ω-10MΩ", "tolerance": "5%"}', 'safe', 'Read color bands to identify resistance value.'),
('Capacitor Set', 'Electrolytic and ceramic capacitors for timing circuits.', 'component', 'physics', '{"range": "1μF-1000μF", "types": "Electrolytic/Ceramic"}', 'caution', 'Observe polarity on electrolytic capacitors.'),
('Multimeter', 'Digital multimeter for measuring voltage, current, and resistance.', 'measurement', 'physics', '{"modes": "V/A/Ω", "accuracy": "0.5%"}', 'safe', 'Select correct mode before measuring. Never measure current across voltage source.'),
('Ammeter', 'Analog ammeter for measuring electric current.', 'measurement', 'physics', '{"range": "0-5A", "type": "Analog"}', 'safe', 'Connect in series with circuit. Start with highest range.'),
('Voltmeter', 'Analog voltmeter for measuring potential difference.', 'measurement', 'physics', '{"range": "0-30V", "type": "Analog"}', 'safe', 'Connect in parallel across components.'),
('Oscilloscope', 'Digital oscilloscope for visualizing electrical waveforms.', 'equipment', 'physics', '{"bandwidth": "100MHz", "channels": 2}', 'safe', 'Adjust timebase and voltage scale for clear display.'),
('Power Supply Unit', 'Variable DC power supply with current limiting.', 'equipment', 'physics', '{"voltage": "0-30V", "current": "0-5A"}', 'caution', 'Set current limit before connecting load.'),
('Breadboard', 'Solderless breadboard for prototyping circuits.', 'equipment', 'physics', '{"points": 830, "rails": 2}', 'safe', 'Insert components gently. Check connections match circuit diagram.'),
('Connecting Wires', 'Insulated copper wires with alligator clips.', 'component', 'physics', '{"gauge": "22 AWG", "length": "30cm"}', 'safe', 'Ensure secure connections to prevent sparking.'),
('Switch (SPST)', 'Single pole single throw switch for circuit control.', 'component', 'physics', '{"type": "Toggle", "rating": "6A"}', 'safe', 'Use for simple on/off circuit control.'),
('Magnet Set', 'Bar and horseshoe magnets for electromagnetic experiments.', 'equipment', 'physics', '{"types": "Bar/Horseshoe", "strength": "N35"}', 'safe', 'Keep away from electronic devices and credit cards.'),
('Iron Filings', 'Fine iron particles for visualizing magnetic fields.', 'component', 'physics', '{"weight": "250g", "purity": "99%"}', 'safe', 'Place paper over magnet, then sprinkle filings.'),
('Compass', 'Magnetic compass for direction and field detection.', 'measurement', 'physics', '{"type": "Magnetic", "accuracy": "1°"}', 'safe', 'Keep away from magnets when not in use.'),
('Prism', 'Glass prism for light refraction experiments.', 'equipment', 'physics', '{"material": "Glass", "angle": "60°"}', 'safe', 'Handle carefully. Clean with lens tissue only.'),
('Lens Set', 'Convex and concave lenses for optics experiments.', 'equipment', 'physics', '{"types": "Convex/Concave", "focal lengths": "5-20cm"}', 'safe', 'Mount on optical bench. Keep clean.'),
('Mirror Set', 'Plane, concave, and convex mirrors.', 'equipment', 'physics', '{"types": "Plane/Concave/Convex", "diameter": "75mm"}', 'safe', 'Handle by edges. Store in protective case.'),
('Laser Pointer', 'Red laser for optical experiments.', 'equipment', 'physics', '{"wavelength": "650nm", "power": "5mW"}', 'caution', 'Never point at eyes or reflective surfaces.'),
('Pendulum Set', 'Adjustable pendulum for studying periodic motion.', 'equipment', 'physics', '{"lengths": "10-100cm", "bobs": "3 sizes"}', 'safe', 'Ensure secure mounting before use.'),
('Spring Set', 'Springs of various stiffness for Hooke''s law.', 'equipment', 'physics', '{"spring constants": "5-50 N/m", "quantity": 5}', 'safe', 'Do not overstretch. Record initial length.'),
('Pulley System', 'Single and block-and-tackle pulleys.', 'equipment', 'physics', '{"types": "Single/Double/Triple", "diameter": "50mm"}', 'safe', 'Check rope condition before use.'),
('Inclined Plane', 'Adjustable ramp for studying motion and friction.', 'equipment', 'physics', '{"angle range": "0-60°", "length": "1m"}', 'safe', 'Secure base before adjusting angle.'),
('Stopwatch', 'Digital stopwatch with lap timing.', 'measurement', 'physics', '{"accuracy": "0.01s", "memory": "100 laps"}', 'safe', 'Reset before each experiment.'),
('Ticker Timer', 'Makes dots at regular intervals for motion analysis.', 'measurement', 'physics', '{"frequency": "50Hz", "power": "AC"}', 'safe', 'Thread tape through before powering on.'),
('Force Meter', 'Spring balance for measuring force in Newtons.', 'measurement', 'physics', '{"range": "0-10N", "accuracy": "0.1N"}', 'safe', 'Zero the scale before measuring.'),

-- CHEMISTRY EQUIPMENT
('Beaker 50mL', 'Small glass beaker for measuring and mixing.', 'container', 'chemistry', '{"capacity": "50mL", "material": "Borosilicate"}', 'safe', 'Check for cracks before use. Handle by body, not lip.'),
('Beaker 100mL', 'Medium glass beaker for general laboratory use.', 'container', 'chemistry', '{"capacity": "100mL", "material": "Borosilicate"}', 'safe', 'Graduations are approximate. Use graduated cylinder for precision.'),
('Beaker 250mL', 'Standard glass beaker for reactions and heating.', 'container', 'chemistry', '{"capacity": "250mL", "material": "Borosilicate"}', 'safe', 'Can be heated directly on hot plate or wire gauze.'),
('Beaker 500mL', 'Large beaker for mixing and storage.', 'container', 'chemistry', '{"capacity": "500mL", "material": "Borosilicate"}', 'safe', 'Support when containing hot liquids.'),
('Beaker 1000mL', 'Extra large beaker for bulk preparations.', 'container', 'chemistry', '{"capacity": "1000mL", "material": "Borosilicate"}', 'safe', 'Use both hands when lifting full beaker.'),
('Erlenmeyer Flask 100mL', 'Conical flask for titrations and reactions.', 'container', 'chemistry', '{"capacity": "100mL", "material": "Borosilicate"}', 'safe', 'Swirl to mix. Shape reduces splashing.'),
('Erlenmeyer Flask 250mL', 'Standard conical flask for chemistry.', 'container', 'chemistry', '{"capacity": "250mL", "material": "Borosilicate"}', 'safe', 'Can be stoppered for storage or shaking.'),
('Volumetric Flask 100mL', 'Precision flask for preparing standard solutions.', 'container', 'chemistry', '{"capacity": "100mL", "accuracy": "±0.08mL"}', 'safe', 'Fill to mark at eye level. Mix by inverting.'),
('Volumetric Flask 250mL', 'Precision flask for accurate dilutions.', 'container', 'chemistry', '{"capacity": "250mL", "accuracy": "±0.15mL"}', 'safe', 'Do not heat. For solution preparation only.'),
('Test Tube Rack', 'Holds multiple test tubes for organization.', 'equipment', 'chemistry', '{"capacity": "12 tubes", "material": "Plastic/Wood"}', 'safe', 'Place on stable surface away from edge.'),
('Test Tubes (Set of 12)', 'Borosilicate glass test tubes.', 'container', 'chemistry', '{"diameter": "16mm", "length": "150mm"}', 'safe', 'Point away from people when heating.'),
('Bunsen Burner', 'Gas burner for heating and sterilization.', 'equipment', 'chemistry', '{"fuel": "Natural gas", "max temp": "1500°C"}', 'danger', 'Keep hair tied back. Never leave unattended when lit.'),
('Hot Plate', 'Electric heating surface for controlled heating.', 'equipment', 'chemistry', '{"power": "1000W", "max temp": "400°C"}', 'caution', 'Allow cooling before handling. Check power cord.'),
('Wire Gauze', 'Support for vessels over Bunsen burner.', 'equipment', 'chemistry', '{"size": "150x150mm", "material": "Iron/Ceramic"}', 'caution', 'Remains hot after flame is removed.'),
('Tripod Stand', 'Metal stand for supporting vessels during heating.', 'equipment', 'chemistry', '{"height": "150mm", "material": "Iron"}', 'safe', 'Ensure stability before adding equipment.'),
('Ring Stand with Rings', 'Adjustable stand for clamping equipment.', 'equipment', 'chemistry', '{"base": "200x130mm", "rod height": "600mm"}', 'safe', 'Tighten clamps securely. Check balance.'),
('Burette 50mL', 'Precision dispensing tube for titrations.', 'measurement', 'chemistry', '{"capacity": "50mL", "graduation": "0.1mL"}', 'safe', 'Rinse with titrant before filling. Read meniscus at eye level.'),
('Graduated Cylinder 10mL', 'Precise volume measurement cylinder.', 'measurement', 'chemistry', '{"capacity": "10mL", "graduation": "0.1mL"}', 'safe', 'Read at bottom of meniscus. Place on flat surface.'),
('Graduated Cylinder 50mL', 'Medium precision measuring cylinder.', 'measurement', 'chemistry', '{"capacity": "50mL", "graduation": "0.5mL"}', 'safe', 'Pour slowly to avoid splashing.'),
('Graduated Cylinder 100mL', 'Standard measuring cylinder.', 'measurement', 'chemistry', '{"capacity": "100mL", "graduation": "1mL"}', 'safe', 'Support when filling. Clean after use.'),
('Pipette 10mL', 'Graduated pipette for transferring liquids.', 'measurement', 'chemistry', '{"capacity": "10mL", "accuracy": "±0.05mL"}', 'safe', 'Use pipette filler. Never mouth pipette.'),
('Pipette 25mL', 'Volumetric pipette for precise transfers.', 'measurement', 'chemistry', '{"capacity": "25mL", "accuracy": "±0.03mL"}', 'safe', 'Drain completely. Touch tip to vessel wall.'),
('Dropper/Pipette Set', 'Plastic droppers for small volume transfers.', 'tool', 'chemistry', '{"capacity": "3mL", "quantity": 10}', 'safe', 'One dropper per reagent. Label clearly.'),
('Mortar and Pestle', 'For grinding and mixing solid chemicals.', 'equipment', 'chemistry', '{"diameter": "100mm", "material": "Porcelain"}', 'safe', 'Grind with circular motion. Clean between samples.'),
('Watch Glass', 'Shallow dish for evaporating and covering.', 'container', 'chemistry', '{"diameter": "75mm", "material": "Glass"}', 'safe', 'Use as cover for beakers or for small samples.'),
('Evaporating Dish', 'Wide dish for evaporating solutions.', 'container', 'chemistry', '{"diameter": "100mm", "material": "Porcelain"}', 'caution', 'Can withstand direct flame. Use tongs when hot.'),
('Crucible with Lid', 'High-temperature container for heating solids.', 'container', 'chemistry', '{"capacity": "30mL", "material": "Porcelain", "max temp": "1100°C"}', 'danger', 'Use crucible tongs. Allow slow cooling.'),
('Funnel', 'Glass funnel for filtering and transferring.', 'equipment', 'chemistry', '{"diameter": "75mm", "stem": "75mm"}', 'safe', 'Support with ring stand. Use filter paper for filtration.'),
('Filter Paper Set', 'Qualitative filter papers various sizes.', 'tool', 'chemistry', '{"diameters": "90/110/150mm", "quantity": 100}', 'safe', 'Fold into quarters. Wet before filtering.'),
('Stirring Rod', 'Glass rod for mixing solutions.', 'tool', 'chemistry', '{"length": "200mm", "diameter": "5mm"}', 'safe', 'Stir gently. Use to guide liquid when pouring.'),
('Magnetic Stirrer', 'Electric stirrer with heating plate.', 'equipment', 'chemistry', '{"speed": "100-1500 rpm", "heat": "up to 350°C"}', 'caution', 'Use stir bar. Don''t operate empty.'),
('Stir Bar Set', 'PTFE-coated magnetic stir bars.', 'tool', 'chemistry', '{"sizes": "15/25/40mm", "quantity": 6}', 'safe', 'Match size to vessel. Retrieve with magnet.'),
('Thermometer (-10 to 110°C)', 'Mercury or alcohol thermometer.', 'measurement', 'chemistry', '{"range": "-10 to 110°C", "graduation": "1°C"}', 'caution', 'Don''t touch bulb. Report breakage immediately.'),
('Thermometer (-10 to 250°C)', 'Extended range for high-temp reactions.', 'measurement', 'chemistry', '{"range": "-10 to 250°C", "graduation": "2°C"}', 'caution', 'Clamp securely. Don''t let touch vessel bottom.'),
('Digital Thermometer', 'Electronic temperature probe.', 'measurement', 'chemistry', '{"range": "-50 to 300°C", "accuracy": "±0.5°C"}', 'safe', 'Calibrate regularly. Protect probe.'),
('pH Meter', 'Digital pH measuring device.', 'measurement', 'chemistry', '{"range": "0-14", "accuracy": "±0.01"}', 'safe', 'Calibrate with buffer solutions. Store electrode properly.'),
('pH Paper/Strips', 'Universal indicator paper for quick pH tests.', 'measurement', 'chemistry', '{"range": "1-14", "quantity": 100}', 'safe', 'Dip briefly. Compare immediately to chart.'),
('Litmus Paper', 'Red and blue litmus for acid/base detection.', 'measurement', 'chemistry', '{"types": "Red/Blue", "quantity": 100}', 'safe', 'Red turns blue in base. Blue turns red in acid.'),
('Balance (0.01g)', 'Digital precision balance.', 'measurement', 'chemistry', '{"capacity": "200g", "accuracy": "0.01g"}', 'safe', 'Zero before use. Keep clean and level.'),
('Balance (0.001g)', 'Analytical balance for precise measurements.', 'measurement', 'chemistry', '{"capacity": "120g", "accuracy": "0.001g"}', 'safe', 'Close doors when weighing. Avoid vibrations.'),
('Weighing Paper', 'Disposable paper for weighing chemicals.', 'tool', 'chemistry', '{"size": "100x100mm", "quantity": 500}', 'safe', 'Crease to form trough. Discard after use.'),
('Spatula Set', 'Metal spatulas for transferring chemicals.', 'tool', 'chemistry', '{"types": "Flat/Scooped", "quantity": 4}', 'safe', 'Use separate spatula for each chemical.'),
('Wash Bottle', 'Squeeze bottle for distilled water.', 'container', 'chemistry', '{"capacity": "500mL", "material": "LDPE"}', 'safe', 'Fill only with distilled water. Don''t overfill.'),
('Tongs (Beaker)', 'For handling hot beakers and flasks.', 'tool', 'chemistry', '{"material": "Stainless steel", "length": "250mm"}', 'safe', 'Grip securely. Test grip before lifting.'),
('Tongs (Crucible)', 'For handling hot crucibles.', 'tool', 'chemistry', '{"material": "Steel/Nickel", "length": "200mm"}', 'safe', 'Support weight fully. Move slowly.'),
('Test Tube Holder', 'For holding test tubes during heating.', 'tool', 'chemistry', '{"material": "Wood/Plastic", "fits": "13-20mm"}', 'safe', 'Grip near top of tube. Point away from people.'),
('Safety Goggles', 'Impact and splash resistant eye protection.', 'safety', 'all', '{"standard": "ANSI Z87.1", "type": "Indirect vent"}', 'safe', 'Must be worn at all times in lab.'),
('Lab Coat', 'Cotton or polyester protective coat.', 'safety', 'all', '{"material": "Cotton blend", "sizes": "S-XL"}', 'safe', 'Button fully. Remove if contaminated.'),
('Nitrile Gloves', 'Chemical resistant disposable gloves.', 'safety', 'all', '{"material": "Nitrile", "sizes": "S-XL", "quantity": 100}', 'safe', 'Check for holes. Change when contaminated.'),
('Fire Extinguisher', 'ABC dry chemical fire extinguisher.', 'safety', 'all', '{"type": "ABC", "capacity": "2kg"}', 'safe', 'PASS: Pull, Aim, Squeeze, Sweep.'),
('Fire Blanket', 'For smothering small fires.', 'safety', 'all', '{"size": "1.2x1.2m", "material": "Fiberglass"}', 'safe', 'Wrap around fire. Do not fan flames.'),
('Eye Wash Station', 'Emergency eye irrigation system.', 'safety', 'all', '{"flow rate": "1.5L/min", "duration": "15 min"}', 'safe', 'Hold eyes open. Flush for 15 minutes.'),
('Fume Hood', 'Ventilated enclosure for hazardous vapors.', 'safety', 'chemistry', '{"air flow": "100 fpm", "size": "1200mm"}', 'safe', 'Keep sash low. Check airflow indicator.'),
('First Aid Kit', 'Basic laboratory first aid supplies.', 'safety', 'all', '{"contents": "Bandages, antiseptic, burn gel"}', 'safe', 'Report all injuries. Replace used items.'),

-- BIOLOGY EQUIPMENT
('Compound Microscope', 'Standard light microscope with multiple objectives.', 'equipment', 'biology', '{"magnification": "40x-1000x", "illumination": "LED"}', 'safe', 'Start with lowest power. Focus coarse then fine.'),
('Stereo Microscope', 'Low magnification for 3D viewing.', 'equipment', 'biology', '{"magnification": "10x-40x", "working distance": "110mm"}', 'safe', 'Good for dissection observation. Adjust both eyepieces.'),
('Digital Microscope', 'USB microscope with camera for projection.', 'equipment', 'biology', '{"magnification": "50x-500x", "camera": "2MP"}', 'safe', 'Connect to computer. Adjust focus and lighting.'),
('Microscope Slides (Box of 72)', 'Plain glass slides for specimens.', 'tool', 'biology', '{"size": "75x25mm", "thickness": "1mm"}', 'safe', 'Handle by edges. Clean before use.'),
('Cover Slips (Box of 100)', 'Thin glass covers for slide preparation.', 'tool', 'biology', '{"size": "22x22mm", "thickness": "0.17mm"}', 'caution', 'Very fragile. Lower at angle to avoid bubbles.'),
('Prepared Slide Set (20 slides)', 'Pre-made slides of various specimens.', 'tool', 'biology', '{"types": "Plant/Animal/Bacteria", "stained": true}', 'safe', 'Store flat in box. Clean after use.'),
('Dissecting Kit', 'Complete set of dissection tools.', 'tool', 'biology', '{"contents": "Scalpel, scissors, forceps, probes, pins"}', 'caution', 'Keep blades covered. Cut away from body.'),
('Dissecting Tray', 'Wax-lined tray for specimen dissection.', 'equipment', 'biology', '{"size": "300x200mm", "lining": "Paraffin wax"}', 'safe', 'Pin specimen securely. Clean and re-wax as needed.'),
('Dissecting Pins', 'T-pins for securing specimens.', 'tool', 'biology', '{"length": "38mm", "quantity": 100}', 'caution', 'Insert at angle. Dispose of bent pins.'),
('Petri Dishes (Sterile, Pack of 20)', 'Disposable sterile culture dishes.', 'container', 'biology', '{"diameter": "90mm", "material": "Polystyrene"}', 'safe', 'Keep lid on. Work near flame to maintain sterility.'),
('Petri Dishes (Glass, Reusable)', 'Autoclavable glass culture dishes.', 'container', 'biology', '{"diameter": "100mm", "material": "Borosilicate"}', 'safe', 'Sterilize before use. Handle carefully when hot.'),
('Agar Nutrient Plates', 'Pre-poured agar plates for culturing.', 'container', 'biology', '{"type": "Nutrient Agar", "quantity": 10}', 'caution', 'Store inverted in refrigerator. Check for contamination.'),
('Inoculating Loop', 'Wire loop for transferring microbes.', 'tool', 'biology', '{"material": "Nichrome wire", "diameter": "3mm"}', 'caution', 'Flame sterilize before and after use. Cool before touching culture.'),
('Inoculating Needle', 'Straight wire for stab inoculation.', 'tool', 'biology', '{"material": "Nichrome wire", "length": "50mm"}', 'caution', 'Sterilize in flame. Use for stab cultures.'),
('Autoclave Tape', 'Indicator tape for sterilization verification.', 'tool', 'biology', '{"width": "19mm", "length": "50m"}', 'safe', 'Stripes change color when properly autoclaved.'),
('Incubator', 'Temperature-controlled chamber for cultures.', 'equipment', 'biology', '{"temp range": "20-60°C", "capacity": "50L"}', 'safe', 'Set appropriate temperature. Don''t overcrowd.'),
('Centrifuge', 'Benchtop centrifuge for separating samples.', 'equipment', 'biology', '{"max speed": "6000 rpm", "capacity": "8x15mL"}', 'caution', 'Balance tubes. Secure lid before starting.'),
('Microcentrifuge', 'High-speed centrifuge for microtubes.', 'equipment', 'biology', '{"max speed": "14000 rpm", "capacity": "24x1.5mL"}', 'caution', 'Balance carefully. Don''t open until stopped.'),
('Microcentrifuge Tubes', 'Plastic tubes for small volumes.', 'container', 'biology', '{"capacity": "1.5mL", "quantity": 500}', 'safe', 'Label clearly. Snap cap securely.'),
('Conical Tubes (15mL)', 'Centrifuge tubes for cell cultures.', 'container', 'biology', '{"capacity": "15mL", "material": "Polypropylene"}', 'safe', 'Autoclavable. Check for cracks.'),
('Conical Tubes (50mL)', 'Large centrifuge tubes.', 'container', 'biology', '{"capacity": "50mL", "material": "Polypropylene"}', 'safe', 'Self-standing. Suitable for -80°C.'),
('Micropipette (2-20μL)', 'Precision pipette for tiny volumes.', 'measurement', 'biology', '{"range": "2-20μL", "accuracy": "±0.5%"}', 'safe', 'Set volume. Change tips between samples.'),
('Micropipette (20-200μL)', 'Standard molecular biology pipette.', 'measurement', 'biology', '{"range": "20-200μL", "accuracy": "±0.6%"}', 'safe', 'Don''t exceed max volume. Pipette slowly.'),
('Micropipette (100-1000μL)', 'Large volume micropipette.', 'measurement', 'biology', '{"range": "100-1000μL", "accuracy": "±0.8%"}', 'safe', 'Use appropriate tips. Calibrate regularly.'),
('Pipette Tips (Box of 96)', 'Disposable tips for micropipettes.', 'tool', 'biology', '{"sizes": "10/200/1000μL", "sterile": true}', 'safe', 'Match tip to pipette. Use filter tips for RNA work.'),
('Electrophoresis Chamber', 'For DNA/protein gel electrophoresis.', 'equipment', 'biology', '{"gel size": "10x7cm", "wells": 15}', 'caution', 'Handle gels with gloves. High voltage - don''t touch during run.'),
('Power Supply (Electrophoresis)', 'DC power for running gels.', 'equipment', 'biology', '{"voltage": "10-300V", "current": "400mA"}', 'caution', 'Connect properly. Don''t change settings during run.'),
('UV Transilluminator', 'For visualizing DNA bands in gels.', 'equipment', 'biology', '{"wavelength": "302nm", "surface": "20x20cm"}', 'danger', 'Never look at UV. Use shield and UV glasses.'),
('Gel Documentation System', 'Camera system for gel imaging.', 'equipment', 'biology', '{"camera": "CCD", "filter": "Ethidium/SYBR"}', 'safe', 'Close door before imaging. Keep lens clean.'),
('PCR Thermocycler', 'For polymerase chain reaction.', 'equipment', 'biology', '{"wells": 96, "temp range": "4-99°C", "ramp rate": "3°C/s"}', 'safe', 'Program correctly. Use thin-walled tubes.'),
('Water Bath', 'Temperature-controlled water bath.', 'equipment', 'biology', '{"temp range": "ambient-100°C", "capacity": "12L"}', 'caution', 'Check water level. Use rack for samples.'),
('Ice Bucket', 'Insulated container for keeping samples cold.', 'container', 'biology', '{"capacity": "4L", "material": "Polystyrene"}', 'safe', 'Keep filled with ice. Prevents enzyme degradation.'),
('Vortex Mixer', 'For rapid mixing of tubes.', 'equipment', 'biology', '{"speed": "3000 rpm", "mode": "Touch/Continuous"}', 'safe', 'Hold tube firmly. Start on low speed.'),
('Spectrophotometer', 'For measuring light absorbance.', 'measurement', 'biology', '{"wavelength": "200-1000nm", "path length": "10mm"}', 'safe', 'Use matched cuvettes. Blank before reading.'),
('Cuvettes (Plastic)', 'Disposable spectrophotometer cells.', 'container', 'biology', '{"volume": "1.5mL", "path": "10mm", "quantity": 100}', 'safe', 'For visible range only. Single use.'),
('Cuvettes (Quartz)', 'UV-transparent spectrophotometer cells.', 'container', 'biology', '{"volume": "1mL", "path": "10mm"}', 'safe', 'For UV work. Handle carefully - expensive.'),
('Cell Culture Flask T-25', 'Tissue culture flask.', 'container', 'biology', '{"surface": "25cm²", "material": "Treated polystyrene"}', 'safe', 'Pre-warm media. Work in biosafety cabinet.'),
('Cell Culture Flask T-75', 'Large tissue culture flask.', 'container', 'biology', '{"surface": "75cm²", "material": "Treated polystyrene"}', 'safe', 'Passage cells before confluence. Check daily.'),
('Biosafety Cabinet', 'Laminar flow hood for sterile work.', 'equipment', 'biology', '{"class": "II Type A2", "opening": "200mm"}', 'safe', 'UV sterilize before use. Wipe with ethanol.'),
('Hemocytometer', 'For counting cells manually.', 'measurement', 'biology', '{"chamber depth": "0.1mm", "grid": "Neubauer"}', 'safe', 'Use cover slip. Count in 4 corner squares.'),
('Plant Press', 'For pressing and preserving plant specimens.', 'equipment', 'biology', '{"size": "12x18 inches", "straps": 2}', 'safe', 'Change blotting paper daily. Dry completely.'),
('Specimen Jars', 'Glass jars for preserving specimens.', 'container', 'biology', '{"sizes": "100-500mL", "sealing": "Screw cap"}', 'caution', 'Use appropriate preservative. Label clearly.'),
('Terrarium', 'Enclosed habitat for observing organisms.', 'equipment', 'biology', '{"size": "30x20x20cm", "material": "Glass/Acrylic"}', 'safe', 'Maintain appropriate humidity. Monitor conditions.'),
('Aquarium', 'Water habitat for aquatic organisms.', 'equipment', 'biology', '{"capacity": "20L", "with filter": true}', 'safe', 'Cycle before adding organisms. Monitor water quality.'),
('Skeleton Model (Human)', 'Anatomical model of human skeleton.', 'equipment', 'biology', '{"height": "85cm", "material": "PVC", "parts": 200}', 'safe', 'Handle carefully. Note bone names and joints.'),
('Torso Model', 'Cross-section model of human torso.', 'equipment', 'biology', '{"height": "50cm", "removable organs": 15}', 'safe', 'Remove organs carefully. Study organ placement.'),
('Heart Model', 'Enlarged model of human heart.', 'equipment', 'biology', '{"scale": "2x", "separates": "2 parts"}', 'safe', 'Note chambers and valves. Trace blood flow.'),
('Brain Model', 'Model of human brain with regions.', 'equipment', 'biology', '{"scale": "1:1", "parts": 8}', 'safe', 'Identify lobes and structures. Handle gently.'),
('Cell Model (Plant)', '3D model of plant cell structure.', 'equipment', 'biology', '{"scale": "10000x", "removable parts": true}', 'safe', 'Identify organelles. Note cell wall and chloroplasts.'),
('Cell Model (Animal)', '3D model of animal cell structure.', 'equipment', 'biology', '{"scale": "10000x", "removable parts": true}', 'safe', 'Compare to plant cell. Note differences.'),
('DNA Model Kit', 'Build-your-own DNA double helix.', 'equipment', 'biology', '{"base pairs": 12, "scale": "50000000x"}', 'safe', 'Follow base pairing rules. A-T, G-C.');