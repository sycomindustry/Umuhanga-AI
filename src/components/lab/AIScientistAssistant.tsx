import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bot, Loader2, Mic, MicOff, Send, Volume2, VolumeX, X } from "lucide-react";

export type LabLanguage = "en" | "rw" | "fr";

const LANGUAGES: { value: LabLanguage; label: string; speech: string }[] = [
  { value: "en", label: "English", speech: "en-US" },
  { value: "rw", label: "Kinyarwanda", speech: "rw-RW" },
  { value: "fr", label: "Français", speech: "fr-FR" },
];

const GREETING: Record<LabLanguage, string> = {
  en: "I am your AI scientist. Ask me about any equipment, chemical or reaction on your bench.",
  rw: "Ndi umuhanga wawe wa AI. Mbaza ku bikoresho, imiti cyangwa imikorere y'ubushakashatsi urimo.",
  fr: "Je suis votre scientifique IA. Posez-moi vos questions sur le matériel, les produits chimiques ou les réactions.",
};

const PLACEHOLDER: Record<LabLanguage, string> = {
  en: "Ask the AI scientist…",
  rw: "Baza umuhanga wa AI…",
  fr: "Posez votre question…",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  experimentContext: string;
  seedQuestion?: string | null;
  onSeedConsumed?: () => void;
  onClose?: () => void;
}

export function AIScientistAssistant({
  experimentContext,
  seedQuestion,
  onSeedConsumed,
  onClose,
}: Props) {
  const [language, setLanguage] = useState<LabLanguage>("en");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING.en },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text: string) => {
    if (!speakReplies || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGES.find((l) => l.value === language)?.speech ?? "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("lab-assistant", {
        body: { question: trimmed, experimentContext, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply = data?.response ?? "No response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reach the AI scientist.";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seedQuestion) {
      ask(seedQuestion);
      onSeedConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuestion]);

  const toggleMic = () => {
    if (!speechSupported) {
      toast.error("Voice input is not supported in this browser.");
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
      ask(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not capture voice input.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-slate-700 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 px-3 py-2">
        <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 p-1.5">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-100">AI Scientist</p>
          <p className="text-[11px] text-slate-400">Umuhanga AI lab assistant</p>
        </div>
        <Select value={language} onValueChange={(v) => setLanguage(v as LabLanguage)}>
          <SelectTrigger className="h-8 w-[130px] border-slate-700 bg-slate-800/70 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-slate-300"
          onClick={() => {
            setSpeakReplies((s) => !s);
            if (speakReplies) window.speechSynthesis?.cancel();
          }}
          title="Read answers aloud"
        >
          {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        {onClose && (
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1">
        <div ref={scrollRef} className="max-h-[420px] space-y-3 overflow-y-auto p-3">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-cyan-500/20 text-cyan-50"
                    : "bg-slate-800/80 text-slate-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking about your experiment…
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-700 p-2">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className="cursor-pointer border-slate-600 text-[11px] text-slate-300 hover:border-cyan-400/50"
            onClick={() => ask("What should I do next in this experiment?")}
          >
            Next step
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer border-slate-600 text-[11px] text-slate-300 hover:border-cyan-400/50"
            onClick={() => ask("Why did nothing happen when I mixed these chemicals?")}
          >
            Nothing happened?
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer border-slate-600 text-[11px] text-slate-300 hover:border-cyan-400/50"
            onClick={() => ask("What safety rules apply to this experiment?")}
          >
            Safety
          </Badge>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleMic}
            className={listening ? "text-red-400" : "text-slate-300"}
            title="Voice question"
          >
            {listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER[language]}
            className="border-slate-700 bg-slate-800/60 text-slate-100 placeholder:text-slate-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AIScientistAssistant;
