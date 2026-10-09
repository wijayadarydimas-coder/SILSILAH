'use client';

import React from 'react';
import { useFamilyStore } from '@/lib/store';
import { getRelativeRelationship } from '@/lib/familyLogic';
import {
  X,
  Sparkles,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Share2,
  ShieldCheck,
  Lock,
  Calendar,
  User,
  Heart,
  Users,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface ProfileDrawerProps {
  personId: string | null;
  onClose: () => void;
  onEdit: (personId: string) => void;
  onAddRelation: (personId: string) => void;
}

export function ProfileDrawer({ personId, onClose, onEdit, onAddRelation }: ProfileDrawerProps) {
  const {
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    setFocusPersonId,
    currentRole,
    deletePerson,
  } = useFamilyStore();

  if (!personId) return null;

  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const isFocus = person.id === focusPersonId;
  const relativeInfo = getRelativeRelationship(
    person.id,
    focusPersonId,
    peopleMap,
    parentChildRelations,
    partnerships
  );

  const isClient = currentRole === 'client';
  const canEdit = currentRole === 'superadmin' || currentRole === 'admin';

  // Parents
  const parents = parentChildRelations
    .filter((r) => r.childPersonId === person.id)
    .map((r) => {
      const pObj = peopleMap.get(r.parentPersonId);
      return { rel: r, person: pObj };
    })
    .filter((item) => item.person !== undefined);

  // Spouses
  const spouses = partnerships
    .filter((p) => p.personAId === person.id || p.personBId === person.id)
    .map((p) => {
      const spouseId = p.personAId === person.id ? p.personBId : p.personAId;
      const spouseObj = peopleMap.get(spouseId);
      return { rel: p, person: spouseObj };
    })
    .filter((item) => item.person !== undefined);

  // Children
  const childrenList = parentChildRelations
    .filter((r) => r.parentPersonId === person.id)
    .map((r) => {
      const cObj = peopleMap.get(r.childPersonId);
      return { rel: r, person: cObj };
    })
    .filter((item) => item.person !== undefined);

  // Siblings
  const parentIds = parents.map((p) => p.person!.id);
  const siblingIds = new Set<string>();
  parentIds.forEach((pid) => {
    parentChildRelations
      .filter((r) => r.parentPersonId === pid && r.childPersonId !== person.id)
      .forEach((r) => siblingIds.add(r.childPersonId));
  });
  const siblings = Array.from(siblingIds)
    .map((sid) => peopleMap.get(sid))
    .filter(Boolean);

  const handleDelete = () => {
    if (!canEdit) return;
    const confirmed = window.confirm(
      `Yakin ingin menghapus ${person.fullName} dari silsilah? Hubungan orang tua dan pasangan yang terkait juga akan dicabut.`
    );
    if (confirmed) {
      deletePerson(person.id);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 450,
        background: '#0F1626',
        borderLeft: '1px solid #1E293B',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1E293B',
          background: '#131B2E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} color="#10B981" />
          <span style={{ fontWeight: 600, fontSize: 15, color: '#F8FAFC' }}>
            Profil Silsilah
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            color: '#94A3B8',
            padding: 6,
            borderRadius: 8,
            transition: 'background 0.2s',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Top Profile Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #162035 0%, #111827 100%)',
            padding: '24px 16px',
            borderRadius: 16,
            border: isFocus ? '1px solid #F59E0B' : '1px solid #1E293B',
            boxShadow: isFocus ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${isFocus ? '#F59E0B' : person.gender === 'male' ? '#3B82F6' : '#EC4899'}`,
              marginBottom: 12,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            {person.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={person.photoUrl}
                alt={person.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1E293B',
                  color: '#94A3B8',
                }}
              >
                <User size={40} />
              </div>
            )}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>
            {person.fullName}
          </h2>
          {person.displayName && (
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
              Dikenal sebagai: &quot;{person.displayName}&quot;
            </p>
          )}

          {/* Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                fontWeight: 600,
                background: isFocus ? '#F59E0B' : 'rgba(16, 185, 129, 0.15)',
                color: isFocus ? '#0F172A' : '#34D399',
                border: isFocus ? 'none' : '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {isFocus ? '⭐ Titik Fokus Aktif' : `Hubungan: ${relativeInfo.label}`}
            </span>

            {person.verificationStatus === 'verified' && (
              <span
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldCheck size={12} />
                Terverifikasi
              </span>
            )}

            {person.isDeceased && (
              <span
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(148, 163, 184, 0.15)',
                  color: '#CBD5E1',
                }}
              >
                🕊️ Almarhum / Almarhumah
              </span>
            )}
          </div>

          {/* Quick Focus Button */}
          {!isFocus && (
            <button
              onClick={() => setFocusPersonId(person.id)}
              style={{
                marginTop: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#0F172A',
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Sparkles size={14} />
              Jadikan Titik Fokus Navigasi
            </button>
          )}
        </div>

        {/* Biography */}
        {person.biography && (
          <div
            style={{
              background: '#131B2E',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #1E293B',
            }}
          >
            <h3 style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              CATATAN BIOGRAFI & SEJARAH
            </h3>
            <p style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.6 }}>
              {person.biography}
            </p>
          </div>
        )}

        {/* Life Dates */}
        <div
          style={{
            background: '#131B2E',
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #1E293B',
          }}
        >
          <h3 style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>
            TANGGAL PENTING
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
              <Calendar size={15} color="#10B981" />
              <span>Lahir: {person.birthDate || 'Tidak tercatat'}</span>
            </div>
            {person.isDeceased && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                <Calendar size={15} color="#F43F5E" />
                <span>Wafat: {person.deathDate || 'Tahun tidak tercatat'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info (with Strict Privacy Protection for Client Role) */}
        <div
          style={{
            background: '#131B2E',
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #1E293B',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h3 style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>
              INFORMASI KONTAK & ALAMAT
            </h3>
            {isClient && (
              <span
                style={{
                  fontSize: 10.5,
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                <Lock size={11} /> Privasi Klien
              </span>
            )}
          </div>

          {isClient ? (
            <div
              style={{
                padding: '16px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 8,
                border: '1px dashed #334155',
                textAlign: 'center',
              }}
            >
              <Lock size={20} color="#F59E0B" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                Sesuai kebijakan privasi PRD (UU PDP), nomor kontak, email, dan alamat hanya dapat
                diakses oleh Admin &amp; Superadmin keluarga.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {person.phone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                  <Phone size={15} color="#10B981" />
                  <span>{person.phone}</span>
                </div>
              ) : (
                <div style={{ color: '#64748B', fontSize: 12 }}>Nomor kontak belum ditambahkan</div>
              )}

              {person.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                  <Mail size={15} color="#3B82F6" />
                  <span>{person.email}</span>
                </div>
              )}

              {person.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#CBD5E1' }}>
                  <MapPin size={15} color="#EC4899" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{person.address}</span>
                </div>
              )}

              {person.instagram && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                  <Share2 size={15} color="#E1306C" />
                  <span>Instagram: {person.instagram}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Immediate Family Relations Section */}
        <div
          style={{
            background: '#131B2E',
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #1E293B',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>
              JARINGAN HUBUNGAN KELUARGA
            </h3>
            {canEdit && (
              <button
                onClick={() => onAddRelation(person.id)}
                style={{
                  fontSize: 11,
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                <PlusCircle size={13} />
                + Tambah Relasi
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Orang Tua */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>
                Orang Tua ({parents.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {parents.length > 0 ? (
                  parents.map(({ rel, person: p }) => (
                    <div
                      key={rel.id}
                      onClick={() => setFocusPersonId(p!.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#162035',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: '#F1F5F9' }}>{p!.fullName}</span>
                      <span style={{ fontSize: 11, color: '#3B82F6', display: 'flex', alignItems: 'center' }}>
                        {rel.parentRole === 'father' ? 'Ayah' : rel.parentRole === 'mother' ? 'Ibu' : 'Orang Tua'}
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>Belum tercatat</span>
                )}
              </div>
            </div>

            {/* Pasangan */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>
                Pasangan ({spouses.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {spouses.length > 0 ? (
                  spouses.map(({ rel, person: p }) => (
                    <div
                      key={rel.id}
                      onClick={() => setFocusPersonId(p!.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#162035',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: '#F1F5F9' }}>{p!.fullName}</span>
                      <span style={{ fontSize: 11, color: '#F43F5E', display: 'flex', alignItems: 'center' }}>
                        {rel.status === 'past' ? 'Mantan' : '💍 Menikah'}
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>Belum tercatat</span>
                )}
              </div>
            </div>

            {/* Saudara */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>
                Saudara ({siblings.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {siblings.length > 0 ? (
                  siblings.map((sib) => (
                    <div
                      key={sib!.id}
                      onClick={() => setFocusPersonId(sib!.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#162035',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: '#F1F5F9' }}>{sib!.fullName}</span>
                      <ChevronRight size={13} color="#94A3B8" />
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>Tidak ada saudara tercatat</span>
                )}
              </div>
            </div>

            {/* Anak */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>
                Anak ({childrenList.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {childrenList.length > 0 ? (
                  childrenList.map(({ rel, person: p }) => (
                    <div
                      key={rel.id}
                      onClick={() => setFocusPersonId(p!.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#162035',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: '#F1F5F9' }}>{p!.fullName}</span>
                      <span style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center' }}>
                        Anak
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>Belum memiliki keturunan</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Action Buttons */}
        {canEdit && (
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              onClick={() => onEdit(person.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                background: '#1E293B',
                color: '#F8FAFC',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #334155',
              }}
            >
              <Edit3 size={15} />
              Edit Data
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <Trash2 size={15} />
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
