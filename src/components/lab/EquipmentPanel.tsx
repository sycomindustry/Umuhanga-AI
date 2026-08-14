import { useState, useMemo } from 'react';
import { Search, Archive, Zap, Microscope, Wrench, Shield, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EQUIPMENT_CATALOG, EquipmentCategory, LabEquipmentItem, LabType } from '@/types/lab';
import { cn } from '@/lib/utils';

interface EquipmentPanelProps {
  labType: LabType;
  onEquipmentSelect: (equipmentId: string) => void;
  selectedEquipment: string | null;
  pendingPlacementId?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  chemistry: <FlaskConical className="w-4 h-4" />,
  physics: <Zap className="w-4 h-4" />,
  biology: <Microscope className="w-4 h-4" />,
  common: <Wrench className="w-4 h-4" />,
  safety: <Shield className="w-4 h-4" />,
};

const SAFETY_COLORS = {
  safe: 'bg-green-500/20 text-green-700 border-green-500/50',
  caution: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50',
  danger: 'bg-red-500/20 text-red-700 border-red-500/50',
};

const STORAGE_LABELS: Record<EquipmentCategory, string> = {
  glassware: 'Glassware cupboard',
  heating: 'Heating station',
  measurement: 'Measurement shelf',
  electrical: 'Electrical drawer',
  optical: 'Optics cupboard',
  safety: 'Safety wall',
  chemicals: 'Chemical cupboard',
  biological: 'Specimen cabinet',
  tools: 'Tool drawer',
};

const STORAGE_NOTES: Record<EquipmentCategory, string> = {
  glassware: 'Beakers, flasks, cylinders, and tubes arranged neatly for quick pickup.',
  heating: 'Burners, hot plates, and heat tools kept together for controlled use.',
  measurement: 'Meters and measuring tools stored where readings can be taken quickly.',
  electrical: 'Circuit parts grouped in drawers to mirror a real prep bench.',
  optical: 'Microscopes and optical tools organized in a protected cupboard.',
  safety: 'Protective equipment kept ready before any practical work starts.',
  chemicals: 'Chemical stock arranged like a real laboratory storage area.',
  biological: 'Specimens and biology tools grouped in a clean storage cabinet.',
  tools: 'General lab tools kept in one drawer for bench setup and handling.',
};

export function EquipmentPanel({
  labType,
  onEquipmentSelect,
  selectedEquipment,
  pendingPlacementId,
}: EquipmentPanelProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(labType);

  const filteredEquipment = useMemo(() => {
    const items = Object.values(EQUIPMENT_CATALOG);
    
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                           item.description.toLowerCase().includes(search.toLowerCase());
      
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'safety') return item.category === 'safety' && matchesSearch;
      if (activeTab === 'common') return item.labType === 'common' && matchesSearch;
      
      return (item.labType === activeTab || item.labType === 'common') && matchesSearch;
    });
  }, [search, activeTab]);

  const groupedEquipment = useMemo(() => {
    const groups: Record<string, LabEquipmentItem[]> = {};
    
    filteredEquipment.forEach(item => {
      const category = item.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    
    return groups;
  }, [filteredEquipment]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Archive className="w-5 h-5 text-primary" />
          Lab storage
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Pick equipment from the cupboards and place it on the bench where you want to work.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cupboards and drawers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 mx-4 mt-2">
          <TabsTrigger value={labType} className="text-xs">
            {CATEGORY_ICONS[labType]}
          </TabsTrigger>
          <TabsTrigger value="common" className="text-xs">
            {CATEGORY_ICONS.common}
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-xs">
            {CATEGORY_ICONS.safety}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {Object.entries(groupedEquipment).map(([category, items]) => (
              <div key={category}>
                <div className="mb-2 rounded-xl border border-border/70 bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground">
                      {STORAGE_LABELS[category as EquipmentCategory] ?? category.replace('_', ' ')}
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      {items.length} item{items.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {STORAGE_NOTES[category as EquipmentCategory] ?? 'Stored for normal laboratory use.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(item => (
                    <TooltipProvider key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onEquipmentSelect(item.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all hover:shadow-md",
                              pendingPlacementId === item.id
                                ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                : selectedEquipment === item.id
                                  ? "border-primary/60 bg-primary/5"
                                  : "border-border bg-background hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-2xl">{item.icon}</div>
                              {pendingPlacementId === item.id && (
                                <Badge className="text-[10px] bg-primary text-primary-foreground">
                                  In hand
                                </Badge>
                              )}
                            </div>
                            <p className="mt-2 text-xs font-medium truncate">{item.name}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px]", SAFETY_COLORS[item.safetyLevel])}
                              >
                                {item.safetyLevel}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                Click to pick
                              </span>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-xs italic">{item.usageInstructions}</p>
                            {item.safetyLevel !== 'safe' && (
                              <p className="text-xs text-destructive font-medium">
                                ⚠️ {item.safetyLevel === 'danger' ? 'Dangerous material!' : 'Use with caution'}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedEquipment).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No equipment found</p>
                <p className="text-sm">Try a different search or category</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
