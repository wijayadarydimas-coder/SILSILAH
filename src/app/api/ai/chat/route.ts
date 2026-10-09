import { NextRequest, NextResponse } from 'next/server';
import { askFamilyAI, ChatMessage } from '@/lib/ai/assistant';

export async function GET() {
  const aiName = process.env.AI_NAME?.trim() || 'Asisten Silsilah';
  return NextResponse.json({ success: true, aiName });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Pertanyaan tidak boleh kosong.' }, { status: 400 });
    }

    // Security check: Limit prompt length to prevent prompt injection / buffer overflow
    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Pertanyaan terlalu panjang (maksimal 2000 karakter).' }, { status: 400 });
    }

    const cleanHistory: ChatMessage[] = Array.isArray(history)
      ? history.slice(-10).map((h) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: String(h.content || '').substring(0, 2000),
        }))
      : [];

    const result = await askFamilyAI(prompt.trim(), cleanHistory);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      provider: result.provider,
      aiName: result.aiName,
    });
  } catch (error: any) {
    console.error('AI chat route error:', error);
    return NextResponse.json({ error: 'Gagal memproses pertanyaan asisten AI.' }, { status: 500 });
  }
}

