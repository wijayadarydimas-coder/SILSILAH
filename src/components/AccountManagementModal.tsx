'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { UserRole } from '@/types';
import { X, Shield, UserPlus, Power, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

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
    inviteUser,
  } = useFamilyStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('client');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setErrorMsg('');
    const res = updateUserRole(userId, newRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengubah role.');
    } else {
      setSuccessMsg('Role akun berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleToggleStatus = (userId: string) => {
    setErrorMsg('');
    const res = toggleUserStatus(userId);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengubah status akun.');
    } else {
      setSuccessMsg('Status akun berhasil diubah!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!inviteEmail.trim()) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }

    const res = inviteUser(inviteEmail.trim(), inviteRole, inviteName.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengirim undangan.');
    } else {
      setSuccessMsg(`Undangan berhasil dikirim ke ${inviteEmail}!`);
      setInviteEmail('');
      setInviteName('');
      setTimeout(() => setSuccessMsg(''), 3000);
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
        zIndex: 1100,
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
          maxWidth: 620,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
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
            borderBottom: '1px solid #1E293B',
            background: '#131B2E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={20} color="#F59E0B" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              Kelola Akun &amp; Hak Akses Ruang Keluarga (Superadmin)
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
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
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User List */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>
              DAFTAR AKUN TERDAFTAR ({users.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                const isDeactivated = u.status === 'deactivated';

                return (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#162035',
                      borderRadius: 10,
                      border: '1px solid #1E293B',
                      opacity: isDeactivated ? 0.6 : 1,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F8FAFC' }}>
                          {u.displayName}
                        </span>
                        {isSelf && (
                          <span style={{ fontSize: 10, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                            (Akun Anda)
                          </span>
                        )}
                        {isDeactivated && (
                          <span style={{ fontSize: 10, color: '#F87171', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                            Dinonaktifkan
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11.5, color: '#94A3B8' }}>{u.email}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Role Selector */}
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={currentRole !== 'superadmin'}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: '#0F1626',
                          border: '1px solid #334155',
                          color: '#F8FAFC',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <option value="superadmin">Superadmin</option>
                        <option value="admin">Admin</option>
                        <option value="client">Client (Read Only)</option>
                      </select>

                      {/* Deactivate/Activate button */}
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        title={isDeactivated ? 'Aktifkan kembali akses' : 'Nonaktifkan akses akun'}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: isDeactivated ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: isDeactivated ? '#34D399' : '#F87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                        }}
                      >
                        <Power size={13} />
                        {isDeactivated ? 'Aktifkan' : 'Nonaktif'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite User Section */}
          <div style={{ background: '#131B2E', padding: 16, borderRadius: 12, border: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <UserPlus size={16} color="#10B981" />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                Undang Anggota / Kerabat Baru ke Ruang Keluarga
              </h3>
            </div>

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8 }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email pengguna..."
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 12.5,
                  }}
                />
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nama tampilan..."
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 12.5,
                  }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 12.5,
                  }}
                >
                  <option value="client">Client (Baca saja)</option>
                  <option value="admin">Admin (Editor)</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: 12.5, alignSelf: 'flex-start' }}
              >
                <Mail size={14} />
                Kirim Undangan Akses
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
