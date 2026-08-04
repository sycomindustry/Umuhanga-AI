import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Mail, MailOpen, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: { full_name: string };
  recipient?: { full_name: string };
}

interface Profile {
  id: string;
  full_name: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    recipient_id: "",
    subject: "",
    content: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);

    // Load received messages
    const { data: received } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    // Load sent messages
    const { data: sent } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    // Load display names only (emails are never exposed)
    const { data: allProfiles } = await supabase.rpc("list_directory");

    if (allProfiles) {
      setProfiles(allProfiles);
      
      // Map profiles to messages
      const profileMap = new Map(allProfiles.map(p => [p.id, p.full_name]));
      
      if (received) {
        setMessages(received.map(m => ({
          ...m,
          sender: { full_name: profileMap.get(m.sender_id) || "Unknown" }
        })));
      }
      
      if (sent) {
        setSentMessages(sent.map(m => ({
          ...m,
          recipient: { full_name: profileMap.get(m.recipient_id) || "Unknown" }
        })));
      }
    }

    setLoading(false);
  };

  const handleSendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newMessage.recipient_id || !newMessage.content) {
      toast.error("Please fill in required fields");
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: newMessage.recipient_id,
      subject: newMessage.subject || "(No subject)",
      content: newMessage.content
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent!");
      setDialogOpen(false);
      setNewMessage({ recipient_id: "", subject: "", content: "" });
      loadData();
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId);
    
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.recipient_id === currentUserId) {
      markAsRead(message.id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Messages</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Select
                    value={newMessage.recipient_id}
                    onValueChange={(v) => setNewMessage({ ...newMessage, recipient_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles
                        .filter(p => p.id !== currentUserId)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
                <Textarea
                  placeholder="Write your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={5}
                />
                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <Tabs defaultValue="inbox">
              <CardHeader className="pb-2">
                <TabsList className="w-full">
                  <TabsTrigger value="inbox" className="flex-1">
                    Inbox {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="inbox" className="mt-0">
                  {loading ? (
                    <p className="text-muted-foreground py-4">Loading...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center">No messages</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {messages.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => openMessage(msg)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedMessage?.id === msg.id
                              ? "bg-primary/10 border border-primary/30"
                              : msg.read
                              ? "hover:bg-muted/50"
                              : "bg-muted/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {msg.read ? (
                              <MailOpen className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Mail className="h-4 w-4 text-primary" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${!msg.read && "text-foreground"}`}>
                                {msg.sender?.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), "MMM d")}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sent" className="mt-0">
                  {sentMessages.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center">No sent messages</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {sentMessages.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedMessage?.id === msg.id
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">To: {msg.recipient?.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), "MMM d")}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <Card>
            <CardContent className="p-6">
              {selectedMessage ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(
                          selectedMessage.sender_id === currentUserId
                            ? selectedMessage.recipient?.full_name || "?"
                            : selectedMessage.sender?.full_name || "?"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedMessage.sender_id === currentUserId
                          ? `To: ${selectedMessage.recipient?.full_name}`
                          : selectedMessage.sender?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedMessage.created_at), "PPpp")}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to read</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
