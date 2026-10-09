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
          background: '#0D1424',
          borderLeft: '1px solid #1E293B',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
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
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#F8FAFC' }}>
                Obrolan Komunitas
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10B981',
                  }}
                />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
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
              color: '#94A3B8',
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
                color: '#64748B',
                textAlign: 'center',
                padding: 24,
              }}
            >
              <Users size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>Belum ada pesan komunitas.</p>
              <p style={{ fontSize: 11.5, margin: '4px 0 0', color: '#475569' }}>
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
                  ? { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' }
                  : msg.userRole === 'admin'
                  ? { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' }
                  : { bg: 'rgba(100, 116, 139, 0.15)', text: '#94A3B8', border: 'rgba(100, 116, 139, 0.3)' };

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
                      background: '#1E293B',
                      border: '1px solid #334155',
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
                      <User size={16} color="#94A3B8" />
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
                      <span style={{ fontWeight: 600, color: isSelf ? '#38BDF8' : '#CBD5E1' }}>
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
                        {msg.userRole === 'client' ? 'USER' : msg.userRole}
                      </span>
                    </div>

                    {/* Content Box */}
                    <div
                      style={{
                        position: 'relative',
                        padding: '9px 13px',
                        borderRadius: isSelf ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                        background: isSelf ? '#0284C7' : '#162035',
                        color: '#FFFFFF',
                        border: isSelf ? 'none' : '1px solid #1E293B',
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
                            color: isSelf ? 'rgba(255,255,255,0.7)' : '#EF4444',
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
                    <span style={{ fontSize: 9.5, color: '#64748B', marginTop: 3 }}>
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
            borderTop: '1px solid #1E293B',
            background: '#131B2E',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan komunitas..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#0F172A',
              border: '1px solid #1E293B',
              color: '#FFFFFF',
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
              background: '#0284C7',
              color: '#FFFFFF',
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
