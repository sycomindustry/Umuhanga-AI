import { X, Info, Beaker, Cpu, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabObject } from "@/hooks/useLabObjectSelection";

interface ObjectInfoPanelProps {
  object: LabObject;
  onClose: () => void;
}

export function ObjectInfoPanel({ object, onClose }: ObjectInfoPanelProps) {
  const getCategoryIcon = () => {
    switch (object.category) {
      case "equipment":
        return <Beaker className="w-4 h-4" />;
      case "component":
        return <Cpu className="w-4 h-4" />;
      case "organism":
        return <Leaf className="w-4 h-4" />;
      case "chemical":
        return <Beaker className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (object.category) {
      case "equipment":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "component":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "organism":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "chemical":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="absolute top-4 right-4 w-72 bg-background/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-xl animate-fade-in z-10">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <h3 className="font-semibold text-sm">{object.name}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-3 space-y-3">
        <Badge variant="outline" className={getCategoryColor()}>
          {object.category.charAt(0).toUpperCase() + object.category.slice(1)}
        </Badge>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {object.description}
        </p>
        
        {object.properties && Object.keys(object.properties).length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Properties
            </h4>
            <div className="grid gap-1">
              {Object.entries(object.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-3 pb-3">
        <p className="text-xs text-muted-foreground italic">
          Click elsewhere or press ESC to close
        </p>
      </div>
    </div>
  );
}
