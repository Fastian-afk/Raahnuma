import { NextRequest, NextResponse } from 'next/server';
import { TtsRequestSchema } from '@/lib/validation/schemas';

const VOICE_MAP: Record<string, string> = {
  en: 'JBFqnCBsd6RMkjVDRZzb',
  ur: 'JBFqnCBsd6RMkjVDRZzb',
};

const LANG_MAP: Record<string, string> = {
  en: 'en',
  ur: 'ur',
  sd: 'ur',
  ps: 'ur',
  pn: 'ur',
  bl: 'ur',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TtsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'ElevenLabs API key not configured',
          message: 'Add ELEVENLABS_API_KEY to environment variables. See API_SETUP_GUIDE.md',
        },
        { status: 503 }
      );
    }

    const { text, language } = parsed.data;
    const voiceId = VOICE_MAP[language] || VOICE_MAP.en;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.slice(0, 2000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          language_code: LANG_MAP[language] || 'en',
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', errText);
      return NextResponse.json(
        { error: 'Text-to-speech service error', details: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: base64,
      contentType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'Text-to-speech failed' }, { status: 500 });
  }
}

export const maxDuration = 30;
