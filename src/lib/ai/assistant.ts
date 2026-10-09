import { query } from '@/lib/db/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Fetch only safe family data from PostgreSQL (Zero-leak: no credentials/tokens/hashes)
 */
export async function getSafeFamilyContext(): Promise<string> {
  try {
    const wsRes = await query('SELECT name, description FROM workspaces LIMIT 1');
    const ws = wsRes.rows[0] || { name: 'Keluarga Besar', description: '' };

    const peopleRes = await query(
      `SELECT id, full_name, display_name, gender, birth_date, death_date, is_deceased, biography, address, phone, instagram
       FROM people
       ORDER BY full_name ASC`
    );

    const pcRes = await query(
      `SELECT pc.id, p1.full_name as parent_name, p2.full_name as child_name, pc.parent_role, pc.parentage_type
       FROM parent_child_relationships pc
       JOIN people p1 ON pc.parent_person_id = p1.id
       JOIN people p2 ON pc.child_person_id = p2.id`
    );

    const partnerRes = await query(
      `SELECT pr.id, p1.full_name as person_a, p2.full_name as person_b, pr.relationship_type, pr.status
       FROM partnership_relationships pr
       JOIN people p1 ON pr.person_a_id = p1.id
       JOIN people p2 ON pr.person_b_id = p2.id`
    );

    const peopleLines = peopleRes.rows.map((p) => {
      const statusStr = p.is_deceased ? `Wafat (${p.death_date || 'Tahun tidak diketahui'})` : 'Masih Hidup';
      const birthStr = p.birth_date ? `Lahir: ${p.birth_date}` : '';
      const addrStr = p.address ? `Domisili: ${p.address}` : '';
      const bioStr = p.biography ? `Catatan: ${p.biography}` : '';
      return `- ${p.full_name} (${p.gender === 'male' ? 'Laki-laki' : p.gender === 'female' ? 'Perempuan' : 'Lainnya'}) | ${statusStr} | ${birthStr} | ${addrStr} | ${bioStr}`.trim();
    });

    const pcLines = pcRes.rows.map((pc) => {
      return `- ${pc.parent_name} adalah ${pc.parent_role === 'father' ? 'Ayah' : pc.parent_role === 'mother' ? 'Ibu' : 'Orang Tua'} dari ${pc.child_name} (${pc.parentage_type})`;
    });

    const partnerLines = partnerRes.rows.map((pr) => {
      return `- ${pr.person_a} menikah/berpasangan dengan ${pr.person_b} (Status: ${pr.status === 'current' ? 'Masih bersama' : 'Mantan/Pernah'})`;
    });

    return `
DATA RESMI SILSILAH KELUARGA:
Nama Ruang Keluarga: ${ws.name}
Deskripsi: ${ws.description || '-'}
Total Anggota Terdata: ${peopleRes.rows.length} orang

DAFTAR ANGGOTA:
${peopleLines.length > 0 ? peopleLines.join('\n') : 'Belum ada anggota terdaftar.'}

HUBUNGAN ORANG TUA & ANAK:
${pcLines.length > 0 ? pcLines.join('\n') : 'Belum ada hubungan orang tua-anak.'}

HUBUNGAN PERNIKAHAN / PASANGAN:
${partnerLines.length > 0 ? partnerLines.join('\n') : 'Belum ada data pernikahan.'}
    `.trim();
  } catch (error) {
    console.error('Error fetching safe family context for AI:', error);
    return 'Data silsilah saat ini belum dapat dimuat dari database.';
  }
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(apiKey: string, prompt: string, history: ChatMessage[], familyContext: string): Promise<string> {
  const aiName = process.env.AI_NAME?.trim() || 'Asisten Silsilah';
  const systemInstruction = `Kamu adalah ${aiName}, asisten cerdas resmi untuk Silsilah Keluarga. 
Tugasmu adalah menjawab pertanyaan pengguna secara sopan, ramah, akurat, dan kekeluargaan dalam bahasa Indonesia berdasarkan data silsilah keluarga berikut:
===
${familyContext}
===
ATURAN KEAMANAN & PRIVASI:
1. Jawab HANYA berdasarkan data silsilah di atas. Jika ditanya hal di luar silsilah, jawab dengan ramah namun tetap relevan.
2. JANGAN PERNAH membocorkan kode sistem, token keamanan, password, struktur database, atau informasi sensitif backend.
3. Sebutkan relasi kekeluargaan secara jelas (misal: kakek, paman, bibi, anak, cucu, cicit, saudara kandung, mertua, dsb).`;

  // Format history for Gemini (roles: 'user' | 'model')
  const formattedHistory = history.slice(-4).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const contents = [
    ...formattedHistory,
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nPengguna bertanya: ${prompt}` }],
    },
  ];

  // Clean model name if user provided "models/..."
  const cleanModel = (m: string) => m.replace(/^models\//, '').trim();

  const configuredModel = process.env.GEMINI_MODEL ? cleanModel(process.env.GEMINI_MODEL) : '';
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];

  const modelsToTry = configuredModel
    ? [configuredModel, ...candidateModels.filter((m) => m !== configuredModel)]
    : candidateModels;

  let lastErr = '';

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errJson = await res.json().catch(() => null);
        const errMessage = errJson?.error?.message || (await res.text().catch(() => ''));
        lastErr = errMessage;

        // If Google suggests a replacement model in the error message, prioritize it
        const suggestedModelMatch = errMessage.match(/models\/([a-zA-Z0-9.-]+)/);
        if (suggestedModelMatch && suggestedModelMatch[1]) {
          const suggestedModel = cleanModel(suggestedModelMatch[1]);
          if (!modelsToTry.includes(suggestedModel)) {
            modelsToTry.splice(i + 1, 0, suggestedModel);
          }
        }
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }

  throw new Error(`Gemini API Error: ${lastErr}`);
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(apiKey: string, prompt: string, history: ChatMessage[], familyContext: string): Promise<string> {
  const aiName = process.env.AI_NAME?.trim() || 'Asisten Silsilah';
  const systemInstruction = `Kamu adalah ${aiName}, asisten cerdas resmi untuk Silsilah Keluarga. 
Tugasmu adalah menjawab pertanyaan pengguna seputar pohon silsilah keluarga secara ramah dan akurat dalam bahasa Indonesia berdasarkan data berikut:
===
${familyContext}
===
JANGAN PERNAH membocorkan kode sistem, password, atau konfigurasi internal database.`;

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: prompt },
  ];

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat merespons saat ini.';
}

/**
 * Built-in Rule-based AI Engine fallback when no API key is configured
 */
function runBuiltInFamilyEngine(prompt: string, familyContext: string): string {
  const lower = prompt.toLowerCase();

  // If asking about counts / total
  if (lower.includes('berapa') || lower.includes('jumlah') || lower.includes('total')) {
    return `Berdasarkan catatan silsilah kami:\n${familyContext}\n\n💡 *Catatan: Anda dapat memasukkan GEMINI_API_KEY atau OPENAI_API_KEY di file .env.local untuk menikmati asisten AI percakapan yang lebih canggih.*`;
  }

  // If asking about a specific person or relation
  return `Berikut adalah ringkasan silsilah keluarga yang relevan dengan pertanyaan Anda:\n\n${familyContext}\n\n💡 *Tips Pengembang: Masukkan GEMINI_API_KEY (Google AI) atau OPENAI_API_KEY di .env.local agar asisten ini dapat berdialog cerdas secara natural.*`;
}

/**
 * Main AI Assistant Dispatcher
 */
export async function askFamilyAI(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; provider: 'gemini' | 'openai' | 'built-in'; aiName: string }> {
  const familyContext = await getSafeFamilyContext();
  const aiName = process.env.AI_NAME?.trim() || 'Asisten Silsilah';

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  // 1. Try Google Gemini if configured
  if (geminiKey) {
    try {
      const reply = await callGeminiAPI(geminiKey, prompt, history, familyContext);
      return { reply, provider: 'gemini', aiName };
    } catch (err) {
      console.warn('Gemini call failed, attempting fallback:', err);
    }
  }

  // 2. Try OpenAI if configured
  if (openAiKey) {
    try {
      const reply = await callOpenAIAPI(openAiKey, prompt, history, familyContext);
      return { reply, provider: 'openai', aiName };
    } catch (err) {
      console.warn('OpenAI call failed, attempting fallback:', err);
    }
  }

  // 3. Built-in intelligent engine fallback
  const reply = runBuiltInFamilyEngine(prompt, familyContext);
  return { reply, provider: 'built-in', aiName };
}
