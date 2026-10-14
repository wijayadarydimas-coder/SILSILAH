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
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="show-on-mobile"
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 38,
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          display: 'flex',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% + 32px))',
        }}
      >
        {/* Main Panel Content */}
        <aside
          style={{
            width: 'min(310px, calc(100vw - 44px))',
            height: '100%',
            background: 'var(--bg-secondary, #191714)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid var(--border-subtle, #393128)',
            boxShadow: '10px 0 30px rgba(0, 0, 0, 0.75)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-card, #211D18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="var(--antique-gold, #C6A15B)" />
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: 'var(--ivory, #F1E8D8)', letterSpacing: '0.01em' }}>
              Daftar Trah Keluarga
            </h2>
          </div>
          <span
            style={{
              fontSize: 11,
              background: 'rgba(198, 161, 91, 0.15)',
              color: 'var(--antique-gold, #C6A15B)',
              border: '1px solid rgba(198, 161, 91, 0.3)',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {people.length}
          </span>
        </div>

        {/* Tab Filters & Search */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle, #393128)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', background: 'var(--bg-card, #211D18)', padding: 2, borderRadius: 8, border: '1px solid var(--border-subtle, #393128)' }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                flex: 1,
                padding: '5px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                background: filterMode === 'all' ? 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)' : 'transparent',
                color: filterMode === 'all' ? '#11100E' : 'var(--text-muted, #A79D8D)',
                border: 'none',
                cursor: 'pointer',
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
                background: filterMode === 'clients' ? 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)' : 'transparent',
                color: filterMode === 'clients' ? '#11100E' : 'var(--text-muted, #A79D8D)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Akun Warga
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--antique-gold, #C6A15B)" style={{ position: 'absolute', left: 10, top: 9 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anggota silsilah..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 6,
                background: 'var(--bg-card, #211D18)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--ivory, #F1E8D8)',
                fontSize: 12,
                outline: 'none',
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
              Tambah Anggota Baru
            </button>
          )}
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
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted, #A79D8D)', fontSize: 12 }}>
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
                    background: isFocus ? 'rgba(198, 161, 91, 0.12)' : 'var(--bg-card, #211D18)',
                    border: isFocus ? '1px solid var(--antique-gold, #C6A15B)' : '1px solid var(--border-subtle, #393128)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: canEdit ? 'grab' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFocus) e.currentTarget.style.borderColor = 'var(--antique-gold, #C6A15B)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isFocus) e.currentTarget.style.borderColor = 'var(--border-subtle, #393128)';
                  }}
                >
                  {canEdit && (
                    <span title="Tarik kartu untuk menghubungkan relasi" style={{ color: 'var(--text-muted, #A79D8D)', cursor: 'grab' }}>
                      <GripVertical size={14} />
                    </span>
                  )}

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'var(--bg-elevated, #211D18)',
                      border: `2px solid ${isFocus ? 'var(--antique-gold, #C6A15B)' : person.gender === 'male' ? '#8F6D35' : '#B96F4B'}`,
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #A79D8D)' }}>
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
                          color: isFocus ? 'var(--antique-gold, #C6A15B)' : 'var(--ivory, #F1E8D8)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {person.fullName}
                      </span>
                      {person.verificationStatus === 'verified' && <ShieldCheck size={12} color="var(--success, #7EAA83)" />}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted, #A79D8D)' }}>
                        {calculateAge(person.birthDate, person.deathDate, person.isDeceased).formattedLifeSpan}
                      </span>
                      {linkedUser && (
                        <span
                          title={`Ditautkan ke akun: ${linkedUser.displayName}`}
                          style={{
                            fontSize: 9.5,
                            background: 'rgba(198, 161, 91, 0.15)',
                            color: 'var(--antique-gold, #C6A15B)',
                            border: '1px solid rgba(198, 161, 91, 0.25)',
                            padding: '1px 5px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Link size={9} /> Warga
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
                        background: 'rgba(198, 161, 91, 0.12)',
                        color: 'var(--antique-gold, #C6A15B)',
                        border: '1px solid rgba(198, 161, 91, 0.3)',
                        fontSize: 10.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        cursor: 'pointer',
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

      {/* Toggle Handle Button (Always visible on left edge) */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Tutup Panel Anggota' : 'Buka Panel Daftar Anggota'}
        style={{
          width: isOpen ? 24 : 32,
          height: isOpen ? 60 : 76,
          background: isOpen ? 'var(--bg-secondary, #191714)' : 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
          border: '1px solid var(--border-subtle, #393128)',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: isOpen ? 'var(--antique-gold, #C6A15B)' : '#11100E',
          alignSelf: 'center',
          cursor: 'pointer',
          boxShadow: '4px 0 14px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? (
          <ChevronLeft size={16} />
        ) : (
          <>
            <Users size={15} />
            <ChevronRight size={13} />
          </>
        )}
      </button>
    </div>
  </>
);
}
