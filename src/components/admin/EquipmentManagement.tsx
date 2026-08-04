import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Edit2, Package, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  lab_type: string;
  properties: Record<string, string | number>;
  safety_level: string;
  usage_instructions: string | null;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ["equipment", "component", "organism", "chemical", "measurement", "safety", "container", "tool"];
const LAB_TYPES = ["physics", "chemistry", "biology", "all"];
const SAFETY_LEVELS = ["safe", "caution", "danger"];

export const EquipmentManagement = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLabType, setFilterLabType] = useState<string>("all-types");
  const [filterCategory, setFilterCategory] = useState<string>("all-categories");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "equipment",
    lab_type: "chemistry",
    properties: "{}",
    safety_level: "safe",
    usage_instructions: "",
    is_active: true,
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lab_equipment")
      .select("*")
      .order("lab_type")
      .order("category")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load equipment",
        variant: "destructive",
      });
    } else {
      setEquipment(data as Equipment[]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    let properties = {};
    try {
      properties = JSON.parse(formData.properties);
    } catch {
      toast({
        title: "Error",
        description: "Properties must be valid JSON",
        variant: "destructive",
      });
      return;
    }

    const equipmentData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      lab_type: formData.lab_type,
      properties,
      safety_level: formData.safety_level,
      usage_instructions: formData.usage_instructions || null,
      is_active: formData.is_active,
    };

    if (editingEquipment) {
      const { error } = await supabase
        .from("lab_equipment")
        .update(equipmentData)
        .eq("id", editingEquipment.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update equipment", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Equipment updated successfully" });
        loadEquipment();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("lab_equipment").insert(equipmentData);

      if (error) {
        toast({ title: "Error", description: "Failed to create equipment", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Equipment created successfully" });
        loadEquipment();
        resetForm();
      }
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      lab_type: item.lab_type,
      properties: JSON.stringify(item.properties, null, 2),
      safety_level: item.safety_level,
      usage_instructions: item.usage_instructions || "",
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("lab_equipment").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete equipment", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Equipment deleted successfully" });
      loadEquipment();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("lab_equipment")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update equipment status", variant: "destructive" });
    } else {
      loadEquipment();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "equipment",
      lab_type: "chemistry",
      properties: "{}",
      safety_level: "safe",
      usage_instructions: "",
      is_active: true,
    });
    setEditingEquipment(null);
    setIsDialogOpen(false);
  };

  const getSafetyBadge = (level: string) => {
    switch (level) {
      case "safe":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Safe</Badge>;
      case "caution":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Caution</Badge>;
      case "danger":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Danger</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getLabTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      physics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      chemistry: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      biology: "bg-green-500/20 text-green-400 border-green-500/30",
      all: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabType = filterLabType === "all-types" || item.lab_type === filterLabType;
    const matchesCategory = filterCategory === "all-categories" || item.category === filterCategory;
    return matchesSearch && matchesLabType && matchesCategory;
  });

  const equipmentByLabType = {
    physics: filteredEquipment.filter(e => e.lab_type === "physics"),
    chemistry: filteredEquipment.filter(e => e.lab_type === "chemistry"),
    biology: filteredEquipment.filter(e => e.lab_type === "biology"),
    all: filteredEquipment.filter(e => e.lab_type === "all"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">Lab Equipment Management</h3>
          <p className="text-sm text-muted-foreground">{equipment.length} total equipment items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? "Edit Equipment" : "Add New Equipment"}
              </DialogTitle>
              <DialogDescription>
                {editingEquipment ? "Update the equipment details below" : "Add new lab equipment to the inventory"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bunsen Burner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab_type">Lab Type</Label>
                  <Select
                    value={formData.lab_type}
                    onValueChange={(value) => setFormData({ ...formData, lab_type: value })}
                  >
                    <SelectTrigger id="lab_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the equipment and its purpose"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safety_level">Safety Level</Label>
                  <Select
                    value={formData.safety_level}
                    onValueChange={(value) => setFormData({ ...formData, safety_level: value })}
                  >
                    <SelectTrigger id="safety_level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAFETY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="properties">Properties (JSON)</Label>
                <Textarea
                  id="properties"
                  value={formData.properties}
                  onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                  placeholder='{"capacity": "250mL", "material": "Glass"}'
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage">Usage Instructions</Label>
                <Textarea
                  id="usage"
                  value={formData.usage_instructions}
                  onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                  placeholder="How to use this equipment safely"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible to students)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingEquipment ? "Update" : "Create"} Equipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterLabType} onValueChange={setFilterLabType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Lab Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Labs</SelectItem>
            {LAB_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredEquipment.length})</TabsTrigger>
          <TabsTrigger value="physics">Physics ({equipmentByLabType.physics.length})</TabsTrigger>
          <TabsTrigger value="chemistry">Chemistry ({equipmentByLabType.chemistry.length})</TabsTrigger>
          <TabsTrigger value="biology">Biology ({equipmentByLabType.biology.length})</TabsTrigger>
          <TabsTrigger value="shared">Shared ({equipmentByLabType.all.length})</TabsTrigger>
        </TabsList>

        {["all", "physics", "chemistry", "biology", "shared"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <ScrollArea className="h-[500px]">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Safety</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tab === "all" ? filteredEquipment : 
                      tab === "shared" ? equipmentByLabType.all : 
                      equipmentByLabType[tab as keyof typeof equipmentByLabType]
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{getLabTypeBadge(item.lab_type)}</TableCell>
                        <TableCell>{getSafetyBadge(item.safety_level)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={() => toggleActive(item.id, item.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(tab === "all" ? filteredEquipment : 
                      tab === "shared" ? equipmentByLabType.all : 
                      equipmentByLabType[tab as keyof typeof equipmentByLabType]
                    ).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No equipment found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
