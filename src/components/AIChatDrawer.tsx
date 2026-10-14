'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Trash2, ShieldCheck, HelpCircle, User } from 'lucide-react';
import { useFamilyStore } from '@/lib/store';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Render Markdown smoothly without showing raw asterisks (**) or formatting tags
 */
function FormattedMarkdownText({ content, isAssistant }: { content: string; isAssistant: boolean }) {
  if (!isAssistant) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
  }

  const lines = content.split('\n');

  const parseInline = (text: string) => {
    // Match **bold** or *italic*
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} style={{ fontWeight: 700, color: 'var(--antique-gold, #C6A15B)' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={pIdx} style={{ fontStyle: 'italic', color: 'var(--ivory, #F1E8D8)' }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} style={{ height: 4 }} />;
        }

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(trimmed);
        const textToParse = isBullet
          ? trimmed.slice(2)
          : isNumbered
          ? trimmed.replace(/^\d+\.\s/, '')
          : line;

        if (isBullet) {
          return (
            <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, paddingLeft: 4 }}>
              <span style={{ color: 'var(--antique-gold, #C6A15B)', fontSize: 13, lineHeight: '18px' }}>•</span>
              <span style={{ flex: 1, lineHeight: 1.55 }}>{parseInline(textToParse)}</span>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\.\s/);
          const num = numMatch ? numMatch[1] : '1';
          return (
            <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, paddingLeft: 4 }}>
              <span style={{ color: 'var(--antique-gold, #C6A15B)', fontWeight: 600, fontSize: 12, minWidth: 16 }}>{num}.</span>
              <span style={{ flex: 1, lineHeight: 1.55 }}>{parseInline(textToParse)}</span>
            </div>
          );
        }

        return (
          <div key={lIdx} style={{ lineHeight: 1.55 }}>
            {parseInline(textToParse)}
          </div>
        );
      })}
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  'Siapa saja generasi tertua dalam silsilah?',
  'Berapa total anggota yang terdata dan berapa yang masih hidup?',
  'Bisa carikan nomor WhatsApp atau kontak keluarga?',
  'Siapa saja yang berdomisili di Jakarta atau Jawa Tengah?',
  'Apakah akun saya sudah masuk ke dalam silsilah keluarga?',
];

