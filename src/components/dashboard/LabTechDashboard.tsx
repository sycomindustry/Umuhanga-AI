import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Microscope, FlaskConical, Atom, Calendar, Mail, Settings, ClipboardList, AlertTriangle } from "lucide-react";

export const LabTechDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Lab Tech Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-primary/20 hover:border-primary"
          onClick={() => navigate("/virtual-lab")}
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Virtual Labs</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-secondary/20 hover:border-secondary"
        >
          <CardHeader className="p-4">
            <div className="bg-gradient-secondary p-3 rounded-lg w-fit mx-auto">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Lab Reports</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-blue-500/20 hover:border-blue-500"
          onClick={() => navigate("/calendar")}
        >
          <CardHeader className="p-4">
            <div className="bg-blue-500 p-3 rounded-lg w-fit mx-auto">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Schedule</CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="hover:shadow-medium transition-smooth cursor-pointer border-2 border-emerald-500/20 hover:border-emerald-500"
          onClick={() => navigate("/messages")}
        >
          <CardHeader className="p-4">
            <div className="bg-emerald-500 p-3 rounded-lg w-fit mx-auto">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-sm text-center">Messages</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lab Overview */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          Laboratory Management
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Experiments</CardDescription>
            <CardTitle className="text-3xl text-primary">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reports</CardDescription>
            <CardTitle className="text-3xl text-amber-500">5</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Equipment Status</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">Good</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lab Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={() => navigate("/virtual-lab")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Biology Lab</CardTitle>
                <CardDescription>Microscopy & Cell Studies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Active Sessions</span>
              <span className="font-medium">3</span>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">Manage</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={() => navigate("/virtual-lab")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-3 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Chemistry Lab</CardTitle>
                <CardDescription>Reactions & Analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Active Sessions</span>
              <span className="font-medium">5</span>
            </div>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Manage</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={() => navigate("/virtual-lab")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Physics Lab</CardTitle>
                <CardDescription>Mechanics & Electricity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Active Sessions</span>
              <span className="font-medium">4</span>
            </div>
            <Button className="w-full bg-purple-500 hover:bg-purple-600">Manage</Button>
          </CardContent>
        </Card>
      </div>

      {/* Safety & Maintenance */}
      <h2 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          Safety & Maintenance
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Safety Protocols</CardTitle>
                <CardDescription>Review and update safety guidelines</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50">
              View Protocols
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-lg">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Equipment Maintenance</CardTitle>
                <CardDescription>Schedule and track maintenance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Maintenance Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
