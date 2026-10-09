'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { Person } from '@/types';
import { calculateAge } from '@/lib/familyLogic';
import {
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Link,
  ShieldCheck,
  User,
  Sparkles,
  GitMerge,
} from 'lucide-react';

interface SidebarMembersProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenAddMember: () => void;
  onSelectPerson: (id: string) => void;
  onRequestConnect: (sourcePersonId: string, targetPersonId?: string) => void;
}

export function SidebarMembers({
  isOpen,
  onToggle,
  onOpenAddMember,
  onSelectPerson,
  onRequestConnect,
}: SidebarMembersProps) {
  const { people, users, focusPersonId, setFocusPersonId, currentRole } = useFamilyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'clients'>('all');

  const canEdit = currentRole === 'superadmin' || currentRole === 'admin';

  const filtered = people.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterMode === 'clients') return Boolean(p.linkedUserId);
    return true;
  });

  const handleDragStart = (e: React.DragEvent, person: Person) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        personId: person.id,
        fullName: person.fullName,
        displayName: person.displayName,
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
        display: 'flex',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      {/* Main Panel Content */}
      <aside
        style={{
          width: 310,
          height: '100%',
          background: 'rgba(15, 22, 38, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid #1E293B',
          boxShadow: '10px 0 30px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #1E293B',
            background: '#131B2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#10B981" />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
              Daftar Anggota Keluarga
            </h2>
          </div>
          <span
            style={{
              fontSize: 11,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {people.length}
          </span>
        </div>

        {/* Tab Filters & Search */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', background: '#162035', padding: 2, borderRadius: 8 }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                flex: 1,
                padding: '5px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                background: filterMode === 'all' ? '#10B981' : 'transparent',
                color: filterMode === 'all' ? 'white' : '#94A3B8',
              }}
            >
              Semua ({people.length})
            </button>
            <button
              onClick={() => setFilterMode('clients')}
              style={{
                flex: 1,
                padding: '5px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                background: filterMode === 'clients' ? '#3B82F6' : 'transparent',
                color: filterMode === 'clients' ? 'white' : '#94A3B8',
              }}
            >
              Akun Klien
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 9 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anggota silsilah..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 6,
                background: '#162035',
                border: '1px solid #1E293B',
                color: '#F8FAFC',
                fontSize: 12,
              }}
            />
          </div>

          {canEdit && (
            <button
              onClick={onOpenAddMember}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, justifyContent: 'center' }}
            >
              <Plus size={14} />
              + Tambah Anggota Baru
            </button>
          )}
        </div>

        {/* Drag Instruction Banner */}
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid #1E293B',
            fontSize: 11,
            color: '#93C5FD',
            lineHeight: 1.4,
          }}
        >
          💡 <b>Drag &amp; Drop:</b> Tarik kartu nama di bawah ke kanvas atau ke anggota lain untuk menghubungkan relasi secara instan!
        </div>

        {/* Member Cards List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: 12 }}>
              {people.length === 0 ? (
                <div>
                  <p style={{ marginBottom: 10 }}>Belum ada anggota silsilah.</p>
                  {canEdit && (
                    <button onClick={onOpenAddMember} className="btn-primary" style={{ fontSize: 12, margin: '0 auto' }}>
                      <Plus size={13} /> Tambah Anggota Pertama
                    </button>
                  )}
                </div>
              ) : (
                'Tidak ada anggota yang cocok dengan pencarian.'
              )}
            </div>
          ) : (
            filtered.map((person) => {
              const isFocus = person.id === focusPersonId;
              const linkedUser = users.find((u) => u.id === person.linkedUserId);

              return (
                <div
                  key={person.id}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, person)}
                  onClick={() => onSelectPerson(person.id)}
                  style={{
                    background: isFocus ? 'rgba(245, 158, 11, 0.1)' : '#162035',
                    border: isFocus ? '1px solid #F59E0B' : '1px solid #1E293B',
                    borderRadius: 10,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: canEdit ? 'grab' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFocus) e.currentTarget.style.borderColor = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    if (!isFocus) e.currentTarget.style.borderColor = '#1E293B';
                  }}
                >
                  {canEdit && (
                    <span title="Tarik kartu untuk menghubungkan relasi" style={{ color: '#64748B', cursor: 'grab' }}>
                      <GripVertical size={14} />
                    </span>
                  )}

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#1E293B',
                      border: `2px solid ${isFocus ? '#F59E0B' : person.gender === 'male' ? '#3B82F6' : '#EC4899'}`,
                      flexShrink: 0,
                    }}
                  >
                    {person.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={person.photoUrl}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `scale(${person.photoZoom || 1}) translate(${person.photoOffsetX || 0}px, ${person.photoOffsetY || 0}px)`,
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                        <User size={16} />
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: isFocus ? '#FDE68A' : '#F8FAFC',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {person.fullName}
                      </span>
                      {person.verificationStatus === 'verified' && <ShieldCheck size={12} color="#10B981" />}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, color: '#94A3B8' }}>
                        {calculateAge(person.birthDate, person.deathDate, person.isDeceased).formattedLifeSpan}
                      </span>
                      {linkedUser && (
                        <span
                          title={`Ditautkan ke akun: ${linkedUser.displayName}`}
                          style={{
                            fontSize: 9.5,
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60A5FA',
                            padding: '1px 5px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Link size={9} /> Klien
                        </span>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestConnect(person.id);
                      }}
                      title="Hubungkan Relasi"
                      style={{
                        padding: '4px 6px',
                        borderRadius: 6,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#34D399',
                        fontSize: 10.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <GitMerge size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Toggle Handle Button */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Tutup Panel Anggota' : 'Buka Panel Anggota & Drag Relasi'}
        style={{
          width: 24,
          height: 60,
          background: '#131B2E',
          border: '1px solid #1E293B',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10B981',
          alignSelf: 'center',
          cursor: 'pointer',
          boxShadow: '4px 0 10px rgba(0,0,0,0.4)',
        }}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
