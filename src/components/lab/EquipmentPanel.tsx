import { useState, useMemo } from 'react';
import { Search, Beaker, Zap, Microscope, Wrench, Shield, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EQUIPMENT_CATALOG, LabEquipmentItem, LabType } from '@/types/lab';
import { cn } from '@/lib/utils';

interface EquipmentPanelProps {
  labType: LabType;
  onEquipmentSelect: (equipmentId: string) => void;
  selectedEquipment: string | null;
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

export function EquipmentPanel({ labType, onEquipmentSelect, selectedEquipment }: EquipmentPanelProps) {
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

  const handleDragStart = (e: React.DragEvent, equipmentId: string) => {
    e.dataTransfer.setData('equipmentId', equipmentId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          Equipment
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
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
                <h3 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                  {category.replace('_', ' ')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(item => (
                    <TooltipProvider key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onClick={() => onEquipmentSelect(item.id)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
                              selectedEquipment === item.id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <p className="text-xs font-medium truncate">{item.name}</p>
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] mt-1", SAFETY_COLORS[item.safetyLevel])}
                            >
                              {item.safetyLevel}
                            </Badge>
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
