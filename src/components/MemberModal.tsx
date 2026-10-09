'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFamilyStore } from '@/lib/store';
import { Person, Gender } from '@/types';
import {
  X,
  User,
  Upload,
  Link,
  ShieldCheck,
  ZoomIn,
  Move,
  Check,
  Phone,
  Mail,
  MapPin,
  Share2,
  Calendar,
} from 'lucide-react';
import { COUNTRY_CODES, INDONESIAN_CITIES } from '@/lib/familyLogic';

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
];

export function MemberModal({ isOpen, editPersonId, onClose, onSuccess }: MemberModalProps) {
  const { people, users, addPerson, updatePerson, currentRole } = useFamilyStore();

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoOffsetX, setPhotoOffsetX] = useState(0);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
  const [linkedUserId, setLinkedUserId] = useState('');
  const [biography, setBiography] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unconfirmed'>('verified');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(editPersonId);

  useEffect(() => {
    if (editPersonId) {
      const p = people.find((item) => item.id === editPersonId);
      if (p) {
        setFullName(p.fullName);
        setDisplayName(p.displayName || '');
        setGender(p.gender);
        // Ensure standard YYYY-MM-DD or valid date string for HTML5 datepicker
        const bDate = p.birthDate || '';
        setBirthDate(bDate.length === 4 ? `${bDate}-01-01` : bDate);
        const dDate = p.deathDate || '';
        setDeathDate(dDate.length === 4 ? `${dDate}-01-01` : dDate);
        setIsDeceased(p.isDeceased);
        setPhotoUrl(p.photoUrl || '');
        setPhotoZoom(p.photoZoom ?? 1);
        setPhotoOffsetX(p.photoOffsetX ?? 0);
        setPhotoOffsetY(p.photoOffsetY ?? 0);
        setLinkedUserId(p.linkedUserId || '');
        setBiography(p.biography || '');
        
        // Domisili
        const addr = p.address || '';
        setAddress(addr);
        if (INDONESIAN_CITIES.includes(addr)) {
          setSelectedCity(addr);
        } else {
          setSelectedCity('');
        }

        // Parse phone and country code
        const rawPhone = p.phone || '';
        setPhone(rawPhone);
        let foundCode = '+62';
        let restPhone = rawPhone;
        for (const cc of COUNTRY_CODES) {
          if (rawPhone.startsWith(cc.code)) {
            foundCode = cc.code;
            restPhone = rawPhone.slice(cc.code.length).trim();
            break;
          }
        }
        setCountryCode(foundCode);
        setPhoneNumber(restPhone);

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
      setPhotoZoom(1);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
      setLinkedUserId('');
      setBiography('');
      setAddress('');
      setSelectedCity('');
      setPhone('');
      setCountryCode('+62');
      setPhoneNumber('');
      setEmail('');
      setInstagram('');
      setVerificationStatus('verified');
    }
    setErrorMsg('');
  }, [editPersonId, isOpen, people]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoZoom(1);
        setPhotoOffsetX(0);
        setPhotoOffsetY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Format phone with country code
    const cleanPhone = phoneNumber.trim();
    let finalPhone: string | undefined = undefined;
    if (cleanPhone) {
      if (cleanPhone.startsWith('+')) {
        finalPhone = cleanPhone;
      } else {
        const noLeadingZero = cleanPhone.replace(/^0+/, '');
        finalPhone = `${countryCode} ${noLeadingZero}`;
      }
    }

    const payload = {
      fullName: fullName.trim(),
      displayName: displayName.trim() || undefined,
      gender,
      birthDate: birthDate.trim() || undefined,
      deathDate: isDeceased ? deathDate.trim() || undefined : undefined,
      isDeceased,
      photoUrl: photoUrl.trim() || undefined,
      photoZoom,
      photoOffsetX,
      photoOffsetY,
      linkedUserId: linkedUserId || undefined,
      biography: biography.trim() || undefined,
      address: address.trim() || undefined,
      phone: finalPhone,
      email: email.trim() || undefined,
      instagram: instagram.trim().replace(/^@+/, '') ? `@${instagram.trim().replace(/^@+/, '')}` : undefined,
      verificationStatus,
    };

    if (isEditing && editPersonId) {
      const res = await updatePerson(editPersonId, payload);
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal memperbarui data.');
        return;
      }
      onSuccess?.(editPersonId);
      onClose();
    } else {
      const res = await addPerson(payload);
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
          maxWidth: 600,
          maxHeight: '92vh',
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
              maxHeight: 'calc(92vh - 130px)',
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
                  placeholder="Contoh: Raden Bambang"
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

            {/* FOTO & SETTING PAS LINGKARAN */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>
                  FOTO PROFIL &amp; PENGATURAN PAS KE LINGKARAN
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
                  <Upload size={13} /> Upload dari Komputer
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {/* CIRCULAR PREVIEW FRAME */}
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #10B981',
                    background: '#1E293B',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    transform: 'translateZ(0)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  }}
                >
                  {photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transform: `scale(${Math.max(1, photoZoom)}) translate(${photoOffsetX}px, ${photoOffsetY}px)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.05s ease-out',
                      }}
                    />
                  ) : (
                    <User size={34} color="#64748B" />
                  )}
                </div>

                {/* SLIDERS & CONTROLS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
                      <span>Ukuran / Zoom Foto (Pas Lingkaran):</span>
                      <span>{Math.round(photoZoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.05"
                      value={photoZoom}
                      onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#10B981' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94A3B8' }}>
                        <span>Geser Vertikal (Y):</span>
                        <span>{photoOffsetY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="2"
                        value={photoOffsetY}
                        onChange={(e) => setPhotoOffsetY(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: '#3B82F6' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94A3B8' }}>
                        <span>Geser Horisontal (X):</span>
                        <span>{photoOffsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="2"
                        value={photoOffsetX}
                        onChange={(e) => setPhotoOffsetX(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: '#3B82F6' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  value={photoUrl.startsWith('data:') ? '[Gambar Hasil Upload Lokal]' : photoUrl}
                  onChange={(e) => {
                    if (!e.target.value.startsWith('[Gambar')) {
                      setPhotoUrl(e.target.value);
                    }
                  }}
                  placeholder="Atau masukkan URL foto (https://...)"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {/* TAUTKAN DENGAN AKUN CLIENT */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Link size={15} color="#3B82F6" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>
                  TAUTKAN KE AKUN PENGGUNA CLIENT
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#64748B', marginBottom: 8 }}>
                Pilih akun pengguna (Client) yang merupakan representasi dari anggota keluarga ini.
              </p>
              <select
                value={linkedUserId}
                onChange={(e) => setLinkedUserId(e.target.value)}
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
                <option value="">-- Tidak ditautkan ke akun pengguna --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.username || u.email}) - Role: {u.role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Lahir & Wafat (Date Picker) */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#10B981" /> TANGGAL KEHIDUPAN (DATE PICKER)
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#CBD5E1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                  />
                  Sudah Meninggal Dunia (Wafat)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDeceased ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    Pilih Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#162035',
                      border: '1px solid #1E293B',
                      color: '#F8FAFC',
                      fontSize: 13,
                      colorScheme: 'dark',
                    }}
                  />
                </div>

                {isDeceased && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      Pilih Tanggal Wafat
                    </label>
                    <input
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#162035',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: 13,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Biografi */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                Catatan Biografi Singkat
              </label>
              <textarea
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Catatan profesi, peran dalam keluarga..."
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

            {/* Kontak, Domisili & Sosmed */}
            <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 12 }}>
                KONTAK, DOMISILI &amp; MEDIA SOSIAL (Dapat Diakses Semua Anggota)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Domisili / Alamat */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    <MapPin size={13} color="#EC4899" />
                    Domisili / Lokasi (Otomatis Tertaut Google Maps)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCity(val);
                        if (val) {
                          setAddress(val);
                        }
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#162035',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: 12.5,
                      }}
                    >
                      <option value="">-- Pilih Kota / Provinsi Cepat --</option>
                      {INDONESIAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (!INDONESIAN_CITIES.includes(e.target.value)) {
                          setSelectedCity('');
                        }
                      }}
                      placeholder="Ketik alamat / detail domisili..."
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#162035',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                </div>

                {/* WhatsApp dengan Pilihan Kode Negara */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                    <Phone size={13} color="#10B981" />
                    Nomor WhatsApp / Telepon (Tautan Langsung WA)
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        width: 140,
                        padding: '8px 8px',
                        borderRadius: 8,
                        background: '#162035',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code} ({item.country.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 8123456789 atau 0812..."
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
                </div>

                {/* Email & Instagram */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      <Mail size={13} color="#3B82F6" />
                      Alamat Email
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

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                      <Share2 size={13} color="#E1306C" />
                      Akun Instagram / Sosmed
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#162035',
                        border: '1px solid #1E293B',
                        borderRadius: 8,
                        padding: '0 10px',
                      }}
                    >
                      <span style={{ color: '#E1306C', fontSize: 13, fontWeight: 700, marginRight: 4 }}>@</span>
                      <input
                        type="text"
                        value={instagram.replace(/^@+/, '')}
                        onChange={(e) => setInstagram(e.target.value.replace(/^@+/, ''))}
                        placeholder="username_ig"
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#F8FAFC',
                          fontSize: 13,
                        }}
                      />
                    </div>
                  </div>
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
