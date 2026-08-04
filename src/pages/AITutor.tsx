import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { BRAND } from "@/lib/brand";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type TutorLanguage = "en" | "rw" | "fr";

const LANGUAGES: { value: TutorLanguage; label: string; speech: string }[] = [
  { value: "en", label: "English", speech: "en-US" },
  { value: "rw", label: "Kinyarwanda", speech: "rw-RW" },
  { value: "fr", label: "Français", speech: "fr-FR" },
];

const PLACEHOLDER: Record<TutorLanguage, string> = {
  en: "Type your question here…",
  rw: "Andika ikibazo cyawe hano…",
  fr: "Écrivez votre question ici…",
};

const GREETING: Record<TutorLanguage, string> = {
  en: `Hi! I'm your personal AI teacher on ${BRAND.name}. Tell me what you're learning, and I’ll explain step-by-step and give you a quick exercise.`,
  rw: `Muraho! Ndi umwarimu wawe wa AI kuri ${BRAND.name}. Mbwira icyo wiga, ngusobanurire intambwe ku yindi, nguguhe n’imyitozo.`,
  fr: `Bonjour ! Je suis votre professeur IA sur ${BRAND.name}. Dites-moi ce que vous apprenez, je vais expliquer étape par étape et vous donner un petit exercice.`,
};

const isUuid = (value?: string) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const AITutor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<TutorLanguage>("en");
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const subject = location.state?.subject;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        if (isUuid(subjectId)) {
          loadConversationHistory(session.user.id);
        } else {
          setMessages([
            {
              role: "assistant",
              content: GREETING[language],
              timestamp: new Date(),
            },
          ]);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, subjectId]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: "assistant", content: GREETING[language], timestamp: new Date() },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversationHistory = async (userId: string) => {
    if (!subjectId || !isUuid(subjectId)) return;

    const { data, error } = await supabase
      .from("conversation_history")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error loading conversation history:", error);
    } else if (data && data.length > 0) {
      const formattedMessages: Message[] = [];
      data.forEach((item) => {
        formattedMessages.push({
          role: "user",
          content: item.message,
          timestamp: new Date(item.created_at),
        });
        formattedMessages.push({
          role: "assistant",
          content: item.response,
          timestamp: new Date(item.created_at),
        });
      });
      setMessages(formattedMessages);
    }
  };

  const sendMessage = async (userMessage: string) => {
    const trimmed = userMessage.trim();
    if (!trimmed || loading || !user) return;

    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, timestamp: new Date() },
    ]);

    try {
      // Call AI tutor edge function
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          message: trimmed,
          subject: subject?.name,
          language: language,
          level: subject?.level,
        },
      });

      if (error) throw error;

      const aiResponse = data.response;

      // Add AI response to UI
      const newAssistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAssistantMessage]);

      // Save to database
      await supabase.from("conversation_history").insert({
        user_id: user.id,
        subject_id: isUuid(subjectId) ? subjectId : null,
        message: trimmed,
        response: aiResponse,
        language: language,
      });

      if (speakReplies && typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = LANGUAGES.find((l) => l.value === language)?.speech ?? "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI tutor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleMic = () => {
    if (!speechSupported) {
      toast({
        title: "Voice not supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGES.find((l) => l.value === language)?.speech ?? "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      toast({
        title: "Voice error",
        description: "Could not capture voice input.",
        variant: "destructive",
      });
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-strong p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span>{subject?.icon}</span>
                {subject?.name || "AI Personal Teacher"}
              </h1>
              <p className="text-sm text-white/80">{BRAND.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleMic}
              className={listening ? "bg-white/30" : "bg-white/20 hover:bg-white/30"}
              title="Voice question"
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSpeakReplies((s) => !s);
                if (speakReplies) window.speechSynthesis?.cancel();
              }}
              className="bg-white/20 hover:bg-white/30"
              title="Read answers aloud"
            >
              {speakReplies ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Select value={language} onValueChange={(val) => setLanguage(val as TutorLanguage)}>
              <SelectTrigger className="w-[170px] bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="rw">Kinyarwanda</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot className="w-6 h-6" />
                  Start Your Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  Hello! I'm your AI tutor for {subject?.name}. I'm here to help you learn and answer your questions.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can ask me to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Explain concepts in simple terms</li>
                  <li>Solve problems step by step</li>
                  <li>Provide practice questions</li>
                  <li>Clarify difficult topics</li>
                </ul>
              </CardContent>
            </Card>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-gradient-primary"
                        : "bg-gradient-secondary"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <Card
                    className={`${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    } shadow-soft`}
                  >
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-card shadow-strong rounded-lg p-4">
          <div className="flex gap-2">
            <Input
              placeholder={PLACEHOLDER[language]}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
