'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

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
          <strong key={pIdx} style={{ fontWeight: 700, color: '#38BDF8' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={pIdx} style={{ fontStyle: 'italic', color: '#E2E8F0' }}>
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
              <span style={{ color: '#10B981', fontSize: 13, lineHeight: '18px' }}>•</span>
              <span style={{ flex: 1, lineHeight: 1.55 }}>{parseInline(textToParse)}</span>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\.\s/);
          const num = numMatch ? numMatch[1] : '1';
          return (
            <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, paddingLeft: 4 }}>
              <span style={{ color: '#38BDF8', fontWeight: 600, fontSize: 12, minWidth: 16 }}>{num}.</span>
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
  'Siapa saja yang berdomisili di Jakarta atau Yogyakarta?',
  'Jelaskan struktur garis keturunan keluarga ini.',
];

export function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiName, setAiName] = useState('Asisten Silsilah');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load configured AI Name
  useEffect(() => {
    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => {
        if (data?.aiName) {
          setAiName(data.aiName);
          setMessages([
            {
              role: 'assistant',
              content: `Halo! Saya ${data.aiName} keluarga Anda. Saya dapat membantu mencari informasi anggota, relasi kekeluargaan (ayah/ibu/anak/pasangan), dan domisili anggota keluarga. Ada yang bisa saya bantu?`,
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: 'assistant',
            content:
              'Halo! Saya Asisten Silsilah keluarga Anda. Saya dapat membantu mencari informasi anggota, relasi kekeluargaan, dan garis keturunan. Ada yang bisa saya bantu?',
          },
        ]);
      });
  }, []);

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
    if (!text || loading) return;

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
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.aiName) setAiName(data.aiName);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Maaf, terjadi kendala saat memproses jawaban: ${data.error || 'Server error'}.`,
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
    setMessages([
      {
        role: 'assistant',
        content: 'Halo! Riwayat percakapan telah dibersihkan. Ada yang ingin Anda tanyakan seputar silsilah keluarga?',
      },
    ]);
  };

  return (
    <>
      {/* Floating trigger button on bottom-right of screen */}
      <button
        onClick={() => setIsOpen(true)}
        className="no-print"
        title={`Tanya ${aiName}`}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: 13,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.45)';
        }}
      >
        <Sparkles size={16} />
        <span>✨ Tanya {aiName}</span>
      </button>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 440,
            background: '#0F1626',
            borderLeft: '1px solid #1E293B',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.75)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #1E293B',
              background: '#131B2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                  {aiName}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 8px #10B981',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>Aktif</span>
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
                  color: '#94A3B8',
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
                  color: '#94A3B8',
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
                      background: isAssistant ? '#162035' : '#10B981',
                      border: '1px solid #1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isAssistant ? <Bot size={15} color="#10B981" /> : <User size={15} color="#FFFFFF" />}
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: isAssistant ? '#162035' : '#10B981',
                      color: isAssistant ? '#F1F5F9' : '#FFFFFF',
                      border: isAssistant ? '1px solid #1E293B' : 'none',
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
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
                    background: '#162035',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={15} color="#10B981" />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: '#162035',
                    color: '#94A3B8',
                    fontSize: 12,
                    fontStyle: 'italic',
                  }}
                >
                  Sedang menelusuri data silsilah...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div style={{ padding: '8px 16px', background: '#111827', borderTop: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>
              PERTANYAAN CEPAT:
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
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#94A3B8',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.borderColor = '#1E293B';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: 12,
              borderTop: '1px solid #1E293B',
              background: '#0F1626',
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
              placeholder="Tanya apapun tentang silsilah..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#162035',
                border: '1px solid #1E293B',
                color: '#F8FAFC',
                fontSize: 12.5,
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                background: '#10B981',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
