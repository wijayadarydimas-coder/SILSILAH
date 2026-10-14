'use client';

import React, { useState, useEffect } from 'react';
import { useFamilyStore } from '@/lib/store';
import { PasswordResetRequest } from '@/types';
import {
  X,
  KeyRound,
  Printer,
  FileDown,
  RefreshCw,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface PasswordResetAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetAdminModal({ isOpen, onClose }: PasswordResetAdminModalProps) {
  const { currentUser, currentRole } = useFamilyStore();
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [msg, setMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('silsilah123');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.requests)) {
          setRequests(data.requests);
        }
      }
    } catch (e) {
      console.warn('Fetch reset requests error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResolve = async (requestId: string, username: string) => {
    const pw = prompt(`Masukkan kata sandi baru untuk akun "${username}":`, tempPassword);
    if (!pw) return;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: currentUser?.id || 'usr-superadmin',
          requestId,
          action: 'RESOLVE_WITH_PASSWORD',
          tempPassword: pw,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✓ ${data.message || 'Berhasil mereset kata sandi.'}`);
        fetchRequests();
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'Gagal memproses.');
      }
    } catch {
      alert('Gagal terhubung ke database.');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Batalkan permintaan reset ini?')) return;
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: currentUser?.id || 'usr-superadmin',
          requestId,
          action: 'CANCEL',
        }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch {}
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const filtered = requests.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
      {/* Modal View for Screen */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <div
          style={{
            background: 'var(--bg-elevated, #211D18)',
            border: '1px solid var(--border-subtle, #393128)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 'min(760px, 95vw)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.5))',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle, #393128)',
              background: 'var(--bg-secondary, #191714)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KeyRound size={20} color="#C6A15B" />
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-primary, #F1E8D8)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.01em',
                    margin: 0,
                  }}
                >
                  Laporan Permintaan Lupa Kata Sandi
                </h2>
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary, #A79D8D)' }}>
                  Total Permintaan: {requests.length} | Pending: {pendingCount}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Print / Download PDF button */}
              <button
                onClick={handlePrintPDF}
                title="Cetak atau simpan sebagai PDF"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(198, 161, 91, 0.15)',
                  border: '1px solid rgba(198, 161, 91, 0.3)',
                  color: '#C6A15B',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span>Cetak / Unduh PDF</span>
              </button>

              <button
                onClick={fetchRequests}
                title="Segarkan data"
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: 'var(--bg-elevated, #211D18)',
                  border: '1px solid var(--border-subtle, #393128)',
                  color: 'var(--text-secondary, #A79D8D)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <RefreshCw size={15} />
              </button>

              <button onClick={onClose} style={{ color: 'var(--text-secondary, #A79D8D)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Subheader / Tabs */}
          <div
            style={{
              padding: '10px 20px',
              background: 'var(--bg-secondary, #191714)',
              borderBottom: '1px solid var(--border-subtle, #393128)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: filter === 'all' ? 'var(--bg-elevated, #211D18)' : 'transparent',
                  color: filter === 'all' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
                  border: filter === 'all' ? '1px solid var(--border-subtle, #393128)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Semua ({requests.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: filter === 'pending' ? 'rgba(198, 161, 91, 0.15)' : 'transparent',
                  color: filter === 'pending' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
                  border: filter === 'pending' ? '1px solid rgba(198, 161, 91, 0.3)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Menunggu Penanganan ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: filter === 'resolved' ? 'rgba(126, 170, 131, 0.15)' : 'transparent',
                  color: filter === 'resolved' ? '#7EAA83' : 'var(--text-secondary, #A79D8D)',
                  border: filter === 'resolved' ? '1px solid rgba(126, 170, 131, 0.3)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Selesai Direset
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msg && (
              <div
                style={{
                  background: 'rgba(126, 170, 131, 0.15)',
                  border: '1px solid rgba(126, 170, 131, 0.3)',
                  color: '#7EAA83',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle size={16} />
                <span>{msg}</span>
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #A79D8D)', fontSize: 13 }}>
                Tidak ada data permintaan reset kata sandi pada kategori ini.
              </div>
            ) : (
              filtered.map((r) => {
                const isPending = r.status === 'pending';
                const isWhatsapp = r.contactType === 'whatsapp';
                const dateStr = new Date(r.createdAt).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <div
                    key={r.id}
                    style={{
                      background: 'var(--bg-secondary, #191714)',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle, #393128)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #F1E8D8)' }}>
                          @{r.username}
                        </span>
                        {r.displayName && (
                          <span style={{ fontSize: 12, color: 'var(--text-secondary, #A79D8D)' }}>({r.displayName})</span>
                        )}
                        <span
                          style={{
                            fontSize: 10.5,
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontWeight: 600,
                            background: isPending ? 'rgba(198, 161, 91, 0.15)' : 'rgba(126, 170, 131, 0.15)',
                            color: isPending ? '#C6A15B' : '#7EAA83',
                            border: `1px solid ${isPending ? 'rgba(198, 161, 91, 0.3)' : 'rgba(126, 170, 131, 0.3)'}`,
                          }}
                        >
                          {isPending ? 'Pending' : 'Selesai'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, fontSize: 12, color: 'var(--text-secondary, #A79D8D)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isWhatsapp ? <Phone size={12} color="#C6A15B" /> : <Mail size={12} color="#C6A15B" />}
                          <b style={{ color: 'var(--text-primary, #F1E8D8)' }}>{r.contactValue}</b> ({isWhatsapp ? 'WhatsApp' : 'Email'})
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />
                          {dateStr}
                        </span>
                      </div>

                      {r.notes && (
                        <div style={{ fontSize: 11, color: '#A79D8D', marginTop: 4, fontStyle: 'italic' }}>
                          Catatan: {r.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleResolve(r.id, r.username)}
                            className="btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: 11.5,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Check size={13} />
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleCancelRequest(r.id)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              background: 'rgba(217, 121, 112, 0.15)',
                              color: '#D97970',
                              border: '1px solid rgba(217, 121, 112, 0.3)',
                              fontSize: 11.5,
                              cursor: 'pointer',
                            }}
                          >
                            Batalkan
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11.5, color: '#7EAA83', fontWeight: 600 }}>
                          ✓ Telah Ditangani
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Printable Report Section (Only rendered when printing or saving PDF) */}
      <div id="print-report-container" className="print-only">
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 15 }}>
            <h1 style={{ fontSize: 18, margin: 0, textTransform: 'uppercase' }}>
              SILSILAH KELUARGA - LAPORAN PERMINTAAN LUPA KATA SANDI
            </h1>
            <p style={{ fontSize: 12, margin: '4px 0 0 0', color: '#444' }}>
              Dicetak pada: {new Date().toLocaleString('id-ID')} | Petugas: {currentUser?.displayName || 'Admin'}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>No</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>Username</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>Nama Tampilan</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>Tipe Kontak</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>No. WA / Email</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>Waktu Pengajuan</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #ccc' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{i + 1}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}><b>@{r.username}</b></td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{r.displayName || '-'}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{r.contactType.toUpperCase()}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{r.contactValue}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                    {new Date(r.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                    {r.status === 'pending' ? 'MENUNGGU (PENDING)' : 'SELESAI (RESOLVED)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: 11, color: '#666', borderTop: '1px solid #ccc', paddingTop: 10 }}>
            Catatan: Laporan ini bersifat rahasia untuk keperluan verifikasi identitas internal keluarga.
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </>
  );
}
