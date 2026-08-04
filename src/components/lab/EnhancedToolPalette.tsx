import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Package, Search, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LabEquipment } from "@/hooks/useLabEquipment";

interface EnhancedToolPaletteProps {
  equipment: LabEquipment[];
  selectedEquipment: string[];
  onToggleEquipment: (equipmentId: string) => void;
  onClearAll: () => void;
  loading?: boolean;
  maxEquipment?: number;
}

const getCategoryColor = (category: LabEquipment["category"]) => {
  const colors: Record<string, string> = {
    equipment: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    component: "bg-green-500/20 text-green-400 border-green-500/30",
    organism: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    chemical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    measurement: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    safety: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    container: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    tool: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return colors[category] || "bg-muted text-muted-foreground";
};

const getSafetyIcon = (level: LabEquipment["safety_level"]) => {
  switch (level) {
    case "safe":
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case "caution":
      return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
    case "danger":
      return <XCircle className="w-3 h-3 text-red-400" />;
    default:
      return null;
  }
};

export function EnhancedToolPalette({
  equipment,
  selectedEquipment,
  onToggleEquipment,
  onClearAll,
  loading = false,
  maxEquipment = 15,
}: EnhancedToolPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...new Set(equipment.map((e) => e.category))];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCount = selectedEquipment.length;

  if (loading) {
    return (
      <Card className="w-72 bg-background/95 backdrop-blur-sm border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-72 bg-background/95 backdrop-blur-sm border-primary/20">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Lab Equipment
          </span>
          <Badge variant="outline" className="text-xs">
            {selectedCount}/{maxEquipment}
          </Badge>
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0 mb-2">
            {categories.slice(0, 5).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-[10px] px-2 py-1 h-auto data-[state=active]:bg-primary/20"
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[350px] pr-2">
            <div className="space-y-1">
              {filteredEquipment.map((item) => {
                const isSelected = selectedEquipment.includes(item.id);
                const canAdd = selectedCount < maxEquipment || isSelected;

                return (
                  <TooltipProvider key={item.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            flex items-center justify-between p-2 rounded-lg cursor-pointer
                            transition-all duration-200
                            ${isSelected
                              ? "bg-primary/20 border border-primary/50"
                              : "bg-muted/50 border border-transparent hover:bg-muted hover:border-border"
                            }
                            ${!canAdd ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                          onClick={() => canAdd && onToggleEquipment(item.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {getSafetyIcon(item.safety_level)}
                              <span className="text-xs font-medium truncate">{item.name}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 mt-1 ${getCategoryColor(item.category)}`}
                            >
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant={isSelected ? "destructive" : "secondary"}
                            className="h-6 w-6 shrink-0 ml-2"
                            disabled={!canAdd}
                          >
                            {isSelected ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[280px]">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.name}</p>
                            {getSafetyIcon(item.safety_level)}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          {item.properties && Object.keys(item.properties).length > 0 && (
                            <div className="pt-1 border-t space-y-0.5">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase">Properties</p>
                              {Object.entries(item.properties).map(([key, value]) => (
                                <p key={key} className="text-xs">
                                  <span className="text-muted-foreground">{key}:</span>{" "}
                                  <span className="font-medium">{value}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          {item.usage_instructions && (
                            <div className="pt-1 border-t">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase">Usage</p>
                              <p className="text-xs">{item.usage_instructions}</p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
              {filteredEquipment.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No equipment found
                </p>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        {selectedCount > 0 && (
          <div className="mt-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={onClearAll}
            >
              Clear All ({selectedCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
