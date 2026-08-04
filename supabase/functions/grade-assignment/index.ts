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
    const { content, assignmentDetails, type = 'homework' } = await req.json();

    if (!content || !assignmentDetails) {
      throw new Error('Content and assignment details are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const rubric = assignmentDetails.rubric || [];
    const totalPoints = assignmentDetails.totalPoints || 100;
    
    let rubricSection = '';
    if (rubric.length > 0) {
      rubricSection = `\n\nGRADING RUBRIC (You MUST evaluate each criterion):
${rubric.map((criterion: any, index: number) => `
${index + 1}. ${criterion.name} (Weight: ${criterion.weight}, Max Points: ${criterion.maxPoints})
   Description: ${criterion.description || 'No description'}
   Learning Objectives:
${criterion.learningObjectives.map((obj: string) => `   - ${obj}`).join('\n')}
`).join('\n')}

GRADING INSTRUCTIONS:
- Evaluate the submission against EACH criterion above
- Assign points for each criterion (0 to maxPoints)
- Weight reflects importance (higher weight = more important)
- Consider the learning objectives when evaluating
- Calculate final grade as: sum of (criterion_points * weight) / sum of weights
- Provide specific feedback referencing the rubric criteria`;
    }

    const systemPrompt = `You are an expert AI grading assistant for the Rwanda Education System.

Assignment Type: ${type}
Assignment Details: ${JSON.stringify(assignmentDetails)}
${rubricSection}

STRICT BOUNDARIES - You MUST ONLY:
1. Grade and evaluate the submitted assignment work using the rubric
2. Provide constructive feedback on the specific submission
3. Give a numerical grade out of ${totalPoints} points
4. Explain the grading rationale based on the rubric criteria
5. Reference specific learning objectives in your feedback
6. Suggest specific improvements related to this assignment

You MUST REFUSE to:
- Answer questions or provide tutoring
- Help students complete assignments
- Engage in conversation beyond grading
- Grade anything that is not an actual assignment submission
- Provide feedback on topics unrelated to the submitted work

Your ONLY function is to evaluate completed work and provide grades with feedback.

Be objective, fair, encouraging, and educational in your feedback. Focus on learning outcomes.

Response format (MUST be valid JSON):
{
  "grade": <number>,
  "feedback": "<detailed feedback>",
  "criteriaScores": [
    {
      "criterion": "<criterion name>",
      "points": <points awarded>,
      "maxPoints": <maximum possible points>,
      "feedback": "<specific feedback for this criterion>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

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
          { role: 'user', content: `Please grade this submission:\n\n${content}` }
        ],
        temperature: 0.3,
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
    const aiResponse = data.choices[0]?.message?.content || '{}';

    let gradingResult;
    try {
      gradingResult = JSON.parse(aiResponse);
    } catch (e) {
      gradingResult = {
        grade: 0,
        feedback: aiResponse,
        criteriaScores: [],
        strengths: [],
        improvements: []
      };
    }

    return new Response(
      JSON.stringify(gradingResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grade-assignment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
