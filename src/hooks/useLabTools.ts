import { useState, useCallback } from "react";
import { toast } from "sonner";

export const useLabTools = (initialTools: string[] = []) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(initialTools);
  const [maxTools] = useState(10);

  const toggleTool = useCallback((toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        toast.info(`Removed ${toolId} from workspace`);
        return prev.filter(id => id !== toolId);
      }
      
      if (prev.length >= maxTools) {
        toast.error(`Maximum ${maxTools} tools allowed`);
        return prev;
      }
      
      toast.success(`Added ${toolId} to workspace`);
      return [...prev, toolId];
    });
  }, [maxTools]);

  const addTool = useCallback((toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) return prev;
      if (prev.length >= maxTools) {
        toast.error(`Maximum ${maxTools} tools allowed`);
        return prev;
      }
      return [...prev, toolId];
    });
  }, [maxTools]);

  const removeTool = useCallback((toolId: string) => {
    setSelectedTools(prev => prev.filter(id => id !== toolId));
  }, []);

  const clearTools = useCallback(() => {
    setSelectedTools([]);
    toast.info("Cleared all tools from workspace");
  }, []);

  const hasTool = useCallback((toolId: string) => {
    return selectedTools.includes(toolId);
  }, [selectedTools]);

  return {
    selectedTools,
    toggleTool,
    addTool,
    removeTool,
    clearTools,
    hasTool,
    maxTools,
  };
};
