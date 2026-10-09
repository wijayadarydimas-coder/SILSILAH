'use client';

import React from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, History, Clock, User, Shield, Activity } from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDrawer({ isOpen, onClose }: AuditLogDrawerProps) {
  const { auditLogs } = useFamilyStore();

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    if (action.startsWith('CREATE')) {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', label: 'Tambah Data' };
    }
    if (action.startsWith('UPDATE')) {
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', label: 'Ubah Data' };
    }
    if (action.startsWith('DELETE')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', label: 'Hapus Data' };
    }
    if (action.includes('ROLE')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', label: 'Ubah Hak Akses' };
    }
    return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', label: 'Sistem' };
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
        background: '#0F1626',
        borderLeft: '1px solid #1E293B',
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
          borderBottom: '1px solid #1E293B',
          background: '#131B2E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={18} color="#10B981" />
          <h2 style={{ fontWeight: 600, fontSize: 15, color: '#F8FAFC' }}>
            Audit Log Riwayat Perubahan Silsilah
          </h2>
        </div>
        <button onClick={onClose} style={{ color: '#94A3B8' }}>
          <X size={20} />
        </button>
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
        }}
      >
        <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, marginBottom: 4 }}>
          Merekam setiap aktivitas modifikasi person, relasi keluarga, dan perubahan hak akses untuk
          menjamin akuntabilitas dan keamanan silsilah.
        </p>

        {auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', fontSize: 13 }}>
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
                  background: '#162035',
                  borderRadius: 10,
                  border: '1px solid #1E293B',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
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
                  <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {dateStr}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 500, lineHeight: 1.4 }}>
                  {log.summary}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: '#94A3B8',
                    marginTop: 2,
                    paddingTop: 4,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <User size={11} />
                  <span>Pelaku: {log.actorName}</span>
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
