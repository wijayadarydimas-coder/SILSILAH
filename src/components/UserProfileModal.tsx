'use client';

import React, { useState, useRef } from 'react';
import { UserAccount } from '@/types';
import { X, Upload, Camera, Save, User, Check, AlertCircle } from 'lucide-react';

interface UserProfileModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserAccount) => void;
}

export function UserProfileModal({
  currentUser,
  onClose,
  onUserUpdated,
}: UserProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berformat gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran foto profil maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: currentUser.id,
          targetUserId: currentUser.id,
          displayName: displayName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan profil.');
      }

      setSuccess('Profil dan foto berhasil diperbarui!');
      if (data.user) {
        onUserUpdated(data.user);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#131D33',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
                Edit Profil & Foto Akun
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>
                @{currentUser.username} ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#F87171',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} flex-shrink="0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34D399',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Check size={16} flex-shrink="0" />
              <span>{success}</span>
            </div>
          )}

          {/* Avatar Upload Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#1E293B',
                border: '2px solid #38BDF8',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={48} color="#64748B" />
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Pilih Foto Profil"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <Camera size={26} color="#FFFFFF" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  fontSize: 12,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#1E293B',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Upload size={13} />
                Unggah Foto
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  style={{
                    fontSize: 12,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: '#1E293B',
                    color: '#94A3B8',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                  }}
                >
                  Hapus
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Form Fields */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>
              Nama Lengkap / Tampilan
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama tampilan Anda"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: '#162035',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>
              Alamat Email (Untuk Notifikasi & Reset Password)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: '#162035',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: '#162035',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              marginTop: 8,
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