export function AIChatDrawer() {
  const { currentUser } = useFamilyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [aiName, setAiName] = useState('Asisten Silsilah');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load configured AI Name & initialize friendly greeting
  useEffect(() => {
    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => {
        const loadedAiName = data?.aiName || 'Asisten Silsilah';
        setAiName(loadedAiName);
        const greetingName = currentUser?.displayName ? `, ${currentUser.displayName}` : '';
        setMessages([
          {
            role: 'assistant',
            content: `Halo${greetingName}! Saya ${loadedAiName} keluarga Anda. Saya mengenal Anda dan siap membantu mencari informasi anggota, nomor WhatsApp, domisili, atau biografi di silsilah keluarga kita. Ada yang bisa saya bantu?`,
          },
        ]);
      })
      .catch(() => {
        const greetingName = currentUser?.displayName ? `, ${currentUser.displayName}` : '';
        setMessages([
          {
            role: 'assistant',
            content: `Halo${greetingName}! Saya Asisten Silsilah keluarga Anda. Saya siap membantu mencari informasi anggota, kontak WhatsApp, dan riwayat silsilah keluarga.`,
          },
        ]);
      });
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading || isOverloaded) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: newHistory.slice(-8),
          userId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setIsOverloaded(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.aiName) setAiName(data.aiName);
      } else {
        if (data.isOverloaded || res.status === 429) {
          setIsOverloaded(true);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${data.error || 'Server error saat memproses pertanyaan.'}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Koneksi ke asisten AI terputus. Pastikan server aktif.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const greetingName = currentUser?.displayName ? `, ${currentUser.displayName}` : '';
    setMessages([
      {
        role: 'assistant',
        content: `Halo${greetingName}! Riwayat percakapan telah dibersihkan. Ada yang ingin Anda tanyakan seputar anggota atau silsilah keluarga?`,
      },
    ]);
  };

  return (
    <>
      {/* Floating trigger button on bottom-right: Pure vector logo only without text */}
      <button
        onClick={() => setIsOpen(true)}
        className="no-print"
        title={aiName}
        aria-label={aiName}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          padding: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
          border: '2px solid rgba(198, 161, 91, 0.45)',
          boxShadow: '0 8px 25px rgba(198, 161, 91, 0.45)',
          cursor: 'pointer',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(6deg)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(198, 161, 91, 0.65)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(198, 161, 91, 0.45)';
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/ai-icon.svg"
          alt={aiName}
          style={{ width: 32, height: 32, display: 'block', pointerEvents: 'none' }}
        />
      </button>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <>
          <div
            className="show-on-tablet"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1099,
            }}
          />
          <div
            className="no-print"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 100vw)',
              background: 'var(--bg-secondary, #191714)',
              borderLeft: '1px solid var(--border-subtle, #393128)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.85)',
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle, #393128)',
              background: 'var(--bg-card, #211D18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'rgba(198, 161, 91, 0.15)',
                  border: '1px solid rgba(198, 161, 91, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/ai-icon.svg"
                  alt={aiName}
                  style={{ width: 24, height: 24, display: 'block' }}
                />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ivory, #F1E8D8)', letterSpacing: '0.01em' }}>
                  {aiName}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: isOverloaded ? 'var(--danger, #D97970)' : 'var(--success, #7EAA83)',
                    }}
                  />
                  <span style={{ fontSize: 11, color: isOverloaded ? 'var(--danger, #D97970)' : 'var(--text-muted, #A79D8D)' }}>
                    {isOverloaded
                      ? 'Kapasitas Penuh (Maks 10 Akun)'
                      : currentUser
                      ? `Aktif (${currentUser.displayName})`
                      : 'Aktif'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={handleClearChat}
                title="Bersihkan riwayat percakapan"
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #A79D8D)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #A79D8D)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>


          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: isAssistant ? 'row' : 'row-reverse',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isAssistant ? 'var(--bg-card, #211D18)' : 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
                      border: '1px solid var(--border-subtle, #393128)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isAssistant ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/assets/ai-icon.svg" alt="AI" style={{ width: 18, height: 18, display: 'block' }} />
                    ) : (
                      <User size={15} color="#11100E" />
                    )}
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: isAssistant ? 'var(--bg-card, #211D18)' : 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
                      color: isAssistant ? 'var(--ivory, #F1E8D8)' : '#11100E',
                      fontWeight: isAssistant ? 400 : 500,
                      border: isAssistant ? '1px solid var(--border-subtle, #393128)' : 'none',
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
                      boxShadow: isAssistant ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(198,161,91,0.25)',
                    }}
                  >
                    <FormattedMarkdownText content={m.content} isAssistant={isAssistant} />
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--bg-card, #211D18)',
                    border: '1px solid var(--border-subtle, #393128)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/ai-icon.svg" alt="AI" style={{ width: 18, height: 18, display: 'block' }} />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: 'var(--bg-card, #211D18)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-muted, #A79D8D)',
                    fontSize: 12,
                    fontStyle: 'italic',
                  }}
                >
                  Sedang menelusuri data silsilah trah...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div style={{ padding: '8px 16px', background: 'var(--bg-card, #211D18)', borderTop: '1px solid var(--border-subtle, #393128)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--antique-gold, #C6A15B)', marginBottom: 6, letterSpacing: '0.04em' }}>
              PANDUAN TELUSUR:
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'var(--bg-menu, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-muted, #A79D8D)',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ivory, #F1E8D8)';
                    e.currentTarget.style.borderColor = 'var(--antique-gold, #C6A15B)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted, #A79D8D)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle, #393128)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Overload alert banner */}
          {isOverloaded && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(217, 121, 112, 0.15)',
                borderTop: '1px solid rgba(217, 121, 112, 0.3)',
                color: 'var(--danger, #D97970)',
                fontSize: 11.5,
                lineHeight: 1.45,
              }}
            >
              ⚠️ <strong>Kapasitas AI Penuh:</strong> Saat ini telah mencapai batas maksimal 10 akun aktif. Asisten dinonaktifkan sementara untuk mencegah beban server (overloaded). Silakan tunggu sejenak sebelum mengirim pesan kembali.
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: 12,
              borderTop: '1px solid var(--border-subtle, #393128)',
              background: 'var(--bg-card, #211D18)',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isOverloaded ? 'Asisten AI sementara nonaktif (kapasitas penuh)...' : 'Tanya apapun tentang silsilah trah...'}
              disabled={loading || isOverloaded}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                background: 'var(--bg-menu, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: isOverloaded ? 'var(--text-muted, #A79D8D)' : 'var(--ivory, #F1E8D8)',
                fontSize: 12.5,
                cursor: isOverloaded ? 'not-allowed' : 'text',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || isOverloaded}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                background: isOverloaded ? '#475569' : 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
                border: 'none',
                color: isOverloaded ? 'white' : '#11100E',
                cursor: isOverloaded ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() || isOverloaded ? 0.5 : 1,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}
