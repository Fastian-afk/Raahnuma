import { NextRequest, NextResponse } from 'next/server';
import { evaluateEligibility } from '@/lib/rules-engine/evaluator';
import { UserProfile } from '@/lib/rules-engine/types';

const SYSTEM_PROMPT = `You are Raahnuma (رہنما), an AI benefits navigator for Pakistan's social protection system.

YOUR ROLE:
- Help users understand which government welfare programs they may be eligible for
- Parse user situations described in natural language (English, Urdu, or any Pakistani language) into structured profiles
- Ask targeted follow-up questions when critical information is missing
- NEVER say "you qualify" — always say "you may qualify" or "you appear to meet the criteria"

PROGRAMS YOU COVER:
1. Benazir Kafaalat (BISP) - Cash transfer Rs. 14,500/quarter for PMT score < 32
2. Taleemi Wazaif - Education stipends Rs. 2,500-4,500/quarter (requires Kafaalat)
3. Nashonuma - Nutrition for pregnant/lactating women & children under 2 (requires Kafaalat)
4. Sehat Sahulat / PM Health Card - Free in-patient hospital treatment (CNIC = health card, varies by province)
5. Ramzan Relief - Seasonal food packages

KEY RULES:
- Taleemi Wazaif and Nashonuma DEPEND on being a Kafaalat beneficiary
- Sehat Card coverage differs by province (Punjab = private hospitals only)
- Sehat Card covers IN-PATIENT only, NOT OPD/routine checkups
- Nashonuma registration is IN-PERSON ONLY at DHQ/THQ hospitals

WHEN RESPONDING:
1. If the user describes their situation, extract what you can and ask for missing critical info
2. Respond in the SAME LANGUAGE the user writes in
3. Be warm, respectful, and use simple language
4. Always include the disclaimer that this is guidance, not official determination

OUTPUT FORMAT (when you have enough info to assess):
After gathering enough information, respond with a JSON block wrapped in \`\`\`json markers containing the extracted profile:
\`\`\`json
{"extracted_profile": {"province": "...", "householdSize": N, "employmentType": "...", "hasSchoolAgeChildren": bool, "schoolAgeChildrenCount": N, "hasPregnantMember": bool, "hasChildrenUnder2": bool, "hasDisabledMember": bool, "monthlyIncome": N, "isKafaalatBeneficiary": bool, "isWidow": bool, "livesInRuralArea": bool}, "ready_to_assess": true}
\`\`\`

If you still need info, set "ready_to_assess": false and ask your follow-up question naturally in the conversation.

For general questions about programs, answer directly without the JSON block.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'en' } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key not configured. Add GROQ_API_KEY to environment variables.' }, { status: 500 });
    }

    // Call Groq API (OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return NextResponse.json({ error: 'AI service error', details: errText }, { status: 502 });
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || 'I apologize, I could not process that. Please try again.';

    // Check if the response contains an extracted profile
    const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
    let eligibilityResults = null;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.ready_to_assess && parsed.extracted_profile) {
          const profile: UserProfile = parsed.extracted_profile;
          eligibilityResults = evaluateEligibility(profile);
        }
      } catch {
        // JSON parse failed, continue without results
      }
    }

    // Clean the AI text (remove JSON block from displayed message)
    const cleanText = aiText.replace(/```json[\s\S]*?```/g, '').trim();

    return NextResponse.json({
      message: cleanText || 'I\'ve analyzed your situation. Here are your results:',
      eligibilityResults,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
