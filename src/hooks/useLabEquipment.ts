import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LabEquipment {
  id: string;
  name: string;
  description: string;
  category: "equipment" | "component" | "organism" | "chemical" | "measurement" | "safety" | "container" | "tool";
  lab_type: "physics" | "chemistry" | "biology" | "all";
  properties: Record<string, string | number>;
  safety_level: "safe" | "caution" | "danger";
  usage_instructions: string | null;
  is_active: boolean;
}

export const useLabEquipment = (labType: "physics" | "chemistry" | "biology") => {
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("lab_equipment")
        .select("*")
        .or(`lab_type.eq.${labType},lab_type.eq.all`)
        .eq("is_active", true)
        .order("category")
        .order("name");

      if (fetchError) throw fetchError;
      setEquipment(data as LabEquipment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }, [labType]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const toggleEquipment = useCallback((equipmentId: string) => {
    setSelectedEquipment((prev) => {
      if (prev.includes(equipmentId)) {
        return prev.filter((id) => id !== equipmentId);
      }
      if (prev.length >= 15) return prev; // Max 15 items
      return [...prev, equipmentId];
    });
  }, []);

  const selectEquipment = useCallback((equipmentIds: string[]) => {
    setSelectedEquipment(equipmentIds.slice(0, 15));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEquipment([]);
  }, []);

  const getSelectedEquipmentDetails = useCallback(() => {
    return equipment.filter((e) => selectedEquipment.includes(e.id));
  }, [equipment, selectedEquipment]);

  const getEquipmentById = useCallback((id: string) => {
    return equipment.find((e) => e.id === id);
  }, [equipment]);

  const getEquipmentByCategory = useCallback((category: LabEquipment["category"]) => {
    return equipment.filter((e) => e.category === category);
  }, [equipment]);

  return {
    equipment,
    selectedEquipment,
    loading,
    error,
    toggleEquipment,
    selectEquipment,
    clearSelection,
    getSelectedEquipmentDetails,
    getEquipmentById,
    getEquipmentByCategory,
    reload: loadEquipment,
  };
};

// Helper to convert database equipment to legacy LabObject format for backward compatibility
export const equipmentToLabObject = (equipment: LabEquipment) => ({
  id: equipment.id,
  name: equipment.name,
  description: equipment.description,
  category: equipment.category as "equipment" | "component" | "organism" | "chemical",
  properties: equipment.properties,
});
