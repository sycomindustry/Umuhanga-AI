import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RealtimeLabConfig {
  experimentId: string;
  onPhysicsResult?: (result: any) => void;
  onChemistryResult?: (result: any) => void;
  onAIGuidance?: (guidance: any) => void;
}

export const useRealtimeLab = (config: RealtimeLabConfig) => {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [guidance, setGuidance] = useState<string>("");
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const hasShownError = useRef(false);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        // Try to connect to WebSocket edge function
        const ws = new WebSocket(
          `wss://vzvkastirkttraligtki.supabase.co/functions/v1/realtime-lab`
        );

        ws.onopen = () => {
          console.log("Real-time lab connected");
          setConnected(true);
          reconnectAttempts.current = 0;
          hasShownError.current = false;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case "physics_result":
                config.onPhysicsResult?.(data.result);
                break;
              case "chemistry_result":
                config.onChemistryResult?.(data.result);
                break;
              case "ai_guidance":
                setGuidance(data.guidance.message);
                config.onAIGuidance?.(data.guidance);
                break;
              case "error":
                toast({
                  title: "Error",
                  description: data.message,
                  variant: "destructive",
                });
                break;
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnected(false);
          
          // Only show error toast once
          if (!hasShownError.current && reconnectAttempts.current === 0) {
            hasShownError.current = true;
          }
        };

        ws.onclose = () => {
          console.info("Real-time lab disconnected");
          setConnected(false);
          
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            reconnectTimeout = setTimeout(connect, delay);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        setConnected(false);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [config.experimentId]);

  const sendPhysicsCalculation = (payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "physics_calculation",
        payload
      }));
    }
  };

  const sendChemistryReaction = (payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chemistry_reaction",
        payload
      }));
    }
  };

  const requestAIGuidance = (state: any, action: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "ai_guidance",
        payload: { state, action }
      }));
    }
  };

  const logAction = (action: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "log_action",
        payload: action
      }));
    }
  };

  return {
    connected,
    guidance,
    sendPhysicsCalculation,
    sendChemistryReaction,
    requestAIGuidance,
    logAction
  };
};
