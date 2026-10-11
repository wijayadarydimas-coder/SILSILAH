'use client';

import React, { useState } from 'react';
import { X, KeyRound, Mail, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [tab, setTab] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation state
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_RESET',
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memproses permohonan.');
      } else {
        setTab('confirm');
        setSuccessMsg(
          data.message ||
            `Kode verifikasi 6-digit telah dikirim ke alamat email ${email}. Silakan periksa kotak masuk (inbox) atau folder spam Anda.`
        );
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
          email: email.trim().toLowerCase(),
          token: tokenInput.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mereset kata sandi.');
      } else {
        setSuccessMsg('🎉 Kata sandi berhasil diperbarui! Mengalihkan ke login...');
        setTimeout(() => {
          onClose();
        }, 1800);
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
          background: 'var(--bg-elevated, #211D18)',
          border: '1px solid var(--border-subtle, #393128)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(450px, 94vw)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
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
            borderBottom: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-secondary, #191714)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={20} color="#C6A15B" />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary, #F1E8D8)',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Reset Kata Sandi via Email
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-secondary, #A79D8D)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle, #393128)', background: 'var(--bg-secondary, #191714)' }}>
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
              background: tab === 'request' ? 'var(--bg-elevated, #211D18)' : 'transparent',
              color: tab === 'request' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
              border: 'none',
              borderBottom: tab === 'request' ? '2px solid #C6A15B' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            1. Minta Token Email
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
              background: tab === 'confirm' ? 'var(--bg-elevated, #211D18)' : 'transparent',
              color: tab === 'confirm' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
              border: 'none',
              borderBottom: tab === 'confirm' ? '2px solid #C6A15B' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            2. Masukkan Token &amp; Sandi Baru
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(217, 121, 112, 0.15)',
                border: '1px solid rgba(217, 121, 112, 0.3)',
                color: '#D97970',
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
                background: 'rgba(126, 170, 131, 0.15)',
                border: '1px solid rgba(126, 170, 131, 0.3)',
                color: '#7EAA83',
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

          {/* TAB 1: AJUKAN REQUEST EMAIL */}
          {tab === 'request' && (
            <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #A79D8D)', lineHeight: 1.5 }}>
                Masukkan alamat email yang terdaftar pada akun Anda. Sistem akan mengirimkan token verifikasi 6 digit langsung ke inbox email Anda melalui server SMTP.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #F1E8D8)', marginBottom: 6 }}>
                  Alamat Email Terdaftar:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#C6A15B" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@keluarga.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 8,
                      background: 'var(--bg-secondary, #191714)',
                      border: '1px solid var(--border-subtle, #393128)',
                      color: 'var(--text-primary, #F1E8D8)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(198, 161, 91, 0.1)',
                  border: '1px solid rgba(198, 161, 91, 0.25)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: '#F1E8D8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ShieldCheck size={16} color="#C6A15B" style={{ flexShrink: 0 }} />
                <span>Pemulihan kata sandi dilindungi verifikasi SMTP email real-time.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  marginTop: 4,
                  padding: '10px 16px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <span>{loading ? 'Mengirim Email...' : 'Kirim Token ke Email'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* TAB 2: KONFIRMASI TOKEN EMAIL */}
          {tab === 'confirm' && (
            <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #A79D8D)', lineHeight: 1.5 }}>
                Masukkan token verifikasi 6 digit yang dikirimkan ke email Anda dan tentukan kata sandi baru.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #F1E8D8)', marginBottom: 4 }}>
                  Alamat Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@keluarga.com"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #F1E8D8)', marginBottom: 4 }}>
                  Token Verifikasi Email (6-Digit):
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
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: '#C6A15B',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    fontSize: 15,
                    textAlign: 'center',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #F1E8D8)', marginBottom: 4 }}>
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
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
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
                <span>{loading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                <CheckCircle size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
