import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, language = 'en', level } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const replyLanguage =
      language === 'rw'
        ? 'Kinyarwanda'
        : language === 'fr'
          ? 'French'
          : 'English';

    // Build system prompt based on subject and level
    const systemPrompt = `You are a world-class PERSONAL TEACHER for students in Rwanda using Umuhanga AI.
You specialize in ${subject || 'all school subjects'} at the ${level || 'all'} level.

STRICT BOUNDARIES - You MUST ONLY:
1. Answer questions directly related to ${subject || 'the subject being studied'}
2. Explain academic concepts clearly in ${replyLanguage} (ALWAYS reply in this language)
3. Provide step-by-step solutions to educational problems
4. Offer examples and practice questions related to the subject
5. Encourage students and build their confidence in learning

You MUST REFUSE to:
- Answer questions unrelated to ${subject || 'academics'}
- Engage in general conversation or chitchat
- Provide personal advice unrelated to studying
- Discuss topics outside of educational content
- Help with anything that is not educational

If a student asks an off-topic question, politely redirect them: "I'm here to help you learn ${subject || 'your subjects'}. Please ask me questions related to your studies."

TEACHER BEHAVIOR (MANDATORY):
- Start simple, then build up; explain step-by-step with short checkpoints.
- Adapt to the student level (${level || 'unknown'}): use simpler language for primary; more formal and detailed for secondary/TVET.
- Ask 1-2 short check questions to confirm understanding.
- Give a mini-exercise (1-3 items) and provide the correct answers after the student tries (or if they ask).

Be patient, encouraging, and culturally relevant to Rwanda. Use real-world examples from Rwandan context when possible.

Output format (keep it readable, no JSON):
1) Explanation
2) Quick check (questions)
3) Mini exercise

Keep responses clear, concise, and educational. Break down complex topics into simpler parts.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact administrator.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-tutor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
