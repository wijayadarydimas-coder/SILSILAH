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
  Loader2,
} from 'lucide-react';
import { COUNTRY_CODES, INDONESIAN_CITIES, searchIndonesianLocations, LocationSuggestion } from '@/lib/familyLogic';
import { PhoneCountryInput } from '@/components/PhoneCountryInput';

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
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unconfirmed'>('verified');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(editPersonId);

  // Strict 1-to-1 mapping: find which users are already linked to other people
  const alreadyLinkedUserMap = React.useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((p) => {
      if (p.linkedUserId && p.id !== editPersonId) {
        map.set(p.linkedUserId, p.displayName || p.fullName);
      }
    });
    return map;
  }, [people, editPersonId]);

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

        let initialEmail = p.email || '';
        let initialPhone = rawPhone;
        let initialInstagram = p.instagram || '';
        let initialPhoto = p.photoUrl || '';

        // Auto-fill from linked user if person fields are empty
        if (p.linkedUserId) {
          const matchedUser = users.find((u) => u.id === p.linkedUserId);
          if (matchedUser) {
            if (!initialEmail && matchedUser.email) initialEmail = matchedUser.email;
            if (!initialPhone && matchedUser.phone) {
              initialPhone = matchedUser.phone;
              setPhone(matchedUser.phone);
              setPhoneNumber(matchedUser.phone);
            }
            if (!initialInstagram && matchedUser.username) initialInstagram = `@${matchedUser.username}`;
            if (!initialPhoto && matchedUser.avatarUrl) {
              initialPhoto = matchedUser.avatarUrl;
              setPhotoUrl(matchedUser.avatarUrl);
            }
          }
        }

        setEmail(initialEmail);
        setInstagram(initialInstagram);
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
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      setPhone('');
      setCountryCode('+62');
      setPhoneNumber('');
      setEmail('');
      setInstagram('');
      setVerificationStatus('verified');
    }
    setErrorMsg('');
  }, [editPersonId, isOpen, people, users]);

  const handleSelectLinkedUser = (val: string) => {
    setLinkedUserId(val);
    if (!val) return;
    const selectedUser = users.find((u) => u.id === val);
    if (!selectedUser) return;

    // Automatically fill fields with existing valuable data from the linked account
    if (!email && selectedUser.email) setEmail(selectedUser.email);
    if (!phone && selectedUser.phone) {
      setPhone(selectedUser.phone);
      setPhoneNumber(selectedUser.phone);
    }
    if (!displayName && selectedUser.displayName) setDisplayName(selectedUser.displayName);
    if (!fullName && selectedUser.displayName) setFullName(selectedUser.displayName);
    if (!instagram && selectedUser.username) setInstagram(`@${selectedUser.username}`);
    if (!photoUrl && selectedUser.avatarUrl) {
      setPhotoUrl(selectedUser.avatarUrl);
      setPhotoZoom(1);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
    }
  };

  const handleSyncFromLinkedUser = () => {
    if (!linkedUserId) return;
    const selectedUser = users.find((u) => u.id === linkedUserId);
    if (!selectedUser) return;

    if (selectedUser.email) setEmail(selectedUser.email);
    if (selectedUser.phone) {
      setPhone(selectedUser.phone);
      setPhoneNumber(selectedUser.phone);
    }
    if (selectedUser.displayName && !displayName) {
      setDisplayName(selectedUser.displayName);
    }
    if (selectedUser.username) {
      setInstagram(`@${selectedUser.username}`);
    }
    if (selectedUser.avatarUrl) {
      setPhotoUrl(selectedUser.avatarUrl);
    }
  };

  if (!isOpen) return null;

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (!INDONESIAN_CITIES.includes(val)) {
      setSelectedCity('');
    }

    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingLocation(true);
      setShowLocationDropdown(true);
      locationSearchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchIndonesianLocations(val);
          setLocationSuggestions(results);
        } catch {
          setLocationSuggestions([]);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 250);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (loc: LocationSuggestion) => {
    setAddress(loc.fullText);
    setSelectedCity('');
    setShowLocationDropdown(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file tidak didukung. Harap upload gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto melebihi batas 3 MB.');
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

    // Strict 1-to-1 account link validation
    if (linkedUserId) {
      const alreadyLinked = people.find((p) => p.linkedUserId === linkedUserId && p.id !== editPersonId);
      if (alreadyLinked) {
        setErrorMsg(
          `Akun pengguna ini sudah ditautkan ke anggota keluarga "${alreadyLinked.displayName || alreadyLinked.fullName}". Satu akun hanya boleh ditautkan ke satu anggota.`
        );
        return;
      }
    }

    if (isDeceased && birthDate && deathDate && deathDate < birthDate) {
      setErrorMsg('Tanggal wafat tidak boleh mendahului tanggal lahir.');
      return;
    }

    // Format phone with country code
    const cleanPhone = (phone || phoneNumber).trim();
    let finalPhone: string | undefined = undefined;
    if (cleanPhone) {
      if (cleanPhone.startsWith('+')) {
        finalPhone = cleanPhone;
      } else {
        const noLeadingZero = cleanPhone.replace(/^0+/, '');
        finalPhone = `${countryCode}${noLeadingZero}`;
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
          background: 'var(--bg-elevated, #211D18)',
          border: '1px solid var(--border-subtle, #393128)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(620px, 95vw)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.5))',
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
            borderBottom: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-secondary, #191714)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={20} color="#C6A15B" />
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary, #F1E8D8)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
                margin: 0,
              }}
            >
              {isEditing ? 'Edit Data Anggota Silsilah' : 'Tambah Anggota Baru'}
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
                  background: 'rgba(217, 121, 112, 0.15)',
                  border: '1px solid rgba(217, 121, 112, 0.3)',
                  color: '#D97970',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Nama Lengkap & Panggilan */}
            <div className="grid-2-col-responsive">
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6 }}>
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
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6 }}>
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
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            {/* Gender & Status Verifikasi */}
            <div className="grid-2-col-responsive">
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6 }}>
                  Jenis Kelamin
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
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
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6 }}>
                  Status Verifikasi
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as 'verified' | 'unconfirmed')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 13,
                  }}
                >
                  <option value="verified">✅ Terverifikasi Arsip</option>
                  <option value="unconfirmed">⚠️ Belum Terkonfirmasi</option>
                </select>
              </div>
            </div>

            {/* FOTO & SETTING PAS LINGKARAN */}
            <div style={{ background: 'var(--bg-secondary, #191714)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle, #393128)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)' }}>
                  FOTO PROFIL &amp; PENGATURAN PAS KE LINGKARAN
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(198, 161, 91, 0.15)',
                    color: '#C6A15B',
                    border: '1px solid rgba(198, 161, 91, 0.35)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
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

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* CIRCULAR PREVIEW FRAME */}
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #C6A15B',
                    background: 'var(--bg-primary, #11100E)',
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
                    <User size={34} color="#A79D8D" />
                  )}
                </div>

                {/* SLIDERS & CONTROLS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary, #A79D8D)' }}>
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
                      style={{ width: '100%', accentColor: '#C6A15B' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-secondary, #A79D8D)' }}>
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
                        style={{ width: '100%', accentColor: '#C6A15B' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-secondary, #A79D8D)' }}>
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
                        style={{ width: '100%', accentColor: '#C6A15B' }}
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
                    background: 'var(--bg-elevated, #211D18)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {/* Tanggal Lahir & Wafat */}
            <div style={{ background: 'var(--bg-secondary, #191714)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle, #393128)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#C6A15B" /> TANGGAL KEHIDUPAN
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-primary, #F1E8D8)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                    style={{ accentColor: '#C6A15B' }}
                  />
                  Sudah Meninggal Dunia (Wafat)
                </label>
              </div>

              <div className={isDeceased ? 'grid-2-col-responsive' : ''}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--bg-elevated, #211D18)',
                      border: '1px solid var(--border-subtle, #393128)',
                      color: 'var(--text-primary, #F1E8D8)',
                      fontSize: 13,
                    }}
                  />
                </div>

                {isDeceased && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                      Tanggal Wafat
                    </label>
                    <input
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--bg-elevated, #211D18)',
                        border: '1px solid var(--border-subtle, #393128)',
                        color: 'var(--text-primary, #F1E8D8)',
                        fontSize: 13,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Biografi */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #A79D8D)', marginBottom: 6 }}>
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
                  background: 'var(--bg-secondary, #191714)',
                  border: '1px solid var(--border-subtle, #393128)',
                  color: 'var(--text-primary, #F1E8D8)',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Kontak, Domisili & Tautan Akun Pengguna */}
            <div style={{ background: 'var(--bg-secondary, #191714)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle, #393128)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #F1E8D8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link size={14} color="#C6A15B" />
                  TAUTKAN AKUN USER &amp; KONTAK
                </span>
                {linkedUserId && (
                  <button
                    type="button"
                    onClick={handleSyncFromLinkedUser}
                    style={{
                      background: 'rgba(198, 161, 91, 0.12)',
                      border: '1px solid rgba(198, 161, 91, 0.35)',
                      color: 'var(--antique-gold, #C6A15B)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Salin ulang email, telepon/WhatsApp, dan foto dari akun pengguna tertaut"
                  >
                    ⚡ Salin Data dari Akun
                  </button>
                )}
              </div>

              {/* Pilihan Akun Pengguna Terdaftar */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 5 }}>
                  Akun Pengguna Terdaftar (Opsional)
                </label>
                <select
                  value={linkedUserId}
                  onChange={(e) => handleSelectLinkedUser(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-elevated, #211D18)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Tidak Ditautkan (Hanya Entitas Silsilah Keluarga) --</option>
                  {users.map((u) => {
                    const linkedPersonName = alreadyLinkedUserMap.get(u.id);
                    const isAlreadyLinkedOther = Boolean(linkedPersonName && linkedUserId !== u.id);
                    return (
                      <option
                        key={u.id}
                        value={u.id}
                        disabled={isAlreadyLinkedOther}
                      >
                        @{u.username} — {u.displayName} ({u.role.toUpperCase()}) {u.email ? `• ${u.email}` : ''}
                        {isAlreadyLinkedOther ? ` [Sudah Ditautkan: ${linkedPersonName}]` : ''}
                      </option>
                    );
                  })}
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-muted, #787267)' }}>
                  Menautkan akun otomatis mengisi email, WhatsApp, dan sosmed ke kartu anggota tanpa perlu mengetik ulang manual.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Domisili / Alamat dengan Rekomendasi Hierarki Otomatis */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                    <MapPin size={13} color="#C6A15B" />
                    Domisili / Alamat
                    {isSearchingLocation && <Loader2 size={12} className="animate-spin" color="#C6A15B" />}
                  </label>
                  <div className="grid-2-col-responsive">
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCity(val);
                        if (val) {
                          setAddress(val);
                          setShowLocationDropdown(false);
                        }
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-elevated, #211D18)',
                        border: '1px solid var(--border-subtle, #393128)',
                        color: 'var(--text-primary, #F1E8D8)',
                        fontSize: 12.5,
                      }}
                    >
                      <option value="">-- Pilih Kota / Provinsi Cepat --</option>
                      {INDONESIAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => {
                          if (locationSuggestions.length > 0) setShowLocationDropdown(true);
                        }}
                        placeholder="Ketik desa/kelurahan, kec, kota..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-elevated, #211D18)',
                          border: '1px solid var(--border-subtle, #393128)',
                          color: 'var(--text-primary, #F1E8D8)',
                          fontSize: 12.5,
                        }}
                      />

                      {/* Dropdown Rekomendasi Lokasi Hierarki */}
                      {showLocationDropdown && locationSuggestions.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-elevated, #211D18)',
                            border: '1px solid var(--border-subtle, #393128)',
                            borderRadius: 8,
                            boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                            zIndex: 60,
                            marginTop: 4,
                            maxHeight: 220,
                            overflowY: 'auto',
                          }}
                        >
                          {locationSuggestions.map((loc, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectLocation(loc)}
                              style={{
                                padding: '8px 12px',
                                borderBottom: idx < locationSuggestions.length - 1 ? '1px solid var(--border-subtle, #393128)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#2B251E')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <MapPin size={13} color="#C6A15B" style={{ marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary, #F1E8D8)' }}>
                                  {loc.title}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary, #A79D8D)', marginTop: 1 }}>
                                  {loc.subtitle}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp dengan Pilihan Kode Negara Terpadu */}
                <div>
                  <PhoneCountryInput
                    label="Nomor WhatsApp / Telepon"
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      setPhoneNumber(val);
                    }}
                    placeholder="8123456789"
                    showWhatsAppPreview={true}
                  />
                </div>

                {/* Email & Instagram */}
                <div className="grid-2-col-responsive">
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                      <Mail size={13} color="#C6A15B" />
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
                        background: 'var(--bg-elevated, #211D18)',
                        border: '1px solid var(--border-subtle, #393128)',
                        color: 'var(--text-primary, #F1E8D8)',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary, #A79D8D)', marginBottom: 4 }}>
                      <Share2 size={13} color="#C6A15B" />
                      Akun Instagram / Sosmed
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--bg-elevated, #211D18)',
                        border: '1px solid var(--border-subtle, #393128)',
                        borderRadius: 8,
                        padding: '0 10px',
                      }}
                    >
                      <span style={{ color: '#C6A15B', fontSize: 13, fontWeight: 700, marginRight: 4 }}>@</span>
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
                          color: 'var(--text-primary, #F1E8D8)',
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
              borderTop: '1px solid var(--border-subtle, #393128)',
              background: 'var(--bg-secondary, #191714)',
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
                background: '#2B251E',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--text-primary, #F1E8D8)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
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
