'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { ParentageType, ParentRole } from '@/types';
import { X, GitCommit, Heart, Users, Trash2, AlertTriangle, Check } from 'lucide-react';

interface RelationModalProps {
  isOpen: boolean;
  selectedPersonId?: string | null;
  onClose: () => void;
}

export function RelationModal({ isOpen, selectedPersonId, onClose }: RelationModalProps) {
  const {
    people,
    parentChildRelations,
    partnerships,
    addParentChild,
    deleteParentChild,
    addPartnership,
    deletePartnership,
    currentRole,
  } = useFamilyStore();

  const [activeTab, setActiveTab] = useState<'parent_child' | 'partnership'>('parent_child');

  // Parent Child Form
  const [parentId, setParentId] = useState(selectedPersonId || (people[0]?.id || ''));
  const [childId, setChildId] = useState(people[1]?.id || '');
  const [parentRole, setParentRole] = useState<ParentRole>('parent');
  const [parentageType, setParentageType] = useState<ParentageType>('biological');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Partnership Form
  const [partnerAId, setPartnerAId] = useState(selectedPersonId || (people[0]?.id || ''));
  const [partnerBId, setPartnerBId] = useState(people[1]?.id || '');
  const [partnerStatus, setPartnerStatus] = useState<'current' | 'past'>('current');

  if (!isOpen) return null;

  const peopleMap = new Map(people.map((p) => [p.id, p]));

  // Auto assign role based on parent's gender
  const handleParentSelect = (pId: string) => {
    setParentId(pId);
    const p = peopleMap.get(pId);
    if (p) {
      if (p.gender === 'male') setParentRole('father');
      else if (p.gender === 'female') setParentRole('mother');
    }
  };

  const handleAddParentChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parentId === childId) {
      setErrorMsg('Orang tua dan anak tidak boleh merupakan orang yang sama.');
      return;
    }

    const res = await addParentChild({
      parentPersonId: parentId,
      childPersonId: childId,
      parentRole,
      parentageType,
      verifiedStatus: 'verified',
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menambahkan relasi.');
    } else {
      setSuccessMsg('Relasi orang tua - anak berhasil dihubungkan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleAddPartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (partnerAId === partnerBId) {
      setErrorMsg('Kedua pasangan tidak boleh merupakan orang yang sama.');
      return;
    }

    const res = await addPartnership({
      personAId: partnerAId,
      personBId: partnerBId,
      relationshipType: 'married',
      status: partnerStatus,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menambahkan relasi pasangan.');
    } else {
      setSuccessMsg('Relasi pasangan berhasil dihubungkan!');
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
            <GitCommit size={20} color="#10B981" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              Kelola Hubungan Silsilah Keluarga
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1E293B',
            background: '#111827',
          }}
        >
          <button
            onClick={() => {
              setActiveTab('parent_child');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'parent_child' ? '#10B981' : '#94A3B8',
              borderBottom: activeTab === 'parent_child' ? '2px solid #10B981' : 'none',
              background: activeTab === 'parent_child' ? 'rgba(16, 185, 129, 0.05)' : 'none',
            }}
          >
            <Users size={16} />
            Orang Tua – Anak
          </button>
          <button
            onClick={() => {
              setActiveTab('partnership');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'partnership' ? '#F43F5E' : '#94A3B8',
              borderBottom: activeTab === 'partnership' ? '2px solid #F43F5E' : 'none',
              background: activeTab === 'partnership' ? 'rgba(244, 63, 94, 0.05)' : 'none',
            }}
          >
            <Heart size={16} />
            Pasangan / Menikah
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <Check size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PARENT-CHILD FORM */}
          {activeTab === 'parent_child' && (
            <form onSubmit={handleAddParentChild} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Pilih Orang Tua (Ayah / Ibu)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => handleParentSelect(e.target.value)}
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
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.displayName || p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Pilih Anak
                </label>
                <select
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
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
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.displayName || p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                    Peran Orang Tua
                  </label>
                  <select
                    value={parentRole}
                    onChange={(e) => setParentRole(e.target.value as ParentRole)}
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
                    <option value="father">Ayah</option>
                    <option value="mother">Ibu</option>
                    <option value="parent">Orang Tua (Netral)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                    Jenis Kekerabatan
                  </label>
                  <select
                    value={parentageType}
                    onChange={(e) => setParentageType(e.target.value as ParentageType)}
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
                    <option value="biological">Biologis (Kandung)</option>
                    <option value="adoptive">Adopsi</option>
                    <option value="step">Tiri</option>
                    <option value="guardian">Wali</option>
                    <option value="unknown">Belum Pasti</option>
                  </select>
                </div>
              </div>

              <p style={{ fontSize: 11.5, color: '#94A3B8', fontStyle: 'italic' }}>
                * Sistem secara otomatis mencegah siklus silsilah (seseorang tidak dapat menjadi leluhur dari dirinya sendiri).
              </p>

              <button type="submit" className="btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
                + Hubungkan Sebagai Orang Tua &amp; Anak
              </button>
            </form>
          )}

          {/* TAB 2: PARTNERSHIP FORM */}
          {activeTab === 'partnership' && (
            <form onSubmit={handleAddPartnership} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Orang Pertama (Pasangan 1)
                </label>
                <select
                  value={partnerAId}
                  onChange={(e) => setPartnerAId(e.target.value)}
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
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.displayName || p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Orang Kedua (Pasangan 2)
                </label>
                <select
                  value={partnerBId}
                  onChange={(e) => setPartnerBId(e.target.value)}
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
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.displayName || p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                  Status Pernikahan / Kemitraan
                </label>
                <select
                  value={partnerStatus}
                  onChange={(e) => setPartnerStatus(e.target.value as 'current' | 'past')}
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
                  <option value="current">💍 Menikah / Berpasangan (Saat ini)</option>
                  <option value="past">Mantan Pasangan / Cerai</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                  color: 'white',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: '0 2px 10px rgba(244, 63, 94, 0.3)',
                }}
              >
                <Heart size={16} />
                Hubungkan Pasangan
              </button>
            </form>
          )}

          {/* List of existing relations for selected person if present */}
          {selectedPersonId && (
            <div style={{ marginTop: 12, borderTop: '1px solid #1E293B', paddingTop: 16 }}>
              <h3 style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>
                RELASI AKTIF UNTUK &quot;{peopleMap.get(selectedPersonId)?.fullName}&quot;
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {parentChildRelations
                  .filter((r) => r.parentPersonId === selectedPersonId || r.childPersonId === selectedPersonId)
                  .map((r) => {
                    const isParent = r.parentPersonId === selectedPersonId;
                    const otherId = isParent ? r.childPersonId : r.parentPersonId;
                    const other = peopleMap.get(otherId);

                    return (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: '#162035',
                          borderRadius: 8,
                          fontSize: 12.5,
                        }}
                      >
                        <span>
                          {isParent ? `Anak: ${other?.fullName}` : `Orang Tua: ${other?.fullName} (${r.parentRole})`}
                        </span>
                        <button
                          onClick={async () => {
                            await deleteParentChild(r.id);
                          }}
                          title="Hapus relasi ini"
                          style={{ color: '#F87171', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
