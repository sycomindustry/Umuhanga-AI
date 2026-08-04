import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  console.log("WebSocket connection established");

  socket.onopen = () => {
    console.log("Client connected");
    socket.send(JSON.stringify({ type: "connected", message: "Real-time lab connected" }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      // Handle different action types
      switch (data.type) {
        case "physics_calculation":
          // Calculate physics results (voltage, current, resistance, etc.)
          const physicsResult = calculatePhysics(data.payload);
          socket.send(JSON.stringify({ 
            type: "physics_result", 
            result: physicsResult,
            timestamp: Date.now()
          }));
          break;

        case "chemistry_reaction":
          // Calculate chemical reaction results
          const chemResult = calculateChemistry(data.payload);
          socket.send(JSON.stringify({ 
            type: "chemistry_result", 
            result: chemResult,
            timestamp: Date.now()
          }));
          break;

        case "ai_guidance":
          // Get AI guidance based on current state
          const guidance = await getAIGuidance(data.payload);
          socket.send(JSON.stringify({ 
            type: "ai_guidance", 
            guidance,
            timestamp: Date.now()
          }));
          break;

        case "log_action":
          // Log student action for tracking
          console.log("Action logged:", data.payload);
          socket.send(JSON.stringify({ 
            type: "action_logged", 
            success: true,
            timestamp: Date.now()
          }));
          break;

        default:
          socket.send(JSON.stringify({ 
            type: "error", 
            message: "Unknown action type" 
          }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: error instanceof Error ? error.message : "Unknown error"
      }));
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});

// Physics calculations (Ohm's law, power, etc.)
function calculatePhysics(payload: any) {
  const { voltage = 0, resistance = 1, current = 0 } = payload;
  
  // Ohm's law: V = I * R
  const calculatedCurrent = resistance > 0 ? voltage / resistance : 0;
  const power = voltage * calculatedCurrent; // P = V * I
  const brightness = Math.min(100, (power / 10) * 100); // Normalized brightness

  return {
    voltage,
    resistance,
    current: calculatedCurrent,
    power,
    brightness,
    formula: "V = I × R, P = V × I"
  };
}

// Chemistry reaction calculations
function calculateChemistry(payload: any) {
  const { reactant1 = 0, reactant2 = 0, temperature = 25 } = payload;
  
  // Simple reaction rate calculation
  const reactionRate = (reactant1 * reactant2 * temperature) / 100;
  const color = getColorForReaction(reactionRate);
  const gasProduced = reactionRate > 50;

  return {
    reactionRate,
    color,
    gasProduced,
    temperature,
    message: `Reaction occurring at ${reactionRate.toFixed(2)}% rate`
  };
}

function getColorForReaction(rate: number): string {
  if (rate < 20) return "#E3F2FD"; // Light blue
  if (rate < 40) return "#64B5F6"; // Blue
  if (rate < 60) return "#FFF59D"; // Yellow
  if (rate < 80) return "#FFB74D"; // Orange
  return "#EF5350"; // Red
}

// AI guidance using Lovable AI
async function getAIGuidance(payload: any) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { error: "AI guidance not available" };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a science lab assistant. Provide brief, helpful guidance for students conducting experiments. Keep responses under 50 words."
          },
          {
            role: "user",
            content: `Current experiment state: ${JSON.stringify(payload.state)}. Student action: ${payload.action}. Provide guidance.`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      message: data.choices[0].message.content,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("AI guidance error:", error);
    return { error: "Could not generate guidance" };
  }
}
