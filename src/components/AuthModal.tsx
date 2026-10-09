'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, Lock, User, UserPlus, KeyRound, AlertTriangle, CheckCircle, Shield, Mail, Phone } from 'lucide-react';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'change_password';
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = 'login', onClose }: AuthModalProps) {
  const { currentUser, onLoginSuccess, isAuthenticated, refreshUsers } = useFamilyStore();

  const [mode, setMode] = useState<'login' | 'register' | 'change_password'>(initialMode);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() && !phone.trim()) {
      setErrorMsg('Pendaftaran akun wajib menyertakan nomor WhatsApp atau alamat Email.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName,
          password,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mendaftar.');
      } else {
        if (isAuthenticated) {
          setSuccessMsg(`✓ Akun "${data.user.displayName}" berhasil didaftarkan! Anda tetap berada pada akun Anda saat ini.`);
          refreshUsers();
          setUsername('');
          setPassword('');
          setDisplayName('');
          setEmail('');
          setPhone('');
        } else {
          setSuccessMsg('Akun User berhasil dibuat! Anda otomatis masuk.');
          onLoginSuccess(data.user);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
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
          background: '#0F1626',
          border: '1px solid #1E293B',
          borderRadius: 16,
          width: '100%',
          maxWidth: 440,
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
            {mode === 'login' && <Lock size={18} color="#10B981" />}
            {mode === 'register' && <UserPlus size={18} color="#3B82F6" />}
            {mode === 'change_password' && <KeyRound size={18} color="#F59E0B" />}
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
              {mode === 'login' && 'Masuk ke Sistem SILSILAH'}
              {mode === 'register' && 'Daftar Akun Baru'}
              {mode === 'change_password' && 'Ganti Kata Sandi Akun'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher if not changing password */}
        {mode !== 'change_password' && (
          <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', background: '#111827' }}>
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: 13,
                fontWeight: 600,
                color: mode === 'login' ? '#10B981' : '#94A3B8',
                borderBottom: mode === 'login' ? '2px solid #10B981' : 'none',
              }}
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: 13,
                fontWeight: 600,
                color: mode === 'register' ? '#3B82F6' : '#94A3B8',
                borderBottom: mode === 'register' ? '2px solid #3B82F6' : 'none',
              }}
            >
              Daftar Baru
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
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
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: silsilah"
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
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
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
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
                    color: '#F59E0B',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 500,
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
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                  Username Baru
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nama login unik..."
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                  Nama Lengkap / Tampilan
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@keluarga.com"
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
              </div>
              <span style={{ fontSize: 11, color: '#64748B', marginTop: -6 }}>
                *Wajib mengisi salah satu atau keduanya (WhatsApp / Email) untuk keamanan akun.
              </span>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: '#93C5FD',
                }}
              >
                ℹ️ Status awal pendaftar adalah <b>User (Read-Only)</b>. Superadmin berwenang menaikkan role menjadi Admin di menu Kelola Akun.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: 6, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          {/* MODE 3: CHANGE PASSWORD */}
          {mode === 'change_password' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                Akun aktif: <b>{currentUser?.displayName || 'Belum Masuk'}</b> ({currentUser?.role ? currentUser.role.toUpperCase() : 'TAMU'})
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
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
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
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
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>
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
