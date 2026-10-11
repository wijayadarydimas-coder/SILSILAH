'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, Lock, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'change_password';
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = 'login', onClose }: AuthModalProps) {
  const { currentUser, onLoginSuccess } = useFamilyStore();

  const [mode, setMode] = useState<'login' | 'change_password'>(initialMode === 'change_password' ? 'change_password' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode === 'change_password' ? 'change_password' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal login.');
      } else {
        setSuccessMsg(`Selamat datang, ${data.user.displayName}!`);
        onLoginSuccess(data.user);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch {
      setErrorMsg('Koneksi ke PostgreSQL gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    if (!currentUser) {
      setErrorMsg('Sesi login tidak ditemukan. Silakan masuk terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengganti kata sandi.');
      } else {
        setSuccessMsg('Kata sandi berhasil diperbarui di PostgreSQL!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch {
      setErrorMsg('Koneksi ke server database gagal.');
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
          maxWidth: 'min(440px, 94vw)',
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
            {mode === 'login' ? <Lock size={18} color="#C6A15B" /> : <KeyRound size={18} color="#C6A15B" />}
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
              {mode === 'login' ? 'Masuk ke Sistem SILSILAH' : 'Ganti Kata Sandi Akun'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary, #A79D8D)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher if authenticated */}
        {currentUser && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle, #393128)', background: 'var(--bg-secondary, #191714)' }}>
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: 12.5,
                fontWeight: 600,
                color: mode === 'login' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
                borderBottom: mode === 'login' ? '2px solid #C6A15B' : 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Masuk / Ganti Akun
            </button>
            <button
              onClick={() => {
                setMode('change_password');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: 12.5,
                fontWeight: 600,
                color: mode === 'change_password' ? '#C6A15B' : 'var(--text-secondary, #A79D8D)',
                borderBottom: mode === 'change_password' ? '2px solid #C6A15B' : 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Ganti Kata Sandi
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(217, 121, 112, 0.15)',
                border: '1px solid rgba(217, 121, 112, 0.3)',
                color: '#D97970',
                padding: '10px 14px',
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
                padding: '10px 14px',
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

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: silsilah atau nama_user"
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C6A15B',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  Lupa kata sandi?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: 6, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Memverifikasi...' : 'Masuk Akun'}
              </button>

              <div
                style={{
                  marginTop: 6,
                  padding: '8px 10px',
                  background: 'rgba(25, 23, 20, 0.6)',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle, #393128)',
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'var(--text-secondary, #A79D8D)',
                  lineHeight: 1.4,
                }}
              >
                🔒 Pendaftaran akun baru dikelola langsung oleh <strong>Admin / Superadmin</strong> di menu Kelola Akun.
              </div>
            </form>
          )}

          {/* MODE 2: CHANGE PASSWORD */}
          {mode === 'change_password' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #A79D8D)' }}>
                Akun aktif: <b style={{ color: '#F1E8D8' }}>{currentUser?.displayName || 'Belum Masuk'}</b> ({currentUser?.role ? currentUser.role.toUpperCase() : 'TAMU'})
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Kata sandi saat ini..."
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                  Kata Sandi Baru
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

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru..."
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
                style={{ marginTop: 6, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
    </div>
  );
}
