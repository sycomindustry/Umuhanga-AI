import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Calendar as CalIcon, Clock, BookOpen, FlaskConical } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "study",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newEvent.title || !newEvent.start_time) {
      toast.error("Please fill in required fields");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: newEvent.title,
      description: newEvent.description,
      event_type: newEvent.event_type,
      start_time: new Date(newEvent.start_time).toISOString(),
      end_time: newEvent.end_time ? new Date(newEvent.end_time).toISOString() : null
    });

    if (error) {
      toast.error("Failed to create event");
    } else {
      toast.success("Event created!");
      setDialogOpen(false);
      setNewEvent({ title: "", description: "", event_type: "study", start_time: "", end_time: "" });
      loadEvents();
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "study": return <BookOpen className="h-4 w-4" />;
      case "assignment": return <CalIcon className="h-4 w-4" />;
      case "lab": return <FlaskConical className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "study": return "border-l-blue-500 bg-blue-500/10";
      case "assignment": return "border-l-amber-500 bg-amber-500/10";
      case "lab": return "border-l-emerald-500 bg-emerald-500/10";
      default: return "border-l-muted bg-muted/10";
    }
  };

  const selectedDayEvents = events.filter((e) => 
    date && isSameDay(new Date(e.start_time), date)
  );

  const daysWithEvents = events.map(e => new Date(e.start_time));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-muted-foreground">Manage your study schedule</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Study session, assignment due..."
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newEvent.event_type}
                    onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study Session</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="lab">Lab Work</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Notes about this event..."
                  />
                </div>
                <Button onClick={handleCreateEvent} className="w-full">Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <Card>
            <CardContent className="p-4">
              <CalendarWidget
                mode="single"
                selected={date}
                onSelect={setDate}
                modifiers={{ hasEvent: daysWithEvents }}
                modifiersStyles={{
                  hasEvent: { fontWeight: "bold", textDecoration: "underline" }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : selectedDayEvents.length === 0 ? (
                <p className="text-muted-foreground">No events on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${getEventColor(event.event_type)}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getEventIcon(event.event_type)}
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_time), "h:mm a")}
                        {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                      </p>
                      {event.description && (
                        <p className="text-sm mt-2">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
