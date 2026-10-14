'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, History, Clock, User, Shield, Activity, Trash2 } from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDrawer({ isOpen, onClose }: AuditLogDrawerProps) {
  const { auditLogs, currentRole, deleteAuditLog, clearAuditLogs } = useFamilyStore();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus SEMUA catatan audit log? Tindakan ini tidak dapat dibatalkan.')) return;
    setIsDeleting(true);
    await clearAuditLogs();
    setIsDeleting(false);
  };

  const handleDeleteSingle = async (logId: string) => {
    if (!window.confirm('Hapus log aktivitas ini?')) return;
    await deleteAuditLog(logId);
  };

  const getActionBadge = (action: string) => {
    if (action.startsWith('CREATE')) {
      return { bg: 'rgba(126, 170, 131, 0.18)', text: '#7EAA83', label: 'Tambah Data' };
    }
    if (action.startsWith('UPDATE')) {
      return { bg: 'rgba(198, 161, 91, 0.18)', text: '#C6A15B', label: 'Ubah Data' };
    }
    if (action.startsWith('DELETE')) {
      return { bg: 'rgba(217, 121, 112, 0.18)', text: '#D97970', label: 'Hapus Data' };
    }
    if (action.includes('ROLE')) {
      return { bg: 'rgba(215, 164, 90, 0.18)', text: '#D7A45A', label: 'Ubah Hak Akses' };
    }
    return { bg: 'rgba(167, 157, 141, 0.15)', text: '#A79D8D', label: 'Sistem' };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 480,
        background: 'var(--bg-secondary, #191714)',
        borderLeft: '1px solid var(--border-subtle, #393128)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle, #393128)',
          background: 'var(--bg-elevated, #211D18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={18} color="#C6A15B" />
          <h2
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary, #F1E8D8)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.01em',
              margin: 0,
            }}
          >
            Audit Log Riwayat Silsilah
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentRole === 'superadmin' && auditLogs.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isDeleting}
              title="Bersihkan Semua Log (Superadmin)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(217, 121, 112, 0.15)',
                border: '1px solid rgba(217, 121, 112, 0.3)',
                color: '#D97970',
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <Trash2 size={13} />
              <span>{isDeleting ? 'Membersihkan...' : 'Bersihkan Semua'}</span>
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary, #A79D8D)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--bg-primary, #11100E)',
        }}
      >
        <p style={{ fontSize: 12, color: 'var(--text-secondary, #A79D8D)', lineHeight: 1.5, marginBottom: 4 }}>
          Merekam setiap aktivitas modifikasi person, relasi keluarga, dan perubahan hak akses untuk
          menjamin akuntabilitas dan keamanan silsilah.
        </p>

        {auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #A79D8D)', fontSize: 13 }}>
            Belum ada catatan riwayat perubahan.
          </div>
        ) : (
          auditLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={log.id}
                style={{
                  background: 'var(--bg-elevated, #211D18)',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle, #393128)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: badge.bg,
                      color: badge.text,
                    }}
                  >
                    {badge.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary, #A79D8D)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {dateStr}
                    </span>
                    {currentRole === 'superadmin' && (
                      <button
                        onClick={() => handleDeleteSingle(log.id)}
                        title="Hapus riwayat log ini"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#A79D8D',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: 4,
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#D97970')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#A79D8D')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#F1E8D8', fontWeight: 500, lineHeight: 1.4 }}>
                  {log.summary}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: 'var(--text-secondary, #A79D8D)',
                    marginTop: 2,
                    paddingTop: 6,
                    borderTop: '1px solid var(--border-subtle, #393128)',
                  }}
                >
                  <User size={11} color="#C6A15B" />
                  <span>Pelaku: <strong style={{ color: '#F1E8D8' }}>{log.actorName}</strong></span>
                  <span style={{ opacity: 0.7 }}>({log.actorRole.toUpperCase()})</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
