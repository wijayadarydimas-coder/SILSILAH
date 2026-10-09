'use client';

import React, { useState } from 'react';
import { X, KeyRound, Mail, Phone, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [tab, setTab] = useState<'request' | 'confirm'>('request');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation state
  const [confirmUsername, setConfirmUsername] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isWhatsappNotice, setIsWhatsappNotice] = useState(false);

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setGeneratedToken(null);
    setIsWhatsappNotice(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_RESET',
          identifier: identifier.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memproses permohonan.');
      } else {
        if (data.method === 'email' && data.token) {
          setGeneratedToken(data.token);
          setConfirmUsername(data.username);
          setTokenInput(data.token);
          setTab('confirm');
          setSuccessMsg(`✓ Token verifikasi berhasil dibuat otomatis: ${data.token}. Silakan tentukan kata sandi baru Anda.`);
        } else {
          setIsWhatsappNotice(true);
          setSuccessMsg(data.message || 'Permintaan reset telah dicatat ke database.');
        }
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_TOKEN',
          username: confirmUsername.trim(),
          token: tokenInput.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mereset kata sandi.');
      } else {
        setSuccessMsg('🎉 Kata sandi berhasil diperbarui! Anda dapat masuk sekarang.');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#0F1626',
          border: '1px solid #1E293B',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #1E293B',
            background: '#131B2E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={20} color="#F59E0B" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
              Pemulihan &amp; Lupa Kata Sandi
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', background: '#111827' }}>
          <button
            onClick={() => {
              setTab('request');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              background: tab === 'request' ? '#162035' : 'transparent',
              color: tab === 'request' ? '#F8FAFC' : '#94A3B8',
              border: 'none',
              borderBottom: tab === 'request' ? '2px solid #F59E0B' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            1. Ajukan Pemulihan
          </button>
          <button
            onClick={() => {
              setTab('confirm');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              background: tab === 'confirm' ? '#162035' : 'transparent',
              color: tab === 'confirm' ? '#F8FAFC' : '#94A3B8',
              border: 'none',
              borderBottom: tab === 'confirm' ? '2px solid #F59E0B' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            2. Masukkan Token Reset
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: AJUKAN REQUEST */}
          {tab === 'request' && (
            <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                Masukkan <b>Username</b>, <b>Alamat Email</b>, atau <b>Nomor WhatsApp</b> akun Anda yang terdaftar.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>
                  Identitas Akun (Username / Email / Nomor WA):
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: user123, email@domain.com, atau 08123456789"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: '#FCD34D',
                  lineHeight: 1.45,
                }}
              >
                <b>Ketentuan Pemulihan:</b>
                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                  <li><b>Akun Email:</b> Sistem otomatis menerbitkan kode token verifikasi instan.</li>
                  <li><b>Nomor WhatsApp:</b> Permintaan akan dicatat ke database untuk diverifikasi oleh Admin/Superadmin.</li>
                </ul>
              </div>

              {isWhatsappNotice && (
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#93C5FD',
                    lineHeight: 1.4,
                  }}
                >
                  📱 Permintaan pemulihan nomor WhatsApp telah tersimpan di sistem. Admin &amp; Superadmin dapat melihat permintaan Anda di menu <b>Laporan Permintaan Reset</b>.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  marginTop: 6,
                  padding: '10px 16px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <span>{loading ? 'Memeriksa Data...' : 'Kirim Permintaan Pemulihan'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* TAB 2: KONFIRMASI DENGAN TOKEN */}
          {tab === 'confirm' && (
            <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                Masukkan token verifikasi yang telah dibuat serta kata sandi baru untuk akun Anda.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                  Username Akun:
                </label>
                <input
                  type="text"
                  value={confirmUsername}
                  onChange={(e) => setConfirmUsername(e.target.value)}
                  placeholder="Username akun Anda..."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                  Token Verifikasi (6-Digit):
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Contoh: 482915"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F59E0B',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                  Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  marginTop: 6,
                  padding: '10px 16px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <span>{loading ? 'Menyimpan...' : 'Perbarui Kata Sandi Sekarang'}</span>
                <CheckCircle size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
