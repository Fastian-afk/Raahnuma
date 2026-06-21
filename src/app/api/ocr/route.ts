import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OcrRequestSchema } from '@/lib/validation/schemas';

const OCR_PROMPT = `You are a document extraction assistant for Pakistan's social protection system.
Extract structured information from the uploaded document (CNIC, B-Form, or other ID).

Return ONLY valid JSON (no markdown) with these fields when found:
{
  "documentType": "cnic" | "b_form" | "other",
  "cnicNumber": "12345-1234567-1" or null,
  "fullName": string or null,
  "fatherName": string or null,
  "dateOfBirth": "YYYY-MM-DD" or null,
  "province": "punjab"|"sindh"|"kpk"|"balochistan"|"islamabad"|"ajk"|"gilgit_baltistan" or null,
  "gender": "male"|"female" or null,
  "address": string or null,
  "confidence": 0.0 to 1.0,
  "notes": "any caveats about extraction quality"
}

Rules:
- CNIC format: 12345-1234567-1 (13 digits with dashes)
- Do NOT invent data — use null for fields you cannot read
- Province should be inferred from address/CNIC issuing authority when possible
- Set confidence low (<0.5) if image is blurry or partially visible`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OcrRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Gemini API key not configured',
          message: 'Add GEMINI_API_KEY to your environment variables. See API_SETUP_GUIDE.md',
        },
        { status: 503 }
      );
    }

    const { imageBase64, mimeType } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      OCR_PROMPT,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const responseText = result.response.text();

    let extracted;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse document extraction results', raw: responseText.slice(0, 500) },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      extracted,
      disclaimer:
        'Extracted data is for guidance only. Verify all information against your physical document.',
    });
  } catch (error) {
    console.error('OCR API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Document analysis failed', message }, { status: 500 });
  }
}

export const maxDuration = 30;
