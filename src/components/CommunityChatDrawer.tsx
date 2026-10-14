'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommunityMessage, UserAccount } from '@/types';
import {
  X,
  Send,
  MessageSquare,
  Trash2,
  User,
  Shield,
  ShieldAlert,
  Users,
  CheckCircle,
} from 'lucide-react';

interface CommunityChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export function CommunityChatDrawer({
  isOpen,
  onClose,
  currentUser,
}: CommunityChatDrawerProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/community-chat');
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching community messages:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/community-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (msg: CommunityMessage) => {
    const isSelf = msg.userId === currentUser.id || msg.username === currentUser.username;
    const confirmText = isSelf
      ? 'Tarik pesan ini dari obrolan komunitas?'
      : `Hapus pesan dari @${msg.username}?`;

    if (!confirm(confirmText)) return;

    setDeletingId(msg.id);
    try {
      const res = await fetch(`/api/community-chat?id=${msg.id}&actorUserId=${currentUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      } else {
        alert(data.error || 'Gagal menghapus pesan.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  // RBAC permissions for deleting messages:
  // - Author can always unsend own message
  // - Superadmin can delete any message
  // - Admin can delete user/client messages
  const canDeleteMessage = (msg: CommunityMessage) => {
    const isSelf = msg.userId === currentUser.id || msg.username === currentUser.username;
    if (isSelf) return true;
    if (currentUser.role === 'superadmin') return true;
    if (currentUser.role === 'admin' && (msg.userRole === 'client' || (msg.userRole as string) === 'user')) {
      return true;
    }
    return false;
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9998,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100%',
          background: 'var(--bg-secondary, #191714)',
          borderLeft: '1px solid var(--border-subtle, #393128)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-elevated, #211D18)',
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
                background: 'linear-gradient(135deg, #C6A15B, #8F6D35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#11100E',
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary, #F1E8D8)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                }}
              >
                Obrolan Komunitas
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#7EAA83',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-secondary, #A79D8D)' }}>
                  {messages.length} pesan terkirim
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #A79D8D)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'var(--bg-primary, #11100E)',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary, #A79D8D)',
                textAlign: 'center',
                padding: 24,
              }}
            >
              <Users size={36} style={{ marginBottom: 10, color: '#8F6D35', opacity: 0.7 }} />
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600, color: '#F1E8D8' }}>Belum ada pesan komunitas.</p>
              <p style={{ fontSize: 11.5, margin: '4px 0 0', color: '#A79D8D' }}>
                Mulai percakapan keluarga pertama di bawah ini!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.userId === currentUser.id || msg.username === currentUser.username;
              const hasDeletePerm = canDeleteMessage(msg);
              const isDeleting = deletingId === msg.id;

              const roleBadgeColor =
                msg.userRole === 'superadmin'
                  ? { bg: 'rgba(198, 161, 91, 0.18)', text: '#C6A15B', border: 'rgba(198, 161, 91, 0.4)' }
                  : msg.userRole === 'admin'
                  ? { bg: 'rgba(126, 170, 131, 0.18)', text: '#7EAA83', border: 'rgba(126, 170, 131, 0.4)' }
                  : { bg: 'rgba(167, 157, 141, 0.15)', text: '#A79D8D', border: 'rgba(167, 157, 141, 0.3)' };

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isSelf ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 8,
                    opacity: isDeleting ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--bg-elevated, #211D18)',
                      border: '1px solid var(--border-subtle, #393128)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {msg.avatarUrl ? (
                      <img
                        src={msg.avatarUrl}
                        alt={msg.displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={16} color="#A79D8D" />
                    )}
                  </div>

                  {/* Message Bubble & Meta */}
                  <div
                    style={{
                      maxWidth: '78%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isSelf ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Header: Name & Role Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 4,
                        fontSize: 11,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: isSelf ? '#C6A15B' : '#F1E8D8' }}>
                        {isSelf ? 'Anda' : msg.displayName}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          padding: '0px 5px',
                          borderRadius: 4,
                          background: roleBadgeColor.bg,
                          color: roleBadgeColor.text,
                          border: `1px solid ${roleBadgeColor.border}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {msg.userRole === 'client' ? 'WARGA' : msg.userRole}
                      </span>
                    </div>

                    {/* Content Box */}
                    <div
                      style={{
                        position: 'relative',
                        padding: '9px 13px',
                        borderRadius: isSelf ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                        background: isSelf
                          ? 'linear-gradient(135deg, #3A2E1F, #261D13)'
                          : 'var(--bg-elevated, #211D18)',
                        color: '#F1E8D8',
                        border: isSelf ? '1px solid #C6A15B' : '1px solid var(--border-subtle, #393128)',
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.message}

                      {/* Action buttons on hover / permanent */}
                      {hasDeletePerm && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg)}
                          title={isSelf ? 'Tarik pesan saya' : 'Hapus pesan ini'}
                          style={{
                            marginLeft: 8,
                            float: 'right',
                            background: 'transparent',
                            border: 'none',
                            color: isSelf ? 'rgba(241, 232, 216, 0.7)' : '#D97970',
                            cursor: 'pointer',
                            padding: 2,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Time */}
                    <span style={{ fontSize: 9.5, color: '#A79D8D', marginTop: 3 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: 12,
            borderTop: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-elevated, #211D18)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan komunitas keluarga..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--bg-primary, #11100E)',
              border: '1px solid var(--border-subtle, #393128)',
              color: '#F1E8D8',
              fontSize: 12.5,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #C6A15B, #8F6D35)',
              color: '#11100E',
              fontWeight: 700,
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
