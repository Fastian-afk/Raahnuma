import { NextRequest, NextResponse } from 'next/server';
import { evaluateEligibility } from '@/lib/rules-engine/evaluator';
import { AssessmentResult } from '@/lib/rules-engine/types';
import {
  ChatRequestSchema,
  ExtractedProfileResponseSchema,
  UserProfileSchema,
} from '@/lib/validation/schemas';
import {
  classifyNeeds,
  NEED_TO_PROGRAMS,
} from '@/lib/pipeline/need-classifier';

const SYSTEM_PROMPT = `You are Raahnuma (رہنما), an AI benefits navigator for Pakistan's social protection system.

YOUR ROLE:
- Help users understand which government welfare programs they may be eligible for
- Parse user situations described in natural language (English, Urdu, or any Pakistani language) into structured profiles
- Ask targeted follow-up questions when critical information is missing — NEVER guess when input is ambiguous
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

WHEN INPUT IS AMBIGUOUS (e.g. "I'm struggling"):
- Ask clarifying questions: financial support? education? nutrition? healthcare?
- Do NOT assume — ask one focused follow-up at a time

WHEN RESPONDING:
1. If the user describes their situation, extract what you can and ask for missing critical info
2. Respond in the SAME LANGUAGE the user writes in
3. Be warm, respectful, and use simple language
4. Always include the disclaimer that this is guidance, not official determination

OUTPUT FORMAT (when you have enough info to assess):
After gathering enough information, respond with a JSON block wrapped in \`\`\`json markers:
\`\`\`json
{
  "extracted_profile": {
    "province": "punjab|sindh|kpk|balochistan|islamabad|ajk|gilgit_baltistan",
    "householdSize": 6,
    "employmentType": "daily_wage|salaried|self_employed|unemployed|retired|agricultural|domestic_worker|unknown",
    "hasSchoolAgeChildren": true,
    "schoolAgeChildrenCount": 2,
    "hasPregnantMember": false,
    "hasChildrenUnder2": false,
    "hasDisabledMember": false,
    "monthlyIncome": 25000,
    "isKafaalatBeneficiary": false,
    "isWidow": false,
    "livesInRuralArea": true
  },
  "identified_needs": ["financial_support", "education_support"],
  "extraction_confidence": 0.75,
  "needs_human_review": false,
  "ready_to_assess": true
}
\`\`\`

If you still need info, set "ready_to_assess": false and ask your follow-up question naturally.

For general questions about programs, answer directly without the JSON block.`;

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English.',
  ur: 'Respond in Urdu (اردو). Use respectful language.',
  sd: 'Respond in Sindhi if possible, otherwise Urdu.',
  ps: 'Respond in Pashto if possible, otherwise Urdu.',
  pn: 'Respond in Punjabi if possible, otherwise Urdu.',
  bl: 'Respond in Balochi if possible, otherwise Urdu.',
};

function rankResultsByNeeds(
  results: AssessmentResult,
  needs: string[]
): AssessmentResult {
  const relevantProgramIds = new Set<string>();
  for (const need of needs) {
    const programs = NEED_TO_PROGRAMS[need as keyof typeof NEED_TO_PROGRAMS];
    if (programs) programs.forEach((p) => relevantProgramIds.add(p));
  }

  const sorted = [...results.results].sort((a, b) => {
    const aRelevant = relevantProgramIds.has(a.programId) ? 1 : 0;
    const bRelevant = relevantProgramIds.has(b.programId) ? 1 : 0;
    if (aRelevant !== bRelevant) return bRelevant - aRelevant;

    const statusOrder = {
      LIKELY_ELIGIBLE: 0,
      MAY_BE_ELIGIBLE: 1,
      INSUFFICIENT_DATA: 2,
      LIKELY_NOT_ELIGIBLE: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return { ...results, results: sorted };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestParsed = ChatRequestSchema.safeParse(body);

    if (!requestParsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: requestParsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { messages, language } = requestParsed.data;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Groq API key not configured',
          message: 'Add GROQ_API_KEY to environment variables. See API_SETUP_GUIDE.md',
        },
        { status: 503 }
      );
    }

    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiText =
      data.choices?.[0]?.message?.content ||
      'I apologize, I could not process that. Please try again.';

    const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
    let eligibilityResults: AssessmentResult | null = null;
    let pipelineMeta: Record<string, unknown> | null = null;
    let needsHumanReview = false;

    if (jsonMatch) {
      try {
        const rawParsed = JSON.parse(jsonMatch[1]);
        const profileParsed = ExtractedProfileResponseSchema.safeParse(rawParsed);

        if (profileParsed.success && profileParsed.data.ready_to_assess) {
          const profileValidation = UserProfileSchema.safeParse(
            profileParsed.data.extracted_profile
          );

          if (profileValidation.success) {
            const profile = profileValidation.data;
            const classified = classifyNeeds(profile, lastUserMessage);
            const needs = profileParsed.data.identified_needs || classified.needs;

            if (
              classified.requiresClarification &&
              (profileParsed.data.extraction_confidence ?? 1) < 0.6
            ) {
              needsHumanReview = true;
            }

            if (profileParsed.data.needs_human_review) {
              needsHumanReview = true;
            }

            let assessment = evaluateEligibility(profile);
            assessment = rankResultsByNeeds(assessment, needs);

            eligibilityResults = assessment;
            pipelineMeta = {
              identifiedNeeds: needs,
              urgency: classified.urgency,
              extractionConfidence: profileParsed.data.extraction_confidence ?? classified.ambiguityScore,
              needsHumanReview,
              architecture: 'NLP → Need Classification → Rules Engine → Recommendation Ranking → Explanation',
            };
          }
        }
      } catch (parseError) {
        console.error('Profile JSON parse error:', parseError);
      }
    }

    const cleanText = aiText.replace(/```json[\s\S]*?```/g, '').trim();

    return NextResponse.json({
      message: cleanText || "I've analyzed your situation. Here are your results:",
      eligibilityResults,
      pipelineMeta,
      needsHumanReview,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
