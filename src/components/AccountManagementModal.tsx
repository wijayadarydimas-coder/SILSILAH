'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { UserRole, UserAccount } from '@/types';
import {
  X,
  Shield,
  UserPlus,
  Power,
  AlertTriangle,
  CheckCircle,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Users,
  User,
  Sparkles,
} from 'lucide-react';
import { PhoneCountryInput } from '@/components/PhoneCountryInput';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountManagementModal({ isOpen, onClose }: AccountManagementModalProps) {
  const {
    users,
    currentUser,
    currentRole,
    updateUserRole,
    toggleUserStatus,
    createUser,
    resetUserPassword,
    deleteUser,
  } = useFamilyStore();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Form states for creating new user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('client');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success summary for freshly created account
  const [createdSummary, setCreatedSummary] = useState<{
    username: string;
    password: string;
    displayName: string;
    role: UserRole;
    phone?: string;
    email?: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Password reset inline modal
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [resetNewPasswordVal, setResetNewPasswordVal] = useState('');
  const [showResetPasswordVal, setShowResetPasswordVal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Global alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Generate friendly secure password
  const generateRandomPassword = () => {
    const prefixes = ['Keluarga', 'Silsilah', 'Bani', 'Traha', 'Warga'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix}#${randomNum}`;
    setNewPassword(generated);
  };

  const generateResetPassword = () => {
    const prefixes = ['Keluarga', 'Silsilah', 'Aman', 'Sandi', 'Baru'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setResetNewPasswordVal(`${prefix}#${randomNum}`);
  };

  // Submit create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newUsername.trim() || !newPassword.trim() || !newDisplayName.trim()) {
      setErrorMsg('Username, Password, dan Nama Tampilan wajib diisi.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        displayName: newDisplayName.trim(),
        role: newRole,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Gagal membuat akun baru.');
      } else {
        setCreatedSummary({
          username: newUsername.trim().toLowerCase(),
          password: newPassword.trim(),
          displayName: newDisplayName.trim(),
          role: newRole,
          phone: newPhone.trim() || undefined,
          email: newEmail.trim() || undefined,
        });

        // Reset inputs
        setNewUsername('');
        setNewPassword('');
        setNewDisplayName('');
        setNewRole('client');
        setNewEmail('');
        setNewPhone('');
        setShowPassword(false);
        setSuccessMsg('Akun baru berhasil dibuat dan disimpan ke database PostgreSQL!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = () => {
    if (!createdSummary) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `Halo *${createdSummary.displayName}*,\n\nBerikut akun Anda untuk masuk ke sistem Pohon Silsilah Keluarga:\n🌐 Tautan: ${origin}\n👤 Username: *${createdSummary.username}*\n🔑 Kata Sandi: *${createdSummary.password}*\n🛡️ Hak Akses: *${createdSummary.role === 'admin' ? 'Admin (Kelola Data)' : 'User (Baca Saja)'}*\n\nSilakan buka tautan di atas dan gunakan username serta sandi tersebut untuk masuk.`;

    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  // Delete user
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "${name}"? Akun ini akan dihapus secara permanen dari sistem.`)) return;
    setErrorMsg('');
    const res = await deleteUser(userId);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghapus akun.');
    } else {
      setSuccessMsg(`Akun "${name}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Change role
  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    setErrorMsg('');
    const res = await updateUserRole(userId, targetRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengubah role.');
    } else {
      setSuccessMsg('Role akun berhasil diperbarui di PostgreSQL!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Toggle status
  const handleToggleStatus = async (userId: string) => {
    setErrorMsg('');
    const res = await toggleUserStatus(userId);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengubah status akun.');
    } else {
      setSuccessMsg('Status akun berhasil diubah di PostgreSQL!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Submit reset password
  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (!resetNewPasswordVal.trim() || resetNewPasswordVal.trim().length < 4) {
      setErrorMsg('Password baru minimal 4 karakter.');
      return;
    }

    setIsResetting(true);
    setErrorMsg('');
    try {
      const res = await resetUserPassword(resetModalUser.id, resetNewPasswordVal.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mengatur ulang kata sandi.');
      } else {
        setSuccessMsg(`Kata sandi akun "${resetModalUser.displayName}" berhasil diperbarui!`);
        setResetModalUser(null);
        setResetNewPasswordVal('');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
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
          background: 'var(--bg-card, #0F1626)',
          border: '1px solid var(--border-subtle, #1E293B)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(680px, 95vw)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
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
            borderBottom: '1px solid var(--border-subtle, #1E293B)',
            background: 'var(--bg-menu, #131B2E)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={18} color="#F59E0B" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #F8FAFC)', margin: 0 }}>
                Kelola Akun &amp; Hak Akses (Superadmin)
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
                Buat dan kelola akun login keluarga langsung ke PostgreSQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #94A3B8)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle, #1E293B)',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 16px 0 16px',
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === 'list' ? '2px solid var(--primary, #10B981)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'list' ? 'var(--primary, #34D399)' : 'var(--text-secondary, #94A3B8)',
              fontWeight: activeTab === 'list' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Users size={15} />
            <span>Daftar Akun Terdaftar ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('create');
              setCreatedSummary(null);
            }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid var(--primary, #10B981)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'create' ? 'var(--primary, #34D399)' : 'var(--text-secondary, #94A3B8)',
              fontWeight: activeTab === 'create' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UserPlus size={15} />
            <span>➕ Buat Akun Baru</span>
            <span
              style={{
                fontSize: 10,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                padding: '1px 6px',
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Login
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Error & Success Alerts */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
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
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LIST OF USERS */}
          {activeTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary, #94A3B8)', fontWeight: 600 }}>
                  Kelola hak akses, status, dan kata sandi akun pengguna:
                </span>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCreatedSummary(null);
                  }}
                  className="btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <UserPlus size={14} />
                  <span>Buat Akun Baru</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map((u) => {
                  const isSelf = currentUser ? u.id === currentUser.id : false;
                  const isDeactivated = u.status === 'deactivated';
                  const isStaticSuperadmin = u.role === 'superadmin' || u.username === 'silsilah';

                  return (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        padding: '12px 14px',
                        background: 'var(--bg-menu, #162035)',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle, #1E293B)',
                        opacity: isDeactivated ? 0.65 : 1,
                      }}
                    >
                      {/* Left: User Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, flex: 1 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isStaticSuperadmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isStaticSuperadmin ? '#F59E0B' : '#38BDF8',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {u.avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : isStaticSuperadmin ? (
                            <Shield size={18} />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #F8FAFC)' }}>
                              {u.displayName}
                            </span>
                            {u.username && (
                              <span style={{ fontSize: 11, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                                @{u.username}
                              </span>
                            )}
                            {isSelf && (
                              <span style={{ fontSize: 10, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                (Akun Anda)
                              </span>
                            )}
                            {isDeactivated && (
                              <span style={{ fontSize: 10, color: '#F87171', background: 'rgba(239,68,68,0.15)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                Dinonaktifkan
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #94A3B8)', display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
                            {u.email && <span>📧 {u.email}</span>}
                            {u.phone && <span>📱 {u.phone}</span>}
                            {!u.email && !u.phone && <span style={{ fontStyle: 'italic', color: '#64748B' }}>Tidak ada kontak terdaftar</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {isStaticSuperadmin ? (
                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#FBBF24',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              fontSize: 11.5,
                              fontWeight: 700,
                            }}
                          >
                            👑 Superadmin Tetap
                          </span>
                        ) : (
                          <>
                            {/* Role Dropdown */}
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: 'var(--bg-card, #0F1626)',
                                border: '1px solid var(--border-subtle, #334155)',
                                color: 'var(--text-primary, #F8FAFC)',
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <option value="admin">Admin (Kelola Data)</option>
                              <option value="client">User (Baca Saja)</option>
                            </select>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setResetNewPasswordVal('');
                                setErrorMsg('');
                              }}
                              title="Atur ulang kata sandi pengguna ini"
                              style={{
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                color: '#FBBF24',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <KeyRound size={13} />
                              <span className="hide-on-mobile">Sandi</span>
                            </button>

                            {/* Deactivate/Activate Status */}
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              title={isDeactivated ? 'Aktifkan kembali akses akun' : 'Nonaktifkan akses akun'}
                              style={{
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: isDeactivated ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                border: `1px solid ${isDeactivated ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
                                color: isDeactivated ? '#34D399' : '#F87171',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Power size={13} />
                              <span>{isDeactivated ? 'Aktifkan' : 'Nonaktif'}</span>
                            </button>

                            {/* Delete Button */}
                            {currentRole === 'superadmin' && !isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.displayName)}
                                title="Hapus akun pengguna secara permanen"
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: 6,
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#F87171',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={13} />
                                <span className="hide-on-mobile">Hapus</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW USER FORM */}
          {activeTab === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Credentials Confirmation Card (when user is created) */}
              {createdSummary ? (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={18} color="#34D399" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#34D399', margin: 0 }}>
                        Akun Baru Berhasil Dibuat!
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
                        Akun telah tersimpan di PostgreSQL dan siap digunakan untuk masuk.
                      </p>
                    </div>
                  </div>

                  {/* Account Summary Box */}
                  <div
                    style={{
                      background: 'var(--bg-menu, #0F1626)',
                      border: '1px solid var(--border-subtle, #1E293B)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 10,
                      fontSize: 12.5,
                    }}
                  >
                    <div>
                      <div style={{ color: '#94A3B8', fontSize: 11 }}>Nama Pengguna</div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{createdSummary.displayName}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94A3B8', fontSize: 11 }}>Username Login</div>
                      <div style={{ fontWeight: 700, color: '#38BDF8' }}>@{createdSummary.username}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94A3B8', fontSize: 11 }}>Kata Sandi (Password)</div>
                      <div style={{ fontWeight: 700, color: '#FBBF24', letterSpacing: 0.5 }}>
                        {createdSummary.password}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#94A3B8', fontSize: 11 }}>Hak Akses (Role)</div>
                      <div style={{ fontWeight: 700, color: createdSummary.role === 'admin' ? '#A78BFA' : '#34D399' }}>
                        {createdSummary.role === 'admin' ? 'Admin (Kelola Data)' : 'User (Baca Saja)'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={handleCopyCredentials}
                      className="btn-primary"
                      style={{
                        padding: '9px 16px',
                        fontSize: 12.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: hasCopied ? '#059669' : undefined,
                      }}
                    >
                      {hasCopied ? <Check size={15} /> : <Copy size={15} />}
                      <span>{hasCopied ? 'Kredensial Tersalin!' : 'Salin Kredensial untuk WhatsApp'}</span>
                    </button>

                    <button
                      onClick={() => setCreatedSummary(null)}
                      className="btn-secondary"
                      style={{ padding: '9px 14px', fontSize: 12.5 }}
                    >
                      ➕ Buat Akun Lainnya
                    </button>

                    <button
                      onClick={() => setActiveTab('list')}
                      className="btn-secondary"
                      style={{ padding: '9px 14px', fontSize: 12.5 }}
                    >
                      👥 Lihat di Daftar Akun
                    </button>
                  </div>
                </div>
              ) : (
                /* The Create Account Form */
                <form
                  onSubmit={handleCreateUser}
                  style={{
                    background: 'var(--bg-menu, #131B2E)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary, #F8FAFC)', margin: 0 }}>
                      Formulir Buat Akun Login Baru
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary, #94A3B8)', marginTop: 2, marginBottom: 0 }}>
                      Superadmin dapat langsung membuatkan akun beserta password tanpa membuka database PostgreSQL.
                    </p>
                  </div>

                  <div className="grid-2-col-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Username */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                        Username Login <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: 9,
                            color: '#64748B',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          @
                        </span>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="misal: ahmad_syarif"
                          style={{
                            width: '100%',
                            padding: '9px 12px 9px 28px',
                            borderRadius: 8,
                            background: 'var(--bg-card, #0F1626)',
                            border: '1px solid var(--border-subtle, #1E293B)',
                            color: '#F8FAFC',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 10.5, color: '#64748B', marginTop: 2, display: 'block' }}>
                        Hanya huruf, angka, titik, atau garis bawah (_)
                      </span>
                    </div>

                    {/* Password */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                          Kata Sandi (Password) <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38BDF8',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: 0,
                          }}
                        >
                          <RefreshCw size={11} />
                          🎲 Buat Sandi Acak
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 4 karakter..."
                          style={{
                            width: '100%',
                            padding: '9px 36px 9px 12px',
                            borderRadius: 8,
                            background: 'var(--bg-card, #0F1626)',
                            border: '1px solid var(--border-subtle, #1E293B)',
                            color: '#F8FAFC',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: 9,
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                        Nama Tampilan / Lengkap <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="misal: Ahmad Syarifudin"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-card, #0F1626)',
                          border: '1px solid var(--border-subtle, #1E293B)',
                          color: '#F8FAFC',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                        Hak Akses (Role)
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-card, #0F1626)',
                          border: '1px solid var(--border-subtle, #1E293B)',
                          color: '#F8FAFC',
                          fontSize: 13,
                          outline: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <option value="client">User (Baca Saja - Anggota Keluarga)</option>
                        <option value="admin">Admin (Editor - Kelola & Edit Data Pohon)</option>
                      </select>
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                        Alamat Email (Opsional)
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@contoh.com"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-card, #0F1626)',
                          border: '1px solid var(--border-subtle, #1E293B)',
                          color: '#F8FAFC',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* WhatsApp with Country Code */}
                    <div>
                      <PhoneCountryInput
                        label="No. WhatsApp (Opsional)"
                        value={newPhone}
                        onChange={setNewPhone}
                        placeholder="81234567890"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="btn-secondary"
                      style={{ padding: '9px 16px', fontSize: 13 }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                      style={{
                        padding: '9px 20px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <UserPlus size={16} />
                      <span>{isSubmitting ? 'Menyimpan...' : '➕ Buat & Simpan Akun'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POPUP / MODAL ATUR ULANG KATA SANDI OLEH SUPERADMIN */}
      {resetModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card, #0F1626)',
              border: '1px solid var(--border-subtle, #1E293B)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle, #1E293B)',
                background: 'var(--bg-menu, #131B2E)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={17} color="#FBBF24" />
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                  Atur Ulang Kata Sandi
                </h3>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>
                  Pengguna: <span style={{ color: '#38BDF8' }}>{resetModalUser.displayName}</span>{' '}
                  {resetModalUser.username && <span style={{ color: '#94A3B8', fontSize: 12 }}>(@{resetModalUser.username})</span>}
                </div>
                <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 3, marginBottom: 0 }}>
                  Masukkan kata sandi baru untuk akun ini. Pengguna dapat langsung masuk dengan sandi baru ini.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                    Kata Sandi Baru <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateResetPassword}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38BDF8',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🎲 Buat Sandi Acak
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showResetPasswordVal ? 'text' : 'password'}
                    required
                    value={resetNewPasswordVal}
                    onChange={(e) => setResetNewPasswordVal(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    style={{
                      width: '100%',
                      padding: '9px 36px 9px 12px',
                      borderRadius: 8,
                      background: 'var(--bg-menu, #162035)',
                      border: '1px solid var(--border-subtle, #1E293B)',
                      color: '#F8FAFC',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordVal(!showResetPasswordVal)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 9,
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                    }}
                  >
                    {showResetPasswordVal ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12.5 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: 12.5 }}
                >
                  {isResetting ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
