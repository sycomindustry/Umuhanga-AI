import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Minus, Package, Beaker, Atom, Microscope } from "lucide-react";
import { LabObject } from "@/hooks/useLabObjectSelection";

interface ToolPaletteProps {
  availableTools: Record<string, LabObject>;
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
  labType: "physics" | "chemistry" | "biology";
  maxTools?: number;
}

const getCategoryColor = (category: LabObject["category"]) => {
  switch (category) {
    case "equipment":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "component":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "organism":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "chemical":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getLabIcon = (labType: "physics" | "chemistry" | "biology") => {
  switch (labType) {
    case "physics":
      return <Atom className="w-4 h-4" />;
    case "chemistry":
      return <Beaker className="w-4 h-4" />;
    case "biology":
      return <Microscope className="w-4 h-4" />;
  }
};

export function ToolPalette({
  availableTools,
  selectedTools,
  onToolToggle,
  labType,
  maxTools = 10,
}: ToolPaletteProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const toolsArray = Object.values(availableTools);
  const selectedCount = selectedTools.length;

  return (
    <Card className="w-64 bg-background/95 backdrop-blur-sm border-primary/20">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Lab Equipment
          </span>
          <Badge variant="outline" className="text-xs">
            {selectedCount}/{maxTools}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Select tools to add to your workspace
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-1">
            {toolsArray.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              const canAdd = selectedCount < maxTools || isSelected;
              
              return (
                <TooltipProvider key={tool.id}>
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
                        onClick={() => canAdd && onToolToggle(tool.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{tool.name}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 mt-1 ${getCategoryColor(tool.category)}`}
                          >
                            {tool.category}
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
                    <TooltipContent side="left" className="max-w-[250px]">
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                      {tool.properties && (
                        <div className="mt-2 space-y-0.5">
                          {Object.entries(tool.properties).map(([key, value]) => (
                            <p key={key} className="text-xs">
                              <span className="text-muted-foreground">{key}:</span>{" "}
                              <span className="font-medium">{value}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>
        
        {selectedCount > 0 && (
          <div className="mt-2 pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => selectedTools.forEach(id => onToolToggle(id))}
            >
              Clear All Tools
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
