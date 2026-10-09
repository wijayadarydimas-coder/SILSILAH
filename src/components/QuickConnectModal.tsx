'use client';

import React from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, GitMerge, Heart, User, Check, AlertTriangle } from 'lucide-react';

interface QuickConnectModalProps {
  isOpen: boolean;
  sourcePersonId: string | null;
  targetPersonId: string | null;
  onClose: () => void;
}

export function QuickConnectModal({
  isOpen,
  sourcePersonId,
  targetPersonId,
  onClose,
}: QuickConnectModalProps) {
  const { people, addParentChild, addPartnership } = useFamilyStore();
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  if (!isOpen || !sourcePersonId || !targetPersonId) return null;

  const source = people.find((p) => p.id === sourcePersonId);
  const target = people.find((p) => p.id === targetPersonId);

  if (!source || !target) return null;

  const handleConnectAsFather = async () => {
    setErrorMsg('');
    const res = await addParentChild({
      parentPersonId: source.id,
      childPersonId: target.id,
      parentRole: 'father',
      parentageType: 'biological',
      verifiedStatus: 'verified',
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghubungkan relasi.');
    } else {
      setSuccessMsg(`Berhasil: ${source.fullName} dijadikan Ayah dari ${target.fullName}!`);
      setTimeout(onClose, 1000);
    }
  };

  const handleConnectAsMother = async () => {
    setErrorMsg('');
    const res = await addParentChild({
      parentPersonId: source.id,
      childPersonId: target.id,
      parentRole: 'mother',
      parentageType: 'biological',
      verifiedStatus: 'verified',
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghubungkan relasi.');
    } else {
      setSuccessMsg(`Berhasil: ${source.fullName} dijadikan Ibu dari ${target.fullName}!`);
      setTimeout(onClose, 1000);
    }
  };

  const handleConnectAsChild = async () => {
    setErrorMsg('');
    const res = await addParentChild({
      parentPersonId: target.id,
      childPersonId: source.id,
      parentRole: target.gender === 'female' ? 'mother' : 'father',
      parentageType: 'biological',
      verifiedStatus: 'verified',
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghubungkan relasi.');
    } else {
      setSuccessMsg(`Berhasil: ${source.fullName} dijadikan Anak dari ${target.fullName}!`);
      setTimeout(onClose, 1000);
    }
  };

  const handleConnectAsSpouse = async () => {
    setErrorMsg('');
    const res = await addPartnership({
      personAId: source.id,
      personBId: target.id,
      relationshipType: 'married',
      status: 'current',
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghubungkan pasangan.');
    } else {
      setSuccessMsg(`Berhasil: ${source.fullName} dan ${target.fullName} dihubungkan sebagai Pasangan!`);
      setTimeout(onClose, 1000);
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
        zIndex: 1300,
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
          maxWidth: 500,
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
            <GitMerge size={20} color="#10B981" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
              Pilih Jenis Relasi Silsilah
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
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
              <AlertTriangle size={16} />
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
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div
            style={{
              padding: '12px 14px',
              background: '#162035',
              borderRadius: 10,
              border: '1px solid #1E293B',
              textAlign: 'center',
              fontSize: 13,
            }}
          >
            Menghubungkan <b style={{ color: '#10B981' }}>{source.fullName}</b> dengan{' '}
            <b style={{ color: '#3B82F6' }}>{target.fullName}</b>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Opsi 1: Ayah */}
            <button
              onClick={handleConnectAsFather}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#162035',
                border: '1px solid #1E293B',
                borderRadius: 10,
                color: '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 24 }}>👨‍👦</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Sebagai Ayah</span>
              <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{source.displayName || source.fullName} adalah Ayah</span>
            </button>

            {/* Opsi 2: Ibu */}
            <button
              onClick={handleConnectAsMother}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#162035',
                border: '1px solid #1E293B',
                borderRadius: 10,
                color: '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 24 }}>👩‍👧</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Sebagai Ibu</span>
              <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{source.displayName || source.fullName} adalah Ibu</span>
            </button>

            {/* Opsi 3: Anak */}
            <button
              onClick={handleConnectAsChild}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#162035',
                border: '1px solid #1E293B',
                borderRadius: 10,
                color: '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 24 }}>👶</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Sebagai Anak</span>
              <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{source.displayName || source.fullName} adalah Anak</span>
            </button>

            {/* Opsi 4: Pasangan */}
            <button
              onClick={handleConnectAsSpouse}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#162035',
                border: '1px solid #1E293B',
                borderRadius: 10,
                color: '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 24 }}>💍</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Sebagai Pasangan</span>
              <span style={{ fontSize: 10.5, color: '#FDA4AF' }}>Suami / Istri (Menikah)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
