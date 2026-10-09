'use client';

import React, { useState, useEffect } from 'react';
import { useFamilyStore } from '@/lib/store';
import { Person, Gender } from '@/types';
import { X, User, Image as ImageIcon, Calendar, MapPin, Phone, Mail, Share2, ShieldCheck } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  editPersonId?: string | null;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
];

export function MemberModal({ isOpen, editPersonId, onClose, onSuccess }: MemberModalProps) {
  const { people, addPerson, updatePerson, currentRole } = useFamilyStore();

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [biography, setBiography] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unconfirmed'>('verified');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(editPersonId);

  useEffect(() => {
    if (editPersonId) {
      const p = people.find((item) => item.id === editPersonId);
      if (p) {
        setFullName(p.fullName);
        setDisplayName(p.displayName || '');
        setGender(p.gender);
        setBirthDate(p.birthDate || '');
        setDeathDate(p.deathDate || '');
        setIsDeceased(p.isDeceased);
        setPhotoUrl(p.photoUrl || '');
        setBiography(p.biography || '');
        setAddress(p.address || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setInstagram(p.instagram || '');
        setVerificationStatus(p.verificationStatus);
      }
    } else {
      setFullName('');
      setDisplayName('');
      setGender('male');
      setBirthDate('');
      setDeathDate('');
      setIsDeceased(false);
      setPhotoUrl('');
      setBiography('');
      setAddress('');
      setPhone('');
      setEmail('');
      setInstagram('');
      setVerificationStatus('verified');
    }
    setErrorMsg('');
  }, [editPersonId, isOpen, people]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    if (isDeceased && birthDate && deathDate && deathDate < birthDate) {
      setErrorMsg('Tanggal wafat tidak boleh mendahului tanggal lahir.');
      return;
    }

    if (isEditing && editPersonId) {
      const res = updatePerson(editPersonId, {
        fullName: fullName.trim(),
        displayName: displayName.trim() || undefined,
        gender,
        birthDate: birthDate.trim() || undefined,
        deathDate: isDeceased ? deathDate.trim() || undefined : undefined,
        isDeceased,
        photoUrl: photoUrl.trim() || undefined,
        biography: biography.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        instagram: instagram.trim() || undefined,
        verificationStatus,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Gagal memperbarui data.');
        return;
      }
      onSuccess?.(editPersonId);
      onClose();
    } else {
      const res = addPerson({
        fullName: fullName.trim(),
        displayName: displayName.trim() || undefined,
        gender,
        birthDate: birthDate.trim() || undefined,
        deathDate: isDeceased ? deathDate.trim() || undefined : undefined,
        isDeceased,
        photoUrl: photoUrl.trim() || undefined,
        biography: biography.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        instagram: instagram.trim() || undefined,
        verificationStatus,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Gagal menambahkan anggota.');
        return;
      }
      if (res.id) onSuccess?.(res.id);
      onClose();
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
          maxWidth: 580,
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
            <User size={20} color="#10B981" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              {isEditing ? 'Edit Data Anggota Silsilah' : 'Tambah Anggota Baru'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: '20px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 130px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Nama Lengkap & Panggilan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ir. Raden Bambang Sastro"
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
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Nama Panggilan / Kartu
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Om Bambang"
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

            {/* Gender & Status Verifikasi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Jenis Kelamin
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                  <option value="unknown">Tidak Diketahui</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Status Verifikasi
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as 'verified' | 'unconfirmed')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                >
                  <option value="verified">✅ Terverifikasi Arsip</option>
                  <option value="unconfirmed">⚠️ Belum Terkonfirmasi</option>
                </select>
              </div>
            </div>

            {/* Tanggal Lahir & Wafat */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>TANGGAL KEHIDUPAN</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#CBD5E1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                  />
                  Sudah Meninggal Dunia (Wafat)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    Tanggal Lahir (YYYY-MM-DD atau Tahun)
                  </label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="Contoh: 1956-06-15 atau 1956"
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

                {isDeceased && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      Tanggal Wafat
                    </label>
                    <input
                      type="text"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      placeholder="Contoh: 2021-08-10"
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
                )}
              </div>
            </div>

            {/* Foto Profil & Sampel Avatar */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                URL Foto Profil
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Sample avatar pickers */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>Pilih foto cepat:</span>
                {SAMPLE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: photoUrl === url ? '2px solid #10B981' : '1px solid #334155',
                      padding: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Biografi */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                Catatan Biografi & Sejarah Singkat
              </label>
              <textarea
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Catatan profesi, peran dalam keluarga, kenangan penting..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#162035',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Kontak & Alamat (Privat) */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 10 }}>
                KONTAK & ALAMAT (Dilindungi Hak Akses RBAC)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    Alamat Domisili
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Diponegoro No. 10, Bandung"
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
                    <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62812..."
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
                    <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
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

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
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
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #1E293B',
              background: '#131B2E',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: '#1E293B',
                color: '#CBD5E1',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah ke Silsilah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
