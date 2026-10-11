'use client';

import React, { useState, useRef } from 'react';
import { UserAccount } from '@/types';
import { X, Upload, Camera, Save, User, Check, AlertCircle } from 'lucide-react';
import { PhoneCountryInput } from '@/components/PhoneCountryInput';

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
          maxWidth: 'min(440px, 94vw)',
          background: 'var(--bg-elevated, #211D18)',
          border: '1px solid var(--border-subtle, #393128)',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, #393128)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary, #191714)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(198, 161, 91, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C6A15B',
                border: '1px solid rgba(198, 161, 91, 0.3)',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary, #F1E8D8)',
                  fontFamily: 'Cinzel, serif',
                  letterSpacing: '0.02em',
                }}
              >
                Edit Profil &amp; Foto Akun
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary, #A79D8D)' }}>
                @{currentUser.username} ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #A79D8D)',
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
                background: 'rgba(217, 121, 112, 0.15)',
                border: '1px solid rgba(217, 121, 112, 0.3)',
                color: '#D97970',
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
                background: 'rgba(126, 170, 131, 0.15)',
                border: '1px solid rgba(126, 170, 131, 0.3)',
                color: '#7EAA83',
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
                background: 'var(--bg-primary, #11100E)',
                border: '3px solid #C6A15B',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
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
                <User size={48} color="#A79D8D" />
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Pilih Foto Profil"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
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
                <Camera size={26} color="#F1E8D8" />
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
                  background: 'rgba(198, 161, 91, 0.15)',
                  color: '#C6A15B',
                  border: '1px solid rgba(198, 161, 91, 0.35)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
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
                    background: '#2B251E',
                    color: 'var(--text-secondary, #A79D8D)',
                    border: '1px solid var(--border-subtle, #393128)',
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
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6, fontWeight: 500 }}>
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
                background: 'var(--bg-secondary, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--text-primary, #F1E8D8)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6, fontWeight: 500 }}>
              Alamat Email (Untuk Notifikasi &amp; Reset Password)
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
                background: 'var(--bg-secondary, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--text-primary, #F1E8D8)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <PhoneCountryInput
              label="Nomor WhatsApp"
              value={phone}
              onChange={(val) => setPhone(val)}
              placeholder="81234567890"
              showWhatsAppPreview={true}
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
